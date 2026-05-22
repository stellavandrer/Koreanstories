/* ═══════════════════════════════════════════════════════════════════
   ks-srs.js — Moteur de répétition espacée partagé (algorithme SM-2)
   Source unique des données de vocabulaire + état SRS.
   Compatible avec les clés localStorage existantes (ks_srs2_*).
   API : window.KSSRS
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── Données de vocabulaire ──────────────────────────────────────── */
  var WORDS = [
  {id:'ga',     kr:'가',   rom:'ga',      fr:'Aller (racine)',     audio:'가',    lec:1},
  {id:'na',     kr:'나',   rom:'na',      fr:'Moi / Je',           audio:'나',    lec:1},
  {id:'gomo',   kr:'고모', rom:'go-mo',   fr:'Tante (côté père)',  audio:'고모',  lec:2},
  {id:'nado',   kr:'나도', rom:'na-do',   fr:'Moi aussi',          audio:'나도',  lec:2},
  {id:'banana', kr:'바나나',rom:'ba-na-na',fr:'Banane',             audio:'바나나', lec:3},
  {id:'subak',  kr:'수박', rom:'su-bak',  fr:'Pastèque',           audio:'수박',  lec:3},
  {id:'iri',    kr:'이리', rom:'i-ri',    fr:'Par ici',            audio:'이리',  lec:4},
  {id:'nara',   kr:'나라', rom:'na-ra',   fr:'Pays',               audio:'나라',  lec:4},
  {id:'jogi',   kr:'저기', rom:'jeo-gi',  fr:'Là-bas',             audio:'저기',  lec:5},
  {id:'jigu',   kr:'지구', rom:'ji-gu',   fr:'La Terre',           audio:'지구',  lec:5},
  {id:'hae',    kr:'해',   rom:'hae',     fr:'Soleil / Mer',       audio:'해',    lec:6},
  {id:'haru',   kr:'하루', rom:'ha-ru',   fr:'Un jour',            audio:'하루',  lec:6},
  {id:'chijeu', kr:'치즈', rom:'chi-jeu', fr:'Fromage',            audio:'치즈',  lec:7},
  {id:'yuri',   kr:'유리', rom:'yu-ri',   fr:'Verre / Vitre',      audio:'유리',  lec:7},
  {id:'pati',   kr:'파티', rom:'pa-ti',   fr:'Fête / Party',       audio:'파티',  lec:8},
  {id:'yachae', kr:'야채', rom:'ya-chae', fr:'Légumes',            audio:'야채',  lec:8},
  {id:'bwayo',  kr:'봐요', rom:'bwa-yo',  fr:'Regarde ! (poli)',   audio:'봐요',  lec:9},
  {id:'yeogi',  kr:'여기', rom:'yeo-gi',  fr:'Ici',                audio:'여기',  lec:9},
  {id:'bballi', kr:'빨리', rom:'bbal-li', fr:'Vite !',             audio:'빨리',  lec:10},
  {id:'tto',    kr:'또',   rom:'tto',     fr:'Encore / Aussi',     audio:'또',    lec:10},
  {id:'sijang',     kr:'시장',    rom:'si-jang',      fr:'Marché',           audio:'시장',     lec:'h2'},
  {id:'joahaeyo',   kr:'좋아해요', rom:'jo-a-hae-yo',  fr:"J'aime / J'adore", audio:'좋아해요', lec:'h2'},
  {id:'eolma',      kr:'얼마',    rom:'eol-ma',       fr:'Combien',          audio:'얼마',     lec:'h2'},
  {id:'bissayo',    kr:'비싸요',  rom:'bi-ssa-yo',    fr:"C'est cher",       audio:'비싸요',   lec:'h2'},
  {id:'masisseoyo', kr:'맛있어요', rom:'ma-si-sseo-yo', fr:"C'est délicieux",  audio:'맛있어요', lec:'h2'},
  {id:'gachi',      kr:'같이',    rom:'ga-chi',       fr:'Ensemble',         audio:'같이',     lec:'h2'},
  {id:'sayo',       kr:'사요',    rom:'sa-yo',        fr:'On achète',        audio:'사요',     lec:'h2'},
  {id:'baegopayo',  kr:'배고파요', rom:'bae-go-pa-yo',  fr:"J'ai faim",        audio:'배고파요', lec:'h3'},
  {id:'sikdang',    kr:'식당',    rom:'sik-dang',      fr:'Restaurant',       audio:'식당',     lec:'h3'},
  {id:'menyu',      kr:'메뉴',    rom:'me-nyu',        fr:'Menu',             audio:'메뉴',     lec:'h3'},
  {id:'jumun',      kr:'주문',    rom:'ju-mun',        fr:'Commande',         audio:'주문',     lec:'h3'},
  {id:'mawoyo',     kr:'매워요',  rom:'mae-wo-yo',     fr:"C'est épicé",      audio:'매워요',   lec:'h3'},
  {id:'jogeum',     kr:'조금',    rom:'jo-geum',       fr:'Un peu',           audio:'조금',     lec:'h3'},
  {id:'mul',        kr:'물',      rom:'mul',           fr:'Eau',              audio:'물',       lec:'h3'},
  {id:'ddo',        kr:'또',      rom:'ddo',           fr:'Encore / De nouveau',audio:'또',     lec:'h3'},
  {id:'kape',       kr:'카페',    rom:'ka-pe',         fr:'Café (lieu)',       audio:'카페',     lec:'h4'},
  {id:'keopi',      kr:'커피',    rom:'keo-pi',        fr:'Café (boisson)',    audio:'커피',     lec:'h4'},
  {id:'aiseu',      kr:'아이스',  rom:'a-i-seu',       fr:'Glacé / Ice',       audio:'아이스',   lec:'h4'},
  {id:'juseyo',     kr:'주세요',  rom:'ju-se-yo',      fr:"S'il vous plaît",  audio:'주세요',   lec:'h4'},
  {id:'tteugeowo',  kr:'뜨거워요', rom:'tteu-geo-wo-yo',fr:"C'est chaud",      audio:'뜨거워요', lec:'h4'},
  {id:'darayo',     kr:'달아요',  rom:'da-ra-yo',      fr:"C'est sucré",      audio:'달아요',   lec:'h4'},
  {id:'gidareoyo',  kr:'기다려요', rom:'gi-da-ryeo-yo', fr:'Attendez !',        audio:'기다려요', lec:'h4'},
  {id:'kadeu',      kr:'카드',    rom:'ka-deu',        fr:'Carte (bancaire)', audio:'카드',     lec:'h4'},
  {id:'pyonijeom',  kr:'편의점',   rom:'pyon-i-jeom',   fr:'Épicerie coréenne', audio:'편의점',   lec:'h5'},
  {id:'h5_bag',     kr:'배고파요', rom:'bae-go-pa-yo',  fr:"J'ai faim",         audio:'배고파요', lec:'h5'},
  {id:'gayo',       kr:'가요',     rom:'ga-yo',         fr:'On y va',           audio:'가요',     lec:'h5'},
  {id:'keomramyeon',kr:'컵라면',   rom:'keop-ra-myeon', fr:'Cup nouilles',      audio:'컵라면',   lec:'h5'},
  {id:'itsoyo',     kr:'있어요',   rom:'it-seo-yo',     fr:"Il y a / J'ai",     audio:'있어요',   lec:'h5'},
  {id:'eolmayeyo',  kr:'얼마예요', rom:'eol-ma-ye-yo',  fr:"C'est combien ?",   audio:'얼마예요', lec:'h5'},
  {id:'won',        kr:'원',       rom:'won',           fr:'Won (monnaie)',      audio:'원',       lec:'h5'},
  {id:'jigap',      kr:'지갑',     rom:'ji-gap',        fr:'Portefeuille',      audio:'지갑',     lec:'h5'},
  {id:'eopseoyo',   kr:'없어요',   rom:'eop-seo-yo',    fr:"Il n'y a pas",      audio:'없어요',   lec:'h5'},
  {id:'haejulgeyo', kr:'해줄게요', rom:'hae-jul-ge-yo', fr:'Je le fais pour toi', audio:'해줄게요', lec:'h5'},
  {id:'masitsoyo',  kr:'맛있어요', rom:'mat-i-sseo-yo', fr:"C'est délicieux",   audio:'맛있어요', lec:'h5'},
  {id:'tto_h5',     kr:'또',       rom:'tto',           fr:'Encore / De nouveau', audio:'또',     lec:'h5'},
  {id:'naeil',      kr:'내일',     rom:'nae-il',        fr:'Demain',            audio:'내일',     lec:'h5'},
  {id:'ppalli_h6',    kr:'빨리',     rom:'ppal-li',         fr:'Vite !',          audio:'빨리',      lec:'h6'},
  {id:'neutseosseoyo',kr:'늦었어요',  rom:'neu-jeo-sseo-yo', fr:'On est en retard',audio:'늦었어요',  lec:'h6'},
  {id:'arayo',        kr:'알아요',   rom:'a-ra-yo',         fr:'Je sais',          audio:'알아요',    lec:'h6'},
  {id:'jihacheol',    kr:'지하철',   rom:'ji-ha-cheol',     fr:'Métro',            audio:'지하철',    lec:'h6'},
  {id:'pyo',          kr:'표',       rom:'pyo',             fr:'Ticket',           audio:'표',        lec:'h6'},
  {id:'gyotonggadeu', kr:'교통카드', rom:'kyo-tong-ka-deu', fr:'Carte T-money',    audio:'교통카드',  lec:'h6'},
  {id:'yeok',         kr:'역',       rom:'yeok',            fr:'Station de métro', audio:'역',        lec:'h6'},
  {id:'anjayo',       kr:'앉아요',   rom:'an-ja-yo',        fr:'Asseyez-vous',     audio:'앉아요',    lec:'h6'},
  {id:'gwaenchanayo', kr:'괜찮아요', rom:'gwaen-cha-na-yo', fr:"C'est ok",       audio:'괜찮아요',  lec:'h6'},
  {id:'daeum',        kr:'다음',     rom:'da-eum',          fr:'Prochain(e)',       audio:'다음',      lec:'h6'},
  {id:'naeryeoyo',    kr:'내려요',   rom:'nae-ryeo-yo',     fr:'On descend',       audio:'내려요',    lec:'h6'},
  {id:'daebak',       kr:'대박이에요',rom:'dae-ba-gi-e-yo', fr:'Super !',          audio:'대박이에요',lec:'h6'},
  {id:'jip',          kr:'집',        rom:'jip',             fr:'Maison / Chez soi',audio:'집',        lec:'h7'},
  {id:'eoseooseyo',   kr:'어서 오세요',rom:'eo-seo o-se-yo',  fr:'Bienvenue !',      audio:'어서 오세요',lec:'h7'},
  {id:'sinbal',       kr:'신발',       rom:'sin-bal',         fr:'Chaussures',       audio:'신발',       lec:'h7'},
  {id:'beoseoyo',     kr:'벗어요',     rom:'beo-seo-yo',      fr:'On enlève',        audio:'벗어요',     lec:'h7'},
  {id:'yeppeoyo',     kr:'예뻐요',     rom:'yep-peo-yo',      fr:"C'est joli",       audio:'예뻐요',     lec:'h7'},
  {id:'mwo',          kr:'뭐',         rom:'mwo',             fr:"Quoi / Qu'est-ce", audio:'뭐',         lec:'h7'},
  {id:'meogeullaeyo', kr:'먹을래요',   rom:'meo-geul-lae-yo', fr:'Tu veux manger ?', audio:'먹을래요',   lec:'h7'},
  {id:'ramyeon',      kr:'라면',       rom:'ra-myeon',        fr:'Ramyeon',          audio:'라면',       lec:'h7'},
  {id:'gachi_h7',     kr:'같이',       rom:'ga-chi',          fr:'Ensemble',         audio:'같이',       lec:'h7'},
  {id:'meogeoyo',     kr:'먹어요',     rom:'meo-geo-yo',      fr:'On mange',         audio:'먹어요',     lec:'h7'},
  {id:'jaemiisseoyo', kr:'재미있어요', rom:'jae-mi-it-seo-yo',fr:"C'est amusant",    audio:'재미있어요', lec:'h7'},
  {id:'gongbu',       kr:'공부',       rom:'gong-bu',         fr:'Étude',            audio:'공부',       lec:'h7'},
  {id:'pigonhaeyo',   kr:'피곤해요',   rom:'pi-gon-hae-yo',   fr:'Je suis fatigué',  audio:'피곤해요',   lec:'h7'},
  {id:'jayo',         kr:'자요',       rom:'ja-yo',           fr:'On dort',          audio:'자요',       lec:'h7'},
  {id:'mianhaeyo',    kr:'미안해요',   rom:'mi-an-hae-yo',    fr:'Désolé(e)',        audio:'미안해요',   lec:'h7'},
  {id:'ireonayo',     kr:'일어나요',   rom:'i-reo-na-yo',     fr:'On se lève',       audio:'일어나요',   lec:'h7'},
  {id:'noraebang', kr:'노래방',   rom:'no-rae-bang',     fr:'Karaoké / Norebang',       audio:'노래방',   lec:'h8'},
  {id:'norae',      kr:'노래',     rom:'no-rae',           fr:'Chanson',                  audio:'노래',     lec:'h8'},
  {id:'sinnayo',    kr:'신나요',   rom:'sin-na-yo',        fr:"C'est fun ! Excitant !",   audio:'신나요',   lec:'h8'},
  {id:'bulreoyo',   kr:'불러요',   rom:'bul-leo-yo',       fr:'On chante',                audio:'불러요',   lec:'h8'},
  {id:'eotteon',    kr:'어떤',     rom:'eo-tteon',         fr:'Quel(le) / Lequel',        audio:'어떤',     lec:'h8'},
  {id:'joayo',      kr:'좋아요',   rom:'jo-a-yo',          fr:"J'aime / C'est bien",      audio:'좋아요',   lec:'h8'},
  {id:'maikheu',    kr:'마이크',   rom:'ma-i-keu',         fr:'Micro',                    audio:'마이크',   lec:'h8'},
  {id:'motaeyo',    kr:'못해요',   rom:'mot-hae-yo',       fr:'Je suis nul(le)',          audio:'못해요',   lec:'h8'},
  {id:'jalhaeyo',   kr:'잘해요',   rom:'jal-hae-yo',       fr:'Tu chantes bien',          audio:'잘해요',   lec:'h8'},
  {id:'jeomsu',     kr:'점수',     rom:'jeom-su',          fr:'Score / Points',           audio:'점수',     lec:'h8'},
  {id:'dasi',       kr:'다시',     rom:'da-si',            fr:'Encore / De nouveau',      audio:'다시',     lec:'h8'},
  {id:'jinjjayo',   kr:'진짜요',   rom:'jin-jja-yo',       fr:'Vraiment ?',               audio:'진짜요',   lec:'h8'},
  {id:'choegoyeyo', kr:'최고예요', rom:'choe-go-ye-yo',    fr:"C'est le top !",           audio:'최고예요', lec:'h8'},
  {id:'baksu',      kr:'박수',     rom:'bak-su',           fr:'Applaudissements',         audio:'박수',     lec:'h8'},
  {id:'nolayo',     kr:'놀아요',   rom:'no-la-yo',         fr:"On s'amuse / On joue",     audio:'놀아요',   lec:'h8'},
  {id:'sori',       kr:'소리',     rom:'so-ri',            fr:'Son / Voix / Bruit',       audio:'소리',     lec:'h8'},
  {id:'byeongwon',  kr:'병원',    rom:'byeong-won',   fr:'Hôpital / Clinique',       audio:'병원',    lec:'h9'},
  {id:'apayo',      kr:'아파요',  rom:'a-pa-yo',       fr:"J'ai mal / Malade",        audio:'아파요',  lec:'h9'},
  {id:'eodiga',     kr:'어디가',  rom:'eo-di-ga',      fr:'Où / Quelle partie',       audio:'어디가',  lec:'h9'},
  {id:'meori',      kr:'머리',    rom:'meo-ri',        fr:'Tête',                     audio:'머리',    lec:'h9'},
  {id:'gichim',     kr:'기침',    rom:'gi-chim',       fr:'Toux',                     audio:'기침',    lec:'h9'},
  {id:'eonje',      kr:'언제',    rom:'eon-je',        fr:'Quand',                    audio:'언제',    lec:'h9'},
  {id:'eoje',       kr:'어제',    rom:'eo-je',         fr:'Hier',                     audio:'어제',    lec:'h9'},
  {id:'yeol',       kr:'열',      rom:'yeol',          fr:'Fièvre',                   audio:'열',      lec:'h9'},
  {id:'do',         kr:'도',      rom:'do',            fr:'Degré / Aussi',            audio:'도',      lec:'h9'},
  {id:'geomsa',     kr:'검사',    rom:'geom-sa',       fr:'Examen médical',           audio:'검사',    lec:'h9'},
  {id:'jom',        kr:'좀',      rom:'jom',           fr:'Un peu',                   audio:'좀',      lec:'h9'},
  {id:'gamgi',      kr:'감기',    rom:'gam-gi',        fr:'Rhume / Grippe',           audio:'감기',    lec:'h9'},
  {id:'yak',        kr:'약',      rom:'yak',           fr:'Médicament',               audio:'약',      lec:'h9'},
  {id:'deurilgeyo', kr:'드릴게요',rom:'deu-ril-ge-yo', fr:'Je vais vous donner',      audio:'드릴게요', lec:'h9'},
  {id:'naayo',      kr:'나아요',  rom:'na-a-yo',       fr:'Ça va mieux',              audio:'나아요',  lec:'h9'},
  {id:'swiseyo',    kr:'쉬세요',  rom:'swi-se-yo',     fr:'Reposez-vous !',           audio:'쉬세요',  lec:'h9'},
  {id:'algesseoyo', kr:'알겠어요',rom:'al-get-seo-yo', fr:"J'ai compris",             audio:'알겠어요', lec:'h9'},
  {id:'syopingmol', kr:'쇼핑몰',   rom:'syo-ping-mol',   fr:'Centre commercial',     audio:'쇼핑몰',   lec:'h10'},
  {id:'seil',       kr:'세일',     rom:'se-il',           fr:'Soldes',                audio:'세일',     lec:'h10'},
  {id:'ot',         kr:'옷',       rom:'ot',              fr:'Vêtement',              audio:'옷',       lec:'h10'},
  {id:'ibeobwayo',  kr:'입어봐요', rom:'i-beo-bwa-yo',    fr:'Essayez / J\'essaie',   audio:'입어봐요', lec:'h10'},
  {id:'saijeu',     kr:'사이즈',   rom:'sa-i-jeu',        fr:'Taille',                audio:'사이즈',   lec:'h10'},
  {id:'eoullyeoyo', kr:'어울려요', rom:'eo-ul-lyeo-yo',   fr:'Ça vous va bien',       audio:'어울려요', lec:'h10'},
  {id:'neomu',      kr:'너무',     rom:'neo-mu',          fr:'Trop / Vraiment',       audio:'너무',     lec:'h10'},
  {id:'salgeyo',    kr:'살게요',   rom:'sal-ge-yo',       fr:"Je vais l'acheter",     audio:'살게요',   lec:'h10'},
  {id:'saekgal',    kr:'색깔',     rom:'saek-gal',        fr:'Couleur',               audio:'색깔',     lec:'h10'},
  {id:'dareun',     kr:'다른',     rom:'da-reun',         fr:'Autre / Différent',     audio:'다른',     lec:'h10'},
  {id:'gyesan',     kr:'계산',     rom:'gye-san',         fr:'Paiement / Caisse',     audio:'계산',     lec:'h10'},
  {id:'hyeongeum',  kr:'현금',     rom:'hyeon-geum',      fr:'Espèces / Cash',        audio:'현금',     lec:'h10'},
  {id:'yeongsujeung',kr:'영수증',  rom:'yeong-su-jeung',  fr:'Reçu',                  audio:'영수증',   lec:'h10'},
  {id:'hwanbul',    kr:'환불',     rom:'hwan-bul',        fr:'Remboursement',         audio:'환불',     lec:'h10'},
  {id:'gyohwan',    kr:'교환',     rom:'gyo-hwan',        fr:'Échange',               audio:'교환',     lec:'h10'},
  {id:'gyeonghaeyo',kr:'구경해요', rom:'gu-gyeong-hae-yo',fr:'Je regarde',            audio:'구경해요', lec:'h10'},
  {id:'jipduri',    kr:'집들이',       rom:'jip-deu-ri',         fr:'Pendaison de crémaillère',   audio:'집들이',       lec:'h11'},
  {id:'eoseo',      kr:'어서 와요',    rom:'eo-seo-wa-yo',       fr:'Bienvenue / Entrez !',       audio:'어서 와요',    lec:'h11'},
  {id:'saejip',     kr:'새집',         rom:'sae-jip',            fr:'Nouvelle maison',            audio:'새집',         lec:'h11'},
  {id:'yeppeoyo_h11',kr:'예뻐요',      rom:'yep-peo-yo',         fr:"C'est beau / Joli",          audio:'예뻐요',       lec:'h11'},
  {id:'seonmul',    kr:'선물',         rom:'seon-mul',           fr:'Cadeau',                     audio:'선물',         lec:'h11'},
  {id:'gamsahaeyo', kr:'감사해요',     rom:'gam-sa-hae-yo',      fr:'Merci / Je vous remercie',   audio:'감사해요',     lec:'h11'},
  {id:'neolbeoyo',  kr:'넓어요',       rom:'neol-beo-yo',        fr:"C'est grand / Spacieux",     audio:'넓어요',       lec:'h11'},
  {id:'maeumei',    kr:'마음에 들어요',rom:'ma-eum-e-deu-leo-yo', fr:"J'adore / Ça me plaît",     audio:'마음에 들어요',lec:'h11'},
  {id:'masitge',    kr:'맛있게 드세요',rom:'ma-sit-ge-deu-se-yo', fr:'Bon appétit !',             audio:'맛있게 드세요',lec:'h11'},
  {id:'baebulleo',  kr:'배불러요',     rom:'bae-bul-leo-yo',     fr:"Je suis rassasié(e)",        audio:'배불러요',     lec:'h11'},
  {id:'chukhahaeyo',kr:'축하해요',     rom:'chu-ka-hae-yo',      fr:'Félicitations !',            audio:'축하해요',     lec:'h11'},
  {id:'haengbok',   kr:'행복하세요',   rom:'haeng-bok-ha-se-yo', fr:'Soyez heureux(se) !',        audio:'행복하세요',   lec:'h11'},
  {id:'orae',       kr:'오래오래',     rom:'o-rae-o-rae',        fr:'Longtemps / Durablement',    audio:'오래오래',     lec:'h11'},
  {id:'ttoolgeyyo', kr:'또 올게요',    rom:'tto-ol-ge-yo',       fr:'Je reviendrai !',            audio:'또 올게요',    lec:'h11'},
  ];

  /* ── Helpers localStorage ────────────────────────────────────────── */
  var PREFIX = 'ks_srs2_';
  function today() { return new Date().toISOString().slice(0, 10); }
  function ls(k)   { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function getState(id) {
    try { return JSON.parse(localStorage.getItem(PREFIX + id) || 'null'); }
    catch (e) { return null; }
  }
  function setState(id, data) {
    try { localStorage.setItem(PREFIX + id, JSON.stringify(data)); } catch (e) {}
  }

  /* ── Algorithme SM-2 ─────────────────────────────────────────────── */
  /* quality >= 3 : bonne réponse · sinon : reset */
  function sm2(quality, reps, ef, interval) {
    if (quality >= 3) {
      if (reps === 0)      interval = 1;
      else if (reps === 1) interval = 6;
      else                 interval = Math.round(interval * ef);
      reps++;
      ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (ef < 1.3) ef = 1.3;
    } else {
      reps = 0;
      interval = 1;
      ef = Math.max(1.3, ef - 0.2);
    }
    var d = new Date();
    d.setDate(d.getDate() + interval);
    return {
      reps: reps,
      ef: parseFloat(ef.toFixed(2)),
      interval: interval,
      due: d.toISOString().slice(0, 10),
      lastReview: today()
    };
  }

  /* ── Requêtes ────────────────────────────────────────────────────── */
  /* Mots disponibles = issus des leçons/histoires terminées */
  function available() {
    var done = {};
    for (var i = 1; i <= 10; i++) done[i] = ls('ks_l' + i) === 'done';
    var hDone = {};
    for (var j = 2; j <= 11; j++) hDone['h' + j] = ls('ks_h' + j) === 'done';
    return WORDS.filter(function (w) {
      if (typeof w.lec === 'string' && w.lec.charAt(0) === 'h') return !!hDone[w.lec];
      return !!done[w.lec];
    });
  }

  /* Mots dus aujourd'hui (déjà vus, échéance atteinte) */
  function due() {
    var t = today();
    return available().filter(function (w) {
      var s = getState(w.id);
      return s && s.due <= t;
    });
  }

  /* Nouveaux mots jamais étudiés */
  function fresh() {
    return available().filter(function (w) { return !getState(w.id); });
  }

  /* Mots maîtrisés (intervalle >= 21 jours) */
  function mastered() {
    return available().filter(function (w) {
      var s = getState(w.id);
      return s && s.interval >= 21;
    });
  }

  /* Statistiques agrégées pour le tableau de bord */
  function stats() {
    var t = today(), av = available();
    var d = 0, n = 0, m = 0, learning = 0;
    av.forEach(function (w) {
      var s = getState(w.id);
      if (!s) { n++; return; }
      if (s.due <= t) d++;
      if (s.interval >= 21) m++; else learning++;
    });
    return {
      available: av.length,   /* mots débloqués          */
      due: d,                 /* à réviser maintenant    */
      fresh: n,               /* nouveaux à découvrir    */
      mastered: m,            /* maîtrisés (>=21j)       */
      learning: learning,     /* en cours d'apprentissage */
      total: WORDS.length     /* total du catalogue      */
    };
  }

  /* ── Connexion leçons → SRS ──────────────────────────────────────── */
  /* Insère dans le moteur les mots des leçons/histoires terminées qui
     n'y sont pas encore. Idempotent (les mots déjà présents sont
     intacts). Les échéances sont étalées (~12 mots/jour, dès aujourd'hui)
     pour qu'un apprenant avec beaucoup de leçons terminées ne se
     retrouve pas avec une montagne de révisions le même jour.
     Retourne le nombre de mots nouvellement insérés. */
  function syncLessons() {
    var unseeded = available().filter(function (w) { return !getState(w.id); });
    if (!unseeded.length) return 0;
    var BATCH = 12, base = new Date();
    unseeded.forEach(function (w, i) {
      var d = new Date(base);
      d.setDate(d.getDate() + Math.floor(i / BATCH));   /* dès aujourd'hui, étalé */
      setState(w.id, {
        reps: 0,
        ef: 2.5,
        interval: 0,
        due: d.toISOString().slice(0, 10),
        lastReview: null,
        seeded: true            /* mot entré via une leçon, pas encore révisé */
      });
    });
    return unseeded.length;
  }

  global.KSSRS = {
    words: WORDS,
    PREFIX: PREFIX,
    today: today,
    getState: getState,
    setState: setState,
    sm2: sm2,
    available: available,
    due: due,
    fresh: fresh,
    mastered: mastered,
    stats: stats,
    syncLessons: syncLessons
  };

  /* Auto-synchronisation : à chaque chargement, les leçons terminées
     depuis la dernière visite alimentent automatiquement la file SRS. */
  try { syncLessons(); } catch (e) {}

})(window);
