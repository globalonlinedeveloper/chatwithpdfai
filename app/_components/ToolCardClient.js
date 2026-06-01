'use client';
import { useState, useEffect } from 'react';
import ToolIcon from './ToolIcon';
export default function ToolCardClient({ tool: t }) {
  const live = t.status === 'live';
  const [authed, setAuthed] = useState(null);
  useEffect(() => { if (live) fetch('/api/auth/state').then((r) => (r.ok ? r.json() : null)).then((j) => setAuthed(!!(j && j.authed))).catch(() => setAuthed(false)); }, [live]);
  const href = live ? (authed ? t.appHref : '/tools/' + t.slug) : '#';
  const cta = !live ? null : (authed ? 'Open →' : 'Learn more →');
  const style = { display: 'block', padding: 20, borderRadius: 'var(--r-xl)', color: 'inherit', textDecoration: 'none', border: '1px solid var(--stroke-2)', opacity: live ? 1 : 0.65 };
  const inner = (
    <>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ToolIcon name={t.icon} size={22} stroke="#fff" /></div>
      <div style={{ fontSize: 16, fontWeight: 600, margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>{t.name}{!live && <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>Coming soon</span>}</div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', margin: '6px 0 0', lineHeight: 1.5 }}>{t.tagline}</div>
      {cta && <div style={{ fontSize: 12.5, color: 'var(--violet-2)', marginTop: 14 }}>{cta}</div>}
    </>
  );
  return live ? <a href={href} className="glass hover-glow" style={style}>{inner}</a> : <div className="glass" style={style}>{inner}</div>;
}
