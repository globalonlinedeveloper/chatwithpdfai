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
