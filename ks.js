/**
 * Korean Stories — Shared JS utilities
 * Loaded by all pages for consistent behavior.
 */

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
