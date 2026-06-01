'use client';
import AppNav from '../_components/AppNav';
import { useState, useEffect, useRef } from 'react';

async function jget(url) { const r = await fetch(url); const j = await r.json().catch(() => ({})); return { ok: r.ok, status: r.status, j }; }
function fmtSize(b) { if (!b) return ''; const mb = b / 1048576; return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

const STARTERS = ['Summarize this document', 'What are the key points?', 'List the main sections', 'Any important dates or figures?'];

function exportConversation(doc, messages) {
  if (!messages || messages.length === 0) { alert('No conversation to export yet \u2014 ask a question first.'); return; }
  const date = new Date().toISOString().slice(0, 10);
  const out = [`# CHATWITHPDFAI \u2014 ${doc?.filename || 'Conversation'}`, `Exported ${date}${doc?.pageCount ? ' \u00b7 ' + doc.pageCount + ' pages' : ''}`, ''];
  for (const m of messages) {
    if (m.role === 'user') { out.push('## You', '', m.text, ''); }
    else {
      out.push('## Assistant', '', m.text, '');
      if (m.citations && m.citations.length) out.push('', `_Cited pages: ${m.citations.map((p) => 'p.' + p).join(', ')}_`, '');
    }
  }
  const blob = new Blob([out.join('\n')], { type: 'text/markdown' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  const safe = (doc?.filename || 'conversation').replace(/\.pdf$/i, '').replace(/[^\w.-]+/g, '_').slice(0, 40);
  a.download = `${safe}-conversation.md`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function FormattedText({ text }) {
  const lines = String(text).split('\n');
  return (
    <>
      {lines.map((line, li) => {
        const bits = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={li}>
            {bits.map((b, bi) => (b.startsWith('**') && b.endsWith('**'))
              ? <strong key={bi} style={{ fontWeight: 600, color: 'var(--text)' }}>{b.slice(2, -2)}</strong>
              : <span key={bi}>{b}</span>)}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

function renderAnswer(text, onCite) {
  const parts = String(text).split(/(\[p\.\d+\])/g);
  return parts.map((p, i) => {
    const m = p.match(/^\[p\.(\d+)\]$/);
    if (m) { const n = Number(m[1]); return <sup key={i} className="fn" style={{ cursor: 'pointer' }} onClick={() => onCite(n)} title={`Jump to page ${n}`}>{n}</sup>; }
    return <FormattedText key={i} text={p} />;
  });
}

function CreditMeter({ credits }) {
  const c = credits == null ? 0 : credits;
  return (
    <div className="pill" style={{ padding: '5px 8px 5px 4px', gap: 8 }}>
      <div style={{ display: 'flex', gap: 3, padding: '0 4px' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < Math.ceil(c / 10) ? 'var(--violet)' : 'transparent', border: `1.5px solid ${i < Math.ceil(c / 10) ? 'var(--violet)' : 'var(--stroke-2)'}` }}></div>
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-2)' }}>{credits == null ? '…' : c} CR</span>
      <span style={{ width: 1, height: 14, background: 'var(--stroke-2)' }}></span>
      <a href="/buy" className="mono" style={{ fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--violet-2)', textTransform: 'uppercase' }}>+ Buy</a>
    </div>
  );
}

function Header({ credits, docTitle, onUpload, onExport }) {
  return (
    <header style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.85)', backdropFilter: 'blur(20px) saturate(180%)', flexShrink: 0, zIndex: 10 }}>
      <a href="/" className="brand" style={{ fontSize: 15 }}><span className="brand-mark">◇</span>chatwithpdfai<span className="domain">.com</span></a>
      <span style={{ color: 'var(--text-4)' }}>/</span>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Workspace{docTitle ? ' · ' + docTitle : ''}</span>
      <div style={{ flex: 1 }}></div>
      <CreditMeter credits={credits} />
      <a href="/question-paper-generator" className="btn btn-glass btn-sm" title="Generate question papers">✦ Question papers</a>
      <a href="/account" className="btn btn-glass btn-sm">Account</a>
      <button onClick={onExport} className="btn btn-glass btn-sm">Export ↓</button>
      <button onClick={onUpload} className="btn btn-iris btn-sm" data-testid="upload-open">+ Upload PDF</button>
    </header>
  );
}

function Sidebar({ docs, activeId, onPick, onNew, onUpload }) {
  const [q, setQ] = useState('');
  const list = (docs || []).filter((d) => d.filename.toLowerCase().includes(q.toLowerCase()));
  return (
    <aside style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.6)', backdropFilter: 'blur(20px) saturate(180%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px 0' }}>
      <div style={{ padding: '0 14px 12px' }}><button onClick={onNew} className="btn btn-iris" style={{ width: '100%' }}>+ New chat</button></div>
      <div style={{ padding: '0 14px 6px' }}><input className="input" placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} style={{ fontSize: 12.5, padding: '8px 12px' }} /></div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div className="eyebrow" style={{ padding: '12px 16px 6px' }}>Your documents</div>
        {docs == null && <div className="mono" style={{ padding: '8px 16px', fontSize: 11, color: 'var(--text-4)' }}>Loading…</div>}
        {docs && list.length === 0 && <div style={{ padding: '8px 16px', fontSize: 12.5, color: 'var(--text-4)' }}>No documents yet.</div>}
        {list.map((d) => (
          <div key={d.id} onClick={() => onPick(d.id)} data-testid="doc-row" style={{ padding: '10px 16px', color: d.id === activeId ? 'var(--text)' : 'var(--text-2)', background: d.id === activeId ? 'var(--glass-2)' : 'transparent', borderLeft: d.id === activeId ? '2px solid var(--violet)' : '2px solid transparent', cursor: 'pointer' }}>
            <div style={{ fontSize: 13, fontWeight: d.id === activeId ? 500 : 400, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', letterSpacing: '0.08em', marginTop: 3, textTransform: 'uppercase' }}>{d.status === 'ready' ? `${d.pageCount} pp` : d.status}{d.sizeBytes ? ' · ' + fmtSize(d.sizeBytes) : ''}</div>
          </div>
        ))}
      </div>
      <div className="glass" style={{ margin: 12, padding: 14, borderRadius: 'var(--r)' }}>
        <div className="eyebrow" style={{ color: 'var(--violet-2)', marginBottom: 6 }}>Tip</div>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: '0 0 10px', color: 'var(--text-2)' }}>Upload a PDF, then ask anything — answers cite the exact page.</p>
        <a href="/buy" className="mono" style={{ fontSize: 10, color: 'var(--violet-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>+ BUY CREDITS →</a>
      </div>
    </aside>
  );
}

function DocViewer({ docId, jumpPage }) {
  const [view, setView] = useState('pdf');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (!docId) { setData(null); return; }
    let live = true; setData(null); setErr('');
    fetch(`/api/documents/${docId}`).then((r) => r.json()).then((j) => { if (live) { if (j.ok) setData(j); else setErr(j.error || 'Could not load'); } }).catch((e) => live && setErr(e.message));
    return () => { live = false; };
  }, [docId]);
  useEffect(() => {
    if (view === 'text' && jumpPage && ref.current) { const el = ref.current.querySelector(`[data-page="${jumpPage}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }, [jumpPage, data, view]);
  return (
    <section style={{ flex: '1.2', borderRight: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.4)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.6)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data?.document?.filename || 'Document'}</span>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setView('pdf')} className={view === 'pdf' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} style={{ padding: '4px 10px' }}>PDF</button>
          <button onClick={() => setView('text')} className={view === 'text' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} style={{ padding: '4px 10px' }}>Text</button>
        </div>
        {data && <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{data.pages.length} PAGES</span>}
      </div>
      {!docId ? (
        <div style={{ color: 'var(--text-4)', textAlign: 'center', marginTop: 60 }}>No document selected.</div>
      ) : view === 'pdf' ? (
        <iframe key={docId + '-' + (jumpPage || 1)} title="PDF document" src={`/api/documents/${docId}/file#page=${jumpPage || 1}`} style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }} />
      ) : (
        <div ref={ref} style={{ flex: 1, overflow: 'auto', padding: '24px 18px' }}>
          {!data && !err && <div className="mono" style={{ color: 'var(--text-4)', textAlign: 'center', marginTop: 60, fontSize: 12 }}>LOADING DOCUMENT…</div>}
          {err && <div style={{ color: '#ffb4b4', textAlign: 'center', marginTop: 60 }}>{err}</div>}
          {data && data.pages.map((p) => (
            <div key={p.pageNumber} data-page={p.pageNumber} className="glass" style={{ maxWidth: 760, margin: '0 auto 18px', padding: '34px 40px', borderRadius: 'var(--r-lg)', background: jumpPage === p.pageNumber ? 'rgba(183,106,255,0.10)' : 'rgba(255,255,255,0.97)', color: '#0a0a25', fontSize: 13.5, lineHeight: 1.7, border: jumpPage === p.pageNumber ? '2px solid #b76aff' : '1px solid var(--stroke-2)', transition: 'all .35s', whiteSpace: 'pre-wrap' }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(10,10,37,0.5)', marginBottom: 16, borderBottom: '1px solid rgba(10,10,37,0.15)', paddingBottom: 8, textTransform: 'uppercase' }}>Page {p.pageNumber}</div>
              {p.text || <span style={{ color: 'rgba(10,10,37,0.4)' }}>(no extractable text on this page)</span>}
            </div>
          ))}
          {data && data.pages.length === 0 && <div style={{ color: 'var(--text-4)', textAlign: 'center', marginTop: 60 }}>No extractable text (image-only PDF) — use the PDF view.</div>}
        </div>
      )}
    </section>
  );
}

function ChatPane({ doc, onCite, onCreditsUsed, messages, setMessages }) {
  const [convId, setConvId] = useState(null);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState('');
  const listRef = useRef(null);
  const taRef = useRef(null);
  useEffect(() => { setMessages([]); setConvId(null); setNote(''); }, [doc?.id]);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, pending]);

  async function ask(text) {
    const q = (text || '').trim();
    if (!q || pending || !doc) return;
    setMessages((m) => [...m, { role: 'user', text: q }]); setDraft(''); setPending(true); setNote('');
    if (taRef.current) taRef.current.style.height = 'auto';
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId: doc.id, message: q, conversationId: convId }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 403) setNote('Please verify your email (check your inbox) before chatting.');
        else if (r.status === 402) setNote('You are out of credits. Buy a pack to continue.');
        else setNote(j.error || 'Chat failed');
        setMessages((m) => m.slice(0, -1)); setPending(false); return;
      }
      if (j.conversationId) setConvId(j.conversationId);
      setMessages((m) => [...m, { role: 'assistant', text: j.answer, citations: j.citations || [], provider: j.provider }]);
      if (typeof j.credits === 'number') onCreditsUsed && onCreditsUsed(j.credits);
      setPending(false);
    } catch (e) { setNote(e.message); setMessages((m) => m.slice(0, -1)); setPending(false); }
  }

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(5,6,20,0.5)', minWidth: 0 }}>
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }}></div>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Conversation</span>
        <div style={{ flex: 1 }}></div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em' }}>{messages.length} MSGS</span>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '22px 22px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {messages.length === 0 && !pending && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <div style={{ color: 'var(--text-4)', fontSize: 13.5, marginBottom: 16 }}>Ask anything about <strong style={{ color: 'var(--text-2)' }}>{doc?.filename}</strong>. Answers cite the exact page.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420, margin: '0 auto' }}>
              {STARTERS.map((s) => (
                <button key={s} onClick={() => ask(s)} disabled={!doc || pending} className="chip" style={{ fontSize: 12, padding: '7px 12px', cursor: 'pointer', color: 'var(--text-2)' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => m.role === 'user' ? (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div style={{ background: 'var(--grad-iris-2)', color: '#fff', padding: '11px 16px', maxWidth: '80%', fontSize: 14.5, lineHeight: 1.5, fontWeight: 500, borderRadius: '18px 18px 4px 18px' }}>{m.text}</div>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '92%' }} data-testid="answer">
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--grad-iris-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>AI</span>
              Assistant · grounded{m.provider ? ' · ' + m.provider : ''}
            </div>
            <div className="glass" style={{ padding: '14px 16px', borderRadius: '18px 18px 18px 4px', borderLeft: '2px solid var(--violet)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--text)' }}>
              {renderAnswer(m.text, onCite)}
            </div>
            {m.citations && m.citations.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }} data-testid="cite-pages">
                {m.citations.map((pg) => (
                  <button key={pg} onClick={() => onCite(pg)} className="chip" style={{ fontSize: 10.5, padding: '4px 9px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>P.{pg} ↗</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {pending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '70%' }}>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--grad-iris-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>AI</span>Reading the document…</div>
            <div className="glass" style={{ padding: '14px 16px', borderRadius: '18px 18px 18px 4px', borderLeft: '2px solid var(--violet)', display: 'flex', gap: 8, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => <span key={i} className="cwpa-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--violet)', animationDelay: `${i * 0.16}s` }}></span>)}
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginLeft: 8, letterSpacing: '0.1em' }}>SEARCHING…</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 18px 18px', borderTop: '1px solid var(--stroke-1)', flexShrink: 0 }}>
        {note && <div style={{ marginBottom: 10, fontSize: 12.5, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea ref={taRef} value={draft} rows={1} onChange={(e) => setDraft(e.target.value)} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft); } }} placeholder="Ask anything about the document…  (Shift+Enter = new line)" className="input" data-testid="question" style={{ flex: 1, padding: '11px 14px', resize: 'none', minHeight: 44, maxHeight: 140, height: 44, lineHeight: 1.5, fontFamily: 'inherit', overflowY: 'auto' }} disabled={!doc} />
          <button onClick={() => ask(draft)} className={draft.trim() ? 'btn btn-iris' : 'btn btn-glass'} data-testid="ask-btn" disabled={!draft.trim() || pending || !doc}>Ask ↵</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-4)' }}>
          <span className="mono" style={{ letterSpacing: '0.08em' }}>{doc ? `${doc.filename.slice(0, 28)} · ${doc.pageCount} PAGES` : 'NO DOCUMENT'}</span>
          <span className="mono" style={{ letterSpacing: '0.08em' }}>↵ TO SEND</span>
        </div>
      </div>
    </section>
  );
}

function UploadModal({ open, onClose, onUploaded }) {
  const [stage, setStage] = useState('drop');
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [dup, setDup] = useState(null);
  const [pending, setPending] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => { if (open) { setStage('drop'); setErr(''); setName(''); setDup(null); setPending(null); } }, [open]);
  async function start(file, force) {
    if (!file) return;
    setName(file.name); setStage('uploading'); setErr('');
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch('/api/documents/upload' + (force ? '?force=1' : ''), { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.status === 409 && j.duplicate) { setDup({ id: j.existingId, name: file.name }); setPending(file); setStage('duplicate'); return; }
      if (!r.ok) { setErr(r.status === 403 ? 'Verify your email before uploading (check your inbox).' : (j.error || 'Upload failed')); setStage('drop'); return; }
      setStage('done'); onUploaded && onUploaded(j.document);
    } catch (e) { setErr(e.message); setStage('drop'); }
  }
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,6,20,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass glass-iris-border" style={{ width: '100%', maxWidth: 520, borderRadius: 'var(--r-xl)' }}>
        <div style={{ padding: '20px 26px 16px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>Upload a PDF</h3><p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0 }}>We extract the text, index it, and you can chat with cited answers.</p></div>
          <button onClick={onClose} className="btn btn-glass btn-sm" style={{ padding: '5px 10px' }}>✕</button>
        </div>
        <div style={{ padding: 28 }}>
          {stage === 'drop' && (
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); start(e.dataTransfer.files?.[0]); }} onClick={() => fileRef.current?.click()} className="glass" style={{ padding: '40px 24px', textAlign: 'center', cursor: 'pointer', borderRadius: 'var(--r-lg)', border: '1.5px dashed var(--stroke-3)' }}>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} data-testid="file-input" onChange={(e) => start(e.target.files?.[0])} />
              <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff' }}>↑</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Drop a PDF here</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>or click to choose a file</div>
              <div className="mono" style={{ marginTop: 18, fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>PDF · up to 50 MB · 500 pages</div>
              {err && <div style={{ marginTop: 14, fontSize: 12.5, color: '#ffb4b4' }}>{err}</div>}
            </div>
          )}
          {stage === 'uploading' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-flex', gap: 8, marginBottom: 18 }}>{[0, 1, 2].map((i) => <span key={i} className="cwpa-dot" style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--violet)', animationDelay: `${i * 0.16}s` }}></span>)}</div>
              <div className="eyebrow" style={{ color: 'var(--violet-2)', marginBottom: 10 }}>● Extracting text & indexing…</div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>Processing <strong style={{ color: 'var(--text)' }}>{name}</strong></p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>This can take a moment for large PDFs.</p>
            </div>
          )}
          {stage === 'done' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 18px', borderRadius: 14, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff' }}>✓</div>
              <h3 style={{ fontSize: 22, fontWeight: 600, margin: '4px 0 6px' }}>{name} is ready.</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 22px' }}>Text extracted and indexed. Start asking questions.</p>
              <button onClick={onClose} className="btn btn-iris btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Open & start chatting →</button>
            </div>
          )}
          {stage === 'duplicate' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'rgba(255,189,46,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#ffd27a' }}>!</div>
              <h3 style={{ fontSize: 19, fontWeight: 600, margin: '4px 0 6px' }}>Looks like a duplicate</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 20px' }}>You already uploaded <strong style={{ color: 'var(--text)' }}>{name}</strong>. Open the existing one, or upload a fresh copy anyway.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { window.location.href = '/chat-with-pdf?doc=' + dup.id; }} className="btn btn-iris" style={{ flex: 1, justifyContent: 'center' }}>Open existing</button>
                <button onClick={() => start(pending, true)} className="btn btn-glass" style={{ flex: 1, justifyContent: 'center' }}>Upload anyway</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onUpload }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 22px', borderRadius: 18, background: 'var(--glass-2)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--violet-2)' }}>↑</div>
        <h2 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 10px' }}>Your workspace is <span className="iris">empty.</span></h2>
        <p style={{ fontSize: 15, color: 'var(--text-3)', margin: '0 0 26px', lineHeight: 1.55 }}>Upload a PDF to get started — we extract the text and index it so you can ask questions with cited answers.</p>
        <button onClick={onUpload} className="btn btn-iris btn-lg" data-testid="upload-open-empty">+ Upload a PDF</button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [docs, setDocs] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [credits, setCredits] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [jumpPage, setJumpPage] = useState(null);
  const [messages, setMessages] = useState([]);

  async function loadDocs(selectId) {
    const d = await jget('/api/documents');
    if (d.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
    const list = d.j.documents || [];
    setDocs(list);
    if (selectId) setActiveId(selectId);
    else setActiveId((prev) => {
      if (prev && list.some((x) => x.id === prev)) return prev;
      const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('doc') : null;
      if (qp && list.some((x) => String(x.id) === qp)) return Number(qp);
      return list.find((x) => x.status === 'ready')?.id ?? null;
    });
  }
  useEffect(() => { loadDocs(); jget('/api/credits').then((c) => { if (c.ok) setCredits(c.j.balance); }); }, []);

  const active = (docs || []).find((x) => x.id === activeId) || null;
  function onCite(pg) { setJumpPage(null); setTimeout(() => setJumpPage(pg), 20); }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppNav active="chat" credits={credits} actions={<><button onClick={() => exportConversation(active, messages)} className="btn btn-glass btn-sm">Export ↓</button><button onClick={() => setShowUpload(true)} className="btn btn-iris btn-sm" data-testid="upload-open">+ Upload PDF</button></>} />
      <div id="main" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar docs={docs} activeId={activeId} onPick={setActiveId} onNew={() => { setActiveId(null); setMessages([]); }} onUpload={() => setShowUpload(true)} />
        {active ? (
          <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
            <DocViewer docId={activeId} jumpPage={jumpPage} />
            <ChatPane doc={active} onCite={onCite} messages={messages} setMessages={setMessages} onCreditsUsed={(used) => setCredits((c) => (c == null ? c : Math.max(0, c - used)))} />
          </div>
        ) : (
          <EmptyState onUpload={() => setShowUpload(true)} />
        )}
      </div>
      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUploaded={(doc) => { if (doc?.id) loadDocs(doc.id); jget('/api/credits').then((c) => { if (c.ok) setCredits(c.j.balance); }); }} />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes cwpaBounce{0%,80%,100%{transform:scale(0.5);opacity:0.4}40%{transform:scale(1);opacity:1}} .cwpa-dot{animation:cwpaBounce 1.2s ease-in-out infinite}` }} />
    </div>
  );
}
