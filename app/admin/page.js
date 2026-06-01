'use client';
import { useEffect, useState } from 'react';
import AppNav from '../_components/AppNav';
import AppFooter from '../_components/AppFooter';

function Stat({ label, value }) {
  return (
    <div className="glass" style={{ padding: '16px 18px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-2)' }}>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, marginTop: 6 }}>{value}</div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [days, setDays] = useState(30);
  useEffect(() => {
    setData(null); setErr('');
    fetch('/api/analytics/summary?days=' + days).then((r) => {
      if (r.status === 401) { window.location.href = '/signin?next=/admin'; return null; }
      if (r.status === 403) { setErr('forbidden'); return null; }
      return r.json();
    }).then((j) => { if (j && j.ok) setData(j); }).catch(() => setErr('error'));
  }, [days]);
  const maxV = data && data.daily.length ? Math.max(1, ...data.daily.map((x) => x.views)) : 1;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="" />
      <main id="main" style={{ flex: 1 }}>
        <section className="spread" style={{ padding: '40px 0 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
            <div>
              <div className="section-eyebrow">Private &middot; owner only</div>
              <h1 className="section-title" style={{ fontSize: 'clamp(26px,3.4vw,40px)', margin: '8px 0 0' }}>Site analytics</h1>
            </div>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input" style={{ padding: '8px 10px', fontSize: 13 }}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          {err === 'forbidden' && <div className="glass" style={{ padding: 28, borderRadius: 'var(--r-lg)' }}>This page is restricted to the site owner.</div>}
          {err === 'error' && <div className="glass" style={{ padding: 28, borderRadius: 'var(--r-lg)' }}>Couldn&rsquo;t load analytics right now.</div>}
          {!data && !err && <div className="mono" style={{ color: 'var(--text-4)', fontSize: 12 }}>LOADING&hellip;</div>}
          {data && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 26 }}>
                <Stat label="Page views" value={data.totals.views.toLocaleString('en-IN')} />
                <Stat label="Unique visitors" value={data.totals.uniques.toLocaleString('en-IN')} />
                <Stat label="Signups" value={data.funnel.signup} />
                <Stat label="PDF uploads" value={data.funnel.upload} />
                <Stat label="Purchases" value={data.funnel.purchase} />
              </div>
              <div className="glass" style={{ padding: '20px 22px', borderRadius: 'var(--r-lg)', marginBottom: 24 }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Page views per day</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140 }}>
                  {data.daily.map((x) => (<div key={x.d} title={x.d + ': ' + x.views + ' views, ' + x.uniques + ' visitors'} style={{ flex: 1, minWidth: 2, background: 'var(--grad-iris-2)', height: Math.max(2, Math.round((x.views / maxV) * 100)) + '%', borderRadius: '3px 3px 0 0', opacity: 0.9 }} />))}
                  {data.daily.length === 0 && <div className="mono" style={{ fontSize: 12, color: 'var(--text-4)' }}>No views yet &mdash; data appears as people visit.</div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
                <div className="glass" style={{ padding: '18px 20px', borderRadius: 'var(--r-lg)' }}>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Top pages</div>
                  {data.topPaths.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-4)' }}>&mdash;</div>}
                  {data.topPaths.map((p) => (<div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--stroke-1)' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-2)' }}>{p.path}</span><span className="mono" style={{ color: 'var(--text-3)' }}>{p.views}</span></div>))}
                </div>
                <div className="glass" style={{ padding: '18px 20px', borderRadius: 'var(--r-lg)' }}>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Top referrers</div>
                  {data.topReferrers.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-4)' }}>Direct / none yet</div>}
                  {data.topReferrers.map((r) => (<div key={r.host} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--stroke-1)' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-2)' }}>{r.host}</span><span className="mono" style={{ color: 'var(--text-3)' }}>{r.views}</span></div>))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
