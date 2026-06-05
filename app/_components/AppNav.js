'use client';
import { useState, useEffect } from 'react';
import { liveTools } from '@/lib/tools';

export default function AppNav({ active, credits: creditsProp, actions }) {
  const [menu, setMenu] = useState(false);
  const [navMenu, setNavMenu] = useState(false);
  const [initials, setInitials] = useState('');
  const [creditsSelf, setCreditsSelf] = useState(null);
  const credits = creditsProp != null ? creditsProp : creditsSelf;
  useEffect(() => {
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.user) { const s = String(j.user.name || j.user.email || '?').trim(); setInitials(s.slice(0, 1).toUpperCase()); } }).catch(() => {});
    if (creditsProp == null) fetch('/api/credits').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && typeof j.balance === 'number') setCreditsSelf(j.balance); }).catch(() => {});
    const close = () => { setMenu(false); setNavMenu(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setMenu(false); setNavMenu(false); } };
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', onKey); };
  }, []);
  async function signOut() { try { await fetch('/api/auth/signout', { method: 'POST' }); } catch (e) {} window.location.href = '/'; }
  const navStyle = (on) => ({ fontSize: 13, padding: '5px 11px', borderRadius: 'var(--r)', textDecoration: 'none', color: on ? 'var(--text)' : 'var(--text-3)', background: on ? 'var(--glass-2)' : 'transparent' });
  const toolsActive = active === 'tools' || liveTools().some((t) => t.navKey === active);
  const mItem = { display: 'block', padding: '7px 10px', fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', borderRadius: 'var(--r)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' };
  const mOn = { ...mItem, color: 'var(--text)', background: 'var(--glass-2)' };
  return (
    <header className="no-print appnav" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14, rowGap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.85)', backdropFilter: 'blur(20px) saturate(180%)', flexShrink: 0, zIndex: 30, position: 'relative' }}>
      <a href="/dashboard" className="brand" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}><span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>{'◇'}</span>chatwithpdfai<span className="domain">.com</span></a>
      <div className="appnav-burger-wrap" style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="appnav-burger" onClick={() => { setNavMenu((v) => !v); setMenu(false); }} aria-label="Navigation menu" aria-haspopup="true" aria-expanded={navMenu} style={{ width: 34, height: 30, borderRadius: 'var(--r)', background: 'var(--glass-2)', color: 'var(--text-2)', border: '1px solid var(--stroke-2)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {navMenu && <div className="glass" role="menu" style={{ position: 'absolute', left: 0, top: 40, minWidth: 150, borderRadius: 'var(--r)', padding: 5, zIndex: 50 }}>
          <a href="/dashboard" role="menuitem" style={active === 'dashboard' ? mOn : mItem}>Dashboard</a>
          <a href="/tools" role="menuitem" style={toolsActive ? mOn : mItem}>Tools</a>
          <a href="/library" role="menuitem" style={active === 'library' ? mOn : mItem}>Library</a>
        </div>}
      </div>
      <nav className="appnav-links" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <a href="/dashboard" style={navStyle(active === 'dashboard')}>Dashboard</a>
        <a href="/tools" style={navStyle(toolsActive)}>Tools</a>
        <a href="/library" style={navStyle(active === 'library')}>Library</a>
      </nav>
      <div style={{ flex: 1 }} />
      {actions}
      {credits != null && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)', flexShrink: 0, whiteSpace: 'nowrap' }}>{'◆'} {credits.toLocaleString('en-IN')} CR <a href="/buy" style={{ color: 'var(--violet-2)' }}>+ Buy</a></span>}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => { setMenu((v) => !v); setNavMenu(false); }} aria-label="Account menu" aria-haspopup="true" aria-expanded={menu} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--grad-iris-2)', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{initials || '·'}</button>
        {menu && <div className="glass" role="menu" style={{ position: 'absolute', right: 0, top: 40, minWidth: 152, borderRadius: 'var(--r)', padding: 5, zIndex: 50 }}><a href="/account" role="menuitem" style={mItem}>Account</a><a href="/buy" role="menuitem" style={mItem}>Buy credits</a><button onClick={signOut} role="menuitem" style={mItem} data-testid="signout">Sign out</button></div>}
      </div>
      <style>{`.appnav-burger{ display:none } @media (max-width: 560px){ .appnav{ gap:8px !important } .appnav .domain{ display:none } .appnav-links{ display:none } .appnav-burger{ display:inline-flex } }`}</style>
    </header>
  );
}
