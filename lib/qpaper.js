// Shared, dependency-free helpers for the question-paper generator.
//
// stripOptionLabel removes a leading option label the model sometimes bakes into
// an option string — e.g. "a) Indira", "(A) Indira", "1. Indira" — so the UI's own
// "(a) " prefix doesn't produce a double label like "(a) a) Indira".
// It only strips a single a–f / 1–9 token followed by ) . : or - and whitespace,
// and only when real content follows, so legitimate text like "C++ is a language"
// or a bare "A" option is left untouched.
const OPTION_LABEL_RE = /^\s*\(?\s*(?:[A-Fa-f]|[1-9])\s*[).:\-]\s+(?=\S)/;

export function stripOptionLabel(s) {
  const str = String(s == null ? '' : s);
  const out = str.replace(OPTION_LABEL_RE, '');
  return out.length ? out : str;
}

// cleanTitle: the model occasionally returns a junk paper title — empty, a bare
// section label ("Section B"), or a question number ("Q1") — which would then print
// on the paper. Sanitise it; when bad, compose a sensible fallback from the topic,
// exam style, or source filename.
export function cleanTitle(raw, examStyle, topic, sourceName) {
  const t = String(raw == null ? '' : raw).trim().slice(0, 140);
  const ok = t && t.length >= 4
    && !/^(section|part)\b/i.test(t)
    && !/^(question|q)\s*\.?\s*\d/i.test(t)
    && !/^untitled\b/i.test(t);
  if (ok) return t;
  const tp = String(topic == null ? '' : topic).trim();
  if (tp) { const head = tp.split(/[\u2014\u2013:\-]/)[0].trim().slice(0, 90); if (head.length >= 3) return head.charAt(0).toUpperCase() + head.slice(1); }
  const es = String(examStyle == null ? '' : examStyle).trim().slice(0, 80);
  if (es) return es + ' \u2014 Question Paper';
  const sn = String(sourceName == null ? '' : sourceName).trim().slice(0, 80);
  if (sn) return 'Questions from ' + sn.replace(/\.[a-z0-9]+$/i, '');
  return 'Question Paper';
}

// defaultBloom: the model is asked to tag every question with a Bloom level but
// sometimes omits it, leaving gaps in the cognitive-mastery analytics. Fill a
// sensible default by type so every question is always categorised.
export function defaultBloom(type) {
  const map = { tf: 'Remember', fill: 'Remember', mcq: 'Understand', multi: 'Understand', match: 'Understand', assertion: 'Understand', short: 'Understand', numeric: 'Apply', code: 'Apply', long: 'Analyse', case: 'Analyse' };
  return map[type] || 'Understand';
}

// ---- verify-pass answer-key fix appliers (pure; used by the 2nd-model check) ----
// The checker returns the correct answer as TEXT (or an array); we map back to
// indices ourselves and only mutate when we can resolve the correction safely.
function vnorm(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[\s.;:]+$/, ''); }

export function vMatchOption(options, a) {
  const opts = Array.isArray(options) ? options : [];
  if (typeof a === 'string' && a.trim()) { const k = opts.findIndex((o) => vnorm(o) === vnorm(a)); if (k >= 0) return k; }
  const c = Number.isInteger(a) ? a : Number(a);
  return (Number.isInteger(c) && c >= 0 && c < opts.length) ? c : -1;
}
// single-correct (mcq / code / assertion / case sub-question)
export function vApplyOption(obj, a) { const t = vMatchOption(obj.options, a); if (t >= 0 && t !== obj.answer) { obj.answer = t; return true; } return false; }
export function vApplyTf(obj, a) { const c = a === true || vnorm(a) === 'true'; if (c !== obj.answer) { obj.answer = c; return true; } return false; }
export function vApplyValue(obj, a) { const c = String(a == null ? '' : a).slice(0, 80); if (c && c !== String(obj.answer)) { obj.answer = c; return true; } return false; }
// multi-select: array of correct option texts -> set of indices
export function vApplyMulti(q, a) {
  if (!Array.isArray(a)) return false;
  const idxs = [...new Set(a.map((t) => vMatchOption(q.options, t)).filter((k) => k >= 0))].sort((x, y) => x - y);
  const cur = [...(Array.isArray(q.answers) ? q.answers : [])].sort((x, y) => x - y);
  if (idxs.length && idxs.join(',') !== cur.join(',')) { q.answers = idxs; return true; }
  return false;
}
// matching: array of correct right-texts in left order -> re-assign pair.r
// (only applies a per-pair fix when the corrected text unambiguously matches an
// existing right in the pool, so a fuzzy correction can never corrupt the key)
export function vApplyMatch(q, a) {
  const pairs = Array.isArray(q.pairs) ? q.pairs : [];
  if (!Array.isArray(a) || a.length !== pairs.length) return false;
  const pool = pairs.map((p) => p.r);
  let changed = false;
  const next = pairs.map((p, k) => { const m = pool.find((r) => vnorm(r) === vnorm(a[k])); if (m && vnorm(m) !== vnorm(p.r)) { changed = true; return { ...p, r: m }; } return p; });
  if (changed) q.pairs = next;
  return changed;
}
