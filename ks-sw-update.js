/* ═══════════════════════════════════════════════════════════════════
   ks-sw-update.js — Notification de mise à jour PWA.
   - Détecte qu'un nouveau service worker est installé et en attente.
   - Affiche une bannière fine en bas d'écran avec « Actualiser ».
   - Au clic : postMessage('SKIP_WAITING') puis location.reload().
   - Skip si pas de SW supporté ou si la page n'est pas contrôlée.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  /* Skip sur pages auth — pas pertinent là */
  var SKIP_PAGES = ['gate.html', 'login.html', 'signup.html', 'onboarding.html'];
  var here = (location.pathname.split('/').pop() || '').toLowerCase();
  if (SKIP_PAGES.indexOf(here) !== -1) return;

  /* État interne */
  var bannerShown = false;
  var refreshing = false;

  function injectCSS() {
    if (document.getElementById('ks-swu-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-swu-css';
    s.textContent = [
      '.ks-swu-banner{',
        'position:fixed;left:50%;transform:translateX(-50%) translateY(120%);',
        'bottom:calc(80px + env(safe-area-inset-bottom));z-index:9450;',
        'display:flex;align-items:center;gap:12px;',
        'background:linear-gradient(135deg,#16A34A,#22C55E);color:#fff;',
        'border-radius:14px;padding:11px 14px;',
        'box-shadow:0 12px 36px rgba(22,163,74,.32);',
        'max-width:calc(100vw - 32px);width:340px;',
        'transition:transform .35s cubic-bezier(.34,1.56,.64,1);',
        'font-family:"Inter",system-ui,sans-serif;',
      '}',
      '.ks-swu-banner.show{transform:translateX(-50%) translateY(0)}',
      '.ks-swu-ico{flex-shrink:0;width:32px;height:32px;border-radius:8px;',
        'background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center}',
      '.ks-swu-ico svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;',
        'animation:ksSwuSpin 2.5s linear infinite}',
      '@keyframes ksSwuSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
      '.ks-swu-body{flex:1;min-width:0}',
      '.ks-swu-t{font-size:13px;font-weight:700;line-height:1.2}',
      '.ks-swu-s{font-size:11px;color:rgba(255,255,255,.8);line-height:1.35;margin-top:1px}',
      '.ks-swu-yes{background:#fff;color:#16A34A;border:none;border-radius:8px;',
        'padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer;',
        'font-family:inherit;white-space:nowrap;transition:transform .15s}',
      '.ks-swu-yes:hover{transform:scale(1.05)}',
      '.ks-swu-no{background:none;color:rgba(255,255,255,.7);border:none;',
        'padding:4px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center}',
      '.ks-swu-no svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}',
      '.ks-swu-no:hover{color:#fff}',
      '@media (max-width:420px){',
        '.ks-swu-banner{width:auto;left:12px;right:12px;transform:translateY(120%)}',
        '.ks-swu-banner.show{transform:translateY(0)}',
      '}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function hideBanner(banner) {
    if (!banner) return;
    banner.classList.remove('show');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 350);
  }

  function showUpdateBanner(waitingWorker) {
    if (bannerShown) return;
    bannerShown = true;
    injectCSS();

    var banner = document.createElement('div');
    banner.className = 'ks-swu-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<div class="ks-swu-ico" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>' +
      '</div>' +
      '<div class="ks-swu-body">' +
        '<div class="ks-swu-t">Nouvelle version disponible</div>' +
        '<div class="ks-swu-s">Actualise pour profiter des dernières améliorations</div>' +
      '</div>' +
      '<button class="ks-swu-yes" type="button" aria-label="Actualiser maintenant">Actualiser</button>' +
      '<button class="ks-swu-no" type="button" aria-label="Fermer la notification">' +
        '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';
    document.body.appendChild(banner);
    // Force reflow puis animation
    banner.offsetHeight; // eslint-disable-line no-unused-expressions
    banner.classList.add('show');

    banner.querySelector('.ks-swu-yes').addEventListener('click', function () {
      if (refreshing) return;
      refreshing = true;
      /* Feedback immédiat : on masque la bannière et on passe le bouton
         en « Actualisation… » pour qu'elle ne paraisse jamais figée. */
      var yesBtn = banner.querySelector('.ks-swu-yes');
      if (yesBtn) { yesBtn.textContent = 'Actualisation…'; yesBtn.disabled = true; }
      /* Demande au SW en attente de devenir actif → controllerchange déclenche reload */
      if (waitingWorker && waitingWorker.postMessage) {
        try { waitingWorker.postMessage('SKIP_WAITING'); } catch (e) {}
      }
      /* Filet de sécurité : si controllerchange ne se déclenche pas
         (SW déjà actif, skipWaiting sans effet, message perdu…), on
         recharge quand même au bout de 1,2 s pour que la bannière ne
         reste jamais bloquée à l'écran. */
      setTimeout(function () { try { location.reload(); } catch (e) {} }, 1200);
    });

    banner.querySelector('.ks-swu-no').addEventListener('click', function () {
      hideBanner(banner);
    });
  }

  /* Quand le SW en attente devient le contrôleur, on reload (sauf si déjà
     en cours, ex: F5 manuel) — ça applique vraiment la nouvelle version. */
  var sawController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) return;
    if (!sawController) return; // 1re fois qu'il y a un controller, pas un upgrade
    refreshing = true;
    location.reload();
  });

  /* Surveille la registration et ses 3 états possibles d'updated SW */
  navigator.serviceWorker.getRegistration().then(function (reg) {
    if (!reg) return;

    /* Cas 1 : SW déjà installé et en attente au chargement de la page */
    if (reg.waiting && navigator.serviceWorker.controller) {
      showUpdateBanner(reg.waiting);
    }

    /* Cas 2 : un nouveau SW commence à s'installer après le chargement */
    reg.addEventListener('updatefound', function () {
      var newSW = reg.installing;
      if (!newSW) return;
      newSW.addEventListener('statechange', function () {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner(newSW);
        }
      });
    });

    /* Vérifie une fois par session si une mise à jour est dispo
       (GitHub Pages CDN met parfois ~30s à propager). */
    setTimeout(function () {
      try { reg.update(); } catch (e) {}
    }, 30000);
  }).catch(function () { /* SW pas dispo, on ignore */ });
})();
