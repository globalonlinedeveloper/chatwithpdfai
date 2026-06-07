// =================================================================
// Embeddings — provider-agnostic interface.
// Default model: OpenAI text-embedding-3-small (1536 dims, cheapest mainstream).
//
// When TEST_MODE=1 or no OPENAI_API_KEY is set, returns a DETERMINISTIC mock
// embedding so the pipeline (and Playwright E2E) runs without external calls
// or cost. Real keys drop in later with zero code change (M2/M3).
// =================================================================

import crypto from 'node:crypto';

export const EMBED_DIM = 1536;
export const EMBED_MODEL = 'text-embedding-3-small';

export function usingMockEmbeddings() {
  // Explicit override wins; otherwise mock only when no real key is present.
  // (Decoupled from TEST_MODE so the in-memory store can run with REAL
  // embeddings — TEST_MODE controls persistence, this controls the provider.)
  if (process.env.MOCK_EMBEDDINGS === '1') return true;
  if (process.env.MOCK_EMBEDDINGS === '0') return false;
  // Auto-mock ONLY in explicit test mode. In production we never silently mock:
  // embed() throws below if the key is missing, so uploads fail loudly instead
  // of storing garbage vectors.
  return process.env.TEST_MODE === '1' && !process.env.OPENAI_API_KEY;
}

// Deterministic unit-vector from text (xorshift32 seeded by sha256).
function mockEmbed(text) {
  const digest = crypto.createHash('sha256').update(String(text)).digest();
  let x = 0;
  for (let i = 0; i < digest.length; i++) x = (x * 31 + digest[i]) >>> 0;
  x = x || 1;
  const v = new Array(EMBED_DIM);
  let norm = 0;
  for (let i = 0; i < EMBED_DIM; i++) {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    const f = (x / 0xffffffff) * 2 - 1;
    v[i] = f;
    norm += f * f;
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < EMBED_DIM; i++) v[i] = v[i] / norm;
  return v;
}

/**
 * Embed one or more strings.
 * @param {string|string[]} texts
 * @returns {Promise<{vectors:number[][], model:string, mocked:boolean, usage:{input_tokens:number}}>}
 */
export async function embed(texts, { signal } = {}) {
  const arr = Array.isArray(texts) ? texts : [texts];

  if (usingMockEmbeddings()) {
    return {
      vectors: arr.map(mockEmbed),
      model: 'mock-' + EMBED_MODEL,
      mocked: true,
      usage: { input_tokens: arr.reduce((n, t) => n + Math.ceil(String(t).length / 4), 0) },
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('Embeddings service is not configured (OPENAI_API_KEY missing).');
    err.statusCode = 503;
    throw err;
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: arr, dimensions: EMBED_DIM }),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenAI embeddings ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = await res.json();
  const vectors = json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);

  return {
    vectors,
    model: json.model || EMBED_MODEL,
    mocked: false,
    usage: { input_tokens: json.usage?.prompt_tokens ?? 0 },
  };
}

// MariaDB stores VECTOR via VEC_FromText('[a,b,c,...]'). This builds that text.
export function vectorToSqlText(vec) {
  return `[${vec.map((x) => (Number.isFinite(x) ? Number(x).toFixed(6) : 0)).join(',')}]`;
}
