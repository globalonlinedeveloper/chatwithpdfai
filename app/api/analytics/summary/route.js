// GET /api/analytics/summary — owner-only aggregates for the dashboard.
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(u.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const raw = parseInt(new URL(req.url).searchParams.get('days') || '30', 10) || 30;
  const days = Math.min(Math.max(raw, 1), 90);
  try {
    const totalsRows = await query(
      "SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS uniques FROM analytics_events WHERE kind='pageview' AND created_at > (NOW() - INTERVAL ? DAY)", [days]);
    const daily = await query(
      "SELECT DATE(created_at) AS d, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS uniques FROM analytics_events WHERE kind='pageview' AND created_at > (NOW() - INTERVAL ? DAY) GROUP BY DATE(created_at) ORDER BY d", [days]);
    const topPaths = await query(
      "SELECT path, COUNT(*) AS views FROM analytics_events WHERE kind='pageview' AND created_at > (NOW() - INTERVAL ? DAY) GROUP BY path ORDER BY views DESC LIMIT 15", [days]);
    const topRef = await query(
      "SELECT referrer_host AS host, COUNT(*) AS views FROM analytics_events WHERE kind='pageview' AND referrer_host IS NOT NULL AND created_at > (NOW() - INTERVAL ? DAY) GROUP BY referrer_host ORDER BY views DESC LIMIT 12", [days]);
    const funnelRows = await query(
      "SELECT kind, COUNT(*) AS n FROM analytics_events WHERE kind IN ('signup','upload','purchase') AND created_at > (NOW() - INTERVAL ? DAY) GROUP BY kind", [days]);
    const funnel = { signup: 0, upload: 0, purchase: 0 };
    funnelRows.forEach((r) => { funnel[r.kind] = Number(r.n); });
    const t = totalsRows[0] || {};
    return NextResponse.json({
      ok: true, days,
      totals: { views: Number(t.views || 0), uniques: Number(t.uniques || 0) },
      daily: daily.map((r) => ({ d: r.d, views: Number(r.views), uniques: Number(r.uniques) })),
      topPaths: topPaths.map((r) => ({ path: r.path, views: Number(r.views) })),
      topReferrers: topRef.map((r) => ({ host: r.host, views: Number(r.views) })),
      funnel,
    });
  } catch (e) {
    console.error('[analytics/summary] failed', e.message);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
