// =================================================================
// Document persistence — abstracts MariaDB behind a small interface so the
// pipeline runs in TEST_MODE (in-memory) without a database. The real DB
// implementation uses lib/db.js. Switch is per-call via TEST_MODE.
//
// When auth lands (M5) the only change is *where* user_id comes from; the
// store API does not change.
// =================================================================

import { query } from '@/lib/db';

export function isTestMode() {
  return process.env.TEST_MODE === '1';
}

// ---------------- in-memory store (TEST_MODE / no DB) ----------------
const mem = { docs: [], pages: [], seq: 1 };

const memStore = {
  async createDocument(d) {
    const row = {
      id: mem.seq++,
      status: d.status || 'uploaded',
      page_count: 0,
      error_message: null,
      created_at: new Date().toISOString(),
      ...d,
    };
    mem.docs.push(row);
    return row.id;
  },
  async updateDocument(id, fields) {
    const row = mem.docs.find((r) => r.id === Number(id));
    if (row) Object.assign(row, fields);
  },
  async insertPages(documentId, pages) {
    for (const p of pages) {
      mem.pages.push({ id: mem.seq++, document_id: Number(documentId), ...p });
    }
  },
  async getDocument(id) {
    return mem.docs.find((r) => r.id === Number(id)) || null;
  },
  async listDocuments(userId, opts = {}) {
    let r = mem.docs.filter((x) => x.user_id === Number(userId));
    if (opts.q) { const ql = String(opts.q).toLowerCase(); r = r.filter((x) => String(x.original_filename || '').toLowerCase().includes(ql)); }
    r = r.sort((a, b) => b.id - a.id);
    if (opts.limit) r = r.slice(0, Number(opts.limit));
    return r.map((x) => ({ ...x }));
  },
  _reset() {
    mem.docs = [];
    mem.pages = [];
    mem.seq = 1;
  },
};

// ---------------- real DB store ----------------
const dbStore = {
  async createDocument(d) {
    const r = await query(
      `INSERT INTO pdf_documents (user_id, original_filename, disk_path, file_size_bytes, status)
       VALUES (?, ?, ?, ?, ?)`,
      [d.user_id, d.original_filename, d.disk_path, d.file_size_bytes || 0, d.status || 'uploaded']
    );
    return r.insertId;
  },
  async updateDocument(id, fields) {
    const cols = [];
    const vals = [];
    for (const [k, v] of Object.entries(fields)) {
      cols.push(`${k} = ?`);
      vals.push(v);
    }
    if (!cols.length) return;
    vals.push(id);
    await query(`UPDATE pdf_documents SET ${cols.join(', ')} WHERE id = ?`, vals);
  },
  async insertPages(documentId, pages) {
    // pages: [{ page_number, chunk_index, text, token_count, source, embeddingText }]
    for (const p of pages) {
      await query(
        `INSERT INTO pdf_pages
           (document_id, page_number, chunk_index, text, token_count, source, embedding)
         VALUES (?, ?, ?, ?, ?, ?, VEC_FromText(?))`,
        [
          documentId,
          p.page_number,
          p.chunk_index || 0,
          p.text,
          p.token_count || 0,
          p.source || 'text',
          p.embeddingText,
        ]
      );
    }
  },
  async getDocument(id) {
    const rows = await query(`SELECT * FROM pdf_documents WHERE id = ?`, [id]);
    return rows[0] || null;
  },
  async listDocuments(userId, opts = {}) {
    let sql = 'SELECT * FROM pdf_documents WHERE user_id = ?'; const args = [userId];
    if (opts.q) { sql += ' AND original_filename LIKE ?'; args.push('%' + String(opts.q) + '%'); }
    sql += ' ORDER BY id DESC';
    if (opts.limit) { sql += ' LIMIT ?'; args.push(Number(opts.limit)); }
    return query(sql, args);
  },
};

function impl() {
  return isTestMode() ? memStore : dbStore;
}

export const documents = {
  createDocument: (d) => impl().createDocument(d),
  updateDocument: (id, fields) => impl().updateDocument(id, fields),
  insertPages: (id, pages) => impl().insertPages(id, pages),
  getDocument: (id) => impl().getDocument(id),
  listDocuments: (userId, opts = {}) => impl().listDocuments(userId, opts),
  // test helper only
  _reset: () => memStore._reset(),
};
