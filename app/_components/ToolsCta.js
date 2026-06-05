'use client';
import { useState, useEffect } from 'react';
export default function ToolsCta() {
  const [authed, setAuthed] = useState(null);
  useEffect(() => { fetch('/api/auth/state').then((r) => (r.ok ? r.json() : null)).then((j) => setAuthed(!!(j && j.authed))).catch(() => setAuthed(false)); }, []);
  const c = authed
    ? { href: '/dashboard', label: 'Go to your dashboard →', title: 'Welcome back', sub: 'Pick a tool above, or jump back into your workspace.' }
    : { href: '/signup', label: 'Start free →', title: 'New here?', sub: 'Sign up and get 15 free credits — no card required.' };
  return (
    <div className="glass" data-testid="tools-cta" style={{ marginTop: 34, padding: '22px 26px', borderRadius: 'var(--r-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
      <div><div style={{ fontSize: 16, fontWeight: 600 }}>{c.title}</div><div style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 3 }}>{c.sub}</div></div>
      <a href={c.href} className="btn btn-iris btn-lg" style={{ justifyContent: 'center' }}>{c.label}</a>
    </div>
  );
}
