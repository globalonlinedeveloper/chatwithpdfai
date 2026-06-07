import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getBalance, listPacks, creditsEnforced } from '@/lib/credits';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }
export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const u = await getCurrentUser(req);
    if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    const userId = u.id;
    const [balance, packs] = await Promise.all([getBalance(userId), listPacks()]);
    return NextResponse.json({ ok: true, authenticated: !!u, balance, enforced: creditsEnforced(), packs });
  } catch (e) { console.error('[credits] failed', e); return NextResponse.json({ error: 'Could not load credits' }, { status: 500 }); }
}
