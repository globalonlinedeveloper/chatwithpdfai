// Auth pages — sign in / sign up / forgot / verify
const { useState: uA, useEffect: uA2 } = React;

function AuthShell({ title, lede, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", top: "20%", left: "20%", opacity: 0.4 }}></div>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--blue), transparent 60%)", bottom: "10%", right: "10%", opacity: 0.3 }}></div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
        width: "100%", maxWidth: 1080, position: "relative", zIndex: 2,
      }} className="auth-grid">
        <div className="glass auth-card glass-iris-border" style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          boxShadow: "var(--shadow-card), 0 30px 70px -30px oklch(0.4 0.2 290 / 0.45)",
        }}>
          <a href="../landing.html" className="brand" style={{ fontSize: 14, marginBottom: 22, display: "inline-flex" }}>
            <span className="brand-mark" style={{ width: 22, height: 22, fontSize: 11 }}>◇</span>
            chatwithpdfai<span className="domain">.com</span>
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>{title}</h1>
          <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 26px" }}>{lede}</p>
          {children}
          {footer && <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--stroke-1)", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>{footer}</div>}
        </div>
        <div>
          <div className="section-eyebrow">Built for serious documents</div>
          <h2 className="display" style={{ fontSize: 44, margin: "16px 0 18px", lineHeight: 1 }}>
            Drop a PDF.<br /><span className="iris">Read it in seconds.</span>
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.55, margin: "0 0 28px", maxWidth: 380 }}>
            Cited answers. 70+ languages. Credits never expire. No subscription.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["3 documents free", "No card required to start"],
              ["Paragraph-level citations", "Every claim links back to the source"],
              ["Private by default", "We never train on your files."],
            ].map(([t, d]) => (
              <div key={t} className="glass" style={{ padding: "14px 16px", borderRadius: "var(--r)", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--glass-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{t}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 880px) {
        .auth-grid { grid-template-columns: 1fr !important; }
        .auth-grid > div:last-child { display: none; }
      }`}</style>
    </div>
  );
}

function SocialButtons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button className="btn btn-glass" style={{ width: "100%", padding: "11px 16px", justifyContent: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>G</span> Continue with Google
      </button>
      <button className="btn btn-glass" style={{ width: "100%", padding: "11px 16px", justifyContent: "center" }}>
        <span style={{ fontSize: 16 }}></span> Continue with Apple
      </button>
      <button className="btn btn-glass" style={{ width: "100%", padding: "11px 16px", justifyContent: "center" }}>
        <span className="mono" style={{ fontSize: 11 }}>SSO</span> Continue with SAML SSO
      </button>
    </div>
  );
}

function SignIn() {
  return (
    <AuthShell
      title="Welcome back."
      lede="Sign in to your CHATWITHPDFAI workspace."
      footer={<>New here? <a href="signup.html" style={{ color: "var(--violet-2)" }}>Create an account →</a></>}
    >
      <SocialButtons />
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--stroke-1)" }}></div>
        <span className="eyebrow">or with email</span>
        <div style={{ flex: 1, height: 1, background: "var(--stroke-1)" }}></div>
      </div>
      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={e => { e.preventDefault(); window.location.href = "../app.html"; }}>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Work email</div>
          <input className="input" type="email" placeholder="you@firm.com" required />
        </label>
        <label>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="eyebrow">Password</span>
            <a href="forgot.html" className="mono" style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--violet-2)" }}>Forgot?</a>
          </div>
          <input className="input" type="password" placeholder="••••••••••" required />
        </label>
        <button type="submit" className="btn btn-iris" style={{ marginTop: 6, padding: "12px 16px", justifyContent: "center" }}>
          Sign in →
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-3)", marginTop: 4 }}>
          <input type="checkbox" defaultChecked /> Keep me signed in
        </label>
      </form>
    </AuthShell>
  );
}

function SignUp() {
  return (
    <AuthShell
      title="Start free. No card."
      lede="Create your account. 3 documents on us."
      footer={<>Already have an account? <a href="signin.html" style={{ color: "var(--violet-2)" }}>Sign in →</a></>}
    >
      <SocialButtons />
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--stroke-1)" }}></div>
        <span className="eyebrow">or with email</span>
        <div style={{ flex: 1, height: 1, background: "var(--stroke-1)" }}></div>
      </div>
      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={e => { e.preventDefault(); window.location.href = "verify.html"; }}>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Full name</div>
          <input className="input" placeholder="Maya Khan" required />
        </label>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Work email</div>
          <input className="input" type="email" placeholder="you@firm.com" required />
        </label>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Password</div>
          <input className="input" type="password" placeholder="At least 12 characters" minLength={12} required />
          <div className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 4 }}>
            MIN 12 CHARS · INCLUDE NUMBER + SYMBOL
          </div>
        </label>
        <button type="submit" className="btn btn-iris" style={{ marginTop: 6, padding: "12px 16px", justifyContent: "center" }}>
          Create my workspace →
        </button>
        <p style={{ fontSize: 11.5, color: "var(--text-4)", margin: "8px 0 0", lineHeight: 1.5 }}>
          By signing up you agree to our{" "}
          <a href="../legal/terms.html" style={{ color: "var(--text-3)", textDecoration: "underline" }}>Terms</a> and{" "}
          <a href="../legal/privacy.html" style={{ color: "var(--text-3)", textDecoration: "underline" }}>Privacy</a>. We never train on your files.
        </p>
      </form>
    </AuthShell>
  );
}

function Forgot() {
  const [sent, setSent] = uA(false);
  if (sent) {
    return (
      <AuthShell
        title="Check your inbox."
        lede="If an account exists for that email, we sent a reset link."
        footer={<a href="signin.html" style={{ color: "var(--violet-2)" }}>← Back to sign in</a>}
      >
        <div className="glass" style={{ padding: "20px 22px", borderRadius: "var(--r-lg)", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--grad-iris-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>✉</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Email sent</div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: "2px 0 0" }}>Link expires in 1 hour. Check spam if needed.</p>
          </div>
        </div>
        <button onClick={() => setSent(false)} className="btn btn-glass" style={{ width: "100%", marginTop: 18, justifyContent: "center" }}>
          Try another email
        </button>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title="Forgot password?"
      lede="No problem. We'll email you a reset link."
      footer={<a href="signin.html" style={{ color: "var(--violet-2)" }}>← Back to sign in</a>}
    >
      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={e => { e.preventDefault(); setSent(true); }}>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Email associated with your account</div>
          <input className="input" type="email" placeholder="you@firm.com" required />
        </label>
        <button type="submit" className="btn btn-iris" style={{ marginTop: 6, padding: "12px 16px", justifyContent: "center" }}>
          Send reset link →
        </button>
      </form>
    </AuthShell>
  );
}

function Verify() {
  const [code, setCode] = uA(["", "", "", "", "", ""]);
  const refs = React.useRef([]);
  const onChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const filled = code.every(c => c !== "");
  return (
    <AuthShell
      title="One last step."
      lede="We sent a 6-digit code to your email. Enter it below."
      footer={<>Wrong email? <a href="signup.html" style={{ color: "var(--violet-2)" }}>Start over →</a></>}
    >
      <div className="glass" style={{ padding: "14px 16px", borderRadius: "var(--r)", display: "flex", gap: 12, alignItems: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 22 }}>✉</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>maya@firm.com</div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>Code valid for 10 minutes</div>
        </div>
        <a href="#" className="mono" style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "var(--violet-2)", textTransform: "uppercase" }}>Resend</a>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
        {code.map((c, i) => (
          <input key={i} ref={el => refs.current[i] = el} value={c}
            onChange={e => onChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus(); }}
            className="input" maxLength={1}
            style={{ width: 52, height: 60, textAlign: "center", fontSize: 24, fontFamily: "var(--mono)", fontWeight: 600, padding: 0 }}
          />
        ))}
      </div>

      <button onClick={() => window.location.href = "../app.html"} className="btn btn-iris" disabled={!filled} style={{ width: "100%", padding: "12px 16px", justifyContent: "center", opacity: filled ? 1 : 0.5 }}>
        Verify & open workspace →
      </button>
    </AuthShell>
  );
}

Object.assign(window, { SignIn, SignUp, Forgot, Verify, AuthShell });
