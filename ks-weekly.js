/* ═══════════════════════════════════════════════════════════════════
   ks-weekly.js — Système de défis hebdomadaires
   ──────────────────────────────────────────────────────────────────
   5 missions par semaine, auto-trackées depuis l'activité (XP,
   leçons terminées, streak, vocab maîtrisé). Reset chaque lundi
   à minuit. Bonus XP à chaque mission accomplie.

   API : window.KSWeekly
     .getState()     → { weekStart, completed: [taskId], pendingXP, claimedXP }
     .checkAll()     → recalcule l'état, déclenche le claim si nouvelle
                        mission terminée → renvoie la liste des nouveaux
                        XP gagnés cette frame
     .claim(taskId)  → marque une mission comme claimée (créditée d'XP)
     .tasks          → définition des 5 missions
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── Définition des 5 missions hebdomadaires ──────────────────────── */
  var TASKS = [
    {
      id:    'w_lecons_3',
      label: 'Termine 3 leçons',
      desc:  '3 leçons complètes cette semaine',
      xp:    50,
      goal:  3,
      icon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
      color: '#B8924E',
      /* Compte les leçons terminées DEPUIS le début de la semaine.
         On regarde toutes les clés ks_l*, ks_h*, ks_a*, ks_b*, ks_c*, ks_d*
         marquées 'done' ET dont l'horodatage est >= weekStart.
         Comme on ne stocke pas l'horodatage par leçon, on utilise un
         compteur séparé ks_weekly_lecon_count qui s'incrémente à chaque
         leçon terminée et se reset chaque semaine. */
      progress: function () { return parseInt(ls('ks_weekly_lecons_count')||'0',10) || 0; }
    },
    {
      id:    'w_histoire_1',
      label: 'Lis 1 histoire',
      desc:  'Termine au moins une histoire',
      xp:    30,
      goal:  1,
      icon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
      color: '#4F46E5',
      progress: function () { return parseInt(ls('ks_weekly_histoires_count')||'0',10) || 0; }
    },
    {
      id:    'w_quiz_2',
      label: 'Réussis 2 quiz',
      desc:  '2 quiz terminés cette semaine',
      xp:    30,
      goal:  2,
      icon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
      color: '#9A3412',
      progress: function () { return parseInt(ls('ks_weekly_quiz_count')||'0',10) || 0; }
    },
    {
      id:    'w_streak_3',
      label: 'Garde 3 jours d\'affilée',
      desc:  'Streak ≥ 3 cette semaine',
      xp:    50,
      goal:  3,
      icon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>',
      color: '#FF6B35',
      progress: function () { return parseInt(ls('ks_streak')||'0',10) || 0; }
    },
    {
      id:    'w_vocab_15',
      label: 'Maîtrise 15 mots',
      desc:  'Augmente ton stock de mots maîtrisés',
      xp:    40,
      goal:  15,
      icon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-6 6"/><path d="M14 14l2-2"/><path d="M8 12l2 2"/></svg>',
      color: '#22C55E',
      progress: function () {
        /* On compte les "vocab maîtrisés DEPUIS le début de la semaine".
           On stocke le nombre de masters au début de la semaine et
           on en déduit la progression depuis. */
        try {
          if (!window.KSSRS || !KSSRS.stats) return 0;
          var snapshotKey = 'ks_weekly_vocab_baseline';
          var baseline = parseInt(ls(snapshotKey)||'NaN', 10);
          var now = KSSRS.stats().mastered || 0;
          if (isNaN(baseline)) { /* pas encore initialisé pour cette semaine */
            try { localStorage.setItem(snapshotKey, String(now)); } catch(e){}
            return 0;
          }
          return Math.max(0, now - baseline);
        } catch (e) { return 0; }
      }
    }
  ];

  function ls(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function set(k,v){ try{ localStorage.setItem(k, v); }catch(e){} }

  /* ── Calcul du lundi de la semaine en cours ─────────────────────────
     Format YYYY-MM-DD. Lundi 00:00 local. */
  function thisMonday() {
    var d = new Date();
    var day = d.getDay() || 7; /* dimanche=0 → 7 */
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }

  /* ── Reset hebdo si on a changé de semaine ──────────────────────────
     Reset les compteurs (lecons, histoires, quiz) et la baseline vocab. */
  function maybeResetWeek() {
    var monday = thisMonday();
    var stored = ls('ks_weekly_start');
    if (stored === monday) return; /* même semaine, rien à faire */
    /* Nouvelle semaine — on reset */
    try {
      localStorage.setItem('ks_weekly_start', monday);
      localStorage.setItem('ks_weekly_completed', '[]');
      localStorage.setItem('ks_weekly_lecons_count', '0');
      localStorage.setItem('ks_weekly_histoires_count', '0');
      localStorage.setItem('ks_weekly_quiz_count', '0');
      localStorage.removeItem('ks_weekly_vocab_baseline');
    } catch (e) {}
  }

  /* ── Lire l'état courant ────────────────────────────────────────────
     Renvoie { weekStart, completed:[], tasks:[{...task, current, done}] } */
  function getState() {
    maybeResetWeek();
    var completed = [];
    try { completed = JSON.parse(ls('ks_weekly_completed')||'[]') || []; } catch (e) {}
    var enriched = TASKS.map(function (t) {
      var current = Math.min(t.progress(), t.goal);
      return Object.assign({}, t, {
        current: current,
        done: current >= t.goal,
        claimed: completed.indexOf(t.id) >= 0
      });
    });
    return {
      weekStart: ls('ks_weekly_start') || thisMonday(),
      completed: completed,
      tasks: enriched
    };
  }

  /* ── Crédite XP pour une mission terminée mais non claimée ──────────
     Renvoie true si XP créditée, false sinon. */
  function claim(taskId) {
    var s = getState();
    var t = s.tasks.find(function(x){ return x.id === taskId; });
    if (!t || !t.done || t.claimed) return false;
    var completed = s.completed.slice();
    completed.push(taskId);
    try {
      localStorage.setItem('ks_weekly_completed', JSON.stringify(completed));
      var curXP = parseInt(ls('ks_xp')||'0',10) || 0;
      localStorage.setItem('ks_xp', String(curXP + t.xp));
    } catch (e) {}
    return true;
  }

  /* ── Vérifie toutes les missions et crédite celles qui sont nouvelles
     Renvoie la liste des missions claimées cette frame. */
  function checkAll() {
    var s = getState();
    var newClaims = [];
    s.tasks.forEach(function (t) {
      if (t.done && !t.claimed) {
        if (claim(t.id)) newClaims.push(t);
      }
    });
    return newClaims;
  }

  /* ── Hooks d'incrémentation appelables depuis les pages ─────────────
     À appeler dans completeLesson() une fois qu'on est sûr que c'est
     un nouvel achèvement (pas un re-clic sur la même leçon).
     Pour simplifier, on attache à ksMarkDone via un wrapper. */
  function incrementCounter(type) {
    /* type ∈ {'lecon','histoire','quiz'} */
    maybeResetWeek();
    var key = 'ks_weekly_' + type + 's_count';
    var cur = parseInt(ls(key)||'0',10) || 0;
    try { localStorage.setItem(key, String(cur + 1)); } catch (e) {}
    /* Auto-check : si la mission devient complète, on crédite l'XP. */
    return checkAll();
  }

  /* Wrapper sur ksMarkDone pour incrémenter automatiquement le bon
     compteur quand une clé d'activité est marquée 'done' pour la
     première fois. */
  function setupAutoTrack() {
    if (typeof ksMarkDone !== 'function') return;
    var original = window.ksMarkDone;
    window.ksMarkDone = function (key) {
      var alreadyDone = ls(key) === 'done';
      var result = original.call(this, key);
      if (!alreadyDone) {
        /* Détection du type d'activité depuis la clé */
        var type = null;
        if (/^ks_l\d|^ks_h\d|^ks_a\d|^ks_b\d|^ks_c0?[1-9]|^ks_c1\d|^ks_c2\d|^ks_d\d/.test(key)) {
          /* Les leçons ont des préfixes l, h (hangeul), a, b, c, d. Les
             histoires sont identifiées séparément. On distingue par
             l'URL de la page si possible. */
          var pathname = location.pathname.toLowerCase();
          if (pathname.indexOf('histoire') >= 0) type = 'histoire';
          else if (pathname.indexOf('quiz') >= 0) type = 'quiz';
          else type = 'lecon';
        }
        if (type) {
          var claimed = incrementCounter(type);
          if (claimed.length && typeof window.ksWeeklyOnClaim === 'function') {
            try { window.ksWeeklyOnClaim(claimed); } catch (e) {}
          }
        }
      }
      return result;
    };
  }

  /* Installe l'auto-track quand DOM prêt (ksMarkDone est dans ks.js) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoTrack);
  } else {
    setupAutoTrack();
  }

  global.KSWeekly = {
    getState:   getState,
    claim:      claim,
    checkAll:   checkAll,
    increment:  incrementCounter,
    tasks:      TASKS
  };

})(window);
