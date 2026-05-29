/* ═══════════════════════════════════════════════════════════════════
   ks-tap-translate.js — Pop-up de traduction au tap sur un mot coréen.
   ──────────────────────────────────────────────────────────────────
   - Délégation d'événement : pas de DOM modifié
   - Au tap sur du texte coréen, on identifie le mot via Range API
   - Lookup dans KSDict (avec fallback particules)
   - Popup positionné près du tap avec :
     · Mot coréen + romanisation + classe grammaticale
     · Traduction française
     · Bouton audio (utilise speak() du site)
     · Bouton "Ajouter à ma liste" (ks_saved_words)
     · Si pas trouvé : message "Pas dans le dico"

   Pages exclues : dashboard, profil, réglages, hangeul, etc.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'classement.html':1, 'statistiques.html':1,
    'trophees.html':1, 'aide.html':1, 'ressources.html':1,
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'favoris.html':1, 'notes.html':1, 'hangeul.html':1,
    'prononciation.html':1, 'revision.html':1, 'challenge.html':1
  };
  function currentPath(){
    return location.pathname.split('/').pop() || 'index.html';
  }
  if (EXCLUDED[currentPath()]) return;

  /* Regex Hangul : caractères syllabiques coréens */
  var HANGUL_CHAR = /[가-힣]/;
  var HANGUL_RUN = /[가-힣]+/g;

  /* Charge le dictionnaire à la demande */
  function ensureDict(cb){
    if (window.KSDict) return cb();
    if (document.getElementById('ks-dict-script')) {
      var i = setInterval(function(){
        if (window.KSDict) { clearInterval(i); cb(); }
      }, 50);
      return;
    }
    var s = document.createElement('script');
    s.id = 'ks-dict-script';
    s.src = 'ks-dictionary.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  /* ── CSS ──────────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-tt-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-tt-css';
    s.textContent = [
      '.ks-tt-pop{',
        'position:absolute;z-index:9550;',
        'background:#fff;color:#111;border-radius:14px;padding:0;',
        'box-shadow:0 12px 32px rgba(0,0,0,.18);',
        'border:1px solid rgba(201,169,110,.35);',
        'min-width:240px;max-width:300px;',
        'opacity:0;transform:translateY(6px) scale(.96);',
        'transition:opacity .2s,transform .2s;',
        'overflow:hidden;font-family:inherit',
      '}',
      '.ks-tt-pop.show{opacity:1;transform:translateY(0) scale(1)}',
      '[data-theme="dark"] .ks-tt-pop{background:#152030;color:#f7f8fa;border-color:rgba(201,169,110,.4)}',

      '.ks-tt-head{',
        'padding:12px 14px 10px;border-bottom:1px solid rgba(0,0,0,.06);',
        'display:flex;align-items:flex-start;gap:10px',
      '}',
      '[data-theme="dark"] .ks-tt-head{border-color:rgba(255,255,255,.08)}',
      '.ks-tt-word-block{flex:1;min-width:0}',
      '.ks-tt-word{',
        'font-family:"Playfair Display",Georgia,serif;font-size:20px;font-weight:700;',
        'color:#C9A96E;line-height:1.2',
      '}',
      '.ks-tt-rom{font-size:11.5px;color:#6b7280;font-style:italic;margin-top:2px}',
      '[data-theme="dark"] .ks-tt-rom{color:rgba(247,248,250,.55)}',
      '.ks-tt-pos{',
        'display:inline-block;font-size:9px;font-weight:800;letter-spacing:.06em;',
        'text-transform:uppercase;padding:2px 5px;border-radius:5px;',
        'background:rgba(201,169,110,.13);color:#C9A96E;margin-top:4px',
      '}',
      '.ks-tt-audio{',
        'flex-shrink:0;width:34px;height:34px;border-radius:50%;',
        'background:rgba(201,169,110,.12);border:none;cursor:pointer;',
        'color:#C9A96E;display:flex;align-items:center;justify-content:center;',
        'transition:background .15s;-webkit-tap-highlight-color:transparent',
      '}',
      '.ks-tt-audio:hover{background:rgba(201,169,110,.22)}',
      '.ks-tt-audio.playing{background:#C9A96E;color:#0a1220}',
      '.ks-tt-audio svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',

      '.ks-tt-body{padding:12px 14px}',
      '.ks-tt-fr{font-size:14px;color:#111;line-height:1.4;font-weight:600}',
      '[data-theme="dark"] .ks-tt-fr{color:#f7f8fa}',
      '.ks-tt-note{font-size:11px;color:#6b7280;margin-top:6px;font-style:italic}',
      '[data-theme="dark"] .ks-tt-note{color:rgba(247,248,250,.55)}',

      '.ks-tt-actions{',
        'display:flex;gap:6px;padding:10px 14px 12px;border-top:1px solid rgba(0,0,0,.06)',
      '}',
      '[data-theme="dark"] .ks-tt-actions{border-color:rgba(255,255,255,.08)}',
      '.ks-tt-btn{',
        'flex:1;padding:8px 10px;border-radius:9px;font-size:11.5px;font-weight:700;',
        'cursor:pointer;font-family:inherit;border:1.5px solid rgba(0,0,0,.08);',
        'background:transparent;color:inherit;',
        '-webkit-tap-highlight-color:transparent;transition:all .15s;',
        'display:inline-flex;align-items:center;justify-content:center;gap:5px',
      '}',
      '.ks-tt-btn:hover{border-color:#C9A96E;color:#C9A96E}',
      '.ks-tt-btn.saved{background:rgba(34,197,94,.12);color:#16A34A;border-color:rgba(34,197,94,.3)}',
      '.ks-tt-btn.primary{background:#C9A96E;color:#0a1220;border-color:#C9A96E}',
      '.ks-tt-btn.primary:hover{background:#D4B582;color:#0a1220}',
      '.ks-tt-btn svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}',

      '[data-theme="dark"] .ks-tt-btn{border-color:rgba(255,255,255,.12)}',

      /* Flèche du pop */
      '.ks-tt-arrow{',
        'position:absolute;width:12px;height:12px;background:#fff;',
        'border:1px solid rgba(201,169,110,.35);',
        'transform:rotate(45deg);bottom:-7px;left:50%;margin-left:-6px;',
        'border-top:none;border-left:none',
      '}',
      '[data-theme="dark"] .ks-tt-arrow{background:#152030;border-color:rgba(201,169,110,.4)}',
      '.ks-tt-pop.below .ks-tt-arrow{',
        'top:-7px;bottom:auto;border:1px solid rgba(201,169,110,.35);',
        'border-bottom:none;border-right:none',
      '}',

      /* Indicateur subtil au hover (desktop seulement) */
      '@media (hover:hover){',
        '.ks-tt-hint{',
          'position:fixed;bottom:140px;right:16px;',
          'background:rgba(15,27,45,.92);color:#fff;',
          'padding:8px 14px;border-radius:20px;font-size:11.5px;font-weight:600;',
          'pointer-events:none;opacity:0;transition:opacity .25s;',
          'z-index:9540;display:flex;align-items:center;gap:6px',
        '}',
        '.ks-tt-hint.show{opacity:1}',
        '.ks-tt-hint svg{width:13px;height:13px;fill:none;stroke:#C9A96E;stroke-width:2}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Détecte le mot cor̃éen à une position dans un texte ──── */
  function extractKoreanWordFromText(text, offset){
    if (!text || offset < 0 || offset >= text.length) return null;
    if (!HANGUL_CHAR.test(text.charAt(offset))) {
      /* Si offset est sur un espace, essaye la position précédente */
      if (offset > 0 && HANGUL_CHAR.test(text.charAt(offset-1))) offset--;
      else return null;
    }
    /* Étend vers la gauche tant qu'on a du Hangul (ou un caractère
       coréen valide : underscore non, mais espaces de mots oui) */
    var start = offset;
    while (start > 0 && HANGUL_CHAR.test(text.charAt(start - 1))) start--;
    /* Étend vers la droite */
    var end = offset;
    while (end < text.length - 1 && HANGUL_CHAR.test(text.charAt(end + 1))) end++;
    var word = text.substring(start, end + 1);
    return word.length > 0 ? word : null;
  }

  /* ── Trouve le mot à partir d'un événement clic ─────────────── */
  function getWordAtEvent(e){
    /* Utilise caretRangeFromPoint si dispo (Webkit/Chrome) */
    var range = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else if (document.caretPositionFromPoint) {
      var pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    }
    if (!range || !range.startContainer) return null;
    if (range.startContainer.nodeType !== 3 /* Text */) return null;
    var text = range.startContainer.nodeValue || '';
    return {
      word: extractKoreanWordFromText(text, range.startOffset),
      node: range.startContainer
    };
  }

  /* ── Position du popup près du tap ──────────────────────────── */
  function positionPopup(pop, x, y){
    document.body.appendChild(pop);
    var rect = pop.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var pad = 12;

    /* Préfère placer au-dessus du tap, à ~20px de distance */
    var top = y + window.scrollY - rect.height - 20;
    var left = x + window.scrollX - rect.width / 2;
    var below = false;

    /* Si pas assez de place en haut → placer en dessous */
    if (top < window.scrollY + pad) {
      top = y + window.scrollY + 20;
      below = true;
      pop.classList.add('below');
    }
    /* Bornes horizontales */
    if (left < pad) left = pad;
    if (left + rect.width > vw - pad) left = vw - rect.width - pad;

    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  /* ── Sauvegarde / lookup des mots persos ───────────────────── */
  function getSaved(){
    try { return JSON.parse(localStorage.getItem('ks_saved_words') || '[]'); }
    catch(e){ return []; }
  }
  function isSaved(word){
    return getSaved().some(function(w){ return w.ko === word; });
  }
  function saveWord(entry){
    try {
      var arr = getSaved();
      if (arr.some(function(w){ return w.ko === entry.ko; })) return false;
      arr.unshift(entry);
      if (arr.length > 500) arr.length = 500;
      localStorage.setItem('ks_saved_words', JSON.stringify(arr));
      return true;
    } catch(e){ return false; }
  }
  function unsaveWord(word){
    try {
      var arr = getSaved().filter(function(w){ return w.ko !== word; });
      localStorage.setItem('ks_saved_words', JSON.stringify(arr));
    } catch(e){}
  }

  /* ── Création du popup ─────────────────────────────────────── */
  function closePop(){
    var existing = document.querySelector('.ks-tt-pop');
    if (existing) {
      existing.classList.remove('show');
      setTimeout(function(){ if (existing.parentNode) existing.remove(); }, 200);
    }
  }

  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }

  var AUDIO_SVG = '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  var SAVE_SVG = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
  var PLUS_SVG = '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  var CLOSE_SVG = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function showPop(word, x, y){
    closePop();
    var lookup = window.KSDict.lookupFlex(word);

    var pop = document.createElement('div');
    pop.className = 'ks-tt-pop';

    if (lookup) {
      var entry = lookup.entry;
      var matched = lookup.matched;
      var particleNote = lookup.particle
        ? '<div class="ks-tt-note">+ particule « ' + escapeHtml(lookup.particle) + ' »</div>'
        : '';
      var alreadySaved = isSaved(matched);
      pop.innerHTML =
        '<div class="ks-tt-head">' +
          '<div class="ks-tt-word-block">' +
            '<div class="ks-tt-word">' + escapeHtml(matched) + '</div>' +
            (entry.rom ? '<div class="ks-tt-rom">' + escapeHtml(entry.rom) + '</div>' : '') +
            (entry.pos ? '<span class="ks-tt-pos">' + escapeHtml(entry.pos) + '</span>' : '') +
          '</div>' +
          '<button class="ks-tt-audio" data-action="play" aria-label="Écouter">' + AUDIO_SVG + '</button>' +
        '</div>' +
        '<div class="ks-tt-body">' +
          '<div class="ks-tt-fr">' + escapeHtml(entry.fr) + '</div>' +
          particleNote +
        '</div>' +
        '<div class="ks-tt-actions">' +
          '<button class="ks-tt-btn ' + (alreadySaved ? 'saved' : 'primary') + '" data-action="save">' +
            (alreadySaved ? SAVE_SVG + ' Dans ma liste' : PLUS_SVG + ' Ajouter') +
          '</button>' +
          '<button class="ks-tt-btn" data-action="close">' + CLOSE_SVG + ' Fermer</button>' +
        '</div>' +
        '<div class="ks-tt-arrow"></div>';
    } else {
      pop.innerHTML =
        '<div class="ks-tt-head">' +
          '<div class="ks-tt-word-block">' +
            '<div class="ks-tt-word">' + escapeHtml(word) + '</div>' +
            '<div class="ks-tt-rom">Pas dans le dictionnaire</div>' +
          '</div>' +
          '<button class="ks-tt-audio" data-action="play" aria-label="Écouter">' + AUDIO_SVG + '</button>' +
        '</div>' +
        '<div class="ks-tt-body">' +
          '<div class="ks-tt-fr" style="font-style:italic;color:#9ca3af">Aucune traduction trouvée pour ce mot.</div>' +
          '<div class="ks-tt-note">Le dictionnaire couvre ~250 mots de niveau A1/A2. Plus à venir.</div>' +
        '</div>' +
        '<div class="ks-tt-actions">' +
          '<button class="ks-tt-btn" data-action="close">' + CLOSE_SVG + ' Fermer</button>' +
        '</div>' +
        '<div class="ks-tt-arrow"></div>';
    }

    positionPopup(pop, x, y);
    requestAnimationFrame(function(){ pop.classList.add('show'); });

    /* Gestion des clics interne au popup */
    pop.addEventListener('click', function(e){
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      e.stopPropagation();
      var action = btn.getAttribute('data-action');
      if (action === 'play') {
        if (typeof speak === 'function') {
          speak(lookup ? lookup.matched : word, btn);
        }
      } else if (action === 'save' && lookup) {
        var matched = lookup.matched;
        var ent = lookup.entry;
        if (isSaved(matched)) {
          unsaveWord(matched);
          btn.classList.remove('saved');
          btn.classList.add('primary');
          btn.innerHTML = PLUS_SVG + ' Ajouter';
        } else {
          saveWord({
            ko: matched,
            fr: ent.fr,
            rom: ent.rom || '',
            pos: ent.pos || '',
            addedAt: Date.now(),
            fromPage: currentPath()
          });
          btn.classList.remove('primary');
          btn.classList.add('saved');
          btn.innerHTML = SAVE_SVG + ' Dans ma liste';
        }
      } else if (action === 'close') {
        closePop();
      }
    });
  }

  /* ── Délégation des clics sur du texte coréen ───────────────── */
  function handleClick(e){
    /* Ignore les clics sur des éléments interactifs */
    var interactive = e.target.closest('a, button, input, textarea, select, [onclick], [role="button"], .speak-btn, .bubble-audio');
    if (interactive) {
      /* Si on clique sur un bouton speak, on ferme le popup */
      if (!e.target.closest('.ks-tt-pop')) closePop();
      return;
    }
    /* Si on clique HORS du popup, on le ferme */
    if (!e.target.closest('.ks-tt-pop')) closePop();

    var info = getWordAtEvent(e);
    if (!info || !info.word) return;
    /* Filtre : doit être au moins 1 caractère Hangul, max 20 (sinon
       c'est probablement une phrase entière, pas un mot) */
    if (info.word.length > 20) return;

    showPop(info.word, e.clientX, e.clientY);
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init(){
    injectCSS();
    ensureDict(function(){
      document.addEventListener('click', handleClick);
      /* Touch handling pour mobile : un seul tap déclenche */
      document.addEventListener('touchend', function(e){
        /* Compatible avec le click — laisse passer */
      });
      /* Ferme le popup au scroll */
      window.addEventListener('scroll', function(){
        if (document.querySelector('.ks-tt-pop.show')) closePop();
      }, { passive: true });
      /* Esc pour fermer */
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closePop();
      });

      /* Hint subtil au premier chargement (une fois) */
      try {
        if (!localStorage.getItem('ks_tt_hint_seen')) {
          var hint = document.createElement('div');
          hint.className = 'ks-tt-hint';
          hint.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Tap sur un mot coréen pour la traduction';
          document.body.appendChild(hint);
          setTimeout(function(){ hint.classList.add('show'); }, 1200);
          setTimeout(function(){
            hint.classList.remove('show');
            setTimeout(function(){ if (hint.parentNode) hint.remove(); }, 300);
          }, 5500);
          localStorage.setItem('ks_tt_hint_seen', '1');
        }
      } catch(e) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API publique */
  window.KSTapTranslate = {
    show: showPop,
    close: closePop,
    saved: getSaved,
    saveWord: saveWord,
    unsaveWord: unsaveWord
  };
})();
