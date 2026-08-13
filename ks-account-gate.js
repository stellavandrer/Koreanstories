/* ═══════════════════════════════════════════════════════════════════
   ks-account-gate.js — Inscription obligatoire pour utiliser le site.
   ──────────────────────────────────────────────────────────────────
   Demande de Stella (2026-08-05) : « le site accessible seulement par
   inscription ». Remplace le modele « essai libre puis compte requis »
   du 2026-07-14 : le mode invite ne donne plus acces au contenu.

   Ce qui reste PUBLIC (liste ci-dessous) : la page d'accueil, les 61
   articles de blog, les pages legales, la page Premium, les pages de
   connexion / inscription, les avis et l'aide. C'est la vitrine et le
   canal d'acquisition — la fermer reviendrait a couper le seul moyen
   qu'ont les gens de decouvrir le site.

   Tout le reste — lecons, exercices, jeux, quiz, histoires, planches
   BD, tableau de bord et outils — demande un compte.

   ⚠️ LIMITE A CONNAITRE : c'est un rideau cote navigateur, pas un
   verrou. Le site est statique (GitHub Pages, aucun serveur) : le HTML
   des pages reste telechargeable par quelqu'un qui desactive
   JavaScript ou lit le code source. Cela arrete le visiteur ordinaire,
   pas quelqu'un de determine. Un vrai verrou demanderait de servir les
   pages depuis un serveur qui verifie la session.

   Pour rouvrir une page au public, il suffit d'ajouter son nom de
   fichier a PUBLIC ci-dessous.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Pages accessibles sans compte. */
  var PUBLIC = {
    'index.html': 1, '': 1, '/': 1,
    'blog.html': 1,
    'login.html': 1, 'signup.html': 1, 'bienvenue.html': 1,
    'premium.html': 1, 'premium-success.html': 1,
    /* livret-a1.html est une page de VENTE (2026-08-07). Elle etait tombee
       dans le lot des 416 pages fermees : un visiteur sans compte ne voyait
       ni l'apercu du livret, ni le prix, ni le bouton d'achat — seulement un
       mur d'inscription. On ne vend pas ce qu'on empeche de regarder, et
       premium.html, qui vend elle aussi, etait deja publique.
       Le TELECHARGEMENT reste protege : il se joue cote serveur (licence ou
       jeton verifie par le worker), pas sur cette porte-ci. */
    'livret-a1.html': 1, 'livret-a2.html': 1,
    /* Ouvertes aux visiteurs le 2026-08-07, sur decision de Stella.
       Ce sont les deux meilleures portes d'entree du site : on cherche
       « comment ecrire son prenom en coreen » ou un mot precis bien avant
       de chercher une methode. Les fermer revenait a cacher ce qui donne
       envie d'entrer. Elles ne contiennent aucune progression personnelle :
       le parcours, lui, reste derriere la porte. */
    'dictionnaire.html': 1, 'hangeul.html': 1,
    /* Porte d'entree construite le 2026-08-07. « ecrire son prenom en
       coreen » est LA requete du debutant absolu, et le site n'y
       apparaissait nulle part alors que parlonscoreen et seonsaengnim
       l'occupent. Une page fermee sur cette requete n'aurait servi a
       rien : elle existe precisement pour accueillir des inconnus. */
    'prenom-coreen.html': 1,
    /* Deuxieme porte, construite le 2026-08-12, sur le meme principe :
       « age coreen » / « calculer son age coreen » est une requete que des
       gens tapent sans rien connaitre au coreen — souvent apres un drama.
       L'outil repond a la question ET apprend a la dire en coreen, ce qui
       ramene vers le parcours. La fermer la viderait de son unique raison
       d'exister : accueillir des inconnus. */
    'age-coreen.html': 1,
    /* Ouvertes le 2026-08-12. ressources.html est la vitrine des 35 fiches :
       la garder fermee revenait a cacher le catalogue a ceux qui pourraient
       l'acheter. Les cinq fiches Hangeul, elles, sont entierement gratuites
       (voir PDF_LIBRES dans le worker) : ce sont des portes d'entree, pas
       des avantages. Les 30 autres restent verrouillees cote serveur, cette
       liste ne change rien pour elles. */
    'ressources.html': 1,
    'hangeul-chart.html': 1, 'hangeul-mnemo.html': 1, 'hangeul-exercices.html': 1,
    'prononc-hangeul.html': 1, 'clavier-coreen.html': 1,
    'avis.html': 1, 'a-propos.html': 1, 'aide.html': 1,
    'mentions-legales.html': 1, 'cgv.html': 1, 'confidentialite.html': 1,
    '404.html': 1, 'reset.html': 1
  };

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* Les 61 articles commencent tous par « blog- » : publics par nature. */
  if (PUBLIC[here] || here.indexOf('blog-') === 0) return;

  function account() {
    try {
      var u = JSON.parse(localStorage.getItem('ks_user') || 'null');
      return (u && u.guest !== true) ? u : null;
    } catch (e) { return null; }
  }

  if (account()) return;

  /* Masquer tout de suite : sinon la lecon s'affiche une fraction de
     seconde avant la porte, ce qui la rend inutile ET donne un a-coup. */
  var hide = document.createElement('style');
  hide.id = 'ks-gate-hide';
  hide.textContent = 'body{visibility:hidden!important}';
  (document.head || document.documentElement).appendChild(hide);

  /* Ou renvoyer la personne apres inscription. */
  function nextParam() {
    try { return '?next=' + encodeURIComponent(location.pathname + location.search); }
    catch (e) { return ''; }
  }

  function build() {
    if (document.getElementById('ks-acct-gate')) return;

    var ov = document.createElement('div');
    ov.id = 'ks-acct-gate';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'ksAcctTitle');
    ov.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;background:#0F1B2D;visibility:visible;' +
      'display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto;' +
      "font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif";

    ov.innerHTML =
      '<div style="width:100%;max-width:390px;text-align:center;color:#fff">' +
        '<div style="font-family:Georgia,\'Playfair Display\',serif;font-size:25px;margin-bottom:26px">' +
          'Korean <span style="color:#C9A96E;font-style:italic">Stories</span></div>' +
        '<div style="width:56px;height:56px;border-radius:16px;background:rgba(201,169,110,.14);' +
          'border:1px solid rgba(201,169,110,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 18px">' +
          '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#C9A96E" stroke-width="1.8" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
        '<h2 id="ksAcctTitle" style="font-family:Georgia,\'Playfair Display\',serif;font-size:22px;font-weight:700;margin:0 0 10px;line-height:1.25">' +
          'Cr&eacute;e ton compte pour continuer</h2>' +
        '<p style="font-size:14.5px;line-height:1.6;color:rgba(199,210,227,.9);margin:0 auto 22px;max-width:33ch">' +
          'L\'apprentissage est gratuit, mais il demande un compte : c\'est ce qui garde ta progression, ' +
          'ta s&eacute;rie et tes mots enregistr&eacute;s d\'un appareil &agrave; l\'autre.</p>' +
        '<a href="signup.html' + nextParam() + '" style="display:block;width:100%;padding:14px;border-radius:13px;' +
          'background:linear-gradient(135deg,#e0c48a,#C9A96E);color:#3a2c12;font-weight:700;font-size:15px;' +
          'text-decoration:none;box-sizing:border-box;margin-bottom:10px">Cr&eacute;er mon compte gratuit</a>' +
        '<a href="login.html' + nextParam() + '" style="display:block;width:100%;padding:13px;border-radius:13px;' +
          'border:1.5px solid rgba(255,255,255,.18);color:#fff;font-size:14.5px;text-decoration:none;' +
          'box-sizing:border-box;margin-bottom:18px">J\'ai d&eacute;j&agrave; un compte</a>' +
        '<div style="font-size:12.5px;color:rgba(199,210,227,.55);line-height:1.6">' +
          'Gratuit, sans carte bancaire. &middot; ' +
          '<a href="index.html" style="color:rgba(199,210,227,.8)">Retour &agrave; l\'accueil</a><br>' +
          'Tu peux lire le <a href="blog.html" style="color:#C9A96E">blog</a> librement, sans compte.' +
        '</div>' +
      '</div>';

    document.documentElement.appendChild(ov);
    var first = ov.querySelector('a');
    if (first) { try { first.focus(); } catch (e) {} }

    /* Piege a focus : la porte ne doit pas pouvoir etre contournee au clavier. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = ov.querySelectorAll('a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
