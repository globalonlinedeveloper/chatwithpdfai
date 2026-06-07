import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractPdf } from '@/lib/pdf/extract';
import { embed, vectorToSqlText } from '@/lib/llm/embed';
import { documents } from '@/lib/store/documents';
import { enqueue } from '@/lib/queue';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { recordEvent } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_PAGES = 500;

function flagOn() {
  return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1';
}
function isTestMode() {
  return process.env.TEST_MODE === '1';
}
async function uploadDirFor(userId) {
  if (isTestMode()) return path.join(os.tmpdir(), 'cwpai-test-uploads', String(userId));
  const base = process.env.UPLOAD_DIR || path.join(os.homedir(), 'domains', 'chatwithpdfai.com', 'uploads');
  return path.join(base, String(userId));
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const _u = await getCurrentUser(req);
  if (!_u) return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
  if (!_u.email_verified) return NextResponse.json({ error: 'Please verify your email before using the product' }, { status: 403 });
  const userId = _u.id;

  let form;
  try { form = await req.formData(); }
  catch { return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 }); }

  const file = form.get('file');
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'No file uploaded (field "file")' }, { status: 400 });
  }
  const filename = (file.name || 'document.pdf').slice(0, 500);
  const looksPdf = file.type === 'application/pdf' || /\.pdf$/i.test(filename);
  if (!looksPdf) return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 415 });
  if (typeof file.size === 'number' && file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds the 50 MB limit' }, { status: 413 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  if (buf.length > MAX_BYTES) return NextResponse.json({ error: 'File exceeds the 50 MB limit' }, { status: 413 });
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return NextResponse.json({ error: 'File is not a valid PDF' }, { status: 415 });
  }

  const force = new URL(req.url).searchParams.get('force') === '1';
  if (!force) {
    const dup = await query("SELECT id FROM pdf_documents WHERE user_id = ? AND original_filename = ? AND file_size_bytes = ? AND status IN ('ready','processing') ORDER BY id DESC LIMIT 1", [userId, filename, buf.length]);
    if (dup && dup[0]) return NextResponse.json({ error: 'You already uploaded this file.', duplicate: true, existingId: dup[0].id, filename }, { status: 409 });
  }

  let documentId;
  try {
    const result = await enqueue(async () => {
      const { pageCount, pages } = await extractPdf(buf);
      if (pageCount > MAX_PAGES) {
        const err = new Error(`PDF exceeds the ${MAX_PAGES}-page limit (${pageCount})`);
        err.statusCode = 413;
        throw err;
      }
      const dir = await uploadDirFor(userId);
      await fs.mkdir(dir, { recursive: true });
      const diskPath = path.join(dir, `${randomUUID()}.pdf`);
      await fs.writeFile(diskPath, buf, { mode: 0o600 });

      documentId = await documents.createDocument({
        user_id: userId, original_filename: filename, disk_path: diskPath,
        file_size_bytes: buf.length, status: 'processing',
      });

      const embeddable = pages.filter((p) => p.text && p.text.length > 0);
      const { vectors, model, mocked } = embeddable.length
        ? await embed(embeddable.map((p) => p.text))
        : { vectors: [], model: 'none', mocked: true };

      const pageRows = embeddable.map((p, i) => ({
        page_number: p.pageNumber, chunk_index: 0, text: p.text,
        token_count: p.tokenCount || 0, source: p.needsOcr ? 'ocr' : 'text',
        embeddingText: vectorToSqlText(vectors[i] || []),
      }));
      await documents.insertPages(documentId, pageRows);
      await documents.updateDocument(documentId, { status: 'ready', page_count: pageCount });
      await recordEvent({ kind: 'upload', req, userId });
      return { pageCount, embeddedPages: pageRows.length, model, mocked };
    });

    return NextResponse.json({
      ok: true,
      document: {
        id: documentId, filename, status: 'ready', pageCount: result.pageCount,
        embeddedPages: result.embeddedPages, embeddingModel: result.model,
        mockedEmbeddings: !!result.mocked,
      },
    });
  } catch (e) {
    const status = e.statusCode || (/XRef|FormatError|Invalid PDF|stream/i.test(String(e.message)) ? 422 : 500);
    if (documentId != null) {
      await documents.updateDocument(documentId, { status: 'failed', error_message: String(e.message || e).slice(0, 500) }).catch(() => {});
    }
    if (status >= 500) console.error('[upload] processing failed', e);
    const msg = status === 413 ? e.message : status === 422 ? 'Could not read this PDF (it may be corrupt or image-only).' : 'Failed to process the PDF';
    return NextResponse.json({ error: msg }, { status });
  }
}
