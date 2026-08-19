/* ═══════════════════════════════════════════════════════════════════
   ks-lecture-fr.js — Lire une syllabe coréenne à la française.
   ──────────────────────────────────────────────────────────────────
   La romanisation officielle (Revised Romanization) est un système de
   TRANSLITTÉRATION, pas de prononciation, et elle piège systématiquement
   un lecteur francophone :
     서른  → « seoreun »  qu'un Français lit « sé-o-reun »  (c'est « so-reun »)
     스물  → « seumul »   qu'un Français lit « seu-mul »    (c'est « seu-moul »)
   hangeul.html le dit déjà noir sur blanc à propos de ㅜ : « la
   romanisation "u" piège les francophones ». Ce fichier applique cette
   doctrine partout ailleurs.

   On ne stocke aucune lecture à la main : on DÉCOMPOSE la syllabe par le
   calcul Unicode et on rend chaque jamo avec la valeur que le site
   enseigne dans hangeul.html (champ frs). Une lecture fausse ne peut donc
   venir que d'une table fausse, jamais d'une faute de frappe.
   Portée : la lecture d'un mot ou d'un nombre, pas d'une phrase entière.
   Seule la liaison est traitée (voir plus bas) ; les assimilations —
   nasalisation de 합니다 en « ham-ni-da », tension du ㅅ après une finale —
   ne le sont pas. À réserver aux mots isolés tant que ce n'est pas fait.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var BASE = 0xAC00, FIN = 0xD7A3;

  /* Initiales — les 19 attaques possibles, dans l'ordre Unicode.
     ㅇ ne se prononce pas en attaque : c'est un support graphique. */
  var CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's',
             'ss', '', 'dj', 'ddj', 'tch', 'k', 't', 'p', 'h'];

  /* Voyelles — valeurs enseignées dans hangeul.html.
     ㅓ = le « o » de porte (jamais « éo »), ㅜ = « ou » (jamais « u »),
     ㅡ = « eu » lèvres étirées, ㅐ = « è », ㅔ = « é ». */
  var JUNG = ['a', 'è', 'ya', 'yè', 'o', 'é', 'yo', 'yé', 'o', 'wa',
              'wè', 'wé', 'yo', 'ou', 'wo', 'wé', 'oui', 'you', 'eu',
              'eui', 'i'];

  /* Finales — on note le son RÉELLEMENT prononcé, pas la lettre écrite.
     Le coréen ne connaît que sept finales audibles : k, n, t, l, m, p, ng.
     C'est pourquoi 섯 (ㅅ final) se lit « sot » et 여덟 (ㄼ) « yo-dol ». */
  var JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k',
              'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't',
              't', 'ng', 't', 't', 'k', 't', 'p', 't'];

  /* ㅅ, ㅈ et ㅊ se mouillent devant i et devant les voyelles en y :
     시 se dit « chi » et non « si », 샤 « cha » et non « sya ».
     Le son mouillé porte déjà le y — on le retire donc de la voyelle,
     sinon 샤 donnerait « chya ». */
  var MOUILLANTES = { 2: 1, 3: 1, 6: 1, 7: 1, 12: 1, 16: 1, 17: 1, 20: 1 };

  /* Liaison — la règle de prononciation la plus rentable du coréen : une
     finale suivie d'un ㅇ (qui ne se prononce pas) glisse dans la syllabe
     d'après. 살 + 이에요 ne se lit pas « sal-i-é-yo » mais « sa-ri-é-yo ».
     La finale reprend alors sa vraie valeur : le ㅅ de 옷이 redevient un s
     (« o-si ») alors qu'il sonnait t tout seul.
     Limite assumée : seules les finales simples sont traitées. Les finales
     doubles (ㄺ, ㄼ, ㅄ…) partagent leur consonne entre les deux syllabes,
     règle par règle — elles n'apparaissent dans aucun des deux outils qui
     utilisent ce fichier, on ne les invente donc pas. */
  var LIAISON = { 1: 'g', 2: 'kk', 4: 'n', 7: 'd', 8: 'r', 16: 'm', 17: 'b',
                  19: 's', 20: 'ss', 22: 'dj', 23: 'tch', 24: 'k', 25: 't',
                  26: 'p', 27: '' };

  function estSyllabe(c) { var n = c.charCodeAt(0); return n >= BASE && n <= FIN; }

  function lireSyllabe(car, initialePrecedeeDeL, attaqueHeritee, finaleCedee) {
    if (!estSyllabe(car)) return car;
    var off = car.charCodeAt(0) - BASE;
    var cho = Math.floor(off / (21 * 28));
    var jung = Math.floor((off % (21 * 28)) / 28);
    var jong = off % 28;

    var attaque = CHO[cho];
    if (cho === 11 && attaqueHeritee) attaque = attaqueHeritee;
    if (finaleCedee) jong = 0;
    var voyelle = JUNG[jung];

    if ((cho === 9 || cho === 10) && MOUILLANTES[jung]) {
      attaque = 'ch';
      voyelle = voyelle.charAt(0) === 'y' ? voyelle.slice(1) : voyelle;
      if (voyelle === 'oui') voyelle = 'ui';
    } else if ((cho === 12 || cho === 13 || cho === 14) && voyelle.charAt(0) === 'y') {
      voyelle = voyelle.slice(1);
    } else if (cho !== 11 && voyelle === 'oui') {
      /* ㅟ seul se dit « oui » (위) ; derrière une consonne il se réduit
         au « ui » de « lui » : 뤼 se lit « rui », pas « rouii ». */
      voyelle = 'ui';
    }

    /* ㄹ redoublé : une finale l suivie d'un ㄹ d'attaque donne deux l,
       pas un r. C'est le « ni-kol-la » de 니콜라, déjà documenté dans
       ks-prenom.js — le rendre en « ni-kol-ra » serait faux. */
    if (initialePrecedeeDeL && cho === 5) attaque = 'l';

    return attaque + voyelle + JONG[jong];
  }

  /* Rend un mot entier : un tableau de syllabes lues, dans l'ordre. */
  function lireBlocs(mot) {
    var out = [], precedeeDeL = false, heritee = '';
    var s = String(mot || '');
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (!estSyllabe(c)) { precedeeDeL = false; heritee = ''; continue; }

      var jong = (c.charCodeAt(0) - BASE) % 28;
      /* La finale part-elle dans la syllabe suivante ? Seulement si celle-ci
         existe, commence par ㅇ, et que la finale sait se déplacer. */
      var suiv = s.charAt(i + 1);
      var cede = false;
      if (suiv && estSyllabe(suiv) && LIAISON.hasOwnProperty(jong) &&
          Math.floor((suiv.charCodeAt(0) - BASE) / (21 * 28)) === 11) {
        cede = true;
      }

      out.push(lireSyllabe(c, precedeeDeL, heritee, cede));
      heritee = cede ? LIAISON[jong] : '';
      precedeeDeL = !cede && jong === 8;   // finale ㄹ conservée
    }
    return out;
  }

  /* Lecture d'un mot, syllabes reliées par des traits : « ka-mi-you ».
     Les espaces du coréen sont conservés tels quels — 스무 살 donne
     « seu-mou sal », deux mots, comme à l'oral. */
  function lire(texte) {
    return String(texte || '').split(' ').map(function (mot) {
      var b = lireBlocs(mot);
      return b.length ? b.join('-') : '';
    }).filter(Boolean).join(' ');
  }

  global.KSLectureFR = { lire: lire, lireBlocs: lireBlocs, lireSyllabe: lireSyllabe };

})(typeof window !== 'undefined' ? window : this);
