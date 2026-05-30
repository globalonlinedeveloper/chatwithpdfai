// Shared grading + student-safe stripping (used by take API server-side).
export const AUTO = ['mcq', 'code', 'assertion', 'tf', 'multi', 'fill', 'numeric', 'match'];
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
    case 'short': case 'long': return q.modelAnswer || '';
    default: return '';
  }
}

// Strip correct answers; for match send lefts + sorted choices (no alignment leak).
export function studentSafe(paper) {
  const stripQ = (q) => {
    const b = { type: q.type, q: q.q };
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'multi') b.options = q.options;
    if (q.type === 'assertion') { b.assertion = q.assertion; b.reason = q.reason; b.options = q.options; }
    if (q.type === 'numeric') b.unit = q.unit;
    if (q.type === 'match') { b.lefts = q.pairs.map((p) => p.l); b.choices = rights(q.pairs); }
    return b;
  };
  return { title: paper.title, examStyle: paper.examStyle, institution: paper.institution, durationMin: paper.durationMin, totalMarks: paper.totalMarks, sections: (paper.sections || []).map((s) => ({ title: s.title, marks: s.marks, questions: (s.questions || []).map(stripQ) })) };
}

export function flatQs(paper) { return (paper.sections || []).flatMap((s) => s.questions); }
