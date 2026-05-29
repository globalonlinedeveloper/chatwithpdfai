import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { embed, vectorToSqlText } from '@/lib/llm/embed';

export async function getReadyDocument(documentId, userId) {
  const rows = await query('SELECT id, user_id, original_filename, status, page_count FROM pdf_documents WHERE id = ?', [documentId]);
  const doc = rows[0];
  if (!doc || (userId != null && Number(doc.user_id) !== Number(userId))) return null;
  return doc;
}

// Retrieve the closest pages to the query within ONE document.
// NB: `ORDER BY VEC_DISTANCE_COSINE(...) LIMIT k` triggers MariaDB's HNSW index
// KNN path, which (with a WHERE filter) can return 0 rows. We instead full-scan
// the document's pages computing exact cosine distance, then sort/slice in JS —
// exact, and fine for <=500 pages/doc. The query vector is inlined as a literal
// (digits/.,-[] only -> injection-safe).
export async function retrievePages({ documentId, query: q, topK = 5 }) {
  const { vectors } = await embed(q);
  const lit = vectorToSqlText(vectors[0]);
  const rows = await query(
    `SELECT id, page_number, text, VEC_DISTANCE_COSINE(embedding, VEC_FromText('${lit}')) AS dist
       FROM pdf_pages WHERE document_id = ?`,
    [documentId]
  );
  rows.sort((a, b) => Number(a.dist) - Number(b.dist));
  return rows.slice(0, Number(topK) | 0 || 5);
}

export function cacheKey({ documentId, model, message }) {
  const norm = String(message).trim().toLowerCase().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(`${model}|${documentId}|${norm}`).digest('hex');
}

export async function cacheGet(key) {
  const rows = await query('SELECT response_text, cited_page_ids FROM llm_cache WHERE cache_key = ?', [key]);
  if (!rows[0]) return null;
  await query('UPDATE llm_cache SET hit_count = hit_count + 1, last_hit_at = NOW() WHERE cache_key = ?', [key]);
  let cited = [];
  try { cited = JSON.parse(rows[0].cited_page_ids || '[]'); } catch {}
  return { text: rows[0].response_text, citedPages: cited };
}

export async function cachePut({ key, documentId, model, text, citedPages }) {
  await query(
    `INSERT INTO llm_cache (cache_key, document_id, model, response_text, cited_page_ids, hit_count, last_hit_at)
     VALUES (?, ?, ?, ?, ?, 0, NOW())
     ON DUPLICATE KEY UPDATE response_text = VALUES(response_text), last_hit_at = NOW()`,
    [key, documentId, model, text, JSON.stringify(citedPages || [])]
  );
}

export async function ensureConversation({ conversationId, userId, documentId }) {
  if (conversationId) return conversationId;
  const r = await query('INSERT INTO chat_conversations (user_id, primary_document_id, title) VALUES (?, ?, ?)', [userId, documentId, null]);
  return r.insertId;
}

export async function addMessage({ conversationId, role, content, citedPages = null, credits = 0, provider = null, model = null, inTok = 0, outTok = 0 }) {
  const r = await query(
    `INSERT INTO chat_messages (conversation_id, role, content, cited_page_ids, credits_used, llm_provider, llm_model, input_tokens, output_tokens)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [conversationId, role, content, citedPages ? JSON.stringify(citedPages) : null, credits, provider, model, inTok, outTok]
  );
  return r.insertId;
}

export async function logUsage({ userId, conversationId, documentId, task, provider, model, inTok, outTok, costInr, credits }) {
  await query(
    `INSERT INTO llm_usage (user_id, conversation_id, document_id, task, provider, model, input_tokens, output_tokens, cost_inr, credits_charged)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, conversationId, documentId, task, provider, model, inTok, outTok, costInr, credits]
  );
}

// ---- M4: multi-document support ----
export async function getReadyDocuments(documentIds, userId) {
  if (!documentIds.length) return [];
  const ph = documentIds.map(() => '?').join(',');
  const rows = await query(`SELECT id, user_id, original_filename, status FROM pdf_documents WHERE id IN (${ph})`, documentIds);
  return rows.filter((d) => userId == null || Number(d.user_id) === Number(userId));
}

export async function retrievePagesMulti({ documentIds, query: q, topK = 6 }) {
  const { vectors } = await embed(q);
  const lit = vectorToSqlText(vectors[0]);
  const ph = documentIds.map(() => '?').join(',');
  const rows = await query(
    `SELECT id, document_id, page_number, text, VEC_DISTANCE_COSINE(embedding, VEC_FromText('${lit}')) AS dist
       FROM pdf_pages WHERE document_id IN (${ph})`,
    documentIds
  );
  rows.sort((a, b) => Number(a.dist) - Number(b.dist));
  return rows.slice(0, Number(topK) | 0 || 6);
}
