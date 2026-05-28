// CHATWITHPDFAI.COM — Aurora Chat App · Shell (header + sidebar)
const { useState: uA1, useEffect: uA2, useRef: uA3 } = React;

// ============================================================
// DOC FIXTURES
// ============================================================
const DOCS = {
  contract: {
    id: "contract",
    title: "Kass v. North American Research.pdf",
    short: "Kass v. North Am.",
    pages: 89,
    type: "Legal · Securities",
    summary: "A securities fraud class action alleging misrepresentation of derivative exposure. Court denied motion to dismiss; safe harbor defense rejected; scienter sufficiently pled under PSLRA / Tellabs.",
    suggested: [
      "Summarize the holdings in three bullets",
      "Why was the safe harbor defense rejected?",
      "Generate flashcards for the legal tests",
      "What is the procedural posture?",
      "Compare to Halliburton II",
    ],
    pagesContent: [
      { n: 12, head: "III. Discussion", paras: [
        { id: "p1", t: "The court must determine whether the plaintiff has stated a claim upon which relief can be granted under Rule 12(b)(6). In doing so, we accept all factual allegations as true and construe them in the light most favorable to the non-moving party." },
        { id: "p2", t: "Defendant's reliance on the safe harbor provision of 17 C.F.R. § 240.10b5-1 is misplaced, as the alleged trades occurred outside the protected window of the affirmative defense." },
        { id: "p3", t: "The complaint sufficiently alleges scienter under the heightened pleading standard of the PSLRA. Plaintiff identifies specific statements made by defendants during the class period that materially misrepresented the company's exposure to derivative instruments." },
        { id: "p4", t: "Moreover, the temporal proximity between the disclosure of the restatement and the personal stock sales by individual defendants supports a strong inference of conscious misbehavior or recklessness, as required by Tellabs Inc. v. Makor Issues & Rights, Ltd." },
        { id: "p5", t: "Accordingly, we hold that the complaint adequately pleads each element of a Section 10(b) and Rule 10b-5 claim. Defendants' motion to dismiss is denied as to Counts I and II." },
      ]},
    ],
    answers: {
      "summarize the holdings": {
        text: "Three holdings, in order:\n\n• **Safe harbor rejected.** Rule 10b5-1 affirmative defense fails because the trades fell outside the protected window. {{p2}}\n\n• **Scienter sufficiently pled.** Specific class-period statements + temporal proximity to insider sales meet the PSLRA / Tellabs bar. {{p3}} {{p4}}\n\n• **Motion to dismiss denied** as to Counts I and II under § 10(b) / Rule 10b-5. {{p5}}",
        cites: ["p2", "p3", "p4", "p5"],
      },
      "safe harbor": {
        text: "The court rejected it. The 10b5-1 affirmative defense requires the trade to occur within a pre-established plan window. Here, the alleged trades fell **outside that window**, so the safe harbor never attached. {{p2}}",
        cites: ["p2"],
      },
      "flashcards": {
        text: "Five flashcards generated.\n\n**Q: What standard governs Rule 12(b)(6)?**\nA: Accept all factual allegations as true; construe in the light most favorable to the non-moving party. {{p1}}\n\n**Q: When does the 10b5-1 safe harbor apply?**\nA: Only when the trade occurs within a pre-established plan window. {{p2}}\n\n**Q: What is the PSLRA scienter standard?**\nA: A strong inference of conscious misbehavior or recklessness, per Tellabs. {{p3}} {{p4}}\n\n**Q: What was the disposition?**\nA: Motion to dismiss denied as to Counts I and II under § 10(b) / Rule 10b-5. {{p5}}",
        cites: ["p1", "p2", "p3", "p4", "p5"],
      },
      "procedural": {
        text: "The opinion resolves the defendants' Rule 12(b)(6) motion to dismiss. The motion was **denied** as to Counts I and II. The case proceeds to discovery. {{p1}} {{p5}}",
        cites: ["p1", "p5"],
      },
      "halliburton": {
        text: "Halliburton II (2014) preserves the fraud-on-the-market presumption but lets defendants rebut it at class certification with evidence of no price impact. This opinion does not reach class cert — it addresses pleading sufficiency. Both apply Tellabs to scienter. {{p3}} {{p4}}",
        cites: ["p3", "p4"],
      },
    },
  },
};

// ============================================================
// HEADER
// ============================================================
function AppHeader({ credits, docTitle, onUpload, onShare }) {
  return (
    <header style={{
      padding: "12px 22px",
      display: "flex", alignItems: "center", gap: 16,
      borderBottom: "1px solid var(--stroke-1)",
      background: "rgba(5,6,20,0.85)",
      backdropFilter: "blur(20px) saturate(180%)",
      flexShrink: 0,
      zIndex: 10,
    }}>
      <a href="landing.html" className="brand" style={{ fontSize: 15 }}>
        <span className="brand-mark">◇</span>
        chatwithpdfai<span className="domain">.com</span>
      </a>
      <span style={{ color: "var(--text-4)" }}>/</span>
      <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Workspace · {docTitle}
      </span>
      <div style={{ flex: 1 }}></div>
      <CreditMeter credits={credits} />
      <button onClick={onShare} className="btn btn-glass btn-sm">↗ Share</button>
      <button onClick={onUpload} className="btn btn-iris btn-sm">+ Upload PDF</button>
    </header>
  );
}

function CreditMeter({ credits }) {
  return (
    <div className="pill" style={{ padding: "5px 8px 5px 4px", gap: 8 }}>
      <div style={{ display: "flex", gap: 3, padding: "0 4px" }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i < Math.ceil(credits / 10) ? "var(--violet)" : "transparent",
            border: `1.5px solid ${i < Math.ceil(credits / 10) ? "var(--violet)" : "var(--stroke-2)"}`,
            boxShadow: i < Math.ceil(credits / 10) ? "0 0 6px var(--violet)" : "none",
          }}></div>
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--text-2)" }}>
        {credits} CR
      </span>
      <span style={{ width: 1, height: 14, background: "var(--stroke-2)" }}></span>
      <a href="landing.html#pricing" className="mono" style={{ fontSize: 10.5, letterSpacing: "0.06em", color: "var(--violet-2)", textTransform: "uppercase" }}>+ Buy</a>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({ active, onPick, onNew }) {
  const folders = [
    { name: "Active Cases", count: 3 },
    { name: "Due Diligence", count: 7, current: true },
    { name: "Reading List", count: 12 },
    { name: "Trash", count: 1 },
  ];
  const recent = [
    { id: "contract", name: "Kass v. North Am.", date: "Today", current: true },
    { id: "10k", name: "Q3-earnings-NVDA-2026", date: "Yesterday" },
    { id: "hipaa", name: "HIPAA Compliance Audit", date: "Mar 14" },
    { id: "thesis", name: "Mesopotamian Trade Networks", date: "Mar 9" },
    { id: "trial", name: "ATLAS-2 Phase III Protocol", date: "Mar 4" },
  ];

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      borderRight: "1px solid var(--stroke-1)",
      background: "rgba(5,6,20,0.6)",
      backdropFilter: "blur(20px) saturate(180%)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      padding: "18px 0",
    }}>
      <div style={{ padding: "0 14px 16px" }}>
        <button onClick={onNew} className="btn btn-iris" style={{ width: "100%" }}>
          + New chat
        </button>
      </div>

      <div style={{ padding: "0 14px 6px" }}>
        <input className="input" placeholder="Search…" style={{ fontSize: 12.5, padding: "8px 12px" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <div className="eyebrow" style={{ padding: "10px 16px 6px" }}>Folders</div>
        {folders.map(f => (
          <div key={f.name} style={{
            padding: "8px 16px",
            display: "flex", justifyContent: "space-between",
            fontSize: 13, color: f.current ? "var(--text)" : "var(--text-3)",
            background: f.current ? "var(--glass-2)" : "transparent",
            borderLeft: f.current ? "2px solid var(--violet)" : "2px solid transparent",
            cursor: "pointer", fontWeight: f.current ? 500 : 400,
          }}>
            <span>{f.name}</span>
            <span className="mono" style={{ fontSize: 10.5 }}>{f.count}</span>
          </div>
        ))}

        <div className="eyebrow" style={{ padding: "20px 16px 6px" }}>Recent</div>
        {recent.map(r => (
          <div key={r.id} onClick={() => onPick(r.id)} style={{
            padding: "10px 16px",
            color: r.id === active ? "var(--text)" : "var(--text-2)",
            background: r.id === active ? "var(--glass-2)" : "transparent",
            borderLeft: r.id === active ? "2px solid var(--violet)" : "2px solid transparent",
            cursor: "pointer",
          }}>
            <div style={{ fontSize: 13, fontWeight: r.id === active ? 500 : 400, lineHeight: 1.3 }}>{r.name}</div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 3, textTransform: "uppercase" }}>{r.date}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ margin: 12, padding: 14, borderRadius: "var(--r)" }}>
        <div className="eyebrow" style={{ color: "var(--violet-2)", marginBottom: 6 }}>Tip</div>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: "0 0 10px", color: "var(--text-2)" }}>
          Drop a folder of PDFs to chat across them at once.
        </p>
        <a href="landing.html#pricing" className="mono" style={{ fontSize: 10, color: "var(--violet-2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>+ BUY CREDITS →</a>
      </div>
    </aside>
  );
}

Object.assign(window, { DOCS, AppHeader, Sidebar });
