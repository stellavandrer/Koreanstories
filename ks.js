/**
 * Korean Stories — Shared JS utilities
 * Loaded by all pages for consistent behavior.
 */

/* ── Global UX polish — injected on every page ────────────────────── */
(function injectPolish() {
  if (document.getElementById('ks-polish-css')) return;
  var css = [
    /* iOS: no font auto-inflation, no blue tap flash */
    'html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}',
    '*{-webkit-tap-highlight-color:transparent}',
    /* Brand-coloured text selection */
    '::selection{background:rgba(201,169,110,.28)}',
    /* Keyboard focus ring (accessibility) — only on keyboard nav */
    ':focus-visible{outline:2px solid #C9A96E;outline-offset:2px;border-radius:3px}',
    'a:focus:not(:focus-visible),button:focus:not(:focus-visible){outline:none}',
    /* Tactile press feedback on interactive elements (mobile + desktop) */
    'a:active,button:active,[role="button"]:active,[onclick]:active{',
      'transition:transform .04s ease}',
    /* Discreet custom scrollbar on desktop pointers */
    '@media(pointer:fine){',
      '::-webkit-scrollbar{width:10px;height:10px}',
      '::-webkit-scrollbar-track{background:transparent}',
      '::-webkit-scrollbar-thumb{background:rgba(140,140,140,.34);',
        'border-radius:8px;border:2px solid transparent;background-clip:padding-box}',
      '::-webkit-scrollbar-thumb:hover{background:rgba(140,140,140,.55);background-clip:padding-box}',
    '}',
    /* Respect the OS "reduce motion" setting */
    '@media(prefers-reduced-motion:reduce){',
      '*,*::before,*::after{',
        'animation-duration:.001ms!important;animation-iteration-count:1!important;',
        'transition-duration:.001ms!important;scroll-behavior:auto!important}',
    '}',
    ''
  ].join('');
  var s = document.createElement('style');
  s.id = 'ks-polish-css';
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
})();

/* ── Dark Mode Toggle ─────────────────────────────────────────────── */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('ks_theme', next); } catch(e) {}
  document.querySelectorAll('[data-dark-icon]').forEach(el => {
    el.setAttribute('data-dark-icon', next);
  });
}
// Aliases for backwards compatibility — exposed on window for onclick handlers
window.ksDarkToggle = toggleTheme;
window.toggleDarkGlobal = toggleTheme;

/* ── XP / Streak from localStorage ────────────────────────────────── */
function ksGetXP()     { try { return parseInt(localStorage.getItem('ks_xp') || '0'); } catch(e) { return 0; } }
function ksGetStreak() { try { return parseInt(localStorage.getItem('ks_streak') || '0'); } catch(e) { return 0; } }
function ksAddXP(n)    { try { const v = ksGetXP() + n; localStorage.setItem('ks_xp', v); return v; } catch(e) {} }

/* ── Best-streak tracking — capture le record de série sur chaque page ── */
(function trackBestStreak() {
  try {
    var cur  = parseInt(localStorage.getItem('ks_streak') || '0') || 0;
    var best = parseInt(localStorage.getItem('ks_beststreak') || '0') || 0;
    if (cur > best) localStorage.setItem('ks_beststreak', String(cur));
  } catch (e) {}
})();

/* ── Streak Freeze — 2 sauvetages par mois ─────────────────────────
   Si l'utilisateur rate UN jour, un freeze est consommé automatiquement
   pour préserver le streak. Renouvelé au 1er de chaque mois.
   - ks_freezes_left : nombre de freezes disponibles ce mois
   - ks_freezes_month : YYYY-MM du dernier renouvellement
   - ks_freezes_used_log : JSON [{date, streakAtTime}] pour historique */
var KS_FREEZE_MAX = 2;
function _ksFreezeMonth(){ return new Date().toISOString().slice(0,7); }
function ksMaybeRenewFreezes(){
  try {
    var m = _ksFreezeMonth();
    if (localStorage.getItem('ks_freezes_month') !== m) {
      localStorage.setItem('ks_freezes_month', m);
      localStorage.setItem('ks_freezes_left', String(KS_FREEZE_MAX));
    }
  } catch (e) {}
}
function ksFreezesLeft(){
  ksMaybeRenewFreezes();
  try { return parseInt(localStorage.getItem('ks_freezes_left') || String(KS_FREEZE_MAX)); }
  catch (e) { return 0; }
}
function ksUseFreeze(){
  ksMaybeRenewFreezes();
  var n = ksFreezesLeft();
  if (n <= 0) return false;
  try {
    localStorage.setItem('ks_freezes_left', String(n - 1));
    /* Log d'historique pour affichage */
    var log = [];
    try { log = JSON.parse(localStorage.getItem('ks_freezes_used_log') || '[]'); } catch(_e){}
    log.push({ date: new Date().toISOString().slice(0,10), streak: parseInt(localStorage.getItem('ks_streak')||'0') });
    if (log.length > 20) log = log.slice(-20);
    localStorage.setItem('ks_freezes_used_log', JSON.stringify(log));
    return true;
  } catch (e) { return false; }
}
/* Init au chargement de chaque page */
ksMaybeRenewFreezes();

/* ── Completion tracking ───────────────────────────────────────────── */
function ksMarkDone(key) {
  try { localStorage.setItem(key, 'done'); } catch(e) {}
}
function ksIsDone(key) {
  try { return localStorage.getItem(key) === 'done'; } catch(e) { return false; }
}

/* ── Korean TTS — meilleure voix disponible (fallback) ─────────────
   Priorités séparées par genre pour matcher le choix utilisateur :
   si elle a choisi InJoon/Hyunsu (homme), le fallback essaie aussi
   de jouer une voix masculine du navigateur. */
var _ksFemaleVoice = null;
var _ksMaleVoice = null;
var _ksVoiceReady = false;

function _ksLoadVoice() {
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  var koVoices = voices.filter(function(v){ return v.lang.toLowerCase().indexOf('ko') === 0; });
  if (!koVoices.length) return;

  /* Voix coréennes connues triées par genre (basé sur les noms exposés
     par chaque OS/navigateur). */
  var femalePriority = ['yuna', 'sora', 'sun-hi', 'heami', 'sun', 'seoyeon', 'google 한국의', 'google korean'];
  var malePriority   = ['injoon', 'jinho', 'in-joon', 'donghyun', 'jihun', 'minjun', 'hyunsu'];

  function pick(prio) {
    for (var i = 0; i < prio.length; i++) {
      var found = koVoices.find(function(v){ return v.name.toLowerCase().indexOf(prio[i]) >= 0; });
      if (found) return found;
    }
    return null;
  }

  _ksFemaleVoice = pick(femalePriority) || koVoices[0];
  _ksMaleVoice   = pick(malePriority);
  /* Si aucune voix masculine trouvée sur cet OS, on garde la féminine
     (le navigateur ne propose souvent qu'une seule voix coréenne). */
  if (!_ksMaleVoice) _ksMaleVoice = _ksFemaleVoice;
  _ksVoiceReady = true;
}

/* Renvoie la voix navigateur qui matche le mieux la préférence
   d'avatar de l'utilisateur (homme/femme). */
function _ksVoiceForChoice() {
  var pref = (typeof ksGetVoice === 'function') ? ksGetVoice() : 'sunhi';
  /* sunhi = femme, injoon/hyunsu = homme */
  return (pref === 'sunhi') ? _ksFemaleVoice : _ksMaleVoice;
}

// Les voix peuvent se charger après le script
if (window.speechSynthesis) {
  _ksLoadVoice();
  window.speechSynthesis.onvoiceschanged = _ksLoadVoice;
}

/* ── Audio Korean : MP3 pré-générés (qualité native, Edge TTS) ──────
   3 voix disponibles : sunhi (femme, défaut), injoon (homme),
   hyunsu (homme expressif). Le choix utilisateur est dans
   localStorage.ks_voice. Manifest = mapping { texte : "{hash}.mp3" }.
   Chemin final : audio/{voice}/{hash}.mp3. Fallback speechSynthesis
   si le MP3 manque ou que le réseau coupe. */
var _ksAudioManifest = null;
var _ksAudioManifestLoading = null;
var _ksCurrentAudio = null;
var KS_VOICES = ['sunhi', 'injoon', 'hyunsu'];

function ksGetVoice() {
  try {
    var v = localStorage.getItem('ks_voice');
    return KS_VOICES.indexOf(v) >= 0 ? v : 'sunhi';
  } catch (e) { return 'sunhi'; }
}
function ksSetVoice(v) {
  if (KS_VOICES.indexOf(v) < 0) return;
  try { localStorage.setItem('ks_voice', v); } catch (e) {}
}
window.ksGetVoice = ksGetVoice;
window.ksSetVoice = ksSetVoice;

function _ksLoadManifest() {
  if (_ksAudioManifest) return Promise.resolve(_ksAudioManifest);
  if (_ksAudioManifestLoading) return _ksAudioManifestLoading;
  _ksAudioManifestLoading = fetch('audio/manifest.json', {cache:'default'})
    .then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(m){ _ksAudioManifest = m || {}; return _ksAudioManifest; })
    .catch(function(){ _ksAudioManifest = {}; return _ksAudioManifest; });
  return _ksAudioManifestLoading;
}
/* Précharge le manifest dès le chargement de la page (non bloquant) */
if (typeof window !== 'undefined') { try { _ksLoadManifest(); } catch(e){} }

function _ksFallbackTTS(text, btn) {
  /* Voix du navigateur — pour les mots qui n'ont pas de MP3
     (onomatopées, ou textes ajoutés après la dernière génération).
     On essaie de matcher le genre choisi par l'utilisateur. */
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang  = 'ko-KR';
    u.rate  = 0.78;
    u.pitch = 1.0;
    var v = _ksVoiceForChoice();
    if (v) u.voice = v;
    /* Si on a choisi une voix masculine mais qu'on n'en a aucune,
       on baisse un peu le pitch pour faire "plus masculin". */
    var pref = (typeof ksGetVoice === 'function') ? ksGetVoice() : 'sunhi';
    if (pref !== 'sunhi' && v && _ksFemaleVoice && v === _ksFemaleVoice) {
      u.pitch = 0.7;  // approximation grossière
      u.rate  = 0.85;
    }
    if (btn) {
      u.onend  = function() { btn.classList.remove('playing'); };
      u.onerror = function() { btn.classList.remove('playing'); };
    }
    window.speechSynthesis.speak(u);
  } catch(e) { if (btn) btn.classList.remove('playing'); }
}

/**
 * speak(text, btn) — joue le MP3 natif s'il existe, sinon utilise
 * la synthèse vocale du navigateur en fallback.
 */
function speak(text, btn) {
  if (!text) return;
  /* Stop tout audio en cours */
  if (_ksCurrentAudio) { try { _ksCurrentAudio.pause(); } catch(e){} _ksCurrentAudio = null; }
  try { window.speechSynthesis.cancel(); } catch(e){}
  document.querySelectorAll('.speak-btn.playing').forEach(function(b){ b.classList.remove('playing'); });
  if (btn) btn.classList.add('playing');

  var cleaned = text.trim();
  /* Retire d'éventuels guillemets enveloppants pour matcher le manifest */
  if ((cleaned.charAt(0)==='"' && cleaned.charAt(cleaned.length-1)==='"') ||
      (cleaned.charAt(0)==="'" && cleaned.charAt(cleaned.length-1)==="'")) {
    cleaned = cleaned.substring(1, cleaned.length-1).trim();
  }

  _ksLoadManifest().then(function(manifest){
    var hash = manifest[cleaned];
    if (!hash) {
      /* Pas de MP3 enregistré → fallback navigateur */
      _ksFallbackTTS(text, btn);
      return;
    }
    /* Construit le chemin avec la voix préférée de l'utilisateur. */
    var src = 'audio/' + ksGetVoice() + '/' + hash;
    var audio = new Audio(src);
    _ksCurrentAudio = audio;
    audio.onended = function(){ if (btn) btn.classList.remove('playing'); if (_ksCurrentAudio===audio) _ksCurrentAudio=null; };
    audio.onerror = function(){
      /* Le MP3 a échoué (réseau ?) → on retombe sur la voix navigateur */
      if (_ksCurrentAudio===audio) _ksCurrentAudio=null;
      _ksFallbackTTS(text, btn);
    };
    audio.play().catch(function(){
      _ksCurrentAudio = null;
      _ksFallbackTTS(text, btn);
    });
  });
}
window.speak = speak;  // accessible depuis les onclick inline

/* ── Page navigate-out helper (fade) ──────────────────────────────── */
function ksNavigate(href) {
  if (ksNavigate._going) return;
  ksNavigate._going = true;
  try {
    document.body.style.transition = 'opacity .22s ease';
    document.body.style.opacity = '0';
  } catch (e) {}
  setTimeout(() => { window.location.href = href; }, 200);
}
window.ksNavigate = ksNavigate;

/* ── Bfcache : empêche la page de rester invisible quand on revient ── */
/* Quand le navigateur restaure la page depuis son cache (bouton retour),
   l'opacité avait été mise à 0 pour le fondu — il faut la remettre. */
window.addEventListener('pageshow', function (e) {
  if (e.persisted || (document.body && document.body.style.opacity === '0')) {
    try {
      document.body.style.transition = '';
      document.body.style.opacity = '';
    } catch (err) {}
    ksNavigate._going = false;
  }
});

/* ── Lesson quit-confirmation + smooth page transitions ───────────── */
(function () {
  'use strict';

  var isLesson = /(^|\/)(lecon|exercice|quiz)[0-9a-z_]*\.html(\?|#|$)/i.test(location.pathname + location.search)
              || /(^|\/)(lecon|exercice|quiz)[0-9a-z_]*\.html$/i.test(location.pathname);
  var loadedAt = Date.now();

  /* ---- shared CSS for the confirm modal ---- */
  function injectCSS() {
    if (document.getElementById('ks-quit-css')) return;
    var css = [
      '#ks-quit{position:fixed;inset:0;z-index:99000;display:none;',
        'align-items:center;justify-content:center;padding:24px;',
        'background:rgba(8,14,24,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
        'animation:ksqIn .2s ease both}',
      '#ks-quit.on{display:flex}',
      '@keyframes ksqIn{from{opacity:0}to{opacity:1}}',
      '.ks-qm{width:100%;max-width:340px;background:#152030;',
        'border:1.5px solid rgba(255,255,255,.1);border-radius:20px;',
        'padding:28px 24px;text-align:center;',
        'box-shadow:0 24px 64px rgba(0,0,0,.55);',
        'animation:ksqUp .3s cubic-bezier(.34,1.4,.64,1) both}',
      '@keyframes ksqUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
      '.ks-qm-ic{width:52px;height:52px;border-radius:50%;margin:0 auto 14px;',
        'background:rgba(248,113,113,.13);display:flex;align-items:center;justify-content:center}',
      '.ks-qm-ic svg{width:26px;height:26px;stroke:#f87171;fill:none;stroke-width:2;',
        'stroke-linecap:round;stroke-linejoin:round}',
      '.ks-qm-t{font-family:"Playfair Display",serif;font-size:19px;font-weight:700;',
        'color:#fff;margin-bottom:6px}',
      '.ks-qm-x{font-size:13px;line-height:1.6;color:rgba(247,248,250,.5);margin-bottom:20px}',
      '.ks-qm-btns{display:flex;flex-direction:column;gap:9px}',
      '.ks-qm-b{width:100%;padding:13px;border-radius:12px;cursor:pointer;',
        'font-family:"Inter",sans-serif;font-size:14px;font-weight:700;transition:all .18s;border:none}',
      '.ks-qm-stay{background:#C9A96E;color:#0a1220}',
      '.ks-qm-stay:hover{background:#D5BA8A}',
      '.ks-qm-leave{background:transparent;border:1.5px solid rgba(255,255,255,.14);',
        'color:rgba(247,248,250,.62)}',
      '.ks-qm-leave:hover{border-color:rgba(248,113,113,.5);color:#f87171}',
      ''
    ].join('');
    var s = document.createElement('style');
    s.id = 'ks-quit-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---- build modal, return element ---- */
  function getModal() {
    var m = document.getElementById('ks-quit');
    if (m) return m;
    injectCSS();
    m = document.createElement('div');
    m.id = 'ks-quit';
    m.innerHTML =
      '<div class="ks-qm" role="dialog" aria-modal="true" aria-label="Quitter la leçon">' +
        '<div class="ks-qm-ic"><svg viewBox="0 0 24 24">' +
          '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
          '<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
        '<div class="ks-qm-t">Quitter la leçon&thinsp;?</div>' +
        '<div class="ks-qm-x">Ta progression dans cette leçon ne sera pas sauvegardée. Tu devras la recommencer.</div>' +
        '<div class="ks-qm-btns">' +
          '<button class="ks-qm-b ks-qm-stay" type="button">Rester sur la leçon</button>' +
          '<button class="ks-qm-b ks-qm-leave" type="button">Quitter quand même</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    return m;
  }

  var pendingAction = null;

  function closeModal() {
    var m = document.getElementById('ks-quit');
    if (m) m.classList.remove('on');
    document.body.style.overflow = '';
    pendingAction = null;
  }

  function openModal(action) {
    pendingAction = action;
    var m = getModal();
    m.classList.add('on');
    document.body.style.overflow = 'hidden';
    m.querySelector('.ks-qm-stay').onclick = closeModal;
    m.querySelector('.ks-qm-leave').onclick = function () {
      var a = pendingAction;
      closeModal();
      if (a) a();
    };
    m.onclick = function (e) { if (e.target === m) closeModal(); };
  }

  /* ---- is the lesson already finished? (results overlay visible) ---- */
  function lessonFinished() {
    if (document.querySelector('#ks-res.show')) return true;
    if (document.querySelector('.results.show, .results.on')) return true;
    var r = document.getElementById('results');
    if (r && (r.style.display === 'block' || r.style.display === 'flex')) return true;
    return false;
  }

  /* ---- intercept quit buttons (capture phase, lesson pages only) ---- */
  if (isLesson) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.quit,.bar-back,.back-btn,[data-quit]');
      if (!btn) return;
      /* grace period: ignore mis-clicks in the first 4s */
      if (Date.now() - loadedAt < 4000) return;
      /* lesson done → no progress to lose, let it through */
      if (lessonFinished()) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      var href = btn.getAttribute('href');
      openModal(function () {
        if (href && href !== '#') ksNavigate(href);
        else history.back();
      });
    }, true);

    /* Escape key closes (= stay) */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('ks-quit') &&
          document.getElementById('ks-quit').classList.contains('on')) {
        closeModal();
      }
    });
  }

  /* ---- smooth fade-out for ordinary internal navigation ---- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#') return;
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
    /* only same-document .html navigations */
    if (!/\.html(\?|#|$)/i.test(href)) return;
    /* don't intercept quit buttons here — handled above */
    if (a.matches && a.matches('.quit,.bar-back,.back-btn')) return;

    e.preventDefault();
    ksNavigate(href);
  }, false);
})();

/* ─────────────────────────────────────────────────────────────────────
   Écran de fin universel — ksFinish(opts)
   Appelé à la fin d'une leçon / exercice / quiz / histoire / anecdote.
   Affiche un overlay plein écran avec :
     • 3 étoiles (filled si score>=80%, mid-fill si score>=50%, sinon 1)
     • Titre + phrase d'encouragement coréen/français
     • XP gagnés
     • Bouton "Continuer →" qui amène à l'activité suivante du parcours
       (via KSCurriculum.next() — auto-chargé si besoin)
     • Lien "Retour au parcours" pour revenir à cours.html

   Usage minimal :  ksFinish({ key:'ks_c02', xp:15 })
   Avec score :     ksFinish({ key:'ks_c02', xp:15, score:9, total:10 })
   ───────────────────────────────────────────────────────────────────── */

/* Charge ks-curriculum.js de manière paresseuse si pas déjà là. */
function _ksEnsureCurriculum() {
  if (typeof window.KSCurriculum !== 'undefined') return Promise.resolve();
  if (window._ksCurriculumLoading) return window._ksCurriculumLoading;
  window._ksCurriculumLoading = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = 'ks-curriculum.js';
    s.onload = function () { resolve(); };
    s.onerror = function () { resolve(); }; // on tolère l'absence
    document.head.appendChild(s);
  });
  return window._ksCurriculumLoading;
}

/* Phrases d'encouragement variées (mix coréen + français). */
var _KS_ENCOURAGE = [
  { kr: '잘했어요 !',  fr: 'Bien joué !' },
  { kr: '완벽해요 !',  fr: 'Parfait !' },
  { kr: '훌륭해요 !',  fr: 'Excellent !' },
  { kr: '대단해요 !',  fr: 'Tu es au top.' },
  { kr: '멋있어요 !',  fr: 'Magnifique session.' },
  { kr: '화이팅 !',    fr: 'Continue, tu progresses bien.' },
  { kr: '최고예요 !',  fr: 'Tu déchires.' },
  { kr: '계속 가요 !', fr: 'Encore une et tu seras imbattable.' }
];

function _ksInjectFinishCSS() {
  if (document.getElementById('ks-finish-css')) return;
  var s = document.createElement('style');
  s.id = 'ks-finish-css';
  s.textContent = [
    '#ks-finish{position:fixed;inset:0;z-index:99500;display:none;',
      'flex-direction:column;align-items:center;justify-content:center;',
      'padding:24px 20px;',
      'background:linear-gradient(160deg,#0a1628 0%,#0F1B2D 50%,#1a2f4a 100%);',
      'overflow-y:auto;animation:ksfIn .35s ease both}',
    '#ks-finish.on{display:flex}',
    '@keyframes ksfIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '.ksf-inner{width:100%;max-width:380px;text-align:center}',
    '.ksf-stars{display:flex;gap:6px;justify-content:center;margin-bottom:18px}',
    '.ksf-star{width:32px;height:32px;opacity:.22;transform:scale(.7);',
      'transition:all .45s cubic-bezier(.34,1.56,.64,1);display:inline-flex}',
    '.ksf-star svg{width:32px;height:32px;fill:#C9A96E;stroke:#C9A96E;stroke-width:1}',
    '.ksf-star.lit{opacity:1;transform:scale(1);filter:drop-shadow(0 2px 8px rgba(201,169,110,.55))}',
    '.ksf-kr{font-family:"Playfair Display",Georgia,serif;font-size:34px;',
      'font-weight:700;color:#C9A96E;margin:0 0 4px;line-height:1.1;letter-spacing:-.01em}',
    '.ksf-title{font-family:"Inter",sans-serif;font-size:14px;letter-spacing:.18em;',
      'text-transform:uppercase;color:rgba(247,248,250,.45);margin:0 0 22px;font-weight:600}',
    '.ksf-stats{display:flex;gap:10px;width:100%;margin-bottom:22px}',
    '.ksf-stat{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);',
      'border-radius:14px;padding:14px 8px}',
    '.ksf-stat-n{font-family:"Playfair Display",serif;font-size:24px;color:#C9A96E;line-height:1}',
    '.ksf-stat-l{font-size:10.5px;color:rgba(247,248,250,.5);text-transform:uppercase;',
      'letter-spacing:.08em;font-weight:600;margin-top:4px}',
    '.ksf-msg{font-size:14px;color:rgba(247,248,250,.7);line-height:1.65;',
      'margin-bottom:24px;max-width:320px;margin-left:auto;margin-right:auto}',
    '.ksf-msg em{color:#fff;font-style:normal;font-weight:600}',
    '.ksf-next{width:100%;padding:15px 18px;border:none;border-radius:14px;',
      'background:#C9A96E;color:#0a1220;font-family:"Inter",sans-serif;',
      'font-size:15px;font-weight:800;cursor:pointer;transition:all .2s;',
      'display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;',
      'box-shadow:0 8px 24px rgba(201,169,110,.22)}',
    '.ksf-next:hover{background:#D4B582;transform:translateY(-1px);',
      'box-shadow:0 12px 32px rgba(201,169,110,.32)}',
    '.ksf-next svg{width:16px;height:16px;stroke:currentColor;fill:none;',
      'stroke-width:2.5;stroke-linecap:round}',
    '.ksf-next-sub{font-size:11px;font-weight:600;opacity:.65;display:block;',
      'margin-top:3px;letter-spacing:.04em}',
    '.ksf-row{display:flex;gap:10px;width:100%;margin-top:10px}',
    '.ksf-sec{flex:1;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);',
      'border:1.5px solid rgba(255,255,255,.1);color:rgba(247,248,250,.65);',
      'font-family:"Inter",sans-serif;font-size:13px;font-weight:600;',
      'cursor:pointer;text-decoration:none;text-align:center;transition:all .2s;',
      'display:flex;align-items:center;justify-content:center;gap:6px}',
    '.ksf-sec:hover{border-color:rgba(201,169,110,.4);color:#C9A96E}',
    '.ksf-sec svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
    ''
  ].join('');
  (document.head || document.documentElement).appendChild(s);
}

function _ksRenderFinishOverlay(opts, next) {
  _ksInjectFinishCSS();
  var existing = document.getElementById('ks-finish');
  if (existing) existing.remove();

  /* Étoiles : 3 si pas de score, sinon basé sur le %. */
  var stars = 3;
  if (typeof opts.score === 'number' && typeof opts.total === 'number' && opts.total > 0) {
    var pct = opts.score / opts.total;
    stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
  }

  /* Phrase d'encouragement aléatoire (déterministe sur la clé pour
     éviter un message différent à chaque refresh). */
  var seed = (opts.key || 'x').split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
  var enc = _KS_ENCOURAGE[seed % _KS_ENCOURAGE.length];

  /* Construction du bouton "Continuer" */
  var nextHref = next && next.href ? next.href : 'cours.html';
  var nextLabel = next && next.title ? next.title : 'Mon parcours';
  var nextSubLbl = next && next.lvlName ? next.lvlName : '';

  /* XP & streak depuis localStorage */
  var xp = (typeof ksGetXP === 'function') ? ksGetXP() : 0;
  var streak = (typeof ksGetStreak === 'function') ? ksGetStreak() : 0;
  var gainedXP = opts.xp || 0;

  var starSvg = '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  var arrowSvg = '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';
  var homeSvg = '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var bookSvg = '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>';

  var html =
    '<div class="ksf-inner">' +
      '<div class="ksf-stars">' +
        '<span class="ksf-star' + (stars >= 1 ? ' lit' : '') + '">' + starSvg + '</span>' +
        '<span class="ksf-star' + (stars >= 2 ? ' lit' : '') + '">' + starSvg + '</span>' +
        '<span class="ksf-star' + (stars >= 3 ? ' lit' : '') + '">' + starSvg + '</span>' +
      '</div>' +
      '<h2 class="ksf-kr">' + enc.kr + '</h2>' +
      '<div class="ksf-title">' + (opts.title || (typeof opts.score === 'number' ? 'Score ' + opts.score + ' / ' + opts.total : 'Activité terminée')) + '</div>' +
      '<div class="ksf-stats">' +
        '<div class="ksf-stat"><div class="ksf-stat-n">+' + gainedXP + '</div><div class="ksf-stat-l">XP gagnés</div></div>' +
        '<div class="ksf-stat"><div class="ksf-stat-n">' + xp + '</div><div class="ksf-stat-l">XP total</div></div>' +
        (streak > 0 ? '<div class="ksf-stat"><div class="ksf-stat-n" style="color:#FF8050">' + streak + '</div><div class="ksf-stat-l">Jours</div></div>' : '') +
      '</div>' +
      '<p class="ksf-msg">' + enc.fr + (opts.mina ? '<br/><em>' + opts.mina + '</em>' : '') + '</p>' +
      '<a class="ksf-next" href="' + nextHref + '">' +
        '<span>Continuer' + (nextLabel && nextLabel !== 'Mon parcours' ? ' — ' + nextLabel : '') + (nextSubLbl ? '<span class="ksf-next-sub">' + nextSubLbl + '</span>' : '') + '</span>' +
        arrowSvg +
      '</a>' +
      '<div class="ksf-row">' +
        '<a class="ksf-sec" href="cours.html">' + bookSvg + 'Mon parcours</a>' +
        '<a class="ksf-sec" href="app.html">' + homeSvg + 'Accueil</a>' +
      '</div>' +
    '</div>';

  var overlay = document.createElement('div');
  overlay.id = 'ks-finish';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  /* Force reflow puis affiche pour déclencher l'animation. */
  // eslint-disable-next-line no-unused-expressions
  overlay.offsetHeight;
  overlay.classList.add('on');
}

function ksFinish(opts) {
  opts = opts || {};
  /* 1. Marque l'activité comme terminée */
  if (opts.key && typeof ksMarkDone === 'function') ksMarkDone(opts.key);
  /* 2. Crédite l'XP */
  if (opts.xp && typeof ksAddXP === 'function') ksAddXP(opts.xp);
  /* 3. Charge le curriculum si besoin puis affiche l'overlay */
  _ksEnsureCurriculum().then(function () {
    var nextAct = null;
    if (window.KSCurriculum && typeof window.KSCurriculum.next === 'function') {
      try { nextAct = window.KSCurriculum.next(); } catch (e) {}
    }
    _ksRenderFinishOverlay(opts, nextAct);
  });
}
window.ksFinish = ksFinish;

/* ── Page entrance animation ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Populate XP pills
  const xp = ksGetXP();
  document.querySelectorAll('#xpVal, .xp-val').forEach(el => { el.textContent = xp; });
  document.querySelectorAll('#streakVal, .streak-val').forEach(el => { el.textContent = ksGetStreak(); });

  // Wire up dark toggle buttons
  document.querySelectorAll('.js-dark-toggle, [data-action="dark-toggle"]').forEach(btn => {
    btn.addEventListener('click', ksDarkToggle);
    // Set initial icon state
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.setAttribute('data-dark-icon', isDark ? 'dark' : 'light');
  });

  /* Charge la bannière visuelle de leçon (auto-skip si page exclue) */
  (function(){
    if (document.getElementById('ks-lesson-image-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-lesson-image-script';
    s.src = 'ks-lesson-image.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le système de favoris (bouton marque-page sur chaque leçon) */
  (function(){
    if (document.getElementById('ks-favorites-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-favorites-script';
    s.src = 'ks-favorites.js';
    s.defer = true;
    document.head.appendChild(s);
  })();
});
