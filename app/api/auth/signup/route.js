import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { isEmail, clip } from '@/lib/validate';
import { hashPassword, createSession, sessionCookie } from '@/lib/auth';
import { sendMail } from '@/lib/email';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const email = clip(body.email, 320).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const name = clip(body.name, 120) || null;
  if (!isEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  try {
    const ex = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex[0]) return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 });
    const hash = await hashPassword(password);
    const vtoken = crypto.randomBytes(32).toString('hex');
    const r = await query(
      'INSERT INTO users (email, password_hash, name, email_verified, verification_token, verification_expires_at) VALUES (?, ?, ?, 0, ?, NOW() + INTERVAL 2 DAY)',
      [email, hash, name, vtoken]
    );
    const token = await createSession(r.insertId, req);
    const _site = process.env.SITE_URL || 'https://chatwithpdfai.com';
    sendMail({ to: email, subject: 'Verify your CHATWITHPDFAI email', text: 'Welcome! Verify your email: ' + _site + '/api/auth/verify?token=' + vtoken }).catch((e) => console.error('[signup] verify email failed', e.message));
    const res = NextResponse.json({ ok: true, user: { id: r.insertId, email, name } });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch (e) { console.error('[signup] failed', e); return NextResponse.json({ error: 'Could not create account' }, { status: 500 }); }
}
