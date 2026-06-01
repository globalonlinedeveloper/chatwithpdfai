import SiteShell from '../_components/Chrome';
import { GUIDES } from '@/lib/guides';

export const metadata = {
  title: 'Guides — CHATWITHPDFAI',
  description: 'Practical guides for chatting with PDFs and generating question papers: summarize a PDF, ask questions, generate MCQs and build exam papers.',
  alternates: { canonical: '/guides' },
};

export default function GuidesHub() {
  return (
    <SiteShell active="">
      <section style={{ padding: '56px 0 18px' }}>
        <div className="spread">
          <div className="section-eyebrow">Guides</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(30px, 4vw, 48px)', margin: '10px 0 10px' }}>Guides</h1>
          <p className="section-lede" style={{ maxWidth: 600 }}>Short, practical walkthroughs for getting the most out of your PDFs and exams.</p>
        </div>
      </section>
      <section className="spread" style={{ padding: '10px 0 90px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {GUIDES.map((g) => (
            <a key={g.slug} href={'/guides/' + g.slug} className="glass hover-glow" style={{ padding: '20px 22px', borderRadius: 'var(--r-lg)', display: 'block', color: 'inherit' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{g.eyebrow}</div>
              <div style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{g.h1}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{g.lede.length > 116 ? g.lede.slice(0, 116) + '…' : g.lede}</div>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
