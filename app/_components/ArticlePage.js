'use client';
import React from 'react';
import SiteShell from './Chrome';
// Long-form article renderer — used by blog posts, help center, customer stories

function ArticlePage({ meta, sections, related, type = "post" }) {
  return (
    <SiteShell active={type === "post" ? "blog" : "help"}>
      {/* Hero */}
      <section style={{ padding: "60px 0 30px", position: "relative" }}>
        <div className="section-blob" style={{ background: "radial-gradient(circle, var(--violet), transparent 60%)", top: -50, right: -100, opacity: 0.3 }}></div>
        <div className="spread" style={{ position: "relative", zIndex: 2, maxWidth: 800 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
            <a href={meta.backHref || "blog.html"} className="btn btn-glass btn-sm">← {meta.backLabel || "Back to blog"}</a>
            {meta.category && <span className="pill" style={{ padding: "3px 10px", fontSize: 10.5 }}>{meta.category}</span>}
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em" }}>{meta.date} · {meta.readTime}</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.05, margin: "0 0 22px" }}>
            {meta.title}
          </h1>
          {meta.lede && <p style={{ fontSize: 19, color: "var(--text-3)", lineHeight: 1.5, margin: "0 0 26px", maxWidth: 680 }}>{meta.lede}</p>}
          {meta.author && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid var(--stroke-1)", borderBottom: "1px solid var(--stroke-1)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--grad-iris-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 12 }}>{meta.author.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{meta.author.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{meta.author.role}</div>
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(location.href); }} className="btn btn-glass btn-sm">↗ Share</button>
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "30px 0 80px" }}>
        <div className="spread" style={{ maxWidth: 800 }}>
          <div className="prose">
            {sections.map((s, i) => (
              <React.Fragment key={i}>
                {s.h2 && <h2 id={s.id}>{s.h2}</h2>}
                {s.body && s.body.map((b, bi) => renderBlock(b, bi))}
              </React.Fragment>
            ))}
          </div>

          {/* Related */}
          {related && related.length > 0 && (
            <div style={{ marginTop: 60, paddingTop: 30, borderTop: "1px solid var(--stroke-1)" }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Related</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="rel-grid">
                {related.map(r => (
                  <a key={r.href} href={r.href} className="glass hover-glow" style={{ padding: "18px 20px", borderRadius: "var(--r-lg)", display: "block" }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 8 }}>{r.tag?.toUpperCase()}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: "var(--text)" }}>{r.title}</div>
                  </a>
                ))}
              </div>
              <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 760px) { .rel-grid { grid-template-columns: 1fr !important; } }` }} />
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function renderBlock(b, key) {
  if (typeof b === "string") return <p key={key}>{renderInline(b)}</p>;
  if (b.h3) return <h3 key={key} id={b.id}>{b.h3}</h3>;
  if (b.ul) return <ul key={key}>{b.ul.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ul>;
  if (b.ol) return <ol key={key}>{b.ol.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ol>;
  if (b.quote) return <blockquote key={key}>{renderInline(b.quote)}{b.cite && <><br /><span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", marginTop: 8, display: "block" }}>— {b.cite.toUpperCase()}</span></>}</blockquote>;
  if (b.code) return <pre key={key} style={{ background: "var(--glass-2)", border: "1px solid var(--stroke-2)", borderRadius: "var(--r)", padding: 16, fontSize: 12.5, fontFamily: "var(--mono)", color: "var(--violet-2)", overflowX: "auto" }}>{b.code}</pre>;
  if (b.stats) return (
    <div key={key} className="glass" style={{ display: "grid", gridTemplateColumns: `repeat(${b.stats.length}, 1fr)`, gap: 0, padding: 0, borderRadius: "var(--r-lg)", margin: "24px 0", overflow: "hidden" }}>
      {b.stats.map((s, i) => (
        <div key={i} style={{ padding: "22px 24px", borderRight: i < b.stats.length - 1 ? "1px solid var(--stroke-1)" : "none" }}>
          <div className="iris" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>{s[0]}</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.1em", marginTop: 6, textTransform: "uppercase" }}>{s[1]}</div>
        </div>
      ))}
    </div>
  );
  if (b.callout) return (
    <div key={key} className="glass" style={{ padding: "18px 22px", borderRadius: "var(--r-lg)", borderLeft: "3px solid var(--violet)", margin: "24px 0" }}>
      {b.callout.title && <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{b.callout.title}</div>}
      <div style={{ fontSize: 13.5, color: "var(--text-3)", lineHeight: 1.55 }}>{renderInline(b.callout.body)}</div>
    </div>
  );
  return null;
}
function renderInline(text) {
  if (typeof text !== "string") return text;
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    const m = p.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (m) return <a key={i} href={m[2]}>{m[1]}</a>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default ArticlePage;
