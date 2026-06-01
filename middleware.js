import { NextResponse } from 'next/server';

// Server-side auth gate for the app shell. Checks only for the presence of the
// session cookie (cheap, no DB) so logged-out visitors are redirected BEFORE any
// protected HTML is sent — no flash, no console 401s. The API routes still do the
// real session validation; an expired-but-present cookie falls through to the
// client gate (which redirects with ?next too).
const COOKIE = 'cwpai_session';

export function middleware(req) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    const next = req.nextUrl.pathname + (req.nextUrl.search || '');
    url.pathname = '/signin';
    url.search = '?next=' + encodeURIComponent(next);
    return NextResponse.redirect(url, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/home', '/papers', '/chat', '/library', '/account', '/buy'],
};
