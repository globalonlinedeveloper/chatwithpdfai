'use client';

export function AuthShell({ title, lede, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="section-blob" style={{ background: 'radial-gradient(circle, var(--violet), transparent 60%)', top: '20%', left: '20%', opacity: 0.4 }}></div>
      <div className="section-blob" style={{ background: 'radial-gradient(circle, var(--blue), transparent 60%)', bottom: '10%', right: '10%', opacity: 0.3 }}></div>
      <div className="auth-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%', maxWidth: 1080, position: 'relative', zIndex: 2 }}>
        <div className="glass auth-card glass-iris-border" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', boxShadow: 'var(--shadow-card), 0 30px 70px -30px oklch(0.4 0.2 290 / 0.45)' }}>
          <a href="/" className="brand" style={{ fontSize: 14, marginBottom: 22, display: 'inline-flex' }}>
            <span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>◇</span>
            chatwithpdfai<span className="domain">.com</span>
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', margin: '8px 0 8px' }}>{title}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 26px' }}>{lede}</p>
          {children}
          {footer && <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--stroke-1)', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>{footer}</div>}
        </div>
        <div className="auth-aside">
          <div className="section-eyebrow">Built for serious documents</div>
          <h2 className="display" style={{ fontSize: 44, margin: '16px 0 18px', lineHeight: 1 }}>
            Drop a PDF.<br /><span className="iris">Read it in seconds.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.55, margin: '0 0 28px', maxWidth: 380 }}>
            Cited answers. 70+ languages. Credits never expire. No subscription.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Paragraph-level citations', 'Every claim links back to the source page'],
              ['70+ languages', 'Ask in whatever language you think in'],
              ['Private by default', 'We never train on your files.'],
            ].map(([t, d]) => (
              <div key={t} className="glass" style={{ padding: '14px 16px', borderRadius: 'var(--r)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--glass-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 880px){.auth-grid{grid-template-columns:1fr !important}.auth-aside{display:none}}` }} />
    </div>
  );
}

export function StatusNote({ kind, children }) {
  if (!children) return null;
  const bad = kind === 'bad';
  return (
    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13, border: `1px solid ${bad ? 'rgba(255,126,126,0.35)' : 'var(--stroke-2)'}`, background: bad ? 'rgba(255,126,126,0.08)' : 'var(--glass-1)', color: bad ? '#ffb4b4' : 'var(--text-2)' }}>
      {children}
    </div>
  );
}
