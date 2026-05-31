'use client';
import { useState, useEffect } from 'react';

const LINKS = [
  { k: 'home', label: 'Home', href: '/home' },
  { k: 'chat', label: 'Chat', href: '/workspace' },
  { k: 'studio', label: 'Studio', href: '/studio' },
  { k: 'library', label: 'Library', href: '/library' },
];

export default function AppNav({ active, credits, actions }) {
  const [menu, setMenu] = useState(false);
  const [initials, setInitials] = useState('');
  useEffect(() => {
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.user) { const s = String(j.user.name || j.user.email || '?').trim(); setInitials(s.slice(0, 1).toUpperCase()); } }).catch(() => {});
    const close = () => setMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);
  async function signOut() { try { await fetch('/api/auth/signout', { method: 'POST' }); } catch (e) {} window.location.href = '/'; }
  const mItem = { display: 'block', padding: '7px 10px', fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', borderRadius: 'var(--r)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' };
  return (
    <header className="no-print appnav" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14, rowGap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.85)', backdropFilter: 'blur(20px) saturate(180%)', flexShrink: 0, zIndex: 30, position: 'relative' }}>
      <a href="/home" className="brand" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center' }}><span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>{'◇'}</span>chatwithpdfai<span className="domain">.com</span></a>
      <nav style={{ display: 'flex', gap: 2 }}>
        {LINKS.map((l) => <a key={l.k} href={l.href} style={{ fontSize: 13, padding: '5px 11px', borderRadius: 'var(--r)', textDecoration: 'none', color: active === l.k ? 'var(--text)' : 'var(--text-3)', background: active === l.k ? 'var(--glass-2)' : 'transparent' }}>{l.label}</a>)}
      </nav>
      <div style={{ flex: 1 }} />
      {actions}
      {credits != null && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{'◆'} {credits.toLocaleString('en-IN')} CR <a href="/buy" style={{ color: 'var(--violet-2)' }}>+ Buy</a></span>}
      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setMenu((v) => !v)} aria-label="Account menu" style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--grad-iris-2)', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{initials || '·'}</button>
        {menu && <div className="glass" style={{ position: 'absolute', right: 0, top: 40, minWidth: 152, borderRadius: 'var(--r)', padding: 5, zIndex: 50 }}><a href="/account" style={mItem}>Account</a><a href="/buy" style={mItem}>Buy credits</a><button onClick={signOut} style={mItem} data-testid="signout">Sign out</button></div>}
      </div>
      <style>{`@media (max-width: 560px){ .appnav .domain{ display:none } .appnav nav a{ padding:5px 8px } }`}</style>
    </header>
  );
}
