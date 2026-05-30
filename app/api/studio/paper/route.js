import { NextResponse } from 'next/server';
import { routeChat } from '@/lib/llm/router';
import { getCurrentUser } from '@/lib/auth';
import { getBalance, chargeCredits, creditsEnforced } from '@/lib/credits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

const LANG_INSTR = {
  en: 'Write every question, option and explanation in clear English.',
  'ta-en': 'Write bilingually: give each question and each option in Tamil first, then its English translation on the next line in parentheses. Write the explanation in English.',
};

function buildSystem(language) {
  return `You are an experienced competitive-exam question setter (e.g. TNPSC-style general studies).
${LANG_INSTR[language] || LANG_INSTR.en}
Hard rules:
- Each question has exactly 4 options.
- Exactly one option is correct.
- Every fact must be accurate. Never invent data, dates, or names. If unsure, choose a topic you are certain about.
- Vary the sub-topics and difficulty. No duplicate or trivially easy questions.
- Output ONLY valid minified JSON (no markdown, no prose) in exactly this shape:
{"title":"<short paper title>","questions":[{"q":"<question text>","options":["<opt1>","<opt2>","<opt3>","<opt4>"],"answer":<index 0-3 of the correct option>,"explanation":"<one short line on why it is correct>"}]}`;
}

function extractJson(text) {
  let t = String(text || '').trim();
  t = t.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const topic = (typeof body.topic === 'string' ? body.topic : '').trim().slice(0, 500);
  let count = Number(body.count) || 10;
  count = Math.max(3, Math.min(25, count));
  const language = body.language === 'ta-en' ? 'ta-en' : 'en';
  if (topic.length < 3) return NextResponse.json({ error: 'Please describe the topic or syllabus.' }, { status: 400 });

  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
  if (!u.email_verified) return NextResponse.json({ error: 'Please verify your email before using the product' }, { status: 403 });
  const userId = u.id;
  if (creditsEnforced()) {
    const bal = await getBalance(userId);
    if (bal < 1) return NextResponse.json({ error: 'Insufficient credits — buy a pack to continue.' }, { status: 402 });
  }

  try {
    const userMsg = `Create a mock question paper with exactly ${count} multiple-choice questions on this topic / syllabus: ${topic}`;
    const result = await routeChat({
      system: buildSystem(language),
      messages: [{ role: 'user', content: userMsg }],
      maxTokens: Math.min(4000, 230 * count + 500),
      temperature: 0.5,
    });

    let parsed;
    try { parsed = extractJson(result.text); }
    catch { return NextResponse.json({ error: 'The generator returned an unexpected format — please try again.' }, { status: 502 }); }

    let questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    questions = questions
      .filter((q) => q && typeof q.q === 'string' && Array.isArray(q.options) && q.options.length >= 2)
      .slice(0, count)
      .map((q) => {
        const options = q.options.slice(0, 4).map((o) => String(o).slice(0, 400));
        let answer = Number(q.answer); if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) answer = 0;
        return { q: String(q.q).slice(0, 800), options, answer, explanation: q.explanation ? String(q.explanation).slice(0, 400) : '' };
      });
    if (!questions.length) return NextResponse.json({ error: 'Could not generate questions — try a clearer topic.' }, { status: 502 });

    let credits = result.credits;
    if (creditsEnforced()) credits = await chargeCredits(userId, result.credits, 'studio_paper', 'studio', null);
    const balance = creditsEnforced() ? await getBalance(userId) : null;

    return NextResponse.json({
      ok: true,
      paper: { title: String(parsed.title || topic).slice(0, 120), language, topic, questions },
      credits, balance, provider: result.provider, model: result.model,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('[studio/paper] failed', e);
    return NextResponse.json({ error: status === 502 ? 'AI providers are unavailable right now.' : 'Generation failed' }, { status });
  }
}
