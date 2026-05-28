// CHATWITHPDFAI.COM — Shared chrome v2
// Masthead, Footer, CookieBanner, PageShell, PageHeader
// + Toast system + Skeleton + Confirm dialog

const { useState: uC1, useEffect: uC2, useCallback: uC3 } = React;

// ============================================================
// MASTHEAD
// ============================================================
function Masthead({ active }) {
  const [scrolled, setScrolled] = uC1(false);
  uC2(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const nav = [
    { label: "Product", href: "landing.html#how", k: "product" },
    { label: "Pricing", href: "pricing.html", k: "pricing" },
    { label: "Customers", href: "customers/index.html", k: "customers" },
    { label: "Docs", href: "docs.html", k: "docs" },
    { label: "Blog", href: "blog.html", k: "blog" },
  ];
  return (
    <header className="masthead" style={{ background: scrolled ? "rgba(5,6,20,0.85)" : "rgba(5,6,20,0.4)" }}>
      <div className="masthead-inner">
        <a href="landing.html" className="brand">
          <span className="brand-mark">◇</span>
          chatwithpdfai<span className="domain">.com</span>
        </a>
        <nav className="nav">
          {nav.map(n => (
            <a key={n.k} href={n.href} style={{ color: active === n.k ? "var(--text)" : "var(--text-2)" }}>{n.label}</a>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="auth/signin.html" className="btn btn-ghost btn-sm">Sign in</a>
          <a href="auth/signup.html" className="btn btn-iris btn-sm">Try free →</a>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ minimal }) {
  if (minimal) {
    return (
      <footer style={{ borderTop: "1px solid var(--stroke-1)", padding: "26px 0" }}>
        <div className="spread" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14, fontSize: 11, color: "var(--text-4)" }}>
          <span className="mono" style={{ letterSpacing: "0.08em" }}>© {new Date().getFullYear()} CHATWITHPDFAI</span>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="legal/privacy.html" style={{ color: "var(--text-3)" }}>Privacy</a>
            <a href="legal/terms.html" style={{ color: "var(--text-3)" }}>Terms</a>
            <a href="legal/security.html" style={{ color: "var(--text-3)" }}>Security</a>
            <a href="status.html" style={{ color: "var(--text-3)" }}>Status</a>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer style={{ borderTop: "1px solid var(--stroke-1)", padding: "60px 0 30px", marginTop: 80 }}>
      <div className="spread">
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 40 }} className="foot-grid">
          <div>
            <a href="landing.html" className="brand" style={{ fontSize: 18 }}>
              <span className="brand-mark">◇</span>
              chatwithpdfai<span className="domain">.com</span>
            </a>
            <p style={{ fontSize: 13.5, color: "var(--text-3)", margin: "14px 0 18px", lineHeight: 1.55, maxWidth: 320 }}>
              A research assistant in the margin of every document. Pay-per-doc. No subscription.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["SOC 2", "HIPAA", "GDPR"].map(b => <span key={b} className="pill" style={{ padding: "4px 10px", fontSize: 10.5 }}>{b}</span>)}
            </div>
          </div>
          {[
            { h: "Product", l: [["Features", "landing.html#features"], ["Pricing", "pricing.html"], ["API", "docs.html"], ["Changelog", "changelog.html"], ["Roadmap", "roadmap.html"], ["Status", "status.html"]] },
            { h: "Use cases", l: [["Students", "use-cases/students.html"], ["Legal", "use-cases/legal-pros.html"], ["Finance", "use-cases/finance.html"], ["Research", "use-cases/research.html"], ["Healthcare", "use-cases/healthcare.html"], ["Customers", "customers/index.html"]] },
            { h: "Company", l: [["Blog", "blog.html"], ["Manifesto", "manifesto.html"], ["Press kit", "press.html"], ["Careers", "careers.html"], ["Contact", "contact.html"]] },
            { h: "Resources", l: [["Help center", "help/index.html"], ["Privacy", "legal/privacy.html"], ["Terms", "legal/terms.html"], ["DPA", "legal/dpa.html"], ["Sub-processors", "legal/sub-processors.html"], ["Cookies", "legal/cookies.html"]] },
          ].map(col => (
            <div key={col.h}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>{col.h}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.l.map(([label, href]) => (
                  <li key={label} style={{ padding: "5px 0", fontSize: 13.5 }}>
                    <a href={href} style={{ color: "var(--text-2)" }} onMouseEnter={e => e.target.style.color = "var(--violet-2)"} onMouseLeave={e => e.target.style.color = "var(--text-2)"}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "var(--stroke-1)", margin: "40px 0 20px" }}></div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-4)", fontSize: 11, flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: "0.08em" }}>© {new Date().getFullYear()} CHATWITHPDFAI · ALL RIGHTS RESERVED</span>
          <a href="mailto:support@chatwithpdfai.com" className="mono" style={{ letterSpacing: "0.08em", color: "var(--text-3)" }}>SUPPORT@CHATWITHPDFAI.COM</a>
          <span className="mono" style={{ letterSpacing: "0.08em" }}>STATUS · ALL SYSTEMS OPERATIONAL ●</span>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .foot-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .foot-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

// ============================================================
// COOKIE BANNER
// ============================================================
function CookieBanner() {
  const [show, setShow] = uC1(() => { try { return !localStorage.getItem("cwpa_cookies_v1"); } catch { return true; } });
  if (!show) return null;
  const accept = (level) => { try { localStorage.setItem("cwpa_cookies_v1", level); } catch {} setShow(false); };
  return (
    <div style={{ position: "fixed", bottom: 18, left: 18, right: 18, maxWidth: 520, zIndex: 100, animation: "fadeUp .4s ease both" }}>
      <div className="glass" style={{ padding: 18, borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-card), 0 24px 60px -20px oklch(0.3 0.18 290 / 0.5)", border: "1px solid var(--stroke-3)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>🍪</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>We use cookies</div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              Essential cookies keep you signed in. Analytics cookies help us improve. We never sell your data. <a href="legal/cookies.html" style={{ color: "var(--violet-2)", textDecoration: "underline" }}>Read the policy</a>.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={() => accept("all")} className="btn btn-iris btn-sm" style={{ flex: 1 }}>Accept all</button>
          <button onClick={() => accept("essential")} className="btn btn-glass btn-sm" style={{ flex: 1 }}>Essential only</button>
          <a href="legal/cookies.html" className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Customize</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE SHELL
// ============================================================
function PageShell({ children, active, minimalFooter, hideMasthead }) {
  return (
    <>
      {!hideMasthead && <Masthead active={active} />}
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <Footer minimal={minimalFooter} />
      <CookieBanner />
      <ToastHost />
    </>
  );
}

// ============================================================
// PAGE HEADER
// ============================================================
function PageHeader({ eyebrow, title, lede, align = "left" }) {
  return (
    <section style={{ padding: "60px 0 36px", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", top: -100, right: -100, opacity: 0.3 }}></div>
      <div className="spread" style={{ textAlign: align }}>
        <div className="section-eyebrow" style={{ justifyContent: align === "center" ? "center" : "flex-start" }}>{eyebrow}</div>
        <h1 className="section-title" style={{
          fontSize: "clamp(36px, 5vw, 64px)",
          margin: align === "center" ? "16px auto 14px" : "16px 0 14px",
          maxWidth: 900,
        }}>{title}</h1>
        {lede && <p className="section-lede" style={{ margin: align === "center" ? "0 auto 0" : "0 0 0" }}>{lede}</p>}
      </div>
    </section>
  );
}

// ============================================================
// TOAST SYSTEM — window.cwpaToast({ title, body, kind })
// ============================================================
function ToastHost() {
  const [toasts, setToasts] = uC1([]);
  uC2(() => {
    window.cwpaToast = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(arr => [...arr, { ...t, id }]);
      setTimeout(() => setToasts(arr => arr.filter(x => x.id !== id)), t.duration || 4200);
    };
  }, []);
  const ICONS = { success: "✓", error: "✕", info: "i", warning: "⚠" };
  const COLORS = { success: "var(--green)", error: "#ff7e7e", info: "var(--violet-2)", warning: "#ffbd2e" };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
      {toasts.map(t => (
        <div key={t.id} className="glass" style={{
          padding: "14px 16px", borderRadius: "var(--r-lg)",
          borderLeft: `3px solid ${COLORS[t.kind] || "var(--violet)"}`,
          display: "flex", gap: 12, alignItems: "flex-start",
          animation: "fadeUp .25s ease both",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS[t.kind] || "var(--violet)", color: "#0a0c20", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>{ICONS[t.kind] || "•"}</div>
          <div style={{ flex: 1 }}>
            {t.title && <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.title}</div>}
            {t.body && <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>{t.body}</div>}
          </div>
          <button onClick={() => setToasts(arr => arr.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", color: "var(--text-4)", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SKELETON — placeholder while loading
// ============================================================
function Skeleton({ w, h = 14, r = 4, style }) {
  return <div className="shimmer" style={{
    width: w || "100%", height: h,
    borderRadius: r,
    background: "linear-gradient(90deg, var(--glass-1) 0%, var(--glass-2) 50%, var(--glass-1) 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s linear infinite",
    ...style,
  }}></div>;
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
function Confirm({ open, title, body, danger, confirmLabel = "Confirm", onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(5,6,20,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeUp .2s ease both" }}>
      <div onClick={e => e.stopPropagation()} className="glass glass-iris-border" style={{ width: "100%", maxWidth: 440, padding: 30, borderRadius: "var(--r-xl)", animation: "fadeUp .25s ease both", boxShadow: "var(--shadow-card)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: danger ? "rgba(255,126,126,0.15)" : "var(--glass-2)", display: "flex", alignItems: "center", justifyContent: "center", color: danger ? "#ff7e7e" : "var(--violet-2)", fontSize: 22, marginBottom: 16, border: `1px solid ${danger ? "rgba(255,126,126,0.3)" : "var(--stroke-2)"}` }}>
          {danger ? "⚠" : "?"}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.015em" }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: "var(--text-3)", margin: "0 0 24px", lineHeight: 1.55 }}>{body}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-glass">Cancel</button>
          <button onClick={() => { onConfirm && onConfirm(); onClose(); }} className="btn btn-iris" style={danger ? { background: "linear-gradient(135deg, #ff7e7e, #ff5f5f)", borderColor: "transparent" } : undefined}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Masthead, Footer, CookieBanner, PageShell, PageHeader, ToastHost, Skeleton, Confirm });
