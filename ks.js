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

/* ── Completion tracking ───────────────────────────────────────────── */
function ksMarkDone(key) {
  try { localStorage.setItem(key, 'done'); } catch(e) {}
}
function ksIsDone(key) {
  try { return localStorage.getItem(key) === 'done'; } catch(e) { return false; }
}

/* ── Korean TTS — meilleure voix disponible ───────────────────────── */
var _ksBestVoice = null;
var _ksVoiceReady = false;

function _ksLoadVoice() {
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  // Priorité : voix les plus naturelles connues
  var priority = [
    'yuna',           // Apple (iOS/macOS) — excellente
    'google 한국의',   // Chrome Android/Desktop — très bien
    'google korean',
    'heami',          // Microsoft Windows
    'seoyeon',        // Amazon / certains Android
  ];

  var koVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ko'));

  // Cherche dans l'ordre de priorité
  for (var i = 0; i < priority.length; i++) {
    var found = koVoices.find(v => v.name.toLowerCase().includes(priority[i]));
    if (found) { _ksBestVoice = found; _ksVoiceReady = true; return; }
  }

  // Sinon prend la première voix coréenne disponible
  if (koVoices.length) { _ksBestVoice = koVoices[0]; _ksVoiceReady = true; }
}

// Les voix peuvent se charger après le script
if (window.speechSynthesis) {
  _ksLoadVoice();
  window.speechSynthesis.onvoiceschanged = _ksLoadVoice;
}

/**
 * speak(text, btn) — prononce un mot coréen avec la meilleure voix disponible.
 * Remplace les appels locaux speak() sur toutes les pages.
 */
function speak(text, btn) {
  try {
    window.speechSynthesis.cancel();
    document.querySelectorAll('.speak-btn.playing').forEach(b => b.classList.remove('playing'));
    if (btn) btn.classList.add('playing');

    var u = new SpeechSynthesisUtterance(text);
    u.lang  = 'ko-KR';
    u.rate  = 0.78;   // légèrement plus lent = plus clair
    u.pitch = 1.0;

    if (_ksBestVoice) u.voice = _ksBestVoice;

    if (btn) {
      u.onend  = function() { btn.classList.remove('playing'); };
      u.onerror = function() { btn.classList.remove('playing'); };
    }
    window.speechSynthesis.speak(u);
  } catch(e) { if (btn) btn.classList.remove('playing'); }
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
});
