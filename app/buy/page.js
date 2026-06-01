'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';
import AppFooter from '../_components/AppFooter';

export default function BuyPage() {
  const [packs, setPacks] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState({ kind: '', msg: '' });
  const [busy, setBusy] = useState('');
  useEffect(() => {
    const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.async = true; document.body.appendChild(s);
    fetch('/api/auth/me').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (!j) return; return fetch('/api/credits'); }).then((r) => (r ? r.json() : null)).then((j) => { if (j && j.ok) { setBalance(j.balance); setPacks(j.packs || []); } }).catch(() => {});
  }, []);
  function buy(code) {
    setBusy(code); setStatus({ kind: '', msg: 'Starting checkout…' });
    fetch('/api/payments/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packCode: code }) })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j }))).then(({ ok, j }) => {
        if (!ok) { setStatus({ kind: 'bad', msg: 'Error: ' + (j.error || 'could not start checkout') }); setBusy(''); return; }
        if (!window.Razorpay) { setStatus({ kind: 'bad', msg: 'Payment library still loading — try again in a moment.' }); setBusy(''); return; }
        const o = j;
        const rzp = new window.Razorpay({ key: o.keyId, order_id: o.orderId, amount: o.amount, currency: o.currency, name: 'CHATWITHPDFAI', description: o.pack.name + ' — ' + o.pack.credits + ' credits', theme: { color: '#7c5cff' },
          handler: function (resp) {
            setStatus({ kind: '', msg: 'Confirming payment…' });
            fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resp) }).then((r) => r.json()).then((v) => {
              if (v.ok) { setStatus({ kind: 'ok', msg: `Added ${v.creditsAdded} credits. New balance: ${v.balance}.` }); setBalance(v.balance); }
              else setStatus({ kind: 'bad', msg: 'Verification failed: ' + (v.error || '') });
              setBusy('');
            }).catch((e) => { setStatus({ kind: 'bad', msg: e.message }); setBusy(''); });
          },
          modal: { ondismiss: function () { setStatus({ kind: '', msg: 'Checkout cancelled.' }); setBusy(''); } } });
        rzp.open();
      }).catch((e) => { setStatus({ kind: 'bad', msg: e.message }); setBusy(''); });
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="buy" credits={balance} />
      <main id="main" style={{ maxWidth: 880, margin: '0 auto', width: '100%', padding: '28px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Buy credits</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '0 0 14px' }}>Pay-per-document. Credits never expire. No subscription.</p>
        <div className="pill" style={{ marginBottom: 24, padding: '6px 12px' }}>Current balance: <b style={{ margin: '0 4px' }} data-testid="balance">{balance == null ? '…' : balance.toLocaleString('en-IN')}</b> credits</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {packs === null && <div className="mono" style={{ color: 'var(--text-4)', fontSize: 12 }}>LOADING PACKS…</div>}
          {(packs || []).map((p, i) => (
            <div key={p.code} className="glass" style={{ padding: 22, borderRadius: 'var(--r-lg)', textAlign: 'center', border: i === 1 ? '1px solid var(--violet)' : '1px solid var(--stroke-2)' }}>
              {i === 1 && <div className="pill" style={{ fontSize: 10, padding: '3px 10px', marginBottom: 10, color: 'var(--violet-2)' }}>Most popular</div>}
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>{p.name}</h3>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>₹{p.price_inr}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 13.5, margin: '4px 0 16px' }}>{p.credits} credits</div>
              <button type="button" onClick={() => buy(p.code)} disabled={!!busy} data-testid={`buy-${p.code}`} className="btn btn-iris" style={{ width: '100%', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>{busy === p.code ? '…' : 'Buy'}</button>
            </div>
          ))}
        </div>
        {status.msg && <div data-testid="buy-status" style={{ marginTop: 20, fontSize: 14.5, color: status.kind === 'ok' ? 'var(--green)' : status.kind === 'bad' ? '#ffb4b4' : 'var(--text-2)' }}>{status.msg}</div>}
        <p className="mono" style={{ marginTop: 18, fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.08em' }}>SECURE CHECKOUT VIA RAZORPAY</p>
      </main>
      <AppFooter />
    </div>
  );
}
