'use client';
import { useState, useEffect } from 'react';
export default function UseTool({ appHref, label = 'Use this tool', className = 'btn btn-iris btn-lg' }) {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetch('/api/auth/state').then((r) => (r.ok ? r.json() : null)).then((j) => setAuthed(!!(j && j.authed))).catch(() => {}); }, []);
  const href = authed ? appHref : '/signup?next=' + encodeURIComponent(appHref);
  return <a href={href} className={className} style={{ justifyContent: 'center' }}>{label} →</a>;
}
