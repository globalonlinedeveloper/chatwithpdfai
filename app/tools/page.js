import ToolsShell from '../_components/ToolsShell';
import { PageHeader } from '../_components/Chrome';
import ToolCardClient from '../_components/ToolCardClient';
import ToolsCta from '../_components/ToolsCta';
import { TOOLS } from '@/lib/tools';

export const metadata = {
  alternates: { canonical: '/tools' },
  title: 'PDF tools — CHATWITHPDFAI',
  description: 'Every tool to read, understand and create from your PDFs — chat with cited answers and generate exam papers with answer keys. Pay per use, no subscription.',
};

export default function ToolsPage() {
  return (
    <ToolsShell active="tools">
      <PageHeader eyebrow="Tools" title="Every PDF tool in one place" lede="Read, understand and create from your documents. Pay per use — no subscription." />
      <section className="spread" style={{ paddingBottom: 80 }}>
        <div className="tools-grid" style={{ display: 'grid', gap: 18 }}>
          {TOOLS.map((t) => <ToolCardClient key={t.slug} tool={t} />)}
        </div>
        <ToolsCta />
        <style dangerouslySetInnerHTML={{ __html: '.tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))} @media (max-width:760px){.tools-grid{grid-template-columns:1fr}}' }} />
      </section>
    </ToolsShell>
  );
}
