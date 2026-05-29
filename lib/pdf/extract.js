// =================================================================
// PDF text extraction — per-page text via `unpdf` (a modern, serverless
// build of pdf.js).
//
// NOTE: we deliberately do NOT use pdf-parse@1.x here. Its bundled pdf.js
// (v1.10.100, 2017) fails with "bad XRef entry" once a mysql2 connection
// pool is active in the same process — i.e. it breaks on every upload after
// the first DB call. Caught by the Playwright E2E; see REQUIREMENTS decisions.
// `unpdf` coexists cleanly with mysql2 and parses the same PDFs reliably.
// =================================================================

import { extractText, getDocumentProxy } from 'unpdf';

// A page with almost no extractable text is probably a scan/image and would
// need OCR (Tesseract.js or a vision-LLM fallback — wired in M2/M3).
const OCR_THRESHOLD_CHARS = 20;

/**
 * Extract text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<{pageCount:number, pages:Array<{pageNumber:number,text:string,charCount:number,tokenCount:number,needsOcr:boolean}>, info:object|null}>}
 */
export async function extractPdf(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('extractPdf expects a Buffer');
  }

  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const perPage = Array.isArray(text) ? text : [text];

  const pages = perPage.map((t, i) => {
    const clean = (t || '').trim();
    return {
      pageNumber: i + 1,
      text: clean,
      charCount: clean.length,
      // Rough token estimate (~4 chars/token) — good enough for cost previews.
      tokenCount: Math.ceil(clean.length / 4),
      needsOcr: clean.length < OCR_THRESHOLD_CHARS,
    };
  });

  return { pageCount: totalPages || pages.length, pages, info: null };
}

export const _internals = { OCR_THRESHOLD_CHARS };
