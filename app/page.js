import SiteShell from './_components/Chrome';
import { Hero } from './_components/landing/hero';
import { HowItWorks, LivePreview, FeaturesGrid } from './_components/landing/method';
import { UseCases, CompareTable, Testimonials } from './_components/landing/audiences';
import { Pricing, Security, FAQ } from './_components/landing/closing';

export default function Home() {
  return (
    <SiteShell active="home">
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
  );
}
