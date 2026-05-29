'use client';
import { useState, useEffect } from 'react';
import SiteShell from '../_components/Chrome';

export default function AccountPage(){
  const [user,setUser]=useState(null);
  const [credits,setCredits]=useState(null);
  const [tab,setTab]=useState('profile');
  useEffect(()=>{
    fetch('/api/auth/me').then(r=>{ if(r.status===401){window.location.href='/signin';return null;} return r.json(); }).then(j=>{ if(j&&j.user) setUser(j.user); }).catch(()=>{});
    fetch('/api/credits').then(r=>r.json()).then(j=>{ if(j&&j.ok){ setCredits(j.balance); } }).catch(()=>{});
  },[]);
  async function signout(){ try{ await fetch('/api/auth/signout',{method:'POST'}); }catch{} window.location.href='/signin'; }
  const TABS=[['profile','Profile'],['billing','Billing & credits'],['security','Security']];
  return (
    <SiteShell active="">
      <section className="spread" style={{padding:'48px 0 90px'}}>
        <div className="section-eyebrow">Account</div>
        <h1 className="section-title" style={{fontSize:'clamp(30px,4vw,46px)',margin:'10px 0 24px'}}>Account &amp; billing</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
          {TABS.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} className={tab===k?'btn btn-iris btn-sm':'btn btn-glass btn-sm'}>{l}</button>
          ))}
        </div>

        {tab==='profile' && (
          <div className="glass" style={{padding:26,borderRadius:'var(--r-lg)',maxWidth:560}}>
            <div className="eyebrow" style={{marginBottom:14}}>Profile</div>
            <Row label="Name" value={user?(user.name||'—'):'…'}/>
            <Row label="Email" value={user?user.email:'…'} extra={user && (user.emailVerified ? <span className="pill" style={{fontSize:10,color:'var(--green)',padding:'2px 8px'}}>verified</span> : <span className="pill" style={{fontSize:10,color:'#ffbd2e',padding:'2px 8px'}}>unverified</span>)}/>
            {user && !user.emailVerified && <p style={{fontSize:12.5,color:'#ffbd2e',margin:'10px 0 0'}}>Check your inbox for the verification link — you'll need it before uploading or chatting.</p>}
          </div>
        )}

        {tab==='billing' && (
          <div className="glass" style={{padding:26,borderRadius:'var(--r-lg)',maxWidth:560}}>
            <div className="eyebrow" style={{marginBottom:14}}>Credits</div>
            <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:6}}>
              <span style={{fontSize:40,fontWeight:700,letterSpacing:'-0.02em'}} data-testid="balance">{credits==null?'…':credits}</span>
              <span style={{color:'var(--text-3)',fontSize:15}}>credits</span>
            </div>
            <p style={{fontSize:13.5,color:'var(--text-3)',margin:'0 0 18px'}}>Pay-per-document. Credits never expire. No subscription.</p>
            <a href="/buy" className="btn btn-iris btn-lg" style={{justifyContent:'center'}}>+ Buy credits</a>
          </div>
        )}

        {tab==='security' && (
          <div className="glass" style={{padding:26,borderRadius:'var(--r-lg)',maxWidth:560}}>
            <div className="eyebrow" style={{marginBottom:14}}>Security</div>
            <p style={{fontSize:13.5,color:'var(--text-2)',margin:'0 0 16px'}}>Change your password via the reset flow, or sign out of this session.</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <a href="/forgot" className="btn btn-glass">Reset password</a>
              <button onClick={signout} className="btn btn-glass">Sign out</button>
            </div>
          </div>
        )}

        <div style={{marginTop:26}}><a href="/workspace" className="mono" style={{fontSize:11,color:'var(--violet-2)',letterSpacing:'0.08em',textTransform:'uppercase'}}>← Back to workspace</a></div>
      </section>
    </SiteShell>
  );
}
function Row({label,value,extra}){
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid var(--stroke-1)'}}>
      <span className="eyebrow">{label}</span>
      <span style={{display:'flex',alignItems:'center',gap:8,fontSize:14,color:'var(--text)'}}>{value}{extra}</span>
    </div>
  );
}
