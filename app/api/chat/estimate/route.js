import { NextResponse } from 'next/server';
import { getReadyDocuments, retrievePagesMulti } from '@/lib/store/chat';
import { estimateCredits } from '@/lib/llm/router';
import { getCurrentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { getClientIp } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_DOCS = 5;
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
function normalizeIds(body) {
  let ids = Array.isArray(body.documentIds) ? body.documentIds : (body.documentId != null ? [body.documentId] : []);
  return [...new Set(ids.map(Number).filter((n) => n > 0))].slice(0, MAX_DOCS);
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await rateLimit({ bucket: 'chat_estimate', ip: getClientIp(req), max: 60, windowMin: 1 }))) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const ids = normalizeIds(body);
  const message = (typeof body.message === 'string' ? body.message : '').trim().slice(0, 2000);
  if (!ids.length || message.length < 2) return NextResponse.json({ error: 'documentId(s) and message required' }, { status: 400 });
  try {
    const _u = await getCurrentUser(req);
    if (!_u) return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    if (!_u.email_verified) return NextResponse.json({ error: 'Please verify your email before using the product' }, { status: 403 });
    const userId = _u.id;
    const docs = await getReadyDocuments(ids, userId);
    if (docs.length !== ids.length) return NextResponse.json({ error: 'One or more documents not found' }, { status: 404 });
    const pages = await retrievePagesMulti({ documentIds: ids, query: message, topK: 6 });
    const chars = pages.reduce((n, p) => n + Math.min(String(p.text).length, 1200), 0) + message.length + 200;
    const est = estimateCredits({ inputTokens: Math.ceil(chars / 4), outputTokens: 300 });
    return NextResponse.json({ ok: true, estimatedCredits: est.credits, estimatedCostInr: Number(est.costInr.toFixed(4)), model: est.model, retrievedPages: pages.length });
  } catch (e) {
    console.error('[estimate] failed', e);
    return NextResponse.json({ error: 'Estimate failed' }, { status: 500 });
  }
}
