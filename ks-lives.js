/* ── Système de vies ──────────────────────────────────────────────
   5 vies max, -1 par mauvaise réponse en leçon/exercice, régénération
   1 vie / 4h, illimité pour les comptes Premium.
─────────────────────────────────────────────────────────────────── */
(function () {
  var MAX = 5;
  var REGEN_MS = 4 * 60 * 60 * 1000;
  var CKEY = 'ks_lives_count';
  var TKEY = 'ks_lives_ts';

  function isPremium() {
    try { return localStorage.getItem('ks_premium') === '1'; } catch (e) { return false; }
  }

  /* localStorage peut lever (navigation privée Safari, quota, etc.) — jamais
     laisser ça remonter et casser le reste du script de la page. */
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /* Certaines pages (lecon*.html) définissent déjà .hrt/.lives-row en inline ;
     les autres (exercice/jeu/quiz) n'ont rien — on injecte une fois une règle
     commune pour que le widget flottant soit stylé partout. */
  function ensureStyle() {
    if (document.getElementById('ks-lives-style')) return;
    var st = document.createElement('style');
    st.id = 'ks-lives-style';
    st.textContent = '.hrt{font-size:16px;color:#ef4444;line-height:1;transition:opacity .3s}' +
      '.hrt.lost{opacity:.25;filter:grayscale(1)}' +
      '[data-theme="dark"] .hrt{color:#f87171}';
    document.head.appendChild(st);
  }

  /* Applique la régénération écoulée depuis le dernier check. */
  function regen() {
    if (isPremium()) return;
    var count = parseInt(safeGet(CKEY), 10);
    if (isNaN(count)) { count = MAX; }
    var ts = parseInt(safeGet(TKEY), 10);
    if (!ts || count >= MAX) return;
    var gained = Math.floor((Date.now() - ts) / REGEN_MS);
    if (gained > 0) {
      count = Math.min(MAX, count + gained);
      try { localStorage.setItem(CKEY, String(count)); } catch (e) {}
      if (count >= MAX) {
        try { localStorage.removeItem(TKEY); } catch (e) {}
      } else {
        try { localStorage.setItem(TKEY, String(ts + gained * REGEN_MS)); } catch (e) {}
      }
    }
  }

  function get() {
    if (isPremium()) return MAX;
    regen();
    var count = parseInt(safeGet(CKEY), 10);
    return isNaN(count) ? MAX : count;
  }

  function nextRegenMs() {
    if (isPremium()) return 0;
    var count = get();
    if (count >= MAX) return 0;
    var ts = parseInt(safeGet(TKEY), 10);
    if (!ts) return REGEN_MS;
    return Math.max(0, REGEN_MS - (Date.now() - ts));
  }

  function formatDelay(ms) {
    var mins = Math.max(1, Math.ceil(ms / 60000));
    var h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? (h + 'h' + (m < 10 ? '0' : '') + m) : (m + ' min');
  }

  function canPlay() {
    return isPremium() || get() > 0;
  }

  var HEART_SVG = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;display:inline-block;vertical-align:middle;fill:currentColor;stroke:none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>';

  function heartsHtml() {
    if (isPremium()) {
      return '<span class="hrt" title="Vies illimitées (Premium)" style="font-weight:700;color:#C9A96E">∞</span>';
    }
    var count = get(), html = '';
    for (var i = 0; i < MAX; i++) {
      html += '<span class="hrt' + (i < count ? '' : ' lost') + '">' + HEART_SVG + '</span>';
    }
    return html;
  }

  /* Injecte un widget sur les pages qui n'ont pas de .lives-row dans leur HTML.
     Priorité : s'insérer dans la barre du haut existante (.bar-r, puis nav.bar)
     pour rester dans le flux — sinon, en dernier recours, un badge flottant. */
  function ensureWidget() {
    if (document.querySelector('.lives-row')) return;
    if (document.getElementById('ksLivesFloat')) return;
    var el = document.createElement('div');
    el.id = 'ksLivesFloat';
    el.className = 'lives-row';
    var host = document.querySelector('nav.bar .bar-r') || document.querySelector('.bar-r');
    if (host) {
      el.style.cssText = 'display:flex;gap:3px;flex-shrink:0';
      host.insertBefore(el, host.firstChild);
      return el;
    }
    var bar = document.querySelector('nav.bar');
    if (bar) {
      el.style.cssText = 'display:flex;gap:3px;flex-shrink:0;margin-left:auto';
      bar.appendChild(el);
      return el;
    }
    el.style.cssText = 'position:fixed;top:10px;right:14px;z-index:9998;display:flex;gap:3px;background:rgba(10,18,32,.85);padding:6px 10px;border-radius:20px;backdrop-filter:blur(4px)';
    document.body.appendChild(el);
  }

  function render() {
    document.querySelectorAll('.lives-row').forEach(function (row) {
      row.innerHTML = heartsHtml();
    });
  }

  function showBlocked() {
    if (document.getElementById('ks-lives-blocked')) return;
    var timeStr = formatDelay(nextRegenMs());
    var ov = document.createElement('div');
    ov.id = 'ks-lives-blocked';
    ov.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(10,18,32,.92);display:flex;align-items:center;justify-content:center;font-family:"Inter",system-ui,sans-serif;padding:20px;animation:ksLivesIn .3s ease both';
    var style = document.createElement('style');
    style.textContent = '@keyframes ksLivesIn{from{opacity:0}to{opacity:1}}';
    ov.appendChild(style);
    var box = document.createElement('div');
    box.style.cssText = 'max-width:360px;background:#152030;border:1.5px solid rgba(255,255,255,.08);border-radius:20px;padding:36px 28px;text-align:center;color:#fff;box-shadow:0 24px 64px rgba(0,0,0,.6)';
    box.innerHTML =
      '<div style="font-size:36px;margin-bottom:12px">💔</div>' +
      '<div style="font-family:\'Playfair Display\',serif;font-size:20px;font-weight:700;margin-bottom:8px">Plus de vies</div>' +
      '<div style="font-size:14px;line-height:1.5;color:rgba(247,248,250,.6);margin-bottom:24px">Ta prochaine vie arrive dans <strong style="color:#C9A96E">' + timeStr + '</strong>. Reviens un peu plus tard, ou passe Premium pour des vies illimitées.</div>' +
      '<a href="premium.html" style="display:block;width:100%;padding:13px;border-radius:12px;background:#C9A96E;color:#0a1220;font-weight:700;text-decoration:none;margin-bottom:10px;box-sizing:border-box;font-size:14px">Passer Premium →</a>' +
      '<a href="app.html" style="display:block;width:100%;padding:13px;border-radius:12px;border:1.5px solid rgba(255,255,255,.15);color:#fff;text-decoration:none;box-sizing:border-box;font-size:14px">Retour au tableau de bord</a>';
    ov.appendChild(box);
    document.body.appendChild(ov);
  }

  function lose() {
    if (isPremium()) return MAX;
    var count = get();
    if (count <= 0) { showBlocked(); return 0; }
    count -= 1;
    try {
      localStorage.setItem(CKEY, String(count));
      if (!localStorage.getItem(TKEY)) localStorage.setItem(TKEY, String(Date.now()));
    } catch (e) {}
    render();
    if (count <= 0) showBlocked();
    return count;
  }

  window.KSLives = { get: get, lose: lose, canPlay: canPlay, render: render, isPremium: isPremium, nextRegenMs: nextRegenMs };

  function init() {
    ensureStyle();
    ensureWidget();
    render();
    if (!canPlay()) showBlocked();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
