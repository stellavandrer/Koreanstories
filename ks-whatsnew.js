/* ═══════════════════════════════════════════════════════════════════
   ks-whatsnew.js — Modal "Quoi de neuf" pour annoncer les nouveautés.
   ──────────────────────────────────────────────────────────────────
   - S'affiche une fois sur app.html quand il y a des features non vues
   - Liste les features ajoutées récemment avec icône + description + CTA
   - Storage : ks_features_seen (array d'IDs déjà vus)
   - Mode "Manuel" : KSWhatsNew.show() pour le re-déclencher (Réglages)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Liste des features à annoncer ──────────────────────────────
     Les plus récentes en premier. Chaque ajout reçoit un id inédit :
     un utilisateur qui a déjà « tout vu » se verra notifié uniquement
     des nouveautés ajoutées après son passage. */
  var FEATURES = [
    {
      id: 'dailymix',
      title: 'Le Mix du jour',
      desc: 'Une nouvelle session chaque jour qui pioche dans tout ce que tu as appris : vocabulaire, écoute, particules, écriture. La révision quotidienne qui ancre vraiment.',
      icon: 'cycle',
      color: '#C9A96E',
      cta: 'Faire mon mix',
      href: 'daily-mix.html'
    },
    {
      id: 'ecriture',
      title: 'Atelier d\'écriture',
      desc: 'Un vrai clavier coréen intégré pour apprendre à taper le Hangeul — copie, dictée audio et traduction, du Hangeul au B1. Sans rien installer.',
      icon: 'keyboard',
      color: '#0D9488',
      cta: 'Ouvrir l\'atelier',
      href: 'ecriture.html'
    },
    {
      id: 'voixstudio',
      title: 'Studio des voix',
      desc: 'Écoute chaque personnage des histoires et compare les voix naturelles. Toutes nos prononciations sont des voix neuronales — jamais de voix robotique.',
      icon: 'mic',
      color: '#0EA5E9',
      cta: 'Écouter les voix',
      href: 'voix.html'
    },
    {
      id: 'trophies',
      title: 'Trophées & badges',
      desc: 'Débloque des badges de régularité, de maîtrise et un badge par bloc thématique terminé. Suis tout depuis ta page Trophées.',
      icon: 'trophy',
      color: '#B8924E',
      cta: 'Voir mes trophées',
      href: 'trophees.html'
    },
    {
      id: 'offline',
      title: 'Mode hors-ligne',
      desc: 'Télécharge tout le parcours et l\'audio pour apprendre dans l\'avion, le métro ou sans forfait. Disponible dans Réglages → Mode hors-ligne.',
      icon: 'download',
      color: '#16A34A',
      cta: 'Configurer',
      href: 'reglages.html'
    },
    {
      id: 'blog',
      title: 'Le blog Korean Stories',
      desc: 'Des guides pratiques et vérifiés sur la Corée : voyage, cuisine, culture et méthode — avec les mots coréens prononcés par des voix coréennes naturelles.',
      icon: 'news',
      color: '#7C3AED',
      cta: 'Lire le blog',
      href: 'blog.html'
    },
    {
      id: 'favoris',
      title: 'Sauvegarde tes leçons',
      desc: 'Touche le marque-page en haut de chaque leçon pour la sauvegarder. Retrouve-les toutes dans "Mes favoris".',
      icon: 'bookmark',
      color: '#C9A96E',
      cta: 'Voir mes favoris',
      href: 'favoris.html'
    },
    {
      id: 'notes',
      title: 'Notes personnelles',
      desc: 'Écris tes propres mémorisations sur chaque leçon. Auto-sauvegardées, synchronisées sur tous tes appareils.',
      icon: 'edit',
      color: '#8B5CF6',
      cta: 'Mes notes',
      href: 'notes.html'
    },
    {
      id: 'search',
      title: 'Recherche instantanée',
      desc: 'Trouve n\'importe quelle leçon en une seconde. Raccourci ⌘K (Mac) ou Ctrl+K (Windows) — ou clique sur le bouton flottant.',
      icon: 'search',
      color: '#3B82F6',
      cta: 'Essayer ⌘K',
      action: 'openSearch'
    },
    {
      id: 'pronounce',
      title: 'Prononciation au micro',
      desc: 'Pratique ton accent avec ton vrai micro. L\'IA évalue ta prononciation (vert / orange / rouge) et tu gagnes des XP.',
      icon: 'mic',
      color: '#0D9488',
      cta: 'Pratiquer',
      href: 'prononciation.html'
    },
    {
      id: 'navigation',
      title: 'Navigation intelligente',
      desc: 'En bas de chaque leçon : barre Précédent / Suivant pour naviguer dans le parcours. Bouton retour qui ramène toujours au bon endroit.',
      icon: 'route',
      color: '#16A34A',
      cta: 'Voir le parcours',
      href: 'cours.html'
    },
    {
      id: 'illustrations',
      title: 'Illustrations sur chaque leçon',
      desc: 'Bannières visuelles unDraw, teintées au gold de la marque + filigrane 한글 pour ancrer culturellement chaque leçon.',
      icon: 'image',
      color: '#DB2777',
      cta: null,
      href: null
    }
  ];

  /* ── Storage ──────────────────────────────────────────────── */
  function getSeen(){
    try { return JSON.parse(localStorage.getItem('ks_features_seen') || '[]'); }
    catch(e){ return []; }
  }
  function setSeen(arr){
    try { localStorage.setItem('ks_features_seen', JSON.stringify(arr)); }
    catch(e){}
  }
  function markAllSeen(){
    setSeen(FEATURES.map(function(f){ return f.id; }));
  }
  function getUnseen(){
    var seen = getSeen();
    return FEATURES.filter(function(f){ return seen.indexOf(f.id) < 0; });
  }

  /* ── Icônes ──────────────────────────────────────────────── */
  var ICONS = {
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    edit:     '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    mic:      '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
    route:    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    image:    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    sparkle:  '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    cycle:    '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    keyboard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
    trophy:   '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    news:     '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
  };
  function svg(name){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name]||ICONS.sparkle) + '</svg>';
  }

  /* ── CSS ─────────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-whatsnew-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-whatsnew-css';
    s.textContent = [
      '.ks-wn-overlay{',
        'position:fixed;inset:0;z-index:9800;background:rgba(8,14,24,.65);',
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
        'opacity:0;pointer-events:none;transition:opacity .25s;',
        'display:flex;align-items:center;justify-content:center;padding:20px',
      '}',
      '.ks-wn-overlay.show{opacity:1;pointer-events:auto}',
      '.ks-wn-modal{',
        'background:linear-gradient(160deg,#152030 0%,#0F1B2D 100%);',
        'color:#f7f8fa;border-radius:24px;width:100%;max-width:480px;',
        'max-height:calc(100vh - 40px);overflow:hidden;',
        'box-shadow:0 24px 64px rgba(0,0,0,.55);',
        'border:1.5px solid rgba(201,169,110,.35);',
        'animation:ksWnIn .35s cubic-bezier(.34,1.2,.64,1);',
        'display:flex;flex-direction:column',
      '}',
      '@keyframes ksWnIn{from{opacity:0;transform:translateY(20px) scale(.94)}to{opacity:1;transform:none}}',
      '@media (max-width:480px){.ks-wn-modal{border-radius:20px}}',

      /* Header avec emblem doré */
      '.ks-wn-head{',
        'padding:26px 22px 18px;text-align:center;position:relative;',
        'border-bottom:1px solid rgba(255,255,255,.08)',
      '}',
      '.ks-wn-emblem{',
        'width:54px;height:54px;border-radius:50%;margin:0 auto 12px;',
        'background:linear-gradient(135deg,#C9A96E,#E8C589);',
        'display:flex;align-items:center;justify-content:center;color:#0a1220;',
        'box-shadow:0 6px 20px rgba(201,169,110,.4)',
      '}',
      '.ks-wn-emblem svg{width:24px;height:24px;stroke-width:2.5;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}',
      '.ks-wn-title{',
        'font-family:"Playfair Display",Georgia,serif;font-weight:700;font-size:24px;',
        'color:#fff;line-height:1.2;margin:0 0 4px',
      '}',
      '.ks-wn-title em{color:#C9A96E;font-style:italic}',
      '.ks-wn-sub{font-size:12.5px;color:rgba(247,248,250,.6);line-height:1.55;margin:0 auto;max-width:340px}',
      '.ks-wn-close{',
        'position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);',
        'border:none;padding:6px 9px;border-radius:8px;color:rgba(247,248,250,.7);',
        'cursor:pointer;font-size:16px;line-height:1;font-family:inherit',
      '}',
      '.ks-wn-close:hover{background:rgba(255,255,255,.14);color:#fff}',

      /* Liste de features (scrollable si beaucoup) */
      '.ks-wn-list{padding:14px 14px;overflow-y:auto;max-height:50vh;-webkit-overflow-scrolling:touch}',
      '.ks-wn-item{',
        'display:flex;align-items:flex-start;gap:13px;padding:14px 12px;',
        'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);',
        'border-radius:14px;margin-bottom:8px;transition:background .15s,border-color .15s',
      '}',
      '.ks-wn-item:hover{background:rgba(255,255,255,.05);border-color:rgba(201,169,110,.25)}',
      '.ks-wn-item-ic{',
        'flex-shrink:0;width:42px;height:42px;border-radius:12px;',
        'display:flex;align-items:center;justify-content:center;',
        'background:rgba(201,169,110,.13);color:var(--ic-color,#C9A96E)',
      '}',
      '.ks-wn-item-ic svg{width:20px;height:20px;stroke-width:2;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}',
      '.ks-wn-item-body{flex:1;min-width:0}',
      '.ks-wn-item-title{font-size:14px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:3px}',
      '.ks-wn-item-desc{font-size:12px;color:rgba(247,248,250,.65);line-height:1.55;margin-bottom:7px}',
      '.ks-wn-item-cta{',
        'display:inline-flex;align-items:center;gap:4px;background:none;border:none;',
        'color:#C9A96E;font-size:11.5px;font-weight:700;cursor:pointer;',
        'font-family:inherit;padding:2px 0;text-decoration:none',
      '}',
      '.ks-wn-item-cta:hover{text-decoration:underline}',
      '.ks-wn-item-cta svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}',
      '.ks-wn-badge{',
        'flex-shrink:0;font-size:9px;font-weight:800;letter-spacing:.06em;',
        'padding:2px 6px;border-radius:5px;background:rgba(201,169,110,.18);color:#E8C589;',
        'text-transform:uppercase;align-self:flex-start;margin-top:3px',
      '}',

      /* Footer avec bouton principal */
      '.ks-wn-foot{',
        'padding:14px 18px 18px;border-top:1px solid rgba(255,255,255,.08);',
        'display:flex;justify-content:center',
      '}',
      '.ks-wn-done{',
        'flex:1;padding:13px 18px;border-radius:12px;',
        'background:#C9A96E;color:#0a1220;border:none;cursor:pointer;',
        'font-size:14px;font-weight:800;font-family:inherit;',
        'transition:background .15s,transform .1s',
      '}',
      '.ks-wn-done:hover{background:#D4B582}',
      '.ks-wn-done:active{transform:scale(.98)}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Rendu et logique ──────────────────────────────────────── */
  function renderModal(items){
    var listHtml = items.map(function(f){
      var ctaHtml = '';
      if (f.cta) {
        if (f.href) {
          ctaHtml = '<a href="' + f.href + '" class="ks-wn-item-cta">' + f.cta +
                    ' <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>';
        } else if (f.action) {
          ctaHtml = '<button type="button" class="ks-wn-item-cta" data-action="' + f.action + '">' + f.cta +
                    ' <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></button>';
        }
      }
      return '<div class="ks-wn-item" style="--ic-color:' + f.color + '">' +
        '<div class="ks-wn-item-ic" style="background:rgba(' + hex2rgb(f.color) + ',.13);color:' + f.color + '">' + svg(f.icon) + '</div>' +
        '<div class="ks-wn-item-body">' +
          '<div class="ks-wn-item-title">' + f.title + '</div>' +
          '<div class="ks-wn-item-desc">' + f.desc + '</div>' +
          ctaHtml +
        '</div>' +
        '<span class="ks-wn-badge">Nouveau</span>' +
      '</div>';
    }).join('');

    return '<div class="ks-wn-modal" role="dialog" aria-modal="true" aria-labelledby="ksWnTitle">' +
      '<div class="ks-wn-head">' +
        '<button class="ks-wn-close" aria-label="Fermer">&times;</button>' +
        '<div class="ks-wn-emblem">' + svg('sparkle') + '</div>' +
        '<h2 class="ks-wn-title" id="ksWnTitle">Quoi de <em>neuf</em></h2>' +
        '<p class="ks-wn-sub">Plein de nouvelles fonctionnalités sont arrivées sur Korean Stories. Tu pourras les retrouver dans Réglages → Aide.</p>' +
      '</div>' +
      '<div class="ks-wn-list">' + listHtml + '</div>' +
      '<div class="ks-wn-foot">' +
        '<button class="ks-wn-done" data-action="dismiss">C\'est compris, merci !</button>' +
      '</div>' +
    '</div>';
  }

  function hex2rgb(hex){
    var h = hex.replace('#','');
    if (h.length === 3) h = h.split('').map(function(c){return c+c;}).join('');
    var r = parseInt(h.substr(0,2),16);
    var g = parseInt(h.substr(2,2),16);
    var b = parseInt(h.substr(4,2),16);
    return r+','+g+','+b;
  }

  function showModal(forceAll){
    injectCSS();
    if (document.querySelector('.ks-wn-overlay')) return;
    var items = forceAll ? FEATURES : getUnseen();
    if (!items.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'ks-wn-overlay';
    overlay.innerHTML = renderModal(items);
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.classList.add('show'); });

    function dismiss(){
      overlay.classList.remove('show');
      setTimeout(function(){ if (overlay.parentNode) overlay.remove(); }, 250);
      markAllSeen();
    }

    overlay.querySelector('.ks-wn-close').addEventListener('click', dismiss);
    overlay.querySelector('[data-action="dismiss"]').addEventListener('click', dismiss);
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) dismiss();
    });

    /* CTAs avec action spéciale (ex: openSearch) */
    overlay.querySelectorAll('[data-action="openSearch"]').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault();
        dismiss();
        setTimeout(function(){
          if (window.KSSearch && window.KSSearch.open) window.KSSearch.open();
        }, 300);
      });
    });

    /* Esc pour fermer */
    function escHandler(e){
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', escHandler); }
    }
    document.addEventListener('keydown', escHandler);
  }

  /* ── Auto-affichage sur app.html ────────────────────────── */
  function maybeShow(){
    var path = location.pathname.split('/').pop() || '';
    if (path !== 'app.html') return;
    /* Tout nouvel utilisateur : rien n'est « nouveau » pour lui — on
       marque tout comme vu sans afficher la modale. Il ne sera notifié
       que des fonctionnalités ajoutées APRÈS son arrivée. */
    try {
      if (!localStorage.getItem('ks_xp') && !localStorage.getItem('ks_lastplay')) {
        markAllSeen();
        return;
      }
    } catch (e) {}
    /* Attend que la page ait fini de s'animer + le tour si présent */
    var delay = 1500;
    /* Skip si tour en cours */
    var tourMaskExists = function(){ return !!document.getElementById('ks-tour-mask'); };
    var tryShow = function(){
      if (tourMaskExists()) {
        setTimeout(tryShow, 500);
        return;
      }
      if (getUnseen().length > 0) showModal(false);
    };
    setTimeout(tryShow, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeShow);
  } else {
    maybeShow();
  }

  /* ── API publique ──────────────────────────────────────── */
  window.KSWhatsNew = {
    show: function(){ showModal(true); },
    reset: function(){ try { localStorage.removeItem('ks_features_seen'); } catch(e){} },
    markSeen: markAllSeen,
    features: function(){ return FEATURES.slice(); }
  };
})();
