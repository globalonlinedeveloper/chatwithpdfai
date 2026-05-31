import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Lightweight auth probe for the marketing masthead: always 200 (no console 401
// noise for anonymous visitors), returns only whether a valid session exists.
export async function GET(req) {
  const u = await getCurrentUser(req);
  return NextResponse.json({ authed: !!u });
}
