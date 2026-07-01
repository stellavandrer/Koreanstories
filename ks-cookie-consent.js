/* ═══════════════════════════════════════════════════════════════════
   ks-cookie-consent.js — Bandeau de consentement RGPD / ePrivacy.
   ──────────────────────────────────────────────────────────────────
   Depuis l'auto-hébergement des polices (fonts/ks-fonts.css), le site
   ne charge plus AUCUNE ressource tierce sur la majorité des pages.
   Il reste des appels tiers ponctuels et documentés (confidentialite.html) :
     • Firebase Auth (cookie de session) — strictement nécessaire, exempté
       de consentement (art. 82 loi Informatique et Libertés).
     • DiceBear (api.dicebear.com) — rendu de l'avatar (SVG, sans cookie
       propre) : affiché automatiquement pour un visiteur qui n'a rien
       choisi lui-même (ex. avatars d'autrui sur le classement).
     • Stripe — uniquement sur les pages hébergées par Stripe lui-même
       lors du paiement, jamais embarqué sur koreanstories.fr.

   Ce module gère le recueil du consentement (case "Fonctionnel"),
   persiste le choix, et expose une API pour que d'autres scripts
   (ex. classement.html) n'affichent les avatars tiers d'autrui que si
   le visiteur a accepté.

   API exposée : window.KSCookieConsent = { get(), hasFunctional(), open() }
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var KEY = 'ks_cookie_consent';

  function read(){
    try{ return JSON.parse(localStorage.getItem(KEY) || 'null'); }catch(e){ return null; }
  }
  function write(functional){
    var data = { necessary: true, functional: !!functional, date: new Date().toISOString() };
    try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){}
    return data;
  }

  function hasFunctional(){
    var d = read();
    return !!(d && d.functional);
  }

  function injectCSS(){
    if (document.getElementById('ks-cookie-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-cookie-css';
    s.textContent = [
      '.ks-ck-wrap{position:fixed;left:0;right:0;bottom:0;z-index:9999;',
        'display:flex;justify-content:center;padding:14px;pointer-events:none;',
        'animation:ksCkIn .35s ease both}',
      '@keyframes ksCkIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
      '.ks-ck{pointer-events:auto;max-width:560px;width:100%;background:var(--surf,#fff);',
        'border:1.5px solid var(--bd,#DAE3F2);border-radius:18px;',
        'box-shadow:0 12px 40px rgba(15,30,80,.18);padding:18px 20px;',
        'font-family:Inter,system-ui,sans-serif;color:var(--t,#0D1823)}',
      '.ks-ck-title{font-weight:800;font-size:14.5px;margin-bottom:6px;display:flex;align-items:center;gap:8px}',
      '.ks-ck-title svg{width:16px;height:16px;stroke:var(--gold,#C9A96E);fill:none;stroke-width:2;flex-shrink:0}',
      '.ks-ck-txt{font-size:12.5px;line-height:1.55;color:var(--t2,#475E78);margin-bottom:12px}',
      '.ks-ck-txt a{color:var(--gold,#C9A96E);font-weight:700;text-decoration:none}',
      '.ks-ck-txt a:hover{text-decoration:underline}',
      '.ks-ck-btns{display:flex;gap:8px;flex-wrap:wrap}',
      '.ks-ck-btn{flex:1;min-width:120px;padding:10px 14px;border-radius:100px;font-size:13px;font-weight:700;',
        'cursor:pointer;border:1.5px solid var(--bd2,#C7D2E3);background:var(--surf,#fff);',
        'color:var(--t,#0D1823);font-family:inherit;transition:filter .15s}',
      '.ks-ck-btn:hover{filter:brightness(.97)}',
      '.ks-ck-btn.primary{background:linear-gradient(135deg,var(--gold,#C9A96E),#D4A55A);',
        'color:#fff;border-color:transparent}',
      '.ks-ck-link{background:none;border:none;color:var(--t3,#8FA5BE);font-size:12px;font-weight:700;',
        'cursor:pointer;text-decoration:underline;padding:6px 4px;font-family:inherit;flex:0 0 auto}',
      '.ks-ck-detail{display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--bd,#DAE3F2)}',
      '.ks-ck-detail.show{display:block}',
      '.ks-ck-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;',
        'padding:8px 0}',
      '.ks-ck-row + .ks-ck-row{border-top:1px dashed var(--bd,#DAE3F2)}',
      '.ks-ck-row-t{font-size:12.5px;font-weight:700;margin-bottom:2px}',
      '.ks-ck-row-s{font-size:11.5px;color:var(--t2,#475E78);line-height:1.5}',
      '.ks-ck-sw{flex-shrink:0;width:38px;height:22px;border-radius:100px;position:relative;',
        'cursor:pointer;transition:background .18s;margin-top:2px}',
      '.ks-ck-sw::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;',
        'border-radius:50%;background:#fff;transition:transform .18s;box-shadow:0 1px 3px rgba(0,0,0,.25)}',
      '.ks-ck-sw.off{background:var(--bd2,#C7D2E3);cursor:not-allowed}',
      '.ks-ck-sw.on{background:var(--gold,#C9A96E)}',
      '.ks-ck-sw.on::after{transform:translateX(16px)}',
      '[data-theme="dark"] .ks-ck{background:var(--surf,#141e30)}',
      '@media(max-width:420px){.ks-ck-btns{flex-direction:column}.ks-ck-btn{width:100%}.ks-ck-link{order:3;text-align:center}}'
    ].join('');
    document.head.appendChild(s);
  }

  var wrapEl = null;

  function render(){
    injectCSS();
    if (wrapEl) wrapEl.remove();
    wrapEl = document.createElement('div');
    wrapEl.className = 'ks-ck-wrap';
    wrapEl.innerHTML =
      '<div class="ks-ck" role="dialog" aria-label="Préférences de cookies">' +
        '<div class="ks-ck-title"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M9 15.5h.01"/></svg>Ton choix sur les cookies</div>' +
        '<div class="ks-ck-txt">Korean Stories n\'utilise <strong>aucun cookie publicitaire</strong> ni traceur analytique. Un service ponctuel (DiceBear, avatars) peut afficher une ressource externe. Tu choisis. Détails dans la <a href="confidentialite.html">politique de confidentialité</a>.</div>' +
        '<div class="ks-ck-detail" id="ksCkDetail">' +
          '<div class="ks-ck-row"><div><div class="ks-ck-row-t">Nécessaires</div><div class="ks-ck-row-s">Connexion à ton compte (session Firebase Auth), sauvegarde locale de ta progression. Toujours actifs.</div></div><div class="ks-ck-sw on off" aria-hidden="true"></div></div>' +
          '<div class="ks-ck-row"><div><div class="ks-ck-row-t">Fonctionnels</div><div class="ks-ck-row-s">Affichage des avatars DiceBear d\'autres membres (ex. classement). Refusé par défaut.</div></div><div class="ks-ck-sw" id="ksCkFuncSw" role="switch" tabindex="0"></div></div>' +
          '<button type="button" class="ks-ck-btn primary" id="ksCkSave" style="width:100%;margin-top:10px">Enregistrer mes choix</button>' +
        '</div>' +
        '<div class="ks-ck-btns" style="margin-top:12px" id="ksCkMainBtns">' +
          '<button type="button" class="ks-ck-link" id="ksCkMore">Personnaliser</button>' +
          '<button type="button" class="ks-ck-btn" id="ksCkRefuse">Refuser</button>' +
          '<button type="button" class="ks-ck-btn primary" id="ksCkAccept">Tout accepter</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrapEl);

    var funcOn = false;
    var swEl = wrapEl.querySelector('#ksCkFuncSw');
    function syncSw(){ swEl.className = 'ks-ck-sw' + (funcOn ? ' on' : ''); }
    syncSw();
    function toggleFunc(){ funcOn = !funcOn; syncSw(); }
    swEl.addEventListener('click', toggleFunc);
    swEl.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleFunc(); } });

    wrapEl.querySelector('#ksCkMore').addEventListener('click', function(){
      var d = wrapEl.querySelector('#ksCkDetail');
      d.classList.toggle('show');
    });
    wrapEl.querySelector('#ksCkAccept').addEventListener('click', function(){ close(write(true)); });
    wrapEl.querySelector('#ksCkRefuse').addEventListener('click', function(){ close(write(false)); });
    wrapEl.querySelector('#ksCkSave').addEventListener('click', function(){ close(write(funcOn)); });

    function close(){
      wrapEl.style.animation = 'ksCkIn .25s ease reverse both';
      setTimeout(function(){ if (wrapEl){ wrapEl.remove(); wrapEl = null; } }, 240);
      document.dispatchEvent(new CustomEvent('ks-cookie-consent-changed'));
    }
  }

  function open(){ render(); }

  function init(){
    var existing = read();
    if (!existing) render();
  }

  window.KSCookieConsent = { get: read, hasFunctional: hasFunctional, open: open };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
