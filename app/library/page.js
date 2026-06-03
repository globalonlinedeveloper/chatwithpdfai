'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';
import AppFooter from '../_components/AppFooter';

function fmtSize(b) { if (!b) return ''; const mb = b / 1048576; return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function fmtDate(s) { try { return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (e) { return ''; } }

export default function LibraryPage() {
  const [tab, setTab] = useState('docs');
  const [credits, setCredits] = useState(null);
  const [docs, setDocs] = useState(null);
  const [papers, setPapers] = useState(null);
  const [shares, setShares] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => {
    fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    fetch('/api/documents').then((r) => (r.ok ? r.json() : null)).then((j) => setDocs(j && j.documents ? j.documents : [])).catch(() => setDocs([]));
    fetch('/api/papers/library').then((r) => (r.ok ? r.json() : null)).then((j) => setPapers(j && j.papers ? j.papers : [])).catch(() => setPapers([]));
    fetch('/api/papers/assignments').then((r) => (r.ok ? r.json() : null)).then((j) => setShares(j && j.assignments ? j.assignments : [])).catch(() => setShares([]));
  }, []);
  async function delDoc(id, name) {
    if (typeof window !== 'undefined' && !window.confirm('Delete "' + (name || 'this document') + '"? This permanently removes the PDF and its extracted data.')) return;
    setDocs((arr) => (arr || []).filter((d) => d.id !== id));
    try { const r = await fetch('/api/documents/' + id, { method: 'DELETE' }); if (!r.ok) throw new Error('failed'); }
    catch (e) { fetch('/api/documents').then((x) => x.ok ? x.json() : null).then((x) => setDocs(x && x.documents ? x.documents : [])).catch(() => {}); }
  }
  const ql = q.toLowerCase();
  const TABS = [['docs', 'Documents', docs], ['papers', 'Question papers', papers], ['tests', 'Shared tests', shares]];
  const card = { background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-lg)', display: 'block', color: 'inherit', textDecoration: 'none' };
  const empty = (msg, cta, href) => <div className="glass" style={{ padding: '44px 24px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}><div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 14 }}>{msg}</div>{cta && <a href={href} className="btn btn-iris">{cta}</a>}</div>;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="library" credits={credits} />
      <main id="main" style={{ maxWidth: 920, margin: '0 auto', width: '100%', padding: '28px 20px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Library</h1>
          <input className="input" aria-label="Search library" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: '8px 12px', fontSize: 13.5, minWidth: 200 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>{TABS.map(([k, l, arr]) => <button key={k} onClick={() => setTab(k)} className={tab === k ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'}>{l}{arr ? ' (' + arr.length + ')' : ''}</button>)}</div>

        {tab === 'docs' && (docs === null ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}</div> : (() => {
          const list = docs.filter((d) => (d.filename || '').toLowerCase().includes(ql));
          if (!list.length) return empty(q ? 'No matching documents.' : 'No documents yet.', q ? null : '+ Upload your first PDF', '/chat-with-pdf');
          return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>{list.map((d) => (
            <div key={d.id} style={{ position: 'relative' }}>
            <a href={`/chat-with-pdf?doc=${d.id}`} className="glass hover-glow" data-testid="doc-row" style={{ ...card, padding: 16, display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--glass-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-2)', flexShrink: 0 }}><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /></svg></div><span className="pill" style={{ fontSize: 10, padding: '3px 8px', color: d.status === 'ready' ? 'var(--green)' : 'var(--text-3)' }}>{d.status}</span></div>
              <div style={{ fontSize: 14, fontWeight: 600, margin: '12px 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.pageCount ? d.pageCount + ' pp · ' : ''}{fmtSize(d.sizeBytes)}{d.createdAt ? ' · ' + fmtDate(d.createdAt) : ''}</div>
            </a><button onClick={() => delDoc(d.id, d.filename)} data-testid="doc-delete" aria-label={'Delete ' + (d.filename || 'document')} title="Delete document" className="btn btn-glass btn-sm" style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, padding: '2px 7px', lineHeight: 1 }}>✕</button></div>))}</div>;
        })())}

        {tab === 'papers' && (papers === null ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}</div> : (() => {
          const list = papers.filter((p) => (p.title || '').toLowerCase().includes(ql));
          if (!list.length) return empty(q ? 'No matching papers.' : 'No saved papers yet.', q ? null : '+ Generate a paper', '/question-paper-generator');
          return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>{list.map((p) => (
            <a key={p.id} href={`/question-paper-generator?paper=${p.id}`} className="glass hover-glow" style={{ ...card, padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--glass-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-2)', marginBottom: 12 }}><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1" /></svg></div>
              <div style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.numQuestions} Qs{p.examStyle ? ' · ' + p.examStyle : ''}{p.createdAt ? ' · ' + fmtDate(p.createdAt) : ''}</div>
            </a>))}</div>;
        })())}

        {tab === 'tests' && (shares === null ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}</div> : (() => {
          const list = shares.filter((s) => (s.title || '').toLowerCase().includes(ql));
          if (!list.length) return empty(q ? 'No matching tests.' : 'No shared tests yet.', q ? null : 'Go to question papers', '/question-paper-generator');
          return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{list.map((s) => (
            <div key={s.id} className="glass" style={{ padding: '12px 16px', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 160, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}{!s.active ? <span style={{ color: 'var(--text-4)', fontWeight: 400 }}> · paused</span> : null}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.attempts} attempts{s.attempts ? ' · avg ' + s.avgPct + '%' : ''}</span>
              <a href={'/t/' + s.token} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm">Open</a>
              <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.origin + '/t/' + s.token); }} className="btn btn-glass btn-sm">Copy link</button>
              <button onClick={async () => { const na = s.active ? 0 : 1; const rr = await fetch('/api/papers/assignments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, active: na }) }); if (rr.ok) setShares((arr) => arr.map((x) => x.id === s.id ? { ...x, active: na } : x)); }} className="btn btn-glass btn-sm">{s.active ? 'Pause' : 'Resume'}</button>
            </div>))}</div>;
        })())}
      </main>
      <AppFooter />
    </div>
  );
}
