/* ═══════════════════════════════════════════════════════════════════
   ks-favorites.js — Système de favoris pour les leçons.
   ──────────────────────────────────────────────────────────────────
   Auto-injection d'un bouton "Marque-page" sur chaque page de leçon,
   exercice, quiz, histoire, anecdote, conseil ou chanson.

   Storage : ks_favorites (JSON array, synchronisé Firebase via
   ks-sync.js qui pousse tous les ks_*).

   Format d'un favori :
   {
     href: 'lecon5.html',
     title: 'Salutations & se présenter',
     level: 'A1',
     type: 'lecon',
     addedAt: 1738056000000
   }
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Pages où le bouton n'apparaît PAS ────────────────────────── */
  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'lecture.html':1, 'challenge.html':1,
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
    /* Doit commencer par un préfixe connu */
    return /^(lecon|exercice|quiz|histoire|anecdote|conseil|chanson|pro)/.test(p);
  }

  /* ── Storage helpers ──────────────────────────────────────────── */
  function getFavorites(){
    try { return JSON.parse(localStorage.getItem('ks_favorites') || '[]'); }
    catch(e) { return []; }
  }
  function setFavorites(arr){
    try { localStorage.setItem('ks_favorites', JSON.stringify(arr)); } catch(e){}
  }
  function isCurrentFavorite(){
    var p = currentPath();
    return getFavorites().some(function(f){ return f.href === p; });
  }

  /* ── Métadonnées de la page courante ──────────────────────────── */
  function detectType(p){
    if (p.indexOf('lecon')   === 0) return 'lecon';
    if (p.indexOf('exercice')=== 0) return 'exercice';
    if (p.indexOf('quiz')    === 0) return 'quiz';
    if (p.indexOf('histoire')=== 0) return 'histoire';
    if (p.indexOf('anecdote')=== 0) return 'anecdote';
    if (p.indexOf('conseil') === 0) return 'conseil';
    if (p.indexOf('chanson') === 0) return 'chanson';
    if (p.indexOf('pro')     === 0) return 'pro';
    return 'autre';
  }
  function detectLevel(){
    /* Cherche un badge de niveau dans le DOM */
    var els = document.querySelectorAll('.pill, .lvl-pill, .level-pill, .badge, [class*="level"], .xp-badge');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim().toUpperCase();
      var m = t.match(/\b(HANGEUL|A1|A2|B1|B2|C1)\b/);
      if (m) return m[1];
    }
    return '';
  }
  function detectTitle(){
    /* Priorité : <title> sans le suffixe "— Korean Stories" */
    var t = document.title || '';
    t = t.replace(/\s*[–—\-]\s*Korean Stories.*$/i, '').trim();
    if (t) return t;
    /* Fallback : premier h2/h1 du contenu */
    var h = document.querySelector('h2, h1');
    if (h) return (h.textContent || '').trim();
    return currentPath();
  }

  /* ── Toggle action ────────────────────────────────────────────── */
  function toggleFavorite(){
    var p = currentPath();
    var favs = getFavorites();
    var idx = -1;
    for (var i = 0; i < favs.length; i++) { if (favs[i].href === p) { idx = i; break; } }

    if (idx >= 0) {
      favs.splice(idx, 1);
      setFavorites(favs);
      showToast('Retiré des favoris', false);
    } else {
      favs.unshift({
        href: p,
        title: detectTitle(),
        level: detectLevel(),
        type: detectType(p),
        addedAt: Date.now()
      });
      /* Plafond 200 favoris pour garder le localStorage léger */
      if (favs.length > 200) favs.length = 200;
      setFavorites(favs);
      showToast('Ajouté aux favoris', true);
    }
    updateButton();
  }

  /* ── UI du bouton ────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-fav-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-fav-css';
    s.textContent = [
      '.ks-fav-btn{',
        'background:none;border:none;cursor:pointer;',
        /* Tap target 40×40 minimum pour confort mobile (recommandation WCAG) */
        'min-width:40px;min-height:40px;padding:8px;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'color:currentColor;opacity:.55;transition:opacity .2s,transform .2s;',
        'border-radius:10px;-webkit-tap-highlight-color:transparent',
      '}',
      '.ks-fav-btn:hover{opacity:1;background:rgba(201,169,110,.12)}',
      '.ks-fav-btn:active{transform:scale(.9)}',
      '.ks-fav-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;',
        'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:fill .2s}',
      '.ks-fav-btn.on{opacity:1;color:#C9A96E}',
      '.ks-fav-btn.on svg{fill:#C9A96E;stroke:#C9A96E}',
      /* Animation pop quand on add */
      '@keyframes ksFavPop{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}',
      '.ks-fav-btn.pop svg{animation:ksFavPop .35s ease}',

      /* Floating fallback button (si pas de barre nav détectée) */
      '.ks-fav-float{',
        'position:fixed;top:14px;right:14px;z-index:1000;',
        'width:42px;height:42px;border-radius:50%;',
        'background:var(--surf,#fff);border:1px solid var(--bd,#e5e7eb);',
        'box-shadow:0 4px 12px rgba(0,0,0,.12);',
        'display:flex;align-items:center;justify-content:center;cursor:pointer',
      '}',

      /* Toast */
      '.ks-fav-toast{',
        'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);',
        'background:#0F1B2D;color:#fff;padding:12px 20px;',
        'border-radius:12px;font-size:13px;font-weight:600;',
        'box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:9999;',
        'opacity:0;transition:opacity .25s,transform .25s;',
        'display:flex;align-items:center;gap:8px;pointer-events:none;',
        'border:1px solid rgba(201,169,110,.25)',
      '}',
      '.ks-fav-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.ks-fav-toast svg{width:16px;height:16px;fill:#C9A96E;stroke:#C9A96E;stroke-width:2}',
      '.ks-fav-toast.removed svg{fill:none;stroke:rgba(247,248,250,.6)}'
    ].join('');
    document.head.appendChild(s);
  }

  var BTN_HTML = '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

  function updateButton(){
    var btn = document.querySelector('.ks-fav-btn');
    if (!btn) return;
    var on = isCurrentFavorite();
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('title', on ? 'Retirer des favoris' : 'Ajouter aux favoris');
  }

  function injectButton(){
    var bar = document.querySelector('nav.bar, .bar');
    if (bar && !bar.querySelector('.ks-fav-btn')) {
      var btn = document.createElement('button');
      btn.className = 'ks-fav-btn';
      btn.innerHTML = BTN_HTML;
      btn.onclick = function(){ toggleFavorite(); btn.classList.add('pop'); setTimeout(function(){btn.classList.remove('pop');}, 400); };
      /* Cherche le conteneur droit (.bar-r) — c'est la structure des
         leçons type lecon5/lecon10. Sinon, on insère avant le bouton
         de thème détecté (anecdote/conseil/histoire). Sinon à la fin. */
      var barR = bar.querySelector('.bar-r');
      var themeBtn = bar.querySelector('.theme-btn, .bar-theme');
      if (barR) {
        /* Insère AU DÉBUT de .bar-r (avant le thème) */
        barR.insertBefore(btn, barR.firstChild);
      } else if (themeBtn) {
        bar.insertBefore(btn, themeBtn);
      } else {
        bar.appendChild(btn);
      }
      /* Signale à design.css que la barre porte des outils — sur petit
         écran le logo centré est masqué pour éviter le chevauchement */
      bar.classList.add('bar-has-tools');
      updateButton();
      return;
    }
    /* Fallback : bouton flottant en haut à droite */
    if (!document.querySelector('.ks-fav-float')) {
      var floatBtn = document.createElement('button');
      floatBtn.className = 'ks-fav-btn ks-fav-float';
      floatBtn.innerHTML = BTN_HTML;
      floatBtn.onclick = function(){ toggleFavorite(); floatBtn.classList.add('pop'); setTimeout(function(){floatBtn.classList.remove('pop');}, 400); };
      document.body.appendChild(floatBtn);
      updateButton();
    }
  }

  /* ── Toast ────────────────────────────────────────────────────── */
  function showToast(msg, isAdd){
    var existing = document.querySelector('.ks-fav-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'ks-fav-toast' + (isAdd ? '' : ' removed');
    t.innerHTML = BTN_HTML + '<span>' + msg + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){
      t.classList.remove('show');
      setTimeout(function(){ if (t.parentNode) t.remove(); }, 300);
    }, 1800);
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  function init(){
    if (!isLessonPage()) return;
    injectCSS();
    injectButton();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── API publique ─────────────────────────────────────────────── */
  window.KSFavorites = {
    list: getFavorites,
    set: setFavorites,
    isFavorite: function(href){
      return getFavorites().some(function(f){ return f.href === href; });
    },
    add: function(href){
      var favs = getFavorites();
      if (favs.some(function(f){ return f.href === href; })) return false;
      favs.unshift({ href: href, title: href, addedAt: Date.now() });
      setFavorites(favs);
      return true;
    },
    remove: function(href){
      var favs = getFavorites();
      var i = favs.findIndex(function(f){ return f.href === href; });
      if (i < 0) return false;
      favs.splice(i, 1);
      setFavorites(favs);
      return true;
    },
    clear: function(){ setFavorites([]); }
  };
})();
