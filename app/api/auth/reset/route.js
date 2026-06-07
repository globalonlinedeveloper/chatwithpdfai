import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { getClientIp } from '@/lib/validate';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await rateLimit({ bucket: 'pwreset', ip: getClientIp(req), max: 10, windowMin: 60 }))) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  try {
    const rows = await query('SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires_at > NOW()', [token]);
    if (!rows[0]) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    const hash = await hashPassword(password);
    await query('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL, failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [hash, rows[0].id]);
    return NextResponse.json({ ok: true });
  } catch (e) { console.error('[reset] failed', e); return NextResponse.json({ error: 'Reset failed' }, { status: 500 }); }
}
