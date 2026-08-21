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
   Portée : un mot ou un nombre. Trois transformations sont appliquées —
   liaison, nasalisation, latéralisation (voir plus bas). La tension
   (된소리 : 학교 « hak-kkyo ») ne l'est pas, ni les chaînes de règles qui
   se déclenchent l'une l'autre : elles restent rares dans du vocabulaire
   isolé, qui est l'usage visé.
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
     Les finales DOUBLES se partagent : la première reste, la seconde part.
     읽어 « il-go », 없어 « op-sso ». Deux exceptions, où le ㅎ s'efface au
     lieu de partir et laisse filer sa voisine : 많아 « ma-na », 싫어
     « chi-ro ». On ne pouvait pas les ignorer — 없어요, 많아요, 괜찮아요 et
     읽어요 sont du vocabulaire de première semaine. */
  var LIAISON = { 1: 'g', 2: 'kk', 4: 'n', 7: 'd', 8: 'r', 16: 'm', 17: 'b',
                  19: 's', 20: 'ss', 22: 'dj', 23: 'tch', 24: 'k', 25: 't',
                  26: 'p', 27: '' };

  /* Finales doubles : [ce qui reste, ce qui part]. Le ㅅ qui se déplace se
     tend (없어 se dit « op-sso », pas « op-so »). */
  var LIAISON_DOUBLE = {
    3:  ['k', 'ss'],   //  ㄳ
    5:  ['n', 'dj'],   //  ㄵ  앉아
    6:  ['',  'n'],    //  ㄶ  많아 — le ㅎ s'efface, le ㄴ part
    9:  ['l', 'g'],    //  ㄺ  읽어
    10: ['l', 'm'],    //  ㄻ  젊어
    11: ['l', 'b'],    //  ㄼ  넓어
    12: ['l', 'ss'],   //  ㄽ
    13: ['l', 't'],    //  ㄾ
    14: ['l', 'p'],    //  ㄿ
    15: ['',  'r'],    //  ㅀ  싫어 — le ㅎ s'efface, le ㄹ part
    18: ['p', 'ss']    //  ㅄ  없어
  };

  /* Assimilations — deux consonnes qui se touchent se déforment, et le
     coréen parlé ne ressemble alors plus à ce qui est écrit. C'est LA
     raison pour laquelle une romanisation lettre à lettre trompe :
     감사합니다 ne se dit pas « hap-ni-da » mais « ham-ni-da ».

     비음화 (nasalisation) — une finale occlusive devant ㄴ ou ㅁ devient
     la nasale du même point d'articulation :
       [k] → ng   한국말 « han-goung-mal »
       [t] → n
       [p] → m    합니다 « ham-ni-da »
     유음화 (latéralisation) — ㄴ et ㄹ qui se touchent donnent deux l :
       신라 « chil-la », 설날 « sol-lal »
     et un ㄹ derrière ㅁ ou ㅇ se durcit en n : 종로 « djong-no ». */
  var NASALISE = { k: 'ng', t: 'n', p: 'm' };

  function estSyllabe(c) { var n = c.charCodeAt(0); return n >= BASE && n <= FIN; }

  function decomposer(c) {
    var off = c.charCodeAt(0) - BASE;
    return { cho: Math.floor(off / (21 * 28)),
             jung: Math.floor((off % (21 * 28)) / 28),
             jong: off % 28 };
  }

  /* Rend UNE syllabe. `attaqueForcee` et `codaForcee` viennent des règles
     de contact calculées par lireBlocs : à ce stade la syllabe ne décide
     plus seule de ses consonnes de bord. */
  function lireSyllabe(car, attaqueForcee, codaForcee) {
    if (!estSyllabe(car)) return car;
    var d = decomposer(car);
    var attaque = attaqueForcee !== null && attaqueForcee !== undefined
      ? attaqueForcee : CHO[d.cho];
    var voyelle = JUNG[d.jung];

    /* ㅅ et ㅆ se mouillent devant i et devant les voyelles en y : 시 se dit
       « chi » et non « si », 샤 « cha » et non « sya ». Le test porte sur
       l'attaque EFFECTIVE : le ㅅ de 옷이 arrive par liaison, il se mouille
       tout autant — « o-chi ». Le son mouillé porte déjà le y, on le retire
       donc de la voyelle, sinon 샤 donnerait « chya ». */
    if ((attaque === 's' || attaque === 'ss') && MOUILLANTES[d.jung]) {
      attaque = 'ch';
      voyelle = voyelle.charAt(0) === 'y' ? voyelle.slice(1) : voyelle;
      if (voyelle === 'oui') voyelle = 'ui';
    } else if ((attaque === 'dj' || attaque === 'ddj' || attaque === 'tch') &&
               voyelle.charAt(0) === 'y') {
      voyelle = voyelle.slice(1);
    } else if (attaque && voyelle === 'oui') {
      /* ㅟ seul se dit « oui » (위) ; derrière une consonne il se réduit au
         « ui » de « lui » : 뤼 se lit « rui », pas « rouii ». */
      voyelle = 'ui';
    }

    return attaque + voyelle +
      (codaForcee !== null && codaForcee !== undefined ? codaForcee : JONG[d.jong]);
  }

  /* Rend un mot entier : un tableau de syllabes lues, dans l'ordre.
     Deux passes, parce qu'une syllabe ne se lit pas sans savoir ce qui la
     suit : on décompose tout, on applique les règles de contact, puis on
     rend. */
  function lireBlocs(mot) {
    var s = String(mot || ''), out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (!estSyllabe(c)) continue;
      var d = decomposer(c);
      d.car = c;
      d.coda = JONG[d.jong];      // son de finale, avant transformation
      d.attaque = null;           // attaque imposée par la syllabe d'avant
      out.push(d);
    }

    for (var k = 0; k < out.length - 1; k++) {
      var a = out[k], b = out[k + 1];
      if (!a.coda) continue;

      /* Liaison : la finale glisse dans le ㅇ suivant, qui ne se prononce
         pas, et retrouve au passage sa vraie valeur — le ㅅ de 옷이 sonne
         t tout seul mais s devant une voyelle. */
      if (b.cho === 11) {
        if (LIAISON_DOUBLE.hasOwnProperty(a.jong)) {
          a.coda = LIAISON_DOUBLE[a.jong][0];
          b.attaque = LIAISON_DOUBLE[a.jong][1];
          continue;
        }
        if (LIAISON.hasOwnProperty(a.jong)) {
          b.attaque = LIAISON[a.jong];
          a.coda = '';
          continue;
        }
      }

      // 유음화 — ㄴ et ㄹ qui se touchent donnent deux l.
      if (a.coda === 'n' && b.cho === 5) { a.coda = 'l'; b.attaque = 'l'; continue; }
      if (a.coda === 'l' && b.cho === 2) { b.attaque = 'l'; continue; }

      // Un ㄹ derrière une nasale se durcit en n : 종로 « djong-no ».
      if ((a.coda === 'm' || a.coda === 'ng') && b.cho === 5) { b.attaque = 'n'; continue; }

      // 비음화 — occlusive devant ㄴ ou ㅁ.
      if (NASALISE[a.coda] && (b.cho === 2 || b.cho === 6)) { a.coda = NASALISE[a.coda]; continue; }

      /* Le ㄹ doublé ordinaire (니콜라 « ni-kol-la ») : une finale l suivie
         d'une attaque ㄹ se lit l, pas r. */
      /* Le ㄹ doublé ordinaire (니콜라 « ni-kol-la ») : une finale l suivie
         d'une attaque ㄹ se lit l, pas r. */
      if (a.coda === 'l' && b.cho === 5) b.attaque = 'l';
    }

    return out.map(function (d) { return lireSyllabe(d.car, d.attaque, d.coda); });
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
