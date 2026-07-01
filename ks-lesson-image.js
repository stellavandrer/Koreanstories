/* ═══════════════════════════════════════════════════════════════════
   ks-lesson-image.js — Bannière illustrée au-dessus de chaque leçon.
   ──────────────────────────────────────────────────────────────────
   Style Busuu / Bunpo : illustrations vectorielles SVG par scène.
   Source : unDraw.co (1000+ illustrations, MIT licensed, gratuit
   commercial). Servies via GitHub raw depuis le mirror :
   https://raw.githubusercontent.com/balazser/undraw-svg-collection/master/svgs/
   (jsDelivr renvoyait 503 sur ce repo → bannière bloquée sur « Chargement… »).

   On ne peut pas changer la couleur de la marque (gris #f2f2f2 fixe
   dans ces SVGs publics) mais le rendu est propre et cohérent.

   Module Hangeul EXCLU à la demande de l'utilisateur — l'alphabet
   se présente mieux sans bannière visuelle qui détournerait l'œil.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* unDraw via GitHub raw (jsDelivr renvoyait 503 sur ce repo) */
  var BASE = 'https://raw.githubusercontent.com/balazser/undraw-svg-collection/master/svgs/';

  /* ── Mapping page → nom de fichier unDraw ─────────────────────── */
  var CURATED = {
    /* === A1 === */
    'lecon5.html':  'hello',              /* Salutations */
    'lecon6.html':  'mathematics',        /* Chiffres */
    'lecon6b.html': 'calculator',         /* Chiffres natifs */
    'lecon7.html':  'family',             /* Famille */
    'lecon8.html':  'art',                /* Couleurs & adjectifs */
    'lecon10.html': 'breakfast',          /* Nourriture */
    'lecon11.html': 'journey',            /* Lieux quotidien */
    'lecon12.html': 'adventure-map',      /* Directions */
    'lecon13.html': 'art-thinking',       /* Négation */
    'lecon14.html': 'questions',          /* Questions */
    'lecon15.html': 'ideas',              /* Particules */
    'lecon16.html': 'learning',           /* Particules suite */
    'lecon41.html': 'forming-ideas',      /* Verbes */
    'lecon42.html': 'calendar',           /* Heure & jours */
    'lecon43.html': 'autumn',             /* Météo */
    'lecon44.html': 'counting-stars',     /* Compteurs */
    'lecon58.html': 'medicine',           /* Corps & santé */
    'lecon59.html': 'gone-shopping',      /* Vêtements & mode */
    'lecon60.html': 'feeling-happy',      /* Émotions */

    'exercice3.html': 'family',
    'exercice4.html': 'forming-ideas',
    'exercice5.html': 'product-tour',
    'exercice6.html': 'learning',
    'exercice24.html':'online-shopping',

    'histoire1.html': 'coffee-time',
    'histoire2.html': 'cooking',
    'histoire3.html': 'journey',
    'histoire29.html':'art-museum',
    'histoire30.html':'medicine',

    'quiz2.html': 'certificate',
    'quiz3.html': 'online-test',

    /* === A2 === */
    'lecon17.html': 'forming-ideas',
    'lecon18.html': 'connecting-teams',
    'lecon19.html': 'online-shopping',
    'lecon20.html': 'adventure',
    'lecon21.html': 'forming-ideas',
    'lecon22.html': 'in-progress',
    'lecon23.html': 'personal-goals',
    'lecon24.html': 'wishlist',
    'lecon25.html': 'forming-ideas',
    'lecon26.html': 'business-deal',
    'lecon27.html': 'calendar',
    'lecon45.html': 'forming-ideas',
    'lecon46.html': 'moment-to-remember',
    'lecon47.html': 'security-on',
    'lecon48.html': 'contrast',
    'lecon55.html': 'add-notes',
    'lecon56.html': 'forming-ideas',
    'lecon57.html': 'in-thought',

    'exercice7.html': 'add-notes',
    'exercice8.html': 'gone-shopping',
    'exercice9.html': 'business-deal',
    'exercice10.html':'forming-ideas',
    'exercice23.html':'add-notes',

    'histoire12.html':'loving-story',
    'histoire13.html':'happy-music',
    'histoire14.html':'travelers',
    'histoire15.html':'medicine',
    'histoire27.html':'art-museum',
    'histoire28.html':'cooking',

    'quiz4.html': 'certificate',

    /* === B1 === */
    'lecon28.html': 'forming-ideas',
    'lecon29.html': 'conversation',
    'lecon30.html': 'forming-ideas',
    'lecon31.html': 'forming-ideas',
    'lecon32.html': 'business-deal',
    'lecon33.html': 'business-deal',
    'lecon34.html': 'in-no-time',
    'lecon35.html': 'knowledge',
    'lecon49.html': 'add-notes',
    'lecon50.html': 'forming-ideas',
    'lecon51.html': 'forming-ideas',
    'lecon52.html': 'forming-ideas',
    'lecon53.html': 'in-no-time',
    'lecon54.html': 'forming-ideas',

    'exercice11.html':'forming-ideas',
    'exercice12.html':'business-deal',
    'exercice13.html':'add-notes',
    'exercice14.html':'online-test',
    'exercice15.html':'online-test',
    'exercice22.html':'reading-list',

    'histoire16.html':'co-workers',
    'histoire17.html':'travelers',
    'histoire18.html':'reading',
    'histoire19.html':'exams',
    'histoire25.html':'happy-music',
    'histoire26.html':'heartbroken',

    'pro4.html':     'co-workers',

    'quiz5.html':    'certificate',
    'quiz9.html':    'online-test',

    /* === B2 === */
    'lecon36.html': 'conversation',
    'lecon37.html': 'forming-ideas',
    'lecon38.html': 'newspaper',
    'lecon39.html': 'business-deal',
    'lecon40.html': 'forming-ideas',
    'lecon40b.html':'forming-ideas',
    'lecon40c.html':'business-deal',
    'lecon40d.html':'art',

    'exercice16.html':'public-discussion',
    'exercice17.html':'mobile-feed',
    'exercice18.html':'business-deal',
    'exercice19.html':'co-workers',
    'exercice20.html':'add-notes',
    'exercice21.html':'newspaper',

    'histoire20.html':'loving-story',
    'histoire21.html':'newspaper',
    'histoire22.html':'happy-music',
    'histoire23.html':'voice-control',
    'histoire24.html':'reading',

    'quiz6.html': 'online-test',
    'quiz7.html': 'add-notes',
    'quiz8.html': 'certificate',

    /* === Anecdotes & Conseils === */
    'anecdote1.html':  'art-museum',
    'anecdote2.html':  'art-museum',
    'anecdote3.html':  'art-museum',
    'anecdote4.html':  'art-museum',
    'anecdote5.html':  'art-museum',
    'anecdote6.html':  'art-museum',
    'anecdote7.html':  'art-museum',
    'anecdote8.html':  'art-museum',
    'anecdote9.html':  'cooking',
    'anecdote10.html': 'art-museum',
    'anecdote11.html': 'art-museum',
    'anecdote12.html': 'art-museum',
    'anecdote13.html': 'celebration',
    'anecdote14.html': 'coffee-with-friends',
    'anecdote15.html': 'feeling-of-joy',
    'anecdote16.html': 'business-deal',
    'anecdote17.html': 'cooking',
    'anecdote18.html': 'birthday-cake',
    'anecdote19.html': 'art-museum',

    'conseil1.html':   'knowledge',
    'conseil2.html':   'knowledge',
    'conseil3.html':   'knowledge',
    'conseil4.html':   'knowledge',
    'conseil5.html':   'knowledge',
    'conseil6.html':   'knowledge',
    'conseil7.html':   'voice-control',
    'conseil8.html':   'knowledge',

    'chanson1.html':   'compose-music',
    'chanson2.html':   'compose-music',
    'chanson3.html':   'compose-music',
    'chanson4.html':   'compose-music',
    'chanson5.html':   'compose-music',
    'chanson6.html':   'compose-music'
  };

  /* Fallback par préfixe — pour les pages absentes du mapping */
  var FALLBACK_BY_PREFIX = {
    'lecon':    'learning',
    'exercice': 'add-notes',
    'quiz':     'online-test',
    'histoire': 'reading',
    'anecdote': 'art-museum',
    'conseil':  'knowledge',
    'chanson':  'compose-music',
    'pro':      'co-workers'
  };

  /* ── Photos réelles locales (prioritaires sur unDraw) ──────────────
     Bannière = vraie photo générée (libre de droits) au lieu du dessin. */
  var LOCAL = {
    'anecdote1.html':  'img/anecdotes/sejong.webp',
    'anecdote2.html':  'img/anecdotes/bow.webp',
    'anecdote3.html':  'img/anecdotes/friends.webp',
    'anecdote4.html':  'img/anecdotes/chimaek.webp',
    'anecdote5.html':  'img/vocab/transport-metro.webp',
    'anecdote6.html':  'img/anecdotes/pcbang.webp',
    'anecdote7.html':  'img/anecdotes/kbeauty.webp',
    'anecdote8.html':  'img/anecdotes/noraebang.webp',
    'anecdote9.html':  'img/anecdotes/jeju.webp',
    'anecdote10.html': 'img/anecdotes/pcbang.webp',
    'anecdote11.html': 'img/anecdotes/books.webp',
    'anecdote12.html': 'img/anecdotes/friends.webp',
    'anecdote13.html': 'img/anecdotes/festival.webp',
    'anecdote14.html': 'img/anecdotes/cafe.webp',
    'anecdote15.html': 'img/anecdotes/kbeauty.webp',
    'anecdote16.html': 'img/anecdotes/hoesik.webp',
    'anecdote17.html': 'img/anecdotes/mukbang.webp',
    'anecdote18.html': 'img/anecdotes/age.webp',
    'anecdote19.html': 'img/anecdotes/superstition.webp',
    'anecdote20.html': 'img/anecdotes/konglish.webp',

    /* === Leçons A1 === */
    'lecon5.html':  'img/anecdotes/bow.webp',            /* Salutations */
    'lecon6.html':  'img/lessons/numbers.webp',          /* Chiffres */
    'lecon6b.html': 'img/lessons/numbers.webp',          /* Chiffres natifs */
    'lecon7.html':  'img/vocab/famille-famille.webp',    /* Famille */
    'lecon8.html':  'img/lessons/colors.webp',           /* Couleurs */
    'lecon10.html': 'img/lessons/food.webp',             /* Nourriture */
    'lecon11.html': 'img/lessons/places.webp',           /* Lieux */
    'lecon12.html': 'img/lessons/directions.webp',       /* Directions */
    'lecon13.html': 'img/lessons/study.webp',            /* Négation */
    'lecon14.html': 'img/anecdotes/books.webp',          /* Questions */
    'lecon15.html': 'img/lessons/study.webp',            /* Particules */
    'lecon16.html': 'img/anecdotes/books.webp',          /* Particules suite */
    'lecon41.html': 'img/lessons/study.webp',            /* Verbes */
    'lecon42.html': 'img/lessons/clock.webp',            /* Heure & jours */
    'lecon43.html': 'img/vocab/ex5-sky.webp',            /* Météo */
    'lecon44.html': 'img/lessons/numbers.webp',          /* Compteurs */
    'lecon58.html': 'img/vocab/famille-doctor.webp',     /* Corps & santé */
    'lecon59.html': 'img/vocab/magasin-jacket.webp',     /* Vêtements */
    'lecon60.html': 'img/anecdotes/friends.webp',        /* Émotions */
    'lecon64.html': 'img/vocab/resto-menu.webp',         /* Restaurant */
    'lecon65.html': 'img/vocab/decrire-longhair.webp',   /* Décrire qqn */
    'lecon66.html': 'img/vocab/transport-metro.webp',    /* Transports */
    'lecon67.html': 'img/vocab/loisir-film.webp',        /* Loisirs */

    /* === Leçons A2 === */
    'lecon17.html': 'img/lessons/study.webp',
    'lecon18.html': 'img/anecdotes/hoesik.webp',         /* Travail en équipe */
    'lecon19.html': 'img/vocab/magasin-store.webp',      /* Achats en ligne */
    'lecon20.html': 'img/lessons/travel.webp',           /* Voyage */
    'lecon21.html': 'img/anecdotes/books.webp',
    'lecon22.html': 'img/lessons/study.webp',
    'lecon23.html': 'img/lessons/study.webp',
    'lecon24.html': 'img/vocab/magasin-store.webp',      /* Envies / wishlist */
    'lecon25.html': 'img/anecdotes/books.webp',
    'lecon26.html': 'img/anecdotes/hoesik.webp',         /* Affaires */
    'lecon27.html': 'img/lessons/clock.webp',            /* Calendrier */
    'lecon45.html': 'img/lessons/study.webp',
    'lecon46.html': 'img/anecdotes/friends.webp',        /* Souvenir */
    'lecon47.html': 'img/lessons/study.webp',
    'lecon48.html': 'img/anecdotes/books.webp',
    'lecon55.html': 'img/lessons/study.webp',
    'lecon56.html': 'img/anecdotes/books.webp',
    'lecon57.html': 'img/lessons/study.webp',

    /* === Leçons B1 === */
    'lecon28.html': 'img/lessons/study.webp',
    'lecon29.html': 'img/anecdotes/friends.webp',        /* Conversation */
    'lecon30.html': 'img/lessons/study.webp',
    'lecon31.html': 'img/anecdotes/books.webp',
    'lecon32.html': 'img/lessons/meeting.webp',          /* Affaires */
    'lecon33.html': 'img/anecdotes/hoesik.webp',
    'lecon34.html': 'img/lessons/study.webp',
    'lecon35.html': 'img/anecdotes/books.webp',          /* Savoir */
    'lecon49.html': 'img/lessons/study.webp',
    'lecon50.html': 'img/anecdotes/books.webp',
    'lecon51.html': 'img/lessons/study.webp',
    'lecon52.html': 'img/anecdotes/books.webp',
    'lecon53.html': 'img/lessons/study.webp',
    'lecon54.html': 'img/anecdotes/books.webp',

    /* === Leçons B2 === */
    'lecon36.html': 'img/anecdotes/friends.webp',        /* Conversation */
    'lecon37.html': 'img/lessons/study.webp',
    'lecon38.html': 'img/lessons/newspaper.webp',        /* Presse */
    'lecon39.html': 'img/lessons/meeting.webp',          /* Affaires */
    'lecon40.html': 'img/lessons/study.webp',
    'lecon40b.html':'img/anecdotes/books.webp',
    'lecon40c.html':'img/lessons/meeting.webp',
    'lecon40d.html':'img/lessons/colors.webp',           /* Art */

    /* === Quiz / checkpoints === */
    'quiz2.html': 'img/lessons/certificate.webp',
    'quiz3.html': 'img/lessons/exam.webp',
    'quiz4.html': 'img/lessons/certificate.webp',
    'quiz5.html': 'img/lessons/certificate.webp',
    'quiz6.html': 'img/lessons/exam.webp',
    'quiz7.html': 'img/lessons/study.webp',
    'quiz8.html': 'img/lessons/certificate.webp',
    'quiz9.html': 'img/lessons/exam.webp'
  };

  /* ── Pages à NE PAS toucher ─────────────────────────────────────
     • Toutes les pages "Hangeul" (lecon 1-4 + 9, exercice 1-2, quiz1)
       → demande explicite : pas d'illustration sur le module alphabet
     • Toutes les pages utilitaires (dashboard, profil, etc.) */
  var EXCLUDED = {
    /* Hangeul — pas d'illustration */
    'lecon.html':1, 'lecon2.html':1, 'lecon3.html':1, 'lecon4.html':1, 'lecon9.html':1,
    'exercice1.html':1, 'exercice2.html':1, 'quiz1.html':1,
    /* Pages utilitaires */
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'histoires.html':1, 'challenge.html':1,
    'classement.html':1, 'revision.html':1, 'statistiques.html':1,
    'trophees.html':1, 'aide.html':1, 'ressources.html':1,
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'vocabulaire.html':1, 'hangeul.html':1,
    'histoires.html':1, 'exercice.html':1
  };

  function getIllustrationName(){
    var path = location.pathname.split('/').pop() || 'index.html';
    if (EXCLUDED[path]) return null;
    if (CURATED[path]) return CURATED[path];
    /* Fallback par préfixe */
    var prefixes = Object.keys(FALLBACK_BY_PREFIX);
    for (var i = 0; i < prefixes.length; i++) {
      if (path.indexOf(prefixes[i]) === 0) return FALLBACK_BY_PREFIX[prefixes[i]];
    }
    return null;
  }

  /* ── CSS partagé ────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-banner-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-banner-css';
    s.textContent = [
      '.ks-banner{',
        'position:relative;width:100%;',
        'margin:0 0 1.4rem;',
        'min-height:180px;',
        'overflow:hidden;border-radius:18px;',
        'background:linear-gradient(135deg,#FFF8EC 0%,#F5EAD5 50%,#FFF8EC 100%);',
        'border:1px solid rgba(201,169,110,.18);',
        'display:flex;align-items:center;justify-content:center;',
        'padding:18px;',
        'animation:ksBanIn .5s ease both',
      '}',
      '[data-theme="dark"] .ks-banner{',
        'background:linear-gradient(135deg,rgba(201,169,110,.10) 0%,rgba(11,28,52,.6) 50%,rgba(201,169,110,.10) 100%);',
        'border-color:rgba(201,169,110,.25)',
      '}',
      '@keyframes ksBanIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}',
      /* Filigrane décoratif Hangeul en arrière-plan, signature visuelle
         unique au site Korean Stories (aucun concurrent ne l'a). */
      '.ks-banner::before{',
        'content:"한";position:absolute;top:-30px;right:-12px;',
        'font-family:"Playfair Display",Georgia,serif;font-weight:700;',
        'font-size:160px;line-height:1;color:#C9A96E;opacity:.08;',
        'pointer-events:none;user-select:none;z-index:0',
      '}',
      '.ks-banner::after{',
        'content:"글";position:absolute;bottom:-40px;left:-8px;',
        'font-family:"Playfair Display",Georgia,serif;font-weight:700;',
        'font-size:140px;line-height:1;color:#C9A96E;opacity:.06;',
        'pointer-events:none;user-select:none;z-index:0',
      '}',
      '[data-theme="dark"] .ks-banner::before{opacity:.13}',
      '[data-theme="dark"] .ks-banner::after{opacity:.10}',
      /* Le SVG illustration au-dessus du filigrane */
      '.ks-banner-img{',
        'width:auto;max-width:88%;max-height:170px;display:block;',
        'opacity:0;transition:opacity .6s ease,transform .6s ease;',
        'position:relative;z-index:1;',
        'animation:ksFloat 6s ease-in-out infinite',
      '}',
      '.ks-banner-img.loaded{opacity:1}',
      /* Variante PHOTO réelle : l'image remplit toute la bannière. */
      '.ks-banner--photo{padding:0}',
      '.ks-banner-photo{position:absolute;inset:0;width:100%;height:100%;',
        'object-fit:cover;opacity:0;transition:opacity .5s ease;z-index:1}',
      '.ks-banner-photo.loaded{opacity:1}',
      /* Flottement subtil pour donner vie à la scène (3px d\'amplitude) */
      '@keyframes ksFloat{',
        '0%,100%{transform:translateY(0)}',
        '50%{transform:translateY(-4px)}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
        '.ks-banner-img{animation:none}',
      '}',
      '[data-theme="dark"] .ks-banner-img{filter:brightness(.92) contrast(1.05)}',
      '.ks-banner-loader{',
        'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
        'color:rgba(201,169,110,.5);font-size:11px;font-weight:700;',
        'letter-spacing:.12em;text-transform:uppercase;pointer-events:none;z-index:1',
      '}',
      '@media (max-width:480px){',
        '.ks-banner{min-height:140px;padding:12px}',
        '.ks-banner-img{max-height:130px}',
        '.ks-banner::before{font-size:110px;top:-20px;right:-8px}',
        '.ks-banner::after{font-size:90px;bottom:-25px;left:-5px}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Trouve le bon endroit pour injecter ──────────────────────── */
  function findInsertionPoint(){
    var paddedDiv = document.querySelector('main .main > div[style*="padding"], main > div[style*="padding"]');
    if (paddedDiv) return paddedDiv;
    var wrap = document.querySelector('.wrap');
    if (wrap) return wrap;
    var main = document.querySelector('main, .main, .shell');
    if (main) return main;
    return document.body;
  }

  /* Remplace les couleurs neutres d'unDraw par notre palette gold/navy.
     Ça nous donne un look unique (les concurrents utilisent les
     illustrations en gris par défaut). */
  function tintSVG(svgText){
    return svgText
      /* Bleu-gris foncé d'unDraw → notre or principal */
      .replace(/#3f3d56/gi, '#C9A96E')
      /* Gris clair primaire → or très clair, harmonise les fonds */
      .replace(/#f2f2f2/gi, '#FFF3DD')
      /* Gris secondaire → or pâle */
      .replace(/#e6e6e6/gi, '#F5E5C0')
      /* Gris tertiaire → or plus pâle */
      .replace(/#e4e4e4/gi, '#F5E5C0')
      /* Anthracite très foncé → navy de la marque */
      .replace(/#2f2e41/gi, '#1A3050');
  }

  /* Cache local pour éviter de re-fetch entre pages */
  var SVG_CACHE = {};

  function loadSVG(name){
    if (SVG_CACHE[name]) return Promise.resolve(SVG_CACHE[name]);
    return fetch(BASE + name + '.svg')
      .then(function(r){ if (!r.ok) throw new Error('404'); return r.text(); })
      .then(function(txt){ SVG_CACHE[name] = tintSVG(txt); return SVG_CACHE[name]; });
  }

  function inject(){
    /* Les pages histoireN ont désormais leur propre illustration IA
       (en-tête via ks-stories.js) → on n'ajoute pas la bannière générique. */
    var path = location.pathname.split('/').pop() || '';
    if (/^histoire\d+\.html$/i.test(path)) return;

    /* Priorité : vraie photo locale si disponible pour cette page. */
    var local = LOCAL[path];
    if (local) {
      var tp = findInsertionPoint();
      if (!tp || tp.querySelector('.ks-banner')) return;
      injectCSS();
      var bp = document.createElement('div');
      bp.className = 'ks-banner ks-banner--photo';
      var im = document.createElement('img');
      im.className = 'ks-banner-photo';
      im.alt = ''; im.loading = 'lazy';
      im.onload = function(){ im.classList.add('loaded'); };
      im.src = local;
      bp.appendChild(im);
      tp.insertBefore(bp, tp.firstChild);
      return;
    }

    var name = getIllustrationName();
    if (!name) return;

    var target = findInsertionPoint();
    if (!target) return;
    if (target.querySelector('.ks-banner')) return;

    injectCSS();

    var banner = document.createElement('div');
    banner.className = 'ks-banner';
    banner.innerHTML = '<div class="ks-banner-loader">Chargement…</div>';
    target.insertBefore(banner, target.firstChild);

    /* Sécurité : si la source ne répond pas vite, on retire la bannière
       au lieu de la laisser bloquée sur « Chargement… ». */
    var timeout = new Promise(function(_, reject){
      setTimeout(function(){ reject(new Error('timeout')); }, 8000);
    });
    Promise.race([loadSVG(name), timeout]).then(function(svgText){
      banner.innerHTML = svgText;
      var svg = banner.querySelector('svg');
      if (svg) {
        svg.classList.add('ks-banner-img');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.cssText = 'width:auto;max-width:90%;max-height:170px;display:block';
        /* Fade-in après un tick pour que l'opacité 0 → 1 transitionne */
        requestAnimationFrame(function(){
          svg.classList.add('loaded');
        });
      }
    }).catch(function(){
      banner.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
