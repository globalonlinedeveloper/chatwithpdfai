import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { addCredits } from '@/lib/credits';
import { sendMail } from '@/lib/email';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') || '';
  if (!verifyWebhookSignature(raw, sig)) return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  let evt; try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }
  try {
    let orderId = null, paymentId = null;
    if (evt.event === 'payment.captured') { orderId = evt.payload?.payment?.entity?.order_id; paymentId = evt.payload?.payment?.entity?.id; }
    else if (evt.event === 'order.paid') { orderId = evt.payload?.order?.entity?.id; paymentId = evt.payload?.payment?.entity?.id; }
    if (orderId) {
      const rows = await query("SELECT p.id, p.user_id, p.credits, p.amount_inr, p.status, u.email FROM purchases p JOIN users u ON u.id = p.user_id WHERE p.razorpay_order_id = ?", [orderId]);
      const p = rows[0];
      if (p && p.status !== 'paid') {
        const upd = await query("UPDATE purchases SET status = 'paid', razorpay_payment_id = ? WHERE id = ? AND status <> 'paid'", [paymentId || null, p.id]);
        if (upd.affectedRows === 1) { await addCredits(p.user_id, p.credits, 'purchase', 'purchase', p.id); sendMail({ to: p.email, subject: 'Your CHATWITHPDFAI receipt', text: `Receipt - ${p.credits} credits for INR ${p.amount_inr}. Payment ${paymentId}.`, html: `<p>Thanks for your purchase.</p><p style="font-size:16px"><b>${p.credits} credits</b> &mdash; <b>&#8377;${p.amount_inr}</b></p><p style="color:#666;font-size:13px">Payment ID: ${paymentId}</p>` }).catch((e) => console.error('[receipt webhook] mail failed', e.message)); }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) { console.error('[pay/webhook] failed', e); return NextResponse.json({ error: 'processing error' }, { status: 500 }); }
}
