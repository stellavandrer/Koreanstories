// Korean Stories — chargement sécurisé du contenu des fiches PDF Premium.
// Remplace l'ancien ks-pdf-gate.js (overlay visuel qui laissait le texte
// complet dans le DOM, contournable via "Afficher le code source"). Le
// contenu réel est stocké côté Worker (KV, clé "pdfpage:<nom>") et n'est
// injecté dans la page qu'après vérification de la licence — voir
// GET /pdf-preview dans premium-worker/index.js.
(function () {
  var WORKER = 'https://ks-premium.delicate-voice-1d19.workers.dev/pdf-preview';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function injectStyle() {
    if (document.getElementById('ks-pdf-content-style')) return;
    var s = document.createElement('style');
    s.id = 'ks-pdf-content-style';
    s.textContent =
      '.pdf-locked{display:flex;align-items:center;justify-content:center;min-height:340px;padding:24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,sans-serif}' +
      '.pdf-locked-card{max-width:340px}' +
      '.pdf-locked-logo{font-family:Georgia,serif;font-style:italic;font-size:24px;color:#0F1B2D;margin-bottom:10px}' +
      '.pdf-locked-logo em{color:#C9A96E;font-style:italic}' +
      '.pdf-locked-card h2{font-size:18px;color:#0F1B2D;margin:0 0 10px}' +
      '.pdf-locked-card p{color:#475E78;font-size:13.5px;line-height:1.6;margin:0 0 20px}' +
      '.pdf-locked-btn{display:inline-block;width:100%;box-sizing:border-box;padding:13px;border-radius:12px;background:linear-gradient(135deg,#e0c48a,#C9A96E);color:#3a2c12;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:10px}' +
      '.pdf-locked-back{display:block;color:#8FA5BE;font-size:13px;text-decoration:none}' +
      '.pdf-loading{padding:60px 20px;text-align:center;color:#8FA5BE;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13.5px}';
    document.head.appendChild(s);
  }

  function showLocked(mount) {
    mount.innerHTML =
      '<div class="pdf-locked"><div class="pdf-locked-card">' +
      '<div class="pdf-locked-logo">Korean <em>Stories</em></div>' +
      '<h2>Fiche PDF Premium</h2>' +
      '<p>Les fiches PDF imprimables font partie des avantages Premium (5€/mois ou 79€ à vie).</p>' +
      '<a class="pdf-locked-btn" href="../premium.html">Voir le Premium</a>' +
      '<a class="pdf-locked-back" href="../ressources.html">← Retour aux ressources</a>' +
      '</div></div>';
  }

  function showLoading(mount) {
    mount.innerHTML = '<div class="pdf-loading">Chargement de la fiche…</div>';
  }

  ready(function () {
    var mount = document.getElementById('pdf-content');
    if (!mount) return;
    injectStyle();

    var file = mount.getAttribute('data-file');
    var key = null;
    try { key = localStorage.getItem('ks_premium_key'); } catch (e) {}

    if (!file || !key) { showLocked(mount); return; }

    showLoading(mount);
    fetch(WORKER + '?file=' + encodeURIComponent(file), {
      headers: { 'X-License-Key': key }
    }).then(function (r) {
      if (!r.ok) throw new Error('denied');
      return r.text();
    }).then(function (html) {
      mount.innerHTML = html;
    }).catch(function () {
      showLocked(mount);
    });
  });
})();
