'use client';
import { useState, useEffect } from 'react';
import SiteShell, { PageHeader } from '../_components/Chrome';

const CATEGORIES = [
  { k: 'exams', label: 'Govt / competitive exams', presets: [
    { label: 'TNPSC Group 4', examStyle: 'TNPSC Group 4', topic: 'TNPSC Group 4 general studies — Indian polity, history, geography, science and current affairs', types: ['mcq', 'assertion', 'match'] },
    { label: 'UPSC Prelims GS', examStyle: 'UPSC Prelims', topic: 'UPSC Civil Services Prelims — General Studies Paper I', types: ['mcq', 'assertion'] },
    { label: 'SSC CGL', examStyle: 'SSC CGL', topic: 'SSC CGL — quantitative aptitude, reasoning, English and general awareness', types: ['mcq'] },
  ] },
  { k: 'programming', label: 'Programming & IT', presets: [
    { label: 'Java — OOP & collections', examStyle: 'Java', topic: 'Core Java — OOP, collections, exceptions, generics and streams', types: ['mcq', 'code', 'tf'] },
    { label: 'Python basics', examStyle: 'Python', topic: 'Python fundamentals — data types, control flow, functions, lists and dicts', types: ['mcq', 'code', 'fill'] },
    { label: 'AWS Solutions Architect', examStyle: 'AWS Certified Solutions Architect Associate', topic: 'AWS SAA — EC2, S3, VPC, IAM, RDS, autoscaling and the well-architected framework', types: ['mcq', 'multi'] },
    { label: 'SQL', examStyle: 'SQL', topic: 'SQL — joins, group by, subqueries, indexing and normalization', types: ['mcq', 'code', 'short'] },
  ] },
  { k: 'school', label: 'School (CBSE / State)', presets: [
    { label: 'Class 10 Science', examStyle: 'CBSE Class 10', topic: 'CBSE Class 10 Science — physics, chemistry and biology', types: ['mcq', 'assertion', 'short', 'long'] },
    { label: 'Class 8 Maths', examStyle: 'Class 8', topic: 'Class 8 Mathematics — algebra, geometry and mensuration', types: ['mcq', 'numeric', 'short'] },
  ] },
  { k: 'medical', label: 'Medical & nursing', presets: [
    { label: 'NEET Biology', examStyle: 'NEET', topic: 'NEET Biology — human physiology, genetics, ecology and cell biology', types: ['mcq', 'assertion'] },
    { label: 'Nursing fundamentals', examStyle: 'Nursing', topic: 'Nursing fundamentals — anatomy, patient care and basic pharmacology', types: ['mcq', 'tf', 'short'] },
  ] },
  { k: 'languages', label: 'Languages', presets: [
    { label: 'English grammar', examStyle: 'English', topic: 'English grammar — tenses, prepositions, articles and sentence correction', types: ['mcq', 'fill'] },
    { label: 'Tamil', examStyle: 'Tamil', topic: 'Tamil language — grammar, literature and comprehension', types: ['mcq', 'fill', 'short'] },
  ] },
  { k: 'custom', label: 'Custom', presets: [] },
];
const TYPE_LABELS = { mcq: 'Multiple choice', multi: 'Multi-select', tf: 'True / false', fill: 'Fill the blank', match: 'Match', assertion: 'Assertion–reason', numeric: 'Numeric', short: 'Short answer', long: 'Long answer', code: 'Code output' };
const ALL_TYPES = Object.keys(TYPE_LABELS);
const LETTER = (i) => String.fromCharCode(97 + i);
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
const rights = (pairs) => [...pairs.map((p) => p.r)].sort((a, b) => String(a).localeCompare(String(b)));

function renderBody(q) {
  const opts = (list) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', marginTop: 8 }}>
      {list.map((o, oi) => <div key={oi} style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>({LETTER(oi)}) {o}</div>)}
    </div>
  );
  const qt = q.type === 'code'
    ? <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: '#f3f3f6', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: '2px 0 0' }}>{q.q}</pre>
    : <div style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</div>;
  switch (q.type) {
    case 'mcq': case 'code': return <>{qt}{opts(q.options)}</>;
    case 'multi': return <>{qt}<div style={{ fontSize: 11.5, color: '#777', marginTop: 3 }}>(select all that apply)</div>{opts(q.options)}</>;
    case 'tf': return <>{qt}<div style={{ marginTop: 6, fontSize: 13, color: '#555' }}>( True / False )</div></>;
    case 'fill': return qt;
    case 'numeric': return <>{qt}<div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>Answer: ____________ {q.unit}</div></>;
    case 'assertion': return <>
      <div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {q.assertion}</div>
      <div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {q.reason}</div>
      {opts(q.options)}</>;
    case 'match': {
      const rs = rights(q.pairs);
      return <>{qt}<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px', marginTop: 8, fontSize: 13.5 }}>
        <div>{q.pairs.map((p, pi) => <div key={pi}>{ROMAN[pi]}. {p.l}</div>)}</div>
        <div>{rs.map((r, ri) => <div key={ri}>({LETTER(ri)}) {r}</div>)}</div>
      </div></>;
    }
    case 'short': return <>{qt}<div style={{ marginTop: 8, height: 40, borderBottom: '1px solid #ccc' }}></div></>;
    case 'long': return <>{qt}<div style={{ marginTop: 8, height: 84, borderBottom: '1px solid #ccc' }}></div></>;
    default: return qt;
  }
}
function renderKey(q, i) {
  let ans = null;
  switch (q.type) {
    case 'mcq': case 'code': case 'assertion': ans = <>({LETTER(q.answer)}) {q.options[q.answer]}</>; break;
    case 'multi': ans = <>{q.answers.map((a) => '(' + LETTER(a) + ')').join(' ')} {q.answers.map((a) => q.options[a]).join('; ')}</>; break;
    case 'tf': ans = <>{q.answer ? 'True' : 'False'}</>; break;
    case 'fill': ans = <>{q.answer}</>; break;
    case 'numeric': ans = <>{q.answer} {q.unit}</>; break;
    case 'match': { const rs = rights(q.pairs); ans = <>{q.pairs.map((p, pi) => ROMAN[pi] + '→' + LETTER(rs.indexOf(p.r))).join(', ')}</>; break; }
    case 'short': case 'long': ans = <span style={{ color: '#333' }}>{q.modelAnswer}</span>; break;
    default: ans = null;
  }
  return <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 7 }}><b style={{ fontWeight: 600 }}>{i + 1}.</b> {ans}{q.explanation ? <span style={{ color: '#666' }}> — {q.explanation}</span> : null}</div>;
}

export default function StudioPage() {
  const [cat, setCat] = useState('exams');
  const [examStyle, setExamStyle] = useState('');
  const [topic, setTopic] = useState('');
  const [types, setTypes] = useState(['mcq']);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('en');
  const [busy, setBusy] = useState(false);
  const [paper, setPaper] = useState(null);
  const [used, setUsed] = useState(null);
  const [credits, setCredits] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin'; return null; } return r.json(); })
      .then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
  }, []);

  function applyPreset(p) { setExamStyle(p.examStyle); setTopic(p.topic); setTypes(p.types); }
  function toggleType(t) { setTypes((cur) => cur.includes(t) ? (cur.length > 1 ? cur.filter((x) => x !== t) : cur) : [...cur, t]); }

  async function generate() {
    const t = topic.trim();
    if (t.length < 3) { setNote('Describe a topic or syllabus first.'); return; }
    setBusy(true); setNote(''); setPaper(null); setUsed(null);
    try {
      const r = await fetch('/api/studio/paper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: t, examStyle, level, difficulty, language, types, count }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 401) { window.location.href = '/signin'; return; }
        if (r.status === 403) setNote('Please verify your email (check your inbox) before generating.');
        else if (r.status === 402) setNote('You are out of credits.');
        else setNote(j.error || 'Generation failed');
        setBusy(false); return;
      }
      setPaper(j.paper); setUsed(j.credits);
      if (typeof j.balance === 'number') setCredits(j.balance);
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('paper-print'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    } catch (e) { setNote(e.message); setBusy(false); }
  }

  const ctrl = { padding: '8px 11px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit' };
  const presets = (CATEGORIES.find((c) => c.k === cat) || {}).presets || [];

  return (
    <SiteShell active="studio">
      <PageHeader eyebrow="Studio · beta" title="Question paper generator" lede="Any subject, any format. Pick question types and difficulty, generate a paper with an answer key, print or save as PDF. Every generation uses credits." />
      <section className="spread" style={{ paddingBottom: 70 }}>
        <div className="glass glass-iris-border no-print" style={{ padding: '20px 22px', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
            {CATEGORIES.map((c) => (
              <button key={c.k} type="button" onClick={() => setCat(c.k)} className="chip" style={{ cursor: 'pointer', fontSize: 12.5, background: cat === c.k ? 'var(--glass-2)' : 'transparent', color: cat === c.k ? 'var(--text)' : 'var(--text-3)', borderColor: cat === c.k ? 'var(--violet)' : 'var(--stroke-2)' }}>{c.label}</button>
            ))}
          </div>
          {presets.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
              {presets.map((p) => <button key={p.label} type="button" onClick={() => applyPreset(p)} className="chip" style={{ cursor: 'pointer', fontSize: 12 }} data-testid="preset">{p.label}</button>)}
            </div>
          )}
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="Describe the topic or syllabus — e.g. Core Java: OOP, collections, exceptions" className="input" data-testid="topic" style={{ width: '100%', resize: 'vertical', minHeight: 56, fontFamily: 'inherit', padding: '11px 13px' }} />
          <div className="eyebrow" style={{ margin: '14px 0 7px' }}>Question types</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {ALL_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => toggleType(t)} className="chip" data-testid={'type-' + t} style={{ cursor: 'pointer', fontSize: 12, background: types.includes(t) ? '#EEEDFE' : 'transparent', color: types.includes(t) ? '#26215C' : 'var(--text-3)', borderColor: types.includes(t) ? 'var(--violet)' : 'var(--stroke-2)' }}>{types.includes(t) ? '✓ ' : ''}{TYPE_LABELS[t]}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Questions
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={ctrl}>{[5, 10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={ctrl}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Level
              <select value={level} onChange={(e) => setLevel(e.target.value)} style={ctrl}><option value="">Any</option><option value="Beginner">Beginner</option><option value="School">School</option><option value="College">College</option><option value="Professional">Professional</option><option value="Expert">Expert</option></select></label>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Language
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={ctrl}><option value="en">English</option><option value="ta-en">Tamil + English</option></select></label>
            <div style={{ flex: 1 }}></div>
            {credits != null && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>◆ {credits.toLocaleString('en-IN')} CR <a href="/buy" style={{ color: 'var(--violet-2)' }}>+ Buy</a></span>}
            <button onClick={generate} disabled={busy} className={busy ? 'btn btn-glass' : 'btn btn-iris'} data-testid="gen-paper">{busy ? 'Generating…' : 'Generate paper →'}</button>
          </div>
          {note && <div style={{ marginTop: 12, fontSize: 13, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
          <div className="mono" style={{ marginTop: 12, fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.06em' }}>Answers are AI-generated — spot-check before using in a real exam.</div>
        </div>

        {paper && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 12px', flexWrap: 'wrap' }} className="no-print">
              <button onClick={() => window.print()} className="btn btn-iris" data-testid="save-pdf">Save as PDF / Print</button>
              <button onClick={generate} className="btn btn-glass">Regenerate</button>
              {used != null && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>used {used} credit{used === 1 ? '' : 's'}{paper.provider ? ' · ' + paper.provider : ''}</span>}
            </div>
            <div id="paper-print" style={{ background: '#fff', color: '#111', borderRadius: 'var(--r-lg)', padding: '40px 44px', maxWidth: 820, margin: '0 auto', border: '1px solid var(--stroke-2)' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 21, fontWeight: 700 }}>{paper.title}</div>
                <div style={{ fontSize: 12.5, color: '#555', marginTop: 6 }}>{paper.questions.length} questions{paper.examStyle ? ' · ' + paper.examStyle : ''} · {paper.difficulty} difficulty</div>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 18 }}>Instructions: answer all questions. The answer key is on the last page.</div>
              <ol style={{ paddingLeft: 22, margin: 0 }}>
                {paper.questions.map((q, i) => <li key={i} style={{ marginBottom: 18, fontSize: 14, lineHeight: 1.55 }}>{renderBody(q)}</li>)}
              </ol>
              <div className="pagebreak" style={{ marginTop: 28, borderTop: '2px solid #111', paddingTop: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Answer key</div>
                {paper.questions.map((q, i) => <div key={i}>{renderKey(q, i)}</div>)}
                <div style={{ fontSize: 10.5, color: '#888', marginTop: 18, textAlign: 'center' }}>Generated with chatwithpdfai.com · verify answers before exam use</div>
              </div>
            </div>
          </>
        )}
      </section>
      <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden !important; } #paper-print, #paper-print * { visibility: visible !important; } #paper-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; border: none !important; border-radius: 0 !important; padding: 0 !important; } .pagebreak { page-break-before: always; } }` }} />
    </SiteShell>
  );
}
