// =================================================================
// GET /api/documents
// Lists the current (stub) user's documents — backs the library view and
// the upload test harness. Gated behind the PRODUCT_MVP feature flag.
// =================================================================

import { NextResponse } from 'next/server';
import { documents } from '@/lib/store/documents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STUB_USER_ID = Number(process.env.STUB_USER_ID || 1);

function flagOn() {
  return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1';
}

export async function GET() {
  if (!flagOn()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const rows = await documents.listDocuments(STUB_USER_ID);
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
