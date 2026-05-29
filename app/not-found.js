import SiteShell from './_components/Chrome';
export const metadata = { title: 'Page not found — CHATWITHPDFAI' };
export default function NotFound() {
  return (
    <SiteShell active="">
      <section className="spread" style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>404</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(36px, 6vw, 72px)', margin: '14px 0' }}>Page not found.</h1>
        <p className="section-lede" style={{ margin: '0 auto 28px' }}>The page you're looking for moved or never existed.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-iris btn-lg">← Back home</a>
          <a href="/workspace" className="btn btn-glass btn-lg">Open workspace</a>
        </div>
      </section>
    </SiteShell>
  );
}
