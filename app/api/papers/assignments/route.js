import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (id) {
    const own = await query('SELECT id, title FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
    if (!own[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const att = await query('SELECT id, student_name, score, total, created_at FROM paper_attempts WHERE assignment_id = ? ORDER BY created_at DESC LIMIT 500', [id]);
    return NextResponse.json({ ok: true, assignment: { id: own[0].id, title: own[0].title }, attempts: att.map((a) => ({ id: a.id, name: a.student_name, score: a.score, total: a.total, createdAt: a.created_at })) });
  }
  const rows = await query('SELECT a.id, a.token, a.title, a.num_questions, a.active, a.created_at, COUNT(t.id) AS attempts, COALESCE(ROUND(AVG(CASE WHEN t.total > 0 THEN 100 * t.score / t.total END)), 0) AS avg_pct FROM paper_assignments a LEFT JOIN paper_attempts t ON t.assignment_id = a.id WHERE a.user_id = ? GROUP BY a.id ORDER BY a.created_at DESC LIMIT 100', [u.id]);
  return NextResponse.json({ ok: true, assignments: rows.map((r) => ({ id: r.id, token: r.token, title: r.title, numQuestions: r.num_questions, active: r.active, attempts: Number(r.attempts), avgPct: Number(r.avg_pct), createdAt: r.created_at })) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const paper = body.paper;
  if (!paper || !Array.isArray(paper.sections)) return NextResponse.json({ error: 'No paper to share' }, { status: 400 });
  const title = String(paper.title || 'Test').slice(0, 160);
  const nQ = paper.sections.reduce((n, s) => n + (Array.isArray(s.questions) ? s.questions.length : 0), 0);
  const payload = JSON.stringify(paper);
  if (payload.length > 2000000) return NextResponse.json({ error: 'Paper too large' }, { status: 413 });
  const cnt = await query('SELECT COUNT(*) AS c FROM paper_assignments WHERE user_id = ?', [u.id]);
  if (cnt[0] && Number(cnt[0].c) >= 200) return NextResponse.json({ error: 'Too many shared tests — delete some first.' }, { status: 409 });
  const token = crypto.randomBytes(8).toString('hex');
  await query('INSERT INTO paper_assignments (user_id, token, title, num_questions, payload) VALUES (?,?,?,?,?)', [u.id, token, title, nQ, payload]);
  return NextResponse.json({ ok: true, token });
}

export async function DELETE(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const r = await query('DELETE FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!r || !r.affectedRows) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Pause/resume a shared test without deleting it (and its attempts). The /t/[token]
// take route already returns "not available" when active=0, so this instantly
// enables/disables the public link.
export async function PATCH(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const id = Number(body.id) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const active = body.active ? 1 : 0;
  const own = await query('SELECT id FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!own[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await query('UPDATE paper_assignments SET active = ? WHERE id = ? AND user_id = ?', [active, id, u.id]);
  return NextResponse.json({ ok: true, active });
}
