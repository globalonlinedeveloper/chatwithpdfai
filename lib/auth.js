// =================================================================
// Auth: bcrypt password hashing + DB-backed sessions (cookie).
// Uses the users/sessions tables from migration 002.
// =================================================================
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { getClientIp } from '@/lib/validate';

export const SESSION_COOKIE = 'cwpai_session';
const SESSION_DAYS = 30;

export async function hashPassword(pw) { return bcrypt.hash(pw, 10); }
export async function verifyPassword(pw, hash) { return bcrypt.compare(pw, hash); }

export async function createSession(userId, req) {
  const token = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const ip = req ? getClientIp(req) : null;
  const ua = req ? (req.headers.get('user-agent') || '').slice(0, 512) : null;
  await query(
    'INSERT INTO sessions (token, user_id, expires_at, ip, user_agent) VALUES (?, ?, (NOW() + INTERVAL ? DAY), ?, ?)',
    [token, userId, SESSION_DAYS, ip, ua]
  );
  return token;
}

export async function getSessionUser(token) {
  if (!token) return null;
  const rows = await query(
    `SELECT u.id, u.email, u.name, u.email_verified
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > NOW()`,
    [token]
  );
  if (rows[0]) query('UPDATE sessions SET last_used_at = NOW() WHERE token = ?', [token]).catch(() => {});
  return rows[0] || null;
}

export async function destroySession(token) {
  if (token) await query('DELETE FROM sessions WHERE token = ?', [token]);
}

export function readSessionToken(req) {
  return (req.cookies && req.cookies.get && req.cookies.get(SESSION_COOKIE)?.value) || null;
}

export async function getCurrentUser(req) {
  return getSessionUser(readSessionToken(req));
}

export function sessionCookie(token) {
  return {
    name: SESSION_COOKIE, value: token, httpOnly: true,
    secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge: SESSION_DAYS * 86400,
  };
}
export function clearCookie() {
  return { name: SESSION_COOKIE, value: '', httpOnly: true, path: '/', maxAge: 0 };
}
