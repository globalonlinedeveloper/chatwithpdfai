'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Anonymous pageview beacon. Respects Do Not Track. No cookies, no storage.
export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
      const body = JSON.stringify({
        path: pathname || location.pathname,
        ref: document.referrer || '',
        utm: new URLSearchParams(location.search).get('utm_source') || '',
      });
      const url = '/api/analytics/collect';
      if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      else fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    } catch (e) { /* ignore */ }
  }, [pathname]);
  return null;
}
