import { NextResponse } from 'next/server';
import { routeChat } from '@/lib/llm/router';
import {
  getReadyDocument, retrievePages, cacheKey, cacheGet, cachePut,
  ensureConversation, addMessage, logUsage,
} from '@/lib/store/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STUB_USER_ID = Number(process.env.STUB_USER_ID || 1);
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

const SYSTEM = `You are a precise assistant answering questions about a single PDF document.
Use ONLY the provided context excerpts. Cite the page number(s) you used inline like [p.3].
If the answer is not in the context, say you could not find it in the document. Be concise.`;

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const documentId = Number(body.documentId);
  const message = (typeof body.message === 'string' ? body.message : '').trim().slice(0, 2000);
  const conversationId = body.conversationId ? Number(body.conversationId) : null;
  if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });
  if (message.length < 2) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const userId = STUB_USER_ID;
  try {
    const doc = await getReadyDocument(documentId, userId);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (doc.status !== 'ready') return NextResponse.json({ error: 'Document is still processing' }, { status: 409 });

    const key = cacheKey({ documentId, model: 'gemini-2.5-flash', message });
    const cached = await cacheGet(key);
    if (cached) {
      return NextResponse.json({ ok: true, cached: true, answer: cached.text, citations: cached.citedPages, credits: 0, provider: 'cache' });
    }

    const pages = await retrievePages({ documentId, query: message, topK: 5 });
    if (!pages.length) return NextResponse.json({ error: 'No content to search' }, { status: 409 });
    const context = pages.map((p) => `[p.${p.page_number}] ${String(p.text).slice(0, 1500)}`).join('\n\n');
    const sources = pages.map((p) => p.page_number);

    const userMsg = `Context excerpts from "${doc.original_filename}":\n\n${context}\n\n---\nQuestion: ${message}`;
    const result = await routeChat({ system: SYSTEM, messages: [{ role: 'user', content: userMsg }], maxTokens: 700 });

    const citedInAnswer = [...new Set((result.text.match(/\[p\.(\d+)\]/g) || []).map((m) => Number(m.match(/\d+/)[0])))];
    const citations = citedInAnswer.length ? citedInAnswer : sources.slice(0, 3);

    const convId = await ensureConversation({ conversationId, userId, documentId });
    await addMessage({ conversationId: convId, role: 'user', content: message });
    await addMessage({ conversationId: convId, role: 'assistant', content: result.text, citedPages: citations, credits: result.credits, provider: result.provider, model: result.model, inTok: result.inputTokens, outTok: result.outputTokens });
    await logUsage({ userId, conversationId: convId, documentId, task: 'chat', provider: result.provider, model: result.model, inTok: result.inputTokens, outTok: result.outputTokens, costInr: result.costInr, credits: result.credits });
    await cachePut({ key, documentId, model: result.model, text: result.text, citedPages: citations });

    return NextResponse.json({
      ok: true, conversationId: convId, answer: result.text, citations,
      provider: result.provider, model: result.model, credits: result.credits,
      costInr: Number(result.costInr.toFixed(4)), retrievedPages: sources,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error('[chat] failed', e);
    return NextResponse.json({ error: status === 502 ? 'AI providers are unavailable right now.' : 'Chat failed' }, { status });
  }
}
