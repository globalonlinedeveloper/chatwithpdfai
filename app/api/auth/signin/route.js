import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isEmail, clip } from '@/lib/validate';
import { verifyPassword, createSession, sessionCookie } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const email = clip(body.email, 320).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!isEmail(email) || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  try {
    const rows = await query('SELECT id, email, name, password_hash FROM users WHERE email = ?', [email]);
    const u = rows[0];
    if (!u || !(await verifyPassword(password, u.password_hash))) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    await query('UPDATE users SET last_signin_at = NOW() WHERE id = ?', [u.id]);
    const token = await createSession(u.id, req);
    const res = NextResponse.json({ ok: true, user: { id: u.id, email: u.email, name: u.name } });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch (e) { console.error('[signin] failed', e); return NextResponse.json({ error: 'Sign-in failed' }, { status: 500 }); }
}
