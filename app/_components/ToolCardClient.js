'use client';
import { useState, useEffect } from 'react';
import ToolIcon from './ToolIcon';
export default function ToolCardClient({ tool: t }) {
  const live = t.status === 'live';
  const [authed, setAuthed] = useState(null);
  useEffect(() => { if (live) fetch('/api/auth/state').then((r) => (r.ok ? r.json() : null)).then((j) => setAuthed(!!(j && j.authed))).catch(() => setAuthed(false)); }, [live]);
  const tryHref = live ? (authed ? t.appHref : '/signup?next=' + encodeURIComponent(t.appHref)) : '#';
  const tryLabel = authed ? 'Open →' : 'Try free →';
  return (
    <div className="glass" style={{ padding: 22, borderRadius: 'var(--r-xl)', border: '1px solid var(--stroke-2)', display: 'flex', flexDirection: 'column', opacity: live ? 1 : 0.65 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ToolIcon name={t.icon} size={22} stroke="#fff" /></div>
        {t.audience && <span className="pill" style={{ fontSize: 10.5, padding: '3px 9px', marginLeft: 'auto' }}>{t.audience}</span>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>{t.name}{!live && <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>Coming soon</span>}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '6px 0 0', lineHeight: 1.5 }}>{t.tagline}</div>
      {t.points && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {t.points.map((p, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', gap: 9, lineHeight: 1.45 }}><span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span><span>{p}</span></li>
          ))}
        </ul>
      )}
      {live && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto', paddingTop: 20 }}>
          <a href={tryHref} className="btn btn-iris btn-sm" data-testid="tool-try">{tryLabel}</a>
          <a href={'/tools/' + t.slug} data-testid="tool-learn" style={{ fontSize: 13, color: 'var(--text-2)' }}>Learn more →</a>
        </div>
      )}
    </div>
  );
}
