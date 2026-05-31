import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendMail } from '@/lib/email';
import { verifyEmailHtml } from '@/lib/emailTemplates';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SITE = process.env.SITE_URL || 'https://chatwithpdfai.com';

export async function POST(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (u.email_verified) return NextResponse.json({ ok: true, already: true });
  if (!(await rateLimit({ bucket: 'resend_verify', ip: 'u' + u.id, max: 5, windowMin: 60 }))) return NextResponse.json({ error: 'Too many requests — please wait a bit.' }, { status: 429 });
  const vtoken = crypto.randomBytes(32).toString('hex');
  await query('UPDATE users SET verification_token = ?, verification_expires_at = NOW() + INTERVAL 2 DAY WHERE id = ?', [vtoken, u.id]);
  const link = SITE + '/api/auth/verify?token=' + vtoken;
  sendMail({ to: u.email, subject: 'Verify your CHATWITHPDFAI email', text: 'Verify your email: ' + link, html: verifyEmailHtml({ link, name: u.name }) }).catch((e) => console.error('[resend] mail failed', e.message));
  return NextResponse.json({ ok: true });
}
