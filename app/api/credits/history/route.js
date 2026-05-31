import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const rows = await query('SELECT delta, reason, ref_type, created_at FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [u.id]);
  return NextResponse.json({ ok: true, items: rows.map((r) => ({ delta: r.delta, reason: r.reason, refType: r.ref_type, at: r.created_at })) });
}
