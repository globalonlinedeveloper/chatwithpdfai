'use client';
import { useState, useEffect } from 'react';
import { AuthShell, StatusNote } from '../_components/AuthShell';

export default function ResetPage() {
  const [token, setToken] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => { try { setToken(new URLSearchParams(window.location.search).get('token') || ''); } catch {} }, []);
  async function onSubmit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: f.get('password') }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setOk(true); setTimeout(() => { window.location.href = '/signin'; }, 1400); return; }
      setErr(j.error || 'Reset failed'); setBusy(false);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  return (
    <AuthShell title="Set a new password." lede="Choose a strong password for your account."
      footer={<a href="/signin" style={{ color: 'var(--violet-2)' }}>← Back to sign in</a>}>
      {ok ? (
        <StatusNote>Password updated. Redirecting to sign in…</StatusNote>
      ) : (
        <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={onSubmit}>
          <label>
            <div className="eyebrow" style={{ marginBottom: 6 }}>New password</div>
            <input name="password" className="input" type="password" placeholder="At least 8 characters" minLength={8} required />
          </label>
          <button type="submit" disabled={busy || !token} className="btn btn-iris" style={{ marginTop: 6, padding: '12px 16px', justifyContent: 'center', opacity: (busy || !token) ? 0.6 : 1 }}>
            {busy ? 'Updating…' : 'Update password →'}
          </button>
          {!token && <StatusNote kind="bad">Missing or invalid reset link. Request a new one from “Forgot password”.</StatusNote>}
          <StatusNote kind="bad">{err}</StatusNote>
        </form>
      )}
    </AuthShell>
  );
}
