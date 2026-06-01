import ToolsShell from '../../_components/ToolsShell';
import ToolIcon from '../../_components/ToolIcon';
import UseTool from '../../_components/UseTool';
import { toolBySlug } from '@/lib/tools';
import { notFound } from 'next/navigation';

export function generateMetadata({ params }) {
  const t = toolBySlug(params.slug);
  if (!t) return { title: 'Tool — CHATWITHPDFAI' };
  return { title: t.seoTitle + ' | CHATWITHPDFAI', description: t.seoDesc, alternates: { canonical: '/tools/' + t.slug } };
}

export default function ToolPage({ params }) {
  const t = toolBySlug(params.slug);
  if (!t || t.status !== 'live') notFound();
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  return (
    <ToolsShell active="tools">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden' }}>
        <div className="section-blob" style={{ background: 'radial-gradient(circle, var(--violet), transparent 60%)', top: -100, right: -100, opacity: 0.3 }} />
        <div className="spread">
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><ToolIcon name={t.icon} size={28} stroke="#fff" /></div>
          <div className="section-eyebrow">{t.category}</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(32px, 5vw, 56px)', margin: '12px 0 14px', maxWidth: 760 }}>{t.name}</h1>
          <p className="section-lede" style={{ maxWidth: 620 }}>{t.tagline}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}><UseTool appHref={t.appHref} label="Use this tool" /><a href="/tools" className="btn btn-glass btn-lg" style={{ justifyContent: 'center' }}>All tools</a></div>
        </div>
      </section>
      <section className="spread" style={{ padding: '20px 0 30px' }}>
        <div className="section-eyebrow">How it works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
          {t.how.map((s, i) => (
            <div key={i} className="glass" style={{ padding: '20px 22px', borderRadius: 'var(--r-lg)' }}>
              <div className="mono" style={{ fontSize: 12, color: 'var(--violet-2)' }}>{'0' + (i + 1)}</div>
              <div style={{ fontSize: 15.5, fontWeight: 600, margin: '8px 0 5px' }}>{s.h}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{s.p}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="spread" style={{ padding: '20px 0 40px' }}>
        <div className="section-eyebrow">FAQ</div>
        <div style={{ marginTop: 14, maxWidth: 760 }}>
          {t.faqs.map((f, i) => (
            <div key={i} style={{ padding: '16px 0', borderTop: '1px solid var(--stroke-1)' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="spread" style={{ padding: '10px 0 80px' }}>
        <div className="glass" style={{ padding: '28px 26px', borderRadius: 'var(--r-xl)', textAlign: 'center', border: '1px solid var(--stroke-2)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>Ready to try {t.name}?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 18px' }}>Pay per use with credits — no subscription.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}><UseTool appHref={t.appHref} label={'Use ' + t.name} /></div>
        </div>
      </section>
    </ToolsShell>
  );
}
