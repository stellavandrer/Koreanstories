/* ═══════════════════════════════════════════════════════════════════
   ks-challenge.js — Défi de la semaine (communautaire)
   ──────────────────────────────────────────────────────────────────
   UN objectif unique par semaine, LE MÊME pour toute la communauté
   (déterministe : dérivé du lundi de la semaine, donc identique pour
   tous les apprenants). Il tourne chaque lundi. La progression est
   calculée localement en réutilisant les compteurs hebdo de
   ks-weekly.js (leçons / histoires / quiz), le streak, et un suivi
   d'XP hebdomadaire propre à ce module.

   Pas de compteur global côté serveur (donc aucun coût backend et
   aucun conflit avec les règles Firestore) : le « partagé » vient du
   fait que tout le monde relève le même défi et se compare dans le
   classement.

   API : window.KSChallenge = { current(), render(sel) }
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function ls(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  function int(v){ return parseInt(v||'0',10) || 0; }

  /* Lundi de la semaine en cours (YYYY-MM-DD), identique à ks-weekly.js. */
  function thisMonday(){
    var d = new Date();
    var day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }
  /* Index de rotation déterministe : nombre de semaines écoulées depuis
     l'époque jusqu'au lundi courant. Identique pour tous les visiteurs. */
  function weekIndex(mondayISO){
    return Math.round(Date.parse(mondayISO) / (7 * 86400000));
  }

  /* ── Suivi de l'XP gagnée cette semaine (baseline remise chaque lundi) ── */
  function weeklyXp(){
    var monday = thisMonday();
    if (ls('ks_cc_week') !== monday){
      set('ks_cc_week', monday);
      set('ks_cc_xp_base', String(int(ls('ks_xp'))));
    }
    return Math.max(0, int(ls('ks_xp')) - int(ls('ks_cc_xp_base')));
  }

  /* ── Catalogue des défis (rotation hebdomadaire) ──────────────────── */
  var CHALLENGES = [
    { metric:'xp',        goal:500, unit:'XP',        label:'Gagne 500 XP',            hint:'Chaque leçon, histoire et quiz rapporte de l’XP.' },
    { metric:'lecons',    goal:5,   unit:'leçons',    label:'Termine 5 leçons',        hint:'Avance dans le parcours à ton rythme.' },
    { metric:'histoires', goal:3,   unit:'histoires', label:'Lis 3 histoires',         hint:'Article ou planche BD, les deux comptent.' },
    { metric:'quiz',      goal:4,   unit:'quiz',      label:'Réussis 4 quiz',          hint:'Teste-toi après chaque bloc.' },
    { metric:'streak',    goal:7,   unit:'jours',     label:'Tiens un streak de 7 jours', hint:'Un peu de coréen chaque jour.' },
    { metric:'xp',        goal:800, unit:'XP',        label:'Gagne 800 XP',            hint:'Semaine intensive — vise haut !' },
    { metric:'histoires', goal:5,   unit:'histoires', label:'Lis 5 histoires',         hint:'Enchaîne les récits de la semaine.' }
  ];

  function progressFor(metric){
    switch (metric){
      case 'xp':        return weeklyXp();
      case 'lecons':    return int(ls('ks_weekly_lecons_count'));
      case 'histoires': return int(ls('ks_weekly_histoires_count'));
      case 'quiz':      return int(ls('ks_weekly_quiz_count'));
      case 'streak':    return int(ls('ks_streak'));
      default:          return 0;
    }
  }

  /* Défi de la semaine + progression courante. */
  function current(){
    var monday = thisMonday();
    var idx = ((weekIndex(monday) % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length;
    var c = CHALLENGES[idx];
    var prog = Math.min(progressFor(c.metric), c.goal);
    return {
      label: c.label, hint: c.hint, unit: c.unit,
      goal: c.goal, progress: prog,
      pct: Math.round(prog / c.goal * 100),
      done: prog >= c.goal,
      monday: monday
    };
  }

  function esc(s){ var d = document.createElement('div'); d.textContent = s==null?'':s; return d.innerHTML; }

  var CHECK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="20 6 9 17 4 12"/></svg>';

  /* CSS injecté une seule fois — le module est autonome, fonctionne partout. */
  function ensureCSS(){
    if (document.getElementById('ksc-style')) return;
    var css =
      '.ksc-card{background:var(--surf,#fff);border:1.5px solid var(--bd,#DAE3F2);border-radius:16px;padding:14px 16px;position:relative;overflow:hidden}' +
      '.ksc-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#C9A96E}' +
      '.ksc-card.done::before{background:#16a34a}' +
      '.ksc-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}' +
      '.ksc-tag{font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#C9A96E}' +
      '.ksc-com{font-size:.64rem;font-weight:700;color:var(--tx-muted,#8B94A6);background:rgba(201,169,110,.12);padding:.18rem .5rem;border-radius:100px}' +
      '.ksc-label{font-family:"Playfair Display",serif;font-size:1.15rem;font-weight:800;color:var(--tx,#0F1B2D);line-height:1.2;margin-bottom:10px}' +
      '.ksc-bar{height:8px;border-radius:100px;background:var(--bd,#E5EAF3);overflow:hidden}' +
      '.ksc-bar>span{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,#C9A96E,#E8C589);transition:width .5s}' +
      '.ksc-card.done .ksc-bar>span{background:linear-gradient(90deg,#16a34a,#4ade80)}' +
      '.ksc-foot{display:flex;align-items:baseline;gap:10px;margin-top:8px;flex-wrap:wrap}' +
      '.ksc-prog{font-size:.82rem;font-weight:800;color:var(--tx,#0F1B2D)}' +
      '.ksc-hint{font-size:.72rem;color:var(--tx-muted,#8B94A6)}' +
      '.ksc-done-txt{font-size:.85rem;font-weight:800;color:#16a34a;display:inline-flex;align-items:center;gap:5px}';
    var st = document.createElement('style'); st.id = 'ksc-style'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function render(sel){
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!host) return;
    ensureCSS();
    var c = current();
    var bar = '<div class="ksc-bar"><span style="width:' + c.pct + '%"></span></div>';
    host.innerHTML =
      '<div class="ksc-card' + (c.done ? ' done' : '') + '">' +
        '<div class="ksc-top">' +
          '<span class="ksc-tag">Défi de la semaine</span>' +
          '<span class="ksc-com">Toute la communauté</span>' +
        '</div>' +
        '<div class="ksc-label">' + esc(c.label) + '</div>' +
        bar +
        '<div class="ksc-foot">' +
          (c.done
            ? '<span class="ksc-done-txt">' + CHECK + ' Défi relevé — bravo !</span>'
            : '<span class="ksc-prog">' + c.progress + ' / ' + c.goal + ' ' + esc(c.unit) + '</span>' +
              '<span class="ksc-hint">' + esc(c.hint) + '</span>') +
        '</div>' +
      '</div>';
  }

  global.KSChallenge = { current: current, render: render };
})(window);
