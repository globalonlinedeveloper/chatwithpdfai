// Four futuristic hero concepts for CHATWITHPDFAI.COM
// Each is a self-contained 1280×800 artboard

const { useState: uS, useEffect: uE, useRef: uR } = React;

// ============================================================
// 1. AURORA — dark, iridescent gradient mesh, large gradient type
// ============================================================
function Aurora() {
  const [step, setStep] = uS(0);
  const lines = [
    "What's the indemnification cap?",
    "Summarize this 200-page filing.",
    "Compare these two contracts.",
    "Translate Section 12 to plain English.",
  ];
  uE(() => {
    const id = setInterval(() => setStep(s => (s + 1) % lines.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "radial-gradient(ellipse 80% 50% at 20% 30%, oklch(0.32 0.18 280 / 0.9), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, oklch(0.45 0.18 200 / 0.7), transparent 55%), radial-gradient(ellipse 50% 40% at 60% 20%, oklch(0.5 0.18 340 / 0.55), transparent 55%), #050614",
      color: "#fff",
      fontFamily: "Inter, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
      padding: 0,
    }}>
      {/* grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}></div>

      {/* nav */}
      <header style={{ position: "relative", padding: "26px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #b76aff, #4ea3ff)",
            boxShadow: "0 0 24px oklch(0.65 0.2 290 / 0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700,
          }}>◇</div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>chatwithpdfai<span style={{ color: "#b76aff" }}>.com</span></span>
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
          <span>Features</span><span>Pricing</span><span>API</span><span>Security</span>
        </nav>
        <button style={{
          padding: "9px 18px", fontSize: 13, fontWeight: 600,
          background: "linear-gradient(135deg, #b76aff, #4ea3ff)",
          border: "none", borderRadius: 999, color: "#fff", cursor: "pointer",
          boxShadow: "0 8px 24px -8px oklch(0.55 0.22 290 / 0.7)",
        }}>Try free →</button>
      </header>

      <main style={{ position: "relative", padding: "60px 56px 0", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center", zIndex: 2 }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 11.5, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em",
            backdropFilter: "blur(20px)",
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7eff9d", boxShadow: "0 0 10px #7eff9d" }}></span>
            New · Multi-PDF chat now live
          </div>
          <h1 style={{
            fontSize: 78, lineHeight: 0.98, letterSpacing: "-0.04em",
            margin: 0, fontWeight: 500,
            background: "linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.4) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Read any PDF<br />
            <span style={{
              background: "linear-gradient(90deg, #b76aff 0%, #4ea3ff 50%, #7eff9d 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>at light speed.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(255,255,255,0.7)", marginTop: 22, maxWidth: 460 }}>
            Drop a contract, a filing, a thesis. Get cited answers in seconds. Pay only for the documents you use.
          </p>

          {/* Big animated prompt */}
          <div style={{
            marginTop: 32,
            padding: "18px 20px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            backdropFilter: "blur(20px)",
            maxWidth: 520,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 22 }}>✦</span>
            <span key={step} style={{
              flex: 1, fontSize: 16, color: "rgba(255,255,255,0.9)",
              animation: "fade .5s ease",
            }}>{lines[step]}</span>
            <kbd style={{
              padding: "4px 9px", fontSize: 11, fontFamily: "ui-monospace, monospace",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 6, color: "rgba(255,255,255,0.8)",
            }}>⏎</kbd>
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 24, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Trusted by</span>
            {["MERIDIAN", "ARKHAM", "STANFORD GSB", "MAYO"].map(n => (
              <span key={n} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", fontWeight: 500 }}>{n}</span>
            ))}
          </div>
        </div>

        {/* Floating document card */}
        <div style={{ position: "relative", height: 460 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at center, oklch(0.65 0.22 290 / 0.4), transparent 60%)",
            filter: "blur(40px)",
          }}></div>
          {/* Back card */}
          <div style={{
            position: "absolute", top: 30, left: 20, right: 70, bottom: 30,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            transform: "rotate(-4deg)",
            backdropFilter: "blur(10px)",
          }}></div>
          {/* Main card */}
          <div style={{
            position: "absolute", top: 10, left: 50, right: 30, bottom: 50,
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 16,
            padding: "24px 22px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 30px 60px -20px oklch(0.2 0.15 290 / 0.6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: "monospace" }}>MSA · PAGE 47</span>
              <span style={{ fontSize: 9, padding: "3px 7px", background: "oklch(0.6 0.2 145 / 0.2)", border: "1px solid oklch(0.6 0.2 145 / 0.5)", borderRadius: 4, color: "#7eff9d", letterSpacing: "0.1em", fontFamily: "monospace" }}>✓ VERIFIED</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>§ 12.3 Limitation</div>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", margin: "0 0 16px" }}>
              The aggregate liability of either Party under this Section shall not exceed <span style={{ background: "linear-gradient(120deg, oklch(0.55 0.22 290 / 0.4), oklch(0.5 0.2 200 / 0.4))", padding: "1px 4px", borderRadius: 3, color: "#fff" }}>two (2) times the fees paid in the twelve (12) months</span> preceding the claim, except for IP infringement or breach of confidentiality.
            </p>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, marginTop: 4 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #b76aff, #4ea3ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>AI</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(255,255,255,0.85)" }}>
                  The cap is <strong style={{ color: "#fff" }}>2× annual fees</strong>, with three carve-outs for IP, confidentiality, and gross negligence.
                  <span style={{ display: "inline-block", marginLeft: 6, fontSize: 9, padding: "2px 6px", background: "rgba(183,106,255,0.2)", borderRadius: 4, color: "#d9b6ff", letterSpacing: "0.1em", verticalAlign: "middle", fontFamily: "monospace" }}>¹ p.47</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Compare to template", "Show carve-outs"].map(s => (
                  <span key={s} style={{ fontSize: 10.5, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, color: "rgba(255,255,255,0.7)" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ============================================================
// 2. LIQUID GLASS — vibrant gradient bg + frosted glass cards
// ============================================================
function LiquidGlass() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg, #ffd2f0 0%, #c4a8ff 30%, #98c5ff 65%, #b4f4ed 100%)",
      fontFamily: "'SF Pro Display', -apple-system, Inter, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* color blobs */}
      <div style={{ position: "absolute", top: -100, right: -50, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, #ff7ec5, transparent 70%)", filter: "blur(60px)", opacity: 0.7 }}></div>
      <div style={{ position: "absolute", bottom: -100, left: -50, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #5e84ff, transparent 70%)", filter: "blur(70px)", opacity: 0.6 }}></div>
      <div style={{ position: "absolute", top: 200, left: "40%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, #ffe07a, transparent 70%)", filter: "blur(80px)", opacity: 0.5 }}></div>

      {/* Glass header */}
      <header style={{
        position: "relative", margin: "20px 56px", padding: "12px 22px",
        background: "rgba(255,255,255,0.4)", backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 999,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 8px 32px -4px rgba(80,40,120,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
        zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: "linear-gradient(135deg, #ff7ec5, #5e84ff)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700,
          }}>P</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a3a" }}>chatwithpdfai</span>
        </div>
        <nav style={{ display: "flex", gap: 26, fontSize: 13.5, color: "#1a1a3a", fontWeight: 500 }}>
          <span>Features</span><span>Use cases</span><span>Pricing</span><span>API</span>
        </nav>
        <button style={{
          padding: "9px 18px", fontSize: 13, fontWeight: 600,
          background: "rgba(26,26,58,0.92)", color: "#fff", border: "none", borderRadius: 999, cursor: "pointer",
        }}>Get started</button>
      </header>

      <main style={{ position: "relative", padding: "40px 56px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center", zIndex: 3 }}>
        <div>
          <div style={{
            display: "inline-block", padding: "5px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.45)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.7)",
            fontSize: 11.5, color: "#1a1a3a", fontWeight: 500, letterSpacing: "0.02em", marginBottom: 22,
          }}>✨ Powered by frontier models</div>
          <h1 style={{
            fontSize: 84, lineHeight: 0.95, letterSpacing: "-0.045em",
            margin: 0, fontWeight: 600,
            color: "#0a0a25",
          }}>
            Your PDFs,<br />
            <span style={{ fontStyle: "italic", fontWeight: 400, color: "#5e84ff" }}>fluently understood.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(10,10,37,0.7)", marginTop: 22, maxWidth: 460, fontWeight: 400 }}>
            Drop a document. Ask in plain English. Get answers with citations to the exact page — in any of 70 languages.
          </p>

          {/* Glass upload */}
          <div style={{
            marginTop: 30,
            padding: "20px 22px",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(40px) saturate(180%)",
            border: "1.5px dashed rgba(94,132,255,0.7)",
            borderRadius: 20,
            maxWidth: 520,
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 12px 40px -10px rgba(80,40,120,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: "linear-gradient(135deg, #ff7ec5, #5e84ff)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 300,
              boxShadow: "0 6px 16px -4px rgba(94,132,255,0.5)",
            }}>↑</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0a0a25" }}>Drop a PDF to start</div>
              <div style={{ fontSize: 12, color: "rgba(10,10,37,0.6)", marginTop: 2 }}>or click anywhere — 3 free, no card</div>
            </div>
            <button style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #ff7ec5, #5e84ff)",
              color: "#fff", border: "none", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 6px 18px -4px rgba(94,132,255,0.5)",
            }}>Browse</button>
          </div>
        </div>

        {/* Glass PDF stack */}
        <div style={{ position: "relative", height: 480 }}>
          {/* Card 1 — back */}
          <div style={{
            position: "absolute", top: 50, left: 30, right: 60, bottom: 60,
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.5)",
            borderRadius: 24,
            transform: "rotate(-6deg)",
            boxShadow: "0 20px 50px -15px rgba(80,40,120,0.25)",
          }}></div>
          {/* Card 2 — front */}
          <div style={{
            position: "absolute", top: 20, left: 60, right: 30, bottom: 30,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: 24,
            padding: "26px 24px",
            boxShadow: "0 30px 60px -20px rgba(80,40,120,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #ff7ec5, #5e84ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>P</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a25" }}>Q3-earnings-NVDA.pdf</div>
                <div style={{ fontSize: 10.5, color: "rgba(10,10,37,0.55)" }}>89 pages · uploaded just now</div>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* User msg */}
              <div style={{ alignSelf: "flex-end", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", background: "linear-gradient(135deg, #ff7ec5, #5e84ff)", color: "#fff", fontSize: 13, maxWidth: "75%", fontWeight: 500 }}>
                What's the revenue guidance for Q4?
              </div>
              {/* AI msg */}
              <div style={{ alignSelf: "flex-start", padding: "12px 14px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)", color: "#0a0a25", fontSize: 13, maxWidth: "85%", lineHeight: 1.5 }}>
                NVIDIA guides Q4 revenue of <strong>$37.5B ± 2%</strong>, up 7% sequentially, driven by Blackwell ramp and Data Center demand.
                <span style={{ display: "inline-block", marginLeft: 4, fontSize: 9.5, padding: "2px 6px", background: "linear-gradient(135deg, rgba(255,126,197,0.25), rgba(94,132,255,0.25))", border: "1px solid rgba(94,132,255,0.4)", borderRadius: 4, color: "#5e84ff", fontWeight: 600 }}>¹ p.12</span>
              </div>
              <div style={{ alignSelf: "flex-start", padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)", fontSize: 11, color: "rgba(10,10,37,0.7)" }}>
                ✨ Suggested: Show YoY by segment
              </div>
            </div>

            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 10 }}>
              <input placeholder="Ask anything…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#0a0a25" }} />
              <button style={{ padding: "6px 12px", background: "linear-gradient(135deg, #ff7ec5, #5e84ff)", color: "#fff", border: "none", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>↑</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { Aurora, LiquidGlass });
