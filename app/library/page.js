'use client';
import { useState, useEffect } from 'react';
import SiteShell from '../_components/Chrome';

function fmtSize(b){ if(!b) return ''; const mb=b/1048576; return mb>=1?mb.toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'; }
function fmtDate(s){ try{ return new Date(s).toLocaleDateString(undefined,{month:'short',day:'numeric'});}catch{return '';} }

export default function LibraryPage(){
  const [docs,setDocs]=useState(null);
  const [q,setQ]=useState('');
  useEffect(()=>{ fetch('/api/documents').then(r=>{ if(r.status===401){window.location.href='/signin';return null;} return r.json(); }).then(j=>{ if(j) setDocs(j.documents||[]); }).catch(()=>setDocs([])); },[]);
  const list=(docs||[]).filter(d=>d.filename.toLowerCase().includes(q.toLowerCase()));
  return (
    <SiteShell active="">
      <section className="spread" style={{padding:'48px 0 90px'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:24}}>
          <div>
            <div className="section-eyebrow">Your library</div>
            <h1 className="section-title" style={{fontSize:'clamp(30px,4vw,46px)',margin:'10px 0 0'}}>Documents</h1>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <input className="input" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} style={{padding:'9px 12px',fontSize:13.5,minWidth:200}}/>
            <a href="/workspace" className="btn btn-iris">+ Upload PDF</a>
          </div>
        </div>
        {docs===null && <div className="mono" style={{color:'var(--text-4)',fontSize:12}}>LOADING…</div>}
        {docs && list.length===0 && (
          <div className="glass" style={{padding:'46px 24px',textAlign:'center',borderRadius:'var(--r-lg)'}}>
            <div style={{fontSize:30,marginBottom:10}}>📄</div>
            <h3 style={{fontSize:20,fontWeight:600,margin:'0 0 6px'}}>{q?'No matches.':'No documents yet.'}</h3>
            <p style={{color:'var(--text-3)',fontSize:14,margin:'0 0 18px'}}>{q?'Try a different search.':'Upload a PDF to start asking questions with cited answers.'}</p>
            {!q && <a href="/workspace" className="btn btn-iris btn-lg">+ Upload your first PDF</a>}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {list.map(d=>(
            <a key={d.id} href={`/workspace?doc=${d.id}`} className="glass hover-glow" data-testid="doc-row" style={{padding:18,borderRadius:'var(--r-lg)',display:'block',color:'inherit'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                <div style={{width:40,height:40,borderRadius:10,background:'var(--glass-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'var(--violet-2)',flexShrink:0}}>📄</div>
                <span className="pill" style={{fontSize:10,padding:'3px 8px',color:d.status==='ready'?'var(--green)':'var(--text-3)'}}>{d.status}</span>
              </div>
              <div style={{fontSize:14.5,fontWeight:600,margin:'12px 0 4px',lineHeight:1.35,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.filename}</div>
              <div className="mono" style={{fontSize:10.5,color:'var(--text-4)',letterSpacing:'0.06em',textTransform:'uppercase'}}>{d.pageCount?d.pageCount+' pp · ':''}{fmtSize(d.sizeBytes)}{d.createdAt?' · '+fmtDate(d.createdAt):''}</div>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
