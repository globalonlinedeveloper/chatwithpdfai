// =================================================================
// Tiny input validators — no dependency on Zod/Joi.
// =================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(s) {
  return typeof s === 'string' && s.length <= 320 && EMAIL_RE.test(s.trim());
}

export function clip(s, max) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

const VALID_TOPICS = new Set(['Support', 'Sales', 'Privacy', 'Security', 'Press', 'Other']);

export function isValidTopic(s) {
  return typeof s === 'string' && VALID_TOPICS.has(s);
}

export function getClientIp(req) {
  // Hostinger LiteSpeed sets x-forwarded-for
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}
