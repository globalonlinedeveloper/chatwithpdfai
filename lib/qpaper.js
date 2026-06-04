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
