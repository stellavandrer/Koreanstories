/* ═══════════════════════════════════════════════════════════════════
   ks-results.js — Shared results overlay for Korean Stories lessons
   Usage: KSResults.show({ title, xp, score?, total?, nextHref, nextLabel })
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── CSS injection ───────────────────────────────────────────────── */
  var CSS = [
    /* Page fade-in on load */
    'body{animation:ksPageIn .32s ease both}',
    '@keyframes ksPageIn{from{opacity:0}to{opacity:1}}',

    /* Overlay backdrop */
    '#ks-res{display:none;position:fixed;inset:0;z-index:9000;',
      'background:linear-gradient(160deg,#0a1628 0%,#0F1B2D 50%,#1a2f4a 100%);',
      'overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '#ks-res.show{display:flex;flex-direction:column;align-items:center;',
      'justify-content:flex-start;padding:36px 20px 64px;',
      'animation:ksResIn .3s ease both;}',
    '@keyframes ksResIn{from{opacity:0}to{opacity:1}}',

    /* Inner card */
    '#ks-res-inner{width:100%;max-width:400px;text-align:center;',
      'display:flex;flex-direction:column;align-items:center;',
      'animation:ksResUp .45s cubic-bezier(.34,1.56,.64,1) .05s both;}',
    '@keyframes ksResUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}',

    /* Stars */
    '.ks-stars{display:flex;gap:8px;justify-content:center;margin-bottom:20px}',
    '.ks-star{width:38px;height:38px;opacity:.18;transform:scale(.55);',
      'transition:all .45s cubic-bezier(.34,1.56,.64,1);',
      'display:inline-flex;align-items:center;justify-content:center}',
    '.ks-star svg{width:36px;height:36px;fill:#C9A96E;stroke:#C9A96E;stroke-width:1}',
    '.ks-star.lit{opacity:1;transform:scale(1);',
      'filter:drop-shadow(0 2px 10px rgba(201,169,110,.75))}',

    /* Title */
    '.ks-title{font-family:"Playfair Display",serif;',
      'font-size:clamp(20px,5.5vw,26px);color:#fff;',
      'margin-bottom:4px;line-height:1.2}',
    '.ks-sub{font-size:11px;font-weight:700;letter-spacing:.14em;',
      'text-transform:uppercase;color:rgba(201,169,110,.55);margin-bottom:22px}',

    /* Stats row */
    '.ks-stats{display:flex;gap:10px;width:100%;margin-bottom:22px}',
    '.ks-stat{flex:1;background:rgba(255,255,255,.05);',
      'border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px 8px;text-align:center}',
    '.ks-stat-n{font-family:"Playfair Display",serif;font-size:26px;',
      'color:#C9A96E;line-height:1;margin-bottom:2px}',
    '.ks-stat-l{font-size:10px;font-weight:600;',
      'color:rgba(247,248,250,.32);text-transform:uppercase;letter-spacing:.06em}',

    /* Achievement emblem */
    '.ks-emblem{width:94px;height:94px;margin:0 auto 14px;',
      'animation:ksEmblemIn .55s cubic-bezier(.34,1.5,.6,1) .15s both}',
    '@keyframes ksEmblemIn{from{transform:scale(.35) rotate(-14deg);opacity:0}',
      'to{transform:none;opacity:1}}',
    '.ks-emblem svg{width:100%;height:100%;display:block;',
      'filter:drop-shadow(0 8px 22px rgba(201,169,110,.45))}',

    /* Message */
    '.ks-msg{font-size:14px;color:rgba(247,248,250,.5);line-height:1.75;',
      'margin-bottom:26px;max-width:300px}',
    '.ks-msg strong{color:rgba(247,248,250,.85)}',

    /* Buttons */
    '.ks-btns{display:flex;flex-direction:column;gap:10px;width:100%}',
    '.ks-prim{width:100%;padding:15px;border-radius:14px;',
      'background:#C9A96E;color:#0a1220;border:none;',
      'font-family:"Inter",sans-serif;font-size:15px;font-weight:800;',
      'cursor:pointer;transition:all .2s;',
      'display:flex;align-items:center;justify-content:center;gap:8px}',
    '.ks-prim:hover{background:#D5BA8A;transform:translateY(-1px);',
      'box-shadow:0 8px 28px rgba(201,169,110,.35)}',
    '.ks-prim:active{transform:scale(.97)}',
    '.ks-prim svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}',
    '.ks-row{display:flex;gap:10px;width:100%}',
    '.ks-sec{flex:1;padding:13px;border-radius:14px;',
      'background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);',
      'color:rgba(247,248,250,.6);font-family:"Inter",sans-serif;',
      'font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;',
      'text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.ks-sec:hover{border-color:rgba(201,169,110,.4);color:#C9A96E;background:rgba(201,169,110,.06)}',
    '.ks-sec svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}',

    /* Confetti */
    '#ks-conf{position:fixed;inset:0;pointer-events:none;z-index:9100}',
    '.ks-p{position:absolute;width:7px;height:9px;border-radius:1.5px;opacity:0;',
      'animation:ksConf var(--d) var(--dl) ease-in forwards}',
    '@keyframes ksConf{0%{transform:translateY(-20px) rotateZ(var(--r));opacity:1}',
      '80%{opacity:.9}100%{transform:translateY(100vh) rotateZ(calc(var(--r) + 540deg));opacity:0}}',

    ''
  ].join('');

  function injectCSS() {
    if (document.getElementById('ks-results-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-results-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── Confetti ────────────────────────────────────────────────────── */
  var CONF_COLORS = ['#C9A96E','#FFD700','#FF6B6B','#4FC3F7','#A8E6CF','#FFE082','#E8C97E','#80DEEA'];

  function launchConfetti() {
    var wrap = document.createElement('div');
    wrap.id = 'ks-conf';
    document.body.appendChild(wrap);
    for (var i = 0; i < 65; i++) {
      var p = document.createElement('div');
      p.className = 'ks-p';
      var x = Math.random() * 100;
      var d = (.7 + Math.random() * 1.6).toFixed(2);
      var dl = (Math.random() * .9).toFixed(2);
      var r = (Math.random() * 360).toFixed(0);
      var c = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];
      p.style.cssText = 'left:'+x+'%;background:'+c+';--d:'+d+'s;--dl:'+dl+'s;--r:'+r+'deg';
      wrap.appendChild(p);
    }
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 4000);
  }

  /* ── SVG helpers ─────────────────────────────────────────────────── */
  var STAR_SVG = '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  var ARROW_SVG = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
  var RETRY_SVG = '<svg viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>';
  var HOME_SVG  = '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

  /* Self-contained achievement emblem — no external assets */
  function emblemSVG(stars) {
    var win = stars >= 2;
    var g1  = win ? '#F1DBAC' : '#C4D4E4';
    var g2  = win ? '#C9A96E' : '#8AA4BE';
    var ring = win ? '#A8884C' : '#6E89A6';
    var uid = 'ksE' + Math.random().toString(36).slice(2, 7);
    var icon = win
      /* trophy */
      ? '<g transform="translate(24 23) scale(2)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>' +
          '<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>' +
          '<path d="M5 21h14"/>' +
          '<path d="M9.5 16.5V19h5v-2.5"/>' +
          '<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>' +
        '</g>'
      /* sunburst — keep shining */
      : '<g transform="translate(24 24) scale(2)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="12" cy="12" r="4.2" fill="#fff" stroke="none"/>' +
          '<path d="M12 2.4v3M12 18.6v3M3.4 12h3M17.6 12h3M5.9 5.9l2.1 2.1M16 16l2.1 2.1M18.1 5.9 16 8M8 16l-2.1 2.1"/>' +
        '</g>';
    return '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + g1 + '"/>' +
        '<stop offset="1" stop-color="' + g2 + '"/>' +
      '</linearGradient></defs>' +
      '<circle cx="48" cy="48" r="44" fill="url(#' + uid + ')"/>' +
      '<circle cx="48" cy="48" r="44" fill="none" stroke="' + ring + '" stroke-width="2.5"/>' +
      '<circle cx="48" cy="48" r="37" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.8"/>' +
      icon +
    '</svg>';
  }

  /* ── Build / get overlay element ─────────────────────────────────── */
  function getOverlay() {
    var el = document.getElementById('ks-res');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ks-res';
      el.innerHTML =
        '<div id="ks-res-inner">' +
          '<div class="ks-stars">' +
            '<span class="ks-star" id="ks-s1">'+STAR_SVG+'</span>' +
            '<span class="ks-star" id="ks-s2">'+STAR_SVG+'</span>' +
            '<span class="ks-star" id="ks-s3">'+STAR_SVG+'</span>' +
          '</div>' +
          '<div class="ks-title"  id="ks-title"></div>' +
          '<div class="ks-sub"    id="ks-sub">완료 — Complété</div>' +
          '<div class="ks-stats"  id="ks-stats"></div>' +
          '<div class="ks-emblem" id="ks-emblem"></div>' +
          '<div class="ks-msg"    id="ks-msg"></div>' +
          '<div class="ks-btns"   id="ks-btns"></div>' +
        '</div>';
      document.body.appendChild(el);
    }
    return el;
  }

  /* ── Streak helper ───────────────────────────────────────────────── */
  function getStreak() {
    try {
      var t = new Date().toISOString().slice(0, 10);
      var l = localStorage.getItem('ks_lastplay');
      var s = parseInt(localStorage.getItem('ks_streak') || '0');
      if (l !== t) {
        var nk = (l && (new Date(t) - new Date(l)) / 86400000 === 1) ? s + 1 : 1;
        localStorage.setItem('ks_streak', String(nk));
        localStorage.setItem('ks_lastplay', t);
        return nk;
      }
      return s;
    } catch (e) { return 0; }
  }

  /* ── Animate stars ───────────────────────────────────────────────── */
  function animStars(count) {
    for (var i = 1; i <= 3; i++) {
      (function (idx) {
        if (idx <= count) {
          setTimeout(function () {
            var el = document.getElementById('ks-s' + idx);
            if (el) el.classList.add('lit');
          }, 280 + (idx - 1) * 190);
        }
      })(i);
    }
  }

  /* ── Main show() ─────────────────────────────────────────────────── */
  function show(opts) {
    opts = opts || {};
    injectCSS();
    var overlay = getOverlay();

    var xp        = opts.xp || 0;
    var score     = (opts.score != null) ? opts.score : null;
    var total     = opts.total || null;
    var nextHref  = opts.nextHref  || 'cours.html';
    var nextLabel = opts.nextLabel || 'Suivant →';
    var title     = opts.title     || 'Leçon terminée !';
    var retryFn   = opts.retryFn   || null;

    /* Stars count */
    var stars;
    if (score !== null && total !== null) {
      var pct = score / total;
      stars = pct >= 1 ? 3 : pct >= .6 ? 2 : 1;
    } else {
      stars = 3; /* reading lesson always 3 stars */
    }

    /* Encouraging message by score */
    var msg;
    if (stars === 3) {
      msg = score !== null
        ? '<strong>Score parfait !</strong> Tu maîtrises parfaitement ce sujet — continue comme ça !'
        : '<strong>Excellent !</strong> Tu as terminé cette leçon. Le coréen avance à grands pas !';
    } else if (stars === 2) {
      msg = 'Bien joué ! Tu progresses bien — relis les points clés pour <strong>consolider</strong>.';
    } else {
      msg = 'Continue à pratiquer ! Recommence pour bien ancrer les notions. <strong>화이팅 !</strong>';
    }

    /* XP (avoid double-save via flag) */
    if (xp > 0) {
      try {
        var flagKey = 'ks_xp_res_' + (opts.storageKey || btoa(title).slice(0,8));
        if (!sessionStorage.getItem(flagKey)) {
          sessionStorage.setItem(flagKey, '1');
          /* ksAddXP is called by the page's completeLesson() already;
             we only save here if caller explicitly passes saveXP:true */
          if (opts.saveXP) {
            var prev = parseInt(localStorage.getItem('ks_xp') || '0');
            localStorage.setItem('ks_xp', String(prev + xp));
          }
        }
      } catch(e) {}
    }

    /* Streak */
    var sk = getStreak();

    /* ── Populate title ── */
    document.getElementById('ks-title').textContent = title;

    /* ── Stats ── */
    var statsHtml = '';
    if (score !== null && total !== null) {
      statsHtml += '<div class="ks-stat"><div class="ks-stat-n">'+score+'</div><div class="ks-stat-l">/ '+total+' bonnes rép.</div></div>';
    }
    statsHtml += '<div class="ks-stat"><div class="ks-stat-n">+'+xp+'</div><div class="ks-stat-l">XP gagnés</div></div>';
    if (sk > 1) {
      statsHtml += '<div class="ks-stat"><div class="ks-stat-n" style="color:#FF8050;font-size:20px">🔥 '+sk+'</div><div class="ks-stat-l">jours de suite</div></div>';
    }
    document.getElementById('ks-stats').innerHTML = statsHtml;

    /* ── Achievement emblem ── */
    var embEl = document.getElementById('ks-emblem');
    if (embEl) embEl.innerHTML = emblemSVG(stars);

    /* ── Message ── */
    document.getElementById('ks-msg').innerHTML = msg;

    /* ── Buttons ── */
    var btnsHtml =
      '<button class="ks-prim" onclick="KSResults.navigate(\''+nextHref+'\')">' +
        nextLabel + ' ' + ARROW_SVG +
      '</button>' +
      '<div class="ks-row">';
    if (retryFn) {
      _retryFn = retryFn;
      btnsHtml += '<button class="ks-sec" onclick="KSResults.retry()">'+RETRY_SVG+' Recommencer</button>';
    }
    btnsHtml += '<a href="app.html" class="ks-sec">'+HOME_SVG+' Accueil</a>';
    btnsHtml += '</div>';
    document.getElementById('ks-btns').innerHTML = btnsHtml;

    /* ── Show overlay ── */
    overlay.classList.add('show');
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden'; /* lock body scroll while overlay open */

    /* ── Animate stars ── */
    animStars(stars);

    /* ── Confetti on 3 stars ── */
    if (stars === 3) {
      setTimeout(launchConfetti, 550);
    }
  }

  /* ── navigate() with page fade-out ──────────────────────────────── */
  function navigate(href) {
    /* Cancel body overflow lock first */
    document.body.style.overflow = '';
    document.body.style.transition = 'opacity .22s ease';
    document.body.style.opacity   = '0';
    setTimeout(function () { window.location.href = href; }, 220);
  }

  var _retryFn = null;

  var KSResults = {
    show:     show,
    navigate: navigate,
    retry: function () {
      var overlay = document.getElementById('ks-res');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
      if (_retryFn) { _retryFn(); _retryFn = null; }
    }
  };

  global.KSResults = KSResults;

  /* ── Page fade-in on every load ─────────────────────────────────── */
  injectCSS();

})(window);
