export default function AppFooter() {
  const year = new Date().getFullYear();
  const a = { color: 'var(--text-3)', textDecoration: 'none' };
  return (
    <footer className="no-print" style={{ borderTop: '1px solid var(--stroke-1)', padding: '16px 20px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 11.5, color: 'var(--text-4)' }}>
      <span className="mono" style={{ letterSpacing: '0.08em' }}>© {year} CHATWITHPDFAI</span>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <a href="/legal/privacy" style={a}>Privacy</a>
        <a href="/legal/terms" style={a}>Terms</a>
        <a href="/help" style={a}>Help</a>
        <a href="mailto:support@chatwithpdfai.com" style={a}>Support</a>
      </div>
    </footer>
  );
}
