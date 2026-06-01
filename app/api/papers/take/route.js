import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { grade, isAuto, correctText, studentSafe, flatQs } from '@/app/papers/grade';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const token = String(new URL(req.url).searchParams.get('token') || '').replace(/\.html?$/i, '').slice(0, 24);
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const rows = await query('SELECT title, payload, active FROM paper_assignments WHERE token = ?', [token]);
  if (!rows[0] || !rows[0].active) return NextResponse.json({ error: 'This test link is not available' }, { status: 404 });
  let paper; try { paper = JSON.parse(rows[0].payload); } catch { return NextResponse.json({ error: 'Corrupt test' }, { status: 500 }); }
  return NextResponse.json({ ok: true, test: studentSafe(paper) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const token = String(body.token || '').replace(/\.html?$/i, '').slice(0, 24);
  const name = String(body.name || '').slice(0, 120);
  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const rows = await query('SELECT id, payload, active FROM paper_assignments WHERE token = ?', [token]);
  if (!rows[0] || !rows[0].active) return NextResponse.json({ error: 'This test link is not available' }, { status: 404 });
  let paper; try { paper = JSON.parse(rows[0].payload); } catch { return NextResponse.json({ error: 'Corrupt test' }, { status: 500 }); }
  const flat = flatQs(paper);
  let score = 0, total = 0; const results = [];
  flat.forEach((q, gi) => {
    if (isAuto(q)) { total++; const ok = grade(q, answers[gi]) === true; if (ok) score++; results.push({ gi, correct: ok, answer: correctText(q), explanation: q.explanation || '' }); }
    else results.push({ gi, correct: null, answer: correctText(q), explanation: q.explanation || '' });
  });
  try { await query('INSERT INTO paper_attempts (assignment_id, student_name, score, total, answers) VALUES (?,?,?,?,?)', [rows[0].id, name || null, score, total, JSON.stringify(answers).slice(0, 500000)]); } catch (e) {}
  return NextResponse.json({ ok: true, score, total, results });
}
