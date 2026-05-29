'use client';
import { useState } from 'react';
import { AuthShell, StatusNote } from '../_components/AuthShell';

export default function SignInPage() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function onSubmit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), password: f.get('password') }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { window.location.href = '/workspace'; return; }
      setErr(j.error || 'Sign-in failed'); setBusy(false);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  return (
    <AuthShell title="Welcome back." lede="Sign in to your CHATWITHPDFAI workspace."
      footer={<>New here? <a href="/signup" style={{ color: 'var(--violet-2)' }}>Create an account →</a></>}>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={onSubmit}>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Work email</div>
          <input name="email" className="input" type="email" placeholder="you@firm.com" required />
        </label>
        <label>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow">Password</span>
            <a href="/forgot" className="mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet-2)' }}>Forgot?</a>
          </div>
          <input name="password" className="input" type="password" placeholder="••••••••••" required />
        </label>
        <button type="submit" disabled={busy} className="btn btn-iris" style={{ marginTop: 6, padding: '12px 16px', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Signing in…' : 'Sign in →'}
        </button>
        <StatusNote kind="bad">{err}</StatusNote>
      </form>
    </AuthShell>
  );
}
