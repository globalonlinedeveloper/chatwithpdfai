'use client';
import { useState } from 'react';
import { AuthShell } from '../_components/AuthShell';

export default function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e) {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget);
    try { await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email') }) }); } catch {}
    setSent(true);
  }
  if (sent) {
    return (
      <AuthShell title="Check your inbox." lede="If an account exists for that email, we sent a reset link."
        footer={<a href="/signin" style={{ color: 'var(--violet-2)' }}>← Back to sign in</a>}>
        <div className="glass" style={{ padding: '20px 22px', borderRadius: 'var(--r-lg)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>✉</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Email sent</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '2px 0 0' }}>Link expires in 1 hour. Check spam if needed.</p>
          </div>
        </div>
        <button onClick={() => setSent(false)} className="btn btn-glass" style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}>Try another email</button>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Forgot password?" lede="No problem. We'll email you a reset link."
      footer={<a href="/signin" style={{ color: 'var(--violet-2)' }}>← Back to sign in</a>}>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={onSubmit}>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Email associated with your account</div>
          <input name="email" className="input" type="email" placeholder="you@firm.com" required />
        </label>
        <button type="submit" disabled={busy} className="btn btn-iris" style={{ marginTop: 6, padding: '12px 16px', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Sending…' : 'Send reset link →'}
        </button>
      </form>
    </AuthShell>
  );
}
