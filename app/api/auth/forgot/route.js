import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { isEmail, clip, getClientIp } from '@/lib/validate';
import { rateLimit } from '@/lib/ratelimit';
import { sendMail } from '@/lib/email';
import { resetEmailHtml } from '@/lib/emailTemplates';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SITE_URL = process.env.SITE_URL || 'https://chatwithpdfai.com';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await rateLimit({ bucket: 'forgot', ip: getClientIp(req), max: 5, windowMin: 60 }))) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const email = clip(body.email, 320).toLowerCase();
  if (!isEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  try {
    const rows = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows[0]) {
      const token = crypto.randomBytes(32).toString('hex');
      await query('UPDATE users SET password_reset_token = ?, password_reset_expires_at = NOW() + INTERVAL 1 HOUR WHERE id = ?', [token, rows[0].id]);
      sendMail({ to: email, subject: 'Reset your CHATWITHPDFAI password', text: 'Reset your password: ' + SITE_URL + '/reset?token=' + token + '\n\nThis link expires in 1 hour. If you did not request this, ignore this email.', html: resetEmailHtml({ link: SITE_URL + '/reset?token=' + token }) }).catch((e) => console.error('[forgot] email failed', e.message));
    }
    return NextResponse.json({ ok: true }); // always ok — do not leak whether the email exists
  } catch (e) { console.error('[forgot] failed', e); return NextResponse.json({ error: 'Request failed' }, { status: 500 }); }
}
