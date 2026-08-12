/* ═══════════════════════════════════════════════════════════════════
   ks-newsletter-popup.js — Popup d'inscription newsletter.
   ──────────────────────────────────────────────────────────────────
   La newsletter existait déjà (formulaire en pied de page d'index.html,
   voir #nlForm) mais n'était visible que là, tout en bas d'une seule
   page — quasi invisible pour la majorité des visiteurs. Ce module
   propose l'inscription plus largement, sans être intrusif :
     • Ne s'affiche jamais si déjà inscrit (ks_newsletter, même clé que
       le formulaire du footer) ni pendant 14 jours après un "Plus tard".
     • Apparaît après 20s (laisse le temps de voir du contenu d'abord),
       et attend que le bandeau cookies soit refermé s'il est ouvert.
     • Exclu des pages légales/auth/tests chronométrés et des pages où
       une activité est en cours (leçon/exercice/jeu/quiz/histoire/etc.)
       pour ne jamais couper un apprentissage en cours.
     • index.html est exclu (son propre formulaire est déjà en pied de
       page, pas besoin d'un doublon sur la même page).
   Storage : ks_newsletter (array d'e-mails, partagé avec #nlForm),
             ks_nl_popup_dismissed (timestamp du dernier "Plus tard").
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var EXCLUDE_EXACT = {
    'index.html':1, '':1,
    'onboarding.html':1, 'bienvenue.html':1, 'signup.html':1, 'login.html':1, 'reset.html':1,
    'test-niveau.html':1, 'topik.html':1,
    'confidentialite.html':1, 'mentions-legales.html':1, 'cgv.html':1,
    '404.html':1, 'offline.html':1,
    /* Pages de vente : une popup qui recouvre le bouton d'achat au bout de
       20 s coûte plus cher en ventes perdues qu'elle ne rapporte d'adresses.
       Ce sont les deux seules pages du site où quelqu'un sort sa carte. */
    'premium.html':1, 'livret-a1.html':1, 'premium-success.html':1
  };
  var EXCLUDE_PREFIX = /^(lecon|exercice|jeu|quiz|histoire\d|chanson|conseil|anecdote|flash\d|podcast|presse\d|pro\d|lect-a|lect-b)/;

  var path = (location.pathname.split('/').pop() || '').toLowerCase();
  if (EXCLUDE_EXACT[path] || EXCLUDE_PREFIX.test(path)) return;

  var DISMISS_KEY = 'ks_nl_popup_dismissed';
  var DISMISS_DAYS = 14;
  var DELAY_MS = 20000;
  var EP = 'https://ks-premium.delicate-voice-1d19.workers.dev/newsletter';
  var RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function alreadySubscribed(){
    try { return JSON.parse(localStorage.getItem('ks_newsletter') || '[]').length > 0; }
    catch(e){ return false; }
  }
  function recentlyDismissed(){
    try {
      var t = localStorage.getItem(DISMISS_KEY);
      if (!t) return false;
      return (Date.now() - parseInt(t, 10)) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch(e){ return false; }
  }
  function markDismissed(){
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch(e){}
  }
  function markSubscribed(email){
    try {
      var l = JSON.parse(localStorage.getItem('ks_newsletter') || '[]');
      if (l.indexOf(email) < 0) l.push(email);
      localStorage.setItem('ks_newsletter', JSON.stringify(l));
    } catch(e){}
  }

  function injectCSS(){
    if (document.getElementById('ks-nlp-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-nlp-css';
    s.textContent = [
      '.ks-nlp-overlay{',
        'position:fixed;inset:0;z-index:9700;background:rgba(8,14,24,.65);',
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
        'opacity:0;pointer-events:none;transition:opacity .25s;',
        'display:flex;align-items:center;justify-content:center;padding:20px',
      '}',
      '.ks-nlp-overlay.show{opacity:1;pointer-events:auto}',
      '.ks-nlp-modal{',
        'background:linear-gradient(160deg,#152030 0%,#0F1B2D 100%);',
        'color:#f7f8fa;border-radius:24px;width:100%;max-width:420px;',
        'box-shadow:0 24px 64px rgba(0,0,0,.55);',
        'border:1.5px solid rgba(201,169,110,.35);',
        'animation:ksNlpIn .35s cubic-bezier(.34,1.2,.64,1);',
        'padding:26px 24px 22px;text-align:center;position:relative',
      '}',
      '@keyframes ksNlpIn{from{opacity:0;transform:translateY(20px) scale(.94)}to{opacity:1;transform:none}}',
      '@media(max-width:480px){.ks-nlp-modal{border-radius:20px;padding:24px 20px 20px}}',
      '.ks-nlp-close{',
        'position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);',
        'border:none;width:28px;height:28px;border-radius:8px;color:rgba(247,248,250,.7);',
        'cursor:pointer;font-size:16px;line-height:1;font-family:inherit',
      '}',
      '.ks-nlp-close:hover{background:rgba(255,255,255,.14);color:#fff}',
      '.ks-nlp-emblem{',
        'width:52px;height:52px;border-radius:50%;margin:0 auto 14px;',
        'background:linear-gradient(135deg,#C9A96E,#E8C589);',
        'display:flex;align-items:center;justify-content:center;color:#0a1220;',
        'box-shadow:0 6px 20px rgba(201,169,110,.4)',
      '}',
      '.ks-nlp-emblem svg{width:23px;height:23px;stroke-width:2.2;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}',
      '.ks-nlp-title{',
        'font-family:"Playfair Display",Georgia,serif;font-weight:700;font-size:22px;',
        'color:#fff;line-height:1.25;margin:0 0 8px',
      '}',
      '.ks-nlp-title em{color:#C9A96E;font-style:italic}',
      '.ks-nlp-sub{font-size:13px;color:rgba(247,248,250,.65);line-height:1.6;margin:0 auto 18px;max-width:320px}',
      '.ks-nlp-form{display:flex;gap:8px;flex-wrap:wrap}',
      '.ks-nlp-form input{',
        'flex:1;min-width:140px;padding:12px 14px;border-radius:100px;',
        'border:1.5px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);',
        'color:#fff;font-size:13.5px;font-family:inherit;outline:none;transition:border-color .15s',
      '}',
      '.ks-nlp-form input::placeholder{color:rgba(247,248,250,.4)}',
      '.ks-nlp-form input:focus{border-color:#C9A96E}',
      '.ks-nlp-submit{',
        'flex:0 0 auto;padding:12px 20px;border-radius:100px;background:#C9A96E;',
        'color:#0a1220;border:none;cursor:pointer;font-size:13.5px;font-weight:800;',
        'font-family:inherit;transition:background .15s,transform .1s;white-space:nowrap',
      '}',
      '.ks-nlp-submit:hover{background:#D4B582}',
      '.ks-nlp-submit:active{transform:scale(.97)}',
      '.ks-nlp-submit:disabled{opacity:.6;cursor:default}',
      '@media(max-width:380px){.ks-nlp-form{flex-direction:column}.ks-nlp-submit{width:100%}}',
      '.ks-nlp-msg{font-size:12.5px;margin-top:10px;min-height:16px}',
      '.ks-nlp-msg.ok{color:#6ee7b7;font-weight:700}',
      '.ks-nlp-msg.err{color:#fca5a5;font-weight:700}',
      '.ks-nlp-later{',
        'display:block;margin:14px auto 0;background:none;border:none;',
        'color:rgba(247,248,250,.55);font-size:12px;font-weight:700;cursor:pointer;',
        'text-decoration:underline;font-family:inherit',
      '}',
      '.ks-nlp-later:hover{color:rgba(247,248,250,.8)}',
      '.ks-nlp-priv{font-size:10.5px;color:rgba(247,248,250,.4);margin:10px 0 0}',
      '.ks-nlp-priv a{color:rgba(247,248,250,.55)}'
    ].join('');
    document.head.appendChild(s);
  }

  function renderModal(){
    return '<div class="ks-nlp-modal" role="dialog" aria-modal="true" aria-labelledby="nlpTitle">' +
      '<button class="ks-nlp-close" type="button" aria-label="Fermer">&times;</button>' +
      '<div class="ks-nlp-emblem"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg></div>' +
      /* ⚠️ Cette promesse doit correspondre a CRON_THEME dans
         premium-worker/index.js. Elle annoncait « un e-mail par semaine »
         alors que trois partent reellement (mardi/jeudi/samedi, a tous les
         contacts sans distinction de theme) : un abonne recevait le triple
         de ce qu'on lui avait promis, ce qui se paie en desinscriptions et
         en plaintes pour spam. Corrige le 2026-08-12.
         « ecrit par notre equipe » est tombe au passage : Korean Stories,
         c'est une personne. */
      '<h2 class="ks-nlp-title" id="nlpTitle">Un peu de Corée, <em>trois fois par semaine</em></h2>' +
      '<p class="ks-nlp-sub">Culture le mardi, histoire le jeudi, tendances le samedi. Trois e-mails courts, avec des mots croisés coréens dans chaque numéro. Jamais de spam.</p>' +
      '<form class="ks-nlp-form" id="nlpForm" novalidate>' +
        '<input type="email" id="nlpEmail" placeholder="Ton e-mail" aria-label="Ton e-mail" autocomplete="email" required>' +
        '<button type="submit" class="ks-nlp-submit" id="nlpBtn">Je m\'inscris</button>' +
      '</form>' +
      '<div class="ks-nlp-msg" id="nlpMsg"></div>' +
      '<button type="button" class="ks-nlp-later" id="nlpLater">Plus tard</button>' +
      '<p class="ks-nlp-priv">Désinscription en un clic. <a href="confidentialite.html">Confidentialité</a>.</p>' +
    '</div>';
  }

  function showModal(){
    injectCSS();
    if (document.querySelector('.ks-nlp-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'ks-nlp-overlay';
    overlay.innerHTML = renderModal();
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.classList.add('show'); });

    var form = overlay.querySelector('#nlpForm');
    var input = overlay.querySelector('#nlpEmail');
    var btn = overlay.querySelector('#nlpBtn');
    var msg = overlay.querySelector('#nlpMsg');

    function setMsg(kind, text){
      msg.textContent = text;
      msg.className = 'ks-nlp-msg' + (kind ? ' ' + kind : '');
    }

    function dismiss(){
      overlay.classList.remove('show');
      setTimeout(function(){ if (overlay.parentNode) overlay.remove(); }, 250);
      document.removeEventListener('keydown', escHandler);
    }
    function escHandler(e){ if (e.key === 'Escape') { markDismissed(); dismiss(); } }

    overlay.querySelector('.ks-nlp-close').addEventListener('click', function(){ markDismissed(); dismiss(); });
    overlay.querySelector('#nlpLater').addEventListener('click', function(){ markDismissed(); dismiss(); });
    overlay.addEventListener('click', function(e){ if (e.target === overlay) { markDismissed(); dismiss(); } });
    document.addEventListener('keydown', escHandler);

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (input.value || '').trim();
      if (!RE.test(email)) { setMsg('err', 'E-mail invalide.'); input.focus(); return; }
      btn.disabled = true; btn.textContent = '…'; setMsg('', '');
      markSubscribed(email);
      fetch(EP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, action: 'subscribe' }) })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .then(function(d){
          if (!d || !d.success) throw 0;
          form.style.display = 'none';
          setMsg('ok', 'Merci ! On revient vers toi très vite.');
          setTimeout(dismiss, 2200);
        })
        .catch(function(){
          btn.disabled = false; btn.textContent = 'Je m\'inscris';
          setMsg('err', 'Réessaie dans un instant.');
        });
    });
  }

  function tryShow(attempt){
    if (alreadySubscribed() || recentlyDismissed()) return;
    /* Laisse la priorité au bandeau cookies s'il est encore ouvert */
    if (document.querySelector('.ks-ck-wrap')) {
      if (attempt < 10) setTimeout(function(){ tryShow(attempt + 1); }, 2000);
      return;
    }
    /* Une sollicitation à la fois. ks-review-prompt.js s'affiche 9 s après
       l'ouverture, donc avant nous : si sa carte est là (ou l'a été dans
       cette session), on se tait. Demander un avis PUIS un e-mail dans la
       même minute, c'est ce qui fait fermer un site. Garde-fou réciproque
       côté ks-review-prompt.js. */
    try { if (sessionStorage.getItem('ks_popup_shown')) return; } catch(e){}
    if (document.querySelector('.ksrp')) return;
    showModal();
  }

  function schedule(){
    if (alreadySubscribed() || recentlyDismissed()) return;
    setTimeout(function(){ tryShow(0); }, DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }

  window.KSNewsletterPopup = { show: showModal };
})();
