import SiteShell, { PageHeader } from '../_components/Chrome';
export const metadata = { title: 'Help center — CHATWITHPDFAI' };
const ARTICLES = [
  ['Getting started', 'Sign up, upload your first PDF, ask your first question.', '/help/getting-started'],
  ['Credits & billing', 'How credits work and where to buy more.', '/help/credits'],
  ['Citations', 'How answers cite the exact page, and how to jump to the source.', '/help/citations'],
  ['Multi-PDF chat', 'Ask one question across several documents at once.', '/help/multi-pdf-chat'],
];
export default function HelpIndex() {
  return (
    <SiteShell active="help">
      <PageHeader eyebrow="Help center" title="How can we help?" lede="Short guides to get the most out of CHATWITHPDFAI." />
      <section className="spread" style={{ padding: '0 0 90px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {ARTICLES.map(([t, d, h]) => (
            <a key={h} href={h} className="glass hover-glow" style={{ padding: 22, borderRadius: 'var(--r-lg)', display: 'block' }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{d}</div>
            </a>
          ))}
        </div>
        <p style={{ marginTop: 28, fontSize: 14, color: 'var(--text-3)' }}>Can't find it? <a href="/contact" style={{ color: 'var(--violet-2)' }}>Contact support →</a></p>
      </section>
    </SiteShell>
  );
}
