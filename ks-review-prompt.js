/* ═══════════════════════════════════════════════════════════════════
   ks-review-prompt.js — Proposer de laisser un avis, au bon moment.
   ──────────────────────────────────────────────────────────────────
   Demande de Stella (2026-08-06) : « proposer aux personnes inscrites
   de laisser un avis apres un certain temps d'utilisation ».

   Le mot important est APRES. Demander un avis a quelqu'un qui vient
   d'arriver, c'est quemander une note ; le demander a quelqu'un qui
   apprend ici depuis plusieurs jours, c'est lui donner la parole. Les
   deux se ressemblent dans le code et n'ont rien a voir pour la
   personne en face. D'ou des conditions volontairement exigeantes.

   ── Qui voit cette invitation ──
     • un compte reel (le mode invite ne compte pas) ;
     • au moins 15 activites terminees ;
     • au moins 4 jours d'activite distincts — pas 4 jours de calendrier :
       4 jours ou la personne a REELLEMENT travaille. Quelqu'un qui
       enchaine 30 activites le meme apres-midi n'est pas encore en
       position de juger le site sur la duree.
   Les deux conditions ensemble, jamais l'une ou l'autre.

   ── Quand elle ne s'affiche jamais ──
     • pendant une lecon, un exercice, un jeu, un quiz, une histoire :
       on ne coupe pas un apprentissage en cours, c'est toute la valeur
       du produit ;
     • sur les pages d'auth, legales, et les tests chronometres ;
     • si la personne a deja laisse un avis (ks_review_left, pose par
       avis.html a l'envoi) ;
     • si elle a dit « Non merci » : plus jamais, sans date de peremption ;
     • si elle a dit « Plus tard » : rien pendant 45 jours ;
     • tant que le bandeau cookies n'est pas referme ;
     • si la popup newsletter est deja a l'ecran (une sollicitation a la
       fois — voir le garde-fou reciproque dans ks-newsletter-popup.js).

   ── Pourquoi une carte et pas une modale ──
   La popup newsletter bloque la page parce qu'elle s'adresse a des
   visiteurs de passage. Ici on s'adresse a quelqu'un de fidele, en
   train d'utiliser le site : lui bloquer l'ecran pour lui demander un
   service serait le plus mauvais remerciement possible. La carte glisse
   en bas, se ferme d'un clic, d'un Echap, et ne revient pas.

   Storage : ks_review_left (avis envoye), ks_review_prompt_never,
             ks_review_prompt_later (timestamp).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Liste blanche : uniquement les pages « entre deux activites ». Une
     liste blanche plutot qu'une liste noire, pour qu'une nouvelle page
     du site n'herite jamais d'une sollicitation par accident. */
  var ALLOW = {
    'app.html': 1, 'cours.html': 1, 'histoires.html': 1,
    'statistiques.html': 1, 'trophees.html': 1, 'album.html': 1,
    'mes-mots.html': 1, 'profil.html': 1
  };

  var here = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!ALLOW[here]) return;

  var MIN_ACTIVITIES = 15;
  var MIN_DAYS = 4;
  var LATER_DAYS = 45;
  var DELAY_MS = 9000;

  /* ── Conditions ────────────────────────────────────────────────── */

  function hasAccount() {
    try {
      var u = JSON.parse(localStorage.getItem('ks_user') || 'null');
      return !!(u && u.guest !== true);
    } catch (e) { return false; }
  }

  /* Meme comptage que trophees.html (countActivities) : les activites
     terminees posent une cle ks_h* / ks_a* / ks_b* / ks_c* / ks_d*. */
  function activities() {
    var n = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (/^ks_[habcd][_0-9a-z]+$/.test(k)) {
          var v = localStorage.getItem(k);
          if (v === 'done' || v === '1') n++;
        }
      }
    } catch (e) {}
    return n;
  }

  /* Jours ou la personne a vraiment travaille. ksAddXP() pose une cle
     ks_xp_day_AAAA-MM-JJ a chaque journee active : les compter donne le
     nombre de jours distincts, sans etre remis a zero par une serie
     cassee. Repli sur le meilleur streak pour les comptes anterieurs a
     ce suivi, qui n'ont pas ces cles. */
  function activeDays() {
    var n = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('ks_xp_day_') === 0) n++;
      }
    } catch (e) {}
    var best = 0;
    try { best = parseInt(localStorage.getItem('ks_beststreak') || '0', 10) || 0; } catch (e) {}
    return Math.max(n, best);
  }

  function alreadyAnswered() {
    try {
      if (localStorage.getItem('ks_review_left')) return true;
      if (localStorage.getItem('ks_review_prompt_never')) return true;
      var t = localStorage.getItem('ks_review_prompt_later');
      if (t && (Date.now() - parseInt(t, 10)) < LATER_DAYS * 864e5) return true;
    } catch (e) {}
    return false;
  }

  function consentSettled() {
    try { return !!localStorage.getItem('ks_cookie_consent'); } catch (e) { return true; }
  }

  function eligible() {
    return hasAccount() &&
           !alreadyAnswered() &&
           activities() >= MIN_ACTIVITIES &&
           activeDays() >= MIN_DAYS;
  }

  if (!eligible()) return;

  /* ── Rendu ─────────────────────────────────────────────────────── */

  function injectCSS() {
    if (document.getElementById('ks-krp-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-krp-css';
    s.textContent = [
      '.ksrp{position:fixed;z-index:9650;right:20px;bottom:20px;width:340px;max-width:calc(100vw - 32px);',
        'background:linear-gradient(160deg,#152030 0%,#0F1B2D 100%);color:#f7f8fa;',
        'border:1.5px solid rgba(201,169,110,.35);border-radius:20px;padding:20px 20px 16px;',
        'box-shadow:0 20px 50px rgba(0,0,0,.42);font-family:"Inter",system-ui,-apple-system,sans-serif;',
        'transform:translateY(24px);opacity:0;transition:opacity .3s,transform .3s cubic-bezier(.34,1.15,.64,1)}',
      '.ksrp.show{opacity:1;transform:none}',
      /* En mobile, left+right pilotent la largeur : le max-width du bloc de
         base la reclamerait a 100vw-32px et decalerait la carte vers la
         gauche (12px d'un cote, 20px de l'autre). On le neutralise. */
      '@media(max-width:560px){.ksrp{right:12px;left:12px;width:auto;max-width:none;',
        'bottom:calc(12px + env(safe-area-inset-bottom,0px))}}',
      /* Le decalage au-dessus d'une eventuelle barre de navigation basse est
         mesure a l'affichage (voir show()), pas devine ici : certaines pages
         du hub en ont une, d'autres non, et reserver 78px partout laisserait
         un trou sous la carte la ou il n'y a rien a eviter. */
      '.ksrp-x{position:absolute;top:12px;right:12px;width:30px;height:30px;border:none;border-radius:9px;',
        'background:rgba(255,255,255,.08);color:rgba(247,248,250,.7);cursor:pointer;font-size:16px;line-height:1;font-family:inherit}',
      '.ksrp-x:hover{background:rgba(255,255,255,.15);color:#fff}',
      /* La croix reste discrete (30px) mais sa zone tactile fait 44px :
         en dessous, on rate la cible au pouce et on ferme mal la carte. */
      '.ksrp-x::after{content:"";position:absolute;inset:-7px}',
      '.ksrp-stars{display:flex;gap:3px;margin-bottom:11px}',
      '.ksrp-stars svg{width:16px;height:16px;fill:#C9A96E;stroke:none}',
      '.ksrp-t{font-family:"Playfair Display",Georgia,serif;font-weight:700;font-size:18.5px;',
        'line-height:1.3;margin:0 0 8px;color:#fff;padding-right:22px}',
      '.ksrp-t em{color:#C9A96E;font-style:italic}',
      '.ksrp-p{font-size:13px;line-height:1.6;color:rgba(247,248,250,.68);margin:0 0 15px}',
      '.ksrp-go{display:block;text-align:center;padding:13px;border-radius:12px;',
        'background:linear-gradient(135deg,#e0c48a,#C9A96E);color:#3a2c12;font-weight:800;',
        'font-size:13.5px;text-decoration:none;transition:filter .15s}',
      '.ksrp-go:hover{filter:brightness(1.06)}',
      '.ksrp-alt{display:flex;justify-content:center;gap:16px;margin-top:11px}',
      '.ksrp-alt button{background:none;border:none;padding:8px 6px;color:rgba(247,248,250,.5);',
        'font-size:12px;font-family:inherit;cursor:pointer;text-decoration:underline}',
      '.ksrp-alt button:hover{color:rgba(247,248,250,.8)}',
      '@media(prefers-reduced-motion:reduce){.ksrp{transition:none;transform:none;opacity:1}}'
    ].join('');
    document.head.appendChild(s);
  }

  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>';

  function firstName() {
    try {
      var u = JSON.parse(localStorage.getItem('ks_user') || 'null');
      var n = (u && u.name || '').trim().split(/\s+/)[0];
      /* Prenom seul, jamais le nom de famille — meme regle que partout
         ailleurs sur le site (classement, partages). */
      return n && n.length <= 20 ? n : '';
    } catch (e) { return ''; }
  }

  function show() {
    if (document.querySelector('.ksrp')) return;
    /* Rien par-dessus une autre surcouche. En pratique le tour d'accueil et
       cette carte s'excluent (l'un s'adresse a quelqu'un qui arrive, l'autre
       a quelqu'un qui revient depuis des jours), mais un etat de donnees
       inhabituel ne doit pas produire deux boites empilees. */
    if (document.querySelector('.ks-nlp-overlay')) return;   /* newsletter */
    if (document.getElementById('ks-onb-root')) return;      /* tour d'accueil */
    if (document.getElementById('ks-tour-card')) return;     /* visite guidee */
    if (document.querySelector('.ks-ck-wrap')) return;       /* bandeau cookies */
    injectCSS();

    var days = activeDays();
    var who = firstName();

    var card = document.createElement('aside');
    card.className = 'ksrp';
    card.setAttribute('role', 'complementary');
    card.setAttribute('aria-label', 'Invitation à laisser un avis');
    card.innerHTML =
      '<button class="ksrp-x" type="button" aria-label="Fermer">&times;</button>' +
      '<div class="ksrp-stars">' + STAR + STAR + STAR + STAR + STAR + '</div>' +
      '<h2 class="ksrp-t">' + (who ? esc(who) + ', t' : 'T') +
        'u apprends ici depuis <em>' + days + ' jours</em></h2>' +
      '<p class="ksrp-p">Korean Stories est fait par une seule personne, sans budget pub. ' +
        'Ton avis est ce qui aide le plus quelqu\'un d\'autre à oser commencer. ' +
        'Deux minutes, et tu peux dire aussi ce qui ne va pas.</p>' +
      '<a class="ksrp-go" href="avis.html">Laisser mon avis</a>' +
      '<div class="ksrp-alt">' +
        '<button type="button" data-a="later">Plus tard</button>' +
        '<button type="button" data-a="never">Non merci</button>' +
      '</div>';

    document.body.appendChild(card);

    /* Ne jamais recouvrir la barre de navigation basse quand la page en a
       une : on mesure sa hauteur reelle plutot que de la supposer. */
    try {
      var bar = document.querySelector('.bnav');
      if (bar) {
        var h = bar.getBoundingClientRect().height;
        if (h > 8) card.style.bottom = 'calc(' + Math.round(h + 12) + 'px + env(safe-area-inset-bottom,0px))';
      }
    } catch (e) {}

    requestAnimationFrame(function () { card.classList.add('show'); });
    try { sessionStorage.setItem('ks_popup_shown', '1'); } catch (e) {}

    function close() {
      card.classList.remove('show');
      setTimeout(function () { if (card.parentNode) card.remove(); }, 300);
      document.removeEventListener('keydown', onKey);
    }
    function later() { try { localStorage.setItem('ks_review_prompt_later', String(Date.now())); } catch (e) {} close(); }
    function never() { try { localStorage.setItem('ks_review_prompt_never', '1'); } catch (e) {} close(); }
    function onKey(e) { if (e.key === 'Escape') later(); }

    card.querySelector('.ksrp-x').addEventListener('click', later);
    card.querySelector('[data-a="later"]').addEventListener('click', later);
    card.querySelector('[data-a="never"]').addEventListener('click', never);
    /* Cliquer « Laisser mon avis » vaut reponse : on ne represente pas la
       carte a la prochaine visite, meme si le formulaire n'est pas envoye
       (avis.html posera ks_review_left a l'envoi reel). */
    card.querySelector('.ksrp-go').addEventListener('click', function () {
      try { localStorage.setItem('ks_review_prompt_later', String(Date.now())); } catch (e) {}
    });
    document.addEventListener('keydown', onKey);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── Declenchement ─────────────────────────────────────────────── */

  function arm() { setTimeout(show, DELAY_MS); }

  function boot() {
    if (consentSettled()) { arm(); return; }
    /* Le bandeau cookies passe avant tout le reste : deux surcouches
       empilees, c'est illisible, et le consentement doit rester le
       premier choix propose. */
    document.addEventListener('ks-cookie-consent-changed', function once() {
      document.removeEventListener('ks-cookie-consent-changed', once);
      arm();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
