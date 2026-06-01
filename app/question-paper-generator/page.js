'use client';
import AppNav from '../_components/AppNav';
import { useState, useEffect } from 'react';
import { toGIFT, toMoodleXML, toCSV, downloadText, slug } from './exporters';

const TYPE_LABELS = { mcq: 'Multiple choice', multi: 'Multi-select', tf: 'True / false', fill: 'Fill the blank', match: 'Match', assertion: 'Assertion–reason', numeric: 'Numeric', short: 'Short answer', long: 'Long answer', code: 'Code output' };
const ALL_TYPES = Object.keys(TYPE_LABELS);
const CATEGORIES = [
  { k: 'exams', label: 'Govt / competitive exams', presets: [
    { label: 'TNPSC Group 4', examStyle: 'TNPSC Group 4', topic: 'TNPSC Group 4 general studies — Indian polity, history, geography, science and current affairs', sections: [{ title: 'Part A — General studies', type: 'mcq', count: 15, marks: 1 }, { title: 'Part B — Assertion & reason', type: 'assertion', count: 5, marks: 2 }] },
    { label: 'UPSC Prelims GS', examStyle: 'UPSC Prelims', topic: 'UPSC Civil Services Prelims — General Studies Paper I', sections: [{ title: 'General studies', type: 'mcq', count: 20, marks: 2 }] },
  ] },
  { k: 'programming', label: 'Programming & IT', presets: [
    { label: 'Java — OOP & collections', examStyle: 'Java', topic: 'Core Java — OOP, collections, exceptions, generics and streams', sections: [{ title: 'Part A — Concepts', type: 'mcq', count: 8, marks: 1 }, { title: 'Part B — Code output', type: 'code', count: 4, marks: 2 }, { title: 'Part C — Short answer', type: 'short', count: 3, marks: 3 }] },
    { label: 'Python basics', examStyle: 'Python', topic: 'Python fundamentals — data types, control flow, functions, lists and dicts', sections: [{ title: 'Part A — Concepts', type: 'mcq', count: 10, marks: 1 }, { title: 'Part B — Output', type: 'code', count: 5, marks: 2 }] },
    { label: 'AWS Solutions Architect', examStyle: 'AWS Certified Solutions Architect Associate', topic: 'AWS SAA — EC2, S3, VPC, IAM, RDS, autoscaling and the well-architected framework', sections: [{ title: 'Domain questions', type: 'mcq', count: 12, marks: 1 }, { title: 'Multi-response', type: 'multi', count: 3, marks: 2 }] },
    { label: 'SQL', examStyle: 'SQL', topic: 'SQL — joins, group by, subqueries, indexing and normalization', sections: [{ title: 'Concepts', type: 'mcq', count: 8, marks: 1 }, { title: 'Query output', type: 'code', count: 4, marks: 2 }] },
  ] },
  { k: 'school', label: 'School (CBSE / State)', presets: [
    { label: 'Class 10 Science', examStyle: 'CBSE Class 10', topic: 'CBSE Class 10 Science — physics, chemistry and biology', sections: [{ title: 'Section A — MCQ', type: 'mcq', count: 10, marks: 1 }, { title: 'Section B — Assertion & reason', type: 'assertion', count: 4, marks: 1 }, { title: 'Section C — Short answer', type: 'short', count: 4, marks: 3 }, { title: 'Section D — Long answer', type: 'long', count: 2, marks: 5 }] },
  ] },
  { k: 'medical', label: 'Medical & nursing', presets: [
    { label: 'NEET Biology', examStyle: 'NEET', topic: 'NEET Biology — human physiology, genetics, ecology and cell biology', sections: [{ title: 'Biology', type: 'mcq', count: 15, marks: 4 }] },
  ] },
  { k: 'languages', label: 'Languages', presets: [
    { label: 'English grammar', examStyle: 'English', topic: 'English grammar — tenses, prepositions, articles and sentence correction', sections: [{ title: 'Grammar MCQ', type: 'mcq', count: 10, marks: 1 }, { title: 'Fill the blanks', type: 'fill', count: 5, marks: 1 }] },
  ] },
  { k: 'custom', label: 'Custom', presets: [] },
];
const LETTER = (i) => String.fromCharCode(97 + i);
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
const rights = (pairs) => [...pairs.map((p) => p.r)].sort((a, b) => String(a).localeCompare(String(b)));
const AUTO = ['mcq', 'code', 'assertion', 'tf', 'multi', 'fill', 'numeric', 'match'];
const isAuto = (q) => AUTO.includes(q.type);
const norm = (x) => String(x == null ? '' : x).trim().toLowerCase().replace(/\s+/g, ' ');
const normFill = (x) => norm(x).replace(/^(?:a|an|the)\s+/, '').replace(/[.,;:!?]+$/, '');

function grade(q, ua) {
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
function keyAnswer(q) {
  switch (q.type) {
    case 'mcq': case 'code': case 'assertion': return <>({LETTER(q.answer)}) {q.options[q.answer]}</>;
    case 'multi': return <>{q.answers.map((a) => '(' + LETTER(a) + ')').join(' ')} {q.answers.map((a) => q.options[a]).join('; ')}</>;
    case 'tf': return <>{q.answer ? 'True' : 'False'}</>;
    case 'fill': return <>{q.answer}</>;
    case 'numeric': return <>{q.answer} {q.unit}</>;
    case 'match': { const rs = rights(q.pairs); return <>{q.pairs.map((p, pi) => ROMAN[pi] + '→' + LETTER(rs.indexOf(p.r))).join(', ')}</>; }
    case 'short': case 'long': return <span style={{ color: '#333' }}>{q.modelAnswer}</span>;
    default: return null;
  }
}
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
          {paper.sections.flatMap((sec) => sec.questions.map((q) => { k += 1; return <div key={k} className="key-item" style={{ fontSize: compact ? 12 : 13, lineHeight: 1.5, marginBottom: compact ? 5 : 7 }}><b style={{ fontWeight: 600 }}>{k}.</b> {keyAnswer(q)}{q.explanation ? <span style={{ color: '#666' }}> — {q.explanation}</span> : null}{q.page ? <span style={{ color: '#888' }}> [source p.{q.page}]</span> : null}</div>; }))}
        </div>
      ) : null}
    </>
  );
}

function PromptStem({ q }) {
  if (q.type === 'code') return <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--glass-1)', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: '2px 0 0', color: 'var(--text)' }}>{q.q}</pre>;
  if (q.type === 'assertion') return <div><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {q.assertion}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {q.reason}</div></div>;
  if (q.type === 'match') return <span style={{ fontWeight: 600 }}>Match the following</span>;
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
  return <textarea value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Write your answer (self-assessed)" aria-label="Your answer" className="input" style={{ marginTop: 8, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 13.5, padding: '9px 12px' }} />;
}
function Feedback({ q, ua }) {
  if (!isAuto(q)) return <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)', background: 'var(--glass-1)', borderLeft: '2px solid var(--violet)', padding: '8px 11px' }}><b style={{ fontWeight: 600 }}>Model answer:</b> {q.modelAnswer}{q.explanation ? ' — ' + q.explanation : ''}</div>;
  const ok = grade(q, ua) === true;
  return <div style={{ marginTop: 8, fontSize: 12.5, color: ok ? 'var(--green)' : '#ffb4b4' }}><b style={{ fontWeight: 600 }}>{ok ? '✓ Correct' : '✗ Correct answer:'}</b> {ok ? '' : keyAnswer(q)}{q.explanation ? <span style={{ color: 'var(--text-3)' }}> — {q.explanation}</span> : null}</div>;
}

function EditAnswerControl({ q, gi, onPatch }) {
  const sel = { padding: '5px 8px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') return <select value={q.answer} onChange={(e) => onPatch(gi, { answer: Number(e.target.value) })} style={{ ...sel, maxWidth: 340 }}>{q.options.map((o, oi) => <option key={oi} value={oi}>({LETTER(oi)}) {String(o).slice(0, 50)}</option>)}</select>;
  if (q.type === 'tf') return <select value={q.answer ? '1' : '0'} onChange={(e) => onPatch(gi, { answer: e.target.value === '1' })} style={sel}><option value="1">True</option><option value="0">False</option></select>;
  if (q.type === 'multi') return <span style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap' }}>{q.options.map((o, oi) => { const on = Array.isArray(q.answers) && q.answers.includes(oi); return <label key={oi} style={{ fontSize: 12.5, color: 'var(--text-2)' }}><input type="checkbox" checked={on} onChange={() => onPatch(gi, { answers: on ? q.answers.filter((x) => x !== oi) : [...(q.answers || []), oi] })} /> {LETTER(oi)}</label>; })}</span>;
  if (q.type === 'fill' || q.type === 'numeric') return <input value={q.answer || ''} onChange={(e) => onPatch(gi, { answer: e.target.value })} aria-label="Correct answer" className="input" style={{ minWidth: 180, fontSize: 12.5, padding: '6px 10px' }} />;
  if (q.type === 'short' || q.type === 'long') return <input value={q.modelAnswer || ''} onChange={(e) => onPatch(gi, { modelAnswer: e.target.value })} aria-label="Model answer" className="input" style={{ minWidth: 300, fontSize: 12.5, padding: '6px 10px' }} />;
  return <span style={{ fontSize: 12, color: 'var(--text-3)' }}>(not editable)</span>;
}

export default function PapersPage() {
  const [cat, setCat] = useState('programming');
  const [examStyle, setExamStyle] = useState('');
  const [topic, setTopic] = useState('');
  const [institution, setInstitution] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sections, setSections] = useState([{ title: 'Section A', type: 'mcq', count: 10, marks: 1 }]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [level, setLevel] = useState('');
  const [language] = useState('en'); // English only; bilingual (ta-en) backend kept dormant/reversible
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
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [editAns, setEditAns] = useState(false);

  useEffect(() => { try { const d = Number(new URLSearchParams(window.location.search).get('doc')) || 0; if (d) setSourceDocId(d); } catch (e) {} }, []);
  useEffect(() => { fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    fetch('/api/documents').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.documents)) setDocs(j.documents.filter((d) => d.status === 'ready')); }).catch(() => {});
    loadLibrary(); loadShares(); try { const pid = Number(new URLSearchParams(window.location.search).get('paper')) || 0; if (pid) openPaper(pid); } catch (e) {} }, []);

  function applyPreset(p) { setExamStyle(p.examStyle); setTopic(p.topic); setSections(p.sections.map((s) => ({ ...s }))); }
  function setSec(i, patch) { setSections((cur) => cur.map((s, j) => j === i ? { ...s, ...patch } : s)); }
  function addSec() { setSections((cur) => [...cur, { title: 'Section ' + String.fromCharCode(65 + cur.length), type: 'mcq', count: 5, marks: 1 }]); }
  function delSec(i) { setSections((cur) => cur.length > 1 ? cur.filter((_, j) => j !== i) : cur); }
  function loadLibrary() { fetch('/api/papers/library').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.papers)) setLibrary(j.papers); }).catch(() => {}); }
  async function savePaper() { if (!paper) return; setSavedMsg('Saving\u2026'); try { const r = await fetch('/api/papers/library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setSavedMsg('Saved to library'); loadLibrary(); setTimeout(() => setSavedMsg(''), 2200); } else setSavedMsg(j.error || 'Save failed'); } catch (e) { setSavedMsg(e.message); } }
  async function openPaper(id) { try { const r = await fetch('/api/papers/library?id=' + id); const j = await r.json().catch(() => ({})); if (r.ok && j.paper) { setPaper(j.paper); setLayout(j.paper.layout || 'official'); setView('paper'); setChecked(false); setAnswers({}); setUsed(null); setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); } } catch (e) {} }
  async function delPaper(id) { try { await fetch('/api/papers/library?id=' + id, { method: 'DELETE' }); loadLibrary(); } catch (e) {} }
  function loadShares() { fetch('/api/papers/assignments').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.assignments)) setShares(j.assignments); }).catch(() => {}); }
  async function shareTest() { if (!paper) return; setShareMsg('Creating link\u2026'); try { const r = await fetch('/api/papers/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper }) }); const j = await r.json().catch(() => ({})); if (r.ok && j.token) { const url = window.location.origin + '/t/' + j.token; try { await navigator.clipboard.writeText(url); setShareMsg('Link copied \u2014 ' + url); } catch (e2) { setShareMsg('Share link: ' + url); } loadShares(); } else setShareMsg(j.error || 'Could not create link'); } catch (e) { setShareMsg(e.message); } }
  async function delShare(id) { try { await fetch('/api/papers/assignments?id=' + id, { method: 'DELETE' }); loadShares(); } catch (e) {} }
  async function viewAttempts(id) { if (attemptsFor === id) { setAttemptsFor(null); return; } try { const r = await fetch('/api/papers/assignments?id=' + id); const j = await r.json().catch(() => ({})); if (r.ok && Array.isArray(j.attempts)) { setAttemptList(j.attempts); setAttemptsFor(id); } } catch (e) {} }
  function patchQ(gi, patch) { setPaper((pp) => { if (!pp) return pp; let n = -1; return { ...pp, sections: pp.sections.map((s) => ({ ...s, questions: s.questions.map((q) => { n += 1; return n === gi ? { ...q, ...patch } : q; }) })) }; }); }
  const totalQ = sections.reduce((n, s) => n + Number(s.count || 0), 0);
  const totalMarks = sections.reduce((m, s) => m + Number(s.count || 0) * Number(s.marks || 1), 0);
  const flat = paper ? paper.sections.flatMap((s) => s.questions) : [];
  const autoTotal = flat.filter(isAuto).length;
  const correctN = checked ? flat.filter((q, gi) => isAuto(q) && grade(q, answers[gi]) === true).length : 0;
  const writtenN = flat.length - autoTotal;

  async function generate() {
    const t = topic.trim();
    if (t.length < 3 && !sourceDocId) { setNote('Describe a topic, or pick a source document.'); return; }
    setBusy(true); setNote(''); setPaper(null); setUsed(null); setAnswers({}); setChecked(false); setView('paper');
    try {
      const r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: t, examStyle, level, difficulty, language, institution, instructions, sections: sections.map((s) => ({ title: s.title, types: [s.type], count: Number(s.count), marks: Number(s.marks) })), nonce: Math.random().toString(36).slice(2), exclude: prevStems, verify, documentId: sourceDocId }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
        if (r.status === 403) setNote('Please verify your email (check your inbox) before generating.');
        else if (r.status === 402) setNote('You are out of credits.');
        else setNote(j.error || 'Generation failed');
        setBusy(false); return;
      }
      setPaper({ ...j.paper, layout }); setUsed(j.credits);
      if (Array.isArray(j.stems)) setPrevStems((prev) => [...prev, ...j.stems].slice(-80));
      if (typeof j.balance === 'number') setCredits(j.balance);
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    } catch (e) { setNote(e.message); setBusy(false); }
  }

  const ctrl = { padding: '7px 10px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  const presets = (CATEGORIES.find((c) => c.k === cat) || {}).presets || [];

  return (
    <div id="papers-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppNav active="papers" credits={credits} />

      <div className="papers-body" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside className="no-print papers-aside" style={{ width: 248, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.6)', backdropFilter: 'blur(20px) saturate(180%)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '14px 12px' }}>
          <button type="button" onClick={() => { setPaper(null); setUsed(null); setNote(''); setView('paper'); setEditAns(false); }} className="btn btn-iris btn-sm" data-testid="new-paper" style={{ width: '100%', marginBottom: 16 }}>+ New paper</button>
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
          <section className="no-print papers-build" style={{ width: 472, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', overflowY: 'auto', padding: '18px 20px', background: 'rgba(5,6,20,0.35)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Build</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>{CATEGORIES.map((c) => <button key={c.k} type="button" onClick={() => setCat(c.k)} className="chip" style={{ cursor: 'pointer', fontSize: 12, background: cat === c.k ? 'var(--glass-2)' : 'transparent', color: cat === c.k ? 'var(--text)' : 'var(--text-3)', borderColor: cat === c.k ? 'var(--violet)' : 'var(--stroke-2)' }}>{c.label}</button>)}</div>
            {presets.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>{presets.map((p) => <button key={p.label} type="button" onClick={() => applyPreset(p)} className="chip" style={{ cursor: 'pointer', fontSize: 12 }} data-testid="preset">{p.label}</button>)}</div>}
            {docs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Source</span>
                <select value={sourceDocId} onChange={(e) => setSourceDocId(Number(e.target.value))} style={{ ...ctrl, minWidth: 200 }} data-testid="source-select">
                  <option value={0}>From scratch (topic only)</option>
                  {docs.map((d) => <option key={d.id} value={d.id}>From: {d.filename}{d.pageCount ? ' (' + d.pageCount + ' pp)' : ''}</option>)}
                </select>
              </div>
            )}
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="Describe the topic or syllabus &mdash; e.g. Core Java: OOP, collections, exceptions" aria-label="Topic or syllabus" className="input" data-testid="topic" style={{ width: '100%', resize: 'vertical', minHeight: 60, fontFamily: 'inherit', padding: '10px 13px' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institution / exam name (optional)" aria-label="Institution or exam name" className="input" style={{ flex: 1, minWidth: 170, fontSize: 12.5, padding: '8px 12px' }} />
              <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (optional)" aria-label="Instructions" className="input" style={{ flex: 1, minWidth: 170, fontSize: 12.5, padding: '8px 12px' }} />
            </div>
            <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Sections &mdash; {totalQ} questions {'·'} {totalMarks} marks</div>
            {sections.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 7 }} data-testid="section-row">
                <input value={s.title} onChange={(e) => setSec(i, { title: e.target.value })} placeholder="Section title" aria-label="Section title" className="input" style={{ flex: 1, minWidth: 0, fontSize: 12.5, padding: '7px 10px' }} />
                <select value={s.type} onChange={(e) => setSec(i, { type: e.target.value })} style={ctrl}>{ALL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select>
                <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Qs <input type="number" min={1} max={30} value={s.count} onChange={(e) => setSec(i, { count: e.target.value })} style={{ ...ctrl, width: 50 }} /></label>
                <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Marks <input type="number" min={1} max={20} value={s.marks} onChange={(e) => setSec(i, { marks: e.target.value })} style={{ ...ctrl, width: 46 }} /></label>
                <button type="button" onClick={() => delSec(i)} className="btn btn-glass btn-sm" style={{ padding: '5px 9px' }} aria-label="Remove section">{'✕'}</button>
              </div>
            ))}
            <button type="button" onClick={addSec} className="btn btn-glass btn-sm" data-testid="add-section" style={{ marginTop: 2 }}>+ Add section</button>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={ctrl}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Level<select value={level} onChange={(e) => setLevel(e.target.value)} style={ctrl}><option value="">Any</option><option value="Beginner">Beginner</option><option value="School">School</option><option value="College">College</option><option value="Professional">Professional</option><option value="Expert">Expert</option></select></label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={includeKey} onChange={(e) => setIncludeKey(e.target.checked)} /> Include answer key</label>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="A second AI pass re-checks the answer key"><input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} /> Verify answers</label>
            </div>
            <button onClick={generate} disabled={busy} className={busy ? 'btn btn-glass' : 'btn btn-iris'} data-testid="gen-paper" style={{ width: '100%', marginTop: 16 }}>{busy ? 'Generating…' : 'Generate paper →'}</button>
            {note && <div style={{ marginTop: 12, fontSize: 13, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
            <div className="mono" style={{ marginTop: 12, fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em' }}>Answers are AI-generated &mdash; spot-check before using in a real exam.</div>
          </section>

          <section className="papers-preview" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '18px 20px', background: 'rgba(5,6,20,0.5)' }}>
            {!paper ? (
              <div className="no-print" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-4)' }}>
                <div style={{ maxWidth: 360 }}>
                  <div style={{ width: 60, height: 60, margin: '0 auto 16px', borderRadius: 16, background: 'var(--glass-2)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--violet-2)' }}>{'✎'}</div>
                  <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4 }}>{busy ? 'Generating your paper…' : 'Your paper appears here'}</div>
                  <div style={{ fontSize: 12.5 }}>{busy ? 'This can take a few seconds.' : 'Build sections on the left, then Generate.'}</div>
                </div>
              </div>
            ) : (
              <div id="result-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }} className="no-print">
                  <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }}>
                    <button onClick={() => setView('paper')} className={view === 'paper' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-paper">Paper</button>
                    <button onClick={() => { setView('practice'); setChecked(false); }} className={view === 'practice' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-practice">Practice</button>
                  </div>
                  {view === 'paper' && <><label style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>Layout<select value={paper.layout || layout} onChange={(e) => { const v = e.target.value; setLayout(v); setPaper((pp) => pp ? { ...pp, layout: v } : pp); }} style={{ padding: '5px 8px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12 }} data-testid="layout-select"><option value="official">Official</option><option value="clean">Clean</option><option value="compact">Compact</option></select></label><button onClick={() => window.print()} className="btn btn-iris" data-testid="save-pdf">Save as PDF / Print</button><button onClick={generate} className="btn btn-glass">Regenerate</button><button onClick={savePaper} className="btn btn-glass" data-testid="save-library">+ Save to library</button><button onClick={shareTest} className="btn btn-glass" data-testid="share-test">Share as test</button><button onClick={() => setEditAns((v) => !v)} className={editAns ? 'btn btn-iris' : 'btn btn-glass'} data-testid="edit-answers">{editAns ? 'Done editing' : 'Edit answers'}</button><span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{includeKey ? 'teacher copy' : 'student copy'}{used != null ? ' · used ' + used + ' CR' : ''}</span>{paper.verified && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="verified">{'✓'} answers verified{paper.fixes ? ' (' + paper.fixes + ' corrected)' : ''}</span>}<span style={{ fontSize: 11.5, color: 'var(--text-3)', marginLeft: 4 }}>Export:</span><button onClick={() => downloadText(slug(paper.title) + '.xml', toMoodleXML(paper), 'application/xml')} className="btn btn-glass btn-sm" data-testid="export-xml">Moodle XML</button><button onClick={() => downloadText(slug(paper.title) + '.gift.txt', toGIFT(paper))} className="btn btn-glass btn-sm" data-testid="export-gift">GIFT</button><button onClick={() => downloadText(slug(paper.title) + '.csv', toCSV(paper), 'text/csv')} className="btn btn-glass btn-sm" data-testid="export-csv">CSV</button>{savedMsg && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="saved-msg">{savedMsg}</span>}{shareMsg && <span className="mono" style={{ fontSize: 11, color: 'var(--violet-2)' }} data-testid="share-msg">{shareMsg}</span>}</>}
                  {view === 'practice' && (checked
                    ? <><span style={{ fontSize: 15, fontWeight: 600 }} data-testid="score">Score {correctN} / {autoTotal}{autoTotal ? ' (' + Math.round(100 * correctN / autoTotal) + '%)' : ''}</span>{writtenN > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>+ {writtenN} written to self-check</span>}<button onClick={() => { setChecked(false); setAnswers({}); }} className="btn btn-glass btn-sm">Try again</button></>
                    : <button onClick={() => setChecked(true)} className="btn btn-iris" data-testid="check-answers">Check answers</button>)}
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
                    <PaperView paper={paper} layout={paper.layout || layout} includeKey={includeKey} />
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

      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } #papers-shell, .papers-body, .papers-main, .papers-preview, #result-top { height: auto !important; max-height: none !important; overflow: visible !important; display: block !important; } html, body { height: auto !important; overflow: visible !important; background: #fff !important; } #paper-print { border: none !important; border-radius: 0 !important; box-shadow: none !important; max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; } #paper-print .q-block, #paper-print .key-item { break-inside: avoid !important; page-break-inside: avoid !important; } #paper-print .section-head { break-after: avoid !important; page-break-after: avoid !important; } #paper-print .pagebreak { page-break-before: always !important; break-before: page !important; } } @media (max-width: 880px) { #papers-shell { height: auto !important; overflow: visible !important; } .papers-body, .papers-main { flex-direction: column !important; } .papers-aside, .papers-build, .papers-preview { width: 100% !important; flex-shrink: 1 !important; overflow: visible !important; border-right: none !important; border-bottom: 1px solid var(--stroke-1) !important; } }` }} />
    </div>
  );
}
