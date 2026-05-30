'use client';
import { useState, useEffect } from 'react';
import SiteShell, { PageHeader } from '../_components/Chrome';

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

function grade(q, ua) {
  switch (q.type) {
    case 'mcq': case 'code': case 'assertion': return ua === q.answer;
    case 'tf': return ua === q.answer;
    case 'multi': { const a = [...(Array.isArray(ua) ? ua : [])].sort().join(','); const b = [...q.answers].sort().join(','); return a === b && a !== ''; }
    case 'fill': { const u = norm(ua); return !!u && (u === norm(q.answer) || norm(q.answer).includes(u)); }
    case 'numeric': { const x = parseFloat(ua), y = parseFloat(q.answer); if (!isNaN(x) && !isNaN(y)) return Math.abs(x - y) < 1e-6; return !!norm(ua) && norm(ua) === norm(q.answer); }
    case 'match': { if (!Array.isArray(ua)) return false; const rs = rights(q.pairs); return q.pairs.every((p, pi) => ua[pi] === rs.indexOf(p.r)); }
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
    return <input value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Your answer" className="input" style={{ marginTop: 8, maxWidth: 320, fontSize: 13.5, padding: '8px 12px' }} />;
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
  return <textarea value={ua || ''} disabled={checked} onChange={(e) => onAns(e.target.value)} placeholder="Write your answer (self-assessed)" className="input" style={{ marginTop: 8, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 13.5, padding: '9px 12px' }} />;
}
function Feedback({ q, ua }) {
  if (!isAuto(q)) return <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)', background: 'var(--glass-1)', borderLeft: '2px solid var(--violet)', padding: '8px 11px' }}><b style={{ fontWeight: 600 }}>Model answer:</b> {q.modelAnswer}{q.explanation ? ' — ' + q.explanation : ''}</div>;
  const ok = grade(q, ua) === true;
  return <div style={{ marginTop: 8, fontSize: 12.5, color: ok ? 'var(--green)' : '#ffb4b4' }}><b style={{ fontWeight: 600 }}>{ok ? '✓ Correct' : '✗ Correct answer:'}</b> {ok ? '' : keyAnswer(q)}{q.explanation ? <span style={{ color: 'var(--text-3)' }}> — {q.explanation}</span> : null}</div>;
}

export default function StudioPage() {
  const [cat, setCat] = useState('programming');
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
  const [busy, setBusy] = useState(false);
  const [paper, setPaper] = useState(null);
  const [used, setUsed] = useState(null);
  const [credits, setCredits] = useState(null);
  const [note, setNote] = useState('');
  const [view, setView] = useState('paper');
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => { fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin'; return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {}); }, []);

  function applyPreset(p) { setExamStyle(p.examStyle); setTopic(p.topic); setSections(p.sections.map((s) => ({ ...s }))); }
  function setSec(i, patch) { setSections((cur) => cur.map((s, j) => j === i ? { ...s, ...patch } : s)); }
  function addSec() { setSections((cur) => [...cur, { title: 'Section ' + String.fromCharCode(65 + cur.length), type: 'mcq', count: 5, marks: 1 }]); }
  function delSec(i) { setSections((cur) => cur.length > 1 ? cur.filter((_, j) => j !== i) : cur); }
  const totalQ = sections.reduce((n, s) => n + Number(s.count || 0), 0);
  const totalMarks = sections.reduce((m, s) => m + Number(s.count || 0) * Number(s.marks || 1), 0);
  const flat = paper ? paper.sections.flatMap((s) => s.questions) : [];
  const autoTotal = flat.filter(isAuto).length;
  const correctN = checked ? flat.filter((q, gi) => isAuto(q) && grade(q, answers[gi]) === true).length : 0;
  const writtenN = flat.length - autoTotal;

  async function generate() {
    const t = topic.trim();
    if (t.length < 3) { setNote('Describe a topic or syllabus first.'); return; }
    setBusy(true); setNote(''); setPaper(null); setUsed(null); setAnswers({}); setChecked(false); setView('paper');
    try {
      const r = await fetch('/api/studio/paper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: t, examStyle, level, difficulty, language, institution, instructions, sections: sections.map((s) => ({ title: s.title, types: [s.type], count: Number(s.count), marks: Number(s.marks) })), nonce: Math.random().toString(36).slice(2), exclude: prevStems, verify }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 401) { window.location.href = '/signin'; return; }
        if (r.status === 403) setNote('Please verify your email (check your inbox) before generating.');
        else if (r.status === 402) setNote('You are out of credits.');
        else setNote(j.error || 'Generation failed');
        setBusy(false); return;
      }
      setPaper(j.paper); setUsed(j.credits);
      if (Array.isArray(j.stems)) setPrevStems((prev) => [...prev, ...j.stems].slice(-80));
      if (typeof j.balance === 'number') setCredits(j.balance);
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    } catch (e) { setNote(e.message); setBusy(false); }
  }

  const ctrl = { padding: '7px 10px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  const presets = (CATEGORIES.find((c) => c.k === cat) || {}).presets || [];

  return (
    <SiteShell active="studio">
      <PageHeader eyebrow="Studio · beta" title="Question paper generator" lede="Any subject, any structure. Build sections, generate a paper with an answer key, take it interactively to check your answers, or print and save as PDF." />
      <section className="spread" style={{ paddingBottom: 70 }}>
        <div className="glass glass-iris-border no-print" style={{ padding: '20px 22px', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>{CATEGORIES.map((c) => <button key={c.k} type="button" onClick={() => setCat(c.k)} className="chip" style={{ cursor: 'pointer', fontSize: 12.5, background: cat === c.k ? 'var(--glass-2)' : 'transparent', color: cat === c.k ? 'var(--text)' : 'var(--text-3)', borderColor: cat === c.k ? 'var(--violet)' : 'var(--stroke-2)' }}>{c.label}</button>)}</div>
          {presets.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>{presets.map((p) => <button key={p.label} type="button" onClick={() => applyPreset(p)} className="chip" style={{ cursor: 'pointer', fontSize: 12 }} data-testid="preset">{p.label}</button>)}</div>}
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="Describe the topic or syllabus — e.g. Core Java: OOP, collections, exceptions" className="input" data-testid="topic" style={{ width: '100%', resize: 'vertical', minHeight: 52, fontFamily: 'inherit', padding: '10px 13px' }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institution / exam name (optional)" className="input" style={{ flex: 1, minWidth: 220, fontSize: 12.5, padding: '8px 12px' }} />
            <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (optional)" className="input" style={{ flex: 1, minWidth: 220, fontSize: 12.5, padding: '8px 12px' }} />
          </div>
          <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Sections — {totalQ} questions · {totalMarks} marks</div>
          {sections.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }} data-testid="section-row">
              <input value={s.title} onChange={(e) => setSec(i, { title: e.target.value })} placeholder="Section title" className="input" style={{ flex: 1, minWidth: 140, fontSize: 12.5, padding: '7px 10px' }} />
              <select value={s.type} onChange={(e) => setSec(i, { type: e.target.value })} style={ctrl}>{ALL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select>
              <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Qs <input type="number" min={1} max={30} value={s.count} onChange={(e) => setSec(i, { count: e.target.value })} style={{ ...ctrl, width: 54 }} /></label>
              <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Marks <input type="number" min={1} max={20} value={s.marks} onChange={(e) => setSec(i, { marks: e.target.value })} style={{ ...ctrl, width: 50 }} /></label>
              <button type="button" onClick={() => delSec(i)} className="btn btn-glass btn-sm" style={{ padding: '5px 9px' }} aria-label="Remove section">✕</button>
            </div>
          ))}
          <button type="button" onClick={addSec} className="btn btn-glass btn-sm" data-testid="add-section" style={{ marginTop: 2 }}>+ Add section</button>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={ctrl}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Level<select value={level} onChange={(e) => setLevel(e.target.value)} style={ctrl}><option value="">Any</option><option value="Beginner">Beginner</option><option value="School">School</option><option value="College">College</option><option value="Professional">Professional</option><option value="Expert">Expert</option></select></label>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Language<select value={language} onChange={(e) => setLanguage(e.target.value)} style={ctrl}><option value="en">English</option><option value="ta-en">Tamil + English</option></select></label>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={includeKey} onChange={(e) => setIncludeKey(e.target.checked)} /> Include answer key</label>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="A second AI pass re-checks the answer key (uses a little extra credit)"><input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} /> Verify answers</label>
            <div style={{ flex: 1 }}></div>
            {credits != null && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>◆ {credits.toLocaleString('en-IN')} CR <a href="/buy" style={{ color: 'var(--violet-2)' }}>+ Buy</a></span>}
            <button onClick={generate} disabled={busy} className={busy ? 'btn btn-glass' : 'btn btn-iris'} data-testid="gen-paper">{busy ? 'Generating…' : 'Generate paper →'}</button>
          </div>
          {note && <div style={{ marginTop: 12, fontSize: 13, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
          <div className="mono" style={{ marginTop: 12, fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.06em' }}>Answers are AI-generated — spot-check before using in a real exam.</div>
        </div>

        {paper && (
          <div id="result-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 12px', flexWrap: 'wrap' }} className="no-print">
              <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }}>
                <button onClick={() => setView('paper')} className={view === 'paper' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-paper">Paper</button>
                <button onClick={() => { setView('practice'); setChecked(false); }} className={view === 'practice' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-practice">Practice</button>
              </div>
              {view === 'paper' && <><button onClick={() => window.print()} className="btn btn-iris" data-testid="save-pdf">Save as PDF / Print</button><button onClick={generate} className="btn btn-glass">Regenerate</button><span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{includeKey ? 'teacher copy' : 'student copy'}{used != null ? ' · used ' + used + ' CR' : ''}</span>{paper.verified && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="verified">✓ answers verified{paper.fixes ? ' (' + paper.fixes + ' corrected)' : ''}</span>}</>}
              {view === 'practice' && (checked
                ? <><span style={{ fontSize: 15, fontWeight: 600 }} data-testid="score">Score {correctN} / {autoTotal}{autoTotal ? ' (' + Math.round(100 * correctN / autoTotal) + '%)' : ''}</span>{writtenN > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>+ {writtenN} written to self-check</span>}<button onClick={() => { setChecked(false); setAnswers({}); }} className="btn btn-glass btn-sm">Try again</button></>
                : <button onClick={() => setChecked(true)} className="btn btn-iris" data-testid="check-answers">Check answers</button>)}
            </div>

            {view === 'paper' ? (
              <div id="paper-print" style={{ background: '#fff', color: '#111', borderRadius: 'var(--r-lg)', padding: '40px 44px', maxWidth: 820, margin: '0 auto', border: '1px solid var(--stroke-2)' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 14, marginBottom: 18 }}>
                  {paper.institution && <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{paper.institution}</div>}
                  <div style={{ fontSize: 21, fontWeight: 700, marginTop: paper.institution ? 4 : 0 }}>{paper.title}</div>
                  <div style={{ fontSize: 12.5, color: '#555', marginTop: 6 }}>Max marks: {paper.totalMarks} · Time: {paper.durationMin} min{paper.examStyle ? ' · ' + paper.examStyle : ''}</div>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>{paper.instructions || 'Instructions: answer all questions.'}{includeKey ? ' The answer key is on the last page.' : ''}</div>
                {(() => { let n = 0; return paper.sections.map((sec, si) => (
                  <div key={si} style={{ marginBottom: 8 }}>
                    {(sec.title || paper.sections.length > 1) && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ddd', margin: '14px 0 10px', paddingBottom: 4 }}><span style={{ fontSize: 14.5, fontWeight: 700 }}>{sec.title || ('Section ' + String.fromCharCode(65 + si))}</span><span style={{ fontSize: 11.5, color: '#777' }}>{sec.questions.length} × {sec.marks} = {sec.questions.length * sec.marks} marks</span></div>}
                    {sec.questions.map((q) => { n += 1; return <div key={n} style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.55, display: 'flex', gap: 8 }}><span style={{ fontWeight: 600, flexShrink: 0 }}>{n}.</span><div style={{ flex: 1 }}>{renderBody(q)}</div></div>; })}
                  </div>
                )); })()}
                {includeKey && (
                  <div className="pagebreak" style={{ marginTop: 26, borderTop: '2px solid #111', paddingTop: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Answer key</div>
                    {(() => { let n = 0; return paper.sections.flatMap((sec) => sec.questions.map((q) => { n += 1; return <div key={n} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 7 }}><b style={{ fontWeight: 600 }}>{n}.</b> {keyAnswer(q)}{q.explanation ? <span style={{ color: '#666' }}> — {q.explanation}</span> : null}</div>; })); })()}
                  </div>
                )}
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
      <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden !important; } #paper-print, #paper-print * { visibility: visible !important; } #paper-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; border: none !important; border-radius: 0 !important; padding: 0 !important; } .pagebreak { page-break-before: always; } }` }} />
    </SiteShell>
  );
}
