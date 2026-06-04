// Shared grading + student-safe stripping (used by take API server-side).
export const AUTO = ['mcq', 'code', 'assertion', 'tf', 'multi', 'fill', 'numeric', 'match', 'hotspot'];
export const isAuto = (q) => AUTO.includes(q.type);
export const rights = (pairs) => [...pairs.map((p) => p.r)].sort((a, b) => String(a).localeCompare(String(b)));
const norm = (x) => String(x == null ? '' : x).trim().toLowerCase().replace(/\s+/g, ' ');
const normFill = (x) => norm(x).replace(/^(?:a|an|the)\s+/, '').replace(/[.,;:!?]+$/, '');
const L = (i) => String.fromCharCode(97 + i);

export function grade(q, ua) {
  switch (q.type) {
    case 'mcq': case 'code': case 'assertion': return ua === q.answer;
    case 'tf': return ua === q.answer;
    case 'multi': { const a = [...(Array.isArray(ua) ? ua : [])].sort().join(','); const b = [...q.answers].sort().join(','); return a === b && a !== ''; }
    case 'fill': { const u = normFill(ua); return !!u && String(q.answer).split('|').some((a) => normFill(a) === u); }
    case 'numeric': { const x = parseFloat(ua), y = parseFloat(q.answer); if (!isNaN(x) && !isNaN(y)) { const tol = Math.max(0.001, Math.abs(y) * 0.005); return Math.abs(x - y) <= tol; } return !!norm(ua) && norm(ua) === norm(q.answer); }
    case 'match': { if (!Array.isArray(ua)) return false; const rs = rights(q.pairs); return q.pairs.every((p, pi) => rs[ua[pi]] === p.r); }
    case 'hotspot': { if (!q.hot || !Array.isArray(ua) || ua.length < 2) return false; const dx = Number(ua[0]) - Number(q.hot.x), dy = Number(ua[1]) - Number(q.hot.y); const tol = Number(q.hot.r) || 0.12; return Math.sqrt(dx * dx + dy * dy) <= tol; }
    case 'case': return null;
    default: return null;
  }
}

export function correctText(q) {
  switch (q.type) {
    case 'mcq': case 'code': case 'assertion': return '(' + L(q.answer) + ') ' + q.options[q.answer];
    case 'multi': return q.answers.map((a) => '(' + L(a) + ') ' + q.options[a]).join('; ');
    case 'tf': return q.answer ? 'True' : 'False';
    case 'fill': return q.answer;
    case 'numeric': return String(q.answer) + (q.unit ? ' ' + q.unit : '');
    case 'match': return q.pairs.map((p) => p.l + ' -> ' + p.r).join(', ');
    case 'case': return (q.sub || []).map((sq, si) => (si + 1) + '. (' + L(sq.answer) + ') ' + (sq.options || [])[sq.answer]).join('   ');
    case 'hotspot': return 'the marked location on the image';
    case 'short': case 'long': return q.modelAnswer || '';
    default: return '';
  }
}

// Render a student's submitted answer as human-readable text (mirrors correctText's shape).
export function studentAnswerText(q, ua) {
  const U = (i) => String.fromCharCode(65 + i);
  const none = '— (no answer)';
  switch (q.type) {
    case 'mcq': case 'code': case 'assertion': return Number.isInteger(ua) && q.options[ua] != null ? '(' + U(ua) + ') ' + q.options[ua] : none;
    case 'tf': return ua === true ? 'True' : ua === false ? 'False' : none;
    case 'multi': { const a = (Array.isArray(ua) ? ua : []).filter((i) => q.options[i] != null); return a.length ? a.map((i) => '(' + U(i) + ') ' + q.options[i]).join('; ') : none; }
    case 'fill': case 'numeric': case 'short': case 'long': return ua != null && String(ua).trim() ? String(ua) : none;
    case 'match': { if (!Array.isArray(ua)) return none; const rs = rights(q.pairs); return q.pairs.map((p, pi) => p.l + ' -> ' + (rs[ua[pi]] != null ? rs[ua[pi]] : '?')).join(', '); }
    case 'case': { const ans = ua && typeof ua === 'object' && !Array.isArray(ua) ? ua : {}; return (q.sub || []).map((sq, si) => (si + 1) + '. ' + (Number.isInteger(ans[si]) && (sq.options || [])[ans[si]] != null ? '(' + U(ans[si]) + ') ' + sq.options[ans[si]] : '—')).join('   '); }
    default: return ua != null ? String(ua) : none;
  }
}

// Strip correct answers; for match send lefts + sorted choices (no alignment leak).
export function studentSafe(paper) {
  const stripQ = (q) => {
    const b = { type: q.type, q: q.q };
    if (q.image) b.image = q.image;
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'multi') b.options = q.options;
    if (q.type === 'assertion') { b.assertion = q.assertion; b.reason = q.reason; b.options = q.options; }
    if (q.type === 'numeric') b.unit = q.unit;
    if (q.type === 'match') { b.lefts = q.pairs.map((p) => p.l); b.choices = rights(q.pairs); }
    if (q.type === 'case') b.sub = (q.sub || []).map((sq) => ({ q: sq.q, options: sq.options }));
    return b;
  };
  return { title: paper.title, examStyle: paper.examStyle, institution: paper.institution, durationMin: paper.durationMin, totalMarks: paper.totalMarks, sections: (paper.sections || []).map((s) => ({ title: s.title, marks: s.marks, questions: (s.questions || []).map(stripQ) })) };
}

export function flatQs(paper) { return (paper.sections || []).flatMap((s) => s.questions); }

export function dupPairs(paper, thresh) {
  thresh = thresh == null ? 0.82 : thresh;
  const qs = flatQs(paper || {});
  const toks = qs.map((q) => {
    const parts = [(q && (q.q || q.assertion || q.stem)) || ''];
    if (q && Array.isArray(q.options)) parts.push(q.options.map((o) => typeof o === 'string' ? o : (o && o.text) || '').join(' '));
    return new Set(String(parts.join(' ')).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2));
  });
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    for (let j = i + 1; j < toks.length; j++) {
      const a = toks[i], b = toks[j];
      if (a.size < 3 || b.size < 3) continue;
      let inter = 0; a.forEach((w) => { if (b.has(w)) inter += 1; });
      const uni = a.size + b.size - inter;
      const sim = uni ? inter / uni : 0;
      if (sim >= thresh) out.push({ a: i + 1, b: j + 1, sim: Math.round(sim * 100) });
    }
  }
  return out;
}

// Lightweight, dependency-free math/science notation -> Unicode (CSP-safe, prints fine).
// Covers the common school cases: exponents (x^2, x^{12}), subscripts (H_2O, a_{ij}),
// fractions, roots, Greek letters and common operators. Not a full LaTeX engine.
const _SUP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','i':'ⁱ' };
const _SUB = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎' };
const _SYM = { '\\times':'×','\\div':'÷','\\pm':'±','\\mp':'∓','\\leq':'≤','\\le':'≤','\\geq':'≥','\\ge':'≥','\\neq':'≠','\\ne':'≠','\\approx':'≈','\\equiv':'≡','\\rightarrow':'→','\\to':'→','\\Rightarrow':'⇒','\\leftarrow':'←','\\infty':'∞','\\cdot':'·','\\circ':'°','\\degree':'°','\\alpha':'α','\\beta':'β','\\gamma':'γ','\\delta':'δ','\\epsilon':'ε','\\theta':'θ','\\lambda':'λ','\\mu':'μ','\\pi':'π','\\rho':'ρ','\\sigma':'σ','\\tau':'τ','\\phi':'φ','\\omega':'ω','\\Delta':'Δ','\\Sigma':'Σ','\\Omega':'Ω','\\Theta':'Θ','\\sum':'∑','\\prod':'∏','\\int':'∫','\\partial':'∂','\\nabla':'∇','\\sqrt':'√','\\propto':'∝','\\angle':'∠','\\perp':'⊥','\\parallel':'∥','\\therefore':'∴','\\implies':'⇒' };
function _mapRun(str, map) { return String(str).split('').map((c) => map[c] || c).join(''); }
export function mathText(s) {
  if (s == null) return s;
  let t = String(s);
  if (!/[\^_\\$]/.test(t)) return t; // fast path
  t = t.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
  t = t.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)');
  t = t.replace(/\\[a-zA-Z]+/g, (m) => (_SYM[m] != null ? _SYM[m] : m));
  t = t.replace(/\^\{([^{}]*)\}/g, (m, g) => ([...g].length && [...g].every((c) => _SUP[c] != null)) ? _mapRun(g, _SUP) : m);
  t = t.replace(/_\{([^{}]*)\}/g, (m, g) => ([...g].length && [...g].every((c) => _SUB[c] != null)) ? _mapRun(g, _SUB) : m);
  t = t.replace(/\^([0-9n+\-=()i])/g, (_, c) => _SUP[c] || ('^' + c));
  t = t.replace(/_([0-9+\-=()])/g, (_, c) => _SUB[c] || ('_' + c));
  t = t.replace(/\$([^$]*)\$/g, '$1'); // strip inline $...$ delimiters, keep content
  return t;
}
