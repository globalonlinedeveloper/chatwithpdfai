import { NextResponse } from 'next/server';
import { routeChat } from '@/lib/llm/router';
import { getCurrentUser } from '@/lib/auth';
import { getBalance, chargeCredits, creditsEnforced } from '@/lib/credits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

const TYPE_SCHEMA = {
  mcq: 'mcq (single correct): {"type":"mcq","q":"...","options":["o1","o2","o3","o4"],"answer":<index 0-3>,"explanation":"..."}',
  multi: 'multi (one or more correct): {"type":"multi","q":"...","options":["o1","o2","o3","o4"],"answers":[<indices>],"explanation":"..."}',
  tf: 'tf (true/false): {"type":"tf","q":"<statement>","answer":true|false,"explanation":"..."}',
  fill: 'fill (use ___ for the blank): {"type":"fill","q":"... ___ ...","answer":"<word or phrase>","explanation":"..."}',
  match: 'match: {"type":"match","q":"Match the following","pairs":[{"l":"left item","r":"its correct match"}, (3-5 pairs)],"explanation":"..."}',
  assertion: 'assertion (assertion-reason): {"type":"assertion","assertion":"...","reason":"...","options":["Both A and R are true and R explains A","Both A and R are true but R does not explain A","A is true but R is false","A is false but R is true"],"answer":<0-3>,"explanation":"..."}',
  numeric: 'numeric: {"type":"numeric","q":"...","answer":<number>,"unit":"<optional unit>","explanation":"..."}',
  short: 'short (2-3 line answer): {"type":"short","q":"...","modelAnswer":"<concise model answer>"}',
  long: 'long (essay / detailed): {"type":"long","q":"...","modelAnswer":"<key points the answer should cover>"}',
  code: 'code (programming, output or bug): {"type":"code","q":"What is the output?\\n<code>","options":["o1","o2","o3","o4"],"answer":<0-3>,"explanation":"..."}',
};
const ALL_TYPES = Object.keys(TYPE_SCHEMA);
const DIFF = { easy: 'easy (recall/recognition)', medium: 'medium (application)', hard: 'hard (analysis/evaluation)', mixed: 'a balanced mix of easy, medium and hard' };

function buildSystem({ types, difficulty, level, language, examStyle }) {
  const schemas = types.map((t) => '- ' + TYPE_SCHEMA[t]).join('\n');
  const langInstr = language === 'ta-en'
    ? 'Write each question and option in Tamil first, then its English translation on the next line in parentheses. Keep explanations in English.'
    : 'Write everything in clear English.';
  return `You are an expert exam question-paper setter${examStyle ? ' preparing a ' + examStyle + '-style paper' : ''}.
${langInstr}
Difficulty: ${DIFF[difficulty] || DIFF.mixed}.${level ? ' Target audience level: ' + level + '.' : ''}
Use only these question types, mixing them sensibly across the paper:
${schemas}

Hard rules:
- Every fact, date, name and code behaviour must be accurate. Never invent. If unsure, choose content you are certain about.
- For mcq/code/assertion, exactly one correct option; distractors must be plausible (reflect common misconceptions), never filler.
- Vary sub-topics and difficulty; no duplicate or near-duplicate questions.
- Each question object MUST include a "type" from the list above and follow that exact shape.
- Output ONLY valid minified JSON, no markdown, no commentary:
{"title":"<short paper title>","questions":[ <question objects in the order they should appear> ]}`;
}

function extractJson(text) {
  let t = String(text || '').trim().replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

function clampIdx(n, len) { n = Number(n); return Number.isInteger(n) && n >= 0 && n < len ? n : 0; }
function str(x, n) { return String(x == null ? '' : x).slice(0, n); }

function sanitize(q) {
  if (!q || typeof q !== 'object') return null;
  const type = ALL_TYPES.includes(q.type) ? q.type : 'mcq';
  const base = { type, q: str(q.q, 1200), explanation: str(q.explanation, 500) };
  if (type === 'mcq' || type === 'code') {
    const options = Array.isArray(q.options) ? q.options.slice(0, 6).map((o) => str(o, 400)) : [];
    if (options.length < 2) return null;
    return { ...base, options, answer: clampIdx(q.answer, options.length) };
  }
  if (type === 'multi') {
    const options = Array.isArray(q.options) ? q.options.slice(0, 6).map((o) => str(o, 400)) : [];
    if (options.length < 2) return null;
    let answers = Array.isArray(q.answers) ? q.answers.map(Number).filter((n) => n >= 0 && n < options.length) : [];
    if (!answers.length) answers = [0];
    return { ...base, options, answers: [...new Set(answers)] };
  }
  if (type === 'tf') return { ...base, answer: q.answer === true || String(q.answer).toLowerCase() === 'true' };
  if (type === 'fill') return { ...base, answer: str(q.answer, 300) };
  if (type === 'numeric') return { ...base, answer: str(q.answer, 80), unit: str(q.unit, 40) };
  if (type === 'match') {
    const pairs = Array.isArray(q.pairs) ? q.pairs.slice(0, 6).map((p) => ({ l: str(p && p.l, 200), r: str(p && p.r, 200) })).filter((p) => p.l && p.r) : [];
    if (pairs.length < 2) return null;
    return { ...base, pairs };
  }
  if (type === 'assertion') {
    const options = Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4).map((o) => str(o, 300)) : ['Both A and R are true and R explains A', 'Both A and R are true but R does not explain A', 'A is true but R is false', 'A is false but R is true'];
    return { ...base, assertion: str(q.assertion, 500), reason: str(q.reason, 500), options, answer: clampIdx(q.answer, options.length) };
  }
  if (type === 'short' || type === 'long') return { ...base, modelAnswer: str(q.modelAnswer || q.answer, 1500) };
  return base;
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const topic = str(body.topic, 600).trim();
  const examStyle = str(body.examStyle, 80).trim();
  const level = str(body.level, 60).trim();
  const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes(body.difficulty) ? body.difficulty : 'mixed';
  const language = body.language === 'ta-en' ? 'ta-en' : 'en';
  let types = Array.isArray(body.types) ? body.types.filter((t) => ALL_TYPES.includes(t)) : [];
  if (!types.length) types = ['mcq'];
  types = [...new Set(types)];
  let count = Math.max(3, Math.min(30, Number(body.count) || 10));
  if (topic.length < 3) return NextResponse.json({ error: 'Please describe the topic or syllabus.' }, { status: 400 });

  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
  if (!u.email_verified) return NextResponse.json({ error: 'Please verify your email before using the product' }, { status: 403 });
  const userId = u.id;
  if (creditsEnforced()) { const bal = await getBalance(userId); if (bal < 1) return NextResponse.json({ error: 'Insufficient credits — buy a pack to continue.' }, { status: 402 }); }

  try {
    const typeNote = types.length > 1 ? `Mix these question types: ${types.join(', ')}.` : `Use ${types[0]} questions.`;
    const userMsg = `Create a question paper with exactly ${count} questions on this topic/syllabus: ${topic}\n${typeNote}`;
    const result = await routeChat({
      system: buildSystem({ types, difficulty, level, language, examStyle }),
      messages: [{ role: 'user', content: userMsg }],
      maxTokens: Math.min(6000, 320 * count + 700),
      temperature: 0.6,
    });

    let parsed;
    try { parsed = extractJson(result.text); } catch { return NextResponse.json({ error: 'The generator returned an unexpected format — please try again.' }, { status: 502 }); }
    let questions = (Array.isArray(parsed.questions) ? parsed.questions : []).map(sanitize).filter(Boolean).slice(0, count);
    if (!questions.length) return NextResponse.json({ error: 'Could not generate questions — try a clearer topic.' }, { status: 502 });

    let credits = result.credits;
    if (creditsEnforced()) credits = await chargeCredits(userId, result.credits, 'studio_paper', 'studio', null);
    const balance = creditsEnforced() ? await getBalance(userId) : null;

    return NextResponse.json({
      ok: true,
      paper: { title: str(parsed.title || topic, 140), examStyle, language, difficulty, topic, questions },
      credits, balance, provider: result.provider, model: result.model,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('[studio/paper] failed', e);
    return NextResponse.json({ error: status === 502 ? 'AI providers are unavailable right now.' : 'Generation failed' }, { status });
  }
}
