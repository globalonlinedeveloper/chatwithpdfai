import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SITE_URL = process.env.SITE_URL || 'https://chatwithpdfai.com';
export async function GET(req) {
  const token = new URL(req.url).searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  try {
    const rows = await query('SELECT id FROM users WHERE verification_token = ? AND (verification_expires_at IS NULL OR verification_expires_at > NOW())', [token]);
    if (!rows[0]) return NextResponse.redirect(SITE_URL + '/signin?verify=invalid', 302);
    await query('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?', [rows[0].id]);
    return NextResponse.redirect(SITE_URL + '/account?verified=1', 302);
  } catch (e) { console.error('[verify] failed', e); return NextResponse.json({ error: 'Verification failed' }, { status: 500 }); }
}
