// Two more futuristic hero concepts

// ============================================================
// 3. TERMINAL — command-palette / CLI aesthetic, mono
// ============================================================
function Terminal() {
  const [typed, setTyped] = React.useState("");
  const target = "ask --doc=msa.pdf 'what is the indemnification cap?'";
  React.useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#0a0e0d",
      color: "#dce5dc",
      fontFamily: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
      position: "relative", overflow: "hidden",
      backgroundImage: "radial-gradient(circle at 50% 0%, oklch(0.4 0.18 145 / 0.15), transparent 50%)",
    }}>
      {/* scanline overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 3px)",
        pointerEvents: "none",
      }}></div>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(126, 255, 157, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(126, 255, 157, 0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }}></div>

      <header style={{
        position: "relative", padding: "20px 48px",
        borderBottom: "1px solid rgba(126, 255, 157, 0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#7eff9d", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
            ▮ chatwithpdfai<span style={{ color: "#dce5dc66" }}>.com</span>
          </span>
          <span style={{ fontSize: 10, color: "#dce5dc55", letterSpacing: "0.14em" }}>v3.2.1 · MAY 22 2026</span>
        </div>
        <nav style={{ display: "flex", gap: 26, fontSize: 12, color: "#dce5dcaa" }}>
          <span>~/features</span><span>~/pricing</span><span>~/api</span><span>~/docs</span>
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11, color: "#dce5dc88" }}>
          <span>⌘K</span>
          <button style={{
            padding: "7px 14px", background: "#7eff9d", color: "#0a0e0d",
            border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em",
          }}>$ START →</button>
        </div>
      </header>

      <main style={{ position: "relative", padding: "48px 48px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start", zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 11, color: "#7eff9d", letterSpacing: "0.14em", marginBottom: 22 }}>
            [SYSTEM] :: GROUNDED · LOCAL · 70 LANGS · 1M TOKEN CONTEXT
          </div>

          <h1 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 60, lineHeight: 1.05, letterSpacing: "-0.025em",
            margin: 0, fontWeight: 500, color: "#fff",
          }}>
            Chat with<br/>
            any PDF<br/>
            <span style={{ color: "#7eff9d" }}>via terminal.</span>
            <span style={{ color: "#7eff9d", animation: "blink 1s infinite" }}>▮</span>
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#dce5dcbb", marginTop: 22, maxWidth: 440 }}>
            Built for developers and power users. REST API, streaming endpoints, deterministic citations, SDKs in TS/Python/Go.
            <br/><br/>
            <span style={{ color: "#dce5dc88" }}># Pay-per-document. No subscription.</span>
          </p>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            {[
              { k: "↑", v: "Drop a PDF or click upload" },
              { k: "?", v: "Ask anything in natural language" },
              { k: "→", v: "Get cited answers, export to MD" },
            ].map(r => (
              <div key={r.k} style={{ display: "flex", gap: 14, color: "#dce5dccc" }}>
                <span style={{ color: "#7eff9d", width: 16 }}>[{r.k}]</span>
                <span>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal window */}
        <div style={{
          background: "#0d1311",
          border: "1px solid rgba(126,255,157,0.25)",
          borderRadius: 6,
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 60px -20px oklch(0.55 0.2 145 / 0.3)",
          overflow: "hidden",
          fontSize: 12.5,
        }}>
          <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(126,255,157,0.15)", display: "flex", alignItems: "center", gap: 8, background: "#0a0e0d" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff5f5f", "#ffbd2e", "#7eff9d"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}></div>)}
            </div>
            <span style={{ flex: 1, textAlign: "center", color: "#dce5dc66", fontSize: 10.5, letterSpacing: "0.1em" }}>~/work/contracts — chatwithpdfai</span>
          </div>
          <div style={{ padding: "20px 18px", lineHeight: 1.65, minHeight: 380 }}>
            <div style={{ color: "#dce5dc88", marginBottom: 4 }}>
              <span style={{ color: "#7eff9d" }}>$</span> chatwithpdfai upload contract_v4.pdf
            </div>
            <div style={{ color: "#dce5dc99", marginBottom: 4 }}>→ Encrypting · OCR (47 pp) · indexed in 1.2s</div>
            <div style={{ color: "#7eff9d", marginBottom: 14 }}>✓ Ready · 1 credit used · 49 remaining</div>

            <div style={{ color: "#dce5dc88", marginBottom: 4 }}>
              <span style={{ color: "#7eff9d" }}>$</span> {typed}<span style={{ color: "#7eff9d", animation: "blink 1s infinite" }}>▮</span>
            </div>

            {typed.length === target.length && (
              <>
                <div style={{ marginTop: 14, paddingLeft: 12, borderLeft: "2px solid #7eff9d", color: "#fff" }}>
                  <div style={{ fontSize: 11, color: "#7eff9d", letterSpacing: "0.1em", marginBottom: 6 }}>↳ ANSWER · GROUNDED · 1.4s</div>
                  Indemnification cap is <span style={{ color: "#7eff9d" }}>2× annual fees</span>, with three carve-outs:
                  <div style={{ paddingLeft: 14, marginTop: 6, color: "#dce5dccc" }}>
                    <div>1. IP infringement</div>
                    <div>2. Breach of confidentiality</div>
                    <div>3. Gross negligence</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, color: "#dce5dc77", fontSize: 11 }}>
                  [cite 1] § 12.3 Limitation · p.47 ¶3 ─────────── verified
                </div>
                <div style={{ marginTop: 10, color: "#dce5dc88" }}>
                  <span style={{ color: "#7eff9d" }}>$</span> <span style={{ color: "#7eff9d", animation: "blink 1s infinite" }}>▮</span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

// ============================================================
// 4. SPATIAL — light bg, layered floating 3D panels, depth
// ============================================================
function Spatial() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(180deg, #f4f6ff 0%, #e8edff 100%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
      color: "#0a0a25",
    }}>
      {/* soft grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(100,100,180,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,180,0.06) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 90%)",
      }}></div>

      <header style={{
        position: "relative", padding: "22px 56px",
        display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "#0a0a25",
            transform: "rotate(45deg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "4px 4px 0 #6f5cff",
          }}><span style={{ transform: "rotate(-45deg)", color: "#fff", fontWeight: 700, fontSize: 13 }}>◆</span></div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>chatwithpdfai</span>
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 13.5, color: "#0a0a25cc", fontWeight: 500 }}>
          <span>Product</span><span>Solutions</span><span>Pricing</span><span>Docs</span>
        </nav>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "8px 16px", background: "transparent", border: "1.5px solid #0a0a25", borderRadius: 0, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#0a0a25" }}>Sign in</button>
          <button style={{ padding: "8px 18px", background: "#0a0a25", color: "#fff", border: "1.5px solid #0a0a25", borderRadius: 0, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "4px 4px 0 #6f5cff" }}>Get started →</button>
        </div>
      </header>

      <main style={{ position: "relative", padding: "30px 56px 0", display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 50, alignItems: "center", zIndex: 3 }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 4px 5px 12px", background: "#fff", border: "1.5px solid #0a0a25",
            fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", color: "#0a0a25", marginBottom: 24,
            boxShadow: "3px 3px 0 #6f5cff",
          }}>
            <span style={{ width: 7, height: 7, background: "#6f5cff", borderRadius: "50%" }}></span>
            INTRODUCING MULTI-PDF CHAT
            <span style={{ padding: "3px 8px", background: "#0a0a25", color: "#fff", fontSize: 10, letterSpacing: "0.06em", marginLeft: 6 }}>NEW</span>
          </div>

          <h1 style={{
            fontSize: 80, lineHeight: 0.95, letterSpacing: "-0.04em",
            margin: 0, fontWeight: 600, color: "#0a0a25",
          }}>
            Documents <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ position: "absolute", inset: "auto -4px -2px -4px", height: 18, background: "#6f5cff", zIndex: -1 }}></span>
              you can talk to.
            </span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "#0a0a25aa", marginTop: 22, maxWidth: 460, fontWeight: 400 }}>
            Drop a PDF. Ask any question. We answer with citations to the exact page.
            <strong style={{ color: "#0a0a25", fontWeight: 600 }}> No subscription</strong> — you pay per document, credits never expire.
          </p>

          <div style={{ marginTop: 30, display: "flex", gap: 12, alignItems: "stretch" }}>
            <button style={{
              padding: "14px 24px", background: "#0a0a25", color: "#fff",
              border: "1.5px solid #0a0a25", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
              boxShadow: "5px 5px 0 #6f5cff",
              display: "flex", alignItems: "center", gap: 8,
            }}>↑ Upload a PDF</button>
            <button style={{
              padding: "14px 22px", background: "#fff", color: "#0a0a25",
              border: "1.5px solid #0a0a25", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
              boxShadow: "5px 5px 0 #0a0a25",
            }}>Watch demo ▶</button>
          </div>

          <div style={{ marginTop: 36, display: "flex", gap: 28, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>2M+</div>
              <div style={{ fontSize: 11, color: "#0a0a2599", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Docs read / mo</div>
            </div>
            <div style={{ width: 1, height: 36, background: "#0a0a2522" }}></div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>99.6%</div>
              <div style={{ fontSize: 11, color: "#0a0a2599", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Citation accuracy</div>
            </div>
            <div style={{ width: 1, height: 36, background: "#0a0a2522" }}></div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>70+</div>
              <div style={{ fontSize: 11, color: "#0a0a2599", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Languages</div>
            </div>
          </div>
        </div>

        {/* Floating layered cards */}
        <div style={{ position: "relative", height: 480, perspective: 1400 }}>
          {/* Back PDF card */}
          <div style={{
            position: "absolute", top: 60, left: 0, width: 280, height: 320,
            background: "#fff",
            border: "1.5px solid #0a0a25",
            transform: "rotate(-8deg) translateZ(0)",
            boxShadow: "8px 8px 0 #6f5cff",
            padding: 18,
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "#0a0a2566", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>MSA · PAGE 47</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>§ 12.3 Limitation</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.55, color: "#0a0a25aa" }}>
              The aggregate liability of either Party shall not exceed two (2) times the fees paid in the twelve months preceding...
              <span style={{ background: "#fff36a", color: "#0a0a25", padding: "0 2px", fontWeight: 600 }}>except for claims arising from intellectual property infringement</span>
            </div>
            <div style={{ marginTop: 14, height: 6, background: "#0a0a25", width: "70%" }}></div>
            <div style={{ marginTop: 6, height: 6, background: "#0a0a2522", width: "100%" }}></div>
            <div style={{ marginTop: 6, height: 6, background: "#0a0a2522", width: "85%" }}></div>
          </div>

          {/* Chat card — front */}
          <div style={{
            position: "absolute", top: 30, right: 0, width: 340, padding: 22,
            background: "#fff",
            border: "1.5px solid #0a0a25",
            transform: "rotate(3deg)",
            boxShadow: "10px 10px 0 #0a0a25",
            zIndex: 3,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1.5px solid #0a0a25" }}>
              <div style={{ width: 8, height: 8, background: "#6f5cff", borderRadius: "50%" }}></div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", fontWeight: 700 }}>CHAT · LIVE</div>
              <div style={{ flex: 1 }}></div>
              <div style={{ fontSize: 9.5, color: "#0a0a2566", fontFamily: "monospace" }}>47 CR</div>
            </div>

            <div style={{ marginTop: 14, padding: "10px 12px", background: "#fff36a", border: "1.5px solid #0a0a25", fontSize: 12.5, fontWeight: 500 }}>
              What's the indemnification cap?
            </div>
            <div style={{ marginTop: 10, padding: "12px 14px", border: "1.5px solid #0a0a25", borderLeft: "5px solid #6f5cff", fontSize: 12.5, lineHeight: 1.55, color: "#0a0a25" }}>
              <strong>2× annual fees</strong>, with carve-outs for IP, confidentiality, and gross negligence.
              <span style={{ display: "inline-block", marginLeft: 4, padding: "1px 5px", background: "#0a0a25", color: "#fff", fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}>¹ p.47</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Show carve-outs", "Vs. template", "Plain English"].map(s => (
                <span key={s} style={{ fontSize: 10.5, padding: "5px 10px", border: "1.5px solid #0a0a25", background: "#fff", fontWeight: 500 }}>{s}</span>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: "9px 12px", border: "1.5px solid #0a0a25", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#0a0a2566" }}>
              <span>Ask anything…</span>
              <div style={{ flex: 1 }}></div>
              <div style={{ padding: "3px 7px", background: "#0a0a25", color: "#fff", fontSize: 10, fontWeight: 700 }}>↵</div>
            </div>
          </div>

          {/* Floating chip */}
          <div style={{
            position: "absolute", top: 380, left: 90, padding: "8px 14px",
            background: "#7eff9d", border: "1.5px solid #0a0a25",
            transform: "rotate(-4deg)",
            boxShadow: "4px 4px 0 #0a0a25",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          }}>✓ CITED IN 1.4s</div>

          {/* Floating ¶ marker */}
          <div style={{
            position: "absolute", top: 80, right: 320, padding: "6px 12px",
            background: "#0a0a25", color: "#fff",
            transform: "rotate(8deg)",
            fontSize: 11, fontWeight: 700, fontFamily: "monospace",
            boxShadow: "3px 3px 0 #6f5cff",
          }}>¶ 47.3</div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { Terminal, Spatial });
