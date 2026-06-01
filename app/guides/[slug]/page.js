import SiteShell from '../../_components/Chrome';
import UseTool from '../../_components/UseTool';
import { guideBySlug, GUIDES } from '@/lib/guides';
import { toolBySlug } from '@/lib/tools';
import { notFound } from 'next/navigation';

export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }

export function generateMetadata({ params }) {
  const g = guideBySlug(params.slug);
  if (!g) return { title: 'Guide — CHATWITHPDFAI' };
  return { title: g.seoTitle + ' | CHATWITHPDFAI', description: g.seoDesc, alternates: { canonical: '/guides/' + g.slug } };
}

export default function GuidePage({ params }) {
  const g = guideBySlug(params.slug);
  if (!g) notFound();
  const tool = toolBySlug(g.tool);
  const base = 'https://chatwithpdfai.com';
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: g.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: base + '/guides' },
      { '@type': 'ListItem', position: 3, name: g.h1, item: base + '/guides/' + g.slug },
    ] },
  ] };
  const related = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  return (
    <SiteShell active="">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section style={{ padding: '60px 0 26px', position: 'relative', overflow: 'hidden' }}>
        <div className="section-blob" style={{ background: 'radial-gradient(circle, var(--violet), transparent 60%)', top: -100, right: -100, opacity: 0.3 }} />
        <div className="spread">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, fontSize: 12 }}>
            <a href="/guides" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Guides</a><span style={{ color: 'var(--text-4)' }}>/</span><span className="pill" style={{ padding: '3px 10px', fontSize: 10.5 }}>{g.eyebrow}</span>
          </div>
          <h1 className="section-title" style={{ fontSize: 'clamp(32px, 5vw, 56px)', margin: '4px 0 14px', maxWidth: 780 }}>{g.h1}</h1>
          <p className="section-lede" style={{ maxWidth: 640 }}>{g.lede}</p>
          {tool && <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}><UseTool appHref={tool.appHref} label={'Try ' + tool.name} /><a href={'/tools/' + tool.slug} className="btn btn-glass btn-lg" style={{ justifyContent: 'center' }}>How it works</a></div>}
        </div>
      </section>
      <section className="spread" style={{ padding: '20px 0 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {g.sections.map((s, i) => (
            <div key={i} className="glass" style={{ padding: '20px 22px', borderRadius: 'var(--r-lg)' }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, margin: '0 0 6px' }}>{s.h}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{s.p}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="spread" style={{ padding: '14px 0 30px' }}>
        <div className="section-eyebrow">FAQ</div>
        <div style={{ marginTop: 14, maxWidth: 760 }}>
          {g.faqs.map((f, i) => (
            <div key={i} style={{ padding: '16px 0', borderTop: '1px solid var(--stroke-1)' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="spread" style={{ padding: '10px 0 30px' }}>
        <div className="glass" style={{ padding: '28px 26px', borderRadius: 'var(--r-xl)', textAlign: 'center', border: '1px solid var(--stroke-2)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>{tool ? 'Try ' + tool.name : 'Get started'}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 18px' }}>Pay per use with credits — no subscription.</p>
          {tool && <div style={{ display: 'flex', justifyContent: 'center' }}><UseTool appHref={tool.appHref} label={'Try ' + tool.name} /></div>}
        </div>
      </section>
      <section className="spread" style={{ padding: '0 0 80px' }}>
        <div className="section-eyebrow">More guides</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 14 }}>
          {related.map((r) => (
            <a key={r.slug} href={'/guides/' + r.slug} className="glass hover-glow" style={{ padding: '16px 18px', borderRadius: 'var(--r-lg)', display: 'block', color: 'inherit' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{r.eyebrow}</div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{r.h1}</div>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
