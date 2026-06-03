import { NextResponse } from 'next/server';
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
    const rows = await query('SELECT payload FROM papers WHERE id = ? AND user_id = ?', [id, u.id]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    let paper = null; try { paper = JSON.parse(rows[0].payload); } catch {}
    return NextResponse.json({ ok: true, paper });
  }
  const rows = await query('SELECT id, title, exam_style, num_questions, created_at FROM papers WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [u.id]);
  return NextResponse.json({ ok: true, papers: rows.map((r) => ({ id: r.id, title: r.title, examStyle: r.exam_style, numQuestions: r.num_questions, createdAt: r.created_at })) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const paper = body.paper;
  if (!paper || !Array.isArray(paper.sections)) return NextResponse.json({ error: 'No paper to save' }, { status: 400 });
  const title = String(paper.title || 'Untitled paper').slice(0, 160);
  const examStyle = String(paper.examStyle || '').slice(0, 80);
  const nQ = paper.sections.reduce((n, s) => n + (Array.isArray(s.questions) ? s.questions.length : 0), 0);
  const payload = JSON.stringify(paper);
  if (payload.length > 2000000) return NextResponse.json({ error: 'Paper too large to save' }, { status: 413 });
  const cnt = await query('SELECT COUNT(*) AS c FROM papers WHERE user_id = ?', [u.id]);
  if (cnt[0] && Number(cnt[0].c) >= 200) return NextResponse.json({ error: 'Library is full (200) — delete some papers first.' }, { status: 409 });
  const r = await query('INSERT INTO papers (user_id, title, exam_style, num_questions, payload) VALUES (?,?,?,?,?)', [u.id, title, examStyle, nQ, payload]);
  return NextResponse.json({ ok: true, id: r.insertId });
}

export async function DELETE(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const r = await query('DELETE FROM papers WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!r || !r.affectedRows) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}


export async function PATCH(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const id = Number(body.id) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const title = String(body.title == null ? '' : body.title).trim().slice(0, 160);
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  const rows = await query('SELECT payload FROM papers WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let payload = rows[0].payload;
  try { const p = JSON.parse(payload); p.title = title; payload = JSON.stringify(p); } catch {}
  await query('UPDATE papers SET title = ?, payload = ? WHERE id = ? AND user_id = ?', [title, payload, id, u.id]);
  return NextResponse.json({ ok: true, title });
}
