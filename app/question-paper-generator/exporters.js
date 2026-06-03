// Client-side exporters: turn a generated paper into LMS-importable files.
const L = (i) => String.fromCharCode(97 + i);
function flatQs(paper) { return (paper.sections || []).flatMap((s) => s.questions).flatMap((q) => q.type === 'case' ? (q.sub || []).map((sq) => ({ type: 'mcq', q: (q.q ? q.q + ' \u2014 ' : '') + sq.q, options: sq.options, answer: sq.answer, explanation: sq.explanation })) : [q]); }
function gift(s) { return String(s == null ? '' : s).replace(/([~=#{}:\\])/g, '\\$1').replace(/\r?\n/g, ' '); }
function xe(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function stemOf(q) { return q.type === 'assertion' ? `Assertion (A): ${q.assertion}  Reason (R): ${q.reason}` : (q.q || ''); }

export function slug(t) { return String(t || 'paper').replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'paper'; }

export function toGIFT(paper) {
  const out = [];
  flatQs(paper).forEach((q, i) => {
    const stem = gift(stemOf(q)); const t = `::Q${i + 1}:: ${stem} `;
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') out.push(t + '{\n' + q.options.map((o, oi) => (oi === q.answer ? '=' : '~') + gift(o)).join('\n') + '\n}');
    else if (q.type === 'multi') { const pct = Math.max(1, Math.round(100 / q.answers.length)); out.push(t + '{\n' + q.options.map((o, oi) => (q.answers.includes(oi) ? `~%${pct}%` : '~%-100%') + gift(o)).join('\n') + '\n}'); }
    else if (q.type === 'tf') out.push(t + '{' + (q.answer ? 'TRUE' : 'FALSE') + '}');
    else if (q.type === 'fill') out.push(t + '{=' + gift(q.answer) + '}'); // exact-match blank (GIFT shortanswer is case-insensitive)
    else if (q.type === 'numeric') out.push(t + '{#' + gift(q.answer) + '}');
    else if (q.type === 'match') out.push(t + '{\n' + q.pairs.map((p) => '=' + gift(p.l) + ' -> ' + gift(p.r)).join('\n') + '\n}');
    else out.push(t + '{}'); // short/long carry a model answer (a sentence), not an exact key -> manually-graded essay, so Moodle doesn't mark every student wrong
  });
  return out.join('\n\n') + '\n';
}

export function toMoodleXML(paper) {
  const cd = (s) => `<text>${xe(s)}</text>`;
  const head = (type, name, stem) => `  <question type="${type}">\n    <name>${cd(name)}</name>\n    <questiontext format="html">${cd(stem)}</questiontext>`;
  const qs = flatQs(paper).map((q, i) => {
    const name = `Q${i + 1}`; const stem = stemOf(q);
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') return `${head('multichoice', name, stem)}\n    <single>true</single>\n${q.options.map((o, oi) => `    <answer fraction="${oi === q.answer ? 100 : 0}">${cd(o)}</answer>`).join('\n')}\n  </question>`;
    if (q.type === 'multi') { const pct = Math.max(1, Math.round(100 / q.answers.length)); return `${head('multichoice', name, stem)}\n    <single>false</single>\n${q.options.map((o, oi) => `    <answer fraction="${q.answers.includes(oi) ? pct : 0}">${cd(o)}</answer>`).join('\n')}\n  </question>`; }
    if (q.type === 'tf') return `${head('truefalse', name, stem)}\n    <answer fraction="${q.answer ? 100 : 0}">${cd('true')}</answer>\n    <answer fraction="${q.answer ? 0 : 100}">${cd('false')}</answer>\n  </question>`;
    if (q.type === 'fill') return `${head('shortanswer', name, stem)}\n    <answer fraction="100">${cd(q.answer)}</answer>\n  </question>`;
    if (q.type === 'numeric') return `${head('numerical', name, stem)}\n    <answer fraction="100">${cd(q.answer)}<tolerance>0</tolerance></answer>\n  </question>`;
    if (q.type === 'match') return `${head('matching', name, stem)}\n${q.pairs.map((p) => `    <subquestion format="html">${cd(p.l)}<answer>${cd(p.r)}</answer></subquestion>`).join('\n')}\n  </question>`;
    return `${head('essay', name, stem)}\n  </question>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n${qs}\n</quiz>\n`;
}

export function toCSV(paper) {
  const c = (s) => `"${String(s == null ? '' : s).replace(/"/g, '""')}"`;
  const rows = [['#', 'section', 'type', 'question', 'options', 'answer', 'explanation', 'page']];
  let n = 0;
  (paper.sections || []).forEach((sec) => sec.questions.forEach((q) => {
    n++; let ans = '';
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') ans = L(q.answer) + ') ' + q.options[q.answer];
    else if (q.type === 'multi') ans = q.answers.map((a) => L(a)).join(',');
    else if (q.type === 'tf') ans = q.answer ? 'True' : 'False';
    else if (q.type === 'fill' || q.type === 'numeric') ans = q.answer;
    else if (q.type === 'match') ans = q.pairs.map((p) => p.l + '=' + p.r).join('; ');
    else if (q.type === 'case') ans = (q.sub || []).map((sq, si) => (si + 1) + ':' + L(sq.answer)).join(' ');
    else ans = q.modelAnswer || '';
    rows.push([n, sec.title || '', q.type, stemOf(q), (q.options || []).map((o, oi) => L(oi) + ') ' + o).join(' | '), ans, q.explanation || '', q.page || '']);
  }));
  return rows.map((r) => r.map(c).join(',')).join('\r\n') + '\r\n';
}

export function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
