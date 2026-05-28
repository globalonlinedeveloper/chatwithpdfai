// App modals — Upload + Share + Settings + Empty state

const { useState: uM1, useEffect: uM2, useRef: uM3 } = React;

// Base modal scaffolding
function Modal({ open, onClose, children, maxWidth = 520 }) {
  uM2(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(5,6,20,0.65)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeUp .2s ease both",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="glass glass-iris-border" style={{
        width: "100%", maxWidth, borderRadius: "var(--r-xl)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        boxShadow: "var(--shadow-card), 0 30px 70px -30px oklch(0.4 0.2 290 / 0.5)",
        animation: "fadeUp .25s ease both",
        maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
      }}>{children}</div>
    </div>
  );
}

// ============================================================
// UPLOAD MODAL — drag-drop, OCR progress, success
// ============================================================
function UploadModal({ open, onClose, onSuccess }) {
  const [stage, setStage] = uM1("drop"); // drop | uploading | ocr | done
  const [progress, setProgress] = uM1(0);
  const [drag, setDrag] = uM1(false);
  const [filename, setFilename] = uM1("");
  const fileRef = uM3(null);

  uM2(() => {
    if (open) { setStage("drop"); setProgress(0); setFilename(""); }
  }, [open]);

  const start = (f) => {
    setFilename(f || "contract_v4.pdf");
    setStage("uploading");
    setProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += 7 + Math.random() * 8;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setProgress(p);
        setStage("ocr");
        setTimeout(() => setStage("done"), 1300);
      } else {
        setProgress(p);
      }
    }, 90);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    start(e.dataTransfer.files?.[0]?.name);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={520}>
      <ModalHeader title="Upload a PDF" sub="Drop a file. We'll OCR, index, and summarize." onClose={onClose} />

      <div style={{ padding: 28, flex: 1, overflowY: "auto" }}>
        {stage === "drop" && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className="glass hover-glow"
              style={{
                padding: "40px 24px", textAlign: "center", cursor: "pointer",
                borderRadius: "var(--r-lg)",
                borderColor: drag ? "var(--violet)" : "var(--stroke-2)",
                border: `1.5px dashed ${drag ? "var(--violet)" : "var(--stroke-3)"}`,
                background: drag ? "rgba(183,106,255,0.06)" : "var(--glass-1)",
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => start(e.target.files?.[0]?.name)} />
              <div style={{
                width: 56, height: 56, margin: "0 auto 16px",
                borderRadius: 14, background: "var(--grad-iris-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, color: "#fff",
                boxShadow: "0 10px 28px -8px oklch(0.55 0.22 290 / 0.6)",
              }}>↑</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Drop a PDF here</div>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>or click to choose a file</div>
              <div className="mono" style={{ marginTop: 18, fontSize: 10, color: "var(--text-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Up to 2,000 pages · 250 MB · OCR included · 1 credit
              </div>
            </div>
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                ["☁", "Google Drive"],
                ["□", "Dropbox"],
                ["⬢", "URL"],
              ].map(([g, l]) => (
                <button key={l} className="btn btn-glass btn-sm" style={{ justifyContent: "center" }}>
                  <span style={{ fontSize: 14 }}>{g}</span> {l}
                </button>
              ))}
            </div>
          </>
        )}
        {stage === "uploading" && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Uploading · {filename}</div>
            <div style={{ height: 8, background: "var(--glass-2)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "var(--grad-iris-2)", transition: "width .15s", borderRadius: 999 }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-3)" }}>
              <span className="mono">{Math.floor(progress)}%</span>
              <span className="mono">🔒 TLS 1.3 · ENCRYPTING AT REST</span>
            </div>
          </div>
        )}
        {stage === "ocr" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ display: "inline-flex", gap: 8, marginBottom: 18 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--violet)", animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite` }}></span>)}
            </div>
            <div className="eyebrow" style={{ color: "var(--violet-2)", marginBottom: 10 }}>● Running OCR & extracting structure…</div>
            <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 4px" }}>Reading <strong style={{ color: "var(--text)" }}>47 pages</strong></p>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Recognizing 3 tables · indexing 12 sections</p>
          </div>
        )}
        {stage === "done" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 18px", borderRadius: 14, background: "var(--grad-iris-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff" }}>✓</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--green)", letterSpacing: "0.16em", marginBottom: 6 }}>● FILED · 1 CREDIT USED</div>
            <h3 style={{ fontSize: 22, fontWeight: 600, margin: "4px 0 6px", letterSpacing: "-0.02em" }}>{filename} is ready.</h3>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 22px" }}>47 pages indexed · auto-summary generated · filed in <em>Active Cases</em></p>
            <button onClick={() => { onSuccess && onSuccess(); onClose(); }} className="btn btn-iris btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Open & start chatting →
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// SHARE MODAL
// ============================================================
function ShareModal({ open, onClose, doc }) {
  const [copied, setCopied] = uM1(false);
  const [pwd, setPwd] = uM1(false);
  const url = `chatwithpdfai.com/s/${(doc?.short || "doc").toLowerCase().replace(/\W+/g, "-")}-x9k2`;

  return (
    <Modal open={open} onClose={onClose} maxWidth={520}>
      <ModalHeader title="Share this chat" sub="Anyone with the link sees the document and the answers — read-only." onClose={onClose} />
      <div style={{ padding: 28 }}>
        <div className="glass" style={{ padding: "14px 16px", borderRadius: "var(--r)", display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14 }}>🔗</span>
          <input className="mono" readOnly value={url} style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-2)", fontSize: 12, outline: "none" }} />
          <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={copied ? "btn btn-glass btn-sm" : "btn btn-iris btn-sm"}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {[
            { l: "Read-only access", s: "Recipient can read the chat and the document — not ask new questions.", on: true, locked: true },
            { l: "Password protect", s: "Require a 6-digit code to open the link", on: pwd, onChange: setPwd },
            { l: "Expire after 30 days", s: "Auto-expires; you can revoke any time", on: false },
            { l: "Hide your name", s: "Show 'Shared by anonymous' instead of 'Maya K.'", on: false },
          ].map((o, i) => (
            <label key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "12px 14px", border: "1px solid var(--stroke-1)", borderRadius: "var(--r)" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{o.l}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>{o.s}</div>
              </div>
              <input type="checkbox" checked={o.on} disabled={o.locked} onChange={e => o.onChange?.(e.target.checked)} />
            </label>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
          <button className="btn btn-glass" style={{ flex: 1, justifyContent: "center" }}>↓ Export chat</button>
          <button className="btn btn-glass" style={{ flex: 1, justifyContent: "center" }}>↗ Open share view</button>
        </div>
      </div>
    </Modal>
  );
}

function ModalHeader({ title, sub, onClose }) {
  return (
    <div style={{ padding: "20px 26px 16px", borderBottom: "1px solid var(--stroke-1)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px", letterSpacing: "-0.015em" }}>{title}</h3>
        {sub && <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: 0 }}>{sub}</p>}
      </div>
      <button onClick={onClose} className="btn btn-glass btn-sm" style={{ padding: "5px 10px", fontSize: 12 }}>✕</button>
    </div>
  );
}

// ============================================================
// EMPTY STATE — for fresh workspace
// ============================================================
function EmptyWorkspace({ onUpload }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{
          width: 72, height: 72, margin: "0 auto 22px",
          borderRadius: 18, background: "var(--glass-2)",
          border: "1px solid var(--stroke-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: "var(--violet-2)",
          boxShadow: "0 0 50px -12px oklch(0.5 0.2 290 / 0.5)",
        }}>↑</div>
        <h2 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Your workspace is <span className="iris">empty.</span></h2>
        <p style={{ fontSize: 15, color: "var(--text-3)", margin: "0 0 26px", lineHeight: 1.55 }}>
          Drop a PDF to get started. We'll OCR, index, and generate a summary in under 30 seconds.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <button onClick={onUpload} className="btn btn-iris btn-lg">+ Upload a PDF</button>
          <button className="btn btn-glass btn-lg">Use a sample</button>
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--text-4)", letterSpacing: "0.1em" }}>
          ● 3 DOCUMENTS FREE · NO CARD REQUIRED
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Modal, UploadModal, ShareModal, EmptyWorkspace });
