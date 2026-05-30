'use client';
import { useState, useEffect } from 'react';

const LETTER = (i) => String.fromCharCode(97 + i);

function TakeInput({ q, gi, ua, locked, onA }) {
  const btn = (label, active, onClick) => <button type="button" onClick={onClick} disabled={locked} style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--r)', background: active ? 'var(--glass-2)' : 'var(--glass-1)', border: '1px solid ' + (active ? 'var(--violet)' : 'var(--stroke-2)'), color: 'var(--text)', fontSize: 13.5, cursor: locked ? 'default' : 'pointer', width: '100%' }}>{label}</button>;
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{q.options.map((o, oi) => <div key={oi}>{btn(<span>({LETTER(oi)}) {o}</span>, ua === oi, () => onA(oi))}</div>)}</div>;
  if (q.type === 'tf') return <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{[true, false].map((v) => <div key={String(v)} style={{ flex: 1 }}>{btn(v ? 'True' : 'False', ua === v, () => onA(v))}</div>)}</div>;
  if (q.type === 'multi') { const arr = Array.isArray(ua) ? ua : []; return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{q.options.map((o, oi) => { const sel = arr.includes(oi); return <div key={oi}>{btn(<span>{sel ? '☑' : '☐'} ({LETTER(oi)}) {o}</span>, sel, () => onA(sel ? arr.filter((x) => x !== oi) : [...arr, oi]))}</div>; })}</div>; }
  if (q.type === 'fill' || q.type === 'numeric') return <input value={ua || ''} disabled={locked} onChange={(e) => onA(e.target.value)} placeholder="Your answer" className="input" style={{ marginTop: 8, maxWidth: 320, fontSize: 13.5, padding: '8px 12px' }} />;
  if (q.type === 'match') { const arr = Array.isArray(ua) ? ua : []; return <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>{q.lefts.map((l, pi) => <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}><span style={{ minWidth: 150 }}>{l}</span><select disabled={locked} value={arr[pi] == null ? '' : arr[pi]} onChange={(e) => { const nx = [...arr]; nx[pi] = Number(e.target.value); onA(nx); }} style={{ padding: '6px 9px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5 }}><option value="">{'—'}</option>{q.choices.map((c, ci) => <option key={ci} value={ci}>{LETTER(ci)}) {c}</option>)}</select></div>)}</div>; }
  return <textarea value={ua || ''} disabled={locked} onChange={(e) => onA(e.target.value)} placeholder="Write your answer" className="input" style={{ marginTop: 8, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 13.5, padding: '9px 12px' }} />;
}

export default function TakeTest({ params }) {
  const token = String(params.token || '').replace(/\.html?$/i, '');
  const [test, setTest] = useState(null);
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch('/api/studio/take?token=' + encodeURIComponent(token)).then((r) => r.json().then((j) => ({ ok: r.ok, j }))).then(({ ok, j }) => { if (ok && j.test) setTest(j.test); else setErr(j.error || 'Test not found'); }).catch((e) => setErr(e.message)); }, [token]);

  const flat = test ? test.sections.flatMap((s) => s.questions) : [];
  async function submit() {
    setBusy(true);
    try { const r = await fetch('/api/studio/take', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, name, answers }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setResult(j); window.scrollTo({ top: 0, behavior: 'smooth' }); } else setErr(j.error || 'Submit failed'); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const resById = result ? Object.fromEntries(result.results.map((r) => [r.gi, r])) : {};

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      <a href="/" className="brand" style={{ fontSize: 14, marginBottom: 18, display: 'inline-flex' }}><span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>{'◇'}</span>chatwithpdfai<span className="domain">.com</span></a>
      {err && <div className="glass" style={{ padding: 20, borderRadius: 'var(--r-lg)', color: '#ffb4b4', marginTop: 18 }}>{err}</div>}
      {!test && !err && <div className="mono" style={{ color: 'var(--text-4)', marginTop: 30 }}>Loading test{'…'}</div>}
      {test && (
        <div className="glass" style={{ padding: '26px 28px', borderRadius: 'var(--r-xl)', marginTop: 14 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>{test.title}</h1>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 18 }}>{test.institution ? test.institution + ' · ' : ''}{flat.length} questions{test.totalMarks ? ' · ' + test.totalMarks + ' marks' : ''}</div>
          {result ? (
            <div style={{ marginBottom: 18, padding: '14px 16px', borderRadius: 'var(--r)', background: 'var(--glass-2)' }} data-testid="take-score">
              <div style={{ fontSize: 24, fontWeight: 600, color: result.total && result.score / result.total >= 0.5 ? 'var(--green)' : '#ffb4b4' }}>{result.score} / {result.total}{result.total ? ' (' + Math.round(100 * result.score / result.total) + '%)' : ''}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Submitted{name ? ', ' + name : ''}. Review your answers below.</div>
            </div>
          ) : (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="input" style={{ marginBottom: 18, maxWidth: 300, fontSize: 13.5, padding: '8px 12px' }} />
          )}
          {flat.map((q, gi) => { const r = resById[gi]; return (
            <div key={gi} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--stroke-1)' }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5 }}><span style={{ fontWeight: 600, color: 'var(--violet-2)' }}>{gi + 1}.</span><div style={{ flex: 1 }}>{q.type === 'assertion' ? <div><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {q.assertion}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {q.reason}</div></div> : q.type === 'code' ? <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--glass-1)', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{q.q}</pre> : q.type === 'match' ? <span style={{ fontWeight: 600 }}>Match the following</span> : <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</span>}</div></div>
              <div style={{ marginLeft: 22 }}>
                <TakeInput q={q} gi={gi} ua={answers[gi]} locked={!!result} onA={(v) => setAnswers((a) => ({ ...a, [gi]: v }))} />
                {r && r.correct != null && <div style={{ marginTop: 8, fontSize: 12.5, color: r.correct ? 'var(--green)' : '#ffb4b4' }}><b style={{ fontWeight: 600 }}>{r.correct ? '✓ Correct' : '✗ Correct answer:'}</b> {r.correct ? '' : r.answer}{r.explanation ? <span style={{ color: 'var(--text-3)' }}> {'—'} {r.explanation}</span> : null}</div>}
                {r && r.correct == null && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)' }}><b style={{ fontWeight: 600 }}>Model answer:</b> {r.answer}</div>}
              </div>
            </div>
          ); })}
          {!result ? <button onClick={submit} disabled={busy} className={busy ? 'btn btn-glass' : 'btn btn-iris'} data-testid="take-submit">{busy ? 'Submitting…' : 'Submit test'}</button> : <a href={'/t/' + token} className="btn btn-glass">Retake</a>}
        </div>
      )}
    </div>
  );
}
