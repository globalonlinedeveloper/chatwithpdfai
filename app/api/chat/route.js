import { NextResponse } from 'next/server';
import { routeChat } from '@/lib/llm/router';
import { getReadyDocuments, retrievePagesMulti, cacheKey, cacheGet, cachePut, ensureConversation, addMessage, logUsage } from '@/lib/store/chat';
import { getCurrentUser } from '@/lib/auth';
import { getBalance, chargeCredits, creditsEnforced } from '@/lib/credits';
import { rateLimit } from '@/lib/ratelimit';
import { getClientIp } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_DOCS = 5;
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

const SYSTEM = `You are a precise assistant answering questions about the user's PDF document(s).
Use ONLY the provided context excerpts. Cite the page number(s) you used inline like [p.3].
If the answer is not in the context, say you could not find it in the document(s). Be concise.`;

function normalizeIds(body) {
  let ids = Array.isArray(body.documentIds) ? body.documentIds : (body.documentId != null ? [body.documentId] : []);
  return [...new Set(ids.map(Number).filter((n) => n > 0))].slice(0, MAX_DOCS);
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await rateLimit({ bucket: 'chat', ip: getClientIp(req), max: 40, windowMin: 1 }))) return NextResponse.json({ error: 'Too many requests. Please slow down a moment.' }, { status: 429 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const ids = normalizeIds(body);
  const message = (typeof body.message === 'string' ? body.message : '').trim().slice(0, 2000);
  const conversationId = body.conversationId ? Number(body.conversationId) : null;
  if (!ids.length) return NextResponse.json({ error: 'documentId(s) required' }, { status: 400 });
  if (message.length < 2) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const _u = await getCurrentUser(req);
  if (!_u) return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
  if (!_u.email_verified) return NextResponse.json({ error: 'Please verify your email before using the product' }, { status: 403 });
  const userId = _u.id;
  if (creditsEnforced()) { const _bal = await getBalance(userId); if (_bal < 1) return NextResponse.json({ error: 'Insufficient credits — buy a pack to continue.' }, { status: 402 }); }
  try {
    const docs = await getReadyDocuments(ids, userId);
    if (docs.length !== ids.length) return NextResponse.json({ error: 'One or more documents not found' }, { status: 404 });
    if (docs.some((d) => d.status !== 'ready')) return NextResponse.json({ error: 'A document is still processing' }, { status: 409 });
    const nameById = Object.fromEntries(docs.map((d) => [d.id, d.original_filename]));

    const key = cacheKey({ documentId: ids.slice().sort((a, b) => a - b).join(','), model: 'gemini-2.5-flash', message });
    const cached = await cacheGet(key);
    if (cached) return NextResponse.json({ ok: true, cached: true, answer: cached.text, citations: cached.citedPages, sources: [], credits: 0, provider: 'cache' });

    const pages = await retrievePagesMulti({ documentIds: ids, query: message, topK: 6 });
    if (!pages.length) return NextResponse.json({ error: 'No content to search' }, { status: 409 });
    const sources = pages.map((p) => ({ documentId: p.document_id, filename: nameById[p.document_id] || ('doc ' + p.document_id), page: p.page_number, dist: Number(Number(p.dist).toFixed(4)) }));
    const context = pages.map((p) => `[${nameById[p.document_id] || ('doc ' + p.document_id)}, p.${p.page_number}]\n${String(p.text).slice(0, 1200)}`).join('\n\n');
    const userMsg = `Context excerpts:\n\n${context}\n\n---\nQuestion: ${message}`;
    const result = await routeChat({ system: SYSTEM, messages: [{ role: 'user', content: userMsg }], maxTokens: 700 });

    const citedPages = [...new Set((result.text.match(/\[p\.(\d+)\]/g) || []).map((m) => Number(m.match(/\d+/)[0])))];
    const citations = citedPages.length ? citedPages : [...new Set(sources.slice(0, 3).map((s) => s.page))];

    const convId = await ensureConversation({ conversationId, userId, documentId: ids[0] });
    await addMessage({ conversationId: convId, role: 'user', content: message });
    await addMessage({ conversationId: convId, role: 'assistant', content: result.text, citedPages: citations, credits: result.credits, provider: result.provider, model: result.model, inTok: result.inputTokens, outTok: result.outputTokens });
    await logUsage({ userId, conversationId: convId, documentId: ids[0], task: 'chat', provider: result.provider, model: result.model, inTok: result.inputTokens, outTok: result.outputTokens, costInr: result.costInr, credits: result.credits });
    await cachePut({ key, documentId: ids[0], model: result.model, text: result.text, citedPages: citations });
    if (creditsEnforced()) await chargeCredits(userId, result.credits, 'chat', 'chat_message', null);

    return NextResponse.json({ ok: true, conversationId: convId, answer: result.text, citations, sources, provider: result.provider, model: result.model, credits: result.credits, costInr: Number(result.costInr.toFixed(4)), documents: ids });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('[chat] failed', e);
    return NextResponse.json({ error: status === 502 ? 'AI providers are unavailable right now.' : 'Chat failed' }, { status });
  }
}
