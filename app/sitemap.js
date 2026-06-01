import { TOOLS } from '@/lib/tools';
import { GUIDES } from '@/lib/guides';
export default function sitemap() {
  const base = 'https://chatwithpdfai.com';
  const routes = ['', '/pricing', '/help', '/contact', '/tools', '/guides', '/help/getting-started', '/help/credits', '/help/citations', '/help/multi-pdf-chat', '/legal/terms', '/legal/privacy', '/legal/security', '/legal/dpa', '/legal/cookies', '/legal/sub-processors'];
  const tools = TOOLS.filter((t) => t.status === 'live').map((t) => '/tools/' + t.slug);
  const guides = GUIDES.map((g) => '/guides/' + g.slug);
  const now = new Date();
  return [...routes, ...tools, ...guides].map((p) => ({ url: base + p, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : (p.startsWith('/tools') ? 0.8 : (p.startsWith('/guides/') ? 0.7 : 0.6)) }));
}
