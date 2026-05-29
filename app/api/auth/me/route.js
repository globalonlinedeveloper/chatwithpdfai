import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ ok: true, user: { id: u.id, email: u.email, name: u.name, emailVerified: !!u.email_verified } });
}
