'use client';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Features', href: '/#features', k: 'features' },
  { label: 'Tools', href: '/tools', k: 'tools' },
  { label: 'Pricing', href: '/pricing', k: 'pricing' },
  { label: 'Help', href: '/help', k: 'help' },
];

export function Masthead({ active }) {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetch('/api/auth/state').then((r) => (r.ok ? r.json() : null)).then((j) => setAuthed(!!(j && j.authed))).catch(() => {}); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="masthead" style={{ background: scrolled ? 'rgba(5,6,20,0.85)' : 'rgba(5,6,20,0.4)' }}>
      <div className="masthead-inner">
        <a href="/" className="brand">
          <span className="brand-mark">◇</span>
          chatwithpdfai<span className="domain">.com</span>
        </a>
        <nav className="nav">
          {NAV.map((n) => (
            <a key={n.k} href={n.href} style={{ color: active === n.k ? 'var(--text)' : 'var(--text-2)' }}>{n.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {authed ? <a href="/dashboard" className="btn btn-iris btn-sm">Go to app →</a> : <><a href="/signin" className="btn btn-ghost btn-sm">Sign in</a><a href="/signup" className="btn btn-iris btn-sm">Try free →</a></>}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const cols = [
    { h: 'Product', l: [['Features', '/#features'], ['Pricing', '/pricing']] },
    { h: 'Company', l: [['Contact', '/contact']] },
    { h: 'Resources', l: [['Help', '/help'], ['Privacy', '/legal/privacy'], ['Terms', '/legal/terms'], ['Security', '/legal/security'], ['DPA', '/legal/dpa'], ['Cookies', '/legal/cookies']] },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--stroke-1)', padding: '60px 0 30px', marginTop: 80 }}>
      <div className="spread">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40 }} className="foot-grid">
          <div>
            <a href="/" className="brand" style={{ fontSize: 18 }}>
              <span className="brand-mark">◇</span>
              chatwithpdfai<span className="domain">.com</span>
            </a>
            <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '14px 0 18px', lineHeight: 1.55, maxWidth: 320 }}>
              A research assistant in the margin of every document. Pay-per-doc. No subscription.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['SOC 2', 'HIPAA', 'GDPR'].map((b) => <span key={b} className="pill" style={{ padding: '4px 10px', fontSize: 10.5 }}>{b}</span>)}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.h}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>{col.h}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.l.map(([label, href]) => (
                  <li key={label} style={{ padding: '5px 0', fontSize: 13.5 }}>
                    <a href={href} style={{ color: 'var(--text-2)' }}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--stroke-1)', margin: '40px 0 20px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-4)', fontSize: 11, flexWrap: 'wrap', gap: 12 }}>
          <span className="mono" style={{ letterSpacing: '0.08em' }}>© {year} CHATWITHPDFAI · ALL RIGHTS RESERVED</span>
          <a href="mailto:support@chatwithpdfai.com" className="mono" style={{ letterSpacing: '0.08em', color: 'var(--text-3)' }}>SUPPORT@CHATWITHPDFAI.COM</a>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px){.foot-grid{grid-template-columns:1fr 1fr !important}} @media (max-width:560px){.foot-grid{grid-template-columns:1fr !important}}` }} />
    </footer>
  );
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => { try { setShow(!localStorage.getItem('cwpa_cookies_v1')); } catch { setShow(true); } }, []);
  if (!show) return null;
  const accept = (level) => { try { localStorage.setItem('cwpa_cookies_v1', level); } catch {} setShow(false); };
  return (
    <div className="no-print" style={{ position: 'fixed', bottom: 18, left: 18, right: 18, maxWidth: 520, zIndex: 100 }}>
      <div className="glass" style={{ padding: 18, borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-3)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>🍪</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>We use cookies</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
              Essential cookies keep you signed in. We never sell your data. <a href="/legal/cookies" style={{ color: 'var(--violet-2)', textDecoration: 'underline' }}>Read the policy</a>.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button onClick={() => accept('all')} className="btn btn-iris btn-sm" style={{ flex: 1 }}>Accept all</button>
          <button onClick={() => accept('essential')} className="btn btn-glass btn-sm" style={{ flex: 1 }}>Essential only</button>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, lede, align = 'left' }) {
  return (
    <section style={{ padding: '60px 0 36px', position: 'relative', overflow: 'hidden' }}>
      <div className="section-blob" style={{ background: 'radial-gradient(circle, var(--violet), transparent 60%)', top: -100, right: -100, opacity: 0.3 }}></div>
      <div className="spread" style={{ textAlign: align }}>
        <div className="section-eyebrow" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}>{eyebrow}</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: align === 'center' ? '16px auto 14px' : '16px 0 14px', maxWidth: 900 }}>{title}</h1>
        {lede && <p className="section-lede" style={{ margin: align === 'center' ? '0 auto 0' : '0 0 0' }}>{lede}</p>}
      </div>
    </section>
  );
}

export default function SiteShell({ children, active }) {
  return (
    <>
      <Masthead active={active} />
      <main id="main" style={{ minHeight: '60vh', overflowX: 'clip' }}>{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
