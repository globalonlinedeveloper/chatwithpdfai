// CHATWITHPDFAI.COM — Aurora Chat App · PDF viewer + Chat

const { useState: uW1, useEffect: uW2, useRef: uW3 } = React;

// ============================================================
// PDF VIEWER
// ============================================================
function PDFViewer({ doc, highlightId, onJump }) {
  const [page, setPage] = uW1(12);
  const [zoom, setZoom] = uW1(100);
  const containerRef = uW3(null);

  const current = doc.pagesContent.find(p => p.n === page) || doc.pagesContent[0];

  uW2(() => {
    if (highlightId && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-pid="${highlightId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);

  return (
    <section style={{
      flex: "1.2",
      borderRight: "1px solid var(--stroke-1)",
      background: "rgba(5,6,20,0.4)",
      display: "flex", flexDirection: "column", minWidth: 0,
    }}>
      {/* Toolbar */}
      <div style={{
        padding: "10px 18px",
        borderBottom: "1px solid var(--stroke-1)",
        background: "rgba(5,6,20,0.6)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
          {doc.title}
        </span>
        <span className="pill" style={{ fontSize: 10.5, padding: "3px 8px" }}>{doc.type}</span>
        <div style={{ flex: 1 }}></div>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="btn btn-glass btn-sm" style={{ padding: "5px 10px" }}>←</button>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.06em" }}>
          PG {page} / {doc.pages}
        </span>
        <button onClick={() => setPage(p => Math.min(doc.pages, p + 1))} className="btn btn-glass btn-sm" style={{ padding: "5px 10px" }}>→</button>
        <span style={{ width: 1, height: 16, background: "var(--stroke-2)" }}></span>
        <button onClick={() => setZoom(z => Math.max(75, z - 10))} className="btn btn-glass btn-sm" style={{ padding: "5px 10px" }}>−</button>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", minWidth: 36, textAlign: "center" }}>{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="btn btn-glass btn-sm" style={{ padding: "5px 10px" }}>+</button>
      </div>

      {/* Page area */}
      <div ref={containerRef} style={{ flex: 1, overflow: "auto", padding: "30px 20px" }}>
        <div className="glass" style={{
          maxWidth: 720, margin: "0 auto",
          padding: `${56 * zoom / 100}px ${64 * zoom / 100}px`,
          borderRadius: "var(--r-lg)",
          background: "rgba(255,255,255,0.96)",
          color: "#0a0a25",
          fontSize: `${13 * zoom / 100}px`,
          lineHeight: 1.7,
          minHeight: 800, position: "relative",
          boxShadow: "var(--shadow-card), 0 60px 120px -40px oklch(0.4 0.2 290 / 0.4)",
          border: "1px solid var(--stroke-2)",
        }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.14em",
            color: "rgba(10,10,37,0.5)",
            marginBottom: 22,
            display: "flex", justifyContent: "space-between",
            borderBottom: "1px solid rgba(10,10,37,0.15)", paddingBottom: 8,
            fontFamily: "var(--mono)",
            textTransform: "uppercase",
          }}>
            <span>KASS v. NORTH AMERICAN RESEARCH, INC.</span>
            <span>NO. 24-CV-7180</span>
          </div>

          <h2 style={{ fontSize: `${20 * zoom / 100}px`, fontWeight: 600, margin: "0 0 18px", letterSpacing: "-0.015em", color: "#0a0a25" }}>
            {current.head}
          </h2>

          {current.paras.map((p, i) => {
            const highlighted = highlightId === p.id;
            return (
              <p key={p.id} data-pid={p.id} style={{
                textAlign: "justify",
                background: highlighted ? "linear-gradient(120deg, rgba(183,106,255,0.2), rgba(78,163,255,0.2))" : "transparent",
                padding: highlighted ? "8px 12px" : "0",
                margin: highlighted ? "0 -12px 14px" : "0 0 14px",
                borderLeft: highlighted ? "3px solid #b76aff" : "3px solid transparent",
                transition: "all .35s",
                position: "relative",
                borderRadius: highlighted ? "4px" : "0",
              }}>
                <span style={{
                  fontSize: `${9 * zoom / 100}px`, color: "rgba(10,10,37,0.35)",
                  position: "absolute", left: -32, top: 4, letterSpacing: "0.06em",
                  fontFamily: "var(--mono)",
                }}>
                  ¶{i + 1}
                </span>
                {p.t}
                {highlighted && (
                  <span style={{
                    fontSize: 9, color: "#b76aff", marginLeft: 8, letterSpacing: "0.1em",
                    fontFamily: "var(--mono)", fontWeight: 600,
                  }}>
                    ◀ CITED
                  </span>
                )}
              </p>
            );
          })}

          <div style={{
            fontSize: 9, letterSpacing: "0.14em",
            color: "rgba(10,10,37,0.35)",
            marginTop: 32, paddingTop: 12,
            borderTop: "1px solid rgba(10,10,37,0.15)",
            textAlign: "center", fontFamily: "var(--mono)",
          }}>
            — {page} —
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CHAT PANE
// ============================================================
function ChatPane({ doc, onCite, credits, setCredits }) {
  const [messages, setMessages] = uW1([
    { role: "assistant", kind: "summary", text: doc.summary, when: "Just now" },
  ]);
  const [draft, setDraft] = uW1("");
  const [pending, setPending] = uW1(false);
  const listRef = uW3(null);

  uW2(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, pending]);

  const findAnswer = (q) => {
    const lower = q.toLowerCase();
    for (const k of Object.keys(doc.answers)) {
      if (lower.includes(k)) return doc.answers[k];
    }
    return {
      text: `Based on this document: the court rejected the safe harbor defense and held that scienter was sufficiently pled under the PSLRA's heightened standard. {{p2}} {{p3}}\n\nWant me to pull a verbatim quote, generate flashcards, or compare to a specific precedent?`,
      cites: ["p2", "p3"],
    };
  };

  const ask = (text) => {
    if (!text.trim() || pending) return;
    setMessages(m => [...m, { role: "user", text, when: "Just now" }]);
    setDraft("");
    setPending(true);
    setTimeout(() => {
      const ans = findAnswer(text);
      setMessages(m => [...m, { role: "assistant", text: ans.text, cites: ans.cites, when: "Just now" }]);
      setPending(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <section style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: "rgba(5,6,20,0.5)",
      minWidth: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 18px",
        borderBottom: "1px solid var(--stroke-1)",
        background: "rgba(5,6,20,0.6)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}></div>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--text-3)", textTransform: "uppercase" }}>Conversation</span>
        <div style={{ flex: 1 }}></div>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}>{messages.length} MSGS</span>
        <button className="btn btn-glass btn-sm">Export ↓</button>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "22px 22px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
        {messages.map((m, i) => m.role === "user" ?
          <UserMsg key={i} text={m.text} when={m.when} /> :
          <AssistantMsg key={i} m={m} onCite={onCite} />
        )}
        {pending && <PendingMsg />}

        {!pending && messages.length < 3 && (
          <div style={{ marginTop: 8, paddingTop: 18, borderTop: "1px dashed var(--stroke-1)" }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Suggested follow-ups</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {doc.suggested.map(s => (
                <button key={s} onClick={() => ask(s)} className="glass hover-glow" style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "var(--r)",
                  fontSize: 13.5,
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                  fontWeight: 400,
                }}>
                  → {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{
        padding: "14px 18px 18px",
        borderTop: "1px solid var(--stroke-1)",
        background: "rgba(5,6,20,0.6)",
        backdropFilter: "blur(10px)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") ask(draft); }}
            placeholder="Ask anything about the document…"
            className="input"
            style={{ flex: 1, padding: "12px 14px" }}
          />
          <button onClick={() => ask(draft)} className={draft.trim() ? "btn btn-iris" : "btn btn-glass"} disabled={!draft.trim() || pending}>
            Ask ↵
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-4)" }}>
          <span className="mono" style={{ letterSpacing: "0.08em" }}>1 DOC · 89 PAGES IN CONTEXT · 0 CREDITS FOR FOLLOW-UPS</span>
          <span className="mono" style={{ letterSpacing: "0.08em" }}>↵ TO SEND</span>
        </div>
      </div>
    </section>
  );
}

function UserMsg({ text, when }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
      <div style={{
        background: "var(--grad-iris-2)",
        color: "#fff",
        padding: "11px 16px",
        maxWidth: "80%",
        fontSize: 14.5,
        lineHeight: 1.5,
        fontWeight: 500,
        borderRadius: "18px 18px 4px 18px",
        boxShadow: "0 8px 24px -8px oklch(0.55 0.22 290 / 0.5)",
      }}>
        {text}
      </div>
      <span className="mono" style={{ fontSize: 9.5, color: "var(--text-4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>You · {when}</span>
    </div>
  );
}

function AssistantMsg({ m, onCite }) {
  const parts = m.text.split(/(\{\{p\d+\}\})/g);
  const cites = m.cites || [];
  const citeMap = {};
  cites.forEach((c, i) => { citeMap[c] = i + 1; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "92%" }}>
      <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: "var(--grad-iris-2)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: "#fff",
          boxShadow: "0 0 12px oklch(0.65 0.2 290 / 0.5)",
        }}>AI</span>
        {m.kind === "summary" ? "Auto-summary · grounded" : "Assistant · grounded"} · {m.when}
      </div>
      <div className="glass" style={{
        padding: "14px 16px",
        borderRadius: "18px 18px 18px 4px",
        borderLeft: "2px solid var(--violet)",
        fontSize: 14.5,
        lineHeight: 1.6,
        color: "var(--text)",
      }}>
        {parts.map((p, i) => {
          const match = p.match(/\{\{(p\d+)\}\}/);
          if (match) {
            const cid = match[1];
            const fn = citeMap[cid] || 1;
            return (
              <span key={i} className="fn" onClick={() => onCite(cid)} title={`p. 12, ¶${cid.slice(1)} — click to jump`}>
                {fn}
              </span>
            );
          }
          return <FormattedText key={i} text={p} />;
        })}
      </div>
      {cites.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {cites.map((c, i) => (
            <button key={c} onClick={() => onCite(c)} className="chip" style={{
              fontSize: 10.5, padding: "4px 9px",
              fontFamily: "var(--mono)", letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              [{i + 1}] P.12 · ¶{c.slice(1)} ↗
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormattedText({ text }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        const bits = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={li}>
            {bits.map((b, bi) => b.startsWith("**") && b.endsWith("**") ?
              <strong key={bi} style={{ fontWeight: 600, color: "var(--text)" }}>{b.slice(2, -2)}</strong> :
              <span key={bi}>{b}</span>
            )}
            {li < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}

function PendingMsg() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "70%" }}>
      <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--grad-iris-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>AI</span>
        Reading 89 pages…
      </div>
      <div className="glass" style={{
        padding: "14px 16px",
        borderRadius: "18px 18px 18px 4px",
        borderLeft: "2px solid var(--violet)",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--violet)",
            animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}></span>
        ))}
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", marginLeft: 8, letterSpacing: "0.1em" }}>
          SEARCHING ACROSS DOCUMENT…
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { PDFViewer, ChatPane });
