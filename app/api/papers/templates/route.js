import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
function str(v, n) { return String(v == null ? '' : v).slice(0, n); }

export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const rows = await query('SELECT id, name, payload, created_at FROM paper_templates WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [u.id]);
  return NextResponse.json({ ok: true, templates: rows.map((r) => { let config = {}; try { config = JSON.parse(r.payload); } catch (e) {} return { id: r.id, name: r.name, config, createdAt: r.created_at }; }) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const name = str(body && body.name, 120).trim();
  if (!name) return NextResponse.json({ error: 'Template name required' }, { status: 400 });
  const config = body && body.config && typeof body.config === 'object' ? body.config : null;
  if (!config) return NextResponse.json({ error: 'No setup to save' }, { status: 400 });
  const payload = JSON.stringify(config);
  if (payload.length > 200000) return NextResponse.json({ error: 'Template too large' }, { status: 413 });
  const ex = await query('SELECT id FROM paper_templates WHERE user_id = ? AND name = ? LIMIT 1', [u.id, name]);
  if (ex[0]) { await query('UPDATE paper_templates SET payload = ?, created_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [payload, ex[0].id, u.id]); return NextResponse.json({ ok: true, id: ex[0].id }); }
  const cnt = await query('SELECT COUNT(*) AS c FROM paper_templates WHERE user_id = ?', [u.id]);
  if (cnt[0] && Number(cnt[0].c) >= 50) return NextResponse.json({ error: 'You have 50 templates — delete some first.' }, { status: 409 });
  const r = await query('INSERT INTO paper_templates (user_id, name, payload) VALUES (?,?,?)', [u.id, name, payload]);
  return NextResponse.json({ ok: true, id: r.insertId });
}

export async function DELETE(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const r = await query('DELETE FROM paper_templates WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!r || !r.affectedRows) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
