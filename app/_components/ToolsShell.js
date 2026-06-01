import { cookies } from 'next/headers';
import SiteShell from './Chrome';
import AppNav from './AppNav';

// Audience-aware chrome for the /tools pages: signed-in users get the app shell
// (AppNav, no marketing footer) so it matches the rest of the app; logged-out
// visitors get the marketing masthead + footer (and full SEO). Cookie-presence
// only (same signal the middleware gate uses) — server-rendered, no flicker.
export default function ToolsShell({ active, children }) {
  const authed = !!cookies().get('cwpai_session');
  if (authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppNav active="tools" />
        <main id="main" style={{ flex: 1 }}>{children}</main>
      </div>
    );
  }
  return <SiteShell active={active}>{children}</SiteShell>;
}
