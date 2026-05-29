// =================================================================
// POST /api/contact
// Receives contact form submissions, stores in DB, emails support@.
// =================================================================

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendMail } from '@/lib/email';
import { isEmail, clip, isValidTopic, getClientIp } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email   = clip(body.email,   320);
  const topic   = clip(body.topic,    32);
  const message = clip(body.message, 5000);
  const hp      = clip(body.website,  64);   // honeypot field — should always be empty

  // ---------- validation ----------
  if (hp) {
    // bot caught — pretend success so we don't leak the honeypot
    return NextResponse.json({ ok: true });
  }
  if (!isEmail(email))         return NextResponse.json({ error: 'Invalid email' },        { status: 400 });
  if (!isValidTopic(topic))    return NextResponse.json({ error: 'Invalid topic' },        { status: 400 });
  if (message.length < 5)      return NextResponse.json({ error: 'Message too short' },    { status: 400 });

  const ip        = getClientIp(req);
  const userAgent = clip(req.headers.get('user-agent') || '', 512);
  const referer   = clip(req.headers.get('referer')    || '', 512);

  // ---------- rate limit: max 5 from same IP in 10 minutes ----------
  try {
    if (ip) {
      const recent = await query(
        'SELECT COUNT(*) AS c FROM contact_submissions WHERE ip = ? AND created_at > (NOW() - INTERVAL 10 MINUTE)',
        [ip]
      );
      if (recent?.[0]?.c >= 5) {
        return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
      }
    }
  } catch (e) {
    console.error('[contact] rate-limit query failed', e);
    // fail open — don't block real users on rate-limit infra failure
  }

  // ---------- insert ----------
  let insertId;
  try {
    const result = await query(
      `INSERT INTO contact_submissions (email, topic, message, ip, user_agent, referer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, topic, message, ip, userAgent, referer]
    );
    insertId = result.insertId;
  } catch (e) {
    console.error('[contact] DB insert failed', e);
    return NextResponse.json({ error: 'Could not save your message right now. Please try again.' }, { status: 500 });
  }

  // ---------- notify support@ (best effort — don't fail the request) ----------
  const notifyTo = process.env.CONTACT_NOTIFY_TO || 'support@chatwithpdfai.com';
  try {
    await sendMail({
      to:      notifyTo,
      replyTo: email,
      subject: `[Contact · ${topic}] from ${email}`,
      text:
`New contact form submission #${insertId}

Topic:   ${topic}
From:    ${email}
IP:      ${ip || 'n/a'}
UA:      ${userAgent.slice(0, 200)}

---
${message}
---

View all: phpMyAdmin → contact_submissions
`,
    });
  } catch (e) {
    console.error('[contact] email notify failed (insert still succeeded)', e);
  }

  return NextResponse.json({ ok: true, id: insertId });
}
