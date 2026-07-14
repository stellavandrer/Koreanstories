/* ═══════════════════════════════════════════════════════════════════
   ks-account-gate.js — Essai gratuit sans compte, puis compte requis.
   ──────────────────────────────────────────────────────────────────
   Modèle façon Duolingo (demande Stelva, 2026-07-14) : un nouveau
   visiteur peut essayer une activité sans créer de compte (bouton
   « Continuer en tant qu'invité » de bienvenue.html, pose ks_user =
   {guest:true}). Dès qu'il a terminé cette 1ère activité (XP > 0) en
   étant toujours invité, la prochaine fois qu'il revient sur le
   tableau de bord ou la carte du parcours, on lui demande de créer un
   compte gratuit pour continuer et sauvegarder sa progression.

   Portée volontairement limitée à app.html / cours.html : aucune page
   de leçon/exercice/jeu individuelle n'est bloquée (recherche, liens
   de blog, partages, référencement Google — tous intacts).

   Ne s'applique JAMAIS :
   - aux comptes réels (ks_user.guest === false)
   - aux visiteurs sans marqueur ks_user du tout (utilisateurs déjà
     actifs avant l'existence de ce système — non rétroactif)
   - aux clients Premium (isPremium()) — rien ici n'est payant, à ne
     pas confondre avec ks-premium.js (extras payants, contenu cœur
     jamais restreint)
   ─────────────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  var GATE_PAGES = {'app.html':1, 'cours.html':1};
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!GATE_PAGES[here]) return;

  function ls(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }

  if (window.KSPremium && KSPremium.isPremium && KSPremium.isPremium()) return;

  var user = null;
  try { user = JSON.parse(ls('ks_user') || 'null'); } catch(e) { user = null; }

  /* Seuls les invités EXPLICITES (ks_user.guest === true, posé par
     bienvenue.html) sont concernés — jamais les visiteurs sans
     marqueur du tout (pas de rétroactivité sur les utilisateurs
     déjà actifs avant ce système). */
  if (!user || user.guest !== true) return;

  var xp = parseInt(ls('ks_xp') || '0', 10) || 0;
  if (xp <= 0) return; /* essai gratuit encore en cours */

  location.replace('bienvenue.html?continue=1');
})();
