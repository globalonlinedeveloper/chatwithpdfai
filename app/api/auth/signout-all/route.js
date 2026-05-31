import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, clearCookie } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  await query('DELETE FROM sessions WHERE user_id = ?', [u.id]);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie());
  return res;
}
