'use client';
import { useState, useEffect } from 'react';
import AppNav from '../_components/AppNav';

function Row({ label, value, extra }) {
  return (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--stroke-1)' }}><span className="eyebrow">{label}</span><span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text)' }}>{value}{extra}</span></div>);
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [tab, setTab] = useState('profile');
  const [resendMsg, setResendMsg] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  useEffect(() => {
    fetch('/api/auth/me').then((r) => { if (r.status === 401) { window.location.href = '/signin'; return null; } return r.json(); }).then((j) => { if (j && j.user) setUser(j.user); }).catch(() => {});
    fetch('/api/credits').then((r) => r.json()).then((j) => { if (j && j.ok) setCredits(j.balance); }).catch(() => {});
  }, []);
  async function resend() { setResendMsg('Sending…'); try { const r = await fetch('/api/auth/resend', { method: 'POST' }); const j = await r.json().catch(() => ({})); setResendMsg(r.ok ? (j.already ? 'Your email is already verified.' : 'Verification email sent — check your inbox.') : (j.error || 'Could not send.')); } catch (e) { setResendMsg(e.message); } }
  async function changePw(e) {
    e.preventDefault(); setPwMsg('');
    if (pw.next.length < 8) { setPwMsg('New password must be at least 8 characters.'); return; }
    if (pw.next !== pw.confirm) { setPwMsg('New passwords do not match.'); return; }
    try { const r = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: pw.current, next: pw.next }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setPwMsg('Password changed.'); setPw({ current: '', next: '', confirm: '' }); } else setPwMsg(j.error || 'Could not change password.'); } catch (e) { setPwMsg(e.message); }
  }
  async function signout() { try { await fetch('/api/auth/signout', { method: 'POST' }); } catch (e) {} window.location.href = '/'; }
  const TABS = [['profile', 'Profile'], ['billing', 'Billing'], ['security', 'Security']];
  const card = { background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-lg)', padding: 24, maxWidth: 560 };
  const inp = { width: '100%', marginBottom: 10, fontSize: 13.5, padding: '9px 12px' };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav active="account" credits={credits} />
      <main style={{ maxWidth: 760, margin: '0 auto', width: '100%', padding: '28px 20px 60px' }}>
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
          <Row label="Name" value={user ? (user.name || '—') : '…'} />
          <Row label="Email" value={user ? user.email : '…'} extra={user && (user.emailVerified ? <span className="pill" style={{ fontSize: 10, color: 'var(--green)', padding: '2px 8px' }}>verified</span> : <span className="pill" style={{ fontSize: 10, color: '#ffbd2e', padding: '2px 8px' }}>unverified</span>)} />
        </div>)}
        {tab === 'billing' && (<div style={card}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Credits</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}><span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }} data-testid="balance">{credits == null ? '…' : credits.toLocaleString('en-IN')}</span><span style={{ color: 'var(--text-3)', fontSize: 15 }}>credits</span></div>
          <p style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '0 0 18px' }}>Pay-per-document. Credits never expire. No subscription.</p>
          <a href="/buy" className="btn btn-iris" style={{ justifyContent: 'center' }}>+ Buy credits</a>
        </div>)}
        {tab === 'security' && (<div style={card}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Change password</div>
          <form onSubmit={changePw}>
            <input type="password" autoComplete="current-password" placeholder="Current password" className="input" style={inp} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            <input type="password" autoComplete="new-password" placeholder="New password (min 8 characters)" className="input" style={inp} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            <input type="password" autoComplete="new-password" placeholder="Confirm new password" className="input" style={inp} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}><button type="submit" className="btn btn-iris" data-testid="change-pw">Change password</button>{pwMsg && <span style={{ fontSize: 12.5, color: pwMsg === 'Password changed.' ? 'var(--green)' : '#ffb4b4' }}>{pwMsg}</span>}</div>
          </form>
          <div style={{ borderTop: '1px solid var(--stroke-1)', margin: '20px 0 0', paddingTop: 16 }}><button onClick={signout} className="btn btn-glass" data-testid="signout-account">Sign out</button></div>
        </div>)}
      </main>
    </div>
  );
}
