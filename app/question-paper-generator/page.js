'use client';
import AppNav from '../_components/AppNav';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toGIFT, toMoodleXML, toCSV, downloadText, slug } from './exporters';
import { grade, correctText } from './grade.js';
import { deriveSets } from './sets.js';
import { CATEGORIES } from '@/lib/blueprints';
import { LANGUAGES } from '@/lib/languages';

const TYPE_LABELS = { mcq: 'Multiple choice', multi: 'Multi-select', tf: 'True / false', fill: 'Fill the blank', match: 'Match', assertion: 'Assertion–reason', numeric: 'Numeric', short: 'Short answer', long: 'Long answer', case: 'Case study', code: 'Code output' };
const ALL_TYPES = Object.keys(TYPE_LABELS);
const LETTER = (i) => String.fromCharCode(97 + i);
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
const LANG_NAME = { ta: 'Tamil', hi: 'Hindi' };
const rights = (pairs) => [...pairs.map((p) => p.r)].sort((a, b) => String(a).localeCompare(String(b)));
const AUTO = ['mcq', 'code', 'assertion', 'tf', 'multi', 'fill', 'numeric', 'match'];
const isAuto = (q) => AUTO.includes(q.type);
const norm = (x) => String(x == null ? '' : x).trim().toLowerCase().replace(/\s+/g, ' ');
const normFill = (x) => norm(x).replace(/^(?:a|an|the)\s+/, '').replace(/[.,;:!?]+$/, '');
const clampInt = (v, min, max) => { const n = Math.round(Number(v)); if (!Number.isFinite(n)) return min; return Math.max(min, Math.min(max, n)); };
const clampHalf = (v, min, max) => { const n = Math.round(Number(v) * 2) / 2; if (!Number.isFinite(n)) return min; return Math.max(min, Math.min(max, n)); };

function renderBody(q) {
  const opts = (list) => (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', marginTop: 8 }}>{list.map((o, oi) => <div key={oi} style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>({LETTER(oi)}) {o}</div>)}</div>);
  const qt = q.type === 'code' ? <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: '#f3f3f6', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: '2px 0 0' }}>{q.q}</pre> : <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</span>;
  switch (q.type) {
    case 'mcq': case 'code': return <>{qt}{opts(q.options)}</>;
    case 'multi': return <>{qt}<div style={{ fontSize: 11.5, color: '#777', marginTop: 3 }}>(select all that apply)</div>{opts(q.options)}</>;
    case 'tf': return <>{qt}<div style={{ marginTop: 6, fontSize: 13, color: '#555' }}>( True / False )</div></>;
    case 'fill': return qt;
    case 'numeric': return <>{qt}<div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>Answer: ____________ {q.unit}</div></>;
    case 'assertion': return <><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {q.assertion}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {q.reason}</div>{opts(q.options)}</>;
    case 'match': { const rs = rights(q.pairs); return <>{qt}<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px', marginTop: 8, fontSize: 13.5 }}><div>{q.pairs.map((p, pi) => <div key={pi}>{ROMAN[pi]}. {p.l}</div>)}</div><div>{rs.map((r, ri) => <div key={ri}>({LETTER(ri)}) {r}</div>)}</div></div></>; }
    case 'short': return <>{qt}<div style={{ marginTop: 8, height: 40, borderBottom: '1px solid #ccc' }}></div></>;
    case 'long': return <>{qt}<div style={{ marginTop: 8, height: 84, borderBottom: '1px solid #ccc' }}></div></>;
    case 'case': return <>{qt}<div style={{ marginTop: 4 }}>{(q.sub || []).map((sq, si) => <div key={si} style={{ marginTop: si ? 10 : 6 }}><div style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>({ROMAN[si]}) {sq.q}</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', marginTop: 4 }}>{(sq.options || []).map((o, oi) => <div key={oi} style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>({LETTER(oi)}) {o}</div>)}</div></div>)}</div></>;
    default: return qt;
  }
}

function PaperView({ paper, layout, includeKey }) {
  const compact = layout === 'compact';
  const official = layout === 'official';
  const qFont = compact ? 12.5 : 14;
  const secName = (sec, si) => sec.title || ('Section ' + String.fromCharCode(65 + si));
  const header = official ? (
    <div style={{ border: '1.5px solid #111', borderRadius: 6, marginBottom: 14 }}>
      <div style={{ textAlign: 'center', padding: '10px 14px 8px' }}>
        {paper.institution ? <div style={{ fontSize: 11.5, letterSpacing: '0.12em', color: '#444' }}>{paper.institution}</div> : null}
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
      {paper.institution ? <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{paper.institution}</div> : null}
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
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', border: '1px solid #ccc', borderRadius: 4, padding: '4px 10px', margin: '12px 0 10px', background: '#f3f3f6', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}><span style={{ fontSize: 14, fontWeight: 700 }}>{secName(sec, si)}</span><span style={{ fontSize: 11.5, color: '#666' }}>{sec.questions.length} × {sec.marks} = {sec.questions.length * sec.marks} marks</span></div>
      ) : (
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ddd', margin: compact ? '10px 0 6px' : '14px 0 10px', paddingBottom: 4 }}><span style={{ fontSize: compact ? 13 : 14.5, fontWeight: 700 }}>{secName(sec, si)}</span><span style={{ fontSize: 11.5, color: '#777' }}>{sec.questions.length} × {sec.marks} = {sec.questions.length * sec.marks} marks</span></div>
      )) : null}
      {sec.questions.map((q) => { n += 1; return (
        <div key={n} className="q-block" style={{ marginBottom: compact ? 9 : 16, fontSize: qFont, lineHeight: compact ? 1.4 : 1.55, display: 'flex', gap: 8 }}><span style={{ fontWeight: 600, flexShrink: 0 }}>{n}.</span><div style={{ flex: 1 }}>{renderBody(q)}</div>{official ? <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>[{sec.marks}]</span> : null}</div>
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
          {paper.sections.flatMap((sec) => sec.questions.map((q) => { k += 1; return <div key={k} className="key-item" style={{ fontSize: compact ? 12 : 13, lineHeight: 1.5, marginBottom: compact ? 5 : 7 }}><b style={{ fontWeight: 600 }}>{k}.</b> {correctText(q)}{q.explanation ? <span style={{ color: '#666' }}> — {q.explanation}</span> : null}{q.page ? <span style={{ color: '#888' }}> [source p.{q.page}]</span> : null}</div>; }))}
        </div>
      ) : null}
    </>
  );
}

function PromptStem({ q }) {
  if (q.type === 'code') return <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--glass-1)', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: '2px 0 0', color: 'var(--text)' }}>{q.q}</pre>;
  if (q.type === 'assertion') return <div><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {q.assertion}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {q.reason}</div></div>;
  if (q.type === 'match') return <span style={{ fontWeight: 600 }}>Match the following</span>;
  if (q.type === 'case') return <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</span>;
  return <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</span>;
}
function PracticeInput({ q, ua, checked, onAns }) {
  const optBtn = (label, active, state, onClick) => {
    let bg = 'var(--glass-1)', bd = 'var(--stroke-2)';
    if (state === 'correct') { bg = 'rgba(99,153,34,0.16)'; bd = 'var(--green)'; }
    else if (state === 'wrong') { bg = 'rgba(255,126,126,0.13)'; bd = '#e24b4a'; }
    else if (active) { bg = 'var(--glass-2)'; bd = 'var(--violet)'; }
    return <button type="button" disabled={checked} onClick={onClick} style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--r)', background: bg, border: '1px solid ' + bd, color: 'var(--text)', fontSize: 13.5, cursor: checked ? 'default' : 'pointer', width: '100%' }}>{label}</button>;
  };
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') {
    return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{q.options.map((o, oi) => { const st = checked ? (oi === q.answer ? 'correct' : (ua === oi ? 'wrong' : '')) : ''; return <div key={oi}>{optBtn(<span>({LETTER(oi)}) {o}</span>, ua === oi, st, () => onAns(oi))}</div>; })}</div>;
  }
  if (q.type === 'tf') {
    return <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{[true, false].map((v) => { const st = checked ? (q.answer === v ? 'correct' : (ua === v ? 'wrong' : '')) : ''; return <div key={String(v)} style={{ flex: 1 }}>{optBtn(v ? 'True' : 'False', ua === v, st, () => onAns(v))}</div>; })}</div>;
  }
  if (q.type === 'multi') {
    const arr = Array.isArray(ua) ? ua : [];
    return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{q.options.map((o, oi) => { const sel = arr.includes(oi); const st = checked ? (q.answers.includes(oi) ? 'correct' : (sel ? 'wrong' : '')) : ''; return <div key={oi}>{optBtn(<span>{sel ? '☑' : '☐'} ({LETTER(oi)}) {o}</span>, sel, st, () => onAns(sel ? arr.filter((x) => x !== oi) : [...arr, oi]))}</div>; })}</div>;
  }
  if (q.type === 'fill' || q.type === 'numeric') {
    return <input value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Your answer" aria-label="Your answer" className="input" style={{ marginTop: 8, maxWidth: 320, fontSize: 13.5, padding: '8px 12px' }} />;
  }
  if (q.type === 'match') {
    const rs = rights(q.pairs); const arr = Array.isArray(ua) ? ua : [];
    return <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>{q.pairs.map((p, pi) => (
      <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
        <span style={{ minWidth: 150 }}>{ROMAN[pi]}. {p.l}</span>
        <select disabled={checked} value={arr[pi] == null ? '' : arr[pi]} onChange={(e) => { const next = [...arr]; next[pi] = Number(e.target.value); onAns(next); }} style={{ padding: '6px 9px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid ' + (checked ? (arr[pi] === rs.indexOf(p.r) ? 'var(--green)' : '#e24b4a') : 'var(--stroke-2)'), color: 'var(--text)', fontSize: 12.5 }}>
          <option value="">—</option>{rs.map((r, ri) => <option key={ri} value={ri}>{LETTER(ri)}) {r}</option>)}
        </select>
      </div>))}</div>;
  }
  if (q.type === 'case') { const ans = (ua && typeof ua === 'object' && !Array.isArray(ua)) ? ua : {}; return <div style={{ marginTop: 8, display: 'grid', gap: 12 }}>{(q.sub || []).map((sq, si) => <div key={si}><div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>({ROMAN[si]}) {sq.q}</div><div style={{ display: 'grid', gap: 6 }}>{(sq.options || []).map((o, oi) => { const st = checked ? (oi === sq.answer ? 'correct' : (ans[si] === oi ? 'wrong' : '')) : ''; return <div key={oi}>{optBtn(<span>({LETTER(oi)}) {o}</span>, ans[si] === oi, st, () => onAns({ ...ans, [si]: oi }))}</div>; })}</div>{checked && sq.explanation ? <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-3)' }}>{sq.explanation}</div> : null}</div>)}</div>; }
  return <textarea value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Write your answer (self-assessed)" aria-label="Your answer" className="input" style={{ marginTop: 8, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 13.5, padding: '9px 12px' }} />;
}
function Feedback({ q, ua }) {
  if (q.type === 'case') return null;
  if (!isAuto(q)) return <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)', background: 'var(--glass-1)', borderLeft: '2px solid var(--violet)', padding: '8px 11px' }}><b style={{ fontWeight: 600 }}>Model answer:</b> {q.modelAnswer}{q.explanation ? ' — ' + q.explanation : ''}</div>;
  const ok = grade(q, ua) === true;
  return <div style={{ marginTop: 8, fontSize: 12.5, color: ok ? 'var(--green)' : '#ffb4b4' }}><b style={{ fontWeight: 600 }}>{ok ? '✓ Correct' : '✗ Correct answer:'}</b> {ok ? '' : correctText(q)}{q.explanation ? <span style={{ color: 'var(--text-3)' }}> — {q.explanation}</span> : null}</div>;
}

function EditAnswerControl({ q, gi, onPatch }) {
  const sel = { padding: '5px 8px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') return <select value={q.answer} onChange={(e) => onPatch(gi, { answer: Number(e.target.value) })} style={{ ...sel, maxWidth: 340 }}>{q.options.map((o, oi) => <option key={oi} value={oi}>({LETTER(oi)}) {String(o).slice(0, 50)}</option>)}</select>;
  if (q.type === 'tf') return <select value={q.answer ? '1' : '0'} onChange={(e) => onPatch(gi, { answer: e.target.value === '1' })} style={sel}><option value="1">True</option><option value="0">False</option></select>;
  if (q.type === 'multi') return <span style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap' }}>{q.options.map((o, oi) => { const on = Array.isArray(q.answers) && q.answers.includes(oi); return <label key={oi} style={{ fontSize: 12.5, color: 'var(--text-2)' }}><input type="checkbox" checked={on} onChange={() => onPatch(gi, { answers: on ? q.answers.filter((x) => x !== oi) : [...(q.answers || []), oi] })} /> {LETTER(oi)}</label>; })}</span>;
  if (q.type === 'fill' || q.type === 'numeric') return <input value={q.answer || ''} onChange={(e) => onPatch(gi, { answer: e.target.value })} aria-label="Correct answer" className="input" style={{ minWidth: 180, fontSize: 12.5, padding: '6px 10px' }} />;
  if (q.type === 'short' || q.type === 'long') return <input value={q.modelAnswer || ''} onChange={(e) => onPatch(gi, { modelAnswer: e.target.value })} aria-label="Model answer" className="input" style={{ minWidth: 300, fontSize: 12.5, padding: '6px 10px' }} />;
  if (q.type === 'case') return <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>{(q.sub || []).map((sq, si) => <label key={si} style={{ fontSize: 12, color: 'var(--text-2)' }}>{ROMAN[si]}: <select value={sq.answer} onChange={(e) => onPatch(gi, { sub: q.sub.map((x, j) => j === si ? { ...x, answer: Number(e.target.value) } : x) })} style={sel}>{(sq.options || []).map((o, oi) => <option key={oi} value={oi}>{LETTER(oi)}</option>)}</select></label>)}</span>;
  return <span style={{ fontSize: 12, color: 'var(--text-3)' }}>(not editable)</span>;
}

function OMRSheet({ paper }) {
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
        {paper.institution ? <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{paper.institution}</div> : null}
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

export default function PapersPage() {
  const [bpKey, setBpKey] = useState('custom'); // selected exam-blueprint dropdown value ('custom' = define your own sections)
  const [asideOpen, setAsideOpen] = useState(true); // left papers panel collapse toggle
  const [fullSize, setFullSize] = useState(false); // "Full real-size exam" toggle (batched generation)
  const [fullConfirm, setFullConfirm] = useState(false); // showing the full-size confirm panel
  const [fullProg, setFullProg] = useState(''); // batch progress text during full generation
  const [uploading, setUploading] = useState(false); // direct PDF upload in progress
  const [uploadMsg, setUploadMsg] = useState(''); // upload status message
  const [srcOpen, setSrcOpen] = useState(false); // content-source picker open
  const [srcQuery, setSrcQuery] = useState(''); // source search text
  const [srcLoading, setSrcLoading] = useState(false); // source search in flight
  const [selectedDoc, setSelectedDoc] = useState(null); // chosen source doc (for the chip)
  const [bpTopic, setBpTopic] = useState(''); // blueprint's built-in syllabus (drives generation; kept out of the user Scope field)
  const [srcActive, setSrcActive] = useState(0); // keyboard-highlighted row in the source picker (0 = From scratch)
  const [printAll, setPrintAll] = useState(false); // render all shuffled sets for one print job
  const [omr, setOmr] = useState(false); // show/print a bubble OMR answer sheet
  const [examStyle, setExamStyle] = useState('');
  const [topic, setTopic] = useState('');
  const [institution, setInstitution] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sections, setSections] = useState([{ title: 'Section A', type: 'mcq', count: 10, marks: 1 }]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('en');
  const [includeKey, setIncludeKey] = useState(true);
  const [verify, setVerify] = useState(true);
  const [prevStems, setPrevStems] = useState([]);
  const [docs, setDocs] = useState([]);
  const [sourceDocId, setSourceDocId] = useState(0);
  const [library, setLibrary] = useState([]);
  const [savedMsg, setSavedMsg] = useState('');
  const [shares, setShares] = useState([]);
  const [shareMsg, setShareMsg] = useState('');
  const [attemptsFor, setAttemptsFor] = useState(null);
  const [attemptList, setAttemptList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [paper, setPaper] = useState(null);
  const [used, setUsed] = useState(null);
  const [credits, setCredits] = useState(null);
  const [note, setNote] = useState('');
  const [view, setView] = useState('paper');
  const [layout, setLayout] = useState('official');
  const [sets, setSets] = useState(1); // number of shuffled sets to produce (1 = off)
  const [curSet, setCurSet] = useState(0); // index of the set currently shown/printed
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [editAns, setEditAns] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds since generation started (progress feedback)
  const [shortWarn, setShortWarn] = useState(''); // set when fewer questions came back than requested
  const abortRef = useRef(null); // in-flight AbortController so Cancel can abort
  const timerRef = useRef(null); // setInterval id for the elapsed counter
  const headingRef = useRef(null); // result heading, focused when a paper first appears
  const fileRef = useRef(null); // hidden file input for direct PDF upload
  const srcBoxRef = useRef(null); // source picker container (click-outside)

  useEffect(() => { try { const d = Number(new URLSearchParams(window.location.search).get('doc')) || 0; if (d) { setSourceDocId(d); fetch('/api/documents/' + d).then((r) => r.ok ? r.json() : null).then((j) => { if (j && j.document) setSelectedDoc({ id: j.document.id, filename: j.document.filename, pageCount: j.document.pageCount, sizeBytes: j.document.sizeBytes }); }).catch(() => {}); } } catch (e) {} }, []);
  useEffect(() => { fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    loadLibrary(); loadShares(); try { const pid = Number(new URLSearchParams(window.location.search).get('paper')) || 0; if (pid) openPaper(pid); } catch (e) {} }, []);
  useEffect(() => {
    if (!srcOpen) return; let live = true; setSrcLoading(true);
    const t = setTimeout(() => { const q = srcQuery.trim(); fetch('/api/documents?limit=30' + (q ? '&q=' + encodeURIComponent(q) : '')).then((r) => r.ok ? r.json() : null).then((j) => { if (!live) return; const list = (j && Array.isArray(j.documents)) ? j.documents : []; const seen = new Set(); const uniq = list.filter((d) => d.status === 'ready').filter((d) => { const k = (d.filename || '') + '|' + (d.sizeBytes || 0); if (seen.has(k)) return false; seen.add(k); return true; }); setDocs(uniq); setSrcActive(0); setSrcLoading(false); }).catch(() => { if (live) { setDocs([]); setSrcLoading(false); } }); }, 220);
    return () => { live = false; clearTimeout(t); };
  }, [srcQuery, srcOpen]);
  useEffect(() => { if (!srcOpen) return; function onDown(e) { if (srcBoxRef.current && !srcBoxRef.current.contains(e.target)) setSrcOpen(false); } document.addEventListener('mousedown', onDown); return () => document.removeEventListener('mousedown', onDown); }, [srcOpen]);

  function applyPreset(p) { setExamStyle(p.examStyle); setBpTopic(p.topic); setSections(p.sections.map((s) => ({ ...s }))); }
  function chooseBlueprint(v) { setBpKey(v); setTopic(''); setFullSize(false); setFullConfirm(false); if (!v || v === 'custom') { setExamStyle(''); setBpTopic(''); setSections([{ title: 'Section A', type: 'mcq', count: 10, marks: 1 }]); return; } const ck = v.split('||')[0]; const lbl = v.slice(ck.length + 2); const c = CATEGORIES.find((x) => x.k === ck); const p = c && c.presets.find((x) => x.label === lbl); if (p) { applyPreset(p); } }
  function selectSource(doc) { if (!doc) { setSelectedDoc(null); setSourceDocId(0); } else { setSelectedDoc({ id: doc.id, filename: doc.filename, pageCount: doc.pageCount, sizeBytes: doc.sizeBytes }); setSourceDocId(Number(doc.id)); } setSrcOpen(false); setSrcQuery(''); }
  function srcKey(e) { const max = docs.length; if (e.key === 'Escape') { setSrcOpen(false); } else if (e.key === 'ArrowDown') { e.preventDefault(); setSrcActive((a) => Math.min(a + 1, max)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setSrcActive((a) => Math.max(a - 1, 0)); } else if (e.key === 'Enter') { e.preventDefault(); if (srcActive === 0) selectSource(null); else if (docs[srcActive - 1]) selectSource(docs[srcActive - 1]); } }
  function printAllSets() { if (setsArr.length <= 1) { window.print(); return; } setPrintAll(true); setTimeout(() => { window.print(); setTimeout(() => setPrintAll(false), 250); }, 150); }
  async function uploadSource(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { setUploadMsg('Please choose a PDF file.'); return; }
    if (file.size > 50 * 1024 * 1024) { setUploadMsg('That PDF is over the 50 MB limit.'); return; }
    setUploading(true); setUploadMsg('Uploading & reading \u201c' + file.name + '\u201d \u2014 this can take a moment\u2026');
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch('/api/documents/upload', { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
      if (r.status === 409 && j.duplicate && j.existingId) { selectSource({ id: j.existingId, filename: j.filename || file.name }); setUploadMsg('Already in your library \u2014 selected it as the source.'); setUploading(false); return; }
      if (!r.ok) { setUploadMsg(r.status === 403 ? 'Please verify your email before uploading.' : (j.error || 'Upload failed.')); setUploading(false); return; }
      const id = j.document && j.document.id;
      selectSource(j.document || { id, filename: file.name });
      setUploadMsg('Added \u201c' + ((j.document && j.document.filename) || file.name) + '\u201d \u2014 now grounding from it.');
      setUploading(false);
    } catch (e) { setUploadMsg('Upload failed: ' + (e.message || 'error')); setUploading(false); }
  }
  function setSec(i, patch) { setSections((cur) => cur.map((s, j) => j === i ? { ...s, ...patch } : s)); }
  function addSec() { setSections((cur) => [...cur, { title: 'Section ' + String.fromCharCode(65 + cur.length), type: 'mcq', count: 5, marks: 1 }]); }
  function delSec(i) { setSections((cur) => cur.length > 1 ? cur.filter((_, j) => j !== i) : cur); }
  function loadLibrary() { fetch('/api/papers/library').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.papers)) setLibrary(j.papers); }).catch(() => {}); }
  async function savePaper() { if (!paper) return; setSavedMsg('Saving\u2026'); try { const r = await fetch('/api/papers/library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setSavedMsg('Saved to library'); loadLibrary(); setTimeout(() => setSavedMsg(''), 2200); } else setSavedMsg(j.error || 'Save failed'); } catch (e) { setSavedMsg(e.message); } }
  async function openPaper(id) { try { const r = await fetch('/api/papers/library?id=' + id); const j = await r.json().catch(() => ({})); if (r.ok && j.paper) { setPaper(j.paper); setCurSet(0); setLayout(j.paper.layout || 'official'); setView('paper'); setChecked(false); setAnswers({}); setUsed(null); setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); } } catch (e) {} }
  async function delPaper(id) { try { await fetch('/api/papers/library?id=' + id, { method: 'DELETE' }); loadLibrary(); } catch (e) {} }
  function loadShares() { fetch('/api/papers/assignments').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.assignments)) setShares(j.assignments); }).catch(() => {}); }
  async function shareTest() { if (!paper) return; setShareMsg('Creating link\u2026'); try { const r = await fetch('/api/papers/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper }) }); const j = await r.json().catch(() => ({})); if (r.ok && j.token) { const url = window.location.origin + '/t/' + j.token; try { await navigator.clipboard.writeText(url); setShareMsg('Link copied \u2014 ' + url); } catch (e2) { setShareMsg('Share link: ' + url); } loadShares(); } else setShareMsg(j.error || 'Could not create link'); } catch (e) { setShareMsg(e.message); } }
  async function delShare(id) { try { await fetch('/api/papers/assignments?id=' + id, { method: 'DELETE' }); loadShares(); } catch (e) {} }
  async function viewAttempts(id) { if (attemptsFor === id) { setAttemptsFor(null); return; } try { const r = await fetch('/api/papers/assignments?id=' + id); const j = await r.json().catch(() => ({})); if (r.ok && Array.isArray(j.attempts)) { setAttemptList(j.attempts); setAttemptsFor(id); } } catch (e) {} }
  function patchQ(gi, patch) { setPaper((pp) => { if (!pp) return pp; let n = -1; return { ...pp, sections: pp.sections.map((s) => ({ ...s, questions: s.questions.map((q) => { n += 1; return n === gi ? { ...q, ...patch } : q; }) })) }; }); }
  const totalQ = sections.reduce((n, s) => n + Number(s.count || 0), 0);
  const totalMarks = sections.reduce((m, s) => m + Number(s.count || 0) * Number(s.marks || 1), 0);
  const flat = paper ? paper.sections.flatMap((s) => s.questions) : [];
  const autoTotal = flat.reduce((n, q) => n + (q.type === 'case' ? (Array.isArray(q.sub) ? q.sub.length : 0) : (isAuto(q) ? 1 : 0)), 0);
  const correctN = checked ? flat.reduce((n, q, gi) => { if (q.type === 'case') { const ua = answers[gi] || {}; return n + (q.sub || []).reduce((m, sq, si) => m + (ua[si] === sq.answer ? 1 : 0), 0); } return n + ((isAuto(q) && grade(q, answers[gi]) === true) ? 1 : 0); }, 0) : 0;
  const writtenN = flat.filter((q) => !isAuto(q) && q.type !== 'case').length;

  function stopTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }
  function cancelGenerate() {
    if (abortRef.current) { try { abortRef.current.abort(); } catch (e) {} }
  }
  async function generate() {
    const eff = (topic.trim() || bpTopic || '').trim();
    if (eff.length < 3 && !sourceDocId) { setNote('Describe a topic, pick a blueprint, or attach a PDF.'); return; }
    if (typeof credits === 'number' && credits < 1) { setNote("You're out of credits — buy a pack to generate."); return; }
    const requested = sections.reduce((nn, s) => nn + Number(s.count || 0), 0);
    // A single AI call is capped at ~40 questions server-side; bigger papers (custom or blueprint) go through the batched generator.
    if (requested > 40) { setFullConfirm(false); return runBatched(sections.map((s) => ({ title: s.title, type: s.type, count: Number(s.count), marks: Number(s.marks) })), examStyle || 'Custom paper', verify, eff); }
    cancelGenerate();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => { try { controller.abort(); } catch (e) {} }, 90000);
    stopTimer(); setElapsed(0); timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    setBusy(true); setNote(''); setShortWarn(''); setPaper(null); setUsed(null); setAnswers({}); setChecked(false); setView('paper');
    try {
      const r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ topic: eff, examStyle, level, difficulty, language, institution, instructions, sections: sections.map((s) => ({ title: s.title, types: [s.type], count: Number(s.count), marks: Number(s.marks) })), nonce: Math.random().toString(36).slice(2), exclude: prevStems, verify, documentId: sourceDocId }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
        if (r.status === 403) setNote('Please verify your email (check your inbox) before generating.');
        else if (r.status === 402) setNote('You are out of credits.');
        else setNote(j.error || 'Generation failed');
        setBusy(false); return;
      }
      const master = { ...j.paper, layout };
      setPaper(master); setUsed(j.credits); setCurSet(0);
      // Short-paper warning: the model sometimes returns fewer questions than requested.
      const got = ((j.paper && Array.isArray(j.paper.sections)) ? j.paper.sections : []).reduce((nn, s) => nn + ((s && Array.isArray(s.questions)) ? s.questions.length : 0), 0);
      if (requested && got < requested) setShortWarn('Generated ' + got + ' of ' + requested + ' questions — the model returned fewer for some sections. Try Regenerate or simpler sections.');
      if (Array.isArray(j.stems)) setPrevStems((prev) => [...prev, ...j.stems].slice(-80));
      if (typeof j.balance === 'number') setCredits(j.balance);
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (headingRef.current) { try { headingRef.current.focus(); } catch (e) {} } }, 60);
    } catch (e) {
      if (e && e.name === 'AbortError') setNote('Generation cancelled.');
      else setNote(e.message);
      setBusy(false);
    } finally {
      clearTimeout(timeout);
      stopTimer();
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  const ctrl = { padding: '7px 10px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  const isBP = Boolean(bpKey && bpKey !== 'custom');
  const bpLabel = isBP ? bpKey.slice(bpKey.split('||')[0].length + 2) : '';
  const _bpPreset = isBP ? (CATEGORIES.find((x) => x.k === bpKey.split('||')[0]) || { presets: [] }).presets.find((p) => (bpKey.split('||')[0] + '||' + p.label) === bpKey) : null;
  const bpReal = (_bpPreset && _bpPreset.real) ? _bpPreset.real : '';
  const bpFull = (_bpPreset && Array.isArray(_bpPreset.full)) ? _bpPreset.full : null;
  const fullTotalQ = bpFull ? bpFull.reduce((a, s) => a + Number(s.count || 0), 0) : 0;
  const fullBatches = bpFull ? bpFull.reduce((a, s) => a + Math.ceil(Number(s.count || 0) / 30), 0) : 0;
  const isFullRO = Boolean(fullSize && bpFull);
  const dispTotalMarks = isFullRO ? bpFull.reduce((m, s) => m + Number(s.count || 0) * Number(s.marks || 1), 0) : totalMarks;
  const hasScope = topic.trim().length > 0;
  const fromPDF = Number(sourceDocId) > 0;
  const canGen = Boolean(isBP || fromPDF || hasScope);
  const _sc = topic.trim();
  const _scShort = _sc.length > 44 ? _sc.slice(0, 44) + '…' : _sc;
  const genExplain = !canGen
    ? 'Pick an exam blueprint, attach a PDF, or describe a topic in Scope to begin.'
    : isBP
      ? ('Will build a ' + bpLabel + ' paper' + (fromPDF ? ', grounded in your PDF (answers cite the page)' : '') + '.')
      : (fromPDF
        ? ('Will build your sections, grounded in your PDF' + (hasScope ? ' on “' + _scShort + '”' : '') + '.')
        : ('Will build your sections on “' + _scShort + '”.'));
  // The set shown in the preview/print + driving the exporters. Falls back to the master.
  const setsArr = useMemo(() => (paper ? (sets > 1 ? deriveSets(paper, sets) : [paper]) : []), [paper, sets]);
  const activePaper = setsArr[curSet] || paper;
  async function runBatched(sectionList, label, verifyFlag, effTopic) {
    const MAXCHUNK = 30;
    const plan = [];
    sectionList.forEach((s, si) => { let rem = Number(s.count || 0); const type = (Array.isArray(s.types) ? s.types[0] : s.type) || 'mcq'; while (rem > 0) { const n = Math.min(MAXCHUNK, rem); plan.push({ si, title: s.title, type, marks: Number(s.marks || 1), count: n }); rem -= n; } });
    const wantTotal = sectionList.reduce((a, s) => a + Number(s.count || 0), 0);
    if (typeof credits === 'number' && credits < 1) { setNote("You're out of credits — buy a pack to generate."); return; }
    cancelGenerate();
    const controller = new AbortController(); abortRef.current = controller;
    stopTimer(); setElapsed(0); timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    setBusy(true); setNote(''); setShortWarn(''); setPaper(null); setUsed(null); setAnswers({}); setChecked(false); setView('paper'); setCurSet(0);
    const acc = sectionList.map(() => []); const seen = [...prevStems]; let used = 0; let bal = null; let failed = 0; let stopped = false; let allVerified = !!verifyFlag;
    try {
      for (let b = 0; b < plan.length; b++) {
        if (controller.signal.aborted) { stopped = true; break; }
        const pp = plan[b];
        setFullProg('Batch ' + (b + 1) + ' of ' + plan.length + ' \u2014 ' + pp.title);
        const body = { topic: effTopic, examStyle, level, difficulty, language, institution, instructions, sections: [{ title: pp.title, types: [pp.type], count: pp.count, marks: pp.marks }], nonce: Math.random().toString(36).slice(2), exclude: seen.slice(-80), verify: !!verifyFlag, documentId: sourceDocId };
        let r, j;
        try { r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify(body) }); }
        catch (e) { if (e && e.name === 'AbortError') { stopped = true; break; } failed++; continue; }
        j = await r.json().catch(() => ({}));
        if (!r.ok) { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; } if (r.status === 402) { setNote('Ran out of credits after ' + b + ' of ' + plan.length + ' batches.'); break; } failed++; continue; }
        const qs = (j.paper && Array.isArray(j.paper.sections) && j.paper.sections[0] && Array.isArray(j.paper.sections[0].questions)) ? j.paper.sections[0].questions : [];
        acc[pp.si] = acc[pp.si].concat(qs);
        qs.forEach((q) => seen.push(String((q && (q.q || q.assertion)) || '').slice(0, 140)));
        if (typeof j.credits === 'number') used += j.credits;
        if (typeof j.balance === 'number') bal = j.balance;
        if (verifyFlag && !(j.paper && j.paper.verified)) allVerified = false;
      }
      const finalSections = sectionList.map((s, i) => ({ title: s.title, marks: Number(s.marks || 1), questions: acc[i] }));
      const got = finalSections.reduce((a, s) => a + s.questions.length, 0);
      if (got === 0) { setNote(stopped ? 'Generation cancelled.' : 'Could not generate the paper — please try again.'); setBusy(false); stopTimer(); setFullProg(''); if (abortRef.current === controller) abortRef.current = null; return; }
      const tMarks = finalSections.reduce((m, s) => m + s.questions.length * Number(s.marks || 1), 0);
      const paperObj = { title: ((label || 'Full') + ' \u2014 full paper'), examStyle, language, difficulty, institution, instructions, totalMarks: tMarks, durationMin: Math.max(15, Math.round(got * 1.5)), sections: finalSections, verified: (verifyFlag && allVerified), grounded: Number(sourceDocId) > 0, sourceName: (selectedDoc && selectedDoc.filename) || '', layout };
      setPaper(paperObj); setUsed(used); if (bal != null) setCredits(bal);
      setPrevStems(seen.slice(-80));
      if (got < wantTotal) setShortWarn('Built ' + got + ' of ' + wantTotal + ' questions' + (failed ? ' (' + failed + ' batch(es) failed)' : (stopped ? ' (stopped)' : '')) + '. Regenerate to fill the gaps.');
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    } catch (e) { setNote(e.message); setBusy(false); }
    finally { stopTimer(); setFullProg(''); if (abortRef.current === controller) abortRef.current = null; }
  }
  function generateFull() { if (!bpFull) { generate(); return; } return runBatched(bpFull, bpLabel, verify, (topic.trim() || bpTopic)); }

  return (
    <div id="papers-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppNav active="papers" credits={credits} />

      <div className="papers-body" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside className="no-print papers-aside" style={{ width: 248, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.6)', backdropFilter: 'blur(20px) saturate(180%)', display: asideOpen ? 'flex' : 'none', flexDirection: 'column', overflowY: 'auto', padding: '14px 12px' }}>
          <button type="button" onClick={() => setAsideOpen(false)} aria-label="Hide papers panel" title="Hide panel" data-testid="aside-hide" className="btn btn-glass btn-sm" style={{ alignSelf: 'flex-end', padding: '2px 9px', marginBottom: 8 }}>«</button>
          <button type="button" onClick={() => { setPaper(null); setUsed(null); setNote(''); setView('paper'); setEditAns(false); setCurSet(0); }} className="btn btn-iris btn-sm" data-testid="new-paper" style={{ width: '100%', marginBottom: 16 }}>+ New paper</button>
          <div className="eyebrow" style={{ marginBottom: 8 }}>My library{library.length ? ' (' + library.length + ')' : ''}</div>
          {library.length === 0 ? <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 18 }}>Saved papers appear here.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {library.map((lp) => (
                <div key={lp.id} className="glass" style={{ padding: '8px 10px', borderRadius: 'var(--r)' }} data-testid="lib-row">
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lp.title}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', margin: '2px 0 5px' }}>{lp.numQuestions} Qs{lp.examStyle ? ' · ' + lp.examStyle : ''}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => openPaper(lp.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 9px' }} data-testid="lib-open">Open</button>
                    <button onClick={() => delPaper(lp.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Delete saved paper">{'✕'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="eyebrow" style={{ marginBottom: 8 }}>Shared tests{shares.length ? ' (' + shares.length + ')' : ''}</div>
          {shares.length === 0 ? <div style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Share a paper as a test to see it here.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {shares.map((sh) => (
                <div key={sh.id} className="glass" style={{ padding: '8px 10px', borderRadius: 'var(--r)' }} data-testid="share-row">
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sh.title}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', margin: '2px 0 5px' }}>{sh.attempts} attempts{sh.attempts ? ' · avg ' + sh.avgPct + '%' : ''}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <a href={'/t/' + sh.token} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 9px' }}>Open</a>
                    <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.origin + '/t/' + sh.token); }} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }}>Copy</button>
                    {sh.attempts > 0 && <button onClick={() => viewAttempts(sh.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} data-testid="view-attempts">{attemptsFor === sh.id ? 'Hide' : 'Scores'}</button>}
                    <button onClick={() => delShare(sh.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Delete shared test">{'✕'}</button>
                  </div>
                  {attemptsFor === sh.id && (<div style={{ marginTop: 6, borderTop: '1px solid var(--stroke-1)', paddingTop: 6 }}>{attemptList.length === 0 ? <div style={{ fontSize: 11, color: 'var(--text-3)' }}>No attempts yet.</div> : attemptList.map((a) => <div key={a.id} style={{ display: 'flex', gap: 8, fontSize: 11, padding: '2px 0' }}><span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || 'Anonymous'}</span><span style={{ fontWeight: 600 }}>{a.score}/{a.total}</span></div>)}</div>)}
                </div>
              ))}
            </div>
          )}
        </aside>

        <div id="main" className="papers-main" style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          <section className="no-print papers-build" style={{ width: asideOpen ? 472 : 660, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', overflowY: 'auto', padding: '18px 20px', background: 'rgba(5,6,20,0.35)' }}>
            {!asideOpen && <button type="button" onClick={() => setAsideOpen(true)} aria-label="Show papers panel" title="Show library & papers" data-testid="aside-show" className="btn btn-glass btn-sm" style={{ marginBottom: 12, padding: '3px 10px' }}>» Library &amp; papers</button>}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Structure &mdash; exam blueprint</div>
            <select value={bpKey} onChange={(e) => chooseBlueprint(e.target.value)} aria-label="Exam blueprint" data-testid="blueprint" style={{ ...ctrl, width: '100%', padding: '9px 11px', fontSize: 13 }}>
              <option value="custom">Custom paper &mdash; define your own sections</option>
              {CATEGORIES.filter((c) => c.presets && c.presets.length > 0).map((c) => (
                <optgroup key={c.k} label={c.label}>
                  {c.presets.map((p) => <option key={c.k + '||' + p.label} value={c.k + '||' + p.label}>{p.label}</option>)}
                </optgroup>
              ))}
            </select>
            <div data-testid="bp-note" style={{ fontSize: 11.5, marginTop: 7, marginBottom: bpReal ? 3 : 16, color: isBP ? 'var(--green)' : 'var(--text-3)' }}>{isBP ? '✓ blueprint-aligned — sections, marks & weights' : '✎ custom — you define the sections below'}</div>
            {bpReal ? <div data-testid="bp-real" style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 16 }}>Real exam: {bpReal} · builds a focused set you can scale up.</div> : null}
            {bpFull ? <label data-testid="full-toggle" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)', margin: '-6px 0 16px', cursor: 'pointer' }}><input type="checkbox" checked={fullSize} onChange={(e) => { setFullSize(e.target.checked); setFullConfirm(false); }} /> Full real-size exam — {fullTotalQ} questions, in {fullBatches} batches{fullSize ? ' (uses more credits)' : ''}</label> : null}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Content source</div>
            <div ref={srcBoxRef} style={{ position: 'relative' }}>
              <button type="button" onClick={() => setSrcOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={srcOpen} data-testid="source-trigger" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid ' + (srcOpen ? 'var(--violet)' : 'var(--stroke-2)'), color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                {selectedDoc ? (<><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Grounded in: {selectedDoc.filename}{selectedDoc.pageCount ? ' (' + selectedDoc.pageCount + ' pp)' : ''}</span><span role="button" tabIndex={0} aria-label="Clear source" data-testid="source-clear" onClick={(e) => { e.stopPropagation(); selectSource(null); }} style={{ color: 'var(--text-3)', padding: '0 4px' }}>✕</span></>) : (<span style={{ flex: 1, color: 'var(--text-3)' }}>From scratch (topic / blueprint only)</span>)}
                <span style={{ color: 'var(--text-3)' }}>{srcOpen ? '▴' : '▾'}</span>
              </button>
              {srcOpen ? (
                <div data-testid="source-panel" style={{ marginTop: 6, background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <input autoFocus value={srcQuery} onChange={(e) => setSrcQuery(e.target.value)} placeholder="Search your PDFs…" aria-label="Search your PDFs" data-testid="source-search" onKeyDown={srcKey} style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: '1px solid var(--stroke-1)', background: 'transparent', color: 'var(--text)', fontSize: 13, padding: '10px 11px', fontFamily: 'inherit', outline: 'none' }} />
                  <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                    <button type="button" onClick={() => selectSource(null)} data-testid="source-scratch" style={{ width: '100%', textAlign: 'left', display: 'block', padding: '9px 11px', background: srcActive === 0 ? 'var(--glass-2)' : 'transparent', border: 'none', borderBottom: '1px solid var(--stroke-1)', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>From scratch (topic / blueprint only)</button>
                    {srcLoading ? (<div style={{ padding: '10px 11px', fontSize: 12, color: 'var(--text-4)' }}>Searching…</div>) : (docs.length === 0 ? (<div style={{ padding: '10px 11px', fontSize: 12, color: 'var(--text-4)' }}>{srcQuery.trim() ? 'No PDFs match.' : 'No PDFs yet — upload one below.'}</div>) : docs.map((d, i) => (
                      <button key={d.id} type="button" onClick={() => selectSource(d)} data-testid="source-item" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: srcActive === i + 1 ? 'var(--glass-2)' : (Number(sourceDocId) === Number(d.id) ? 'var(--glass-1)' : 'transparent'), border: 'none', borderBottom: '1px solid var(--stroke-1)', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</span>{d.pageCount ? <span style={{ fontSize: 11, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{d.pageCount} pp</span> : null}</button>
                    )))}
                  </div>
                  <button type="button" onClick={() => { if (fileRef.current) fileRef.current.click(); }} disabled={uploading} data-testid="upload-pdf" style={{ width: '100%', textAlign: 'left', display: 'block', padding: '10px 11px', background: 'var(--glass-1)', border: 'none', borderTop: '1px solid var(--stroke-2)', color: 'var(--violet-2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{uploading ? 'Uploading…' : '↑ Upload a new PDF…'}</button>
                </div>
              ) : null}
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) uploadSource(f); }} style={{ display: 'none' }} data-testid="source-file" aria-hidden="true" tabIndex={-1} />
            </div>
            {uploadMsg ? <div data-testid="upload-msg" style={{ fontSize: 11.5, color: uploading ? 'var(--text-3)' : 'var(--text-2)', marginTop: 6 }}>{uploadMsg}</div> : null}
            {LANGUAGES.length > 1 && selectedDoc && (selectedDoc.lang === 'ta' || selectedDoc.lang === 'hi') && !(language === selectedDoc.lang || language === selectedDoc.lang + '-en') ? <div data-testid="lang-hint" style={{ fontSize: 11.5, marginTop: 6, color: 'var(--text-2)' }}>This PDF looks like {LANG_NAME[selectedDoc.lang]}. <button type="button" onClick={() => setLanguage(selectedDoc.lang)} data-testid="lang-hint-apply" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-2)', cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}>Generate in {LANG_NAME[selectedDoc.lang]}?</button></div> : null}
            <div style={{ fontSize: 11, color: 'var(--text-4)', margin: '10px 0 16px' }}>Structure + source combine &mdash; e.g. a CBSE blueprint grounded in your own PDF.</div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Scope (optional)</div>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="Narrow to a chapter or topic — leave blank to use the full blueprint or PDF" aria-label="Scope" className="input" data-testid="topic" style={{ width: '100%', resize: 'vertical', minHeight: 54, fontFamily: 'inherit', padding: '10px 13px' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institution / exam name (optional)" aria-label="Institution or exam name" className="input" style={{ flex: 1, minWidth: 170, fontSize: 12.5, padding: '8px 12px' }} />
              <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (optional)" aria-label="Instructions" className="input" style={{ flex: 1, minWidth: 170, fontSize: 12.5, padding: '8px 12px' }} />
            </div>
            <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Sections &mdash; {isFullRO ? fullTotalQ : totalQ} questions {'·'} {dispTotalMarks} marks{isFullRO ? ' · full real size' : ''}</div>
            {isFullRO ? (
              <div data-testid="full-sections">
                {bpFull.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 11px', background: 'var(--glass-1)', border: '1px solid var(--stroke-1)', borderRadius: 'var(--r)', marginBottom: 6 }} data-testid="section-row">
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{s.title}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{TYPE_LABELS[(Array.isArray(s.types) ? s.types[0] : s.type)] || 'Multiple choice'} {'·'} {s.count} {'×'} {s.marks}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>Real exam structure &mdash; built in {fullBatches} batches. Uncheck &ldquo;Full real-size&rdquo; above to edit sections.</div>
              </div>
            ) : (<>
              {sections.map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 7, padding: '8px 9px', background: 'var(--glass-1)', border: '1px solid var(--stroke-1)', borderRadius: 'var(--r)' }} data-testid="section-row">
                  <input value={s.title} onChange={(e) => setSec(i, { title: e.target.value })} placeholder="Section title" aria-label="Section title" className="input" style={{ width: '100%', boxSizing: 'border-box', fontSize: 12.5, padding: '7px 10px' }} />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <select value={s.type} onChange={(e) => setSec(i, { type: e.target.value })} aria-label="Question type" style={{ ...ctrl, flex: 1, minWidth: 0 }}>{ALL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select>
                    <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Qs <input type="number" min={1} max={30} value={s.count} onChange={(e) => setSec(i, { count: clampInt(e.target.value, 1, 30) })} aria-label="Questions in section" className="qpg-num" style={{ ...ctrl, width: 58 }} /></label>
                    <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Marks <input type="number" min={1} max={20} step={0.5} value={s.marks} onChange={(e) => setSec(i, { marks: clampHalf(e.target.value, 1, 20) })} aria-label="Marks per question" className="qpg-num" style={{ ...ctrl, width: 58 }} /></label>
                    <button type="button" onClick={() => delSec(i)} className="btn btn-glass btn-sm" style={{ padding: '5px 9px' }} aria-label="Remove section">{'✕'}</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSec} disabled={sections.length >= 8} className="btn btn-glass btn-sm" data-testid="add-section" style={{ marginTop: 2 }}>+ Add section</button>{sections.length >= 8 && <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>Up to 8 sections</span>}
            </>)}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty" style={ctrl}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Level<select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level" style={ctrl}><option value="">Any</option><option value="Beginner">Beginner</option><option value="School">School</option><option value="College">College</option><option value="Professional">Professional</option><option value="Expert">Expert</option></select></label>
            </div>
            {LANGUAGES.length > 1 ? (<>
            <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Language</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }} data-testid="lang-pills">{LANGUAGES.map((l) => <button key={l.code} type="button" onClick={() => setLanguage(l.code)} className="chip" aria-pressed={language === l.code} style={{ cursor: 'pointer', fontSize: 12, background: language === l.code ? 'rgba(183,106,255,0.16)' : 'transparent', color: language === l.code ? 'var(--text)' : 'var(--text-3)', borderColor: language === l.code ? 'var(--violet)' : 'var(--stroke-2)' }}>{l.label}</button>)}</div>
            </>) : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={includeKey} onChange={(e) => setIncludeKey(e.target.checked)} /> Include answer key</label>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="A second AI pass re-checks the answer key"><input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} /> Verify answers</label>
              <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }} title="Produce A/B/C… versions with questions and options shuffled (same answer key per set)"><span style={{ color: 'var(--text-3)' }}>Shuffled sets</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r)', padding: 2 }}><button type="button" onClick={() => { setSets((v) => clampInt(v - 1, 1, 4)); setCurSet(0); }} disabled={sets <= 1} aria-label="Fewer sets" className="btn btn-glass btn-sm" style={{ padding: '2px 8px', minWidth: 26 }} data-testid="sets-dec">−</button><span data-testid="sets-value" style={{ minWidth: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{sets}</span><button type="button" onClick={() => { setSets((v) => clampInt(v + 1, 1, 4)); setCurSet(0); }} disabled={sets >= 4} aria-label="More sets" className="btn btn-glass btn-sm" style={{ padding: '2px 8px', minWidth: 26 }} data-testid="sets-inc">+</button></span></span>
            </div>
            <div data-testid="gen-explain" style={{ fontSize: 12, lineHeight: 1.45, minHeight: 17, margin: '14px 0 4px', color: canGen ? 'var(--text-3)' : '#ffb4b4' }}>{genExplain}</div>
            <button onClick={() => { if (fullSize && bpFull) setFullConfirm(true); else generate(); }} disabled={busy || (!fullSize && !canGen)} className={(busy || (!fullSize && !canGen)) ? 'btn btn-glass' : 'btn btn-iris'} data-testid="gen-paper" style={{ width: '100%', marginTop: 4, opacity: (!busy && !fullSize && !canGen) ? 0.6 : 1 }}>{busy ? 'Generating…' : (fullSize && bpFull ? '⚡ Generate full paper · ' + fullBatches + ' batches' : '⚡ Generate paper')}</button>
            {fullConfirm && !busy ? (
              <div data-testid="full-confirm" style={{ marginTop: 10, padding: '10px 12px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--violet)' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 8 }}>Build the full <b style={{ fontWeight: 600 }}>{fullTotalQ}-question</b> {examStyle} paper in {fullBatches} batches. This uses more credits than a focused set and can take a couple of minutes.</div>
                <div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => { setFullConfirm(false); generateFull(); }} className="btn btn-iris btn-sm" data-testid="full-go">Generate full paper</button><button type="button" onClick={() => setFullConfirm(false)} className="btn btn-glass btn-sm">Cancel</button></div>
              </div>
            ) : null}
            {note && <div style={{ marginTop: 12, fontSize: 13, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
            <div className="mono" style={{ marginTop: 12, fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em' }}>Answers are AI-generated &mdash; spot-check before using in a real exam.</div>
          </section>

          <section className="papers-preview" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '18px 20px', background: 'rgba(5,6,20,0.5)' }}>
            {!paper ? (
              <div className="no-print" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-4)' }}>
                {busy ? (
                  <div style={{ maxWidth: 380 }} data-testid="gen-progress" role="status" aria-live="polite">
                    <div className="qpg-spinner" style={{ width: 40, height: 40, margin: '0 auto 16px', borderRadius: '50%', border: '3px solid var(--stroke-2)', borderTopColor: 'var(--violet-2)' }} />
                    <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4 }}>Generating your paper… <span className="mono" style={{ color: 'var(--text-3)' }}>{elapsed}s</span></div>
                    <div style={{ fontSize: 12.5, marginBottom: 14 }}>{fullProg || (verify ? 'Writing questions, then verifying the answer key — this usually takes 10–30s.' : 'Writing your questions — this usually takes 10–30s.')}</div>
                    <button type="button" onClick={cancelGenerate} className="btn btn-glass btn-sm" data-testid="cancel-gen">Cancel</button>
                  </div>
                ) : (
                  <div style={{ maxWidth: 360 }}>
                    <div style={{ width: 60, height: 60, margin: '0 auto 16px', borderRadius: 16, background: 'var(--glass-2)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--violet-2)' }}>{'✎'}</div>
                    <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4 }}>Your paper appears here</div>
                    <div style={{ fontSize: 12.5 }}>Build sections on the left, then Generate.</div>
                  </div>
                )}
              </div>
            ) : (
              <div id="result-top">
                <h2 ref={headingRef} tabIndex={-1} className="no-print" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Generated paper: {paper.title}</h2>
                {shortWarn && <div className="no-print" data-testid="short-warn" style={{ marginBottom: 12, fontSize: 12.5, color: '#ffd27a', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r)', padding: '8px 12px' }}>{shortWarn}</div>}
                <div className="no-print result-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 10, rowGap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }}>
                    <button onClick={() => setView('paper')} className={view === 'paper' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-paper">Paper</button>
                    <button onClick={() => { setView('practice'); setChecked(false); }} className={view === 'practice' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-practice">Practice</button>
                  </div>
                  {setsArr.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-testid="set-switcher"><span style={{ fontSize: 11.5, color: 'var(--text-3)', marginRight: 2 }}>Set</span><div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }}>{setsArr.map((sp, i) => <button key={i} onClick={() => setCurSet(i)} className={curSet === i ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid={'set-tab-' + i} aria-pressed={curSet === i}>{sp.setLabel || String.fromCharCode(65 + i)}</button>)}</div></div>
                  )}
                  {view === 'paper' && <><label style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>Layout<select value={paper.layout || layout} onChange={(e) => { const v = e.target.value; setLayout(v); setPaper((pp) => pp ? { ...pp, layout: v } : pp); }} aria-label="Layout" style={{ padding: '5px 8px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12 }} data-testid="layout-select"><option value="official">Official</option><option value="clean">Clean</option><option value="compact">Compact</option></select></label><button onClick={() => window.print()} className="btn btn-iris btn-sm" data-testid="save-pdf">Save as PDF / Print</button>{setsArr.length > 1 ? <button onClick={printAllSets} className="btn btn-glass btn-sm" data-testid="print-all-sets">Print all {setsArr.length} sets</button> : null}<button onClick={() => setOmr((v) => !v)} className={omr ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="omr-toggle">{omr ? 'Show paper' : 'OMR sheet'}</button><button onClick={generate} disabled={busy} className="btn btn-glass btn-sm">Regenerate</button><button onClick={savePaper} className="btn btn-glass btn-sm" data-testid="save-library">+ Save to library</button><button onClick={shareTest} className="btn btn-glass btn-sm" data-testid="share-test">Share as test</button><button onClick={() => setEditAns((v) => !v)} className={editAns ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="edit-answers">{editAns ? 'Done editing' : 'Edit answers'}</button><div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }} data-testid="copy-toggle" title="Teacher copy includes the answer key; Student copy hides it"><button type="button" onClick={() => setIncludeKey(true)} className={includeKey ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="copy-teacher" aria-pressed={includeKey}>Teacher</button><button type="button" onClick={() => setIncludeKey(false)} className={!includeKey ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="copy-student" aria-pressed={!includeKey}>Student</button></div>{used != null ? <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }} data-testid="used-cr">used {used} CR</span> : null}{paper.verified && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="verified">{'✓'} answers verified{paper.fixes ? ' (' + paper.fixes + ' corrected)' : ''}</span>}<span data-testid="export-group" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}><span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Export:</span><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.xml', toMoodleXML(activePaper), 'application/xml')} className="btn btn-glass btn-sm" data-testid="export-xml">Moodle XML</button><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.gift.txt', toGIFT(activePaper))} className="btn btn-glass btn-sm" data-testid="export-gift">GIFT</button><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.csv', toCSV(activePaper), 'text/csv')} className="btn btn-glass btn-sm" data-testid="export-csv">CSV</button></span>{savedMsg && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="saved-msg">{savedMsg}</span>}{shareMsg && <span className="mono" style={{ fontSize: 11, color: 'var(--violet-2)' }} data-testid="share-msg">{shareMsg}</span>}</>}
                  {view === 'practice' && (checked
                    ? <><span style={{ fontSize: 15, fontWeight: 600 }} data-testid="score">Score {correctN} / {autoTotal}{autoTotal ? ' (' + Math.round(100 * correctN / autoTotal) + '%)' : ''}</span>{writtenN > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>+ {writtenN} written to self-check</span>}<button onClick={() => { setChecked(false); setAnswers({}); }} className="btn btn-glass btn-sm">Try again</button></>
                    : <button onClick={() => setChecked(true)} className="btn btn-iris btn-sm" data-testid="check-answers">Check answers</button>)}
                </div>

                {editAns && (
                  <div className="no-print glass" style={{ padding: '16px 18px', borderRadius: 'var(--r-lg)', maxWidth: 820, margin: '0 auto 14px' }}>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Edit answer key</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>AI answers can occasionally be wrong &mdash; fix any here before you print, save or share. Changes apply everywhere.</div>
                    {(() => { let n = 0; return paper.sections.flatMap((sec) => sec.questions.map((q) => { const gi = n++; return (
                      <div key={gi} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--violet-2)', minWidth: 24 }}>{gi + 1}.</span>
                        <span style={{ flex: 1, minWidth: 0, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(q.q || q.assertion || '').replace(/\n/g, ' ').slice(0, 64)}</span>
                        <EditAnswerControl q={q} gi={gi} onPatch={patchQ} />
                      </div>
                    ); })); })()}
                  </div>
                )}
                {view === 'paper' ? (
                  <div id="paper-print" style={{ background: '#fff', color: '#111', borderRadius: 'var(--r-lg)', padding: '40px 44px', maxWidth: 820, margin: '0 auto', border: '1px solid var(--stroke-2)' }}>
                    {omr ? <OMRSheet paper={activePaper} /> : (printAll && setsArr.length > 1 ? setsArr.map((sp, i) => (<div key={i} className={i > 0 ? 'pagebreak' : ''}><div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#555', margin: '0 0 10px' }}>SET {sp.setLabel || String.fromCharCode(65 + i)}</div><PaperView paper={sp} layout={paper.layout || layout} includeKey={includeKey} /></div>)) : <PaperView paper={activePaper} layout={paper.layout || layout} includeKey={includeKey} />)}
                  </div>
                ) : (
                  <div className="glass" style={{ padding: '24px 26px', borderRadius: 'var(--r-lg)', maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{paper.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 18 }}>Answer the questions, then hit Check answers. Auto-graded: {autoTotal}{writtenN ? ' · ' + writtenN + ' written (self-check)' : ''}.</div>
                    {flat.map((q, gi) => (
                      <div key={gi} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--stroke-1)' }} data-testid="practice-q">
                        <div style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5 }}><span style={{ fontWeight: 600, color: 'var(--violet-2)', flexShrink: 0 }}>{gi + 1}.</span><div style={{ flex: 1 }}><PromptStem q={q} /></div></div>
                        <div style={{ marginLeft: 22 }}><PracticeInput q={q} ua={answers[gi]} checked={checked} onAns={(v) => setAnswers((a) => ({ ...a, [gi]: v }))} />{checked && <Feedback q={q} ua={answers[gi]} />}</div>
                      </div>
                    ))}
                    {!checked && <button onClick={() => setChecked(true)} className="btn btn-iris" style={{ marginTop: 4 }}>Check answers</button>}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } #papers-shell, .papers-body, .papers-main, .papers-preview, #result-top { height: auto !important; max-height: none !important; overflow: visible !important; display: block !important; } html, body { height: auto !important; overflow: visible !important; background: #fff !important; } #paper-print { border: none !important; border-radius: 0 !important; box-shadow: none !important; max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; } #paper-print .q-block, #paper-print .key-item { break-inside: avoid !important; page-break-inside: avoid !important; } #paper-print .section-head { break-after: avoid !important; page-break-after: avoid !important; } #paper-print .pagebreak { page-break-before: always !important; break-before: page !important; } } @media (max-width: 880px) { #papers-shell { height: auto !important; overflow: visible !important; } .papers-body, .papers-main { flex-direction: column !important; } .papers-aside, .papers-build, .papers-preview { width: 100% !important; flex-shrink: 1 !important; overflow: visible !important; border-right: none !important; border-bottom: 1px solid var(--stroke-1) !important; } } @media (max-width: 560px) { .result-toolbar .btn { padding: 4px 8px !important; font-size: 11px !important; } .result-toolbar .btn-sm { padding: 3px 7px !important; font-size: 10.5px !important; } } @keyframes qpg-spin { to { transform: rotate(360deg); } } .qpg-spinner { animation: qpg-spin 0.8s linear infinite; } .qpg-num { -moz-appearance: textfield; appearance: textfield; } .qpg-num::-webkit-outer-spin-button, .qpg-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }` }} />
    </div>
  );
}
