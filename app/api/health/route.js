import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public health probe — checks DB connectivity. 200 when healthy, 503 when not.
export async function GET() {
  const t0 = Date.now();
  let db = false;
  try { await query('SELECT 1 AS ok'); db = true; } catch (e) {}
  return NextResponse.json(
    { ok: db, db, ms: Date.now() - t0, time: new Date().toISOString() },
    { status: db ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
