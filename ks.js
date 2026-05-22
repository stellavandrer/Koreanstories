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
  document.body.style.transition = 'opacity .22s ease';
  document.body.style.opacity = '0';
  setTimeout(() => window.location.href = href, 220);
}
window.ksNavigate = ksNavigate;

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
