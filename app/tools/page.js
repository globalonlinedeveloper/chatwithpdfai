import SiteShell, { PageHeader } from '../_components/Chrome';
import ToolCardClient from '../_components/ToolCardClient';
import { TOOLS, CATEGORIES } from '@/lib/tools';

export const metadata = {
  title: 'PDF tools — CHATWITHPDFAI',
  description: 'Every tool to read, understand and create from your PDFs — chat with cited answers and generate exam papers with answer keys. Pay per use, no subscription.',
};

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
                {list.map((t) => <ToolCardClient key={t.slug} tool={t} />)}
              </div>
            </div>
          );
        })}
      </section>
    </SiteShell>
  );
}
