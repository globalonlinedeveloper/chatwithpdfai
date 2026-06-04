import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
function str(s, n) { return String(s == null ? '' : s).slice(0, n); }
const ALL_TYPES = ['mcq', 'multi', 'tf', 'fill', 'match', 'assertion', 'numeric', 'short', 'long', 'case', 'code', 'hotspot'];

export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const url = new URL(req.url);
  const id = Number(url.searchParams.get('id')) || 0;
  if (id) {
    const rows = await query('SELECT payload FROM paper_question_bank WHERE id = ? AND (user_id = ? OR user_id IN (SELECT owner_user_id FROM bank_grants WHERE grantee_email = ?))', [id, u.id, String(u.email || '').toLowerCase()]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    let question = null; try { question = JSON.parse(rows[0].payload); } catch {}
    return NextResponse.json({ ok: true, question });
  }
  const q = str(url.searchParams.get('q'), 80).trim();
  const em = String(u.email || '').toLowerCase();
  const rows = q
    ? await query('SELECT b.id, b.type, b.stem, b.topic, b.created_at, (b.user_id = ?) AS mine, ow.name AS owner_name, ow.email AS owner_email FROM paper_question_bank b LEFT JOIN users ow ON ow.id = b.user_id WHERE (b.user_id = ? OR b.user_id IN (SELECT owner_user_id FROM bank_grants WHERE grantee_email = ?)) AND (b.stem LIKE ? OR b.topic LIKE ?) ORDER BY mine DESC, b.created_at DESC LIMIT 300', [u.id, u.id, em, '%' + q + '%', '%' + q + '%'])
    : await query('SELECT b.id, b.type, b.stem, b.topic, b.created_at, (b.user_id = ?) AS mine, ow.name AS owner_name, ow.email AS owner_email FROM paper_question_bank b LEFT JOIN users ow ON ow.id = b.user_id WHERE b.user_id = ? OR b.user_id IN (SELECT owner_user_id FROM bank_grants WHERE grantee_email = ?) ORDER BY mine DESC, b.created_at DESC LIMIT 300', [u.id, u.id, em]);
  return NextResponse.json({ ok: true, items: rows.map((r) => ({ id: r.id, type: r.type, stem: r.stem, topic: r.topic, createdAt: r.created_at, shared: !Number(r.mine), ownerName: Number(r.mine) ? null : (r.owner_name || r.owner_email || 'A colleague') })) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const question = body.question;
  if (!question || typeof question !== 'object' || !ALL_TYPES.includes(question.type)) return NextResponse.json({ error: 'No valid question to save' }, { status: 400 });
  const stem = str(question.q || question.assertion || (question.type === 'match' ? 'Match the following' : ''), 300);
  if (!stem) return NextResponse.json({ error: 'Question has no text' }, { status: 400 });
  const payload = JSON.stringify(question);
  if (payload.length > 100000) return NextResponse.json({ error: 'Question too large' }, { status: 413 });
  const cnt = await query('SELECT COUNT(*) AS c FROM paper_question_bank WHERE user_id = ?', [u.id]);
  if (cnt[0] && Number(cnt[0].c) >= 500) return NextResponse.json({ error: 'Question bank is full (500) — delete some first.' }, { status: 409 });
  const r = await query('INSERT INTO paper_question_bank (user_id, type, stem, topic, payload) VALUES (?,?,?,?,?)', [u.id, question.type, stem, str(body.topic, 160), payload]);
  return NextResponse.json({ ok: true, id: r.insertId });
}

export async function DELETE(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const r = await query('DELETE FROM paper_question_bank WHERE id = ? AND user_id = ?', [id, u.id]);
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
  const stem = str(body.stem, 300).trim();
  if (!stem) return NextResponse.json({ error: 'Question text required' }, { status: 400 });
  const rows = await query('SELECT payload FROM paper_question_bank WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let payload = rows[0].payload;
  try { const q = JSON.parse(payload); if (q && q.type === 'assertion') q.assertion = stem; else if (q) q.q = stem; payload = JSON.stringify(q); } catch {}
  await query('UPDATE paper_question_bank SET stem = ?, payload = ? WHERE id = ? AND user_id = ?', [stem, payload, id, u.id]);
  return NextResponse.json({ ok: true, stem });
}
