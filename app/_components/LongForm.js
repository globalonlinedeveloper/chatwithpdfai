'use client';
import React from 'react';
import SiteShell, { PageHeader } from './Chrome';
// Long-form / content page renderer
// Takes a structured data object and renders nav + ToC + prose body

const { useState: uL1, useEffect: uL2 } = React;

// ============================================================
// LEGAL / DOCS LAYOUT — two-column (prose + sticky ToC)
// ============================================================
function LongFormPage({ eyebrow, title, lede, lastUpdated, sections, downloadLabel, downloadHref }) {
  return (
    <SiteShell active="">
      <PageHeader eyebrow={eyebrow} title={title} lede={lede} />
      <section style={{ padding: "0 0 100px" }}>
        <div className="spread" style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 60, alignItems: "start" }} className="lf-grid">
          <div className="prose">
            {lastUpdated && (
              <div className="glass" style={{ padding: "12px 16px", borderRadius: "var(--r)", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Last updated · {lastUpdated}
                </span>
                {downloadHref && <a href={downloadHref} className="btn btn-glass btn-sm">↓ {downloadLabel || "Download PDF"}</a>}
              </div>
            )}
            {sections.map((s, i) => (
              <React.Fragment key={s.id}>
                <h2 id={s.id}>{s.title}</h2>
                {s.body.map((b, bi) => renderBlock(b, bi))}
              </React.Fragment>
            ))}
            <hr />
            <p style={{ fontSize: 13.5, color: "var(--text-3)" }}>
              Questions? Email{" "}
              <a href="mailto:support@chatwithpdfai.com">support@chatwithpdfai.com</a>{" "}
              or write to: CHATWITHPDFAI, Inc., 548 Market St #84219, San Francisco, CA 94104.
            </p>
          </div>
          <aside className="glass toc" style={{ borderRadius: "var(--r-lg)" }}>
            <div className="toc-title">On this page</div>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}>{s.title}</a>
            ))}
          </aside>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 980px) {
          .lf-grid { grid-template-columns: 1fr !important; }
          .lf-grid > aside { display: none; }
        }` }} />
      </section>
    </SiteShell>
  );
}

function renderBlock(b, key) {
  if (typeof b === "string") return <p key={key}>{renderInline(b)}</p>;
  if (b.h3) return <h3 key={key}>{b.h3}</h3>;
  if (b.ul) return <ul key={key}>{b.ul.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ul>;
  if (b.ol) return <ol key={key}>{b.ol.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ol>;
  if (b.table) return (
    <table key={key}>
      <thead><tr>{b.table.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{b.table.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{renderInline(c)}</td>)}</tr>)}</tbody>
    </table>
  );
  if (b.quote) return <blockquote key={key}>{renderInline(b.quote)}</blockquote>;
  if (b.code) return <pre key={key} style={{ background: "var(--glass-2)", border: "1px solid var(--stroke-2)", borderRadius: "var(--r)", padding: 16, fontSize: 12.5, fontFamily: "var(--mono)", color: "var(--violet-2)", overflowX: "auto" }}>{b.code}</pre>;
  return null;
}

function renderInline(text) {
  if (typeof text !== "string") return text;
  // Simple **bold** and `code` parsing
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default LongFormPage;
