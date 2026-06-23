/* ═══════════════════════════════════════════════════════════════════
   ks-premium.js — État Premium + déblocage par clé Gumroad (sans backend).
   ──────────────────────────────────────────────────────────────────
   Modèle « par confort / extras » : le Premium débloque des bonus
   (PDF, certificat, podcasts & voix natives à venir, accès anticipé,
   badge de soutien). AUCUNE restriction du contenu cœur du parcours.
   Verrou « doux » (flag localStorage, synchronisé Firebase si connecté) :
   acceptable ici car on déverrouille des extras, pas du contenu protégé.

   API : window.KSPremium.isPremium() / .openUpgrade() / .unlock(key)
         / .setPremium(bool) / .verifyKey(key)
   Événement : document 'ks-premium-change' (detail.premium).
   ─────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.KSPremium) return;

  /* ── CONFIG Stripe + Cloudflare Worker ── */
  var BUY_URL_MONTHLY  = 'https://buy.stripe.com/test_5kQbJ35BtcZH36f1NSe7m00';
  var BUY_URL_LIFETIME = 'https://buy.stripe.com/test_aFaaEZfc3cZH9uDeAEe7m01';
  var VERIFY_URL       = 'https://ks-premium.delicate-voice-1d19.workers.dev/verify';

  var KEY = 'ks_premium', KEY_LIC = 'ks_premium_key';

  function ls(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  function lsDel(k){ try { localStorage.removeItem(k); } catch(e){} }

  function isPremium(){ return ls(KEY) === '1'; }

  function setPremium(on, licenseKey){
    lsSet(KEY, on ? '1' : '0');
    if (on && licenseKey) lsSet(KEY_LIC, licenseKey);
    if (!on) lsDel(KEY_LIC);
    document.documentElement.classList.toggle('ks-premium', !!on);
    syncToCloud(!!on, licenseKey || ls(KEY_LIC));
    try { document.dispatchEvent(new CustomEvent('ks-premium-change', { detail: { premium: !!on } })); } catch(e){}
  }

  /* ── Sync Firestore optionnelle (suit le compte sur tous les appareils) ── */
  function syncToCloud(on, licenseKey){
    try {
      if (window.firebase && firebase.auth && firebase.firestore) {
        var u = firebase.auth().currentUser;
        if (u) firebase.firestore().collection('users').doc(u.uid)
          .set({ premium: on, premiumKey: licenseKey || null, premiumAt: Date.now() }, { merge: true })
          .catch(function(){});
      }
    } catch(e){}
  }
  function pullFromCloud(){
    try {
      if (window.firebase && firebase.auth && firebase.firestore) {
        firebase.auth().onAuthStateChanged(function(u){
          if (!u) return;
          firebase.firestore().collection('users').doc(u.uid).get().then(function(d){
            if (d.exists && d.data() && d.data().premium && !isPremium()) setPremium(true, d.data().premiumKey);
          }).catch(function(){});
        });
      }
    } catch(e){}
  }

  /* ── Vérification d’une clé de licence via Cloudflare Worker ── */
  function verifyKey(licenseKey){
    return new Promise(function(resolve){
      licenseKey = (licenseKey || '').trim().toUpperCase();
      if (!licenseKey) return resolve({ ok:false, msg:'Entre ta clé de licence.' });
      fetch(VERIFY_URL + '?key=' + encodeURIComponent(licenseKey))
        .then(function(r){ return r.json(); })
        .then(function(d){
          if (d && d.success) {
            resolve({ ok:true });
          } else {
            resolve({ ok:false, msg: d.message || 'Clé invalide ou abonnement inactif.' });
          }
        })
        .catch(function(){ resolve({ ok:false, msg:'Vérification impossible (réseau). Réessaie dans un instant.' }); });
    });
  }
  function unlock(licenseKey){
    return verifyKey(licenseKey).then(function(res){
      if (res.ok) setPremium(true, (licenseKey || '').trim());
      return res;
    });
  }

  /* ── Styles (injectés une fois) ── */
  function injectCSS(){
    if (document.getElementById('ks-premium-css')) return;
    var css = [
      '.ksp-overlay{position:fixed;inset:0;z-index:9800;background:rgba(8,14,24,.62);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .22s;padding:0}',
      '.ksp-overlay.show{opacity:1}',
      '@media(min-width:560px){.ksp-overlay{align-items:center;padding:20px}}',
      '.ksp-card{background:var(--surf,#fff);width:100%;max-width:440px;border-radius:22px 22px 0 0;box-shadow:0 -8px 40px rgba(8,14,24,.3);transform:translateY(24px);transition:transform .26s cubic-bezier(.3,1,.4,1);max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch}',
      '.ksp-overlay.show .ksp-card{transform:none}',
      '@media(min-width:560px){.ksp-card{border-radius:22px}}',
      '.ksp-head{position:relative;background:linear-gradient(160deg,#0F1B2D,#1b2c47);color:#fff;padding:26px 22px 22px;border-radius:22px 22px 0 0;text-align:center}',
      '@media(min-width:560px){.ksp-head{border-radius:22px 22px 0 0}}',
      '.ksp-crown{width:50px;height:50px;margin:0 auto 12px;border-radius:14px;background:linear-gradient(135deg,#e0c48a,#C9A96E);display:flex;align-items:center;justify-content:center}',
      '.ksp-crown svg{width:26px;height:26px;fill:#3a2c12}',
      '.ksp-h{font-family:"Playfair Display",Georgia,serif;font-size:23px;font-weight:800;margin:0 0 5px}',
      '.ksp-sub{font-size:13px;color:#c7d2e3;line-height:1.5;margin:0}',
      '.ksp-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:none;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center}',
      '.ksp-body{padding:20px 22px 24px}',
      '.ksp-perks{list-style:none;margin:0 0 20px;padding:0;display:flex;flex-direction:column;gap:11px}',
      '.ksp-perks li{display:flex;align-items:flex-start;gap:11px;font-size:14px;color:var(--t,#0D1823);line-height:1.4}',
      '.ksp-perks li small{display:block;color:var(--t3,#8FA5BE);font-size:11.5px;font-weight:600}',
      '.ksp-tick{flex:0 0 20px;width:20px;height:20px;border-radius:50%;background:var(--goldbg,rgba(201,169,110,.14));display:flex;align-items:center;justify-content:center;margin-top:1px}',
      '.ksp-tick svg{width:12px;height:12px;stroke:var(--gold,#C9A96E);fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}',
      '.ksp-buys{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}',
      '.ksp-buy{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:13px;padding:14px;font-weight:800;font-size:14.5px;text-decoration:none;cursor:pointer;border:none}',
      '.ksp-buy-main{background:linear-gradient(135deg,#e0c48a,var(--gold,#C9A96E));color:#3a2c12;box-shadow:0 8px 22px rgba(201,169,110,.32)}',
      '.ksp-buy-alt{background:var(--s2,#F5F7FF);color:var(--t,#0D1823);border:1.5px solid var(--bd,#DAE3F2)}',
      '.ksp-buy small{font-weight:600;opacity:.7}',
      '.ksp-buy[aria-disabled="true"]{opacity:.55;pointer-events:none}',
      '.ksp-or{text-align:center;font-size:11.5px;color:var(--t3,#8FA5BE);text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px}',
      '.ksp-key{display:flex;gap:8px}',
      '.ksp-key input{flex:1;min-width:0;border:1.5px solid var(--bd,#DAE3F2);border-radius:11px;padding:11px 13px;font:inherit;font-size:13.5px;background:var(--surf,#fff);color:var(--t,#0D1823)}',
      '.ksp-key button{flex:0 0 auto;border:none;border-radius:11px;padding:0 16px;background:var(--navy,#0F1B2D);color:#fff;font-weight:700;font-size:13.5px;cursor:pointer}',
      '.ksp-key button:disabled{opacity:.6;cursor:wait}',
      '.ksp-msg{font-size:12.5px;margin-top:9px;text-align:center;line-height:1.45;display:none}',
      '.ksp-msg.show{display:block}',
      '.ksp-msg.err{color:#dc2626}',
      '.ksp-msg.ok{color:#16a34a;font-weight:700}',
      '.ksp-active{text-align:center;padding:6px 0 4px}',
      '.ksp-active .ksp-crown{width:58px;height:58px}',
      '.ksp-active h3{font-family:"Playfair Display",Georgia,serif;font-size:21px;margin:4px 0 6px;color:var(--t,#0D1823)}',
      '.ksp-active p{font-size:13.5px;color:var(--t2,#475E78);line-height:1.5;margin:0}',
      '[data-theme="dark"] .ksp-buy-alt{background:rgba(255,255,255,.06)}'
    ].join('');
    var s = document.createElement('style'); s.id = 'ks-premium-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  var CROWN = '<svg viewBox="0 0 24 24"><path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7z"/></svg>';
  var TICK = '<span class="ksp-tick"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>';

  var PERKS = [
    ['Tous les PDF à télécharger', ''],
    ['Ton certificat de progression officiel', ''],
    ['Les podcasts en coréen', 'bientôt'],
    ['Les voix coréennes naturelles', 'bientôt'],
    ['Accès anticipé à chaque nouveauté', ''],
    ['Un badge de soutien sur ton profil', ''],
    ['Tu soutiens une créatrice indépendante — et zéro pub, jamais', '']
  ];

  function closeUpgrade(){
    var o = document.querySelector('.ksp-overlay');
    if (!o) return;
    o.classList.remove('show');
    setTimeout(function(){ if (o.parentNode) o.remove(); }, 240);
  }

  function openUpgrade(){
    injectCSS();
    if (document.querySelector('.ksp-overlay')) return;
    var o = document.createElement('div');
    o.className = 'ksp-overlay';

    var inner;
    if (isPremium()) {
      inner =
        '<div class="ksp-head"><button class="ksp-close" aria-label="Fermer">×</button>' +
          '<div class="ksp-active"><div class="ksp-crown">' + CROWN + '</div>' +
          '<h3>Tu es Premium 💛</h3>' +
          '<p>Merci de soutenir Korean Stories ! Tous les bonus sont débloqués sur ce compte.</p></div></div>' +
        '<div class="ksp-body"><button class="ksp-buy ksp-buy-alt" id="kspClose2">Fermer</button></div>';
    } else {
      var perksHtml = PERKS.map(function(p){
        return '<li>' + TICK + '<span>' + p[0] + (p[1] ? ' <small>' + p[1] + '</small>' : '') + '</span></li>';
      }).join('');
      var monthly = BUY_URL_MONTHLY
        ? '<a class="ksp-buy ksp-buy-main" href="' + BUY_URL_MONTHLY + '" target="_blank" rel="noopener">Premium — 5 €<small>/mois</small></a>'
        : '<a class="ksp-buy ksp-buy-main" aria-disabled="true">Premium — 5 €/mois <small>(bientôt)</small></a>';
      var lifetime = BUY_URL_LIFETIME
        ? '<a class="ksp-buy ksp-buy-alt" href="' + BUY_URL_LIFETIME + '" target="_blank" rel="noopener">Accès à vie — 79 €<small> une fois</small></a>'
        : '<a class="ksp-buy ksp-buy-alt" aria-disabled="true">Accès à vie — 79 € <small>(bientôt)</small></a>';
      inner =
        '<div class="ksp-head"><button class="ksp-close" aria-label="Fermer">×</button>' +
          '<div class="ksp-crown">' + CROWN + '</div>' +
          '<h2 class="ksp-h">Passe en Premium</h2>' +
          '<p class="ksp-sub">Le parcours reste 100 % gratuit. Le Premium débloque les bonus et soutient le projet.</p></div>' +
        '<div class="ksp-body">' +
          '<ul class="ksp-perks">' + perksHtml + '</ul>' +
          '<div class="ksp-buys">' + monthly + lifetime + '</div>' +
          '<div class="ksp-or">Déjà acheté ?</div>' +
          '<div class="ksp-key"><input id="kspKey" type="text" placeholder="Colle ta clé de licence" autocomplete="off" spellcheck="false"/><button id="kspUnlock">Débloquer</button></div>' +
          '<div class="ksp-msg" id="kspMsg"></div>' +
        '</div>';
    }
    o.innerHTML = '<div class="ksp-card" role="dialog" aria-modal="true" aria-label="Premium">' + inner + '</div>';
    document.body.appendChild(o);
    setTimeout(function(){ o.classList.add('show'); }, 10);

    o.addEventListener('click', function(e){ if (e.target === o) closeUpgrade(); });
    var cl = o.querySelector('.ksp-close'); if (cl) cl.addEventListener('click', closeUpgrade);
    var cl2 = o.querySelector('#kspClose2'); if (cl2) cl2.addEventListener('click', closeUpgrade);

    var btn = o.querySelector('#kspUnlock'), inp = o.querySelector('#kspKey'), msg = o.querySelector('#kspMsg');
    function showMsg(text, cls){ if (!msg) return; msg.textContent = text; msg.className = 'ksp-msg show ' + cls; }
    function doUnlock(){
      if (!inp || !btn) return;
      btn.disabled = true; btn.textContent = '...'; showMsg('Vérification…', '');
      unlock(inp.value).then(function(res){
        btn.disabled = false; btn.textContent = 'Débloquer';
        if (res.ok) { showMsg('Premium débloqué — merci 💛', 'ok'); setTimeout(openUpgradeRefresh, 900); }
        else showMsg(res.msg || 'Clé invalide.', 'err');
      });
    }
    if (btn) btn.addEventListener('click', doUnlock);
    if (inp) inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') doUnlock(); });
  }
  function openUpgradeRefresh(){ closeUpgrade(); setTimeout(openUpgrade, 250); }

  /* ── API publique ── */
  window.KSPremium = {
    isPremium: isPremium,
    setPremium: setPremium,
    unlock: unlock,
    verifyKey: verifyKey,
    openUpgrade: openUpgrade,
    closeUpgrade: closeUpgrade
  };

  /* init */
  document.documentElement.classList.toggle('ks-premium', isPremium());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pullFromCloud);
  else pullFromCloud();
})();
