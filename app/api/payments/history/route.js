import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const rows = await query("SELECT id, amount_inr, credits, razorpay_payment_id, created_at FROM purchases WHERE user_id = ? AND status = 'paid' ORDER BY created_at DESC LIMIT 100", [u.id]);
  return NextResponse.json({ ok: true, items: rows.map((r) => ({ id: r.id, amount: r.amount_inr, credits: r.credits, paymentId: r.razorpay_payment_id, at: r.created_at })) });
}
