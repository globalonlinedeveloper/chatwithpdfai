'use client';
import { useState, useEffect } from 'react';
import SiteShell from '../_components/Chrome';

export default function BuyPage(){
  const [packs,setPacks]=useState(null);
  const [balance,setBalance]=useState(null);
  const [status,setStatus]=useState({kind:'',msg:''});
  const [busy,setBusy]=useState('');
  useEffect(()=>{
    const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.async=true; document.body.appendChild(s);
    fetch('/api/auth/me').then(r=>{ if(r.status===401){window.location.href='/signin';return null;} return r.json(); }).then(j=>{ if(!j) return; return fetch('/api/credits'); }).then(r=>r?r.json():null).then(j=>{ if(j&&j.ok){ setBalance(j.balance); setPacks(j.packs||[]); } }).catch(()=>{});
  },[]);
  function buy(code){
    setBusy(code); setStatus({kind:'',msg:'Starting checkout…'});
    fetch('/api/payments/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packCode:code})})
      .then(r=>r.json().then(j=>({ok:r.ok,j}))).then(({ok,j})=>{
        if(!ok){ setStatus({kind:'bad',msg:'Error: '+(j.error||'could not start checkout')}); setBusy(''); return; }
        if(!window.Razorpay){ setStatus({kind:'bad',msg:'Payment library still loading — try again in a moment.'}); setBusy(''); return; }
        const o=j;
        const rzp=new window.Razorpay({ key:o.keyId, order_id:o.orderId, amount:o.amount, currency:o.currency, name:'CHATWITHPDFAI', description:o.pack.name+' — '+o.pack.credits+' credits', theme:{color:'#7c5cff'},
          handler:function(resp){
            setStatus({kind:'',msg:'Confirming payment…'});
            fetch('/api/payments/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(resp)}).then(r=>r.json()).then(v=>{
              if(v.ok){ setStatus({kind:'ok',msg:`Added ${v.creditsAdded} credits. New balance: ${v.balance}.`}); setBalance(v.balance); }
              else setStatus({kind:'bad',msg:'Verification failed: '+(v.error||'')});
              setBusy('');
            }).catch(e=>{ setStatus({kind:'bad',msg:e.message}); setBusy(''); });
          },
          modal:{ondismiss:function(){ setStatus({kind:'',msg:'Checkout cancelled.'}); setBusy(''); }} });
        rzp.open();
      }).catch(e=>{ setStatus({kind:'bad',msg:e.message}); setBusy(''); });
  }
  return (
    <SiteShell active="pricing">
      <section className="spread" style={{padding:'48px 0 90px',position:'relative'}}>
        <div className="section-blob" style={{background:'radial-gradient(circle, var(--violet), transparent 60%)',top:-80,right:-80,opacity:0.3}}></div>
        <div className="section-eyebrow">Buy credits</div>
        <h1 className="section-title" style={{fontSize:'clamp(30px,4vw,48px)',margin:'10px 0 8px'}}>Top up your account</h1>
        <p className="section-lede" style={{margin:'0 0 8px'}}>Pay-per-document. Credits never expire. No subscription.</p>
        <div className="pill" style={{marginBottom:24,padding:'6px 12px'}}>Current balance: <b style={{margin:'0 4px'}} data-testid="balance">{balance==null?'…':balance}</b> credits</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,maxWidth:860}}>
          {packs===null && <div className="mono" style={{color:'var(--text-4)',fontSize:12}}>LOADING PACKS…</div>}
          {(packs||[]).map((p,i)=>(
            <div key={p.code} className="glass" style={{padding:24,borderRadius:'var(--r-lg)',textAlign:'center',border:i===1?'1px solid var(--violet)':undefined}}>
              {i===1 && <div className="pill" style={{fontSize:10,padding:'3px 10px',marginBottom:10,color:'var(--violet-2)'}}>Most popular</div>}
              <h3 style={{fontSize:18,fontWeight:600,margin:'0 0 6px'}}>{p.name}</h3>
              <div style={{fontSize:30,fontWeight:700,letterSpacing:'-0.02em'}}>₹{p.price_inr}</div>
              <div style={{color:'var(--text-3)',fontSize:14,margin:'4px 0 16px'}}>{p.credits} credits</div>
              <button type="button" onClick={()=>buy(p.code)} disabled={!!busy} data-testid={`buy-${p.code}`} className="btn btn-iris" style={{width:'100%',justifyContent:'center',opacity:busy?0.6:1}}>{busy===p.code?'…':'Buy'}</button>
            </div>
          ))}
        </div>
        {status.msg && <div data-testid="buy-status" style={{marginTop:20,fontSize:14.5,color:status.kind==='ok'?'var(--green)':status.kind==='bad'?'#ffb4b4':'var(--text-2)'}}>{status.msg}</div>}
        <p className="mono" style={{marginTop:18,fontSize:10.5,color:'var(--text-4)',letterSpacing:'0.08em'}}>SECURE CHECKOUT VIA RAZORPAY · TEST MODE</p>
      </section>
    </SiteShell>
  );
}
