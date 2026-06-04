import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { grade, isAuto, flatQs } from '@/app/question-paper-generator/grade';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function flagOn() { return process.env.PRODUCT_MVP_ENABLED === '1' || process.env.TEST_MODE === '1'; }

export async function GET(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (id) {
    const own = await query('SELECT id, title, payload FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
    if (!own[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const attemptId = Number(new URL(req.url).searchParams.get('attemptId')) || 0;
    if (attemptId) {
      const at = await query('SELECT id, student_name, score, total, answers, created_at FROM paper_attempts WHERE id = ? AND assignment_id = ?', [attemptId, id]);
      if (!at[0]) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
      let paper = null; try { paper = JSON.parse(own[0].payload); } catch {}
      let answers = {}; try { answers = JSON.parse(at[0].answers || '{}') || {}; } catch {}
      return NextResponse.json({ ok: true, attempt: { id: at[0].id, name: at[0].student_name, score: Number(at[0].score), total: Number(at[0].total), createdAt: at[0].created_at }, paper, answers });
    }
    if (new URL(req.url).searchParams.get('stats')) {
      const atts = await query('SELECT answers, score, total FROM paper_attempts WHERE assignment_id = ? LIMIT 2000', [id]);
      let paper = null; try { paper = JSON.parse(own[0].payload); } catch {}
      const flat = paper ? flatQs(paper) : [];
      const meta = []; (paper && paper.sections ? paper.sections : []).forEach((sec, si) => (sec.questions || []).forEach((q) => meta.push({ bloom: q.bloom || null, section: sec.name || sec.title || ('Section ' + (si + 1)) })));
      const agg = flat.map((q, gi) => ({ n: gi + 1, type: q.type, stem: String(q.q || q.assertion || (q.type === 'match' ? 'Match the following' : '')).slice(0, 90), auto: isAuto(q), correct: 0, graded: 0 }));
      let sumPct = 0, scored = 0;
      for (const at2 of atts) {
        let ans = {}; try { ans = JSON.parse(at2.answers || '{}') || {}; } catch {}
        flat.forEach((q, gi) => { if (isAuto(q)) { agg[gi].graded += 1; if (grade(q, ans[gi]) === true) agg[gi].correct += 1; } });
        if (Number(at2.total) > 0) { sumPct += 100 * Number(at2.score) / Number(at2.total); scored += 1; }
      }
      const perQuestion = agg.map((p) => ({ n: p.n, type: p.type, stem: p.stem, auto: p.auto, attempts: p.graded, correctRate: p.graded ? Math.round(100 * p.correct / p.graded) : null }));
      const groupBy = (keyFn) => { const m = new Map(); agg.forEach((p, gi) => { if (!p.auto) return; const k = keyFn(gi); if (k == null) return; const e = m.get(k) || { correct: 0, graded: 0 }; e.correct += p.correct; e.graded += p.graded; m.set(k, e); }); return [...m.entries()].map(([k, e]) => ({ key: String(k), attempts: e.graded, correctRate: e.graded ? Math.round(100 * e.correct / e.graded) : null })); };
      const byBloom = groupBy((gi) => meta[gi] && meta[gi].bloom);
      const bySection = groupBy((gi) => meta[gi] && meta[gi].section);
      const hardest = perQuestion.filter((p) => p.correctRate != null).sort((x, y) => x.correctRate - y.correctRate).slice(0, 3).map((p) => ({ n: p.n, stem: p.stem, correctRate: p.correctRate }));
      return NextResponse.json({ ok: true, stats: { count: atts.length, avgPct: scored ? Math.round(sumPct / scored) : 0, perQuestion, byBloom, bySection, hardest } });
    }
    const att = await query('SELECT id, student_name, score, total, away_count, created_at FROM paper_attempts WHERE assignment_id = ? ORDER BY created_at DESC LIMIT 500', [id]);
    return NextResponse.json({ ok: true, assignment: { id: own[0].id, title: own[0].title }, attempts: att.map((a) => ({ id: a.id, name: a.student_name, score: Number(a.score), total: Number(a.total), awayCount: a.away_count, createdAt: a.created_at })) });
  }
  const rows = await query('SELECT a.id, a.token, a.title, a.num_questions, a.active, a.created_at, COUNT(t.id) AS attempts, COALESCE(ROUND(AVG(CASE WHEN t.total > 0 THEN 100 * t.score / t.total END)), 0) AS avg_pct FROM paper_assignments a LEFT JOIN paper_attempts t ON t.assignment_id = a.id WHERE a.user_id = ? GROUP BY a.id ORDER BY a.created_at DESC LIMIT 100', [u.id]);
  return NextResponse.json({ ok: true, assignments: rows.map((r) => ({ id: r.id, token: r.token, title: r.title, numQuestions: r.num_questions, active: r.active, attempts: Number(r.attempts), avgPct: Number(r.avg_pct), createdAt: r.created_at })) });
}

export async function POST(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const paper = body.paper;
  if (!paper || !Array.isArray(paper.sections)) return NextResponse.json({ error: 'No paper to share' }, { status: 400 });
  const title = String(paper.title || 'Test').slice(0, 160);
  const nQ = paper.sections.reduce((n, s) => n + (Array.isArray(s.questions) ? s.questions.length : 0), 0);
  const payload = JSON.stringify(paper);
  if (payload.length > 2000000) return NextResponse.json({ error: 'Paper too large' }, { status: 413 });
  const cnt = await query('SELECT COUNT(*) AS c FROM paper_assignments WHERE user_id = ?', [u.id]);
  if (cnt[0] && Number(cnt[0].c) >= 200) return NextResponse.json({ error: 'Too many shared tests — delete some first.' }, { status: 409 });
  const token = crypto.randomBytes(8).toString('hex');
  await query('INSERT INTO paper_assignments (user_id, token, title, num_questions, payload) VALUES (?,?,?,?,?)', [u.id, token, title, nQ, payload]);
  return NextResponse.json({ ok: true, token });
}

export async function DELETE(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id')) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const r = await query('DELETE FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!r || !r.affectedRows) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Pause/resume a shared test without deleting it (and its attempts). The /t/[token]
// take route already returns "not available" when active=0, so this instantly
// enables/disables the public link.
export async function PATCH(req) {
  if (!flagOn()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const u = await getCurrentUser(req);
  if (!u) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const id = Number(body.id) || 0;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const active = body.active ? 1 : 0;
  const own = await query('SELECT id FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!own[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (typeof body.title === 'string') {
    const title = body.title.trim().slice(0, 160);
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const rr = await query('SELECT payload FROM paper_assignments WHERE id = ? AND user_id = ?', [id, u.id]);
    let payload = rr[0] ? rr[0].payload : null;
    try { const p = JSON.parse(payload); p.title = title; payload = JSON.stringify(p); } catch {}
    await query('UPDATE paper_assignments SET title = ?, payload = ? WHERE id = ? AND user_id = ?', [title, payload, id, u.id]);
    return NextResponse.json({ ok: true, title });
  }
  const attemptId = Number(body.attemptId) || 0;
  if (attemptId) {
    const at = await query('SELECT id, total FROM paper_attempts WHERE id = ? AND assignment_id = ?', [attemptId, id]);
    if (!at[0]) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    const total = Number(at[0].total) || 0;
    let score = Math.round(Number(body.score)); if (!Number.isFinite(score)) score = 0; score = Math.max(0, Math.min(total, score));
    await query('UPDATE paper_attempts SET score = ? WHERE id = ? AND assignment_id = ?', [score, attemptId, id]);
    return NextResponse.json({ ok: true, attemptId, score });
  }
  await query('UPDATE paper_assignments SET active = ? WHERE id = ? AND user_id = ?', [active, id, u.id]);
  return NextResponse.json({ ok: true, active });
}
