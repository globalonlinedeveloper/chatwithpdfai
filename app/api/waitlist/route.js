// =================================================================
// POST /api/waitlist
// Stores an email in the waitlist; idempotent on duplicate.
// =================================================================

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isEmail, clip, getClientIp } from '@/lib/validate';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!(await rateLimit({ bucket: 'waitlist', ip: getClientIp(req), max: 8, windowMin: 60 }))) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email  = clip(body.email,  320);
  const source = clip(body.source,  64);   // free-form: page name, campaign, etc.
  const hp     = clip(body.website, 64);

  if (hp)                return NextResponse.json({ ok: true });   // honeypot
  if (!isEmail(email))   return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  const ip        = getClientIp(req);
  const userAgent = clip(req.headers.get('user-agent') || '', 512);
  const referer   = clip(req.headers.get('referer')    || '', 512);

  try {
    // INSERT IGNORE — duplicates are a no-op, response is still ok:true
    await query(
      `INSERT IGNORE INTO waitlist_signups (email, source, ip, user_agent, referer)
       VALUES (?, ?, ?, ?, ?)`,
      [email, source || null, ip, userAgent, referer]
    );
  } catch (e) {
    console.error('[waitlist] DB insert failed', e);
    return NextResponse.json({ error: 'Could not save your signup right now.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
