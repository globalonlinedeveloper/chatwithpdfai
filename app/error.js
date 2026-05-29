'use client';
import SiteShell from './_components/Chrome';
export default function Error({ error, reset }) {
  return (
    <SiteShell active="">
      <section className="spread" style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>500</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(34px, 6vw, 64px)', margin: '14px 0' }}>Something went wrong.</h1>
        <p className="section-lede" style={{ margin: '0 auto 28px' }}>An unexpected error occurred. Try again, or head back home.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => reset()} className="btn btn-iris btn-lg">Try again</button>
          <a href="/" className="btn btn-glass btn-lg">← Home</a>
        </div>
      </section>
    </SiteShell>
  );
}
