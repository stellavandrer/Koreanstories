(function(){
  function isPremium(){ try{ return localStorage.getItem('ks_premium')==='1'; }catch(e){ return false; } }
  if (isPremium()) return;

  function build(){
    if (document.getElementById('ks-pdf-gate')) return;

    var ps=document.createElement('style');
    ps.textContent='@media print{body>*:not(#ks-pdf-gate){display:none!important}#ks-pdf-gate{display:flex!important}}';
    document.head.appendChild(ps);

    var ov=document.createElement('div');
    ov.id='ks-pdf-gate';
    ov.setAttribute('role','dialog');
    ov.setAttribute('aria-label','Accès Premium requis');
    ov.style.cssText='position:fixed;inset:0;z-index:999999;background:#0F1B2D;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:center';
    ov.innerHTML=
      '<div style="max-width:340px">'+
        '<div style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:#fff;margin-bottom:10px">Korean <span style="color:#C9A96E">Stories</span></div>'+
        '<h2 style="color:#fff;font-size:19px;margin:0 0 10px;font-family:system-ui,sans-serif">Fiche PDF Premium</h2>'+
        '<p style="color:rgba(255,255,255,.6);font-size:13.5px;line-height:1.6;margin:0 0 22px">Les fiches PDF imprimables font partie des avantages Premium (5€/mois ou 79€ à vie).</p>'+
        '<button id="ks-pdf-gate-btn" style="width:100%;padding:13px;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#e0c48a,#C9A96E);color:#3a2c12;font-size:15px;font-weight:700;margin-bottom:12px">Voir le Premium</button>'+
        '<a href="../cours.html" style="display:block;color:rgba(255,255,255,.5);font-size:13px">← Retour au parcours</a>'+
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('ks-pdf-gate-btn').addEventListener('click', function(){
      if (window.KSPremium) KSPremium.openUpgrade(); else location.href='../reglages.html';
    });
  }

  build();

  document.addEventListener('ks-premium-change', function h(e){
    if (e && e.detail && e.detail.premium){
      var ov=document.getElementById('ks-pdf-gate'); if(ov) ov.remove();
      document.removeEventListener('ks-premium-change', h);
    }
  });
})();
