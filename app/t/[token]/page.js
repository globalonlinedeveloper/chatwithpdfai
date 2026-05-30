'use client';
import { useState, useEffect, useMemo, useRef } from 'react';

const LETTER = (i) => String.fromCharCode(97 + i);
const OPT_TYPES = ['mcq', 'code', 'assertion', 'multi'];
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

function TakeInput({ q, ua, locked, onA, optPerm }) {
  const btn = (label, active, onClick) => <button type="button" onClick={onClick} disabled={locked} style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--r)', background: active ? 'var(--glass-2)' : 'var(--glass-1)', border: '1px solid ' + (active ? 'var(--violet)' : 'var(--stroke-2)'), color: 'var(--text)', fontSize: 13.5, cursor: locked ? 'default' : 'pointer', width: '100%' }}>{label}</button>;
  if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion') { const order = optPerm || q.options.map((_, i) => i); return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{order.map((oi, di) => <div key={oi}>{btn(<span>({LETTER(di)}) {q.options[oi]}</span>, ua === oi, () => onA(oi))}</div>)}</div>; }
  if (q.type === 'tf') return <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{[true, false].map((v) => <div key={String(v)} style={{ flex: 1 }}>{btn(v ? 'True' : 'False', ua === v, () => onA(v))}</div>)}</div>;
  if (q.type === 'multi') { const order = optPerm || q.options.map((_, i) => i); const arr = Array.isArray(ua) ? ua : []; return <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{order.map((oi, di) => { const sel = arr.includes(oi); return <div key={oi}>{btn(<span>{sel ? '☑' : '☐'} ({LETTER(di)}) {q.options[oi]}</span>, sel, () => onA(sel ? arr.filter((x) => x !== oi) : [...arr, oi]))}</div>; })}</div>; }
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
  const [prior, setPrior] = useState(null);
  const [secsLeft, setSecsLeft] = useState(null);

  // Refs so the timer's auto-submit always reads the latest answers (avoids stale closure).
  const dataRef = useRef({ answers: {}, name: '' });
  dataRef.current = { answers, name };
  const submittedRef = useRef(false);

  useEffect(() => {
    try { const raw = localStorage.getItem('cwpai_take_' + token); if (raw) setPrior(JSON.parse(raw)); } catch (e) {}
    fetch('/api/studio/take?token=' + encodeURIComponent(token)).then((r) => r.json().then((j) => ({ ok: r.ok, j }))).then(({ ok, j }) => { if (ok && j.test) setTest(j.test); else setErr(j.error || 'Test not found'); }).catch((e) => setErr(e.message));
  }, [token]);

  const flat = test ? test.sections.flatMap((s) => s.questions) : [];
  const seed = useMemo(() => Math.floor(Math.random() * 2147483647), [test]);
  const qOrder = useMemo(() => shuffle(flat.map((_, i) => i), mulberry32(seed)), [seed, flat.length]);
  const optPerms = useMemo(() => { const r = mulberry32((seed ^ 0x9e3779b9) >>> 0); const m = {}; flat.forEach((q, gi) => { if (OPT_TYPES.includes(q.type) && Array.isArray(q.options)) m[gi] = shuffle(q.options.map((_, i) => i), r); }); return m; }, [seed, flat.length]);

  async function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true; setBusy(true);
    try {
      const r = await fetch('/api/studio/take', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, name: dataRef.current.name, answers: dataRef.current.answers }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setResult(j); try { localStorage.setItem('cwpai_take_' + token, JSON.stringify({ score: j.score, total: j.total, at: Date.now() })); } catch (e) {} window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else { setErr(j.error || 'Submit failed'); submittedRef.current = false; }
    } catch (e) { setErr(e.message); submittedRef.current = false; }
    setBusy(false);
  }

  // Countdown timer — enforces durationMin and auto-submits at zero.
  useEffect(() => {
    if (!test || result || prior) return;
    const mins = Number(test.durationMin) || 0; if (mins <= 0) return;
    setSecsLeft(mins * 60);
    const id = setInterval(() => { setSecsLeft((s) => { if (s == null) return s; if (s <= 1) { clearInterval(id); submit(); return 0; } return s - 1; }); }, 1000);
    return () => clearInterval(id);
  }, [test, result, prior]);

  const resById = result ? Object.fromEntries(result.results.map((r) => [r.gi, r])) : {};
  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      <a href="/" className="brand" style={{ fontSize: 14, marginBottom: 18, display: 'inline-flex' }}><span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>{'◇'}</span>chatwithpdfai<span className="domain">.com</span></a>
      {err && <div className="glass" style={{ padding: 20, borderRadius: 'var(--r-lg)', color: '#ffb4b4', marginTop: 18 }}>{err}</div>}
      {!test && !err && <div className="mono" style={{ color: 'var(--text-4)', marginTop: 30 }}>Loading test{'…'}</div>}
      {test && prior && !result && (
        <div className="glass" style={{ padding: '26px 28px', borderRadius: 'var(--r-xl)', marginTop: 14 }} data-testid="already-taken">
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>{test.title}</h1>
          <div style={{ fontSize: 14, color: 'var(--text-2)' }}>You have already completed this test on this device.</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 10, color: 'var(--green)' }}>{prior.score} / {prior.total}{prior.total ? ' (' + Math.round(100 * prior.score / prior.total) + '%)' : ''}</div>
        </div>
      )}
      {test && !prior && (
        <div className="glass" style={{ padding: '26px 28px', borderRadius: 'var(--r-xl)', marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>{test.title}</h1>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 18 }}>{test.institution ? test.institution + ' · ' : ''}{flat.length} questions{test.totalMarks ? ' · ' + test.totalMarks + ' marks' : ''}{test.durationMin ? ' · ' + test.durationMin + ' min' : ''}</div>
            </div>
            {secsLeft != null && !result && <div className="mono" data-testid="take-timer" style={{ fontSize: 15, fontWeight: 600, color: secsLeft < 60 ? '#ffb4b4' : 'var(--text-2)', whiteSpace: 'nowrap' }}>{'⏱ '}{mmss(secsLeft)}</div>}
          </div>
          {result ? (
            <div style={{ marginBottom: 18, padding: '14px 16px', borderRadius: 'var(--r)', background: 'var(--glass-2)' }} data-testid="take-score">
              <div style={{ fontSize: 24, fontWeight: 600, color: result.total && result.score / result.total >= 0.5 ? 'var(--green)' : '#ffb4b4' }}>{result.score} / {result.total}{result.total ? ' (' + Math.round(100 * result.score / result.total) + '%)' : ''}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Submitted{name ? ', ' + name : ''}. Review your answers below.</div>
            </div>
          ) : (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="input" style={{ marginBottom: 18, maxWidth: 300, fontSize: 13.5, padding: '8px 12px' }} />
          )}
          {qOrder.map((gi, di) => { const q = flat[gi]; const r = resById[gi]; return (
            <div key={gi} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--stroke-1)' }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5 }}><span style={{ fontWeight: 600, color: 'var(--violet-2)' }}>{di + 1}.</span><div style={{ flex: 1 }}>{q.type === 'assertion' ? <div><div style={{ whiteSpace: 'pre-wrap' }}><b style={{ fontWeight: 600 }}>Assertion (A):</b> {q.assertion}</div><div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}><b style={{ fontWeight: 600 }}>Reason (R):</b> {q.reason}</div></div> : q.type === 'code' ? <pre style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--glass-1)', padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{q.q}</pre> : q.type === 'match' ? <span style={{ fontWeight: 600 }}>Match the following</span> : <span style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</span>}</div></div>
              <div style={{ marginLeft: 22 }}>
                <TakeInput q={q} ua={answers[gi]} locked={!!result} onA={(v) => setAnswers((a) => ({ ...a, [gi]: v }))} optPerm={optPerms[gi]} />
                {r && r.correct != null && <div style={{ marginTop: 8, fontSize: 12.5, color: r.correct ? 'var(--green)' : '#ffb4b4' }}><b style={{ fontWeight: 600 }}>{r.correct ? '✓ Correct' : '✗ Correct answer:'}</b> {r.correct ? '' : r.answer}{r.explanation ? <span style={{ color: 'var(--text-3)' }}> {'—'} {r.explanation}</span> : null}</div>}
                {r && r.correct == null && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)' }}><b style={{ fontWeight: 600 }}>Model answer:</b> {r.answer}</div>}
              </div>
            </div>
          ); })}
          {!result && <button onClick={submit} disabled={busy} className={busy ? 'btn btn-glass' : 'btn btn-iris'} data-testid="take-submit">{busy ? 'Submitting…' : 'Submit test'}</button>}
        </div>
      )}
    </div>
  );
}
