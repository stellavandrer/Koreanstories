/* ── Site Access Gate ─────────────────────────────────────────────
   ACCÈS PROTÉGÉ PAR MOT DE PASSE — réactivé le 2026-06-23 (phase de test).
   Pour rouvrir le site au public : remettre GATE_ENABLED = false
   (ou vider ce fichier comme avant). Le mot de passe se change ci-dessous.

   ⚠️ Protection « rideau » côté navigateur : suffisante pour empêcher
   le visiteur lambda d'accéder au site pendant les tests, mais le code
   reste lisible dans la source. Ne pas s'en servir pour des données
   sensibles.
─────────────────────────────────────────────────────────────────── */
(function () {
  var GATE_ENABLED = false;
  var PASSWORD     = 'Jae';                // ← change le mot de passe ici
  var STORE_KEY    = 'ks_site_access';     // mémorise l'accès sur l'appareil

  /* Force HTTPS — évite l'avertissement "connexion non sécurisée". */
  try {
    if (location.protocol === 'http:' &&
        location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1' &&
        location.hostname.indexOf('192.168.') !== 0) {
      location.replace('https:' + window.location.href.substring(window.location.protocol.length));
      return;
    }
  } catch (e) {}

  try { sessionStorage.setItem('ks_access', 'ok'); } catch (e) {}

  if (!GATE_ENABLED) return;

  /* Déjà autorisé sur cet appareil ? */
  try { if (localStorage.getItem(STORE_KEY) === PASSWORD) return; } catch (e) {}

  /* Masque la page tout de suite (évite le flash de contenu). */
  var hide = document.createElement('style');
  hide.id = 'ks-gate-hide';
  hide.textContent = 'body{display:none!important}';
  document.documentElement.appendChild(hide);

  function build() {
    if (document.getElementById('ks-gate')) return;
    var ov = document.createElement('div');
    ov.id = 'ks-gate';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Accès protégé');
    ov.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;background:#0F1B2D;' +
      'display:flex;align-items:center;justify-content:center;padding:24px;' +
      'font-family:system-ui,-apple-system,Segoe UI,sans-serif';
    ov.innerHTML =
      '<div style="width:100%;max-width:360px;text-align:center;color:#fff">' +
        '<div style="font-family:Georgia,serif;font-style:italic;font-size:26px;margin-bottom:6px">Korean <span style="color:#C9A96E">Stories</span></div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:22px">Site en cours de finalisation — accès réservé</div>' +
        '<input id="ks-gate-input" type="password" autocomplete="off" placeholder="Mot de passe" ' +
          'style="width:100%;box-sizing:border-box;padding:13px 15px;border-radius:12px;border:1.5px solid rgba(255,255,255,.18);' +
          'background:rgba(255,255,255,.06);color:#fff;font-size:15px;outline:none;text-align:center;letter-spacing:.04em">' +
        '<div id="ks-gate-msg" style="min-height:18px;font-size:12.5px;color:#f87171;margin:8px 0 4px"></div>' +
        '<button id="ks-gate-btn" style="width:100%;padding:13px;border:none;border-radius:12px;cursor:pointer;' +
          'background:linear-gradient(135deg,#e0c48a,#C9A96E);color:#3a2c12;font-size:15px;font-weight:700">Entrer</button>' +
      '</div>';
    document.documentElement.appendChild(ov);

    var input = document.getElementById('ks-gate-input');
    var btn   = document.getElementById('ks-gate-btn');
    var msg   = document.getElementById('ks-gate-msg');
    if (input) input.focus();

    function tryEnter() {
      if (input.value === PASSWORD) {
        try { localStorage.setItem(STORE_KEY, PASSWORD); } catch (e) {}
        var h = document.getElementById('ks-gate-hide'); if (h) h.remove();
        ov.remove();
      } else {
        msg.textContent = 'Mot de passe incorrect.';
        input.value = '';
        input.focus();
      }
    }
    btn.addEventListener('click', tryEnter);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryEnter(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
