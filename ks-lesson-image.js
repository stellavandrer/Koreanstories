/* ═══════════════════════════════════════════════════════════════════
   ks-lesson-image.js — Bannière visuelle au-dessus de chaque leçon.
   ──────────────────────────────────────────────────────────────────
   Inspiré de Busuu / Bunpo : une image en haut de chaque leçon pour
   contextualiser visuellement. Stratégie hybride :
   - Pages culturelles / histoires : photos curées d'Unsplash
   - Pages grammaire : bannière SVG décorative themée
   - Fallback : photo Unsplash random sur le thème détecté

   S'injecte automatiquement sur les pages de leçon, exercice, quiz,
   histoire, anecdote, conseil, chanson. Pas sur app.html / profil.html
   / dashboard / réglages.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Configuration : photos curées Unsplash par fichier ──────────
     Format Unsplash : photo-{ID}?w=800&q=80&auto=format&fit=crop
     Photos vérifiées, droits libres, attribution dans le footer.
     Liste cumulative — n'importe quelle page ABSENTE retombe sur le
     fallback par catégorie. */
  var CURATED = {
    /* === Hangeul === */
    'lecon.html':       { url:'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format', alt:'Calligraphie coréenne', credit:'Yeo Khee' },
    'lecon2.html':      { url:'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format', alt:'Hangeul', credit:'Yeo Khee' },
    'lecon3.html':      { url:'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format', alt:'Consonnes', credit:'Yeo Khee' },
    'lecon4.html':      { url:'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format', alt:'Syllabes', credit:'Yeo Khee' },
    'lecon9.html':      { url:'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format', alt:'Diphtongues', credit:'Yeo Khee' },
    'exercice1.html':   { url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format', alt:'Écriture' },
    'exercice2.html':   { url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format', alt:'Lire en coréen' },
    'quiz1.html':       { url:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format', alt:'Quiz Hangeul' },

    /* === A1 === */
    'lecon5.html':      { url:'https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=800&q=80&auto=format', alt:'Se saluer en coréen' },
    'lecon6.html':      { url:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format', alt:'Chiffres' },
    'lecon6b.html':     { url:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format', alt:'Chiffres natifs' },
    'lecon7.html':      { url:'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80&auto=format', alt:'Famille coréenne' },
    'lecon8.html':      { url:'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80&auto=format', alt:'Couleurs et adjectifs' },
    'lecon10.html':     { url:'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=800&q=80&auto=format', alt:'Cuisine coréenne' },
    'lecon11.html':     { url:'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80&auto=format', alt:'Séoul' },
    'lecon12.html':     { url:'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80&auto=format', alt:'Directions' },
    'lecon13.html':     { url:'https://images.unsplash.com/photo-1568667256531-c98ba83fb1c5?w=800&q=80&auto=format', alt:'Négation' },
    'lecon14.html':     { url:'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80&auto=format', alt:'Questions' },
    'lecon15.html':     { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Particules' },
    'lecon41.html':     { url:'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80&auto=format', alt:'Verbes coréens' },
    'lecon42.html':     { url:'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80&auto=format', alt:'Heures et jours' },
    'lecon43.html':     { url:'https://images.unsplash.com/photo-1499675973031-e35e6f6b2b35?w=800&q=80&auto=format', alt:'Météo' },
    'lecon44.html':     { url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format', alt:'Compteurs' },
    'lecon58.html':     { url:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format', alt:'Le corps et la santé' },
    'lecon59.html':     { url:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format', alt:'Vêtements et mode' },
    'lecon60.html':     { url:'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80&auto=format', alt:'Émotions' },

    /* === A2 === */
    'lecon17.html':     { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Phrases complexes' },
    'lecon18.html':     { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Conjonctions' },
    'lecon19.html':     { url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format', alt:'Argent et shopping' },
    'lecon20.html':     { url:'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80&auto=format', alt:'Voyage en Corée' },
    'lecon21.html':     { url:'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80&auto=format', alt:'Le futur' },
    'lecon45.html':     { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Voix passive' },
    'lecon48.html':     { url:'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80&auto=format', alt:'Comparaisons' },

    /* === B1 === */
    'lecon28.html':     { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Propositions relatives' },
    'lecon29.html':     { url:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80&auto=format', alt:'Discours indirect' },
    'lecon32.html':     { url:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80&auto=format', alt:'Niveaux de langue' },
    'pro4.html':        { url:'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format', alt:'Coréen professionnel' },

    /* === Histoires === */
    'histoire1.html':   { url:'https://images.unsplash.com/photo-1525373698358-041e3a460346?w=800&q=80&auto=format', alt:'Au café' },
    'histoire2.html':   { url:'https://images.unsplash.com/photo-1532465875524-2cb59eb39bd5?w=800&q=80&auto=format', alt:'Au restaurant' },
    'histoire3.html':   { url:'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80&auto=format', alt:'Une journée à Séoul' },
    'histoire12.html':  { url:'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format', alt:'K-Drama romance' },
    'histoire13.html':  { url:'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=80&auto=format', alt:'Hongdae' },
    'histoire14.html':  { url:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format', alt:'Aéroport' },
    'histoire15.html':  { url:'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80&auto=format', alt:'Chez le médecin' },
    'histoire16.html':  { url:'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format', alt:'Premier jour au bureau' },
    'histoire17.html':  { url:'https://images.unsplash.com/photo-1565073956915-43dc671c2440?w=800&q=80&auto=format', alt:'Week-end à Busan' },

    /* === Anecdotes & Conseils === */
    'anecdote13.html':  { url:'https://images.unsplash.com/photo-1610375229632-c1f5e23b51a7?w=800&q=80&auto=format', alt:'Fêtes coréennes' },
    'anecdote14.html':  { url:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format', alt:'Café à Séoul' },
    'anecdote15.html':  { url:'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80&auto=format', alt:'K-Beauty' },
    'anecdote16.html':  { url:'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80&auto=format', alt:'회식 BBQ' },
    'anecdote17.html':  { url:'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80&auto=format', alt:'Mukbang' },
    'anecdote18.html':  { url:'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80&auto=format', alt:'Âge coréen' },
    'anecdote19.html':  { url:'https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=800&q=80&auto=format', alt:'Superstitions' },
    'conseil7.html':    { url:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80&auto=format', alt:'S\'immerger en coréen' },
    'conseil8.html':    { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Mémoriser' }
  };

  /* ── Fallback par préfixe / thème ─────────────────────────────── */
  var FALLBACK_BY_PREFIX = {
    'lecon':    { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Leçon de coréen' },
    'exercice': { url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format', alt:'Exercice' },
    'quiz':     { url:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format', alt:'Quiz' },
    'histoire': { url:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80&auto=format', alt:'Histoire coréenne' },
    'anecdote': { url:'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80&auto=format', alt:'Culture coréenne' },
    'conseil':  { url:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format', alt:'Conseil' },
    'chanson':  { url:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format', alt:'K-Pop' },
    'pro':      { url:'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format', alt:'Professionnel' }
  };

  /* ── Pages à NE PAS toucher (dashboard / utilitaires) ─────────── */
  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'lecture.html':1, 'challenge.html':1,
    'classement.html':1, 'revision.html':1, 'statistiques.html':1,
    'trophees.html':1, 'aide.html':1, 'ressources.html':1,
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'vocabulaire.html':1, 'hangeul.html':1,
    'histoires.html':1, 'exercice.html':1
  };

  function getPageImage(){
    var path = location.pathname.split('/').pop() || 'index.html';
    if (EXCLUDED[path]) return null;

    /* 1. Mapping spécifique */
    if (CURATED[path]) return CURATED[path];

    /* 2. Fallback par préfixe */
    var prefixes = Object.keys(FALLBACK_BY_PREFIX);
    for (var i = 0; i < prefixes.length; i++) {
      if (path.indexOf(prefixes[i]) === 0) return FALLBACK_BY_PREFIX[prefixes[i]];
    }
    return null;
  }

  /* ── Injection du CSS partagé ─────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-banner-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-banner-css';
    s.textContent = [
      '.ks-banner{',
        'position:relative;',
        'width:100%;',
        'margin:0 0 1.2rem;',
        'height:160px;',
        'overflow:hidden;',
        'border-radius:14px;',
        'background:linear-gradient(135deg,#0F1B2D,#1a2f4a);',
        'box-shadow:0 4px 14px rgba(0,0,0,.08)',
      '}',
      '.ks-banner img{',
        'width:100%;height:100%;object-fit:cover;display:block;',
        'opacity:0;transition:opacity .6s ease;',
      '}',
      '.ks-banner img.loaded{opacity:.92}',
      '.ks-banner::after{',
        'content:"";position:absolute;inset:0;',
        'background:linear-gradient(180deg,rgba(15,27,45,.05) 0%,rgba(15,27,45,.55) 100%);',
        'pointer-events:none',
      '}',
      '[data-theme="dark"] .ks-banner::after{',
        'background:linear-gradient(180deg,rgba(8,14,24,.15) 0%,rgba(8,14,24,.75) 100%)',
      '}',
      '.ks-banner-loader{',
        'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
        'color:rgba(255,255,255,.5);font-size:12px;font-weight:600;',
        'letter-spacing:.1em;text-transform:uppercase',
      '}',
      '.ks-banner img.loaded + .ks-banner-loader{display:none}',
      /* Mobile : un peu plus court */
      '@media (max-width:480px){.ks-banner{height:130px}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Trouve le bon endroit pour injecter la bannière ─────────── */
  function findInsertionPoint(){
    /* Priorités (du plus spécifique au plus général) :
       1. <div style="padding:1rem"> dans main.main → modèle anecdote/conseil
       2. .wrap (modèle lecon)
       3. main
       4. body */
    var paddedDiv = document.querySelector('main .main > div[style*="padding"], main > div[style*="padding"]');
    if (paddedDiv) return paddedDiv;
    var wrap = document.querySelector('.wrap');
    if (wrap) return wrap;
    var main = document.querySelector('main, .main, .shell');
    if (main) return main;
    return document.body;
  }

  function inject(){
    var img = getPageImage();
    if (!img) return;

    var target = findInsertionPoint();
    if (!target) return;
    /* Skip si déjà injecté */
    if (target.querySelector('.ks-banner')) return;

    injectCSS();

    var banner = document.createElement('div');
    banner.className = 'ks-banner';
    banner.innerHTML =
      '<div class="ks-banner-loader">Chargement…</div>' +
      '<img alt="' + (img.alt || '') + '" loading="lazy">';
    /* Insère en tout premier */
    target.insertBefore(banner, target.firstChild);

    /* Charge l'image et anime l'apparition */
    var imgEl = banner.querySelector('img');
    imgEl.onload = function(){ imgEl.classList.add('loaded'); };
    imgEl.onerror = function(){
      /* Si Unsplash ne répond pas, on garde juste le gradient — la bannière reste élégante */
      banner.querySelector('.ks-banner-loader').textContent = '';
    };
    imgEl.src = img.url;
  }

  /* Init après que le DOM soit prêt */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
