// CHATWITHPDFAI.COM — Aurora · Pricing · Security · FAQ · Footer

const { useState: uS4 } = React;

// ============================================================
// PRICING
// ============================================================
function Pricing() {
  const packs = [
    { name: "Reader", price: 5, docs: 50, per: "$0.10", desc: "Trying it out", seats: 1, features: ["All features unlocked", "Credits never expire", "70+ languages, OCR included"] },
    { name: "Practice", price: 29, docs: 400, per: "$0.07", desc: "Most popular", seats: 3, featured: true, features: ["Everything in Reader", "Shared folders & history", "Priority OCR queue", "Word / Notion / Markdown export"] },
    { name: "Chamber", price: 119, docs: 2500, per: "$0.05", desc: "Firms & teams", seats: 15, features: ["Everything in Practice", "SSO · audit logs", "BAA · HIPAA alignment", "Dedicated support"] },
  ];

  return (
    <section id="pricing" style={{ padding: "100px 0", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--teal), transparent 60%)", right: 0, top: 0 }}></div>
      <div className="spread">
        <div className="section-eyebrow">The ledger</div>
        <h2 className="section-title">Buy credits. <span className="iris">Spend them slowly.</span></h2>
        <p className="section-lede">One credit reads one PDF, no matter the length. Credits never expire. No monthly minimums.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="price-grid">
          {packs.map(p => (
            <div key={p.name} className={`glass ${p.featured ? "glass-iris-border" : ""}`} style={{
              padding: "32px 28px",
              borderRadius: "var(--r-xl)",
              background: p.featured ? "linear-gradient(180deg, rgba(183,106,255,0.12), rgba(78,163,255,0.06))" : "var(--glass-1)",
              borderColor: p.featured ? "transparent" : "var(--stroke-2)",
              position: "relative",
              display: "flex", flexDirection: "column",
              boxShadow: p.featured ? "0 30px 60px -20px oklch(0.4 0.2 290 / 0.5)" : undefined,
            }}>
              {p.featured && (
                <div style={{
                  position: "absolute", top: -14, right: 22,
                  padding: "5px 12px",
                  background: "var(--grad-iris-2)",
                  borderRadius: "var(--r-pill)",
                  fontSize: 11, fontWeight: 600, color: "#fff",
                  letterSpacing: "0.04em",
                  boxShadow: "0 6px 18px -6px oklch(0.55 0.22 290 / 0.6)",
                }}>{p.desc}</div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: 22, margin: 0, fontWeight: 600, color: "var(--text)" }}>{p.name}</h3>
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--text-3)" }}>{p.per} / DOC</span>
              </div>
              <p style={{ fontSize: 12.5, margin: "4px 0 22px", color: "var(--text-3)" }}>{p.seats} seat{p.seats > 1 ? "s" : ""} · No expiry</p>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 64, lineHeight: 0.9, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--text)" }}>${p.price}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em" }}>USD · ONCE</span>
              </div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--violet-2)", marginBottom: 22 }}>
                ◉ {p.docs.toLocaleString()} DOCUMENTS
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", flex: 1 }}>
                {p.features.map(ft => (
                  <li key={ft} style={{ padding: "8px 0", borderTop: "1px solid var(--stroke-1)", fontSize: 13.5, color: "var(--text-2)", display: "flex", gap: 10 }}>
                    <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
              <button className={p.featured ? "btn btn-iris" : "btn btn-glass"} style={{ width: "100%" }}>
                Buy {p.name} pack →
              </button>
            </div>
          ))}
        </div>

        <div className="glass" style={{
          marginTop: 24, padding: "20px 24px",
          borderRadius: "var(--r-lg)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 20, flexWrap: "wrap",
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Free tier</div>
            <p style={{ margin: 0, fontSize: 15, color: "var(--text)" }}>
              <strong style={{ fontWeight: 600 }}>3 documents free.</strong> No card. We figured you'd want to try the thing.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="app.html" className="btn btn-iris">Start free →</a>
            <a href="#" className="btn btn-glass">Talk to sales</a>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .price-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

// ============================================================
// SECURITY
// ============================================================
function Security() {
  const claims = [
    { t: "Encrypted in flight & at rest", d: "TLS 1.3 inbound; AES-256 at rest. No plaintext intermediates." },
    { t: "We never train on your documents", d: "Not us, not OpenAI, not Anthropic. Contractually." },
    { t: "Delete in one click — really gone", d: "Hard-delete propagates to backups within 24 hours. Receipt issued." },
    { t: "SOC 2 · GDPR · HIPAA", d: "Audited annually. BAAs on Practice and above. EU residency optional." },
    { t: "Private workspaces for teams", d: "Per-tenant isolation, SSO, audit logs, role-based permissions." },
    { t: "Sub-processor list, published", d: "Every model and vendor that touches your data, named." },
  ];
  return (
    <section id="security" style={{ padding: "100px 0", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", left: -200, top: 100, opacity: 0.4 }}></div>
      <div className="spread">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "start" }} className="sec-grid">
          <div>
            <div className="section-eyebrow">Chain of custody</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              Treated like <span className="iris">privileged documents.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--text-3)", margin: "0 0 28px", maxWidth: 380 }}>
              Lawyers, doctors, and analysts brought us here. The bar is the bar.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["SOC 2", "HIPAA", "GDPR", "ISO 27001"].map(b => (
                <span key={b} className="pill" style={{ padding: "7px 14px", fontSize: 12 }}>{b}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }} className="sec-claims">
            {claims.map((c, i) => (
              <div key={c.t} className="glass hover-glow" style={{ padding: "22px 22px", borderRadius: "var(--r-lg)" }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--violet-2)", marginBottom: 10 }}>№ {String(i + 1).padStart(2, "0")}</div>
                <h4 style={{ fontSize: 15, margin: "0 0 6px", fontWeight: 600, color: "var(--text)" }}>{c.t}</h4>
                <p style={{ fontSize: 12.5, margin: 0, color: "var(--text-3)", lineHeight: 1.5 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .sec-grid { grid-template-columns: 1fr !important; }
          .sec-claims { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQ() {
  const [open, setOpen] = uS4(0);
  const items = [
    { q: "How accurate are the citations?", a: "Every claim in an answer is footnoted to a page and a paragraph in the source document. If we cannot ground a claim, we say so — we will not invent a citation. We measure this; the false-citation rate in our last audit was below 0.4%." },
    { q: "What counts as one credit?", a: "One credit lets you upload and chat with one document, however many questions you ask. A 12-page contract and a 1,200-page filing both cost one credit. OCR for scanned PDFs is included." },
    { q: "Do credits expire?", a: "No. Credits never expire. We do not run a subscription you have to remember to cancel. If you walk away for two years and come back, your unused credits will still be there." },
    { q: "Will my documents be used to train models?", a: "No. Not ours, not OpenAI's, not Anthropic's, not anyone's. This is in our contract and in the sub-processor agreements we hold with every model vendor we use." },
    { q: "How big a PDF can I upload?", a: "Up to 2,000 pages or 250 MB per document on Reader and Practice, up to 10,000 pages on Chamber. We do not chunk away context — you can ask questions that span the whole document." },
    { q: "What languages are supported?", a: "Over 70 input languages, including documents that mix scripts. You can read a Japanese filing and ask questions in English; we will quote the original verbatim in a footnote when we translate." },
    { q: "Can I use it via API?", a: "Yes. REST and streaming endpoints, deterministic citations, webhooks for OCR / summary / citation events, and SDKs for TypeScript, Python, and Go. Per-document pricing maps cleanly to your customers." },
    { q: "What happens when I delete a document?", a: "It is removed from your workspace immediately. Hard-deletion propagates to encrypted backups within 24 hours. We send you a deletion receipt with the timestamp." },
  ];
  return (
    <section style={{ padding: "60px 0 100px", position: "relative" }}>
      <div className="spread">
        <div className="section-eyebrow">Inquiries</div>
        <h2 className="section-title">Anticipated <span className="iris">questions.</span></h2>
        <p className="section-lede">If yours isn't here, the email is in the footer.</p>

        <div className="glass" style={{ borderRadius: "var(--r-xl)", overflow: "hidden" }}>
          {items.map((it, i) => (
            <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--stroke-1)" : "none" }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                width: "100%", textAlign: "left",
                background: "transparent", border: "none",
                padding: "20px 28px",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
                color: "var(--text)", fontFamily: "var(--sans)",
              }}>
                <span style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--violet-2)" }}>№ {String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{it.q}</span>
                </span>
                <span style={{ fontSize: 22, color: "var(--violet-2)", lineHeight: 1, transform: open === i ? "rotate(45deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 28px 22px 70px", fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, maxWidth: 760, animation: "fadeUp .25s ease" }}>
                  {it.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CLOSING + FOOTER
// ============================================================
function Footer() {
  return (
    <footer>
      {/* Closing CTA */}
      <section style={{ position: "relative", padding: "120px 0", overflow: "hidden" }}>
        <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 800, height: 800, opacity: 0.5 }}></div>
        <div className="spread" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>The reading room is open</div>
          <h2 className="display" style={{
            fontSize: "clamp(44px, 6vw, 84px)", margin: "20px auto 24px", maxWidth: 900,
          }}>
            Drop a PDF in.<br />
            <span className="iris">The assistant is reading.</span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--text-3)", maxWidth: 540, margin: "0 auto 36px" }}>
            3 documents free, no card required. Then $5 for 50 more. Credits never expire.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="app.html" className="btn btn-iris btn-lg">Try free →</a>
            <a href="#pricing" className="btn btn-glass btn-lg">Buy a credit pack</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--stroke-1)", padding: "60px 0 30px" }}>
        <div className="spread">
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 40 }} className="foot-grid">
            <div>
              <a href="#top" className="brand" style={{ fontSize: 18, marginBottom: 14, display: "inline-flex" }}>
                <span className="brand-mark">◇</span>
                chatwithpdfai<span className="domain">.com</span>
              </a>
              <p style={{ fontSize: 13.5, color: "var(--text-3)", margin: "14px 0 18px", lineHeight: 1.55, maxWidth: 320 }}>
                A research assistant in the margin of every document. Pay-per-doc. No subscription. No nonsense.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {["SOC 2", "HIPAA", "GDPR"].map(b => <span key={b} className="pill" style={{ padding: "4px 10px", fontSize: 10.5 }}>{b}</span>)}
              </div>
            </div>
            {[
              { h: "Product", l: ["Features", "Pricing", "API", "Changelog", "Status"] },
              { h: "Use cases", l: ["Students", "Legal", "Finance", "Research", "Healthcare"] },
              { h: "Company", l: ["Blog", "Careers", "Press kit", "Contact", "Manifesto"] },
              { h: "Legal", l: ["Privacy", "Terms", "Security", "Sub-processors", "DPA"] },
            ].map(col => (
              <div key={col.h}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>{col.h}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.l.map(li => (
                    <li key={li} style={{ padding: "5px 0", fontSize: 13.5 }}>
                      <a href="#" style={{ color: "var(--text-2)", transition: "color .15s" }} onMouseEnter={e => e.target.style.color = "var(--violet-2)"} onMouseLeave={e => e.target.style.color = "var(--text-2)"}>{li}</a>
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
      </div>
    </footer>
  );
}

Object.assign(window, { Pricing, Security, FAQ, Footer });
