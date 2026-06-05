'use client';
import React from 'react';
// CHATWITHPDFAI.COM — Aurora · Use Cases · Compare · Testimonials

const { useState: uS3 } = React;

// ============================================================
// USE CASES — tabbed
// ============================================================
function UseCases() {
  const [active, setActive] = uS3(0);
  const cases = [
    {
      tab: "Students", icon: "🎓",
      title: "From textbook to A+ in a Sunday.",
      bullets: [
        "Drop a chapter — get a summary, definitions, and 20 flashcards.",
        "Ask the textbook 'why' and get worked examples in plain English.",
        "Translate a dense paper without losing the citations.",
      ],
      stat: { n: "500 pp", l: "drop a whole textbook into one chat" },
      who: "Students · example workflow",
      q: "Drop a chapter and get a clean summary, the key definitions, and a ready-to-study flashcard set — with every answer pinned to the page it came from.",
      href: "/signup", cta: "Try it free →",
    },
    {
      tab: "Teachers", icon: "✎",
      title: "From syllabus to exam-ready in minutes.",
      bullets: [
        "Pick a board blueprint or build sections yourself; set marks per question.",
        "Generate from scratch, or ground every question in your uploaded textbook.",
        "Print, export to Moodle / QTI / CSV, or assign as a self-grading online test.",
      ],
      stat: { n: "11 types", l: "MCQ, short, long, match, and more" },
      who: "Teachers · example workflow",
      q: "Turn a chapter or syllabus into an exam-ready question paper — multiple sections, an answer key, and a printable layout — then share it online and auto-grade the results.",
      href: "/question-paper-generator", cta: "Open the question paper generator →",
    },
    {
      tab: "Legal", icon: "⚖",
      title: "Find the clause. Cite the clause. Move on.",
      bullets: [
        "Diff two contracts — clause-by-clause redline with severity ratings.",
        "Build a closing checklist from a 200-page filing in five minutes.",
        "Every answer footnoted to the page; export the chat as a memo.",
      ],
      stat: { n: "Cited", l: "every answer footnoted to the exact page" },
      who: "Legal · example workflow",
      q: "Redline two contracts clause by clause, or build a closing checklist from a long filing — and every answer is footnoted to the exact page so it holds up to review.",
      href: "/signup", cta: "Try it free →",
    },
    {
      tab: "Finance", icon: "📈",
      title: "Earnings call to memo by lunch.",
      bullets: [
        "Ingest a 10-K, a transcript, a research note — chat across all three.",
        "Surface footnotes, table changes, and quiet revisions you'd miss.",
        "Export to Markdown or push to Notion in one click.",
      ],
      stat: { n: "Multi", l: "10-K, transcript, and notes in one thread" },
      who: "Finance · example workflow",
      q: "Chat across a 10-K, a transcript, and a research note at once, surface the quiet footnote and table changes, then export the whole thread as a memo.",
      href: "/signup", cta: "Try it free →",
    },
    {
      tab: "Research", icon: "🔬",
      title: "A literature review that finishes itself.",
      bullets: [
        "Upload 40 papers. Ask 'what do these disagree about?'",
        "Methodology comparison tables with citations — ready for your draft.",
        "Save searches as Threads, re-run when new papers arrive.",
      ],
      stat: { n: "One lib", l: "all your papers, chattable together" },
      who: "Research · example workflow",
      q: "Load dozens of papers and ask where they agree and disagree — with a methodology table and citations you can paste straight into your draft.",
      href: "/signup", cta: "Try it free →",
    },
    {
      tab: "Healthcare", icon: "✚",
      title: "Faster decisions on the floor.",
      bullets: [
        "Chat with a clinical trial PDF and the guideline at the same time.",
        "Private workspaces; documents deleted on request.",
        "Translate consent forms; quote the original verbatim with a footnote.",
      ],
      stat: { n: "Verbatim", l: "source quotes with a page footnote" },
      who: "Healthcare · example workflow",
      q: "Read a clinical trial PDF and the guideline side by side, and quote the source verbatim with a footnote so nothing is paraphrased away.",
      href: "/signup", cta: "Try it free →",
    },
    {
      tab: "Developers", icon: "⌘",
      title: "Bring the API. Bring your stack.",
      bullets: [
        "REST and streaming endpoints; long-document context; deterministic citations.",
        "Webhooks for ocr_completed, summary_ready, citation_verified events.",
        "SDKs for TS, Python, Go; per-doc billing maps to your customers.",
      ],
      stat: { n: "API", l: "REST + streaming, deterministic citations" },
      who: "Developers · example workflow",
      q: "Bring our API into your stack — long-document context, deterministic page-level citations, and per-document billing that maps cleanly to your customers.",
      href: "/signup", cta: "Try it free →",
    },
  ];
  const c = cases[active];

  return (
    <section id="cases" style={{ padding: "100px 0", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--blue), transparent 60%)", left: 0, bottom: 100 }}></div>
      <div className="spread">
        <div className="section-eyebrow">Readers</div>
        <h2 className="section-title">Built for people whose work <span className="iris">lives inside PDFs.</span></h2>
        <p className="section-lede">Seven kinds of work, one tool. Switch the tab; the workflow changes underneath.</p>

        {/* Tab bar */}
        <div className="glass" style={{
          padding: 6, borderRadius: "var(--r-pill)",
          display: "inline-flex", gap: 4, marginBottom: 32,
          flexWrap: "wrap",
        }}>
          {cases.map((cc, i) => (
            <button key={cc.tab} onClick={() => setActive(i)} style={{
              padding: "9px 18px",
              borderRadius: "var(--r-pill)",
              background: i === active ? "var(--grad-iris-2)" : "transparent",
              border: "none",
              color: i === active ? "#fff" : "var(--text-3)",
              fontSize: 13,
              fontWeight: i === active ? 600 : 500,
              cursor: "pointer",
              transition: "all .15s",
              boxShadow: i === active ? "0 6px 18px -6px oklch(0.55 0.22 290 / 0.6)" : "none",
            }}>
              <span style={{ marginRight: 6 }}>{cc.icon}</span>
              {cc.tab}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "stretch" }} className="uc-grid">
          <div>
            <h3 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", margin: "0 0 24px", lineHeight: 1.05, color: "var(--text)" }}>{c.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {c.bullets.map((b, i) => (
                <div key={i} className="glass" style={{
                  padding: "14px 18px",
                  borderRadius: "var(--r)",
                  display: "flex", gap: 14,
                  fontSize: 14, color: "var(--text-2)", lineHeight: 1.5,
                }}>
                  <span className="mono" style={{ color: "var(--violet-2)", fontSize: 11, letterSpacing: "0.1em", flexShrink: 0, marginTop: 3 }}>0{i + 1}</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <div className="glass glass-iris-border" style={{ padding: "20px 22px", borderRadius: "var(--r-lg)", display: "flex", alignItems: "baseline", gap: 18 }}>
              <span style={{ fontSize: 48, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.03em" }} className="iris">{c.stat.n}</span>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>{c.stat.l}</span>
            </div>
            {c.href && <a href={c.href} className="btn btn-iris btn-sm" style={{ marginTop: 20, display: "inline-flex" }}>{c.cta}</a>}
          </div>

          {/* Quote card */}
          <div className="glass" style={{
            padding: "32px 28px",
            borderRadius: "var(--r-xl)",
            position: "relative",
            display: "flex", flexDirection: "column",
            boxShadow: "var(--shadow-card), 0 30px 60px -30px oklch(0.5 0.2 290 / 0.5)",
          }}>
            <div style={{
              position: "absolute", top: -16, left: 22,
              padding: "5px 12px",
              background: "var(--grad-iris-2)",
              borderRadius: "var(--r-pill)",
              fontSize: 11, fontWeight: 600, color: "#fff",
              letterSpacing: "0.04em",
              boxShadow: "0 6px 18px -6px oklch(0.55 0.22 290 / 0.6)",
            }}>In practice</div>

            <div style={{ fontSize: 60, lineHeight: 0.4, marginBottom: 6 }} className="iris">"</div>
            <p style={{
              fontSize: 19, lineHeight: 1.5, margin: 0,
              color: "var(--text)", textWrap: "pretty",
              fontWeight: 400,
            }}>{c.q}</p>

            <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--stroke-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{c.who}</span>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px) { .uc-grid { grid-template-columns: 1fr !important; } }` }} />
    </section>
  );
}

// ============================================================
// COMPARISON TABLE
// ============================================================
function CompareTable() {
  const rows = [
    { f: "Pay-per-document · no subscription", us: true, a: false, b: false, c: false },
    { f: "Citations to the exact paragraph", us: "Always", a: "Sometimes", b: "Page only", c: "Page only" },
    { f: "PDF viewer side-by-side", us: true, a: true, b: false, c: true },
    { f: "Multi-PDF chat across folders", us: "Unlimited", a: "5 docs", b: "1 doc", c: "10 docs" },
    { f: "Page-level citations", us: true, a: "Paid add-on", b: true, c: false },
    { f: "70+ language translation", us: true, a: false, b: "12 langs", c: "EN only" },
    { f: "Export · Markdown / Word / Notion", us: true, a: "Pro plan", b: false, c: "MD only" },
    { f: "Compare two documents (diff)", us: true, a: false, b: false, c: false },
    { f: "Won't train on your files", us: true, a: true, b: "Opt-out", c: true },
    { f: "API · deterministic citations", us: true, a: false, b: false, c: "Beta" },
  ];

  const cell = (v) => {
    if (v === true) return <span style={{ color: "var(--green)", fontSize: 16 }}>✓</span>;
    if (v === false) return <span style={{ color: "var(--text-4)", fontSize: 16 }}>—</span>;
    return <span style={{ fontSize: 12, color: "var(--text-2)" }}>{v}</span>;
  };

  return (
    <section style={{ padding: "60px 0 100px", position: "relative" }}>
      <div className="spread">
        <div className="section-eyebrow">Comparison</div>
        <h2 className="section-title">How we stack up <span className="iris">against the rest.</span></h2>
        <p className="section-lede">Ten things that matter. We checked.</p>

        <div className="glass" style={{ borderRadius: "var(--r-xl)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                  <th style={th("left")}>Capability</th>
                  <th style={{ ...th("center"), background: "linear-gradient(180deg, rgba(183,106,255,0.18), transparent)", position: "relative" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }} className="iris">CHATWITHPDFAI</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--text-3)", marginTop: 2 }}>OURS</div>
                  </th>
                  <th style={th("center")}>Competitor A</th>
                  <th style={th("center")}>Competitor B</th>
                  <th style={th("center")}>Competitor C</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.f} style={{ borderTop: "1px solid var(--stroke-1)" }}>
                    <td style={td("left", { color: "var(--text)", fontWeight: 500 })}>{r.f}</td>
                    <td style={td("center", { background: "rgba(183,106,255,0.06)" })}>{cell(r.us)}</td>
                    <td style={td("center")}>{cell(r.a)}</td>
                    <td style={td("center")}>{cell(r.b)}</td>
                    <td style={td("center")}>{cell(r.c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mono" style={{ marginTop: 14, fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}>
          † COMPILED FROM PUBLIC DOCUMENTATION, MAY 2026. COMPETITOR NAMES OMITTED; CAPABILITIES COMPARED, NOT BRANDS.
        </div>
      </div>
    </section>
  );
}
function th(align) {
  return { textAlign: align, padding: "14px 18px", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500, color: "var(--text-3)" };
}
function td(align, extra = {}) {
  return { textAlign: align, padding: "14px 18px", fontSize: 13, color: "var(--text-2)", verticalAlign: "middle", ...extra };
}

// ============================================================
// TESTIMONIALS
// ============================================================
function Testimonials() {
  const quotes = [
    { q: "Every answer is pinned to the exact page it came from — so you can verify it, not just trust it.", a: "Cited, always", r: "Receipts on every answer", big: true },
    { q: "Pay per document. Credits never expire, and there's no subscription to cancel.", a: "No subscription", r: "₹ pricing" },
    { q: "Your files stay private — deleted on request, and never used to train AI models.", a: "Private by default", r: "" },
    { q: "Two tools, one account: chat with any PDF, and generate exam-ready question papers.", a: "One account", r: "PDF chat + question papers", iris: true },
    { q: "Read in one language and ask in another — translations stay footnoted to the source.", a: "70+ languages", r: "" },
    { q: "Bring a contract, a textbook, a filing, or a syllabus — up to 500 pages per document.", a: "Any document", r: "" },
  ];

  return (
    <section style={{ padding: "60px 0 100px", position: "relative" }}>
      <div className="spread">
        <div className="section-eyebrow">Why it’s different</div>
        <h2 className="section-title">What you can <span className="iris">count on.</span></h2>
        <p className="section-lede">No fine print — these hold on every plan.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="test-grid">
          {quotes.map((q, i) => (
            <div key={i} className={`glass hover-glow`} style={{
              padding: "26px 24px",
              borderRadius: "var(--r-xl)",
              gridColumn: q.big ? "span 2" : "auto",
              background: q.iris ? "var(--grad-iris-2)" : "var(--glass-1)",
              border: q.iris ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--stroke-2)",
              color: q.iris ? "#fff" : "var(--text)",
              boxShadow: q.iris ? "0 16px 40px -16px oklch(0.5 0.2 290 / 0.6)" : undefined,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ fontSize: 32, lineHeight: 0.6, marginBottom: 12, color: q.iris ? "rgba(255,255,255,0.7)" : "var(--violet-2)" }}>"</div>
              <p style={{
                fontSize: q.big ? 20 : 15.5, lineHeight: 1.45, margin: 0,
                fontWeight: 400, textWrap: "pretty",
                color: q.iris ? "#fff" : "var(--text)",
              }}>{q.q}</p>
              <div style={{
                marginTop: 22, paddingTop: 14,
                borderTop: q.iris ? "1px solid rgba(255,255,255,0.25)" : "1px solid var(--stroke-1)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{q.a}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", opacity: q.iris ? 0.85 : 0.6 }}>{q.r}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 860px) {
          .test-grid { grid-template-columns: 1fr !important; }
          .test-grid > div { grid-column: auto !important; }
        }
      ` }} />
    </section>
  );
}

export { UseCases, CompareTable, Testimonials };
