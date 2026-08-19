/* ═══════════════════════════════════════════════════════════════════
   ks-prenom.js — Écrire un prénom français en hangeul.
   ──────────────────────────────────────────────────────────────────
   Le principe que tout le monde cherche à comprendre : on ne traduit
   pas un prénom, on le TRANSCRIT. Le hangeul note des sons, pas des
   lettres. « Camille » ne donne pas c-a-m-i-l-l-e mais ka-mi-you,
   parce que c'est ainsi qu'il s'entend.

   D'où deux étapes bien séparées :
     1. orthographe française → sons (le plus dur : « ain » fait un
        seul son, le « e » final ne s'entend pas, « ill » se dit y…) ;
     2. sons → syllabes coréennes, en respectant la forme obligatoire
        d'une syllabe : (consonne) + voyelle + (consonne finale).

   Le coréen n'a pas tous nos sons. Le v devient ㅂ, le f devient ㅍ,
   le z devient ㅈ — c'est ce qui donne à un prénom étranger sa petite
   couleur locale, et c'est à dire, pas à cacher.

   ⚠️ AUCUN caractère coréen n'est écrit à la main dans ce fichier.
   Chaque syllabe est COMPOSÉE à partir d'indices de jamo, par le
   calcul officiel du bloc Hangeul Unicode. C'est vérifiable, et ça
   évite d'introduire un caractère faux par une faute de frappe.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── Composition d'une syllabe ────────────────────────────────────
     Une syllabe hangeul vaut U+AC00 + (initiale × 21 + médiane) × 28
     + finale. Les trois tableaux ci-dessous ne servent qu'à nommer les
     positions ; on manipule des indices, jamais des caractères. */
  var INITIALES = ['g', 'gg', 'n', 'd', 'dd', 'r', 'm', 'b', 'bb', 's',
                   'ss', 'ng', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  var MEDIANES  = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o',
                   'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu',
                   'eu', 'ui', 'i'];
  var FINALES   = ['', 'g', 'gg', 'gs', 'n', 'nj', 'nh', 'd', 'r', 'rg',
                   'rm', 'rb', 'rs', 'rt', 'rp', 'rh', 'm', 'b', 'bs',
                   's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];

  function composer(initiale, mediane, finale) {
    var i = INITIALES.indexOf(initiale);
    var m = MEDIANES.indexOf(mediane);
    var f = finale ? FINALES.indexOf(finale) : 0;
    if (i < 0 || m < 0 || f < 0) return '';
    return String.fromCharCode(0xAC00 + (i * 21 + m) * 28 + f);
  }

  /* ── Étape 1 : orthographe française → sons ───────────────────────
     Table ordonnée, la plus longue graphie d'abord : « eau » doit être
     reconnu avant « au », lui-même avant « a ». Les sons sont notés
     par des symboles d'une lettre pour rester lisibles :
       voyelles   a e E i o u y 2 @   (E = è, y = u de « lu », 2 = eu,
                                       @ = e muet qui se prononce)
       nasales    A O N               (an, on, in)
       glides     j w                 (y de « yeux », ou de « oui »)
       consonnes  p b t d k g f v s z S Z m n l R h J
                                      (S = ch, Z = j, J = gn, R = r) */
  var REGLES = [
    // Voyelles composées et nasales — toujours avant les simples.
    ['eaux', 'o'], ['eau', 'o'],
    ['aient', 'E'], ['ain', 'N'], ['aim', 'N'], ['ein', 'N'], ['eim', 'N'],
    /* « ean » ne fait qu'un seul son : Jean se dit 장, pas 제앙. */
    ['ean', 'A', 'nasale'],
    ['oin', 'wN', 'nasale'],
    ['ien', 'jN', 'nasale'],
    ['œu', '2'], ['oeu', '2'], ['eu', '2'],
    ['ou', 'u'], ['où', 'u'], ['oû', 'u'],
    ['oi', 'wa'], ['oy', 'waj'],
    ['au', 'o'],
    ['ai', 'E'], ['aî', 'E'], ['ei', 'E'],
    // Nasales simples : seulement si non suivies d'une voyelle ou d'un
    // second n/m — « Anne » se dit a-n, pas ~a.
    ['an', 'A', 'nasale'], ['am', 'A', 'nasale'],
    ['en', 'A', 'nasale'], ['em', 'A', 'nasale'],
    ['on', 'O', 'nasale'], ['om', 'O', 'nasale'],
    ['in', 'N', 'nasale'], ['im', 'N', 'nasale'],
    ['un', 'N', 'nasale'], ['um', 'N', 'nasale'],
    ['yn', 'N', 'nasale'], ['ym', 'N', 'nasale'],
    // Consonnes composées.
    ['sch', 'S'], ['ch', 'S'], ['ph', 'f'], ['gn', 'J'], ['th', 't'],
    ['cqu', 'k'], ['qu', 'k'], ['q', 'k'],
    ['ill', 'ij'], ['ll', 'l'],
    ['ss', 's'], ['tt', 't'], ['pp', 'p'], ['mm', 'm'], ['nn', 'n'],
    ['rr', 'R'], ['ff', 'f'], ['cc', 'k'], ['dd', 'd'], ['bb', 'b'],
    ['gg', 'g'],
    // Voyelles simples.
    ['é', 'e'], ['è', 'E'], ['ê', 'E'], ['ë', 'E'],
    ['à', 'a'], ['â', 'a'],
    ['ô', 'o'],
    ['û', 'y'], ['ù', 'u'],
    ['ï', 'i'], ['î', 'i'],
    ['a', 'a'], ['e', '@'], ['i', 'i'], ['o', 'o'], ['u', 'y'],
    ['y', 'i'],
    // Consonnes simples.
    ['b', 'b'], ['ç', 's'], ['c', 'k'], ['d', 'd'], ['f', 'f'],
    ['g', 'g'], ['h', ''], ['j', 'Z'], ['k', 'k'], ['l', 'l'],
    ['m', 'm'], ['n', 'n'], ['p', 'p'], ['r', 'R'], ['s', 's'],
    ['t', 't'], ['v', 'v'], ['w', 'w'], ['x', 'ks'], ['z', 'z']
  ];

  var VOYELLES_FR = 'aàâeéèêëiïîoôuùûyœ';

  function estVoyelleFr(c) { return !!c && VOYELLES_FR.indexOf(c) >= 0; }

  function versSons(mot) {
    var s = mot.toLowerCase().replace(/[^a-zàâäéèêëïîôöùûüçœ'\- ]/g, '');
    var sons = '';
    var i = 0;

    while (i < s.length) {
      var c = s.charAt(i);

      if (c === ' ' || c === '-' || c === "'") { i++; continue; }

      /* « gu » devant e, i ou y n'est qu'une façon d'écrire le g dur :
         le u ne s'entend pas. Guillaume se dit « gi-yom » (기욤) et non
         « gui-i-yom ». À placer AVANT l'adoucissement du g, sinon le g
         de Guy partirait en « j ». */
      if (c === 'g' && s.charAt(i + 1) === 'u' && 'eéèêiïy'.indexOf(s.charAt(i + 2)) >= 0) {
        sons += 'g'; i += 2; continue;
      }

      /* « c » et « g » changent de son devant e, i, y — Cécile fait
         « sé-sil », Gérard fait « jé-rar ». */
      /* Un « e » suivi d'une consonne DOUBLE à l'écrit se dit è : c'est
         la première des deux qui ferme la syllabe. Stella fait 스텔라,
         Estelle 에스텔, Jeannette 자네트. Le test doit avoir lieu ICI,
         sur l'orthographe : la table réduit juste après ll, tt, nn… à
         une seule consonne, et l'indice serait perdu. */
      var dbl = s.charAt(i + 1);
      if (c === 'e' && dbl && dbl === s.charAt(i + 2) && 'pbtdkgfvszcmnlr'.indexOf(dbl) >= 0) {
        sons += 'E'; i++; continue;
      }

      /* Le test sur la chaîne vide n'est pas décoratif : indexOf('')
         vaut 0, donc « rien après » passait pour un e. Marc, Éric, Loïc
         et Ludovic finissaient en « s » — 마르스 au lieu de 마르크. */
      var apresCG = s.charAt(i + 1);
      if (c === 'c' && apresCG && 'eéèêiïy'.indexOf(apresCG) >= 0) { sons += 's'; i++; continue; }
      if (c === 'g' && apresCG && 'eéèêiïy'.indexOf(apresCG) >= 0) { sons += 'Z'; i++; continue; }

      /* « ch » suivi d'une consonne vient du grec et se dit k :
         Chloé, Christophe, Christine — jamais « ch » de chat. */
      if (s.substr(i, 2) === 'ch' && 'lr'.indexOf(s.charAt(i + 2)) >= 0) {
        sons += 'k'; i += 2; continue;
      }

      /* Un « y » entre deux voyelles n'est pas une voyelle mais un
         glide : Maya se dit « ma-ya » (마야) et non « ma-i-a » (마이아).
         Entre consonnes il reste un i ordinaire (Lyna, Sylvie). */
      if (c === 'y' && i > 0 && estVoyelleFr(s.charAt(i - 1)) && estVoyelleFr(s.charAt(i + 1))) {
        sons += 'j'; i++; continue;
      }

      /* Un « s » entre deux voyelles se dit z : Lisa fait « li-za ». */
      if (c === 's' && i > 0 && estVoyelleFr(s.charAt(i - 1)) && estVoyelleFr(s.charAt(i + 1))) {
        sons += 'z'; i++; continue;
      }

      var pris = false;
      for (var r = 0; r < REGLES.length; r++) {
        var graphie = REGLES[r][0];
        if (s.substr(i, graphie.length) !== graphie) continue;

        /* Une nasale n'en est une que si rien de vocalique ne suit :
           « Manon » est nasal, « Manu » ne l'est pas. */
        if (REGLES[r][2] === 'nasale') {
          var apres = s.charAt(i + graphie.length);
          if (apres === '' || (!estVoyelleFr(apres) && apres !== 'n' && apres !== 'm')) {
            sons += REGLES[r][1]; i += graphie.length; pris = true; break;
          }
          continue;
        }
        sons += REGLES[r][1];
        i += graphie.length;
        pris = true;
        break;
      }
      if (!pris) i++;
    }

    return nettoyerSons(sons, s);
  }

  /* Le « e » final ne s'entend pas (Camille, Sophie), et une consonne
     finale muette non plus (Manon, Nicolas). Mais r, l, f et c se
     prononcent (Pierre, Pascal, Olaf, Éric) — la vieille règle CaReFuL,
     qui vaut aussi en français. */
  function nettoyerSons(sons, motOriginal) {
    var out = sons;

    // e muet final, éventuellement suivi d'un s muet.
    out = out.replace(/@s?$/, '');

    /* Consonnes finales muettes. Le français n'a pas de règle unique,
       alors on s'en tient à ce qui est fiable :
         - s et x se taisent presque toujours (Nicolas, Thomas, Margaux) ;
         - t et d se taisent APRÈS UNE NASALE (Laurent, Bertrand,
           Vincent) mais s'entendent ailleurs — David se dit bien
           « da-vid ». C'est cette distinction qui évite de choisir
           entre 로랑 et 다비드 : les deux sont justes. */
    /* Le s final se tait (Nicolas, Thomas) SAUF après un è, où il
       s'entend : Inès et Agnès se disent bien « i-nèss », « a-gnèss ».
       Et surtout : il ne se tait QUE s'il est vraiment le dernier signe
       du mot écrit. Sans cette garde, l'étape précédente ôtait le « e »
       muet de Rose, Alice ou Louise, exposait leur s… qui se faisait
       manger à son tour. Rose donnait 로 (« ro »), Alice 알리 — la fin du
       prénom disparaissait purement et simplement. */
    var brut = String(motOriginal || '').trim().toLowerCase();
    if (/[sxz]$/.test(brut)) out = out.replace(/([^E])[sz]$/, '$1');
    /* Un t ou un d final se tait après une nasale (Laurent, Vincent) et
       après un r (Bernard, Gérard), mais s'entend ailleurs : David se dit
       « da-vid », Baptiste garde son t final. */
    out = out.replace(/([AONR])[td]$/, '$1');

    /* Un « e » suivi d'une voyelle se prononce é : Lea, Théo.
       Sans cette règle, « Lea » donnait 러아 au lieu de 레아. */
    out = out.replace(/@(?=[aeEiouy2AON])/g, 'e');
    /* Et un « e » PRÉCÉDÉ d'une voyelle se prononce è : le « ie » de
       Pierre, Julien, Damien. Sans elle, Pierre donnait 피얼 — deux
       blocs au lieu de trois, et un son faux au milieu. */
    out = out.replace(/([aeEiouy2AON])@/g, '$1e');
    // Un « e » devant deux consonnes se dit è : Bertrand.
    out = out.replace(/@(?=[pbtdkgfvszSZmnlRJ]{2})/g, 'E');

    /* En début de mot, le « e » s'entend toujours : Emma, Estelle,
       Emile. Sans ça, Emma donnait 어마 au lieu de 엠마. Idem devant une
       consonne doublée à l'écrit, que la table a déjà réduite à un seul
       son — c'est le cas de Stella. */
    out = out.replace(/^@/, 'e');
    out = out.replace(/@(?=[mnlRst])/g, 'e');
    // Ailleurs, le e restant devient le son neutre (Le → 르).
    out = out.replace(/@/g, '2');

    return out;
  }

  /* ── Étape 2 : sons → syllabes coréennes ──────────────────────────
     Le coréen ne sait pas enchaîner deux consonnes : chaque consonne
     isolée reçoit donc la voyelle neutre ㅡ, ce qui allonge le prénom.
     C'est pour ça que « Pierre » fait trois blocs et non deux. */
  var ONSET = {
    p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g',
    f: 'p', v: 'b', s: 's', z: 'j', S: 's', Z: 'j',
    m: 'm', n: 'n', l: 'r', R: 'r', h: 'h', J: 'n'
  };

  /* Voyelle simple → médiane. Après un glide j ou w, on passe aux
     médianes composées (ㅑ, ㅘ…). */
  var NOYAU = { a: 'a', e: 'e', E: 'e', i: 'i', o: 'o', u: 'u',
                y: 'wi', 2: 'eo', A: 'a', O: 'o', N: 'ae' };
  var NOYAU_J = { a: 'ya', e: 'ye', E: 'ye', i: 'i', o: 'yo', u: 'yu',
                  y: 'yu', 2: 'yeo', A: 'ya', O: 'yo', N: 'yae' };
  var NOYAU_W = { a: 'wa', e: 'we', E: 'we', i: 'wi', o: 'o', u: 'u',
                  y: 'wi', 2: 'wo', A: 'wa', O: 'o', N: 'wae' };

  var NASALES = { A: 'ng', O: 'ng', N: 'ng' };

  /* Consonnes que le coréen accepte en fin de syllabe. Les autres
     obligent à ouvrir une syllabe de plus.
     Le r français en est volontairement absent : il prend toujours sa
     propre syllabe 르. C'est ce qui distingue Pierre (피에르) de Pascal
     (파스칼), où le l se pose bien en finale. Traiter les deux pareil
     donnait 피엘 — un bloc de moins et un prénom méconnaissable. */
  var CODA = { m: 'm', n: 'n', l: 'r', J: 'n', k: 'g', p: 'b' };

  /* Le test explicite sur la chaîne vide n'est pas une précaution
     décorative : indexOf('') vaut 0, donc « pas de son du tout » était
     considéré comme une voyelle. Conséquence observée sur Pierre —
     le r final refusait de se poser en finale de syllabe. */
  function estVoyelleSon(c) { return !!c && 'aeEiouy2AON'.indexOf(c) >= 0; }

  function versSyllabes(sons) {
    var blocs = [];
    var i = 0;

    while (i < sons.length) {
      var c = sons.charAt(i);

      // Une consonne isolée en tête de bloc.
      var initiale = 'ng';
      var consonneSource = '';
      if (!estVoyelleSon(c) && c !== 'j' && c !== 'w') {
        if (ONSET[c]) { initiale = ONSET[c]; consonneSource = c; i++; }
        else { i++; continue; }
      }

      // Glide éventuel, puis voyelle.
      var glide = '';
      if (sons.charAt(i) === 'j' || sons.charAt(i) === 'w') { glide = sons.charAt(i); i++; }

      var v = sons.charAt(i);
      if (!estVoyelleSon(v)) {
        /* Consonne sans voyelle derrière : on lui donne ㅡ pour qu'elle
           puisse exister seule — c'est le 르 de Pierre, le 드 de David. */
        if (consonneSource) {
          /* Devant un l, la consonne isolée le prend en finale plutôt que
             d'ouvrir encore un bloc : Chloé fait 클로에, pas 크로에. */
          /* Le l n'est PAS consommé : il ferme cette syllabe et rouvre la
             suivante, exactement comme entre deux voyelles. Chloé fait
             클로에 — le ㄹ s'entend deux fois. Le consommer donnait 클오에,
             avec une syllabe muette au milieu. */
          var apresCons = sons.charAt(i);
          var finaleCluster = '';
          if (apresCons === 'l' && estVoyelleSon(sons.charAt(i + 1))) {
            finaleCluster = 'r';
          } else if (apresCons === 'l' && i + 1 >= sons.length) {
            /* En toute fin de mot il n'y a plus de syllabe à rouvrir : le
               l se contente de fermer celle-ci, et on le consomme.
               Charles fait 샤를 et non 샤르르, Carl fait 카를. */
            finaleCluster = 'r'; i++;
          }
          blocs.push({
            hangeul: composer(initiale, 'eu', finaleCluster),
            sons: consonneSource + (finaleCluster ? 'l' : '')
          });
          continue;
        }
        /* Un glide en fin de mot forme sa propre syllabe : le « ille »
           de Camille s'entend « you », d'où 유 et non rien du tout. */
        if (glide) {
          blocs.push({
            hangeul: composer('ng', glide === 'j' ? 'yu' : 'u', ''),
            sons: glide
          });
          continue;
        }
        i++; continue;
      }
      i++;

      /* Le « ch » français mouille la voyelle qui suit : Charlotte
         commence par 샤 et non 사, Michel donne 미셸. */
      if (consonneSource === 'S' && !glide) glide = 'j';
      /* Le son « gn » porte le même glide : Agnès fait 아녜스. */
      if (consonneSource === 'J' && !glide) glide = 'j';

      /* Une voyelle nasale ne se combine pas avec un glide : le « lien »
         de Julien s'écrit 리앵, deux blocs, et non un seul 럥 —
         syllabe techniquement valide mais que personne n'écrit. */
      if (glide === 'j' && NASALES[v]) {
        blocs.push({ hangeul: composer(initiale, 'i', ''), sons: (consonneSource || '') + 'i' });
        initiale = 'ng';
        glide = '';
      }

      /* Le coréen n'enchaîne pas consonne + « ou » : François se dit
         프랑수아, en deux blocs, et non 프랑콰. On sort donc le glide w
         dans sa propre syllabe dès qu'une consonne le précède. */
      if (glide === 'w' && consonneSource) {
        blocs.push({ hangeul: composer(initiale, 'u', ''), sons: consonneSource + 'w' });
        initiale = 'ng';
        glide = '';
      }

      var table = glide === 'j' ? NOYAU_J : glide === 'w' ? NOYAU_W : NOYAU;
      var mediane = table[v] || 'a';

      // Voyelle nasale : la nasalité devient une finale ㅇ.
      var finale = '';
      if (NASALES[v]) {
        finale = NASALES[v];
      } else {
        /* Sinon, la consonne suivante peut se loger en finale si le
           coréen l'accepte ET qu'aucune voyelle ne la réclame après. */
        var suivante = sons.charAt(i);
        var apres = sons.charAt(i + 1);
        if (CODA[suivante] && !estVoyelleSon(apres) && apres !== 'j' && apres !== 'w') {
          finale = CODA[suivante];
          i++;
        } else if (suivante === 'l' && estVoyelleSon(apres)) {
          /* Un l entre deux voyelles se DOUBLE en coréen : Nicolas fait
             니콜라 (ni-kol-la) et non 니코라. Le ㄹ ferme la syllabe et
             rouvre la suivante — on pose la finale sans consommer le
             son, qui servira aussi d'attaque au bloc d'après. */
          finale = 'r';
        }
      }

      blocs.push({
        hangeul: composer(initiale, mediane, finale),
        sons: (consonneSource || '') + (glide || '') + v + (finale && !NASALES[v] ? 'n' : '')
      });
    }

    return blocs;
  }

  /* ── API ──────────────────────────────────────────────────────────
     transcrire('Camille') →
       { hangeul: '카미유', blocs: [...], sons: 'kamij' } */
  function transcrire(prenom) {
    var propre = String(prenom || '').trim();
    if (!propre) return { hangeul: '', blocs: [], sons: '' };

    var sons = versSons(propre);
    var blocs = versSyllabes(sons);

    return {
      hangeul: blocs.map(function (b) { return b.hangeul; }).join(''),
      blocs: blocs,
      sons: sons
    };
  }

  global.KSPrenom = { transcrire: transcrire, composer: composer };

})(typeof window !== 'undefined' ? window : this);
