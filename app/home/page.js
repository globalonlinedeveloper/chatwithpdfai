'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';

const DOC_ICON = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M9 13h6M9 17h4" /></svg>;
const PAPER_ICON = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 10h6M9 14h4" /></svg>;

function Tile({ href, icon, title, desc, cta }) {
  return (
    <a href={href} className="glass" style={{ display: 'block', padding: '20px 22px', borderRadius: 'var(--r-xl)', textDecoration: 'none', color: 'var(--text)', border: '1px solid var(--stroke-2)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 16 }}>{desc}</div>
      <div style={{ fontSize: 13, color: 'var(--violet-2)' }}>{cta} {'→'}</div>
    </a>
  );
}

export default function HomePage() {
  const [credits, setCredits] = useState(null);
  const [name, setName] = useState('');
  const [verified, setVerified] = useState(true);
  const [docs, setDocs] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    const a = fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.user) { setName(String(j.user.name || j.user.email || '').split('@')[0]); setVerified(!!j.user.emailVerified); } }).catch(() => {});
    const b = fetch('/api/documents').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && Array.isArray(j.documents)) setDocs(j.documents); }).catch(() => {});
    const c = fetch('/api/papers/papers').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && Array.isArray(j.papers)) setPapers(j.papers); }).catch(() => {});
    Promise.allSettled([a, b, c]).then(() => setLoaded(true));
  }, []);
  const readyDocs = docs.filter((d) => d.status === 'ready');
  const steps = [
    { done: verified, label: 'Verify your email', href: '/account', cta: 'Verify' },
    { done: readyDocs.length > 0, label: 'Upload your first PDF', href: '/workspace', cta: 'Upload' },
    { done: papers.length > 0, label: 'Generate your first question paper', href: '/papers', cta: 'Generate' },
  ];
  const allDone = steps.every((s) => s.done);
  const recent = [
    ...papers.map((p) => ({ key: 'p' + p.id, kind: 'paper', title: p.title, at: p.createdAt, href: '/papers?paper=' + p.id })),
    ...readyDocs.map((d) => ({ key: 'd' + d.id, kind: 'document', title: d.filename, at: d.createdAt || d.uploadedAt, href: '/workspace?doc=' + d.id })),
  ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, 6);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="home" credits={credits} />
      <main id="main" style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '30px 20px 60px' }}>
        {credits != null && credits < 10 && <div style={{ background: 'rgba(255,189,46,0.12)', border: '1px solid rgba(255,189,46,0.4)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: '#ffd27a', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ flex: 1, minWidth: 200 }}>You&rsquo;re low on credits ({credits} left).</span><a href="/buy" className="btn btn-glass btn-sm">Buy credits</a></div>}
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 3px' }}>Welcome back{name ? ', ' + name : ''}</h1>
        <div style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: 24 }}>Pick a tool to get started.{credits != null ? ' You have ' + credits.toLocaleString('en-IN') + ' credits.' : ''}</div>
        {loaded && !allDone && (
          <div className="glass" style={{ border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginBottom: 24 }} data-testid="onboarding">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Get started ({steps.filter((s) => s.done).length}/3)</div>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: step.done ? 'var(--green)' : 'transparent', border: '1.5px solid ' + (step.done ? 'var(--green)' : 'var(--stroke-3)'), color: '#fff', fontSize: 11 }}>{step.done ? '✓' : ''}</span>
                <span style={{ flex: 1, fontSize: 13.5, color: step.done ? 'var(--text-3)' : 'var(--text)', textDecoration: step.done ? 'line-through' : 'none' }}>{step.label}</span>
                {!step.done && <a href={step.href} className="btn btn-glass btn-sm">{step.cta}</a>}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 30 }}>
          <Tile href="/workspace" icon={DOC_ICON} title="Chat with PDF" desc="Upload a document and ask questions — answers cite the exact pages." cta={readyDocs.length ? ('Open · ' + readyDocs.length + ' document' + (readyDocs.length > 1 ? 's' : '')) : 'Upload your first PDF'} />
          <Tile href="/papers" icon={PAPER_ICON} title="Generate question paper" desc="Build exam papers with answer keys — practice, print, or share as a test." cta={papers.length ? ('Open · ' + papers.length + ' paper' + (papers.length > 1 ? 's' : '')) : 'Generate your first paper'} />
        </div>
        {recent.length > 0 && (
          <>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Recent</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {recent.map((r) => (
                <a key={r.key} href={r.href} className="glass" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--r)', textDecoration: 'none', color: 'var(--text)' }}>
                  <span style={{ width: 24, height: 24, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-2)' }}>{r.kind === 'paper' ? PAPER_ICON_S : DOC_ICON_S}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5 }}>{r.title}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)' }}>{r.kind}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
const DOC_ICON_S = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /></svg>;
const PAPER_ICON_S = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1" /></svg>;
