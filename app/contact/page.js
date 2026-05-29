'use client';
import { useState } from 'react';
import SiteShell, { PageHeader } from '../_components/Chrome';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function onSubmit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), topic: f.get('topic'), message: f.get('message'), website: f.get('website') || '' }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setSent(true); } else { setErr(j.error || 'Could not send your message'); setBusy(false); }
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  return (
    <SiteShell active="">
      <PageHeader eyebrow="Contact" title="Get in touch" lede="Questions, bugs, or anything else — we read every message." />
      <section className="spread" style={{ padding: '0 0 90px', maxWidth: 640 }}>
        {sent ? (
          <div className="glass" style={{ padding: 26, borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Message sent ✓</div>
            <p style={{ color: 'var(--text-3)', fontSize: 14, margin: 0 }}>Thanks — we'll reply to your email soon. You can also reach us at <a href="mailto:support@chatwithpdfai.com" style={{ color: 'var(--violet-2)' }}>support@chatwithpdfai.com</a>.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="glass" style={{ padding: 26, borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
            <label><div className="eyebrow" style={{ marginBottom: 6 }}>Your email</div><input name="email" type="email" required className="input" placeholder="you@firm.com" /></label>
            <label><div className="eyebrow" style={{ marginBottom: 6 }}>Topic</div>
              <select name="topic" required className="input" defaultValue="Support">
                {['Support', 'Sales', 'Privacy', 'Security', 'Press', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select></label>
            <label><div className="eyebrow" style={{ marginBottom: 6 }}>Message</div><textarea name="message" required minLength={5} rows={6} className="input" placeholder="How can we help?" style={{ resize: 'vertical' }} /></label>
            <button type="submit" disabled={busy} className="btn btn-iris" style={{ justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>{busy ? 'Sending…' : 'Send message →'}</button>
            {err && <div style={{ fontSize: 13, color: '#ffb4b4' }}>{err}</div>}
            <p style={{ fontSize: 12.5, color: 'var(--text-4)', margin: 0 }}>Or email <a href="mailto:support@chatwithpdfai.com" style={{ color: 'var(--text-3)' }}>support@chatwithpdfai.com</a> directly.</p>
          </form>
        )}
      </section>
    </SiteShell>
  );
}
