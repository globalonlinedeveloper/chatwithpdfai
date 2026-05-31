import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const current = String(body.current || '');
  const next = String(body.next || '');
  if (next.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  if (!(await rateLimit({ bucket: 'change_pw', ip: 'u' + u.id, max: 10, windowMin: 60 }))) return NextResponse.json({ error: 'Too many attempts — please wait.' }, { status: 429 });
  const rows = await query('SELECT password_hash FROM users WHERE id = ?', [u.id]);
  if (!rows[0]) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  const ok = await verifyPassword(current, rows[0].password_hash);
  if (!ok) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  const hash = await hashPassword(next);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, u.id]);
  return NextResponse.json({ ok: true });
}
