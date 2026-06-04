import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const rows = await query('SELECT grantee_email, created_at FROM bank_grants WHERE owner_user_id = ? ORDER BY created_at DESC LIMIT 100', [u.id]);
  return NextResponse.json({ ok: true, grantees: rows.map((r) => ({ email: r.grantee_email, createdAt: r.created_at })) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const email = String(body.email == null ? '' : body.email).trim().toLowerCase().slice(0, 320);
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 });
  if (email === String(u.email || '').toLowerCase()) return NextResponse.json({ error: 'That is your own email' }, { status: 400 });
  const cnt = await query('SELECT COUNT(*) AS c FROM bank_grants WHERE owner_user_id = ?', [u.id]);
  if (cnt[0] && Number(cnt[0].c) >= 50) return NextResponse.json({ error: 'You can share with at most 50 colleagues.' }, { status: 409 });
  await query('INSERT IGNORE INTO bank_grants (owner_user_id, grantee_email) VALUES (?, ?)', [u.id, email]);
  return NextResponse.json({ ok: true, email });
}

export async function DELETE(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const email = String(new URL(req.url).searchParams.get('email') || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  await query('DELETE FROM bank_grants WHERE owner_user_id = ? AND grantee_email = ?', [u.id, email]);
  return NextResponse.json({ ok: true });
}
