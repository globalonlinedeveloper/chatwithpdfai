// =================================================================
// First-party analytics helpers. Privacy-preserving: no cookies, no PII.
// recordEvent never throws — analytics must never break a real request.
// =================================================================
import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { getClientIp } from '@/lib/validate';

const KINDS = new Set(['pageview', 'signup', 'upload', 'purchase', 'paper']);

export function deviceFromUA(ua) {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua || '') ? 'mobile' : 'desktop';
}

// Daily-rotating, non-reversible visitor fingerprint. Raw IP/UA are never stored.
export function visitorHash(ip, ua) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || 'cwpai-analytics-v1';
  return crypto.createHash('sha256').update(`${ip || ''}|${ua || ''}|${day}|${salt}`).digest('hex').slice(0, 16);
}

export async function recordEvent({ kind, req = null, path = null, userId = null }) {
  try {
    if (!KINDS.has(kind)) return;
    const ua = req ? (req.headers.get('user-agent') || '') : '';
    const ip = req ? getClientIp(req) : null;
    await query(
      'INSERT INTO analytics_events (kind, path, referrer_host, utm_source, device, visitor_hash, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [kind, path, null, null, deviceFromUA(ua), visitorHash(ip, ua), userId]
    );
  } catch (e) { /* best-effort: swallow */ }
}
