import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { documents } from '@/lib/store/documents';
import { getCurrentUser } from '@/lib/auth';
import { promises as fsp } from 'node:fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

export async function GET(req, { params }) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const id = Number(params?.id);
  if (!(id > 0)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const u = await getCurrentUser(req);
    if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    const doc = await documents.getDocument(id);
    if (!doc || Number(doc.user_id) !== Number(u.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const rows = await query(
      'SELECT page_number, text FROM pdf_pages WHERE document_id = ? ORDER BY page_number ASC, chunk_index ASC',
      [id]
    );
    const pages = rows.map((r) => ({ pageNumber: r.page_number, text: r.text }));
    return NextResponse.json({
      ok: true,
      document: {
        id: doc.id,
        filename: doc.original_filename,
        status: doc.status,
        pageCount: doc.page_count ?? pages.length,
        sizeBytes: doc.file_size_bytes ?? 0,
        createdAt: doc.created_at,
      },
      pages,
    });
  } catch (e) {
    console.error('[documents/:id] failed', e);
    return NextResponse.json({ error: 'Could not load document' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const id = Number(params?.id);
  if (!(id > 0)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const u = await getCurrentUser(req);
    if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    const doc = await documents.getDocument(id);
    if (!doc || Number(doc.user_id) !== Number(u.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await documents.deleteDocument(id);
    if (doc.disk_path) { try { await fsp.unlink(doc.disk_path); } catch (e) { /* file already gone */ } }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[documents/:id DELETE] failed', e);
    return NextResponse.json({ error: 'Could not delete document' }, { status: 500 });
  }
}
