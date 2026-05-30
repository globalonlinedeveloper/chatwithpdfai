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
  match: 'match: {"type":"match","q":"Match the following","pairs":[{"l":"left","r":"correct match"}, (3-5 pairs)],"explanation":"..."}',
  assertion: 'assertion: {"type":"assertion","assertion":"...","reason":"...","options":["Both A and R are true and R explains A","Both A and R are true but R does not explain A","A is true but R is false","A is false but R is true"],"answer":<0-3>,"explanation":"..."}',
  numeric: 'numeric: {"type":"numeric","q":"...","answer":<number>,"unit":"<optional>","explanation":"..."}',
  short: 'short: {"type":"short","q":"...","modelAnswer":"<concise model answer>"}',
  long: 'long: {"type":"long","q":"...","modelAnswer":"<key points>"}',
  code: 'code: {"type":"code","q":"What is the output?\\n<code>","options":["o1","o2","o3","o4"],"answer":<0-3>,"explanation":"..."}',
};
const ALL_TYPES = Object.keys(TYPE_SCHEMA);
const DIFF = { easy: 'easy (recall)', medium: 'medium (application)', hard: 'hard (analysis)', mixed: 'a balanced mix of easy, medium and hard' };

function buildSystem({ sections, difficulty, level, language, examStyle }) {
  const used = [...new Set(sections.flatMap((s) => s.types))];
  const schemas = used.map((t) => '- ' + TYPE_SCHEMA[t]).join('\n');
  const blueprint = sections.map((s, i) => `  Section ${i + 1} "${s.title || ('Section ' + (i + 1))}": ${s.count} questions using type(s) ${s.types.join(', ')}.`).join('\n');
  const langInstr = language === 'ta-en'
    ? 'Write each question and option in Tamil first, then its English translation on the next line in parentheses. Keep explanations in English.'
    : 'Write everything in clear English.';
  return `You are an expert exam question-paper setter${examStyle ? ' preparing a ' + examStyle + '-style paper' : ''}.
${langInstr}
Difficulty: ${DIFF[difficulty] || DIFF.mixed}.${level ? ' Target level: ' + level + '.' : ''}
Build a paper with these sections, in order:
${blueprint}

Question type shapes you may use:
${schemas}

Hard rules:
- Every fact, date, name and code behaviour must be accurate. Never invent. If unsure, choose content you are certain about.
- For mcq/code/assertion, exactly one correct option; distractors must be plausible (common misconceptions).
- Vary sub-topics; no duplicate or near-duplicate questions across the whole paper.
- Each question object MUST include a "type" field and follow that type's exact shape.
- Output ONLY valid minified JSON, no markdown, no commentary:
{"title":"<short paper title>","sections":[{"title":"<section title>","questions":[ <question objects> ]}, ...]}`;
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
  const base = { type, q: str(q.q, 1400), explanation: str(q.explanation, 500) };
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

function normalizeSections(body) {
  let sections = Array.isArray(body.sections) ? body.sections : [];
  sections = sections.map((s) => ({
    title: str(s && s.title, 80),
    types: (Array.isArray(s && s.types) ? s.types : ['mcq']).filter((t) => ALL_TYPES.includes(t)),
    count: Math.max(1, Math.min(30, Number(s && s.count) || 5)),
    marks: Math.max(1, Math.min(20, Number(s && s.marks) || 1)),
  })).filter((s) => s.types.length);
  if (!sections.length) {
    let types = (Array.isArray(body.types) ? body.types : ['mcq']).filter((t) => ALL_TYPES.includes(t));
    if (!types.length) types = ['mcq'];
    sections = [{ title: '', types, count: Math.max(3, Math.min(30, Number(body.count) || 10)), marks: 1 }];
  }
  // cap total
  let total = 0; sections = sections.filter((s) => { if (total >= 40) return false; total += s.count; return true; });
  return sections;
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const topic = str(body.topic, 600).trim();
  const examStyle = str(body.examStyle, 80).trim();
  const level = str(body.level, 60).trim();
  const institution = str(body.institution, 100).trim();
  const instructions = str(body.instructions, 400).trim();
  const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes(body.difficulty) ? body.difficulty : 'mixed';
  const language = body.language === 'ta-en' ? 'ta-en' : 'en';
  const sections = normalizeSections(body);
  if (topic.length < 3) return NextResponse.json({ error: 'Please describe the topic or syllabus.' }, { status: 400 });

  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
  if (!u.email_verified) return NextResponse.json({ error: 'Please verify your email before using the product' }, { status: 403 });
  const userId = u.id;
  if (creditsEnforced()) { const bal = await getBalance(userId); if (bal < 1) return NextResponse.json({ error: 'Insufficient credits — buy a pack to continue.' }, { status: 402 }); }

  const totalQ = sections.reduce((n, s) => n + s.count, 0);
  try {
    const userMsg = `Topic / syllabus: ${topic}\nProduce the paper exactly per the section blueprint above.`;
    const result = await routeChat({
      system: buildSystem({ sections, difficulty, level, language, examStyle }),
      messages: [{ role: 'user', content: userMsg }],
      maxTokens: Math.min(7000, 320 * totalQ + 800),
      temperature: 0.6,
    });

    let parsed;
    try { parsed = extractJson(result.text); } catch { return NextResponse.json({ error: 'The generator returned an unexpected format — please try again.' }, { status: 502 }); }

    let outSections = Array.isArray(parsed.sections) ? parsed.sections : [{ title: '', questions: parsed.questions }];
    outSections = outSections.map((s, i) => ({
      title: str(s && s.title, 80) || (sections[i] ? sections[i].title : ''),
      marks: sections[i] ? sections[i].marks : 1,
      questions: (Array.isArray(s && s.questions) ? s.questions : []).map(sanitize).filter(Boolean),
    })).filter((s) => s.questions.length);
    if (!outSections.length) return NextResponse.json({ error: 'Could not generate questions — try a clearer topic.' }, { status: 502 });

    const totalMarks = outSections.reduce((m, s) => m + s.marks * s.questions.length, 0);
    const nQ = outSections.reduce((n, s) => n + s.questions.length, 0);
    const durationMin = Math.max(15, Math.round(nQ * 1.5));

    let credits = result.credits;
    if (creditsEnforced()) credits = await chargeCredits(userId, result.credits, 'studio_paper', 'studio', null);
    const balance = creditsEnforced() ? await getBalance(userId) : null;

    return NextResponse.json({
      ok: true,
      paper: { title: str(parsed.title || topic, 140), examStyle, language, difficulty, institution, instructions, totalMarks, durationMin, sections: outSections },
      credits, balance, provider: result.provider, model: result.model,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('[studio/paper] failed', e);
    return NextResponse.json({ error: status === 502 ? 'AI providers are unavailable right now.' : 'Generation failed' }, { status });
  }
}
