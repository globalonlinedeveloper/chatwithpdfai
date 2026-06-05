'use client';
import React from 'react';
// CHATWITHPDFAI.COM — Aurora · Pricing · Security · FAQ · Footer

const { useState: uS4 } = React;

// ============================================================
// PRICING
// ============================================================
function Pricing() {
  const [authed, setAuthed] = uS4(false);
  React.useEffect(() => { fetch('/api/auth/state').then((r) => (r.ok ? r.json() : null)).then((j) => setAuthed(!!(j && j.authed))).catch(() => {}); }, []);
  const packs = [
    { code: 'reader', name: 'Reader', price: 399, credits: 50, desc: 'Trying it out' },
    { code: 'practice', name: 'Practice', price: 999, credits: 200, desc: 'Most popular', featured: true },
    { code: 'chamber', name: 'Chamber', price: 2999, credits: 700, desc: 'Power users' },
    { code: 'enterprise', name: 'Enterprise', price: 9999, credits: 2500, desc: 'Teams & firms' },
  ];
  const features = ['All features unlocked', 'Cited, grounded answers', '70+ languages', 'Credits never expire'];
  return (
    <section id="pricing" style={{ padding: "100px 0", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--teal), transparent 60%)", right: 0, top: 0 }}></div>
      <div className="spread">
        <div className="section-eyebrow">Pricing</div>
        <h2 className="section-title">Buy credits. <span className="iris">They never expire.</span></h2>
        <p className="section-lede">One credit covers one document — ask it as many questions as you like. Credits never expire. No subscription.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }} className="price-grid">
          {packs.map(p => (
            <div key={p.code} className={`glass ${p.featured ? "glass-iris-border" : ""}`} style={{ padding: "30px 24px", borderRadius: "var(--r-xl)", background: p.featured ? "linear-gradient(180deg, rgba(183,106,255,0.12), rgba(78,163,255,0.06))" : "var(--glass-1)", borderColor: p.featured ? "transparent" : "var(--stroke-2)", position: "relative", display: "flex", flexDirection: "column" }}>
              {p.featured && <div style={{ position: "absolute", top: -14, right: 22, padding: "5px 12px", background: "var(--grad-iris-2)", borderRadius: "var(--r-pill)", fontSize: 11, fontWeight: 600, color: "#fff" }}>{p.desc}</div>}
              <h3 style={{ fontSize: 22, margin: 0, fontWeight: 600, color: "var(--text)" }}>{p.name}</h3>
              <p style={{ fontSize: 12.5, margin: "4px 0 18px", color: "var(--text-3)" }}>{p.desc} · no expiry</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 52, lineHeight: 0.9, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--text)" }}>₹{p.price.toLocaleString()}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>ONE-TIME</span>
              </div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--violet-2)", marginBottom: 20 }}>◉ {p.credits} CREDITS</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                {features.map(ft => (
                  <li key={ft} style={{ padding: "8px 0", borderTop: "1px solid var(--stroke-1)", fontSize: 13.5, color: "var(--text-2)", display: "flex", gap: 10 }}><span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span><span>{ft}</span></li>
                ))}
              </ul>
              <a href={authed ? "/buy" : "/signup?next=/buy"} className={p.featured ? "btn btn-iris" : "btn btn-glass"} style={{ width: "100%", justifyContent: "center" }}>Buy {p.name} →</a>
            </div>
          ))}
        </div>
        <div className="glass" style={{ marginTop: 24, padding: "20px 24px", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Pay as you go</div>
            <p style={{ margin: 0, fontSize: 15, color: "var(--text)" }}><strong style={{ fontWeight: 600 }}>No subscription.</strong> Credits never expire — top up only when you need to.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/signup" className="btn btn-iris">Create your account →</a>
            <a href="/contact" className="btn btn-glass">Talk to us</a>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px){.price-grid{grid-template-columns:1fr 1fr !important}} @media (max-width:560px){.price-grid{grid-template-columns:1fr !important}}` }} />
    </section>
  );
}

function Security() {
  const claims = [
    { t: "Encrypted connection", d: "Every page and upload is served over HTTPS (TLS)." },
    { t: "Not used to train AI", d: "We use OpenAI and Anthropic via their APIs, where your content isn't used to train their models." },
    { t: "Delete anytime", d: "Remove a document from your workspace whenever you want." },
    { t: "Only what's needed is sent", d: "We send the model just the text required to answer your question — not your whole library." },
    { t: "Private to your account", d: "Your documents and chats are tied to your account and aren't shared." },
    { t: "Sub-processors, named", d: "The vendors that help run the service are listed on our sub-processors page." },
  ];
  return (
    <section id="security" style={{ padding: "100px 0", position: "relative" }}>
      <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", left: -200, top: 100, opacity: 0.4 }}></div>
      <div className="spread">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "start" }} className="sec-grid">
          <div>
            <div className="section-eyebrow">Your data</div>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              Your documents <span className="iris">stay private.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--text-3)", margin: "0 0 28px", maxWidth: 380 }}>
              Lawyers, doctors, and analysts brought us here. The bar is the bar.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["HTTPS / TLS", "No AI training", "Delete anytime", "Pay-per-use"].map(b => (
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .sec-grid { grid-template-columns: 1fr !important; }
          .sec-claims { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQ() {
  const [open, setOpen] = uS4(0);
  const items = [
    { q: "How accurate are the citations?", a: "Every claim in an answer is footnoted to a page and a paragraph in the source document. If we cannot ground a claim, we say so — we will not invent a citation." },
    { q: "What counts as one credit?", a: "One credit lets you upload and chat with one document, however many questions you ask. A 12-page contract and a 1,200-page filing both cost one credit. We extract and index the document's text." },
    { q: "Do credits expire?", a: "No. Credits never expire. We do not run a subscription you have to remember to cancel. If you walk away for two years and come back, your unused credits will still be there." },
    { q: "Will my documents be used to train models?", a: "No. We use OpenAI and Anthropic through their APIs, where — by default — your prompts and documents are not used to train their models. We don't train on your files either, and we only send the text needed to answer your current question." },
    { q: "How big a PDF can I upload?", a: "Up to 500 pages or 50 MB per document on Reader and Practice, up to 10,000 pages on Chamber. We do not chunk away context — you can ask questions that span the whole document." },
    { q: "What languages are supported?", a: "Over 70 input languages, including documents that mix scripts. You can read a Japanese filing and ask questions in English; we will quote the original verbatim in a footnote when we translate." },
    { q: "Can I use it via API?", a: "Yes. REST and streaming endpoints, deterministic citations, webhooks for upload / summary / citation events, and SDKs for TypeScript, Python, and Go. Per-document pricing maps cleanly to your customers." },
    { q: "What happens when I delete a document?", a: "It is removed from your workspace immediately, along with its extracted text and your chats about it." },
  ];
  return (
    <section style={{ padding: "60px 0 100px", position: "relative" }}>
      <div className="spread">
        <div className="section-eyebrow">FAQ</div>
        <h2 className="section-title">Questions, <span className="iris">answered.</span></h2>
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
            Pay per document — credits never expire, no subscription. Packs from ₹399 for 50 credits.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/signup" className="btn btn-iris btn-lg">Get started →</a>
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
                {["Pay-per-use", "No AI training", "Delete anytime"].map(b => <span key={b} className="pill" style={{ padding: "4px 10px", fontSize: 10.5 }}>{b}</span>)}
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
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 900px) { .foot-grid { grid-template-columns: 1fr 1fr !important; } }
          @media (max-width: 560px) { .foot-grid { grid-template-columns: 1fr !important; } }
        ` }} />
      </div>
    </footer>
  );
}

export { Pricing, Security, FAQ, Footer };
