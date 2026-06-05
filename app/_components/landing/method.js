'use client';
import React from 'react';
// CHATWITHPDFAI.COM — Aurora · How it works · Live preview · Features

const { useState: uS2, useEffect: uE2 } = React;

// ============================================================
// HOW IT WORKS
// ============================================================
function HowItWorks() {
  const steps = [
    {
      n: "01", t: "Upload", glyph: "↑",
      d: "Drop in a PDF or a whole folder. Scanned, encrypted, or 500 pages long — we handle it. Text extraction runs automatically.",
    },
    {
      n: "02", t: "Ask", glyph: "?",
      d: "Chat in plain language. Every answer is grounded in the document and footnoted to the exact page.",
    },
    {
      n: "03", t: "Export", glyph: "↗",
      d: "Send the chat to Markdown, Word, or Notion. Share a read-only link. Pin to a folder for next time.",
    },
  ];

  return (
    <section id="how" style={{ padding: "100px 0", position: "relative" }}>
      <div className="spread">
        <div className="section-eyebrow">How it works</div>
        <h2 className="section-title">Three steps. <span className="iris">No ceremony.</span></h2>
        <p className="section-lede">Most tools ask you to organize a library, sign up, pick a plan. We ask you to drop a file.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="how-grid">
          {steps.map((s, i) => (
            <div key={s.n} className="glass hover-glow" style={{
              padding: 28,
              borderRadius: "var(--r-xl)",
              position: "relative",
              minHeight: 240,
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.16em" }}>STEP / {s.n}</span>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "var(--glass-2)", border: "1px solid var(--stroke-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 300,
                  color: "var(--violet-2)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px -8px oklch(0.6 0.2 290 / 0.4)",
                }}>{s.glyph}</div>
              </div>
              <h3 style={{ fontSize: 24, margin: "0 0 10px", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text)" }}>
                {s.t}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-3)", lineHeight: 1.55 }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 860px) { .how-grid { grid-template-columns: 1fr !important; } }` }} />
    </section>
  );
}

// ============================================================
// LIVE PRODUCT PREVIEW
// ============================================================
function LivePreview() {
  return (
    <section style={{ padding: "60px 0 100px", position: "relative" }}>
      <div className="spread">
        <div className="section-eyebrow">Live workspace</div>
        <h2 className="section-title">See your PDF and the answer <span className="iris">in the same view.</span></h2>
        <p className="section-lede">PDF on the left, chat on the right, citations linking the two. Click a footnote — the page scrolls and the source paragraph lights up.</p>

        <div className="glass" style={{
          borderRadius: "var(--r-xl)",
          padding: 0,
          overflow: "hidden",
          boxShadow: "var(--shadow-card), 0 60px 120px -40px oklch(0.4 0.2 290 / 0.45)",
        }}>
          {/* Browser chrome */}
          <div style={{
            padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 12,
            borderBottom: "1px solid var(--stroke-1)",
            background: "rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff5f5f", "#ffbd2e", "#7eff9d"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }}></div>)}
            </div>
            <div className="mono" style={{
              flex: 1, textAlign: "center", fontSize: 11,
              color: "var(--text-3)", letterSpacing: "0.08em",
              padding: "5px 14px",
              background: "var(--glass-1)", border: "1px solid var(--stroke-1)",
              borderRadius: "var(--r-pill)", maxWidth: 480, margin: "0 auto",
            }}>
              chatwithpdfai.com / w / kass-v-north-american-research.pdf
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--violet-2)", letterSpacing: "0.08em" }}>◉ 47 credits</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "220px 1.2fr 1fr", minHeight: 480 }}>
            {/* Sidebar */}
            <aside style={{ borderRight: "1px solid var(--stroke-1)", padding: "18px 14px", background: "rgba(0,0,0,0.15)" }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Folders</div>
              {[
                { n: "Active Cases", c: 3 },
                { n: "Due Diligence", c: 7, active: true },
                { n: "Reading List", c: 12 },
                { n: "Trash", c: 1 },
              ].map(f => (
                <div key={f.n} style={{
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: f.active ? "var(--glass-2)" : "transparent",
                  display: "flex", justifyContent: "space-between",
                  fontSize: 12.5,
                  color: f.active ? "var(--text)" : "var(--text-3)",
                  fontWeight: f.active ? 500 : 400,
                }}>
                  <span>{f.n}</span>
                  <span className="mono" style={{ fontSize: 10 }}>{f.c}</span>
                </div>
              ))}
              <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Recent</div>
              {["Kass v. North Am.", "Q3-earnings-NVDA", "HIPAA Audit"].map((n, i) => (
                <div key={n} style={{
                  padding: "6px 10px",
                  fontSize: 12.5,
                  color: i === 0 ? "var(--text)" : "var(--text-3)",
                  borderLeft: i === 0 ? "2px solid var(--violet)" : "2px solid transparent",
                  marginLeft: -10, paddingLeft: 14,
                  fontWeight: i === 0 ? 500 : 400,
                }}>{n}</div>
              ))}
            </aside>

            {/* PDF viewer */}
            <main style={{ borderRight: "1px solid var(--stroke-1)", padding: "22px 24px", background: "rgba(0,0,0,0.08)" }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.14em", marginBottom: 12 }}>
                KASS v. NORTH AMERICAN RESEARCH · PAGE 12
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>III. Discussion</h4>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: "var(--text-2)" }}>
                <p style={{ margin: "0 0 10px" }}>The court must determine whether the plaintiff has stated a claim upon which relief can be granted under Rule 12(b)(6).</p>
                <p style={{
                  margin: "0 0 10px",
                  background: "linear-gradient(120deg, rgba(183,106,255,0.18), rgba(78,163,255,0.18))",
                  padding: "8px 10px",
                  borderRadius: 6,
                  borderLeft: "2px solid var(--violet)",
                }}>
                  Defendant's reliance on the safe harbor provision of 17 C.F.R. § 240.10b5-1 is misplaced, as the alleged trades occurred outside the protected window.
                </p>
                <p style={{ margin: "0 0 10px" }}>The complaint sufficiently alleges scienter under the PSLRA. Plaintiff identifies specific statements made during the class period.</p>
                <p style={{ margin: 0 }}>Temporal proximity between the disclosure and personal stock sales supports a strong inference of conscious misbehavior under Tellabs.</p>
              </div>
            </main>

            {/* Chat */}
            <aside style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14, background: "rgba(0,0,0,0.05)" }}>
              <div className="eyebrow">Conversation · 3 messages</div>

              <div style={{
                alignSelf: "flex-end",
                padding: "8px 12px",
                background: "var(--grad-iris-2)",
                borderRadius: "14px 14px 4px 14px",
                color: "#fff", fontSize: 12.5, maxWidth: "85%",
              }}>Does the safe harbor argument hold?</div>

              <div className="glass" style={{
                padding: "12px 14px", borderRadius: "14px 14px 14px 4px",
                fontSize: 12.5, lineHeight: 1.55,
              }}>
                <strong style={{ color: "var(--text)" }}>No</strong> — the court rejected it. Trades fell outside the 10b5-1 window<span className="fn">¹</span>, and scienter is sufficiently pled<span className="fn">²</span>.
                <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", marginTop: 8, letterSpacing: "0.04em" }}>
                  ¹ p.12, ¶2 &nbsp;·&nbsp; ² p.12, ¶3
                </div>
              </div>

              <div style={{ marginTop: 4 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Suggested</div>
                {["Summarize holdings in 3 bullets", "Generate flashcards", "Compare to Halliburton II"].map(s => (
                  <div key={s} className="chip" style={{
                    fontSize: 11.5, marginRight: 6, marginBottom: 6,
                    background: "var(--glass-1)", display: "inline-flex",
                  }}>{s}</div>
                ))}
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: 6 }}>
                <input className="input" placeholder="Ask the document…" style={{ flex: 1, fontSize: 12, padding: "8px 10px" }} />
                <button className="btn btn-iris btn-sm">↵</button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FEATURES GRID
// ============================================================
function FeaturesGrid() {
  const features = [
    { t: "Citations to the paragraph", d: "Every answer footnoted to a page and paragraph. Click to scroll the PDF.", g: "¹" },
    { t: "Side-by-side reader", d: "PDF viewer pinned next to the chat. Highlights sync both ways.", g: "▥" },
    { t: "Multi-PDF chat", d: "Ask across a folder. We tell you which document said what.", g: "≡" },
    { t: "Cited answers", d: "Scanned filings, faxes, photos of pages — all readable.", g: "⌖" },
    { t: "Auto-summaries", d: "Executive, technical, or one-paragraph — on upload.", g: "§" },
    { t: "Question papers & quizzes", d: "Generate exam-ready question papers with answer keys — or flashcards from any document.", g: "♢" },
    { t: "70+ languages", d: "Read in one language, ask in another. Footnoted translations.", g: "ℒ" },
    { t: "Shareable links", d: "Send a read-only conversation. Recipient sees the doc.", g: "↗" },
    { t: "Folders & history", d: "Organize by case, course, deal, or patient. Pinned forever.", g: "⊞" },
    { t: "Export anywhere", d: "Markdown, Word, Notion, Obsidian, JSON.", g: "↓" },
    { t: "Document diffs", d: "Compare two contracts. Get a clause-by-clause changelog.", g: "≠" },
    { t: "Private by default", d: "Encrypted at rest. Delete instantly. No training on your files.", g: "⊕" },
  ];
  return (
    <section id="features" style={{ padding: "100px 0", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--pink), transparent 60%)", top: 100, right: 100 }}></div>
      <div className="spread">
        <div className="section-eyebrow">Apparatus</div>
        <h2 className="section-title">Twelve <span className="iris">working parts.</span></h2>
        <p className="section-lede">A short catalog of what's inside, in the order you'll meet them.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="feat-grid">
          {features.map((f, i) => (
            <div key={f.t} className="glass hover-glow" style={{
              padding: "22px 20px 20px",
              borderRadius: "var(--r-lg)",
              minHeight: 170,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.14em" }}>№ {String(i + 1).padStart(2, "0")}</span>
                <span style={{
                  fontSize: 18,
                  color: "var(--violet-2)",
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--glass-2)", border: "1px solid var(--stroke-1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{f.g}</span>
              </div>
              <h4 style={{ fontSize: 15, margin: "0 0 6px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>{f.t}</h4>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 980px) { .feat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .feat-grid { grid-template-columns: 1fr !important; } }
      ` }} />
    </section>
  );
}

export { HowItWorks, LivePreview, FeaturesGrid };
