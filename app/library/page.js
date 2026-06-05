'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';
import AppFooter from '../_components/AppFooter';

function fmtSize(b) { if (!b) return ''; const mb = b / 1048576; return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function fmtDate(s) { try { return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (e) { return ''; } }
function tplSummary(c) { const secs = (c && Array.isArray(c.sections)) ? c.sections : []; const n = secs.length; const marks = secs.reduce((m, x) => m + (Number(x.count) || 0) * (Number(x.marks) || 0), 0); const types = [...new Set(secs.map((x) => x.type).filter(Boolean))].slice(0, 3).join(', '); return n + ' section' + (n === 1 ? '' : 's') + (marks ? ' · ' + marks + ' marks' : '') + (types ? ' · ' + types : ''); }

const TAB_DEFS = [['docs', 'Documents'], ['papers', 'Question papers'], ['tests', 'Shared tests'], ['bank', 'Question bank'], ['templates', 'Templates']];
const TAB_KEYS = TAB_DEFS.map(([k]) => k);
const TAB_CTA = { docs: { label: '+ Upload PDF', href: '/chat-with-pdf' }, papers: { label: '+ New paper', href: '/question-paper-generator' }, tests: { label: '+ New test', href: '/question-paper-generator' }, bank: { label: 'Open generator', href: '/question-paper-generator' }, templates: { label: 'Open generator', href: '/question-paper-generator' } };

const ICON = {
  docs: <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5" /><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /></svg>,
  papers: <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1" /></svg>,
  bank: <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  templates: <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
};

export default function LibraryPage() {
  const [tab, setTab] = useState('docs');
  const [credits, setCredits] = useState(null);
  const [docs, setDocs] = useState(null);
  const [papers, setPapers] = useState(null);
  const [shares, setShares] = useState(null);
  const [bank, setBank] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState('');
  useEffect(() => {
    try { const t = new URLSearchParams(window.location.search).get('tab'); if (t && TAB_KEYS.includes(t)) setTab(t); } catch (e) {}
  }, []);
  useEffect(() => {
    try { const u = new URL(window.location.href); if (u.searchParams.get('tab') !== tab) { u.searchParams.set('tab', tab); window.history.replaceState(null, '', u.toString()); } } catch (e) {}
  }, [tab]);
  useEffect(() => {
    fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    fetch('/api/documents').then((r) => (r.ok ? r.json() : null)).then((j) => setDocs(j && j.documents ? j.documents : [])).catch(() => setDocs([]));
    fetch('/api/papers/library').then((r) => (r.ok ? r.json() : null)).then((j) => setPapers(j && j.papers ? j.papers : [])).catch(() => setPapers([]));
    fetch('/api/papers/assignments').then((r) => (r.ok ? r.json() : null)).then((j) => setShares(j && j.assignments ? j.assignments : [])).catch(() => setShares([]));
    fetch('/api/papers/bank').then((r) => (r.ok ? r.json() : null)).then((j) => setBank(j && j.items ? j.items : [])).catch(() => setBank([]));
    fetch('/api/papers/templates').then((r) => (r.ok ? r.json() : null)).then((j) => setTemplates(j && j.templates ? j.templates : [])).catch(() => setTemplates([]));
  }, []);
  async function delDoc(id, name) {
    if (typeof window !== 'undefined' && !window.confirm('Delete "' + (name || 'this document') + '"? This permanently removes the PDF and its extracted data.')) return;
    setDocs((arr) => (arr || []).filter((d) => d.id !== id));
    try { const r = await fetch('/api/documents/' + id, { method: 'DELETE' }); if (!r.ok) throw new Error('failed'); }
    catch (e) { fetch('/api/documents').then((x) => x.ok ? x.json() : null).then((x) => setDocs(x && x.documents ? x.documents : [])).catch(() => {}); }
  }
  async function delPaper(id, name) {
    if (typeof window !== 'undefined' && !window.confirm('Delete "' + (name || 'this paper') + '"? This removes the saved question paper from your library.')) return;
    setPapers((arr) => (arr || []).filter((p) => p.id !== id));
    try { const r = await fetch('/api/papers/library?id=' + id, { method: 'DELETE' }); if (!r.ok) throw new Error('failed'); }
    catch (e) { fetch('/api/papers/library').then((x) => x.ok ? x.json() : null).then((x) => setPapers(x && x.papers ? x.papers : [])).catch(() => {}); }
  }
  async function duplicatePaper(id, name) {
    try {
      const r = await fetch('/api/papers/library?id=' + id); const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.paper) throw new Error('load');
      const copy = { ...j.paper, title: 'Copy of ' + (j.paper.title || name || 'paper') };
      const rr = await fetch('/api/papers/library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper: copy }) });
      if (!rr.ok) throw new Error('save');
      fetch('/api/papers/library').then((x) => x.ok ? x.json() : null).then((x) => setPapers(x && x.papers ? x.papers : [])).catch(() => {});
    } catch (e) {}
  }
  async function delShare(id, name) {
    if (typeof window !== 'undefined' && !window.confirm('Delete shared test "' + (name || 'this test') + '"? The share link will stop working and all student attempts and results for it will be permanently removed.')) return;
    setShares((arr) => (arr || []).filter((s) => s.id !== id));
    try { const r = await fetch('/api/papers/assignments?id=' + id, { method: 'DELETE' }); if (!r.ok) throw new Error('failed'); }
    catch (e) { fetch('/api/papers/assignments').then((x) => x.ok ? x.json() : null).then((x) => setShares(x && x.assignments ? x.assignments : [])).catch(() => {}); }
  }
  async function delBankItem(id) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this saved question from your bank?')) return;
    setBank((arr) => (arr || []).filter((b) => b.id !== id));
    try { const r = await fetch('/api/papers/bank?id=' + id, { method: 'DELETE' }); if (!r.ok) throw new Error('failed'); }
    catch (e) { fetch('/api/papers/bank').then((x) => x.ok ? x.json() : null).then((x) => setBank(x && x.items ? x.items : [])).catch(() => {}); }
  }
  async function delTemplate(id, name) {
    if (typeof window !== 'undefined' && !window.confirm('Delete template "' + (name || 'this template') + '"? This removes the saved build setup.')) return;
    setTemplates((arr) => (arr || []).filter((t) => t.id !== id));
    try { const r = await fetch('/api/papers/templates?id=' + id, { method: 'DELETE' }); if (!r.ok) throw new Error('failed'); }
    catch (e) { fetch('/api/papers/templates').then((x) => x.ok ? x.json() : null).then((x) => setTemplates(x && x.templates ? x.templates : [])).catch(() => {}); }
  }
  function flash(key) { setCopied(key); setTimeout(() => setCopied(''), 1500); }
  function copyTestLink(token) { try { if (navigator.clipboard) navigator.clipboard.writeText(window.location.origin + '/t/' + token); flash('t' + token); } catch (e) {} }
  function copyText(key, text) { try { if (navigator.clipboard) navigator.clipboard.writeText(text || ''); flash(key); } catch (e) {} }
  async function toggleShare(s) { const na = s.active ? 0 : 1; const rr = await fetch('/api/papers/assignments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, active: na }) }); if (rr.ok) setShares((arr) => arr.map((x) => x.id === s.id ? { ...x, active: na } : x)); }

  const ql = q.toLowerCase();
  function filterList(key, arr) {
    if (!arr || !ql) return arr || [];
    if (key === 'docs') return arr.filter((d) => (d.filename || '').toLowerCase().includes(ql));
    if (key === 'papers') return arr.filter((p) => (p.title || '').toLowerCase().includes(ql));
    if (key === 'tests') return arr.filter((s) => (s.title || '').toLowerCase().includes(ql));
    if (key === 'bank') return arr.filter((b) => ((b.stem || '') + ' ' + (b.topic || '')).toLowerCase().includes(ql));
    if (key === 'templates') return arr.filter((t) => (t.name || '').toLowerCase().includes(ql));
    return arr;
  }
  const dataFor = { docs, papers, tests: shares, bank, templates };
  function tabCount(key) { const arr = dataFor[key]; if (!arr) return null; return ql ? filterList(key, arr).length : arr.length; }
  function otherMatches(activeKey) { return TAB_DEFS.filter(([k]) => k !== activeKey).map(([k, l]) => [l, tabCount(k)]).filter((x) => x[1] > 0); }
  function tabKeyNav(e) {
    const ks = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (!ks.includes(e.key)) return; e.preventDefault();
    let i = TAB_KEYS.indexOf(tab);
    if (e.key === 'ArrowLeft') i = (i - 1 + TAB_KEYS.length) % TAB_KEYS.length; else if (e.key === 'ArrowRight') i = (i + 1) % TAB_KEYS.length; else if (e.key === 'Home') i = 0; else i = TAB_KEYS.length - 1;
    const nk = TAB_KEYS[i]; setTab(nk); try { const el = document.getElementById('tab-' + nk); if (el) el.focus(); } catch (e2) {}
  }

  const card = { background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-lg)', display: 'block', color: 'inherit', textDecoration: 'none' };
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 };
  const iconBox = { width: 36, height: 36, borderRadius: 9, background: 'var(--glass-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-2)', flexShrink: 0 };
  const metaLine = { fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase' };
  const delBtn = { fontSize: 11, padding: '2px 7px', lineHeight: 1 };
  const skel = <div style={grid}>{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}</div>;
  const empty = (msg, cta, href) => <div className="glass" style={{ padding: '44px 24px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}><div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 14 }}>{msg}</div>{cta && <a href={href} className="btn btn-iris">{cta}</a>}</div>;
  const searchEmpty = (activeKey, noun) => { const others = otherMatches(activeKey); return <div className="glass" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}><div style={{ fontSize: 15, color: 'var(--text-2)' }}>No matching {noun} in this tab.</div>{others.length ? <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginTop: 10 }}>Also found in: {others.map((o) => o[0] + ' (' + o[1] + ')').join(' · ')}</div> : null}</div>; };

  const cta = TAB_CTA[tab];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="library" credits={credits} />
      <main id="main" style={{ maxWidth: 920, margin: '0 auto', width: '100%', padding: '28px 20px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Library</h1>
          <input className="input" aria-label="Search library" placeholder="Search your library…" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: '8px 12px', fontSize: 13.5, minWidth: 200 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div role="tablist" aria-label="Library categories" onKeyDown={tabKeyNav} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAB_DEFS.map(([k, l]) => { const c = tabCount(k); const sel = tab === k; return (
              <button key={k} id={'tab-' + k} role="tab" aria-selected={sel} aria-controls={'panel-' + k} tabIndex={sel ? 0 : -1} onClick={() => setTab(k)} className={sel ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} style={ql && c === 0 ? { opacity: 0.45 } : undefined}>{l}{c != null ? ' (' + c + ')' : ''}</button>
            ); })}
          </div>
          {cta && <a href={cta.href} className="btn btn-iris btn-sm" data-testid="lib-create">{cta.label}</a>}
        </div>

        <div role="tabpanel" id={'panel-' + tab} aria-labelledby={'tab-' + tab}>
        {tab === 'docs' && (docs === null ? skel : (() => {
          const list = filterList('docs', docs);
          if (!list.length) return q ? searchEmpty('docs', 'documents') : empty('No documents yet.', '+ Upload your first PDF', '/chat-with-pdf');
          return <div style={grid}>{list.map((d) => { const ready = d.status === 'ready'; const body = (<>
              <div style={{ ...iconBox, marginBottom: 12 }}>{ICON.docs}</div>
              <div style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</div>
              <div className="mono" style={metaLine}><span style={{ color: ready ? 'var(--green)' : 'var(--text-3)' }}>{d.status}</span>{d.pageCount ? ' · ' + d.pageCount + ' pp' : ''}{d.sizeBytes ? ' · ' + fmtSize(d.sizeBytes) : ''}{d.createdAt ? ' · ' + fmtDate(d.createdAt) : ''}</div>
            </>);
            return (<div key={d.id} style={{ position: 'relative' }}>
              {ready
                ? <a href={`/chat-with-pdf?doc=${d.id}`} className="glass hover-glow" data-testid="doc-row" style={{ ...card, padding: 16 }}>{body}</a>
                : <div className="glass" data-testid="doc-row" title="Still processing — available once ready" style={{ ...card, padding: 16, opacity: 0.6, cursor: 'default' }}>{body}</div>}
              <button onClick={() => delDoc(d.id, d.filename)} data-testid="doc-delete" aria-label={'Delete ' + (d.filename || 'document')} title="Delete document" className="btn btn-glass btn-sm" style={{ position: 'absolute', top: 10, right: 10, ...delBtn }}>✕</button>
            </div>); })}</div>;
        })())}

        {tab === 'papers' && (papers === null ? skel : (() => {
          const list = filterList('papers', papers);
          if (!list.length) return q ? searchEmpty('papers', 'papers') : empty('No saved papers yet.', '+ Generate a paper', '/question-paper-generator');
          return <div style={grid}>{list.map((p) => (
            <div key={p.id} style={{ position: 'relative' }}>
            <a href={`/question-paper-generator?paper=${p.id}`} className="glass hover-glow" data-testid="paper-row" style={{ ...card, padding: 16 }}>
              <div style={{ ...iconBox, marginBottom: 12 }}>{ICON.papers}</div>
              <div style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 56 }}>{p.title}</div>
              <div className="mono" style={metaLine}>{p.numQuestions} Qs{p.examStyle ? ' · ' + p.examStyle : ''}{p.createdAt ? ' · ' + fmtDate(p.createdAt) : ''}</div>
            </a>
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
              <button onClick={() => duplicatePaper(p.id, p.title)} data-testid="paper-duplicate" aria-label={'Duplicate ' + (p.title || 'paper')} title="Duplicate paper" className="btn btn-glass btn-sm" style={delBtn}>⧉</button>
              <button onClick={() => delPaper(p.id, p.title)} data-testid="paper-delete" aria-label={'Delete ' + (p.title || 'paper')} title="Delete paper" className="btn btn-glass btn-sm" style={delBtn}>✕</button>
            </div></div>))}</div>;
        })())}

        {tab === 'tests' && (shares === null ? skel : (() => {
          const list = filterList('tests', shares);
          if (!list.length) return q ? searchEmpty('tests', 'tests') : empty('No shared tests yet.', 'Go to question papers', '/question-paper-generator');
          return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{list.map((s) => (
            <div key={s.id} className="glass" style={{ padding: '12px 16px', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 160, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}{!s.active ? <span style={{ color: 'var(--text-4)', fontWeight: 400 }}> · paused</span> : null}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.attempts} attempts{s.attempts ? ' · avg ' + s.avgPct + '%' : ''}</span>
              {s.attempts > 0 && <a href={`/question-paper-generator?test=${s.id}`} className="btn btn-glass btn-sm" data-testid="test-results">Results</a>}
              <a href={'/t/' + s.token} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm">Open</a>
              <button onClick={() => copyTestLink(s.token)} className="btn btn-glass btn-sm" data-testid="test-copy">{copied === 't' + s.token ? 'Copied' : 'Copy link'}</button>
              <button onClick={() => toggleShare(s)} className="btn btn-glass btn-sm">{s.active ? 'Pause' : 'Resume'}</button>
              <button onClick={() => delShare(s.id, s.title)} data-testid="share-delete" aria-label={'Delete shared test ' + (s.title || '')} title="Delete shared test" className="btn btn-glass btn-sm" style={{ color: 'var(--red, #e5484d)' }}>Delete</button>
            </div>))}</div>;
        })())}

        {tab === 'bank' && (bank === null ? skel : (() => {
          const list = filterList('bank', bank);
          if (!list.length) return q ? searchEmpty('bank', 'questions') : empty('No saved questions yet. Save questions from a paper with the star.', 'Open the generator', '/question-paper-generator');
          return <div style={grid}>{list.map((b) => (
            <div key={b.id} className="glass" data-testid="bank-card" style={{ ...card, padding: 16, position: 'relative' }}>
              <div style={{ ...iconBox, marginBottom: 12 }}>{ICON.bank}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 4px', paddingRight: 70, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.stem}</div>
              <div className="mono" style={metaLine}>{b.type}{b.topic ? ' · ' + b.topic : ''}{b.createdAt ? ' · ' + fmtDate(b.createdAt) : ''}</div>
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <button onClick={() => copyText('b' + b.id, b.stem)} data-testid="bank-copy" aria-label="Copy question text" title="Copy question text" className="btn btn-glass btn-sm" style={delBtn}>{copied === 'b' + b.id ? 'Copied' : 'Copy'}</button>
                <button onClick={() => delBankItem(b.id)} data-testid="bank-card-delete" aria-label="Delete saved question" title="Delete from bank" className="btn btn-glass btn-sm" style={delBtn}>✕</button>
              </div></div>))}</div>;
        })())}

        {tab === 'templates' && (templates === null ? skel : (() => {
          const list = filterList('templates', templates);
          if (!list.length) return q ? searchEmpty('templates', 'templates') : empty('No saved templates yet. Save a build setup from the generator.', 'Open the generator', '/question-paper-generator');
          return <div style={grid}>{list.map((t) => (
            <div key={t.id} style={{ position: 'relative' }} data-testid="tpl-card">
            <a href={`/question-paper-generator?tpl=${t.id}`} className="glass hover-glow" data-testid="tpl-row" style={{ ...card, padding: 16 }}>
              <div style={{ ...iconBox, marginBottom: 12 }}>{ICON.templates}</div>
              <div style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 30 }}>{t.name}</div>
              <div className="mono" style={metaLine}>{tplSummary(t.config)}{t.createdAt ? ' · ' + fmtDate(t.createdAt) : ''}</div>
            </a><button onClick={() => delTemplate(t.id, t.name)} data-testid="tpl-card-delete" aria-label={'Delete template ' + (t.name || '')} title="Delete template" className="btn btn-glass btn-sm" style={{ position: 'absolute', top: 10, right: 10, ...delBtn }}>✕</button></div>))}</div>;
        })())}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
