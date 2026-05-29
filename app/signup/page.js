'use client';
import { useState } from 'react';
import { AuthShell, StatusNote } from '../_components/AuthShell';

export default function SignUpPage() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  async function onSubmit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.get('name'), email: f.get('email'), password: f.get('password') }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setDone(f.get('email')); return; }
      setErr(j.error || 'Sign-up failed'); setBusy(false);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  if (done) {
    return (
      <AuthShell title="Check your inbox." lede={`We sent a verification link to ${done}.`}
        footer={<a href="/signin" style={{ color: 'var(--violet-2)' }}>← Back to sign in</a>}>
        <div className="glass" style={{ padding: '20px 22px', borderRadius: 'var(--r-lg)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--grad-iris-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>✉</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Verify your email to start</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '2px 0 0' }}>Click the link in that email, then buy credits and upload your first PDF.</p>
          </div>
        </div>
        <a href="/workspace" className="btn btn-glass" style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}>Go to your workspace →</a>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Create your account." lede="Pay per document. No subscription, no card to start."
      footer={<>Already have an account? <a href="/signin" style={{ color: 'var(--violet-2)' }}>Sign in →</a></>}>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={onSubmit}>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Full name</div>
          <input name="name" className="input" placeholder="Maya Khan" required />
        </label>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Work email</div>
          <input name="email" className="input" type="email" placeholder="you@firm.com" required />
        </label>
        <label>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Password</div>
          <input name="password" className="input" type="password" placeholder="At least 8 characters" minLength={8} required />
          <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.08em', marginTop: 4 }}>MIN 8 CHARACTERS</div>
        </label>
        <button type="submit" disabled={busy} className="btn btn-iris" style={{ marginTop: 6, padding: '12px 16px', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Creating…' : 'Create my workspace →'}
        </button>
        <StatusNote kind="bad">{err}</StatusNote>
        <p style={{ fontSize: 11.5, color: 'var(--text-4)', margin: '8px 0 0', lineHeight: 1.5 }}>
          By signing up you agree to our <a href="/legal/terms.html" style={{ color: 'var(--text-3)', textDecoration: 'underline' }}>Terms</a> and <a href="/legal/privacy.html" style={{ color: 'var(--text-3)', textDecoration: 'underline' }}>Privacy</a>. We never train on your files.
        </p>
      </form>
    </AuthShell>
  );
}
