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

// ---------- Aiken (Moodle single-answer MCQ import) ----------
export function toAiken(paper) {
  const out = [];
  flatQs(paper).forEach((q) => {
    let opts = null, ans = -1;
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') { opts = q.options; ans = q.answer; }
    else if (q.type === 'tf') { opts = ['True', 'False']; ans = q.answer ? 0 : 1; }
    if (!opts || !(ans >= 0 && ans < opts.length)) return; // Aiken only represents single-answer MCQ
    const stem = String(stemOf(q)).replace(/\r?\n/g, ' ').trim();
    out.push(stem + '\n' + opts.map((o, oi) => String.fromCharCode(65 + oi) + '. ' + String(o).replace(/\r?\n/g, ' ')).join('\n') + '\nANSWER: ' + String.fromCharCode(65 + ans));
  });
  return out.join('\n\n') + '\n';
}

// ---------- QTI 2.1 content package (dependency-free .zip) ----------
const _crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
function crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = _crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

// STORE (no compression) zip from [{name, data(string)}] -> Blob. Enough for LMS import.
export function zipStore(files) {
  const enc = new TextEncoder(); const chunks = []; const central = []; let offset = 0;
  const u16 = (n) => [n & 0xFF, (n >>> 8) & 0xFF];
  const u32 = (n) => [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF];
  for (const f of files) {
    const nameB = enc.encode(f.name); const dataB = enc.encode(f.data); const crc = crc32(dataB);
    const local = [].concat(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(dataB.length), u32(dataB.length), u16(nameB.length), u16(0));
    chunks.push(new Uint8Array(local), nameB, dataB);
    const cd = [].concat(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(dataB.length), u32(dataB.length), u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset));
    central.push({ head: new Uint8Array(cd), name: nameB });
    offset += local.length + nameB.length + dataB.length;
  }
  const cdStart = offset; let cdSize = 0;
  for (const c of central) { chunks.push(c.head, c.name); cdSize += c.head.length + c.name.length; }
  chunks.push(new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(cdSize), u32(cdStart), u16(0))));
  return new Blob(chunks, { type: 'application/zip' });
}

function qtiItem(q, ident, title) {
  const RP = '<responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>';
  const wrap = (rd, body, rp) => `<?xml version="1.0" encoding="UTF-8"?>\n<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="${xe(ident)}" title="${xe(title)}" adaptive="false" timeDependent="false">\n${rd}\n  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"><defaultValue><value>0</value></defaultValue></outcomeDeclaration>\n  <itemBody>\n    <p>${xe(stemOf(q))}</p>\n${body}\n  </itemBody>\n  ${rp}\n</assessmentItem>\n`;
  let opts = null, correct = [], multiple = false;
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') { opts = q.options; correct = [q.answer]; }
  else if (q.type === 'tf') { opts = ['True', 'False']; correct = [q.answer ? 0 : 1]; }
  else if (q.type === 'multi') { opts = q.options; correct = (q.answers || []); multiple = true; }
  if (opts) {
    const rd = `  <responseDeclaration identifier="RESPONSE" cardinality="${multiple ? 'multiple' : 'single'}" baseType="identifier">\n    <correctResponse>\n${correct.map((c) => `      <value>C${c}</value>`).join('\n')}\n    </correctResponse>\n  </responseDeclaration>`;
    const body = `    <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="${multiple ? 0 : 1}">\n${opts.map((o, oi) => `      <simpleChoice identifier="C${oi}">${xe(o)}</simpleChoice>`).join('\n')}\n    </choiceInteraction>`;
    return wrap(rd, body, RP);
  }
  if (q.type === 'fill' || q.type === 'numeric') {
    const rd = `  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string">\n    <correctResponse><value>${xe(q.answer)}</value></correctResponse>\n  </responseDeclaration>`;
    return wrap(rd, `    <p><textEntryInteraction responseIdentifier="RESPONSE" expectedLength="20"/></p>`, RP);
  }
  return wrap(`  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string"/>`, `    <extendedTextInteraction responseIdentifier="RESPONSE" expectedLines="4"/>`, '');
}

export function toQTIZip(paper) {
  const items = flatQs(paper).map((q, i) => ({ ident: 'item' + (i + 1), title: 'Q' + (i + 1), q }));
  const files = items.map((it) => ({ name: 'items/' + it.ident + '.xml', data: qtiItem(it.q, it.ident, it.title) }));
  const resources = items.map((it) => `    <resource identifier="RES-${it.ident}" type="imsqti_item_xmlv2p1" href="items/${it.ident}.xml"><file href="items/${it.ident}.xml"/></resource>`).join('\n');
  files.unshift({ name: 'imsmanifest.xml', data: `<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST-${xe(slug(paper.title))}" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <organizations/>\n  <resources>\n${resources}\n  </resources>\n</manifest>\n` });
  return zipStore(files);
}

export function downloadBlob(filename, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
