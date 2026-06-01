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
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteShell active="features">
        <Hero />
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
