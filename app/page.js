import SiteShell from './_components/Chrome';
import { Hero } from './_components/landing/hero';
import { HowItWorks, LivePreview, FeaturesGrid } from './_components/landing/method';
import { UseCases, CompareTable, Testimonials } from './_components/landing/audiences';
import { Pricing, Security, FAQ } from './_components/landing/closing';

export const metadata = {
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://chatwithpdfai.com/#org',
      name: 'CHATWITHPDFAI',
      url: 'https://chatwithpdfai.com',
      logo: 'https://chatwithpdfai.com/favicon.svg',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://chatwithpdfai.com/#website',
      name: 'CHATWITHPDFAI',
      url: 'https://chatwithpdfai.com',
      publisher: { '@id': 'https://chatwithpdfai.com/#org' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://chatwithpdfai.com/#app',
      name: 'CHATWITHPDFAI',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://chatwithpdfai.com',
      description: 'Chat with any PDF to get cited answers, and generate exam-ready question papers from a topic or an uploaded document. Pay per document, no subscription.',
      offers: {
        '@type': 'Offer',
        price: '399',
        priceCurrency: 'INR',
        description: 'Credit packs from \u20B9399 for 50 credits. Credits never expire.',
      },
      publisher: { '@id': 'https://chatwithpdfai.com/#org' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://chatwithpdfai.com/#faq',
      mainEntity: [
        { '@type': 'Question', name: 'Do credits expire?', acceptedAnswer: { '@type': 'Answer', text: 'No. Credits never expire and there is no subscription to cancel. If you walk away for two years and come back, your unused credits will still be there.' } },
        { '@type': 'Question', name: 'What counts as one credit?', acceptedAnswer: { '@type': 'Answer', text: 'One credit lets you upload and chat with one document, however many questions you ask. A 12-page contract and a 1,200-page filing both cost one credit.' } },
        { '@type': 'Question', name: 'How big a PDF can I upload?', acceptedAnswer: { '@type': 'Answer', text: 'Up to 500 pages or 50 MB per document on Reader and Practice, and up to 10,000 pages on Chamber.' } },
        { '@type': 'Question', name: 'What languages are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Over 70 input languages, including documents that mix scripts. You can read a filing in one language and ask questions in another; translations are footnoted to the source.' } },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteShell active="features">
        <Hero />
        <section style={{ padding: '0 0 26px', position: 'relative' }}>
          <div className="spread">
            <div className="glass" style={{ borderRadius: 'var(--r-lg)', padding: '18px 24px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {[['No subscription', 'Pay only for the documents you use'], ['Credits never expire', 'Top up once — come back anytime'], ['Cited to the page', 'Every answer footnoted to its source']].map(([t, d]) => (
                <div key={t} style={{ minWidth: 170, flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{d}</div>
                </div>
              ))}
              <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-4)' }}>POWERED BY OPENAI · ANTHROPIC · GOOGLE</span>
            </div>
          </div>
        </section>
        <HowItWorks />
        <LivePreview />
        <FeaturesGrid />
        <UseCases />
        <CompareTable />
        <Testimonials />
        <Pricing />
        <Security />
        <FAQ />
      </SiteShell>
    </>
  );
}
