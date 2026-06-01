// POST /api/analytics/collect — public pageview beacon. Anonymous, rate-limited.
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { clip, getClientIp } from '@/lib/validate';
import { rateLimit } from '@/lib/ratelimit';
import { deviceFromUA, visitorHash } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hostOf(u) { try { return new URL(u).hostname.slice(0, 255); } catch { return null; } }

export async function POST(req) {
  const ip = getClientIp(req);
  if (!(await rateLimit({ bucket: 'analytics', ip, max: 240, windowMin: 10 }))) {
    return new NextResponse(null, { status: 204 });
  }
  let body; try { body = await req.json(); } catch { return new NextResponse(null, { status: 204 }); }
  const path = clip(body && body.path, 512) || '/';
  const ref = clip(body && body.ref, 1024);
  const utm = clip(body && body.utm, 128) || null;
  const ua = req.headers.get('user-agent') || '';
  let refHost = ref ? hostOf(ref) : null;
  if (refHost && /(^|\.)chatwithpdfai\.com$/i.test(refHost)) refHost = null; // ignore internal nav
  try {
    await query(
      'INSERT INTO analytics_events (kind, path, referrer_host, utm_source, device, visitor_hash, user_id) VALUES (?, ?, ?, ?, ?, ?, NULL)',
      ['pageview', path, refHost, utm, deviceFromUA(ua), visitorHash(ip, ua)]
    );
  } catch (e) { /* swallow */ }
  return new NextResponse(null, { status: 204 });
}
