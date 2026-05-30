'use client';
import { useState, useEffect } from 'react';
import SiteShell, { PageHeader } from '../_components/Chrome';

const QUICK = ['TNPSC Group 4 — General Studies', 'Indian Polity & Constitution', 'Tamil Nadu history & geography', 'General Science', 'Current affairs (India)'];
const LETTER = (i) => String.fromCharCode(97 + i);

export default function StudioPage() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
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

  async function generate() {
    const t = topic.trim();
    if (t.length < 3) { setNote('Describe a topic or syllabus first.'); return; }
    setBusy(true); setNote(''); setPaper(null); setUsed(null);
    try {
      const r = await fetch('/api/studio/paper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: t, count, language }) });
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

  const ctrl = { padding: '9px 12px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 13.5, fontFamily: 'inherit' };

  return (
    <SiteShell active="studio">
      <PageHeader eyebrow="Studio · beta" title="Question paper generator" lede="Describe a topic or syllabus and get a mock test with an answer key — ready to print or save as PDF. Every generation uses credits." />
      <section className="spread" style={{ paddingBottom: 70 }}>
        <div className="glass glass-iris-border no-print" style={{ padding: '22px 24px', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {QUICK.map((qx) => (
              <button key={qx} type="button" onClick={() => setTopic(qx)} className="chip" style={{ cursor: 'pointer', fontSize: 12.5 }}>{qx}</button>
            ))}
          </div>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="e.g. TNPSC Group 4 — Indian polity, Tamil Nadu geography and general science"
            className="input" style={{ width: '100%', resize: 'vertical', minHeight: 60, fontFamily: 'inherit', padding: '12px 14px' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <label style={{ fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 7 }}>
              Questions
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={ctrl}>
                {[5, 10, 15, 20, 25].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 7 }}>
              Language
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={ctrl}>
                <option value="en">English</option>
                <option value="ta-en">Tamil + English</option>
              </select>
            </label>
            <div style={{ flex: 1 }}></div>
            {credits != null && (
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)', letterSpacing: '0.06em' }}>◆ {credits.toLocaleString('en-IN')} CR <a href="/buy" style={{ color: 'var(--violet-2)' }}>+ Buy</a></span>
            )}
            <button onClick={generate} disabled={busy} className={busy ? 'btn btn-glass' : 'btn btn-iris'} data-testid="gen-paper">
              {busy ? 'Generating…' : 'Generate paper →'}
            </button>
          </div>
          {note && <div style={{ marginTop: 12, fontSize: 13, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
          <div className="mono" style={{ marginTop: 12, fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.06em' }}>Answers are AI-generated — spot-check before using in a real exam.</div>
        </div>

        {paper && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 12px' }} className="no-print">
              <button onClick={() => window.print()} className="btn btn-iris" data-testid="save-pdf">Save as PDF / Print</button>
              <button onClick={generate} className="btn btn-glass">Regenerate</button>
              {used != null && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>used {used} credit{used === 1 ? '' : 's'}{paper.provider ? ' · ' + paper.provider : ''}</span>}
            </div>

            <div id="paper-print" style={{ background: '#fff', color: '#111', borderRadius: 'var(--r-lg)', padding: '40px 44px', maxWidth: 820, margin: '0 auto', border: '1px solid var(--stroke-2)' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 14, marginBottom: 22 }}>
                <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>{paper.title}</div>
                <div style={{ fontSize: 12.5, color: '#555', marginTop: 6 }}>{paper.questions.length} questions · 1 mark each · time: {Math.max(10, paper.questions.length * 1)} min</div>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 18 }}>Instructions: choose the single best answer for each question. The answer key is on the last page.</div>
              <ol style={{ paddingLeft: 22, margin: 0 }}>
                {paper.questions.map((q, i) => (
                  <li key={i} style={{ marginBottom: 18, fontSize: 14, lineHeight: 1.55 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{q.q}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', marginTop: 8 }}>
                      {q.options.map((o, oi) => (
                        <div key={oi} style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>({LETTER(oi)}) {o}</div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="pagebreak" style={{ marginTop: 30, borderTop: '2px solid #111', paddingTop: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Answer key</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 7 }}>
                  {paper.questions.map((q, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <b>{i + 1}.</b> ({LETTER(q.answer)}) {q.options[q.answer]}{q.explanation ? <span style={{ color: '#555' }}> — {q.explanation}</span> : null}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: '#888', marginTop: 20, textAlign: 'center' }}>Generated with chatwithpdfai.com · verify answers before exam use</div>
              </div>
            </div>
          </>
        )}
      </section>
      <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden !important; } #paper-print, #paper-print * { visibility: visible !important; } #paper-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; border: none !important; border-radius: 0 !important; padding: 0 !important; } .pagebreak { page-break-before: always; } }` }} />
    </SiteShell>
  );
}
