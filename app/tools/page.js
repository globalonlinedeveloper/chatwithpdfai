import SiteShell, { PageHeader } from '../_components/Chrome';
import ToolIcon from '../_components/ToolIcon';
import { TOOLS, CATEGORIES } from '@/lib/tools';

export const metadata = {
  title: 'PDF tools — CHATWITHPDFAI',
  description: 'Every tool to read, understand and create from your PDFs — chat with cited answers and generate exam papers with answer keys. Pay per use, no subscription.',
};

function ToolCard({ t }) {
  const live = t.status === 'live';
  const inner = (
    <>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ToolIcon name={t.icon} size={22} stroke="#fff" /></div>
      <div style={{ fontSize: 16, fontWeight: 600, margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>{t.name}{!live && <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>Coming soon</span>}</div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', margin: '6px 0 0', lineHeight: 1.5 }}>{t.tagline}</div>
      {live && <div style={{ fontSize: 12.5, color: 'var(--violet-2)', marginTop: 14 }}>Learn more →</div>}
    </>
  );
  const style = { display: 'block', padding: 20, borderRadius: 'var(--r-xl)', color: 'inherit', textDecoration: 'none', border: '1px solid var(--stroke-2)', opacity: live ? 1 : 0.65 };
  return live ? <a href={'/tools/' + t.slug} className="glass hover-glow" style={style}>{inner}</a> : <div className="glass" style={style}>{inner}</div>;
}

export default function ToolsPage() {
  return (
    <SiteShell active="tools">
      <PageHeader eyebrow="Tools" title="Every PDF tool in one place" lede="Read, understand and create from your documents. Pay per use — no subscription." />
      <section className="spread" style={{ paddingBottom: 80 }}>
        {CATEGORIES.map((cat) => {
          const list = TOOLS.filter((t) => t.category === cat);
          if (!list.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 40 }}>
              <div className="section-eyebrow">{cat}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 14 }}>
                {list.map((t) => <ToolCard key={t.slug} t={t} />)}
              </div>
            </div>
          );
        })}
      </section>
    </SiteShell>
  );
}
