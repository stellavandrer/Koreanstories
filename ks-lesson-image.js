/* ═══════════════════════════════════════════════════════════════════
   ks-lesson-image.js — Bannière visuelle au-dessus de chaque leçon.
   ──────────────────────────────────────────────────────────────────
   Inspiré de Busuu / Bunpo : une scène en haut de chaque leçon pour
   contextualiser visuellement. SVG inline = pas de chargement réseau,
   100% on-brand (palette or/navy du site), aucun risque de 404.

   S'injecte automatiquement sur les pages de leçon, exercice, quiz,
   histoire, anecdote, conseil, chanson. Pas sur les pages utilitaires
   (app, profil, réglages, etc.).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Palette */
  var GOLD = '#C9A96E';
  var GOLD_L = '#E8C589';
  var NAVY = '#0F1B2D';
  var NAVY_L = '#1a3050';
  var WHITE = '#F7F8FA';

  /* ── Scènes SVG (chacune en 800×280) ─────────────────────────────
     Chaque scène est un SVG complet et autonome. Style flat/géo
     minimaliste pour la cohérence. */
  var SCENES = {

    hangeul: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgH" x1="0" x2="1" y1="0" y2="1">',
        '<stop offset="0" stop-color="'+NAVY+'"/><stop offset="1" stop-color="'+NAVY_L+'"/>',
        '</linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgH)"/>',
        /* Gros caractère 한 en arrière-plan */
        '<text x="120" y="220" font-family="Georgia,serif" font-size="240" font-weight="700" fill="'+GOLD+'" opacity=".12">한</text>',
        /* 글 plus petit */
        '<text x="380" y="180" font-family="Georgia,serif" font-size="140" font-weight="700" fill="'+GOLD+'" opacity=".22">글</text>',
        /* Brosse stylisée */
        '<g transform="translate(560,80)">',
          '<rect x="40" y="0" width="14" height="80" rx="3" fill="'+GOLD+'"/>',
          '<path d="M37 80 L57 80 L62 110 L32 110 Z" fill="'+GOLD_L+'"/>',
          '<path d="M32 110 L62 110 L67 130 Q47 145 27 130 Z" fill="#3a2c1a"/>',
        '</g>',
        /* Lignes décoratives */
        '<line x1="40" y1="240" x2="200" y2="240" stroke="'+GOLD+'" stroke-width="2" opacity=".35"/>',
        '<line x1="40" y1="250" x2="160" y2="250" stroke="'+GOLD+'" stroke-width="2" opacity=".2"/>',
      '</svg>'
    ].join(''); },

    greetings: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgG" x1="0" x2="1"><stop offset="0" stop-color="#1a3050"/><stop offset="1" stop-color="#0F1B2D"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgG)"/>',
        /* Personnage 1 */
        '<g transform="translate(240,90)">',
          '<circle cx="0" cy="0" r="32" fill="#F4C9A5"/>',
          '<rect x="-35" y="35" width="70" height="90" rx="8" fill="'+GOLD+'"/>',
          '<circle cx="-10" cy="-3" r="3" fill="'+NAVY+'"/>',
          '<circle cx="10" cy="-3" r="3" fill="'+NAVY+'"/>',
          '<path d="M-12 15 Q0 22 12 15" stroke="'+NAVY+'" stroke-width="2" fill="none"/>',
        '</g>',
        /* Personnage 2 */
        '<g transform="translate(420,90)">',
          '<circle cx="0" cy="0" r="32" fill="#E8B8A0"/>',
          '<rect x="-35" y="35" width="70" height="90" rx="8" fill="'+GOLD_L+'"/>',
          '<circle cx="-10" cy="-3" r="3" fill="'+NAVY+'"/>',
          '<circle cx="10" cy="-3" r="3" fill="'+NAVY+'"/>',
          '<path d="M-12 12 Q0 18 12 12" stroke="'+NAVY+'" stroke-width="2" fill="none"/>',
        '</g>',
        /* Bulle "안녕" */
        '<g transform="translate(530,40)">',
          '<rect x="0" y="0" width="170" height="58" rx="14" fill="'+WHITE+'"/>',
          '<polygon points="20,58 30,58 25,72" fill="'+WHITE+'"/>',
          '<text x="85" y="38" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" fill="'+NAVY+'">안녕하세요</text>',
        '</g>',
      '</svg>'
    ].join(''); },

    family: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Maison */
        '<g transform="translate(120,60)">',
          '<polygon points="80,0 0,70 160,70" fill="'+GOLD+'"/>',
          '<rect x="20" y="70" width="120" height="120" fill="#2d3e54"/>',
          '<rect x="68" y="120" width="24" height="70" fill="'+GOLD_L+'"/>',
          '<rect x="38" y="100" width="30" height="30" fill="'+GOLD+'" opacity=".7"/>',
          '<rect x="92" y="100" width="30" height="30" fill="'+GOLD+'" opacity=".7"/>',
        '</g>',
        /* 4 silhouettes */
        '<g transform="translate(420,120)">',
          '<circle cx="0" cy="0" r="20" fill="'+GOLD_L+'"/>',
          '<rect x="-22" y="20" width="44" height="60" rx="6" fill="'+GOLD+'"/>',
        '</g>',
        '<g transform="translate(490,130)">',
          '<circle cx="0" cy="0" r="18" fill="'+GOLD_L+'"/>',
          '<rect x="-20" y="18" width="40" height="55" rx="6" fill="'+GOLD+'" opacity=".85"/>',
        '</g>',
        '<g transform="translate(560,135)">',
          '<circle cx="0" cy="0" r="14" fill="'+GOLD_L+'"/>',
          '<rect x="-16" y="14" width="32" height="42" rx="5" fill="'+GOLD+'" opacity=".7"/>',
        '</g>',
        '<g transform="translate(620,140)">',
          '<circle cx="0" cy="0" r="12" fill="'+GOLD_L+'"/>',
          '<rect x="-14" y="12" width="28" height="35" rx="4" fill="'+GOLD+'" opacity=".55"/>',
        '</g>',
        '<text x="700" y="40" font-family="Georgia,serif" font-size="40" font-weight="700" fill="'+GOLD+'" opacity=".5">가족</text>',
      '</svg>'
    ].join(''); },

    food: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Table */
        '<rect x="0" y="220" width="800" height="60" fill="#5a4a3a"/>',
        /* Bol principal */
        '<g transform="translate(400,170)">',
          '<ellipse cx="0" cy="40" rx="120" ry="20" fill="#3a2a1a" opacity=".5"/>',
          '<path d="M-100 0 Q-100 50 0 50 Q100 50 100 0 Z" fill="'+WHITE+'"/>',
          '<ellipse cx="0" cy="0" rx="100" ry="22" fill="#F0E6D2"/>',
          /* Riz */
          '<ellipse cx="0" cy="-2" rx="80" ry="14" fill="'+WHITE+'"/>',
          /* Légumes colorés */
          '<circle cx="-40" cy="-3" r="10" fill="#16A34A"/>',
          '<circle cx="-15" cy="-5" r="8" fill="#EF4444"/>',
          '<circle cx="15" cy="-4" r="9" fill="#F59E0B"/>',
          '<circle cx="40" cy="-3" r="10" fill="#A78BFA"/>',
        '</g>',
        /* Vapeur */
        '<path d="M380 130 Q375 110 385 100 Q395 90 388 75" stroke="'+WHITE+'" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>',
        '<path d="M410 130 Q405 105 415 95 Q425 85 418 65" stroke="'+WHITE+'" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>',
        /* Petits bols à côté */
        '<g transform="translate(140,200)">',
          '<ellipse cx="0" cy="10" rx="50" ry="8" fill="#3a2a1a" opacity=".4"/>',
          '<path d="M-45 0 Q-45 18 0 18 Q45 18 45 0 Z" fill="'+GOLD_L+'"/>',
          '<ellipse cx="0" cy="0" rx="45" ry="10" fill="#D97706"/>',
        '</g>',
        '<g transform="translate(640,205)">',
          '<ellipse cx="0" cy="8" rx="45" ry="7" fill="#3a2a1a" opacity=".4"/>',
          '<path d="M-40 0 Q-40 15 0 15 Q40 15 40 0 Z" fill="'+WHITE+'"/>',
          '<ellipse cx="0" cy="0" rx="40" ry="9" fill="#16A34A" opacity=".7"/>',
        '</g>',
        /* Baguettes */
        '<line x1="270" y1="140" x2="350" y2="180" stroke="'+GOLD+'" stroke-width="3" stroke-linecap="round"/>',
        '<line x1="280" y1="135" x2="360" y2="175" stroke="'+GOLD+'" stroke-width="3" stroke-linecap="round"/>',
      '</svg>'
    ].join(''); },

    numbers: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgN" x1="0" x2="1"><stop offset="0" stop-color="'+NAVY+'"/><stop offset="1" stop-color="'+NAVY_L+'"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgN)"/>',
        /* Chiffres flottants */
        '<text x="120" y="160" font-family="Georgia,serif" font-size="80" font-weight="700" fill="'+GOLD+'">일</text>',
        '<text x="240" y="200" font-family="Georgia,serif" font-size="100" font-weight="700" fill="'+GOLD_L+'" opacity=".9">이</text>',
        '<text x="400" y="140" font-family="Georgia,serif" font-size="70" font-weight="700" fill="'+GOLD+'" opacity=".75">삼</text>',
        '<text x="520" y="220" font-family="Georgia,serif" font-size="110" font-weight="700" fill="'+GOLD+'">사</text>',
        '<text x="680" y="180" font-family="Georgia,serif" font-size="85" font-weight="700" fill="'+GOLD_L+'" opacity=".8">오</text>',
        /* Chiffres arabes en filigrane */
        '<text x="180" y="80" font-family="Inter,sans-serif" font-size="32" font-weight="800" fill="'+WHITE+'" opacity=".15">1 2 3 4 5</text>',
      '</svg>'
    ].join(''); },

    time: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Horloge */
        '<g transform="translate(400,140)">',
          '<circle cx="0" cy="0" r="100" fill="'+WHITE+'" stroke="'+GOLD+'" stroke-width="4"/>',
          '<line x1="0" y1="0" x2="0" y2="-60" stroke="'+NAVY+'" stroke-width="6" stroke-linecap="round"/>',
          '<line x1="0" y1="0" x2="45" y2="0" stroke="'+NAVY+'" stroke-width="4" stroke-linecap="round"/>',
          '<circle cx="0" cy="0" r="6" fill="'+GOLD+'"/>',
          /* Marques 12,3,6,9 */
          '<line x1="0" y1="-85" x2="0" y2="-75" stroke="'+NAVY+'" stroke-width="3"/>',
          '<line x1="85" y1="0" x2="75" y2="0" stroke="'+NAVY+'" stroke-width="3"/>',
          '<line x1="0" y1="85" x2="0" y2="75" stroke="'+NAVY+'" stroke-width="3"/>',
          '<line x1="-85" y1="0" x2="-75" y2="0" stroke="'+NAVY+'" stroke-width="3"/>',
        '</g>',
        /* Petit calendrier */
        '<g transform="translate(120,70)">',
          '<rect x="0" y="20" width="140" height="160" rx="8" fill="'+GOLD+'"/>',
          '<rect x="0" y="20" width="140" height="36" fill="'+GOLD_L+'"/>',
          '<text x="70" y="48" text-anchor="middle" font-family="Inter" font-size="14" font-weight="800" fill="'+NAVY+'">MAI</text>',
          '<text x="70" y="135" text-anchor="middle" font-family="Inter" font-size="68" font-weight="800" fill="'+NAVY+'">28</text>',
        '</g>',
        /* Texte "시간" */
        '<text x="600" y="90" font-family="Georgia,serif" font-size="48" font-weight="700" fill="'+GOLD+'" opacity=".6">시간</text>',
      '</svg>'
    ].join(''); },

    weather: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgW" x1="0" x2="0" y1="0" y2="1">',
        '<stop offset="0" stop-color="#3b6eb0"/><stop offset="1" stop-color="#1a3050"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgW)"/>',
        /* Soleil */
        '<g transform="translate(220,110)">',
          '<circle cx="0" cy="0" r="50" fill="#FCD34D"/>',
          '<g stroke="#FCD34D" stroke-width="4" stroke-linecap="round">',
            '<line x1="0" y1="-70" x2="0" y2="-58"/>',
            '<line x1="0" y1="58" x2="0" y2="70"/>',
            '<line x1="-70" y1="0" x2="-58" y2="0"/>',
            '<line x1="58" y1="0" x2="70" y2="0"/>',
            '<line x1="-50" y1="-50" x2="-42" y2="-42"/>',
            '<line x1="42" y1="42" x2="50" y2="50"/>',
            '<line x1="50" y1="-50" x2="42" y2="-42"/>',
            '<line x1="-42" y1="42" x2="-50" y2="50"/>',
          '</g>',
        '</g>',
        /* Nuage */
        '<g transform="translate(450,120)" fill="'+WHITE+'">',
          '<ellipse cx="0" cy="20" rx="60" ry="30"/>',
          '<circle cx="-30" cy="0" r="32"/>',
          '<circle cx="20" cy="-10" r="40"/>',
          '<circle cx="60" cy="10" r="28"/>',
        '</g>',
        /* Gouttes de pluie */
        '<g fill="#89c4f4">',
          '<ellipse cx="440" cy="200" rx="3" ry="8"/>',
          '<ellipse cx="470" cy="210" rx="3" ry="8"/>',
          '<ellipse cx="500" cy="195" rx="3" ry="8"/>',
          '<ellipse cx="530" cy="215" rx="3" ry="8"/>',
        '</g>',
        '<text x="640" y="60" font-family="Georgia,serif" font-size="40" font-weight="700" fill="'+WHITE+'" opacity=".5">날씨</text>',
      '</svg>'
    ].join(''); },

    travel: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Globe stylisé */
        '<g transform="translate(180,140)">',
          '<circle cx="0" cy="0" r="80" fill="'+NAVY_L+'" stroke="'+GOLD+'" stroke-width="3"/>',
          '<ellipse cx="0" cy="0" rx="80" ry="30" fill="none" stroke="'+GOLD+'" stroke-width="2" opacity=".5"/>',
          '<ellipse cx="0" cy="0" rx="30" ry="80" fill="none" stroke="'+GOLD+'" stroke-width="2" opacity=".5"/>',
          /* Continents stylisés */
          '<path d="M-50 -20 Q-30 -30 -10 -25 L0 -15 L-10 0 L-30 -5 Z" fill="'+GOLD+'"/>',
          '<path d="M30 20 Q45 15 55 25 L50 40 L30 35 Z" fill="'+GOLD_L+'"/>',
        '</g>',
        /* Avion */
        '<g transform="translate(500,90) rotate(-20)" fill="'+WHITE+'">',
          '<path d="M0 0 L80 -10 L110 -5 L110 5 L80 10 L0 0 Z"/>',
          '<path d="M40 -5 L60 -25 L70 -23 L55 -3 Z"/>',
          '<path d="M40 5 L60 25 L70 23 L55 3 Z"/>',
          '<path d="M95 -3 L105 -10 L108 -8 L105 -2 Z"/>',
        '</g>',
        /* Trajet pointillé */
        '<path d="M270 130 Q400 30 500 90" fill="none" stroke="'+GOLD+'" stroke-width="2" stroke-dasharray="6 6"/>',
        /* Texte */
        '<text x="640" y="220" font-family="Georgia,serif" font-size="36" font-weight="700" fill="'+GOLD+'" opacity=".55">여행</text>',
      '</svg>'
    ].join(''); },

    shopping: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Sac shopping */
        '<g transform="translate(280,75)">',
          '<path d="M0 30 L0 180 L160 180 L160 30 Z" fill="'+GOLD+'"/>',
          '<path d="M0 30 L160 30 L150 0 L10 0 Z" fill="'+GOLD_L+'"/>',
          '<path d="M40 30 Q40 -10 80 -10 Q120 -10 120 30" stroke="'+NAVY+'" stroke-width="4" fill="none"/>',
          '<text x="80" y="125" text-anchor="middle" font-family="Georgia,serif" font-size="40" font-weight="700" fill="'+NAVY+'">쇼핑</text>',
        '</g>',
        /* Pièces */
        '<g transform="translate(500,180)">',
          '<circle cx="0" cy="0" r="22" fill="'+GOLD_L+'" stroke="'+GOLD+'" stroke-width="2"/>',
          '<text x="0" y="6" text-anchor="middle" font-family="Inter" font-size="18" font-weight="800" fill="'+NAVY+'">₩</text>',
        '</g>',
        '<g transform="translate(560,160)">',
          '<circle cx="0" cy="0" r="20" fill="'+GOLD+'" stroke="'+GOLD_L+'" stroke-width="2"/>',
          '<text x="0" y="6" text-anchor="middle" font-family="Inter" font-size="16" font-weight="800" fill="'+NAVY+'">₩</text>',
        '</g>',
        '<g transform="translate(615,195)">',
          '<circle cx="0" cy="0" r="18" fill="'+GOLD_L+'" stroke="'+GOLD+'" stroke-width="2"/>',
          '<text x="0" y="5" text-anchor="middle" font-family="Inter" font-size="14" font-weight="800" fill="'+NAVY+'">₩</text>',
        '</g>',
        /* Étiquette prix */
        '<g transform="translate(540,80)">',
          '<polygon points="0,0 60,0 75,20 60,40 0,40" fill="#EF4444"/>',
          '<circle cx="10" cy="20" r="4" fill="'+WHITE+'"/>',
          '<text x="42" y="26" text-anchor="middle" font-family="Inter" font-size="14" font-weight="800" fill="'+WHITE+'">SALE</text>',
        '</g>',
      '</svg>'
    ].join(''); },

    grammar: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Livre ouvert */
        '<g transform="translate(280,80)">',
          '<path d="M0 0 L120 -10 L120 120 L0 130 Z" fill="'+WHITE+'"/>',
          '<path d="M120 -10 L240 0 L240 130 L120 120 Z" fill="#E5E7EB"/>',
          /* Lignes texte gauche */
          '<line x1="20" y1="25" x2="100" y2="20" stroke="#9CA3AF" stroke-width="2"/>',
          '<line x1="20" y1="45" x2="105" y2="40" stroke="#9CA3AF" stroke-width="2"/>',
          '<line x1="20" y1="65" x2="95" y2="60" stroke="#9CA3AF" stroke-width="2"/>',
          '<line x1="20" y1="85" x2="100" y2="80" stroke="'+GOLD+'" stroke-width="2"/>',
          '<line x1="20" y1="105" x2="80" y2="100" stroke="#9CA3AF" stroke-width="2"/>',
          /* Lignes texte droit */
          '<line x1="140" y1="20" x2="220" y2="25" stroke="#9CA3AF" stroke-width="2"/>',
          '<line x1="140" y1="40" x2="225" y2="45" stroke="#9CA3AF" stroke-width="2"/>',
          '<line x1="140" y1="60" x2="215" y2="65" stroke="'+GOLD+'" stroke-width="2"/>',
          '<line x1="140" y1="80" x2="220" y2="85" stroke="#9CA3AF" stroke-width="2"/>',
          '<line x1="140" y1="100" x2="200" y2="105" stroke="#9CA3AF" stroke-width="2"/>',
        '</g>',
        /* Caractères flottants */
        '<text x="80" y="80" font-family="Georgia,serif" font-size="60" font-weight="700" fill="'+GOLD+'" opacity=".25">은</text>',
        '<text x="640" y="90" font-family="Georgia,serif" font-size="80" font-weight="700" fill="'+GOLD+'" opacity=".25">는</text>',
        '<text x="100" y="240" font-family="Georgia,serif" font-size="50" font-weight="700" fill="'+GOLD_L+'" opacity=".4">이/가</text>',
      '</svg>'
    ].join(''); },

    story: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgS" x1="0" x2="1"><stop offset="0" stop-color="'+NAVY+'"/><stop offset="1" stop-color="'+NAVY_L+'"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgS)"/>',
        /* Silhouette de Séoul */
        '<g transform="translate(0,160)" fill="'+GOLD+'" opacity=".6">',
          '<rect x="0" y="40" width="40" height="80"/>',
          '<rect x="60" y="20" width="60" height="100"/>',
          '<polygon points="80,0 60,20 120,20 100,0"/>',
          '<rect x="150" y="50" width="50" height="70"/>',
          '<rect x="220" y="10" width="70" height="110"/>',
          '<rect x="310" y="40" width="40" height="80"/>',
          '<rect x="370" y="25" width="55" height="95"/>',
          '<rect x="450" y="55" width="45" height="65"/>',
        '</g>',
        /* Bulle de conversation */
        '<g transform="translate(500,60)">',
          '<rect x="0" y="0" width="240" height="80" rx="20" fill="'+WHITE+'"/>',
          '<polygon points="30,80 50,80 35,100" fill="'+WHITE+'"/>',
          '<text x="120" y="35" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="700" fill="'+NAVY+'">한국 이야기</text>',
          '<text x="120" y="60" text-anchor="middle" font-family="Inter" font-size="13" fill="#6B7280" font-style="italic">Histoires de Corée</text>',
        '</g>',
        /* Étoiles */
        '<g fill="'+GOLD_L+'">',
          '<polygon points="100,30 103,38 111,38 105,44 107,52 100,47 93,52 95,44 89,38 97,38" opacity=".8"/>',
          '<polygon points="430,40 432,46 438,46 433,50 435,56 430,52 425,56 427,50 422,46 428,46" opacity=".6"/>',
          '<polygon points="730,170 732,176 738,176 733,180 735,186 730,182 725,186 727,180 722,176 728,176" opacity=".5"/>',
        '</g>',
      '</svg>'
    ].join(''); },

    exercise: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Cahier */
        '<g transform="translate(180,40)">',
          '<rect x="0" y="0" width="280" height="200" rx="6" fill="'+WHITE+'"/>',
          '<rect x="0" y="0" width="20" height="200" fill="'+GOLD+'"/>',
          /* Lignes */
          '<line x1="40" y1="40" x2="260" y2="40" stroke="#E5E7EB" stroke-width="2"/>',
          '<line x1="40" y1="70" x2="260" y2="70" stroke="#E5E7EB" stroke-width="2"/>',
          '<line x1="40" y1="100" x2="260" y2="100" stroke="#E5E7EB" stroke-width="2"/>',
          '<line x1="40" y1="130" x2="260" y2="130" stroke="#E5E7EB" stroke-width="2"/>',
          '<line x1="40" y1="160" x2="260" y2="160" stroke="#E5E7EB" stroke-width="2"/>',
          /* Texte coréen */
          '<text x="50" y="35" font-family="Georgia,serif" font-size="22" font-weight="700" fill="'+NAVY+'">연습</text>',
          '<line x1="50" y1="65" x2="180" y2="65" stroke="'+GOLD+'" stroke-width="3" stroke-linecap="round"/>',
          '<line x1="50" y1="95" x2="220" y2="95" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>',
          '<line x1="50" y1="125" x2="160" y2="125" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>',
          /* Coches */
          '<circle cx="240" cy="35" r="14" fill="#16A34A"/>',
          '<path d="M232 35 L238 40 L248 30" stroke="'+WHITE+'" stroke-width="3" fill="none" stroke-linecap="round"/>',
        '</g>',
        /* Crayon */
        '<g transform="translate(520,80) rotate(15)">',
          '<rect x="0" y="0" width="160" height="20" fill="'+GOLD+'"/>',
          '<polygon points="160,0 200,10 160,20" fill="#F4C9A5"/>',
          '<polygon points="200,10 195,10 195,10" fill="'+NAVY+'"/>',
          '<rect x="-20" y="0" width="20" height="20" fill="#EF4444"/>',
        '</g>',
      '</svg>'
    ].join(''); },

    quiz: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgQ" x1="0" x2="1"><stop offset="0" stop-color="'+NAVY+'"/><stop offset="1" stop-color="'+NAVY_L+'"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgQ)"/>',
        /* Médaille */
        '<g transform="translate(400,140)">',
          /* Ruban */
          '<path d="M-30 -100 L0 -50 L30 -100 L20 -100 L0 -70 L-20 -100 Z" fill="#EF4444"/>',
          /* Cercle */
          '<circle cx="0" cy="0" r="70" fill="'+GOLD+'" stroke="'+GOLD_L+'" stroke-width="6"/>',
          '<circle cx="0" cy="0" r="55" fill="none" stroke="'+NAVY+'" stroke-width="2" stroke-dasharray="3 4"/>',
          /* Étoile */
          '<polygon points="0,-30 8,-10 30,-10 12,5 20,28 0,15 -20,28 -12,5 -30,-10 -8,-10" fill="'+NAVY+'"/>',
        '</g>',
        /* Points d'interrogation */
        '<text x="120" y="120" font-family="Georgia,serif" font-size="80" font-weight="700" fill="'+GOLD+'" opacity=".3">?</text>',
        '<text x="650" y="180" font-family="Georgia,serif" font-size="100" font-weight="700" fill="'+GOLD_L+'" opacity=".4">?</text>',
        '<text x="60" y="240" font-family="Georgia,serif" font-size="60" font-weight="700" fill="'+GOLD+'" opacity=".25">?</text>',
        '<text x="710" y="80" font-family="Georgia,serif" font-size="50" font-weight="700" fill="'+GOLD+'" opacity=".3">?</text>',
      '</svg>'
    ].join(''); },

    culture: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgC" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1a3050"/><stop offset="1" stop-color="'+NAVY+'"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgC)"/>',
        /* Palais Gyeongbokgung stylisé */
        '<g transform="translate(200,80)" fill="'+GOLD+'">',
          /* Toit principal courbe */
          '<path d="M-100 60 Q-100 30 -80 30 L80 30 Q100 30 100 60 L100 70 L-100 70 Z"/>',
          /* Toit étage 2 */
          '<path d="M-60 30 Q-60 5 -40 5 L40 5 Q60 5 60 30 Z" opacity=".9"/>',
          /* Toit étage 3 (tour) */
          '<path d="M-20 5 Q-20 -10 -5 -10 L5 -10 Q20 -10 20 5 Z" opacity=".85"/>',
          /* Tiges décoratives */
          '<line x1="0" y1="-10" x2="0" y2="-25" stroke="'+GOLD+'" stroke-width="3"/>',
          '<circle cx="0" cy="-28" r="4"/>',
          /* Base / colonnes */
          '<rect x="-90" y="70" width="180" height="80" fill="#5a4a3a"/>',
          '<rect x="-80" y="80" width="10" height="60" fill="'+GOLD+'"/>',
          '<rect x="-50" y="80" width="10" height="60" fill="'+GOLD+'"/>',
          '<rect x="-20" y="80" width="10" height="60" fill="'+GOLD+'"/>',
          '<rect x="10" y="80" width="10" height="60" fill="'+GOLD+'"/>',
          '<rect x="40" y="80" width="10" height="60" fill="'+GOLD+'"/>',
          '<rect x="70" y="80" width="10" height="60" fill="'+GOLD+'"/>',
        '</g>',
        /* Lanterne */
        '<g transform="translate(550,120)">',
          '<ellipse cx="0" cy="0" rx="40" ry="50" fill="#EF4444"/>',
          '<rect x="-40" y="-5" width="80" height="10" fill="#7F1D1D"/>',
          '<line x1="0" y1="-50" x2="0" y2="-75" stroke="'+GOLD+'" stroke-width="2"/>',
          '<rect x="-10" y="50" width="20" height="12" fill="#7F1D1D"/>',
          '<line x1="0" y1="62" x2="0" y2="78" stroke="'+GOLD+'" stroke-width="2"/>',
        '</g>',
        /* Texte */
        '<text x="650" y="220" font-family="Georgia,serif" font-size="40" font-weight="700" fill="'+GOLD+'" opacity=".5">문화</text>',
      '</svg>'
    ].join(''); },

    kpop: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<defs><linearGradient id="bgK" x1="0" x2="1"><stop offset="0" stop-color="#DB2777"/><stop offset="1" stop-color="'+NAVY+'"/></linearGradient></defs>',
        '<rect width="800" height="280" fill="url(#bgK)"/>',
        /* Micro */
        '<g transform="translate(380,80) rotate(-10)">',
          '<rect x="-20" y="0" width="40" height="60" rx="20" fill="'+WHITE+'"/>',
          '<rect x="-15" y="55" width="30" height="50" fill="#6B7280"/>',
          '<rect x="-25" y="100" width="50" height="10" rx="3" fill="#374151"/>',
          /* Maille */
          '<line x1="-15" y1="15" x2="15" y2="15" stroke="#9CA3AF" stroke-width="1"/>',
          '<line x1="-15" y1="25" x2="15" y2="25" stroke="#9CA3AF" stroke-width="1"/>',
          '<line x1="-15" y1="35" x2="15" y2="35" stroke="#9CA3AF" stroke-width="1"/>',
          '<line x1="-15" y1="45" x2="15" y2="45" stroke="#9CA3AF" stroke-width="1"/>',
        '</g>',
        /* Ondes sonores */
        '<g stroke="'+WHITE+'" stroke-width="3" fill="none" opacity=".5">',
          '<path d="M450 130 Q480 100 500 130"/>',
          '<path d="M460 130 Q500 80 530 130"/>',
          '<path d="M470 130 Q520 60 560 130"/>',
        '</g>',
        '<g stroke="'+WHITE+'" stroke-width="3" fill="none" opacity=".5">',
          '<path d="M310 130 Q280 100 260 130"/>',
          '<path d="M300 130 Q260 80 230 130"/>',
          '<path d="M290 130 Q240 60 200 130"/>',
        '</g>',
        /* Étoiles */
        '<g fill="'+WHITE+'">',
          '<polygon points="80,80 84,92 96,92 86,100 90,112 80,104 70,112 74,100 64,92 76,92" opacity=".7"/>',
          '<polygon points="650,60 653,68 661,68 654,73 657,81 650,76 643,81 646,73 639,68 647,68" opacity=".7"/>',
          '<polygon points="120,220 123,228 131,228 124,233 127,241 120,236 113,241 116,233 109,228 117,228" opacity=".6"/>',
        '</g>',
        '<text x="640" y="220" font-family="Georgia,serif" font-size="48" font-weight="700" fill="'+WHITE+'" opacity=".7">K-Pop</text>',
      '</svg>'
    ].join(''); },

    pro: function(){ return [
      '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">',
        '<rect width="800" height="280" fill="'+NAVY+'"/>',
        /* Buildings de Séoul */
        '<g transform="translate(0,80)" fill="'+NAVY_L+'">',
          '<rect x="40" y="60" width="40" height="140"/>',
          '<rect x="100" y="30" width="50" height="170"/>',
          '<rect x="170" y="80" width="35" height="120"/>',
          '<rect x="220" y="10" width="55" height="190"/>',
          '<rect x="290" y="50" width="40" height="150"/>',
          '<polygon points="220,10 247,-20 275,10"/>',
          /* Fenêtres */
          '<g fill="'+GOLD+'" opacity=".7">',
            '<rect x="48" y="80" width="6" height="6"/><rect x="60" y="80" width="6" height="6"/><rect x="68" y="80" width="6" height="6"/>',
            '<rect x="48" y="100" width="6" height="6"/><rect x="60" y="100" width="6" height="6"/>',
            '<rect x="48" y="120" width="6" height="6"/><rect x="68" y="120" width="6" height="6"/>',
            '<rect x="110" y="50" width="8" height="8"/><rect x="125" y="50" width="8" height="8"/><rect x="140" y="50" width="8" height="8"/>',
            '<rect x="110" y="75" width="8" height="8"/><rect x="140" y="75" width="8" height="8"/>',
            '<rect x="230" y="30" width="8" height="8"/><rect x="245" y="30" width="8" height="8"/><rect x="260" y="30" width="8" height="8"/>',
            '<rect x="230" y="55" width="8" height="8"/><rect x="260" y="55" width="8" height="8"/>',
          '</g>',
        '</g>',
        /* Mallette */
        '<g transform="translate(500,140)">',
          '<rect x="0" y="0" width="160" height="100" rx="6" fill="'+GOLD+'"/>',
          '<rect x="0" y="0" width="160" height="20" fill="'+GOLD_L+'"/>',
          '<path d="M50 -15 L50 0 L110 0 L110 -15 Q110 -25 100 -25 L60 -25 Q50 -25 50 -15 Z" fill="none" stroke="'+GOLD+'" stroke-width="4"/>',
          '<rect x="70" y="45" width="20" height="20" rx="2" fill="'+NAVY+'"/>',
        '</g>',
        '<text x="510" y="60" font-family="Georgia,serif" font-size="36" font-weight="700" fill="'+GOLD+'" opacity=".55">비즈니스</text>',
      '</svg>'
    ].join(''); }
  };

  /* ── Mapping par fichier vers une scène SVG ──────────────────── */
  var CURATED = {
    /* === Hangeul === */
    'lecon.html':'hangeul', 'lecon2.html':'hangeul', 'lecon3.html':'hangeul',
    'lecon4.html':'hangeul', 'lecon9.html':'hangeul',
    'exercice1.html':'hangeul', 'exercice2.html':'hangeul', 'quiz1.html':'quiz',

    /* === A1 === */
    'lecon5.html':'greetings', 'lecon6.html':'numbers', 'lecon6b.html':'numbers',
    'lecon7.html':'family', 'lecon8.html':'grammar', 'lecon10.html':'food',
    'lecon11.html':'travel', 'lecon12.html':'travel', 'lecon13.html':'grammar',
    'lecon14.html':'grammar', 'lecon15.html':'grammar', 'lecon16.html':'grammar',
    'lecon41.html':'grammar', 'lecon42.html':'time', 'lecon43.html':'weather',
    'lecon44.html':'numbers', 'lecon58.html':'grammar', 'lecon59.html':'shopping',
    'lecon60.html':'greetings',
    'exercice3.html':'family', 'exercice4.html':'grammar', 'exercice5.html':'travel',
    'exercice6.html':'grammar', 'exercice24.html':'shopping',
    'histoire1.html':'greetings', 'histoire2.html':'food', 'histoire3.html':'story',
    'histoire29.html':'culture', 'histoire30.html':'story',
    'quiz2.html':'quiz', 'quiz3.html':'quiz',

    /* === A2 === */
    'lecon17.html':'grammar', 'lecon18.html':'grammar', 'lecon19.html':'shopping',
    'lecon20.html':'travel', 'lecon21.html':'time', 'lecon22.html':'grammar',
    'lecon23.html':'grammar', 'lecon24.html':'grammar', 'lecon25.html':'grammar',
    'lecon26.html':'grammar', 'lecon27.html':'time', 'lecon45.html':'grammar',
    'lecon46.html':'grammar', 'lecon47.html':'grammar', 'lecon48.html':'grammar',
    'lecon55.html':'grammar', 'lecon56.html':'grammar', 'lecon57.html':'grammar',
    'exercice7.html':'grammar', 'exercice8.html':'shopping', 'exercice9.html':'greetings',
    'exercice10.html':'grammar', 'exercice23.html':'story',
    'histoire12.html':'story', 'histoire13.html':'story', 'histoire14.html':'travel',
    'histoire15.html':'story', 'histoire27.html':'culture', 'histoire28.html':'culture',
    'quiz4.html':'quiz',

    /* === B1 === */
    'lecon28.html':'grammar', 'lecon29.html':'grammar', 'lecon30.html':'grammar',
    'lecon31.html':'grammar', 'lecon32.html':'grammar', 'lecon33.html':'pro',
    'lecon34.html':'time', 'lecon35.html':'grammar', 'lecon49.html':'grammar',
    'lecon50.html':'grammar', 'lecon51.html':'grammar', 'lecon52.html':'grammar',
    'lecon53.html':'grammar', 'lecon54.html':'grammar',
    'exercice11.html':'grammar', 'exercice12.html':'grammar', 'exercice13.html':'grammar',
    'exercice14.html':'quiz', 'exercice15.html':'quiz', 'exercice22.html':'grammar',
    'histoire16.html':'pro', 'histoire17.html':'travel', 'histoire18.html':'story',
    'histoire19.html':'quiz', 'histoire25.html':'story', 'histoire26.html':'story',
    'pro4.html':'pro', 'quiz5.html':'quiz', 'quiz9.html':'quiz',

    /* === B2 === */
    'lecon36.html':'grammar', 'lecon37.html':'grammar', 'lecon38.html':'grammar',
    'lecon39.html':'pro', 'lecon40.html':'grammar',
    'lecon40b.html':'grammar', 'lecon40c.html':'grammar', 'lecon40d.html':'culture',
    'exercice16.html':'grammar', 'exercice17.html':'grammar', 'exercice18.html':'pro',
    'exercice19.html':'pro', 'exercice20.html':'grammar', 'exercice21.html':'grammar',
    'histoire20.html':'story', 'histoire21.html':'story', 'histoire22.html':'kpop',
    'histoire23.html':'kpop', 'histoire24.html':'story',
    'quiz6.html':'quiz', 'quiz7.html':'quiz', 'quiz8.html':'quiz',

    /* === Anecdotes & Conseils === */
    'anecdote1.html':'culture', 'anecdote2.html':'culture', 'anecdote3.html':'culture',
    'anecdote4.html':'culture', 'anecdote5.html':'culture', 'anecdote6.html':'culture',
    'anecdote7.html':'culture', 'anecdote8.html':'culture', 'anecdote9.html':'food',
    'anecdote10.html':'culture', 'anecdote11.html':'culture', 'anecdote12.html':'culture',
    'anecdote13.html':'culture', 'anecdote14.html':'culture', 'anecdote15.html':'culture',
    'anecdote16.html':'food', 'anecdote17.html':'food', 'anecdote18.html':'time',
    'anecdote19.html':'culture',
    'conseil1.html':'grammar', 'conseil2.html':'grammar', 'conseil3.html':'grammar',
    'conseil4.html':'grammar', 'conseil5.html':'grammar', 'conseil6.html':'grammar',
    'conseil7.html':'travel', 'conseil8.html':'grammar',
    'chanson1.html':'kpop', 'chanson2.html':'kpop', 'chanson3.html':'kpop',
    'chanson4.html':'kpop', 'chanson5.html':'kpop', 'chanson6.html':'kpop'
  };

  /* Fallback par préfixe */
  var FALLBACK_BY_PREFIX = {
    'lecon':'grammar', 'exercice':'exercise', 'quiz':'quiz',
    'histoire':'story', 'anecdote':'culture', 'conseil':'grammar',
    'chanson':'kpop', 'pro':'pro'
  };

  /* Pages à NE PAS toucher (dashboard / utilitaires) */
  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'lecture.html':1, 'challenge.html':1,
    'classement.html':1, 'revision.html':1, 'statistiques.html':1,
    'trophees.html':1, 'aide.html':1, 'ressources.html':1,
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'vocabulaire.html':1, 'hangeul.html':1,
    'histoires.html':1, 'exercice.html':1
  };

  function getSceneForPage(){
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
        'margin:0 0 1.2rem;',
        'aspect-ratio:800/280;max-height:200px;',
        'overflow:hidden;border-radius:14px;',
        'background:linear-gradient(135deg,#0F1B2D,#1a3050);',
        'box-shadow:0 4px 14px rgba(0,0,0,.08);',
        'animation:ksBanIn .5s ease both',
      '}',
      '@keyframes ksBanIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}',
      '.ks-banner svg{width:100%;height:100%;display:block}',
      '@media (max-width:480px){.ks-banner{max-height:150px}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Trouve le bon endroit pour injecter la bannière ─────────── */
  function findInsertionPoint(){
    /* Priorités (du plus spécifique au plus général) */
    var paddedDiv = document.querySelector('main .main > div[style*="padding"], main > div[style*="padding"]');
    if (paddedDiv) return paddedDiv;
    var wrap = document.querySelector('.wrap');
    if (wrap) return wrap;
    var main = document.querySelector('main, .main, .shell');
    if (main) return main;
    return document.body;
  }

  function inject(){
    var sceneKey = getSceneForPage();
    if (!sceneKey || !SCENES[sceneKey]) return;

    var target = findInsertionPoint();
    if (!target) return;
    if (target.querySelector('.ks-banner')) return;

    injectCSS();

    var banner = document.createElement('div');
    banner.className = 'ks-banner';
    banner.innerHTML = SCENES[sceneKey]();
    target.insertBefore(banner, target.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
