'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';

function Row({ label, value, extra }) {
  return (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--stroke-1)' }}><span className="eyebrow">{label}</span><span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text)' }}>{value}{extra}</span></div>);
}
const REASON = { studio_paper: 'Question paper', chat: 'Chat', purchase: 'Purchase', grant: 'Bonus', refund: 'Refund', adjust: 'Adjustment' };
function fmt(s) { try { return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [tab, setTab] = useState('profile');
  const [resendMsg, setResendMsg] = useState('');
  const [name, setName] = useState(''); const [nameMsg, setNameMsg] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' }); const [pwMsg, setPwMsg] = useState('');
  const [history, setHistory] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [delConfirm, setDelConfirm] = useState(''); const [delMsg, setDelMsg] = useState('');
  useEffect(() => {
    fetch('/api/auth/me').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && j.user) { setUser(j.user); setName(j.user.name || ''); } }).catch(() => {});
    fetch('/api/credits').then((r) => r.json()).then((j) => { if (j && j.ok) setCredits(j.balance); }).catch(() => {});
    fetch('/api/credits/history').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) setHistory(j.items || []); }).catch(() => setHistory([]));
    fetch('/api/payments/history').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) setPurchases(j.items || []); }).catch(() => setPurchases([]));
  }, []);
  async function resend() { setResendMsg('Sending…'); try { const r = await fetch('/api/auth/resend', { method: 'POST' }); const j = await r.json().catch(() => ({})); setResendMsg(r.ok ? (j.already ? 'Already verified.' : 'Sent — check your inbox.') : (j.error || 'Could not send.')); } catch (e) { setResendMsg(e.message); } }
  async function saveName() { setNameMsg('Saving…'); try { const r = await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setNameMsg('Saved.'); setUser((u) => ({ ...u, name: j.user.name })); setTimeout(() => setNameMsg(''), 1800); } else setNameMsg(j.error || 'Failed.'); } catch (e) { setNameMsg(e.message); } }
  async function changePw(e) {
    e.preventDefault(); setPwMsg('');
    if (pw.next.length < 8) { setPwMsg('New password must be at least 8 characters.'); return; }
    if (pw.next !== pw.confirm) { setPwMsg('New passwords do not match.'); return; }
    try { const r = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: pw.current, next: pw.next }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setPwMsg('Password changed.'); setPw({ current: '', next: '', confirm: '' }); } else setPwMsg(j.error || 'Could not change password.'); } catch (e) { setPwMsg(e.message); }
  }
  async function signout() { try { await fetch('/api/auth/signout', { method: 'POST' }); } catch (e) {} window.location.href = '/'; }
  async function signoutAll() { try { await fetch('/api/auth/signout-all', { method: 'POST' }); } catch (e) {} window.location.href = '/'; }
  async function deleteAccount() {
    setDelMsg('Deleting…');
    try { const r = await fetch('/api/auth/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: delConfirm }) }); const j = await r.json().catch(() => ({})); if (r.ok) { window.location.href = '/'; } else setDelMsg(j.error || 'Could not delete.'); } catch (e) { setDelMsg(e.message); }
  }
  function downloadReceipt(pp) {
    const lines = ['CHATWITHPDFAI — Receipt', '', 'Date: ' + new Date(pp.at).toLocaleString('en-IN'), 'Credits: ' + pp.credits, 'Amount: INR ' + pp.amount, 'Payment ID: ' + (pp.paymentId || '—'), '', 'Credits never expire. Thank you.'];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'receipt-' + pp.id + '.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const TABS = [['profile', 'Profile'], ['billing', 'Billing'], ['security', 'Security']];
  const card = { background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-lg)', padding: 24, maxWidth: 620, marginBottom: 16 };
  const inp = { width: '100%', marginBottom: 10, fontSize: 13.5, padding: '9px 12px' };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="account" credits={credits} />
      <main id="main" style={{ maxWidth: 760, margin: '0 auto', width: '100%', padding: '28px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 16px' }}>Account</h1>
        {user && !user.emailVerified && (
          <div style={{ background: 'rgba(255,189,46,0.12)', border: '1px solid rgba(255,189,46,0.4)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 20, fontSize: 13.5, color: '#ffd27a', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ flex: 1, minWidth: 200 }}>Your email isn&rsquo;t verified yet — you&rsquo;ll need it before generating or chatting.</span>
            <button onClick={resend} className="btn btn-glass btn-sm" data-testid="resend-verify">Resend verification</button>
            {resendMsg && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{resendMsg}</span>}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={tab === k ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'}>{l}</button>)}</div>

        {tab === 'profile' && (<div style={card}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Profile</div>
          <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Display name</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Display name" placeholder="Your name" style={{ flex: 1, fontSize: 13.5, padding: '9px 12px' }} data-testid="name-input" />
            <button onClick={saveName} className="btn btn-glass" data-testid="save-name">Save</button>
            {nameMsg && <span style={{ fontSize: 12, color: nameMsg === 'Saved.' ? 'var(--green)' : 'var(--text-2)' }}>{nameMsg}</span>}
          </div>
          <Row label="Email" value={user ? user.email : '…'} extra={user && (user.emailVerified ? <span className="pill" style={{ fontSize: 10, color: 'var(--green)', padding: '2px 8px' }}>verified</span> : <span className="pill" style={{ fontSize: 10, color: '#ffbd2e', padding: '2px 8px' }}>unverified</span>)} />
        </div>)}

        {tab === 'billing' && (<>
          <div style={card}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Credits</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}><span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }} data-testid="balance">{credits == null ? '…' : credits.toLocaleString('en-IN')}</span><span style={{ color: 'var(--text-3)', fontSize: 15 }}>credits</span></div>
            <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '0 0 18px' }}>Pay-per-document. Credits never expire. No subscription.</p>
            <a href="/buy" className="btn btn-iris" style={{ justifyContent: 'center' }}>+ Buy credits</a>
          </div>
          <div style={card}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Purchases</div>
            {purchases === null ? (<>{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 30, marginBottom: 6 }} />)}</>) : purchases.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No purchases yet.</div> : purchases.map((pp) => (
              <div key={pp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--stroke-1)', fontSize: 13 }}>
                <span style={{ flex: 1 }}>{fmt(pp.at)} · {pp.credits} credits</span>
                <span className="mono" style={{ color: 'var(--text-2)' }}>₹{pp.amount}</span>
                <button onClick={() => downloadReceipt(pp)} className="btn btn-glass btn-sm" style={{ fontSize: 11, padding: '3px 9px' }}>Receipt</button>
              </div>
            ))}
          </div>
          <div style={card}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Usage history</div>
            {history === null ? (<>{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 30, marginBottom: 6 }} />)}</>) : history.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No activity yet.</div> : history.slice(0, 40).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--stroke-1)', fontSize: 12.5 }}>
                <span style={{ flex: 1, color: 'var(--text-2)' }}>{REASON[h.reason] || h.reason}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-4)' }}>{fmt(h.at)}</span>
                <span className="mono" style={{ minWidth: 44, textAlign: 'right', color: h.delta >= 0 ? 'var(--green)' : '#ffb4b4' }}>{h.delta >= 0 ? '+' : ''}{h.delta}</span>
              </div>
            ))}
          </div>
        </>)}

        {tab === 'security' && (<>
          <div style={card}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Change password</div>
            <form onSubmit={changePw}>
              <input type="password" autoComplete="current-password" aria-label="Current password" placeholder="Current password" className="input" style={inp} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              <input type="password" autoComplete="new-password" aria-label="New password" placeholder="New password (min 8 characters)" className="input" style={inp} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <input type="password" autoComplete="new-password" aria-label="Confirm new password" placeholder="Confirm new password" className="input" style={inp} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}><button type="submit" className="btn btn-iris" data-testid="change-pw">Change password</button>{pwMsg && <span style={{ fontSize: 12.5, color: pwMsg === 'Password changed.' ? 'var(--green)' : '#ffb4b4' }}>{pwMsg}</span>}</div>
            </form>
            <div style={{ borderTop: '1px solid var(--stroke-1)', margin: '18px 0 0', paddingTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={signout} className="btn btn-glass" data-testid="signout-account">Sign out</button>
              <button onClick={signoutAll} className="btn btn-glass" data-testid="signout-all">Sign out of all devices</button>
            </div>
          </div>
          <div style={{ ...card, border: '1px solid rgba(226,75,74,0.4)' }}>
            <div className="eyebrow" style={{ marginBottom: 8, color: '#ffb4b4' }}>Danger zone</div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 12px' }}>Delete your account and all data (documents, papers, tests, credits) permanently. This cannot be undone. Type your email to confirm.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="input" value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} aria-label="Type your email to confirm deletion" placeholder={user ? user.email : 'your email'} style={{ flex: 1, minWidth: 200, fontSize: 13, padding: '8px 12px' }} data-testid="del-confirm" />
              <button onClick={deleteAccount} disabled={!user || delConfirm.trim().toLowerCase() !== String(user.email).toLowerCase()} className="btn btn-glass" data-testid="delete-account" style={{ color: '#ffb4b4', borderColor: 'rgba(226,75,74,0.5)', opacity: (user && delConfirm.trim().toLowerCase() === String(user.email).toLowerCase()) ? 1 : 0.5 }}>Delete account</button>
              {delMsg && <span style={{ fontSize: 12, color: '#ffb4b4' }}>{delMsg}</span>}
            </div>
          </div>
        </>)}
      </main>
    </div>
  );
}
