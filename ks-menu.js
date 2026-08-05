/* ═══════════════════════════════════════════════════════════════════
   ks-menu.js — Menu hamburger global à sous-catégories.
   S'injecte tout seul : un bouton hamburger (dans la barre du haut .bar,
   sinon flottant) + un tiroir latéral organisé en rubriques.
   Réutilisable sur n'importe quelle page (charge le script, c'est tout).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__ksMenuLoaded) return;
  window.__ksMenuLoaded = true;

  /* ── Icônes (chemins SVG 24×24, stroke) ── */
  var IC = {
    learn:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
    album:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    book:'<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
    dico:'<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/><line x1="12" y1="7" x2="12" y2="21"/>',
    hangeul:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
    grammar:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    speak:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/>',
    bolt:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    mix:'<path d="M16 3h5v5"/><path d="M21 3l-7 7"/><path d="M8 21H3v-5"/><path d="M3 21l7-7"/>',
    check:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
    refresh:'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>',
    pen:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z"/><path d="M2 2l7.586 7.586"/>',
    cards:'<rect x="2" y="7" width="15" height="13" rx="2"/><path d="M7 7V5a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2h-2"/>',
    star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    note:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    heart:'<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>',
    chart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z"/><path d="M5 9a2 2 0 01-2-2V5h4M19 9a2 2 0 002-2V5h-4"/>',
    rank:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    user:'<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    res:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    blog:'<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>',
    crown:'<path d="M2 20h20M5 20V10l7-7 7 7v10"/><path d="M9 20v-5h6v5"/>'
  };

  var SECTIONS = [
    { title:'Apprendre', items:[
      ['cours.html','Parcours',IC.learn],
      ['histoires.html','Histoires',IC.book],
      ['vocabulaire.html','Vocabulaire par thème',IC.cards],
      ['dictionnaire.html','Dictionnaire',IC.dico],
      ['hangeul.html','Hangeul',IC.hangeul],
      ['grammaire.html','Grammaire',IC.grammar]
    ]},
    { title:'Pratiquer', items:[
      ['challenge.html','Défi du jour',IC.bolt],
      ['speaking.html','Speaking Practice',IC.speak],
      ['topik.html','Examen blanc TOPIK',IC.crown],
      ['daily-mix.html','Mix du jour',IC.mix],
      ['exercice.html','Exercices',IC.check],
      ['revision.html','Révisions',IC.refresh],
      ['ecriture.html','Écriture',IC.pen]
    ]},
    { title:'Ce que j\'ai gardé', items:[
      ['mes-mots.html','Mots enregistrés',IC.star],
      ['notes.html','Mes notes',IC.note],
      ['favoris.html','Pages favorites',IC.heart]
    ]},
    { title:'Ma progression', items:[
      ['statistiques.html','Statistiques',IC.chart],
      ['trophees.html','Trophées',IC.trophy],
      ['album.html','Album des histoires',IC.album],
      ['classement.html','Classement',IC.rank]
    ]},
    { title:'Compte & aide', items:[
      ['profil.html','Profil',IC.user],
      ['reglages.html','Réglages',IC.gear],
      ['#premium','Premium',IC.crown],
      ['ressources.html','Ressources',IC.res],
      ['blog.html','Blog',IC.blog],
      ['aide.html','Aide',IC.help]
    ]}
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* ── Styles ── */
  var css = [
    '.ksm-btn{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 13px;border-radius:100px;background:var(--goldbg,#FBF2E3);border:1.5px solid var(--gold,#C9A96E);cursor:pointer;color:var(--gold-text,#8B6B3D);font:700 12.5px/1 inherit;flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:.15s}',
    '.ksm-btn:hover{filter:brightness(.97)}',
    '.ksm-btn .ksm-ico{display:flex;flex-direction:column;justify-content:center;gap:3px;width:15px}',
    '.ksm-btn .ksm-ico i{display:block;height:2px;border-radius:2px;background:currentColor}',
    '.ksm-btn .ksm-txt{letter-spacing:.01em}',
    '.ksm-btn.ksm-float{position:fixed;top:calc(10px + env(safe-area-inset-top));left:12px;z-index:1200;background:var(--surf,#fff);border-color:var(--gold,#C9A96E);box-shadow:0 4px 14px rgba(0,0,0,.16);height:38px;padding:0 15px}',
    '.ksm-side-btn{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border-radius:12px;border:1px dashed var(--bd,#DAE3F2);background:transparent;color:var(--t2,#475E78);font:600 14px/1 inherit;cursor:pointer;margin-top:6px}',
    '.ksm-side-btn:hover{border-color:var(--gold,#C9A96E);color:var(--gold-text,#8B6B3D)}',
    '.ksm-side-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;flex-shrink:0}',
    '.ksm-overlay{position:fixed;inset:0;background:rgba(8,14,24,.55);backdrop-filter:blur(3px);opacity:0;visibility:hidden;transition:.3s;z-index:1300}',
    '.ksm-overlay.open{opacity:1;visibility:visible}',
    '.ksm-drawer{position:fixed;top:0;bottom:0;left:0;width:min(86vw,340px);background:var(--surf,#fff);z-index:1400;transform:translateX(-100%);transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:10px 0 40px rgba(0,0,0,.22)}',
    '.ksm-drawer.open{transform:none}',
    '.ksm-head{display:flex;align-items:center;justify-content:space-between;padding:calc(16px + env(safe-area-inset-top)) 18px 14px;border-bottom:1px solid var(--bd,#DAE3F2);flex-shrink:0}',
    '.ksm-logo{font-family:"Playfair Display",Georgia,serif;font-weight:700;font-size:19px;color:var(--t,#0D1823)}',
    '.ksm-logo em{color:var(--gold,#C9A96E);font-style:italic}',
    '.ksm-close{width:38px;height:38px;border-radius:10px;border:none;background:var(--s2,#F5F7FF);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2,#475E78)}',
    '.ksm-close svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}',
    '.ksm-body{flex:1;overflow-y:auto;padding:14px 12px calc(20px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}',
    '.ksm-sec{margin-bottom:16px}',
    '.ksm-sec-t{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--t3,#8FA5BE);padding:0 10px;margin-bottom:6px}',
    '.ksm-link{display:flex;align-items:center;gap:13px;padding:11px 12px;border-radius:11px;color:var(--t,#0D1823);text-decoration:none;font-size:14.5px;font-weight:500;transition:background .14s}',
    '.ksm-link:hover{background:var(--s2,#F5F7FF)}',
    '.ksm-link svg{width:19px;height:19px;stroke:var(--t3,#8FA5BE);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}',
    '.ksm-link.on{background:var(--goldbg,rgba(201,169,110,.1));color:var(--gold-text,#8B6B3D);font-weight:700}',
    '.ksm-link.on svg{stroke:var(--gold,#C9A96E)}',
    '.ksm-foot{padding:14px 16px;border-top:1px solid var(--bd,#DAE3F2);display:flex;gap:10px;flex-shrink:0}',
    '.ksm-foot a{flex:1;text-align:center;padding:11px;border-radius:11px;font-size:13.5px;font-weight:700;text-decoration:none}',
    '.ksm-cta{background:linear-gradient(135deg,#e0c48a,var(--gold,#C9A96E));color:#3a2c12}',
    '.ksm-ghost{border:1.5px solid var(--bd,#DAE3F2);color:var(--t2,#475E78)}',
    '.ksm-theme{width:100%;border:none;background:transparent;cursor:pointer;font:inherit;text-align:left}',
    '.ksm-theme #ksmThemeLbl{font-weight:500}',
    '.ksm-theme svg{stroke:var(--gold,#C9A96E)}',
    '.ksm-search{display:flex;align-items:center;gap:10px;width:100%;margin-bottom:16px;padding:12px 14px;border-radius:12px;border:1px solid var(--bd,#DAE3F2);background:var(--s2,#F5F7FF);color:var(--t3,#8FA5BE);font:500 14px/1 inherit;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent;transition:border-color .15s}',
    '.ksm-search:hover{border-color:var(--gold,#C9A96E)}',
    '.ksm-search svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;flex-shrink:0}',
    '.ksm-search kbd{margin-left:auto;font:600 11px/1 inherit;background:var(--surf,#fff);border:1px solid var(--bd,#DAE3F2);border-radius:5px;padding:3px 6px;color:var(--t3,#8FA5BE)}',
    '@media(max-width:600px){.ksm-search kbd{display:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css;
  document.head.appendChild(st);

  /* ── Construire le tiroir ── */
  function svg(p){ return '<svg viewBox="0 0 24 24">'+p+'</svg>'; }
  var html = '<div class="ksm-overlay" id="ksmOverlay"></div>'
    + '<aside class="ksm-drawer" id="ksmDrawer" role="dialog" aria-label="Menu" aria-modal="true">'
    + '<div class="ksm-head"><span class="ksm-logo">Korean <em>Stories</em></span>'
    + '<button class="ksm-close" id="ksmClose" aria-label="Fermer le menu"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    + '<div class="ksm-body">'
    + '<button class="ksm-search" id="ksmSearch" type="button" aria-label="Rechercher dans tout le parcours">'+svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')+'<span>Rechercher…</span><kbd>⌘K</kbd></button>';
  SECTIONS.forEach(function(sec){
    html += '<div class="ksm-sec"><div class="ksm-sec-t">'+sec.title+'</div>';
    sec.items.forEach(function(it){
      var on = (it[0].toLowerCase() === here) ? ' on' : '';
      if(it[0]==='#premium'){
        html += '<a class="ksm-link" href="#" onclick="event.preventDefault();if(window.KSPremium)KSPremium.openUpgrade();">'+svg(it[2])+'<span>'+it[1]+'</span></a>';
      } else {
        html += '<a class="ksm-link'+on+'" href="'+it[0]+'">'+svg(it[2])+'<span>'+it[1]+'</span></a>';
      }
    });
    html += '</div>';
  });
  html += '<div class="ksm-sec"><div class="ksm-sec-t">Affichage</div>'
    + '<button class="ksm-link ksm-theme" id="ksmTheme" type="button">'+svg('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>')+'<span id="ksmThemeLbl">Mode sombre</span></button>'
    + '</div>';
  html += '</div>'
    + '<div class="ksm-foot"><a class="ksm-ghost" href="index.html">Accueil</a><a class="ksm-cta" href="app.html">Mon espace</a></div>'
    + '</aside>';
  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  /* ── « Tu es ici » : surligne le hub d'une sous-page (orientation) ──
     Si aucun lien n'a matché exactement, on relie la famille de page
     (leçon, exercice, histoire, jeu…) à son entrée de menu. */
  if (!document.querySelector('.ksm-link.on')) {
    var HUBS = [
      [/^exercice\d/,                                            'exercice.html'],
      [/^histoire\d/,                                            'histoires.html'],
      [/^(lecon|quiz\d|jeu\d|flash\d|conseil\d|anecdote\d|pro\d|lect-|prem-)/, 'cours.html']
    ];
    for (var hi = 0; hi < HUBS.length; hi++) {
      if (HUBS[hi][0].test(here)) {
        var hub = document.querySelector('.ksm-link[href="' + HUBS[hi][1] + '"]');
        if (hub) hub.classList.add('on');
        break;
      }
    }
  }

  var overlay = document.getElementById('ksmOverlay');
  var drawer = document.getElementById('ksmDrawer');
  var menuTriggers = [];
  var lastFocused = null;

  function focusableIn(container){
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function(el){ return el.offsetParent !== null; });
  }
  function trapTab(e){
    if (e.key !== 'Tab') return;
    var f = focusableIn(drawer);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(){
    lastFocused = document.activeElement;
    overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow='hidden';
    menuTriggers.forEach(function(b){ b.setAttribute('aria-expanded','true'); });
    document.addEventListener('keydown', trapTab);
    var f = focusableIn(drawer);
    if (f.length) f[0].focus();
  }
  function close(){
    overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow='';
    menuTriggers.forEach(function(b){ b.setAttribute('aria-expanded','false'); });
    document.removeEventListener('keydown', trapTab);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  overlay.addEventListener('click', close);
  document.getElementById('ksmClose').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && drawer.classList.contains('open')) close(); });

  /* ── Recherche globale (remplace le bouton loupe flottant) ── */
  var searchBtn = document.getElementById('ksmSearch');
  function openSearch(tries){
    if (window.KSSearch && window.KSSearch.open) { window.KSSearch.open(); return; }
    if (tries > 0) setTimeout(function(){ openSearch(tries - 1); }, 120);
  }
  if (searchBtn) searchBtn.addEventListener('click', function(){
    close();
    setTimeout(function(){ openSearch(10); }, 180);
  });

  /* ── Bascule thème (le menu remplace le bouton de l'ancienne sidebar) ── */
  var themeBtn = document.getElementById('ksmTheme'), themeLbl = document.getElementById('ksmThemeLbl');
  function ksmDark(){ return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function ksmThemeSync(){ if (themeLbl) themeLbl.textContent = ksmDark() ? 'Mode clair' : 'Mode sombre'; }
  ksmThemeSync();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    if (typeof window.toggleTheme === 'function') { window.toggleTheme(); }
    else {
      var d = !ksmDark();
      if (d) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('ks_theme', d ? 'dark' : 'light'); } catch (e) {}
    }
    ksmThemeSync();
  });

  /* ── Bouton déclencheur ── */
  function makeBtn(cls){ var b=document.createElement('button'); b.className='ksm-btn'+(cls?' '+cls:''); b.setAttribute('aria-label','Ouvrir le menu'); b.setAttribute('aria-expanded','false'); b.innerHTML='<span class="ksm-ico"><i></i><i></i><i></i></span><span class="ksm-txt">Menu</span>'; b.addEventListener('click',open); menuTriggers.push(b); return b; }
  var bar = document.querySelector('nav.bar, .bar, .read-top, .top');
  var barBtn = null;
  if (bar) { barBtn = makeBtn(); bar.insertBefore(barBtn, bar.firstChild); }
  else { document.body.appendChild(makeBtn('ksm-float')); }
  /* Sur desktop avec sidebar, ajoute un accès « Tout le menu » */
  var sideNav = document.querySelector('.side-nav');
  if (sideNav) {
    /* La sidebar fournit déjà la navigation : on masque le bouton « Menu » de la
       barre quand la sidebar est RÉELLEMENT visible (évite le doublon), et on le
       réaffiche dès qu'elle est cachée (mobile). Basé sur la visibilité réelle,
       pas sur un breakpoint supposé → sûr sur toutes les pages. */
    if (barBtn) {
      var syncBtn = function(){ barBtn.style.display = (sideNav.offsetParent !== null) ? 'none' : ''; };
      syncBtn();
      window.addEventListener('resize', syncBtn);
    }
    var sb = document.createElement('button');
    sb.className = 'ksm-side-btn';
    sb.setAttribute('aria-expanded', 'false');
    sb.innerHTML = '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg> Tout le menu';
    sb.addEventListener('click', open);
    menuTriggers.push(sb);
    sideNav.appendChild(sb);
  }

  /* ── Logo cliquable → tableau de bord (app.html), sur toutes les pages ── */
  document.querySelectorAll('.bar-logo, .side-logo, .ksm-logo').forEach(function (lg) {
    lg.style.cursor = 'pointer';
    lg.style.pointerEvents = 'auto';
    lg.setAttribute('role', 'link');
    lg.setAttribute('aria-label', 'Aller au tableau de bord');
    lg.setAttribute('tabindex', '0');
    lg.addEventListener('click', function () { location.href = 'app.html'; });
    lg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = 'app.html'; }
    });
  });
})();
