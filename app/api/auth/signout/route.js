import { NextResponse } from 'next/server';
import { readSessionToken, destroySession, clearCookie } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  try { await destroySession(readSessionToken(req)); } catch {}
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie());
  return res;
}
