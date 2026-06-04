'use client';
// OMRSheet lives in its own module so the generator page can lazy-load it
// (next/dynamic) — it's only needed when the user toggles the OMR answer sheet,
// so keeping it out of the initial bundle speeds first paint.
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];

export function OMRSheet({ paper }) {
  const qs = (paper.sections || []).flatMap((s) => s.questions);
  const circle = (lbl) => <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 17, height: 17, borderRadius: '50%', border: '1px solid #333', fontSize: 9, marginRight: 5 }}>{lbl}</span>;
  const cell = (label, opts, key) => (<div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 0', fontSize: 12, breakInside: 'avoid' }}><span style={{ minWidth: 30, fontWeight: 600 }}>{label}</span>{opts ? opts.map((o) => <span key={o}>{circle(o)}</span>) : <span style={{ borderBottom: '1px solid #999', flex: 1, minWidth: 90 }}>&nbsp;</span>}</div>);
  const rows = [];
  qs.forEach((q, i) => {
    const n = i + 1;
    if (q.type === 'case') { (Array.isArray(q.sub) ? q.sub : []).forEach((sq, si) => { const o = (sq.options || []).map((_, j) => String.fromCharCode(65 + j)); rows.push(cell(n + '(' + ROMAN[si] + ')', o.length ? o : ['A', 'B', 'C', 'D'], n + '-' + si)); }); return; }
    let opts = null;
    if (q.type === 'mcq' || q.type === 'code' || q.type === 'assertion' || q.type === 'multi') opts = q.options.map((_, j) => String.fromCharCode(65 + j));
    else if (q.type === 'tf') opts = ['T', 'F'];
    rows.push(cell(n + '.', opts, String(n)));
  });
  return (
    <div>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 10, marginBottom: 12 }}>
        {paper.logo ? <img src={paper.logo} alt="" style={{ maxHeight: 54, maxWidth: 200, margin: '0 auto 6px', display: 'block', objectFit: 'contain' }} /> : null}{paper.institution ? <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{paper.institution}</div> : null}
        <div style={{ fontSize: 18, fontWeight: 700 }}>{paper.title} &mdash; OMR answer sheet</div>
        {paper.examStyle ? <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>{paper.examStyle}</div> : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, fontSize: 12, flexWrap: 'wrap' }}>
        <span>Name: ____________________________</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Roll no.<span style={{ display: 'inline-flex', gap: 3 }}>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 16, height: 20, border: '1px solid #999', borderRadius: 2, display: 'inline-block' }} />)}</span></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>{rows}</div>
      <div style={{ fontSize: 10.5, color: '#888', marginTop: 14 }}>Fill one bubble completely per question with blue/black ballpoint. Write-in lines are for fill / numeric / short-answer items.</div>
    </div>
  );
}
