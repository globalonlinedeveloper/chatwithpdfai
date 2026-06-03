'use client';
import { grade, correctText, mathText } from './grade.js';

export const TYPE_LABELS = { mcq: 'Multiple choice', multi: 'Multi-select', tf: 'True / false', fill: 'Fill the blank', match: 'Match', assertion: 'Assertion–reason', numeric: 'Numeric', short: 'Short answer', long: 'Long answer', case: 'Case study', code: 'Code output' };
export const ALL_TYPES = Object.keys(TYPE_LABELS);
export const LETTER = (i) => String.fromCharCode(97 + i);
export const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
export const LANG_NAME = { ta: 'Tamil', hi: 'Hindi' };
export const rights = (pairs) => [...pairs.map((p) => p.r)].sort((a, b) => String(a).localeCompare(String(b)));
export const AUTO = ['mcq', 'code', 'assertion', 'tf', 'multi', 'fill', 'numeric', 'match'];
export const isAuto = (q) => AUTO.includes(q.type);
export const norm = (x) => String(x == null ? '' : x).trim().toLowerCase().replace(/\s+/g, ' ');
export const normFill = (x) => norm(x).replace(/^(?:a|an|the)\s+/, '').replace(/[.,;:!?]+$/, '');
export const clampInt = (v, min, max) => { const n = Math.round(Number(v)); if (!Number.isFinite(n)) return min; return Math.max(min, Math.min(max, n)); };
export const clampHalf = (v, min, max) => { const n = Math.round(Number(v) * 2) / 2; if (!Number.isFinite(n)) return min; return Math.max(min, Math.min(max, n)); };

export function renderBody(q) {
  const opts = (list) => (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '4px 20px', marginTop: 8 }}>{list.map((o, oi) => <div key={oi} style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', minWidth: 0 }}>({LETTER(oi)}) {mathText(o)}</div>)}</div>);
  const qt = q.type === 'code' ? <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: '#f3f3f6', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: '2px 0 0' }}>{q.q}</pre> : <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{mathText(q.q)}</span>;
  switch (q.type) {
    case 'mcq': case 'code': return <>{qt}{opts(q.options)}</>;
    case 'multi': return <>{qt}<div style={{ fontSize: 11.5, color: '#777', marginTop: 3 }}>(select all that apply)</div>{opts(q.options)}</>;
    case 'tf': return <>{qt}<div style={{ marginTop: 6, fontSize: 13, color: '#555' }}>( True / False )</div></>;
    case 'fill': return qt;
    case 'numeric': return <>{qt}<div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>Answer: ____________ {q.unit}</div></>;
    case 'assertion': return <><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {mathText(q.assertion)}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {mathText(q.reason)}</div>{opts(q.options)}</>;
    case 'match': { const rs = rights(q.pairs); return <>{qt}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2px 24px', marginTop: 8, fontSize: 13.5, overflowWrap: 'anywhere' }}><div>{q.pairs.map((p, pi) => <div key={pi}>{ROMAN[pi]}. {mathText(p.l)}</div>)}</div><div>{rs.map((r, ri) => <div key={ri}>({LETTER(ri)}) {mathText(r)}</div>)}</div></div></>; }
    case 'short': return <>{qt}<div style={{ marginTop: 8, height: 40, borderBottom: '1px solid #ccc' }}></div></>;
    case 'long': return <>{qt}<div style={{ marginTop: 8, height: 84, borderBottom: '1px solid #ccc' }}></div></>;
    case 'case': return <>{qt}<div style={{ marginTop: 4 }}>{(q.sub || []).map((sq, si) => <div key={si} style={{ marginTop: si ? 10 : 6 }}><div style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>({ROMAN[si]}) {mathText(sq.q)}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '4px 20px', marginTop: 4 }}>{(sq.options || []).map((o, oi) => <div key={oi} style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', minWidth: 0 }}>({LETTER(oi)}) {mathText(o)}</div>)}</div></div>)}</div></>;
    default: return qt;
  }
}

export function PaperView({ paper, layout, includeKey, onRegen, regenGi, onRegenSection }) {
  const compact = layout === 'compact';
  const official = layout === 'official';
  const qFont = compact ? 12.5 : 14;
  const secName = (sec, si) => sec.title || ('Section ' + String.fromCharCode(65 + si));
  const header = official ? (
    <div style={{ border: '1.5px solid #111', borderRadius: 6, marginBottom: 14 }}>
      <div style={{ textAlign: 'center', padding: '10px 14px 8px' }}>
        {paper.logo ? <img src={paper.logo} alt="" style={{ maxHeight: 54, maxWidth: 200, margin: '0 auto 6px', display: 'block', objectFit: 'contain' }} /> : null}{paper.institution ? <div style={{ fontSize: 11.5, letterSpacing: '0.12em', color: '#444' }}>{paper.institution}</div> : null}
        <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{paper.title}</div>
        {paper.examStyle ? <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>{paper.examStyle}</div> : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: '1px solid #ccc', padding: '7px 14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#444' }}>Roll no.<span style={{ display: 'inline-flex', gap: 3 }}>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 15, height: 19, border: '1px solid #999', borderRadius: 2, display: 'inline-block' }} />)}</span></div>
        <div style={{ fontSize: 12, color: '#444', textAlign: 'right' }}>Time: {paper.durationMin} min&nbsp;&nbsp;·&nbsp;&nbsp;Max marks: {paper.totalMarks}{paper.grounded && paper.sourceName ? ' · source: ' + paper.sourceName : ''}</div>
      </div>
    </div>
  ) : (
    <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: compact ? 8 : 14, marginBottom: compact ? 12 : 18 }}>
      {paper.logo ? <img src={paper.logo} alt="" style={{ maxHeight: 54, maxWidth: 200, margin: '0 auto 6px', display: 'block', objectFit: 'contain' }} /> : null}{paper.institution ? <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{paper.institution}</div> : null}
      <div style={{ fontSize: compact ? 17 : 21, fontWeight: 700, marginTop: paper.institution ? 4 : 0 }}>{paper.title}</div>
      <div style={{ fontSize: 12.5, color: '#555', marginTop: 6 }}>Max marks: {paper.totalMarks} · Time: {paper.durationMin} min{paper.examStyle ? ' · ' + paper.examStyle : ''}{paper.grounded && paper.sourceName ? ' · source: ' + paper.sourceName : ''}</div>
    </div>
  );
  const instr = official ? (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#555' }}><b style={{ fontWeight: 600, color: '#222' }}>General instructions</b>&nbsp; {paper.instructions || 'All questions are compulsory.'}{includeKey ? ' The answer key is on the last page.' : ''}</div>
  ) : (
    <div style={{ fontSize: 12, color: '#666', marginBottom: compact ? 10 : 16 }}>{paper.instructions || 'Instructions: answer all questions.'}{includeKey ? ' The answer key is on the last page.' : ''}</div>
  );
  let n = 0;
  const body = paper.sections.map((sec, si) => (
    <div key={si} style={{ marginBottom: compact ? 4 : 8 }}>
      {(sec.title || paper.sections.length > 1 || official) ? (official ? (
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', border: '1px solid #ccc', borderRadius: 4, padding: '4px 10px', margin: '12px 0 10px', background: '#f3f3f6', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{secName(sec, si)}</h2>{onRegenSection ? <button type="button" className="no-print" onClick={() => onRegenSection(si)} disabled={regenGi != null} title="Regenerate all questions in this section" data-testid={'sregen-' + si} style={{ fontSize: 10.5, padding: '1px 7px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: 'transparent', color: '#555' }}>{regenGi === ('s' + si) ? '…' : '↻'}</button> : null}</span><span style={{ fontSize: 11.5, color: '#666' }}>{sec.questions.length} × {sec.marks} = {sec.questions.length * sec.marks} marks</span></div>
      ) : (
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ddd', margin: compact ? '10px 0 6px' : '14px 0 10px', paddingBottom: 4 }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h2 style={{ fontSize: compact ? 13 : 14.5, fontWeight: 700, margin: 0 }}>{secName(sec, si)}</h2>{onRegenSection ? <button type="button" className="no-print" onClick={() => onRegenSection(si)} disabled={regenGi != null} title="Regenerate all questions in this section" data-testid={'sregen-' + si} style={{ fontSize: 10.5, padding: '1px 7px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: 'transparent', color: '#555' }}>{regenGi === ('s' + si) ? '…' : '↻'}</button> : null}</span><span style={{ fontSize: 11.5, color: '#777' }}>{sec.questions.length} × {sec.marks} = {sec.questions.length * sec.marks} marks</span></div>
      )) : null}
      {sec.questions.map((q) => { n += 1; const gi = n - 1; return (
        <div key={n} className="q-block" style={{ marginBottom: compact ? 9 : 16, fontSize: qFont, lineHeight: compact ? 1.4 : 1.55, display: 'flex', gap: 8 }}><span style={{ fontWeight: 600, flexShrink: 0 }}>{n}.</span><div style={{ flex: 1 }}>{renderBody(q)}</div>{official ? <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>[{sec.marks}]</span> : null}{onRegen ? <button type="button" className="no-print" onClick={() => onRegen(gi)} disabled={regenGi != null} title="Replace this question with a fresh AI one (uses a credit)" aria-label={'Regenerate question ' + (gi + 1)} data-testid={'pregen-' + gi} style={{ flexShrink: 0, fontSize: 11, padding: '1px 6px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: 'transparent', color: '#555', alignSelf: 'flex-start' }}>{regenGi === gi ? '…' : '↻'}</button> : null}{q.bloom ? <span className="no-print" title="AI-tagged cognitive level" style={{ fontSize: 9.5, color: '#777', border: '1px solid #ddd', borderRadius: 3, padding: '0 4px', alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{q.bloom}</span> : null}</div>
      ); })}
    </div>
  ));
  let k = 0;
  return (
    <>
      {header}
      {instr}
      {body}
      {official ? <div style={{ textAlign: 'center', fontSize: 11, color: '#999', letterSpacing: '0.06em', margin: '8px 0 4px' }}>— end of question paper —</div> : null}
      {includeKey ? (
        <div className="pagebreak" style={{ marginTop: 26, borderTop: '2px solid #111', paddingTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Answer key</div>
          {paper.sections.flatMap((sec) => sec.questions.map((q) => { k += 1; return <div key={k} className="key-item" style={{ fontSize: compact ? 12 : 13, lineHeight: 1.5, marginBottom: compact ? 5 : 7 }}><b style={{ fontWeight: 600 }}>{k}.</b> {mathText(correctText(q))}{q.explanation ? <span style={{ color: '#666' }}> — {mathText(q.explanation)}</span> : null}{q.page ? <span style={{ color: '#888' }}> [source p.{q.page}]</span> : null}</div>; }))}
        </div>
      ) : null}
    </>
  );
}

export function PromptStem({ q }) {
  if (q.type === 'code') return <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--glass-1)', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: '2px 0 0', color: 'var(--text)' }}>{q.q}</pre>;
  if (q.type === 'assertion') return <div><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {mathText(q.assertion)}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {mathText(q.reason)}</div></div>;
  if (q.type === 'match') return <span style={{ fontWeight: 600 }}>Match the following</span>;
  if (q.type === 'case') return <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{mathText(q.q)}</span>;
  return <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{mathText(q.q)}</span>;
}
export function PracticeInput({ q, ua, checked, onAns }) {
  const optBtn = (label, active, state, onClick) => {
    let bg = 'var(--glass-1)', bd = 'var(--stroke-2)';
    if (state === 'correct') { bg = 'rgba(99,153,34,0.16)'; bd = 'var(--green)'; }
    else if (state === 'wrong') { bg = 'rgba(255,126,126,0.13)'; bd = '#e24b4a'; }
    else if (active) { bg = 'var(--glass-2)'; bd = 'var(--violet)'; }
    return <button type="button" disabled={checked} onClick={onClick} style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--r)', background: bg, border: '1px solid ' + bd, color: 'var(--text)', fontSize: 13.5, cursor: checked ? 'default' : 'pointer', width: '100%' }}>{label}</button>;
  };
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') {
    return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{q.options.map((o, oi) => { const st = checked ? (oi === q.answer ? 'correct' : (ua === oi ? 'wrong' : '')) : ''; return <div key={oi}>{optBtn(<span>({LETTER(oi)}) {mathText(o)}</span>, ua === oi, st, () => onAns(oi))}</div>; })}</div>;
  }
  if (q.type === 'tf') {
    return <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{[true, false].map((v) => { const st = checked ? (q.answer === v ? 'correct' : (ua === v ? 'wrong' : '')) : ''; return <div key={String(v)} style={{ flex: 1 }}>{optBtn(v ? 'True' : 'False', ua === v, st, () => onAns(v))}</div>; })}</div>;
  }
  if (q.type === 'multi') {
    const arr = Array.isArray(ua) ? ua : [];
    return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{q.options.map((o, oi) => { const sel = arr.includes(oi); const st = checked ? (q.answers.includes(oi) ? 'correct' : (sel ? 'wrong' : '')) : ''; return <div key={oi}>{optBtn(<span>{sel ? '☑' : '☐'} ({LETTER(oi)}) {mathText(o)}</span>, sel, st, () => onAns(sel ? arr.filter((x) => x !== oi) : [...arr, oi]))}</div>; })}</div>;
  }
  if (q.type === 'fill' || q.type === 'numeric') {
    return <input value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Your answer" aria-label="Your answer" className="input" style={{ marginTop: 8, maxWidth: 320, fontSize: 13.5, padding: '8px 12px' }} />;
  }
  if (q.type === 'match') {
    const rs = rights(q.pairs); const arr = Array.isArray(ua) ? ua : [];
    return <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>{q.pairs.map((p, pi) => (
      <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
        <span style={{ minWidth: 150 }}>{ROMAN[pi]}. {mathText(p.l)}</span>
        <select disabled={checked} value={arr[pi] == null ? '' : arr[pi]} onChange={(e) => { const next = [...arr]; next[pi] = Number(e.target.value); onAns(next); }} style={{ padding: '6px 9px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid ' + (checked ? (arr[pi] === rs.indexOf(p.r) ? 'var(--green)' : '#e24b4a') : 'var(--stroke-2)'), color: 'var(--text)', fontSize: 12.5 }}>
          <option value="">—</option>{rs.map((r, ri) => <option key={ri} value={ri}>{LETTER(ri)}) {r}</option>)}
        </select>
      </div>))}</div>;
  }
  if (q.type === 'case') { const ans = (ua && typeof ua === 'object' && !Array.isArray(ua)) ? ua : {}; return <div style={{ marginTop: 8, display: 'grid', gap: 12 }}>{(q.sub || []).map((sq, si) => <div key={si}><div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>({ROMAN[si]}) {mathText(sq.q)}</div><div style={{ display: 'grid', gap: 6 }}>{(sq.options || []).map((o, oi) => { const st = checked ? (oi === sq.answer ? 'correct' : (ans[si] === oi ? 'wrong' : '')) : ''; return <div key={oi}>{optBtn(<span>({LETTER(oi)}) {mathText(o)}</span>, ans[si] === oi, st, () => onAns({ ...ans, [si]: oi }))}</div>; })}</div>{checked && sq.explanation ? <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-3)' }}>{sq.explanation}</div> : null}</div>)}</div>; }
  return <textarea value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Write your answer (self-assessed)" aria-label="Your answer" className="input" style={{ marginTop: 8, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 13.5, padding: '9px 12px' }} />;
}
export function Feedback({ q, ua }) {
  if (q.type === 'case') return null;
  if (!isAuto(q)) return <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)', background: 'var(--glass-1)', borderLeft: '2px solid var(--violet)', padding: '8px 11px' }}><b style={{ fontWeight: 600 }}>Model answer:</b> {q.modelAnswer}{q.explanation ? ' — ' + q.explanation : ''}</div>;
  const ok = grade(q, ua) === true;
  return <div style={{ marginTop: 8, fontSize: 12.5, color: ok ? 'var(--green)' : '#ffb4b4' }}><b style={{ fontWeight: 600 }}>{ok ? '✓ Correct' : '✗ Correct answer:'}</b> {ok ? '' : correctText(q)}{q.explanation ? <span style={{ color: 'var(--text-3)' }}> — {q.explanation}</span> : null}</div>;
}

export function EditAnswerControl({ q, gi, onPatch }) {
  const sel = { padding: '5px 8px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') return <select value={q.answer} onChange={(e) => onPatch(gi, { answer: Number(e.target.value) })} style={{ ...sel, maxWidth: 340 }}>{q.options.map((o, oi) => <option key={oi} value={oi}>({LETTER(oi)}) {String(o).slice(0, 50)}</option>)}</select>;
  if (q.type === 'tf') return <select value={q.answer ? '1' : '0'} onChange={(e) => onPatch(gi, { answer: e.target.value === '1' })} style={sel}><option value="1">True</option><option value="0">False</option></select>;
  if (q.type === 'multi') return <span style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap' }}>{q.options.map((o, oi) => { const on = Array.isArray(q.answers) && q.answers.includes(oi); return <label key={oi} style={{ fontSize: 12.5, color: 'var(--text-2)' }}><input type="checkbox" checked={on} onChange={() => onPatch(gi, { answers: on ? q.answers.filter((x) => x !== oi) : [...(q.answers || []), oi] })} /> {LETTER(oi)}</label>; })}</span>;
  if (q.type === 'fill' || q.type === 'numeric') return <input value={q.answer || ''} onChange={(e) => onPatch(gi, { answer: e.target.value })} aria-label="Correct answer" className="input" style={{ minWidth: 180, fontSize: 12.5, padding: '6px 10px' }} />;
  if (q.type === 'short' || q.type === 'long') return <input value={q.modelAnswer || ''} onChange={(e) => onPatch(gi, { modelAnswer: e.target.value })} aria-label="Model answer" className="input" style={{ minWidth: 300, fontSize: 12.5, padding: '6px 10px' }} />;
  if (q.type === 'case') return <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>{(q.sub || []).map((sq, si) => <label key={si} style={{ fontSize: 12, color: 'var(--text-2)' }}>{ROMAN[si]}: <select value={sq.answer} onChange={(e) => onPatch(gi, { sub: q.sub.map((x, j) => j === si ? { ...x, answer: Number(e.target.value) } : x) })} style={sel}>{(sq.options || []).map((o, oi) => <option key={oi} value={oi}>{LETTER(oi)}</option>)}</select></label>)}</span>;
  return <span style={{ fontSize: 12, color: 'var(--text-3)' }}>(not editable)</span>;
}

export function OMRSheet({ paper }) {
  const qs = (paper.sections || []).flatMap((s) => s.questions);
  const circle = (lbl) => <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 17, height: 17, borderRadius: '50%', border: '1px solid #333', fontSize: 9, marginRight: 5 }}>{lbl}</span>;
  const cell = (label, opts, key) => (<div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 0', fontSize: 12, breakInside: 'avoid' }}><span style={{ minWidth: 30, fontWeight: 600 }}>{label}</span>{opts ? opts.map((o) => <span key={o}>{circle(o)}</span>) : <span style={{ borderBottom: '1px solid #999', flex: 1, minWidth: 90 }}>&nbsp;</span>}</div>);
  const rows = [];
  qs.forEach((q, i) => {
    const n = i + 1;
    if (q.type === 'case') { (Array.isArray(q.sub) ? q.sub : []).forEach((sq, si) => { const o = (sq.options || []).map((_, j) => String.fromCharCode(65 + j)); rows.push(cell(n + '(' + ROMAN[si] + ')', o.length ? o : ['A', 'B', 'C', 'D'], n + '-' + si)); }); return; }
    let opts = null;
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion' || q.type === 'multi') opts = q.options.map((_, j) => String.fromCharCode(65 + j));
    else if (q.type === 'tf') opts = ['T', 'F'];
    rows.push(cell(n + '.', opts, String(n)));
  });
  return (
    <div>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 10, marginBottom: 12 }}>
        {paper.logo ? <img src={paper.logo} alt="" style={{ maxHeight: 54, maxWidth: 200, margin: '0 auto 6px', display: 'block', objectFit: 'contain' }} /> : null}{paper.institution ? <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{paper.institution}</div> : null}
        <div style={{ fontSize: 18, fontWeight: 700 }}>{paper.title} &mdash; OMR answer sheet</div>
        {paper.examStyle ? <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>{paper.examStyle}</div> : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, fontSize: 12, flexWrap: 'wrap' }}>
        <span>Name: ____________________________</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Roll no.<span style={{ display: 'inline-flex', gap: 3 }}>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 16, height: 20, border: '1px solid #999', borderRadius: 2, display: 'inline-block' }} />)}</span></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>{rows}</div>
      <div style={{ fontSize: 10.5, color: '#888', marginTop: 14 }}>Fill one bubble completely per question with blue/black ballpoint. Write-in lines are for fill / numeric / short-answer items.</div>
    </div>
  );
}
