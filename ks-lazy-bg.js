/* ═══════════════════════════════════════════════════════════════════
   ks-lazy-bg.js — chargement differe des cases de BD.
   ──────────────────────────────────────────────────────────────────
   Les cases des planches sont des `background-image` sur des <div>,
   pas des <img> : l'attribut loading="lazy" ne s'y applique pas, et le
   navigateur telechargeait donc les 12 cases (~1,3 Mo) des l'ouverture
   alors qu'on n'en voit qu'une ou deux.

   Les cases portent maintenant `data-bg="chemin.webp"`. Ce script pose
   le background quand la case approche de l'ecran (400 px d'avance, ce
   qui laisse le temps du telechargement avant qu'elle soit visible).
   Les deux premieres cases gardent leur background en dur dans le HTML
   pour que le haut de page s'affiche immediatement.

   Trois declencheurs, volontairement redondants — une case qui ne se
   charge pas, c'est une planche blanche, donc on ne parie pas sur un
   seul mecanisme :
     1. IntersectionObserver (le chemin normal) ;
     2. un controle a la main sur scroll/resize, au cas ou l'observer
        ne rende pas la main — il ne se declenche pas tant que l'onglet
        n'est pas rendu (visibilityState 'hidden'), par exemple sur un
        onglet ouvert en arriere-plan ;
     3. un rattrapage quand l'onglet redevient visible.

   Sans JavaScript, un <noscript><style> present dans chaque planche
   restaure tous les backgrounds : la BD reste lisible.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MARGIN = 400;   /* px d'avance sur le viewport */
  var io = null;
  var ticking = false;

  function load(el) {
    var src = el.getAttribute('data-bg');
    if (!src) return;
    el.style.backgroundImage = 'url(' + src + ')';
    el.removeAttribute('data-bg');
    if (io) { try { io.unobserve(el); } catch (e) {} }
  }

  function remaining() { return document.querySelectorAll('[data-bg]'); }

  /* Controle geometrique : ne depend ni de l'observer ni du rendu. */
  function sweep() {
    ticking = false;
    var els = remaining();
    if (!els.length) { detach(); return; }
    var h = window.innerHeight || document.documentElement.clientHeight;
    Array.prototype.forEach.call(els, function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > -MARGIN && r.top < h + MARGIN) load(el);
    });
  }

  /* setTimeout et pas requestAnimationFrame : rAF est gele tant que l'onglet
     n'est pas rendu, le verrou `ticking` ne serait jamais relache et plus
     aucun balayage ne se ferait. */
  function onScroll() {
    if (ticking) return;
    ticking = true;
    setTimeout(sweep, 16);
  }

  function detach() {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    document.removeEventListener('visibilitychange', onVisible);
  }

  function onVisible() {
    if (document.visibilityState === 'visible') sweep();
  }

  function start() {
    if (!remaining().length) return;

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) load(e.target); });
      }, { rootMargin: MARGIN + 'px 0px' });
      Array.prototype.forEach.call(remaining(), function (el) { io.observe(el); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('visibilitychange', onVisible);

    sweep();   /* etat initial */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
