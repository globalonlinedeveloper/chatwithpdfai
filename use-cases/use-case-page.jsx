// Use-case page renderer — one template, six audiences
const { useState: uUC } = React;

function UseCasePage({ data }) {
  return (
    <PageShell active="cases">
      {/* Hero */}
      <section style={{ padding: "60px 0 60px", position: "relative" }}>
        <div className="section-blob" style={{ background: `radial-gradient(circle, ${data.accent}, transparent 60%)`, top: 50, right: 80, opacity: 0.4 }}></div>
        <div className="spread" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center" }} className="uc-hero">
            <div>
              <div className="section-eyebrow">{data.eyebrow}</div>
              <h1 className="display" style={{ fontSize: "clamp(40px, 5.8vw, 72px)", margin: "16px 0 22px", lineHeight: 1 }}>
                {data.h1a}<br /><span className="iris">{data.h1b}</span>
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-3)", lineHeight: 1.55, margin: "0 0 28px", maxWidth: 540 }}>{data.lede}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <a href="auth/signup.html" className="btn btn-iris btn-lg">{data.cta}</a>
                <a href="landing.html#pricing" className="btn btn-glass btn-lg">See pricing</a>
              </div>
              <div style={{ display: "flex", gap: 28, marginTop: 36, flexWrap: "wrap" }}>
                {data.kpis.map(([n, l]) => (
                  <div key={l}>
                    <div className="iris" style={{ fontSize: 36, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>{n}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.1em", marginTop: 6, textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mockup card */}
            <div className="glass glass-iris-border" style={{ padding: "26px 24px", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.14em" }}>{data.docLabel}</span>
                <span className="mono" style={{ fontSize: 9.5, padding: "3px 7px", background: "rgba(126,255,157,0.12)", border: "1px solid rgba(126,255,157,0.4)", borderRadius: 4, color: "var(--green)", letterSpacing: "0.12em", fontWeight: 600 }}>✓ VERIFIED</span>
              </div>
              <div style={{ alignSelf: "flex-end", padding: "8px 12px", background: "var(--grad-iris-2)", borderRadius: "14px 14px 4px 14px", color: "#fff", fontSize: 12.5, maxWidth: "85%", marginLeft: "auto", marginBottom: 10, display: "inline-block", float: "right", clear: "both" }}>{data.sampleQ}</div>
              <div style={{ clear: "both" }}></div>
              <div className="glass" style={{ padding: "12px 14px", borderRadius: "14px 14px 14px 4px", background: "var(--glass-2)", fontSize: 13, lineHeight: 1.55, marginTop: 8 }} dangerouslySetInnerHTML={{ __html: data.sampleA.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>') + ` <span class="fn">¹ ${data.sampleCite}</span>` }}></div>
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>{data.suggestions.map(s => <span key={s} className="chip" style={{ fontSize: 11 }}>{s}</span>)}</div>
            </div>
          </div>
          <style>{`@media (max-width: 980px) { .uc-hero { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
        </div>
      </section>

      {/* Workflows */}
      <section style={{ padding: "60px 0", position: "relative" }}>
        <div className="spread">
          <div className="section-eyebrow">The workflow</div>
          <h2 className="section-title" style={{ fontSize: 38 }}>How {data.audienceName} use it.</h2>
          <p className="section-lede">{data.workflowLede}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="uc-work">
            {data.workflows.map((w, i) => (
              <div key={w.t} className="glass hover-glow" style={{ padding: "26px 24px", borderRadius: "var(--r-xl)", minHeight: 200 }}>
                <div className="mono iris" style={{ fontSize: 11, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 14 }}>STEP / 0{i + 1}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 10px", letterSpacing: "-0.015em" }}>{w.t}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-3)", lineHeight: 1.55 }}>{w.d}</p>
              </div>
            ))}
          </div>
          <style>{`@media (max-width: 860px) { .uc-work { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </section>

      {/* Quote */}
      <section style={{ padding: "60px 0", position: "relative" }}>
        <div className="section-blob" style={{ background: `radial-gradient(circle, ${data.accent}, transparent 60%)`, left: -100, top: 60, opacity: 0.3 }}></div>
        <div className="spread">
          <div className="glass glass-iris-border" style={{ padding: "40px 44px", borderRadius: "var(--r-xl)", position: "relative", zIndex: 2, maxWidth: 820, margin: "0 auto" }}>
            <div style={{ fontSize: 60, lineHeight: 0.5, marginBottom: 8 }} className="iris">"</div>
            <p style={{ fontSize: 22, lineHeight: 1.45, color: "var(--text)", margin: "0 0 24px", fontWeight: 400, textWrap: "pretty" }}>{data.quote}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 20, borderTop: "1px solid var(--stroke-1)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--grad-iris-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 13 }}>{data.quoteInitials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{data.quoteAuthor}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" }}>{data.quoteRole}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature deep-dive */}
      <section style={{ padding: "60px 0", position: "relative" }}>
        <div className="spread">
          <div className="section-eyebrow">Built for the work</div>
          <h2 className="section-title" style={{ fontSize: 38 }}>What makes it <span className="iris">different</span> for {data.audienceShort}.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginTop: 24 }} className="uc-feat">
            {data.features.map((f, i) => (
              <div key={f.t} className="glass" style={{ padding: "22px 24px", borderRadius: "var(--r-lg)" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--violet-2)", letterSpacing: "0.14em", marginBottom: 8 }}>№ 0{i + 1}</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>{f.t}</h4>
                <p style={{ fontSize: 13.5, color: "var(--text-3)", margin: 0, lineHeight: 1.55 }}>{f.d}</p>
              </div>
            ))}
          </div>
          <style>{`@media (max-width: 760px) { .uc-feat { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 0", position: "relative" }}>
        <div className="section-blob" style={{ background: `radial-gradient(circle, ${data.accent}, transparent 60%)`, top: "30%", left: "40%", width: 700, height: 700, opacity: 0.4 }}></div>
        <div className="spread" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 60px)", margin: "0 auto 18px", maxWidth: 760, lineHeight: 1.05 }}>{data.ctaTitle}</h2>
          <p style={{ fontSize: 16, color: "var(--text-3)", maxWidth: 520, margin: "0 auto 30px" }}>3 documents free, no card. {data.ctaSub}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="auth/signup.html" className="btn btn-iris btn-lg">{data.cta}</a>
            <a href="contact.html" className="btn btn-glass btn-lg">Talk to us</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

Object.assign(window, { UseCasePage });
