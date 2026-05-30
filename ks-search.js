/* ═══════════════════════════════════════════════════════════════════
   ks-search.js — Recherche globale instantanée.
   ──────────────────────────────────────────────────────────────────
   - Bouton flottant en bas à droite (touch friendly)
   - Raccourci ⌘K / Ctrl+K pour ouvrir le modal
   - Recherche en temps réel dans :
     · Activités du curriculum (KSCurriculum.activities)
     · Pages utilitaires (Trophées, Favoris, Statistiques, etc.)
     · Recherches récentes (ks_search_recent)
   - Score de pertinence + highlight des matches
   - Navigation clavier (↑↓ pour parcourir, Entrée pour ouvrir)
   - État vide pédagogique + raccourcis suggérés
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Pages où le bouton ne s'affiche PAS ──────────────────────── */
  var HIDE_BUTTON_ON = {
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'index.html':1
  };
  function currentPath(){
    return location.pathname.split('/').pop() || 'index.html';
  }
  if (HIDE_BUTTON_ON[currentPath()]) return;

  /* ── Quick actions (pages utilitaires + raccourcis) ─────────── */
  var QUICK_ACTIONS = [
    { type:'page', title:'Tableau de bord',         sub:'Vue d\'ensemble', href:'app.html',           icon:'home' },
    { type:'page', title:'Parcours',                sub:'Toutes les leçons',         href:'cours.html',         icon:'route' },
    { type:'page', title:'Histoires',               sub:'Lecture immersive',         href:'lecture.html',       icon:'book' },
    { type:'page', title:'Défi du jour',            sub:'Mission quotidienne',       href:'challenge.html',     icon:'bolt' },
    { type:'page', title:'Records',                 sub:'Classement communauté',     href:'classement.html',    icon:'trophy' },
    { type:'page', title:'Profil',                  sub:'XP, streaks, badges',       href:'profil.html',        icon:'user' },
    { type:'page', title:'Mes favoris',             sub:'Leçons sauvegardées',       href:'favoris.html',       icon:'bookmark' },
    { type:'page', title:'Mes notes',                sub:'Notes personnelles sur les leçons', href:'notes.html', icon:'edit' },
    { type:'page', title:'Mes mots',                 sub:'Vocabulaire sauvegardé via le tap-translate', href:'mes-mots.html', icon:'words' },
    { type:'page', title:'Trophées',                sub:'Tous les accomplissements', href:'trophees.html',      icon:'medal' },
    { type:'page', title:'Statistiques',            sub:'Détails chiffrés',          href:'statistiques.html',  icon:'chart' },
    { type:'page', title:'Révisions',               sub:'SRS, mots ratés',           href:'revision.html',      icon:'refresh' },
    { type:'page', title:'Prononciation',           sub:'Au micro, IA d\'évaluation',href:'prononciation.html', icon:'mic' },
    { type:'page', title:'Vocabulaire',             sub:'Tous les mots appris',      href:'vocabulaire.html',   icon:'words' },
    { type:'page', title:'Hangeul — Alphabet',      sub:'Référence complète',        href:'hangeul.html',       icon:'letters' },
    { type:'page', title:'Ressources PDF',          sub:'Téléchargements',           href:'ressources.html',    icon:'download' },
    { type:'page', title:'Réglages',                sub:'Compte, voix, thème',       href:'reglages.html',      icon:'gear' },
    { type:'page', title:'Aide & FAQ',              sub:'17 questions fréquentes',   href:'aide.html',          icon:'help' },
    { type:'action', title:'Voir les nouveautés',   sub:'Découvre les dernières fonctionnalités', href:'#whatsnew', icon:'gift' }
  ];

  /* ── Icônes SVG ─────────────────────────────────────────────── */
  var ICONS = {
    home:     '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    route:    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    book:     '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
    bolt:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    trophy:   '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    medal:    '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/>',
    chart:    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    refresh:  '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
    mic:      '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
    words:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    letters:  '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    edit:     '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    gift:     '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>',
    gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    help:     '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    lesson:   '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    quiz:     '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    histoire: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
    exercice: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    anecdote: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>',
    conseil:  '<polyline points="22 4 12 14.01 9 11.01"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    chanson:  '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
  };

  function svg(name){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
           (ICONS[name] || ICONS.lesson) + '</svg>';
  }

  /* ── CSS ─────────────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-search-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-search-css';
    s.textContent = [
      /* Bouton flottant */
      '.ks-search-fab{',
        'position:fixed;bottom:calc(76px + env(safe-area-inset-bottom));right:16px;',
        'z-index:9500;width:52px;height:52px;border-radius:50%;',
        'background:linear-gradient(135deg,#C9A96E,#D4B582);color:#0a1220;',
        'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 8px 24px rgba(201,169,110,.4);transition:all .2s;',
        '-webkit-tap-highlight-color:transparent',
      '}',
      '.ks-search-fab:hover{transform:scale(1.08)}',
      '.ks-search-fab:active{transform:scale(.95)}',
      '.ks-search-fab svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}',
      /* Sur desktop ≥ 960 : pill avec hint ⌘K, mais reste en BAS à droite
         pour ne pas chevaucher le top bar sticky (56px de haut). */
      '@media (min-width:960px){',
        '.ks-search-fab{',
          /* on conserve bottom + right, on ne remonte plus en haut */
          'width:auto;height:auto;',
          'border-radius:12px;padding:8px 14px;',
          'box-shadow:0 4px 16px rgba(0,0,0,.12);',
          'background:rgba(255,255,255,.92);color:#374151;backdrop-filter:blur(10px);',
          'border:1px solid rgba(0,0,0,.06)',
        '}',
        '.ks-search-fab::after{',
          'content:"⌘K";margin-left:8px;font-size:11px;font-weight:700;',
          'padding:2px 6px;border-radius:5px;',
          'background:rgba(0,0,0,.06);font-family:inherit',
        '}',
        '[data-theme="dark"] .ks-search-fab{background:rgba(15,27,45,.85);color:#e5e7eb;border-color:rgba(255,255,255,.08)}',
        '[data-theme="dark"] .ks-search-fab::after{background:rgba(255,255,255,.08)}',
      '}',

      /* Overlay */
      '.ks-search-overlay{',
        'position:fixed;inset:0;z-index:9700;background:rgba(8,14,24,.6);',
        'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
        'display:flex;align-items:flex-start;justify-content:center;',
        'padding:80px 16px 16px;opacity:0;pointer-events:none;',
        'transition:opacity .2s',
      '}',
      '.ks-search-overlay.show{opacity:1;pointer-events:auto}',
      '@media (max-width:480px){.ks-search-overlay{padding:24px 12px 12px;align-items:stretch}}',

      /* Modal */
      '.ks-search-modal{',
        'background:#fff;color:#111;border-radius:20px;width:100%;max-width:560px;',
        'max-height:calc(100vh - 96px);display:flex;flex-direction:column;',
        'box-shadow:0 24px 60px rgba(0,0,0,.35);overflow:hidden;',
        'animation:ksSearchIn .3s cubic-bezier(.34,1.2,.64,1)',
      '}',
      '[data-theme="dark"] .ks-search-modal{background:#152030;color:#f7f8fa}',
      '@keyframes ksSearchIn{from{opacity:0;transform:translateY(-12px) scale(.96)}to{opacity:1;transform:none}}',
      '@media (max-width:480px){.ks-search-modal{max-height:100%;border-radius:16px}}',

      /* Input header */
      '.ks-search-header{',
        'display:flex;align-items:center;gap:.6rem;padding:14px 18px;',
        'border-bottom:1px solid rgba(0,0,0,.08)',
      '}',
      '[data-theme="dark"] .ks-search-header{border-color:rgba(255,255,255,.08)}',
      '.ks-search-header svg{width:18px;height:18px;color:#C9A96E;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;flex-shrink:0}',
      '.ks-search-input{',
        'flex:1;border:none;outline:none;background:transparent;',
        'font-size:16px;font-family:inherit;color:inherit;padding:6px 0',
      '}',
      '.ks-search-input::placeholder{color:#9ca3af}',
      '.ks-search-esc{',
        'background:rgba(0,0,0,.06);border:none;padding:3px 8px;border-radius:6px;',
        'font-size:10px;font-weight:700;color:#6b7280;font-family:inherit;cursor:pointer;',
        'letter-spacing:.05em',
      '}',
      '[data-theme="dark"] .ks-search-esc{background:rgba(255,255,255,.08);color:#9ca3af}',

      /* Sections */
      '.ks-search-section{padding:8px 12px}',
      '.ks-search-section-title{',
        'padding:6px 8px;font-size:11px;font-weight:800;letter-spacing:.08em;',
        'text-transform:uppercase;color:#9ca3af',
      '}',
      '.ks-search-results{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}',

      /* Result item */
      '.ks-search-item{',
        'display:flex;align-items:center;gap:.8rem;padding:10px 10px;border-radius:10px;',
        'cursor:pointer;text-decoration:none;color:inherit;transition:background .12s',
      '}',
      '.ks-search-item:hover,.ks-search-item.active{background:rgba(201,169,110,.08)}',
      '[data-theme="dark"] .ks-search-item:hover,[data-theme="dark"] .ks-search-item.active{background:rgba(201,169,110,.13)}',
      '.ks-search-item-ico{',
        'flex-shrink:0;width:34px;height:34px;border-radius:10px;',
        'background:rgba(201,169,110,.13);color:#C9A96E;',
        'display:flex;align-items:center;justify-content:center',
      '}',
      '.ks-search-item-ico svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}',
      '.ks-search-item-body{flex:1;min-width:0}',
      '.ks-search-item-title{font-size:13.5px;font-weight:600;line-height:1.3;color:inherit}',
      '.ks-search-item-sub{font-size:11.5px;color:#9ca3af;margin-top:1px;line-height:1.35;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.ks-search-item-tag{',
        'flex-shrink:0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;',
        'padding:2px 6px;border-radius:5px;background:rgba(0,0,0,.06);color:#6b7280',
      '}',
      '[data-theme="dark"] .ks-search-item-tag{background:rgba(255,255,255,.08);color:#9ca3af}',
      '.ks-search-item-tag.lvl-hangeul{background:rgba(184,146,78,.18);color:#B8924E}',
      '.ks-search-item-tag.lvl-a1{background:rgba(37,99,235,.15);color:#2563EB}',
      '.ks-search-item-tag.lvl-a2{background:rgba(22,163,74,.15);color:#16A34A}',
      '.ks-search-item-tag.lvl-b1{background:rgba(245,158,11,.18);color:#D97706}',
      '.ks-search-item-tag.lvl-b2{background:rgba(124,58,237,.15);color:#7C3AED}',
      '.ks-search-item-tag.soon{background:rgba(156,163,175,.18);color:#6b7280}',
      '.ks-search-item-tag.done{background:rgba(22,163,74,.15);color:#16A34A}',

      /* Highlight matches */
      '.ks-search-match{background:rgba(201,169,110,.35);color:inherit;font-weight:700;padding:0 1px;border-radius:2px}',

      /* Empty state */
      '.ks-search-empty{padding:36px 20px;text-align:center;color:#9ca3af}',
      '.ks-search-empty-ico{width:40px;height:40px;margin:0 auto 8px;color:#C9A96E;opacity:.6}',
      '.ks-search-empty-ico svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8}',
      '.ks-search-empty p{font-size:13px;line-height:1.5;margin:.3rem 0}',
      '.ks-search-empty strong{color:#374151}',
      '[data-theme="dark"] .ks-search-empty strong{color:#d1d5db}',

      /* Footer hint */
      '.ks-search-footer{',
        'display:flex;align-items:center;justify-content:space-between;gap:.6rem;',
        'padding:10px 14px;border-top:1px solid rgba(0,0,0,.08);font-size:11px;color:#9ca3af',
      '}',
      '[data-theme="dark"] .ks-search-footer{border-color:rgba(255,255,255,.08)}',
      '.ks-search-footer kbd{',
        'background:rgba(0,0,0,.06);padding:1.5px 5px;border-radius:4px;',
        'font-family:inherit;font-size:10px;font-weight:700;color:#6b7280;margin:0 2px',
      '}',
      '[data-theme="dark"] .ks-search-footer kbd{background:rgba(255,255,255,.08);color:#9ca3af}',
      '@media (max-width:480px){.ks-search-footer{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Charge KSCurriculum si pas déjà chargé ──────────────────── */
  function ensureCurriculum(cb){
    if (window.KSCurriculum) return cb();
    if (document.getElementById('ks-curriculum-script')) {
      var i = setInterval(function(){
        if (window.KSCurriculum) { clearInterval(i); cb(); }
      }, 50);
      return;
    }
    var s = document.createElement('script');
    s.id = 'ks-curriculum-script';
    s.src = 'ks-curriculum.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  /* ── Construit l'index de recherche ──────────────────────────── */
  var INDEX = null;
  function buildIndex(){
    var idx = [];
    /* Pages utilitaires */
    QUICK_ACTIONS.forEach(function(a){
      idx.push({
        type:'page', title:a.title, sub:a.sub, href:a.href,
        icon:a.icon, tag:'PAGE', tagCls:''
      });
    });
    /* Activités du curriculum */
    if (window.KSCurriculum && KSCurriculum.activities) {
      KSCurriculum.activities.forEach(function(act){
        var soon = KSCurriculum.isComingSoon ? KSCurriculum.isComingSoon(act.href) : false;
        var done = false;
        try { done = localStorage.getItem(act.key) === 'done'; } catch(e){}
        idx.push({
          type: 'activity',
          title: act.title,
          sub: act.sub,
          href: act.href,
          icon: act.t || 'lesson',
          tag: soon ? 'Bientôt' : (done ? '✓' : (act.lvl || '').toUpperCase()),
          tagCls: soon ? 'soon' : (done ? 'done' : 'lvl-' + (act.lvl || 'a1')),
          level: act.lvlName || '',
          isComingSoon: soon,
          isDone: done
        });
      });
    }
    INDEX = idx;
  }

  /* ── Normalisation & score de pertinence ────────────────────── */
  function normalize(s){
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, ''); /* retire accents */
  }
  function scoreMatch(item, query){
    var q = normalize(query);
    if (!q) return 0;
    var t = normalize(item.title);
    var s = normalize(item.sub);
    var rawT = item.title.toLowerCase();
    var rawS = (item.sub||'').toLowerCase();
    var qRaw = query.toLowerCase();

    /* Coréen : on cherche aussi dans le texte brut sans normalisation */
    var koMatch = (item.title + ' ' + (item.sub||'')).indexOf(query) >= 0;

    var score = 0;
    if (t === q) score += 100;
    if (t.indexOf(q) === 0) score += 60;
    if (t.indexOf(q) >= 0) score += 30;
    if (s.indexOf(q) >= 0) score += 12;
    if (rawT.indexOf(qRaw) >= 0) score += 5;
    if (rawS.indexOf(qRaw) >= 0) score += 2;
    if (koMatch) score += 40; /* match coréen exact */
    /* Sous-mots */
    q.split(/\s+/).forEach(function(w){
      if (!w) return;
      if (t.indexOf(w) >= 0) score += 8;
      if (s.indexOf(w) >= 0) score += 3;
    });
    return score;
  }

  /* ── Highlight des matches dans le titre ──────────────────── */
  function highlight(text, query){
    if (!query) return text;
    /* Échappe les caractères regex */
    var safe = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!safe) return text;
    try {
      var re = new RegExp('(' + safe + ')', 'gi');
      return text.replace(re, '<span class="ks-search-match">$1</span>');
    } catch (e) {
      return text;
    }
  }

  /* ── Recherches récentes ───────────────────────────────────── */
  function getRecent(){
    try { return JSON.parse(localStorage.getItem('ks_search_recent')||'[]'); }
    catch(e){ return []; }
  }
  function pushRecent(item){
    try {
      var r = getRecent();
      r = r.filter(function(x){ return x.href !== item.href; });
      r.unshift({ title:item.title, sub:item.sub, href:item.href, icon:item.icon, tag:item.tag, tagCls:item.tagCls });
      if (r.length > 5) r.length = 5;
      localStorage.setItem('ks_search_recent', JSON.stringify(r));
    } catch(e){}
  }

  /* ── Rendu d'un item ───────────────────────────────────────── */
  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }
  function renderItem(item, query, isActive){
    var titleHtml = highlight(escapeHtml(item.title), query);
    var subHtml = highlight(escapeHtml(item.sub || ''), query);
    return '<a class="ks-search-item' + (isActive?' active':'') + '" href="' + item.href + '" data-href="' + item.href + '">' +
      '<div class="ks-search-item-ico">' + svg(item.icon) + '</div>' +
      '<div class="ks-search-item-body">' +
        '<div class="ks-search-item-title">' + titleHtml + '</div>' +
        (item.sub ? '<div class="ks-search-item-sub">' + subHtml + '</div>' : '') +
      '</div>' +
      (item.tag ? '<span class="ks-search-item-tag ' + (item.tagCls||'') + '">' + escapeHtml(item.tag) + '</span>' : '') +
    '</a>';
  }

  /* ── État UI ──────────────────────────────────────────────── */
  var activeIndex = 0;
  var lastResults = [];

  function renderResults(query){
    var resultsEl = document.querySelector('.ks-search-results');
    if (!resultsEl) return;
    if (!INDEX) { buildIndex(); }

    if (!query.trim()) {
      /* État initial : recherches récentes + suggestions */
      var recent = getRecent();
      var html = '';
      if (recent.length) {
        html += '<div class="ks-search-section">' +
          '<div class="ks-search-section-title">Récent</div>' +
          recent.map(function(r,i){ return renderItem(r, '', i===0); }).join('') +
        '</div>';
      }
      html += '<div class="ks-search-section">' +
        '<div class="ks-search-section-title">Pages clés</div>' +
        QUICK_ACTIONS.slice(0,8).map(function(a,i){
          var item = { title:a.title, sub:a.sub, href:a.href, icon:a.icon, tag:'PAGE', tagCls:'' };
          return renderItem(item, '', recent.length===0 && i===0);
        }).join('') +
      '</div>';
      resultsEl.innerHTML = html;
      lastResults = (recent.length ? recent : []).concat(QUICK_ACTIONS.slice(0,8).map(function(a){
        return { title:a.title, sub:a.sub, href:a.href, icon:a.icon, tag:'PAGE', tagCls:'' };
      }));
      activeIndex = 0;
      return;
    }

    /* Recherche */
    var scored = INDEX.map(function(item){
      return { item: item, score: scoreMatch(item, query) };
    }).filter(function(x){ return x.score > 0; });
    scored.sort(function(a,b){ return b.score - a.score; });

    if (!scored.length) {
      resultsEl.innerHTML =
        '<div class="ks-search-empty">' +
          '<div class="ks-search-empty-ico">' + svg('search') + '</div>' +
          '<p>Aucun résultat pour <strong>' + escapeHtml(query) + '</strong></p>' +
          '<p style="font-size:11px">Essaye un mot plus court ou un autre terme.</p>' +
        '</div>';
      lastResults = [];
      activeIndex = -1;
      return;
    }

    /* Groupe par type */
    var pages = scored.filter(function(x){ return x.item.type === 'page'; });
    var acts  = scored.filter(function(x){ return x.item.type === 'activity'; });
    var html = '';
    if (pages.length) {
      html += '<div class="ks-search-section">' +
        '<div class="ks-search-section-title">Pages</div>' +
        pages.slice(0,5).map(function(x,i){
          return renderItem(x.item, query, i===0);
        }).join('') +
      '</div>';
    }
    if (acts.length) {
      html += '<div class="ks-search-section">' +
        '<div class="ks-search-section-title">Activités du parcours</div>' +
        acts.slice(0,15).map(function(x,i){
          return renderItem(x.item, query, !pages.length && i===0);
        }).join('') +
      '</div>';
    }
    resultsEl.innerHTML = html;
    lastResults = pages.slice(0,5).concat(acts.slice(0,15)).map(function(x){ return x.item; });
    activeIndex = 0;
  }

  function updateActive(){
    var items = document.querySelectorAll('.ks-search-item');
    items.forEach(function(el, i){
      el.classList.toggle('active', i === activeIndex);
    });
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].scrollIntoView({ block:'nearest' });
    }
  }

  function openModal(){
    if (!INDEX) {
      ensureCurriculum(function(){ buildIndex(); openModal(); });
      return;
    }
    if (document.querySelector('.ks-search-overlay')) return;
    injectCSS();
    var overlay = document.createElement('div');
    overlay.className = 'ks-search-overlay';
    overlay.innerHTML =
      '<div class="ks-search-modal" role="dialog" aria-modal="true" aria-label="Recherche">' +
        '<div class="ks-search-header">' +
          svg('search') +
          '<input class="ks-search-input" type="search" autocomplete="off" autocorrect="off" ' +
            'placeholder="Rechercher leçons, pages, mots-clés…" aria-label="Recherche" />' +
          '<button class="ks-search-esc" aria-label="Fermer">Esc</button>' +
        '</div>' +
        '<div class="ks-search-results" role="listbox"></div>' +
        '<div class="ks-search-footer">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> Naviguer</span>' +
          '<span><kbd>↵</kbd> Ouvrir</span>' +
          '<span><kbd>Esc</kbd> Fermer</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(function(){ overlay.classList.add('show'); }, 10);

    var input = overlay.querySelector('.ks-search-input');
    input.focus();

    input.addEventListener('input', function(){
      renderResults(input.value);
    });

    input.addEventListener('keydown', function(e){
      var items = document.querySelectorAll('.ks-search-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(items.length - 1, activeIndex + 1);
        updateActive();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        updateActive();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && lastResults[activeIndex]) {
          var target = lastResults[activeIndex];
          if (target.href && target.href.charAt(0) === '#') {
            closeModal();
            if (target.href === '#whatsnew') {
              setTimeout(function(){
                if (window.KSWhatsNew && window.KSWhatsNew.show) window.KSWhatsNew.show();
              }, 250);
            }
            return;
          }
          pushRecent(target);
          location.href = target.href;
        }
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    /* Clic sur résultat */
    overlay.querySelector('.ks-search-results').addEventListener('click', function(e){
      var item = e.target.closest('.ks-search-item');
      if (!item) return;
      e.preventDefault();
      var href = item.getAttribute('data-href');
      /* Actions internes (commencent par #) */
      if (href && href.charAt(0) === '#') {
        closeModal();
        if (href === '#whatsnew') {
          setTimeout(function(){
            if (window.KSWhatsNew && window.KSWhatsNew.show) window.KSWhatsNew.show();
          }, 250);
        }
        return;
      }
      var data = lastResults.find(function(r){ return r.href === href; });
      if (data) pushRecent(data);
      location.href = href;
    });

    /* Bouton esc + clic fond */
    overlay.querySelector('.ks-search-esc').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closeModal();
    });

    /* Render initial */
    renderResults('');
  }

  function closeModal(){
    var overlay = document.querySelector('.ks-search-overlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(function(){ if (overlay.parentNode) overlay.remove(); }, 200);
  }

  /* ── Bouton FAB ──────────────────────────────────────────── */
  function injectFAB(){
    if (document.querySelector('.ks-search-fab')) return;
    injectCSS();
    var btn = document.createElement('button');
    btn.className = 'ks-search-fab';
    btn.setAttribute('aria-label', 'Rechercher');
    btn.setAttribute('title', 'Rechercher (⌘K)');
    btn.innerHTML = svg('search') + '<span class="sr-only">Recherche</span>';
    /* Sur desktop on remplace le contenu pour afficher "Rechercher" */
    if (window.innerWidth >= 960) {
      btn.innerHTML = svg('search') + '<span style="margin-left:6px;font-size:13px;font-weight:600">Rechercher</span>';
    }
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
  }

  /* ── Raccourci clavier ⌘K / Ctrl+K ──────────────────────── */
  function bindShortcut(){
    document.addEventListener('keydown', function(e){
      var meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (document.querySelector('.ks-search-overlay')) closeModal();
        else openModal();
      }
      /* "/" raccourci classique pour recherche (si pas dans un input) */
      if (e.key === '/' && !/^(input|textarea|select)$/i.test(document.activeElement.tagName)) {
        if (!document.querySelector('.ks-search-overlay')) {
          e.preventDefault();
          openModal();
        }
      }
    });
  }

  /* ── Init ──────────────────────────────────────────────── */
  function init(){
    ensureCurriculum(function(){
      buildIndex();
      injectFAB();
      bindShortcut();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API publique */
  window.KSSearch = {
    open: openModal,
    close: closeModal,
    rebuild: function(){ INDEX = null; buildIndex(); }
  };
})();
