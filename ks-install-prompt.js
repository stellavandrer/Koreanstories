/* ═══════════════════════════════════════════════════════════════════
   ks-install-prompt.js — Prompt PWA d'installation discret.
   - Capture l'événement beforeinstallprompt (Chrome/Edge/Samsung).
   - Affiche une bannière fine en bas d'écran avec « Installer ».
   - Mémorise dismiss / install via localStorage pour ne pas harceler.
   - Skip sur petites pages (gate, login) et si déjà en mode standalone.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Skip si l'utilisateur est déjà en PWA standalone */
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return; // iOS Safari already installed

  /* Skip sur certaines pages où le prompt n'a pas de sens */
  var SKIP_PAGES = ['gate.html', 'login.html', 'signup.html', 'onboarding.html'];
  var here = (location.pathname.split('/').pop() || '').toLowerCase();
  if (SKIP_PAGES.indexOf(here) !== -1) return;

  /* Cooldown : si dismiss, on attend 7 jours avant de réessayer.
     Si install, on ne montre plus jamais. */
  var DISMISS_COOLDOWN_MS = 7 * 24 * 3600 * 1000;
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsRm(k) { try { localStorage.removeItem(k); } catch (e) {} }

  if (ls('ks_install_done')) return;
  var dismissed = parseInt(ls('ks_install_dismissed_at') || '0', 10);
  if (dismissed && (Date.now() - dismissed) < DISMISS_COOLDOWN_MS) return;

  /* Capture l'événement Chrome */
  var deferredPrompt = null;
  var bannerShown = false;

  function injectCSS() {
    if (document.getElementById('ks-install-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-install-css';
    s.textContent = [
      '.ks-inst-banner{',
        'position:fixed;left:50%;transform:translateX(-50%) translateY(120%);',
        'bottom:calc(80px + env(safe-area-inset-bottom));z-index:9400;',
        'display:flex;align-items:center;gap:12px;',
        'background:#0F1B2D;color:#fff;border-radius:16px;',
        'padding:12px 14px 12px 16px;box-shadow:0 12px 36px rgba(0,0,0,.3);',
        'max-width:calc(100vw - 32px);width:380px;',
        'transition:transform .35s cubic-bezier(.34,1.56,.64,1);',
        'font-family:"Inter",system-ui,sans-serif;',
      '}',
      '.ks-inst-banner.show{transform:translateX(-50%) translateY(0)}',
      '[data-theme="dark"] .ks-inst-banner{background:#1f2937;border:1px solid rgba(255,255,255,.08)}',
      '.ks-inst-ico{flex-shrink:0;width:38px;height:38px;border-radius:10px;',
        'background:linear-gradient(135deg,#C9A96E,#D4B582);',
        'display:flex;align-items:center;justify-content:center}',
      '.ks-inst-ico svg{width:20px;height:20px;stroke:#0F1B2D;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}',
      '.ks-inst-body{flex:1;min-width:0}',
      '.ks-inst-t{font-size:13px;font-weight:700;line-height:1.2;margin-bottom:2px}',
      '.ks-inst-s{font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.35}',
      '.ks-inst-btns{display:flex;flex-direction:column;gap:5px;flex-shrink:0}',
      '.ks-inst-yes{background:#C9A96E;color:#0a1220;border:none;border-radius:8px;',
        'padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;',
        'font-family:inherit;white-space:nowrap;transition:background .15s}',
      '.ks-inst-yes:hover{background:#D4B582}',
      '.ks-inst-no{background:none;color:rgba(255,255,255,.55);border:none;',
        'padding:4px 8px;font-size:11px;cursor:pointer;font-family:inherit;',
        'text-decoration:underline;text-underline-offset:2px}',
      '.ks-inst-no:hover{color:#fff}',
      '@media (max-width:420px){',
        '.ks-inst-banner{width:auto;left:12px;right:12px;transform:translateY(120%)}',
        '.ks-inst-banner.show{transform:translateY(0)}',
      '}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function showBanner() {
    if (bannerShown) return;
    bannerShown = true;
    injectCSS();

    var banner = document.createElement('div');
    banner.className = 'ks-inst-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Installer Korean Stories sur votre appareil');
    banner.innerHTML =
      '<div class="ks-inst-ico" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      '</div>' +
      '<div class="ks-inst-body">' +
        '<div class="ks-inst-t">Installer Korean Stories</div>' +
        '<div class="ks-inst-s">Plus rapide · accès hors-ligne · sur ton écran d\'accueil</div>' +
      '</div>' +
      '<div class="ks-inst-btns">' +
        '<button class="ks-inst-yes" type="button" aria-label="Installer l\'application">Installer</button>' +
        '<button class="ks-inst-no" type="button" aria-label="Plus tard">Plus tard</button>' +
      '</div>';
    document.body.appendChild(banner);
    /* Force reflow puis animation */
    // eslint-disable-next-line no-unused-expressions
    banner.offsetHeight;
    banner.classList.add('show');

    banner.querySelector('.ks-inst-yes').addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice && choice.outcome === 'accepted') {
          lsSet('ks_install_done', String(Date.now()));
        } else {
          lsSet('ks_install_dismissed_at', String(Date.now()));
        }
        hideBanner(banner);
        deferredPrompt = null;
      });
    });

    banner.querySelector('.ks-inst-no').addEventListener('click', function () {
      lsSet('ks_install_dismissed_at', String(Date.now()));
      hideBanner(banner);
    });
  }

  function hideBanner(banner) {
    if (!banner) return;
    banner.classList.remove('show');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 350);
  }

  /* beforeinstallprompt : Chrome/Edge/Samsung
     - On capture pour pouvoir le déclencher quand on veut
     - On attend 4 secondes après le load pour ne pas casser la 1re impression
     - On vérifie aussi que l'utilisateur a au moins ouvert 2 pages
       (proxy d'engagement, via compteur ks_session_views) */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    /* Compteur d'engagement : combien de fois l'utilisateur a chargé une page */
    var views = parseInt(ls('ks_session_views') || '0', 10) + 1;
    lsSet('ks_session_views', String(views));
    if (views < 2) return; /* on attend la 2e visite minimum */
    setTimeout(function () {
      if (deferredPrompt) showBanner();
    }, 4000);
  });

  /* Si installé via le menu navigateur, on note pour ne plus prompter */
  window.addEventListener('appinstalled', function () {
    lsSet('ks_install_done', String(Date.now()));
    lsRm('ks_install_dismissed_at');
  });

  /* ─── Variante iOS Safari ─────────────────────────────────────────
     Safari iOS ne supporte pas beforeinstallprompt. Pour ces users,
     on affiche une bannière différente avec les instructions manuelles
     « Partager → Sur l'écran d'accueil ». */
  function isIOSSafari() {
    var ua = navigator.userAgent;
    var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var webkit = /WebKit/i.test(ua);
    var chromeIOS = /CriOS|FxiOS|EdgiOS/i.test(ua); // Chrome/Firefox/Edge sur iOS = WebKit aussi
    return iOS && webkit && !chromeIOS;
  }

  function showIOSBanner() {
    if (bannerShown) return;
    bannerShown = true;
    injectCSS();

    /* Ajoute le style spécifique iOS (instructions plus longues) */
    if (!document.getElementById('ks-install-ios-css')) {
      var s = document.createElement('style');
      s.id = 'ks-install-ios-css';
      s.textContent = [
        '.ks-inst-banner.ios{flex-direction:column;align-items:stretch;padding:14px 16px;gap:10px}',
        '.ks-inst-banner.ios .ks-inst-row{display:flex;align-items:center;gap:12px}',
        '.ks-inst-banner.ios .ks-inst-steps{font-size:11.5px;line-height:1.55;color:rgba(255,255,255,.75);',
          'padding:8px 10px;background:rgba(255,255,255,.06);border-radius:8px;display:flex;gap:8px;align-items:center}',
        '.ks-inst-banner.ios .ks-share-ico{display:inline-flex;align-items:center;justify-content:center;',
          'width:22px;height:22px;background:rgba(201,169,110,.18);border-radius:5px;flex-shrink:0}',
        '.ks-inst-banner.ios .ks-share-ico svg{width:14px;height:14px;stroke:#C9A96E;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
      ].join('');
      document.head.appendChild(s);
    }

    var banner = document.createElement('div');
    banner.className = 'ks-inst-banner ios';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Comment installer Korean Stories sur iPhone ou iPad');
    banner.innerHTML =
      '<div class="ks-inst-row">' +
        '<div class="ks-inst-ico" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        '</div>' +
        '<div class="ks-inst-body">' +
          '<div class="ks-inst-t">Installer sur ton iPhone</div>' +
          '<div class="ks-inst-s">Korean Stories devient une vraie app, sans store</div>' +
        '</div>' +
        '<button class="ks-inst-no" type="button" aria-label="Fermer">×</button>' +
      '</div>' +
      '<div class="ks-inst-steps">' +
        '<span class="ks-share-ico" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
        '</span>' +
        '<span>Appuie sur <strong style="color:#fff">Partager</strong>, puis « <strong style="color:#fff">Sur l\'écran d\'accueil</strong> »</span>' +
      '</div>';
    document.body.appendChild(banner);
    banner.offsetHeight; // eslint-disable-line no-unused-expressions
    banner.classList.add('show');

    banner.querySelector('.ks-inst-no').addEventListener('click', function () {
      lsSet('ks_install_dismissed_at', String(Date.now()));
      hideBanner(banner);
    });
  }

  /* Sur iOS : déclenche au bout de 4s, après 2 vues, sans dépendre
     de beforeinstallprompt qui ne se déclenche jamais. */
  if (isIOSSafari()) {
    var iosViews = parseInt(ls('ks_session_views') || '0', 10) + 1;
    lsSet('ks_session_views', String(iosViews));
    if (iosViews >= 2) {
      setTimeout(showIOSBanner, 4000);
    }
  }
})();
