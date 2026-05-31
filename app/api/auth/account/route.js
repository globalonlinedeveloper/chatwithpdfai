import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'node:fs/promises';
import { getCurrentUser, clearCookie } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { body = {}; }
  if (String(body.confirm || '').trim().toLowerCase() !== String(u.email).toLowerCase()) return NextResponse.json({ error: 'Type your email address to confirm.' }, { status: 400 });
  try {
    await query('DELETE FROM chat_conversations WHERE user_id = ?', [u.id]);
    try { const docs = await query('SELECT disk_path FROM pdf_documents WHERE user_id = ?', [u.id]); for (const d of docs) { if (d.disk_path) { try { await fs.unlink(d.disk_path); } catch (e) {} } } } catch (e) {}
    await query('DELETE FROM pdf_documents WHERE user_id = ?', [u.id]);
    await query('DELETE FROM llm_usage WHERE user_id = ?', [u.id]);
    await query('DELETE FROM users WHERE id = ?', [u.id]);
  } catch (e) { console.error('[account delete] failed', e); return NextResponse.json({ error: 'Could not delete account' }, { status: 500 }); }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie());
  return res;
}
