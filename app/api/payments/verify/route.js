import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { addCredits, getBalance } from '@/lib/credits';
import { sendMail } from '@/lib/email';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const orderId = body.razorpay_order_id, paymentId = body.razorpay_payment_id, signature = body.razorpay_signature;
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
  if (!verifyPaymentSignature({ orderId, paymentId, signature })) return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  try {
    const rows = await query('SELECT id, user_id, credits, amount_inr, status FROM purchases WHERE razorpay_order_id = ?', [orderId]);
    const p = rows[0];
    if (!p || Number(p.user_id) !== Number(u.id)) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    const upd = await query("UPDATE purchases SET status = 'paid', razorpay_payment_id = ? WHERE id = ? AND status <> 'paid'", [paymentId, p.id]);
    let added = 0;
    if (upd.affectedRows === 1) { await addCredits(u.id, p.credits, 'purchase', 'purchase', p.id); added = p.credits; sendMail({ to: u.email, subject: 'Your CHATWITHPDFAI receipt', text: `Receipt — ${p.credits} credits for INR ${p.amount_inr}. Payment ${paymentId}.`, html: `<p>Thanks for your purchase.</p><p style="font-size:16px"><b>${p.credits} credits</b> &mdash; <b>&#8377;${p.amount_inr}</b></p><p style="color:#666;font-size:13px">Payment ID: ${paymentId}<br/>Order ID: ${orderId}</p><p style="color:#888;font-size:12px">CHATWITHPDFAI &middot; credits never expire</p>` }).catch((e) => console.error('[receipt] mail failed', e.message)); }
    const balance = await getBalance(u.id);
    return NextResponse.json({ ok: true, creditsAdded: added, balance });
  } catch (e) { console.error('[pay/verify] failed', e); return NextResponse.json({ error: 'Verification failed' }, { status: 500 }); }
}
