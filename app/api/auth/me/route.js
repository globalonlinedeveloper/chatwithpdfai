import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ ok: true, user: { id: u.id, email: u.email, name: u.name, emailVerified: !!u.email_verified } });
}
export async function PATCH(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const name = String(body.name == null ? '' : body.name).trim().slice(0, 120);
  await query('UPDATE users SET name = ? WHERE id = ?', [name || null, u.id]);
  return NextResponse.json({ ok: true, user: { id: u.id, email: u.email, name: name || null, emailVerified: !!u.email_verified } });
}
