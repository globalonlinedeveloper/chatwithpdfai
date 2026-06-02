// =================================================================
// GET /api/documents
// Lists the current (stub) user's documents — backs the library view and
// the upload test harness. Gated behind the PRODUCT_MVP feature flag.
// =================================================================

import { NextResponse } from 'next/server';
import { documents } from '@/lib/store/documents';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STUB_USER_ID = Number(process.env.STUB_USER_ID || 1);

function flagOn() {
  return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1';
}

export async function GET(req) {
  if (!flagOn()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const _u = await getCurrentUser(req);
    if (!_u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    const userId = _u.id;
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 120);
    const lim = parseInt(url.searchParams.get('limit') || '0', 10);
    const limit = Number.isFinite(lim) && lim > 0 ? Math.min(lim, 50) : 0;
    const rows = await documents.listDocuments(userId, { q: q || undefined, limit: limit || undefined });
    const docs = rows.map((r) => ({
      id: r.id,
      filename: r.original_filename,
      status: r.status,
      pageCount: r.page_count ?? 0,
      sizeBytes: r.file_size_bytes ?? 0,
      createdAt: r.created_at,
    }));
    return NextResponse.json({ ok: true, documents: docs });
  } catch (e) {
    console.error('[documents] list failed', e);
    return NextResponse.json({ error: 'Could not list documents' }, { status: 500 });
  }
}
