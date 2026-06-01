'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';
import ToolIcon from '../_components/ToolIcon';
import { liveTools } from '@/lib/tools';

const DOC_ICON = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M9 13h6M9 17h4" /></svg>;
const PAPER_ICON = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 10h6M9 14h4" /></svg>;
const DOC_S = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /></svg>;
const PAPER_S = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1" /></svg>;
const TEST_S = <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;

function relTime(s) { if (!s) return ''; const d = new Date(s); const sec = (Date.now() - d.getTime()) / 1000; if (sec < 60) return 'just now'; if (sec < 3600) return Math.floor(sec / 60) + 'm ago'; if (sec < 86400) return Math.floor(sec / 3600) + 'h ago'; if (sec < 604800) return Math.floor(sec / 86400) + 'd ago'; try { return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (e) { return ''; } }
function fmtSize(b) { if (!b) return ''; const mb = b / 1048576; return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function greet() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

function Tile({ icon, title, desc, openHref, openLabel, newHref, newLabel, sub }) {
  return (
    <div className="glass" style={{ padding: '20px 22px', borderRadius: 'var(--r-xl)', border: '1px solid var(--stroke-2)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{desc}</div>
      <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 8, minHeight: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub || ''}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <a href={openHref} className="btn btn-iris btn-sm">{openLabel}</a>
        <a href={newHref} className="btn btn-glass btn-sm">{newLabel}</a>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [credits, setCredits] = useState(null);
  const [name, setName] = useState('');
  const [verified, setVerified] = useState(true);
  const [docs, setDocs] = useState([]);
  const [papers, setPapers] = useState([]);
  const [tests, setTests] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState('');
  useEffect(() => {
    fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    const a = fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.user) { setName(String(j.user.name || j.user.email || '').split('@')[0]); setVerified(!!j.user.emailVerified); } }).catch(() => {});
    const b = fetch('/api/documents').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && Array.isArray(j.documents)) setDocs(j.documents); }).catch(() => {});
    const c = fetch('/api/papers/library').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && Array.isArray(j.papers)) setPapers(j.papers); }).catch(() => {});
    const d = fetch('/api/papers/assignments').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && Array.isArray(j.assignments)) setTests(j.assignments); }).catch(() => {});
    Promise.allSettled([a, b, c, d]).then(() => setLoaded(true));
  }, []);
  const readyDocs = docs.filter((d) => d.status === 'ready');
  const byDate = (arr, k) => arr.slice().sort((a, b) => new Date(b[k] || 0) - new Date(a[k] || 0));
  const lastDoc = byDate(readyDocs, 'createdAt')[0];
  const lastPaper = byDate(papers, 'createdAt')[0];
  const steps = [
    { done: verified, label: 'Verify your email', href: '/account', cta: 'Verify' },
    { done: readyDocs.length > 0, label: 'Upload your first PDF', href: '/chat-with-pdf', cta: 'Upload' },
    { done: papers.length > 0, label: 'Generate your first question paper', href: '/question-paper-generator', cta: 'Generate' },
  ];
  const allDone = steps.every((s) => s.done);
  const recent = [
    ...papers.map((p) => ({ key: 'p' + p.id, kind: 'paper', label: 'Paper', icon: PAPER_S, title: p.title, at: p.createdAt, href: '/question-paper-generator?paper=' + p.id, meta: p.numQuestions ? p.numQuestions + ' Qs' : '' })),
    ...readyDocs.map((d) => ({ key: 'd' + d.id, kind: 'document', label: 'PDF', icon: DOC_S, title: d.filename, at: d.createdAt || d.uploadedAt, href: '/chat-with-pdf?doc=' + d.id, meta: [d.pageCount ? d.pageCount + ' pp' : '', fmtSize(d.sizeBytes)].filter(Boolean).join(' · ') })),
    ...tests.map((t) => ({ key: 't' + t.id, kind: 'test', label: 'Test', icon: TEST_S, title: t.title, at: t.createdAt, href: '/t/' + t.token, external: true, token: t.token, meta: t.attempts ? t.attempts + ' attempt' + (t.attempts > 1 ? 's' : '') : 'no attempts yet' })),
  ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, 8);
  function copyLink(token) { try { navigator.clipboard.writeText(window.location.origin + '/t/' + token); setCopied(token); setTimeout(() => setCopied(''), 1500); } catch (e) {} }
  let suggest = null;
  if (loaded) {
    if (readyDocs.length && !papers.length) suggest = { text: 'You have a document — turn it into a question paper.', href: '/question-paper-generator', cta: 'Generate' };
    else if (papers.length && !tests.length) suggest = { text: 'Share one of your papers as an online test for students.', href: '/question-paper-generator', cta: 'Open' };
  }
  const tileMeta = {
    'chat-with-pdf': { openLabel: readyDocs.length ? ('Open \u00b7 ' + readyDocs.length + ' doc' + (readyDocs.length > 1 ? 's' : '')) : 'Open', newHref: '/chat-with-pdf', newLabel: '+ Upload PDF', sub: lastDoc ? ('Last: ' + lastDoc.filename + ' \u00b7 ' + relTime(lastDoc.createdAt)) : '' },
    'question-paper-generator': { openLabel: papers.length ? ('Open \u00b7 ' + papers.length + ' paper' + (papers.length > 1 ? 's' : '')) : 'Open', newHref: '/question-paper-generator', newLabel: '+ New paper', sub: lastPaper ? ('Last: ' + lastPaper.title + ' \u00b7 ' + relTime(lastPaper.createdAt)) : '' },
  };
  const stats = [
    { label: 'Documents', value: readyDocs.length, href: '/library' },
    { label: 'Question papers', value: papers.length, href: '/library' },
    { label: 'Shared tests', value: tests.length, href: '/library' },
    { label: 'Credits', value: credits == null ? '…' : credits.toLocaleString('en-IN'), href: '/buy' },
  ];
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="home" credits={credits} />
      <main id="main" style={{ maxWidth: 980, margin: '0 auto', width: '100%', padding: '30px 20px 60px' }}>
        {credits != null && credits < 10 && <div style={{ background: 'rgba(255,189,46,0.12)', border: '1px solid rgba(255,189,46,0.4)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: '#ffd27a', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ flex: 1, minWidth: 200 }}>You&rsquo;re low on credits ({credits} left).</span><a href="/buy" className="btn btn-glass btn-sm">Buy credits</a></div>}
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 3px' }}>{greet()}{name ? ', ' + name : ''}</h1>
        <div style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: 18 }}>Pick a tool to get started.{credits != null ? ' You have ' + credits.toLocaleString('en-IN') + ' credits.' : ''}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 26 }}>
          {stats.map((s) => (
            <a key={s.label} href={s.href} className="glass" style={{ display: 'block', padding: '12px 16px', borderRadius: 'var(--r-lg)', textDecoration: 'none', color: 'var(--text)', border: '1px solid var(--stroke-2)' }}>
              <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
            </a>
          ))}
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: suggest ? 14 : 30 }}>
          {liveTools().map((t) => { const m = tileMeta[t.slug] || {}; return <Tile key={t.slug} icon={<ToolIcon name={t.icon} size={22} stroke="#fff" />} title={t.name} desc={t.tagline} openHref={t.appHref} openLabel={m.openLabel || 'Open'} newHref={m.newHref || t.appHref} newLabel={m.newLabel || 'Open'} sub={m.sub || ''} />; })}
        </div>

        {suggest && (
          <div className="glass" style={{ border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 30, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: 'var(--text-2)' }}><span className="mono" style={{ fontSize: 10.5, color: 'var(--violet-2)', letterSpacing: '0.08em', marginRight: 8 }}>SUGGESTED</span>{suggest.text}</span>
            <a href={suggest.href} className="btn btn-glass btn-sm">{suggest.cta}</a>
          </div>
        )}

        {recent.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="eyebrow">Recent</div>
              <a href="/library" style={{ fontSize: 12.5, color: 'var(--violet-2)', textDecoration: 'none' }}>View all in Library →</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {recent.map((r) => (
                <div key={r.key} className="glass" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--r)' }}>
                  <span style={{ width: 24, height: 24, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-2)' }}>{r.icon}</span>
                  <a href={r.href} {...(r.external ? { target: '_blank', rel: 'noreferrer' } : {})} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'var(--text)' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5 }}>{r.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2 }}>{r.label}{r.meta ? ' · ' + r.meta : ''}{r.at ? ' · ' + relTime(r.at) : ''}</div>
                  </a>
                  {r.kind === 'test' && <button onClick={() => copyLink(r.token)} className="btn btn-glass btn-sm" style={{ fontSize: 11.5 }}>{copied === r.token ? 'Copied' : 'Copy link'}</button>}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
