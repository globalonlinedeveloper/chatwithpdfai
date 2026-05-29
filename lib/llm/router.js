// =================================================================
// LLM smart router — routes each chat call to the cheapest capable
// provider, falling back to the next on error/rate-limit. Returns the
// text plus token usage, INR cost, and credits to charge (70% margin).
// All three providers verified working 2026-05-29.
// =================================================================

const USD_INR = Number(process.env.USD_INR || 83);

// Cheapest input price first (per REQUIREMENTS cost matrix, USD per 1M tokens).
const PROVIDERS = [
  { name: 'google',    model: 'gemini-2.5-flash', inUSD: 0.075, outUSD: 0.30, env: 'GEMINI_API_KEY',    call: callGemini },
  { name: 'openai',    model: 'gpt-4o-mini',      inUSD: 0.15,  outUSD: 0.60, env: 'OPENAI_API_KEY',    call: callOpenAI },
  { name: 'anthropic', model: 'claude-haiku-4-5', inUSD: 0.25,  outUSD: 1.25, env: 'ANTHROPIC_API_KEY', call: callAnthropic },
];

export function computeCostInr(p, inTok, outTok) {
  return ((inTok / 1e6) * p.inUSD + (outTok / 1e6) * p.outUSD) * USD_INR;
}
// 1 credit covers ₹2 of our raw LLM cost (user pays ~3.3x retail => ~70% margin).
export function costToCredits(costInr) {
  return Math.max(1, Math.ceil(costInr / 2));
}

async function callOpenAI({ system, messages, maxTokens, temperature }) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: maxTokens, temperature, messages: [{ role: 'system', content: system }, ...messages] }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  return { text: j.choices[0].message.content || '', inputTokens: j.usage.prompt_tokens, outputTokens: j.usage.completion_tokens };
}

async function callAnthropic({ system, messages, maxTokens, temperature }) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: maxTokens, temperature, system, messages }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  return { text: (j.content || []).map((b) => b.text || '').join(''), inputTokens: j.usage.input_tokens, outputTokens: j.usage.output_tokens };
}

async function callGemini({ system, messages, maxTokens, temperature }) {
  const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: maxTokens, temperature } }),
  });
  if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  const u = j.usageMetadata || {};
  return { text, inputTokens: u.promptTokenCount || 0, outputTokens: u.candidatesTokenCount || 0 };
}

/**
 * Route a chat completion to the cheapest available provider, with fallback.
 * @returns {Promise<{text,provider,model,inputTokens,outputTokens,costInr,credits,fallbacks:string[]}>}
 */
export async function routeChat({ system, messages, maxTokens = 1024, temperature = 0.2 }) {
  const errors = [];
  for (const p of PROVIDERS) {
    if (!process.env[p.env]) { errors.push(`${p.name}: no key`); continue; }
    try {
      const { text, inputTokens, outputTokens } = await p.call({ system, messages, maxTokens, temperature });
      if (!text || !text.trim()) throw new Error('empty completion');
      const costInr = computeCostInr(p, inputTokens, outputTokens);
      return { text, provider: p.name, model: p.model, inputTokens, outputTokens, costInr, credits: costToCredits(costInr), fallbacks: errors };
    } catch (e) {
      errors.push(`${p.name}: ${e.message}`);
    }
  }
  const err = new Error('All LLM providers failed: ' + errors.join(' | '));
  err.statusCode = 502;
  throw err;
}
