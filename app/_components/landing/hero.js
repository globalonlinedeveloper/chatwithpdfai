'use client';
import React from 'react';
// CHATWITHPDFAI.COM — Aurora Landing · Header + Hero
const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// MASTHEAD
// ============================================================
function Masthead() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="masthead" style={{ background: scrolled ? "rgba(5,6,20,0.85)" : "rgba(5,6,20,0.4)" }}>
      <div className="masthead-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">◇</span>
          chatwithpdfai<span className="domain">.com</span>
        </a>
        <nav className="nav">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#cases">Use cases</a>
          <a href="#pricing">Pricing</a>
          <a href="#security">Security</a>
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="/signup" className="btn btn-ghost btn-sm">Sign in</a>
          <a href="/signup" className="btn btn-iris btn-sm">Try free →</a>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [filed, setFiled] = useState(false);
  const fileRef = useRef(null);

  const prompts = [
    "What's the indemnification cap?",
    "Summarize this 200-page filing.",
    "Compare these two contracts.",
    "Translate Section 12 to plain English.",
  ];
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % prompts.length), 2600);
    return () => clearInterval(id);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    setFiled(true);
    setTimeout(() => { window.location.href = "/signup"; }, 850);
  };

  return (
    <section id="top" style={{ position: "relative", padding: "60px 0 100px", overflow: "hidden" }}>
      <div className="spread" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 60, alignItems: "center" }} className="hero-grid">
          {/* LEFT */}
          <div style={{ animation: "fadeUp .6s ease both" }}>
            <span className="pill" style={{ marginBottom: 28 }}>
              <span className="dot"></span>
              Chat with PDFs · Generate question papers
              <span className="tag-new">LIVE</span>
            </span>

            <h1 className="display" style={{ fontSize: "clamp(48px, 6.8vw, 88px)", margin: 0 }}>
              Read every PDF<br />
              <span className="iris">at light speed.</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--text-3)", marginTop: 24, maxWidth: 520 }}>
              Chat with any PDF for cited answers in seconds — and turn a topic or textbook into an
              exam-ready question paper. <strong style={{ color: "var(--text)", fontWeight: 600 }}>Pay per document, no subscription.</strong>
            </p>

            {/* Animated prompt input */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload a PDF to get started"
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
              className="glass hover-glow"
              style={{
                marginTop: 36,
                padding: "16px 18px 16px 20px",
                maxWidth: 560,
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                borderColor: drag ? "var(--violet)" : "var(--stroke-2)",
                background: drag ? "rgba(183,106,255,0.08)" : "var(--glass-1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={() => onDrop({ preventDefault: () => {} })} />
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--grad-iris-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#fff", flexShrink: 0,
                boxShadow: "0 6px 18px -6px oklch(0.55 0.22 290 / 0.6)",
              }}>↑</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div key={step} style={{
                  fontSize: 15, color: "var(--text)", fontWeight: 500,
                  animation: "fadeUp .4s ease",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {filed ? "✓ Filed — opening workspace…" : prompts[step]}
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--text-4)", letterSpacing: "0.1em", marginTop: 3, textTransform: "uppercase" }}>
                  Drop a PDF or click · Up to 500 pages · 50 MB max
                </div>
              </div>
              <kbd className="mono" style={{
                padding: "5px 10px", fontSize: 11,
                background: "var(--glass-2)", border: "1px solid var(--stroke-2)",
                borderRadius: 6, color: "var(--text-2)",
              }}>⏎</kbd>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <a href="/signup" className="btn btn-iris btn-lg">Start free →</a>
              <a href="#pricing" style={{ color: "var(--text-2)", fontSize: 14.5, textDecoration: "none", borderBottom: "1px solid var(--stroke-2)", paddingBottom: 2 }}>or see credit pricing</a>
            </div>
            <div className="mono" style={{ marginTop: 12, fontSize: 11.5, color: "var(--text-4)", letterSpacing: "0.04em" }}>Free credits on signup · no card required · Powered by OpenAI, Anthropic and Google</div>

            {/* Trust strip */}
            <div style={{ marginTop: 56 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Built for every kind of document</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
                {["CONTRACTS", "RESEARCH PAPERS", "TEXTBOOKS", "FINANCIAL FILINGS", "CASE FILES", "QUESTION PAPERS"].map(n => (
                  <span key={n} className="mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.14em", fontWeight: 500 }}>{n}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — floating document */}
          <HeroDoc />
        </div>
      </div>

      {/* Local section glows */}
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", top: -100, right: -50 }}></div>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--blue), transparent 60%)", bottom: -150, left: -100 }}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 980px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 50px !important; }
        }
      ` }} />
    </section>
  );
}

function HeroDoc() {
  const [qIdx, setQIdx] = useState(0);
  const qs = [
    { q: "What's the indemnification cap?", a: "The cap is **2× annual fees**, with carve-outs for IP, confidentiality, and gross negligence.", cite: "p.47" },
    { q: "Any termination triggers I missed?", a: "Three: **material breach** (30-day cure), insolvency, and change of control above 50%.", cite: "p.51" },
    { q: "Compare to our standard MSA.", a: "Indemnity cap is 0.5× lower; auto-renewal is new; governing law is Delaware (we use NY).", cite: "diff · 4 clauses" },
  ];
  useEffect(() => {
    const id = setInterval(() => setQIdx(i => (i + 1) % qs.length), 4200);
    return () => clearInterval(id);
  }, []);
  const c = qs[qIdx];

  return (
    <div style={{ position: "relative", height: 540, animation: "fadeUp .8s ease both .15s" }}>
      {/* Glow behind */}
      <div style={{
        position: "absolute", inset: 20,
        background: "radial-gradient(circle at center, oklch(0.65 0.22 290 / 0.45), transparent 60%)",
        filter: "blur(60px)",
      }}></div>

      {/* Back card */}
      <div className="glass" style={{
        position: "absolute", top: 40, left: 10, right: 80, bottom: 40,
        transform: "rotate(-5deg)",
        borderRadius: "var(--r-xl)",
        opacity: 0.4,
      }}></div>

      {/* Main PDF card */}
      <div className="glass glass-strong" style={{
        position: "absolute", top: 0, left: 60, right: 10, bottom: 60,
        padding: "26px 26px 22px",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-glow), var(--shadow-card), inset 0 1px 0 rgba(255,255,255,0.1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--text-3)", textTransform: "uppercase" }}>
            MSA.PDF · PAGE 47 / 213
          </div>
          <div className="mono" style={{
            fontSize: 9, padding: "3px 7px",
            background: "rgba(126,255,157,0.12)", border: "1px solid rgba(126,255,157,0.4)",
            borderRadius: 4, color: "var(--green)", letterSpacing: "0.12em", fontWeight: 600,
          }}>✓ VERIFIED</div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>§ 12.3 Limitation</div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-2)", margin: "0 0 18px" }}>
          The aggregate liability of either Party under this Section shall not exceed{" "}
          <span style={{
            background: "linear-gradient(120deg, oklch(0.55 0.22 290 / 0.35), oklch(0.5 0.2 200 / 0.35))",
            padding: "2px 5px", borderRadius: 3, color: "#fff", fontWeight: 500,
          }}>two (2) times the fees paid in the twelve (12) months</span>{" "}
          preceding the claim, except for claims arising from (a) intellectual property infringement,
          (b) breach of confidentiality, or (c) gross negligence.
        </p>

        {/* Chat below */}
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--stroke-1)", paddingTop: 16 }}>
          <div key={qIdx + "q"} style={{
            alignSelf: "flex-end",
            marginLeft: "auto",
            padding: "8px 12px",
            background: "var(--grad-iris-2)",
            borderRadius: "14px 14px 4px 14px",
            color: "#fff",
            fontSize: 12.5,
            maxWidth: "85%",
            fontWeight: 500,
            marginBottom: 10,
            display: "inline-block",
            animation: "fadeUp .4s ease",
          }}>
            {c.q}
          </div>
          <div key={qIdx + "a"} className="glass" style={{
            padding: "12px 14px",
            borderRadius: "14px 14px 14px 4px",
            background: "var(--glass-2)",
            fontSize: 12.5,
            lineHeight: 1.55,
            animation: "fadeUp .5s ease .1s both",
          }}>
            <RichText text={c.a} />
            <span className="fn" style={{ marginLeft: 6 }}>¹ {c.cite}</span>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Show carve-outs", "Compare to template", "Export memo"].map(s => (
              <span key={s} className="chip" style={{ fontSize: 11 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cite chip */}
      <div style={{
        position: "absolute", top: 100, left: 0,
        padding: "8px 14px",
        background: "var(--bg-2)",
        border: "1px solid var(--stroke-2)",
        borderRadius: "var(--r-pill)",
        backdropFilter: "blur(20px)",
        fontSize: 11,
        color: "var(--text-2)",
        boxShadow: "var(--shadow-sm)",
        transform: "rotate(-4deg)",
        display: "flex", alignItems: "center", gap: 8,
        zIndex: 3,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }}></span>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>CITED IN 1.4s</span>
      </div>
    </div>
  );
}

function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>{parts.map((p, i) => p.startsWith("**") ?
      <strong key={i} style={{ color: "var(--text)", fontWeight: 600 }}>{p.slice(2, -2)}</strong> :
      <span key={i}>{p}</span>)}
    </span>
  );
}

export { Masthead, Hero, RichText };
