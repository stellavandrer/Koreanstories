/* ═══════════════════════════════════════════════════════════════════
   ks-nav.js — Navigation intelligente du parcours.
   ──────────────────────────────────────────────────────────────────
   Améliore l'expérience de navigation entre les leçons :

   1. ksSmartBack() — fonction globale qui remplace history.back().
      Si le referrer est interne au site, on revient normalement.
      Sinon (lien direct, refresh, PWA), on retourne vers cours.html
      avec la leçon actuelle mise en évidence.

   2. Intercepte automatiquement tous les boutons "history.back()"
      existants sur la page pour utiliser la version smart.

   3. Injecte une barre "Précédent / Suivant" en bas de chaque leçon
      utilisant KSCurriculum pour trouver les activités voisines
      (saute les "Bientôt").

   4. Sauvegarde la dernière activité visitée dans sessionStorage
      pour que cours.html puisse scroller automatiquement à la
      bonne position au retour.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Pages où le système ne s'active PAS ──────────────────────── */
  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'histoires.html':1, 'challenge.html':1,
    'classement.html':1, 'revision.html':1, 'statistiques.html':1,
    'trophees.html':1, 'aide.html':1, 'ressources.html':1,
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'vocabulaire.html':1, 'hangeul.html':1,
    'histoires.html':1, 'exercice.html':1, 'favoris.html':1
  };

  function currentPath(){
    return location.pathname.split('/').pop() || 'index.html';
  }
  function isLessonPage(){
    var p = currentPath();
    if (EXCLUDED[p]) return false;
    return /^(lecon|exercice|quiz|histoire|anecdote|conseil|chanson|pro)/.test(p);
  }

  /* ── SMART BACK ────────────────────────────────────────────────
     Stratégie :
     1. Si le referrer vient du même site → history.back() classique
     2. Sinon, on retourne vers la meilleure destination contextuelle
        (cours.html pour les leçons curriculum, app.html pour le reste) */
  function isInternalReferrer(){
    try {
      if (!document.referrer) return false;
      var r = new URL(document.referrer);
      return r.origin === location.origin;
    } catch (e) { return false; }
  }

  function smartBackTarget(){
    var p = currentPath();
    /* Page de leçon/exercice/quiz/histoire curriculum → cours.html */
    if (/^(lecon|exercice|quiz|histoire)/.test(p)) return 'cours.html';
    /* Page culturelle (anecdote/conseil/chanson) → cours.html aussi
       (elles y sont listées en bas) */
    if (/^(anecdote|conseil|chanson)/.test(p)) return 'cours.html';
    /* Page pro → app.html */
    if (/^pro/.test(p)) return 'app.html';
    return 'app.html';
  }

  window.ksSmartBack = function(){
    /* Mémorise la dernière activité visitée pour le scroll automatique
       au retour sur cours.html */
    try { sessionStorage.setItem('ks_nav_from', currentPath()); } catch (e) {}

    if (isInternalReferrer() && history.length > 1) {
      history.back();
      return;
    }
    location.href = smartBackTarget();
  };

  /* ── Intercept des boutons back existants ───────────────────── */
  function interceptBackButtons(){
    /* Boutons avec onclick="history.back()" */
    var sel = '[onclick*="history.back"]';
    document.querySelectorAll(sel).forEach(function(el){
      el.setAttribute('onclick', 'ksSmartBack()');
    });
    /* Liens et boutons .back-btn / .bar-back qui pointent vers cours.html
       — on les laisse tels quels, mais on mémorise pour scroll */
    var backLinks = document.querySelectorAll('a.bar-back, a.back-btn, a[href="cours.html"]');
    backLinks.forEach(function(el){
      el.addEventListener('click', function(){
        try { sessionStorage.setItem('ks_nav_from', currentPath()); } catch(e){}
      });
    });
  }

  /* ── Charge KSCurriculum à la demande ────────────────────────── */
  function ensureCurriculum(cb){
    if (window.KSCurriculum) return cb();
    if (document.getElementById('ks-curriculum-script')) {
      var wait = setInterval(function(){
        if (window.KSCurriculum) { clearInterval(wait); cb(); }
      }, 50);
      return;
    }
    var s = document.createElement('script');
    s.id = 'ks-curriculum-script';
    s.src = 'ks-curriculum.js';
    s.onload = cb;
    s.onerror = function(){ /* tant pis, pas de prev/next */ };
    document.head.appendChild(s);
  }

  /* ── Trouve prev/next dans le curriculum ──────────────────────── */
  function findNeighbors(){
    if (!window.KSCurriculum) return null;
    var p = currentPath();
    var acts = KSCurriculum.activities;
    var idx = -1;
    for (var i = 0; i < acts.length; i++) {
      if (acts[i].href === p) { idx = i; break; }
    }
    if (idx === -1) return null;

    var prev = null, next = null;
    for (var j = idx - 1; j >= 0; j--) {
      if (!KSCurriculum.isComingSoon(acts[j].href)) { prev = acts[j]; break; }
    }
    for (var k = idx + 1; k < acts.length; k++) {
      if (!KSCurriculum.isComingSoon(acts[k].href)) { next = acts[k]; break; }
    }
    return { current: acts[idx], prev: prev, next: next, position: idx + 1, total: acts.length };
  }

  /* ── CSS de la barre prev/next ────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-nav-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-nav-css';
    s.textContent = [
      '.ks-nav-pair{',
        'display:grid;grid-template-columns:1fr 1fr;gap:.7rem;',
        'margin:1.6rem 0 1rem;padding:0',
      '}',
      '.ks-nav-pair > a, .ks-nav-pair > div.placeholder{',
        'display:flex;align-items:center;gap:.6rem;',
        'background:var(--surf,#fff);border:1px solid var(--bd,#e5e7eb);',
        'border-radius:14px;padding:.8rem .9rem;',
        'text-decoration:none;color:inherit;transition:all .2s;',
        'min-height:64px',
      '}',
      '.ks-nav-pair > a:hover{',
        'border-color:#C9A96E;transform:translateY(-2px);',
        'box-shadow:0 6px 16px rgba(0,0,0,.06)',
      '}',
      '.ks-nav-pair > div.placeholder{opacity:.35;cursor:default}',
      '.ks-nav-arrow{',
        'flex-shrink:0;width:36px;height:36px;border-radius:10px;',
        'background:rgba(201,169,110,.12);color:#C9A96E;',
        'display:flex;align-items:center;justify-content:center',
      '}',
      '.ks-nav-arrow svg{width:18px;height:18px;fill:none;stroke:currentColor;',
        'stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}',
      '.ks-nav-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:.15rem}',
      '.ks-nav-lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;',
        'letter-spacing:.1em;color:var(--tx-muted,#6B7280);line-height:1}',
      '.ks-nav-ttl{font-size:.82rem;font-weight:600;line-height:1.3;',
        'overflow:hidden;text-overflow:ellipsis;display:-webkit-box;',
        '-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--tx,#111)}',
      '.ks-nav-next{flex-direction:row-reverse;text-align:right}',
      '[data-theme="dark"] .ks-nav-pair > a,[data-theme="dark"] .ks-nav-pair > div.placeholder{',
        'background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)',
      '}',
      /* Indicateur de position dans le parcours */
      '.ks-nav-position{',
        'text-align:center;font-size:.7rem;font-weight:700;color:var(--tx-muted,#6B7280);',
        'text-transform:uppercase;letter-spacing:.1em;margin:.4rem 0',
      '}',
      '@media (max-width:480px){',
        '.ks-nav-pair{grid-template-columns:1fr;gap:.5rem}',
        '.ks-nav-pair > a, .ks-nav-pair > div.placeholder{min-height:56px}',
        '.ks-nav-ttl{font-size:.8rem;-webkit-line-clamp:1}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Trouve le bon endroit pour injecter la barre prev/next ──── */
  function findInsertionPoint(){
    /* Le mieux : après le contenu principal de la page (avant les nav bas) */
    var done = document.getElementById('doneBtn');
    if (done && done.parentNode) return done.parentNode;
    var wrap = document.querySelector('.wrap, main .main > div[style*="padding"], main > div[style*="padding"]');
    if (wrap) return wrap;
    return document.querySelector('main') || document.body;
  }

  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }

  function injectPrevNext(){
    var n = findNeighbors();
    if (!n) return;

    var target = findInsertionPoint();
    if (!target) return;
    if (target.querySelector('.ks-nav-pair')) return;

    injectCSS();

    var ARROW_L = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
    var ARROW_R = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';

    var prevHtml = n.prev
      ? '<a href="' + n.prev.href + '" class="ks-nav-prev" title="' + escapeHtml(n.prev.title) + '">' +
          '<div class="ks-nav-arrow">' + ARROW_L + '</div>' +
          '<div class="ks-nav-body">' +
            '<div class="ks-nav-lbl">Précédent</div>' +
            '<div class="ks-nav-ttl">' + escapeHtml(n.prev.title) + '</div>' +
          '</div>' +
        '</a>'
      : '<div class="placeholder">' +
          '<div class="ks-nav-arrow">' + ARROW_L + '</div>' +
          '<div class="ks-nav-body">' +
            '<div class="ks-nav-lbl">Début</div>' +
            '<div class="ks-nav-ttl">du parcours</div>' +
          '</div>' +
        '</div>';

    var nextHtml = n.next
      ? '<a href="' + n.next.href + '" class="ks-nav-next" title="' + escapeHtml(n.next.title) + '">' +
          '<div class="ks-nav-arrow">' + ARROW_R + '</div>' +
          '<div class="ks-nav-body">' +
            '<div class="ks-nav-lbl">Suivant</div>' +
            '<div class="ks-nav-ttl">' + escapeHtml(n.next.title) + '</div>' +
          '</div>' +
        '</a>'
      : '<a href="cours.html" class="ks-nav-next" title="Retour au parcours">' +
          '<div class="ks-nav-arrow">' + ARROW_R + '</div>' +
          '<div class="ks-nav-body">' +
            '<div class="ks-nav-lbl">Fin du parcours</div>' +
            '<div class="ks-nav-ttl">Voir tout le parcours</div>' +
          '</div>' +
        '</a>';

    var container = document.createElement('div');
    container.innerHTML =
      '<div class="ks-nav-position">' +
        n.current.lvlName + ' · Étape ' + n.position + ' sur ' + n.total +
      '</div>' +
      '<div class="ks-nav-pair">' + prevHtml + nextHtml + '</div>';

    /* Injection : on cible le contenu principal */
    target.appendChild(container);
  }

  /* ── Mémo de la dernière activité (pour scroll cours.html) ──── */
  function rememberCurrent(){
    var p = currentPath();
    if (isLessonPage()) {
      try { sessionStorage.setItem('ks_nav_from', p); } catch (e) {}
    }
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  function init(){
    interceptBackButtons();
    rememberCurrent();
    if (isLessonPage()) {
      ensureCurriculum(injectPrevNext);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
