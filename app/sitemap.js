import { TOOLS } from '@/lib/tools';
export default function sitemap() {
  const base = 'https://chatwithpdfai.com';
  const routes = ['', '/pricing', '/help', '/contact', '/tools', '/help/getting-started', '/help/credits', '/help/citations', '/help/multi-pdf-chat', '/legal/terms', '/legal/privacy', '/legal/security', '/legal/dpa', '/legal/cookies', '/legal/sub-processors'];
  const tools = TOOLS.filter((t) => t.status === 'live').map((t) => '/tools/' + t.slug);
  const now = new Date();
  return [...routes, ...tools].map((p) => ({ url: base + p, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : (p.startsWith('/tools') ? 0.8 : 0.6) }));
}
