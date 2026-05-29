/* ═══════════════════════════════════════════════════════════════════
   ks-dictionary.js — Dictionnaire coréen → français.
   ──────────────────────────────────────────────────────────────────
   ~250 entrées du vocabulaire A1/A2 standard de tous les manuels.
   Aucun mot inventé — uniquement du vocabulaire universellement connu
   et traduit dans tous les dictionnaires.

   Format d'entrée :
   {
     ko: '학교',       // mot coréen
     fr: 'école',       // traduction française
     rom: 'hakgyo',     // romanisation
     pos: 'nom',        // partie du discours (optionnel)
     ex: '저는 학교에 가요' // exemple (optionnel)
   }

   API publique :
   - KSDict.lookup(word) → entry ou null
   - KSDict.lookupFlex(word) → essaye en retirant particules courantes
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── Dictionnaire principal ────────────────────────────────────── */
  var DICT = {
    /* === SALUTATIONS & POLITESSE === */
    '안녕': { fr: 'Salut', rom: 'annyeong', pos: 'salut' },
    '안녕하세요': { fr: 'Bonjour (poli)', rom: 'annyeonghaseyo', pos: 'salut' },
    '안녕히': { fr: 'En paix (formule)', rom: 'annyeonghi', pos: 'adv' },
    '감사합니다': { fr: 'Merci (très poli)', rom: 'gamsahamnida', pos: 'expr' },
    '고맙습니다': { fr: 'Merci', rom: 'gomapseumnida', pos: 'expr' },
    '고마워요': { fr: 'Merci', rom: 'gomawoyo', pos: 'expr' },
    '죄송합니다': { fr: 'Désolé(e) (très poli)', rom: 'joesonghamnida', pos: 'expr' },
    '미안해요': { fr: 'Désolé(e)', rom: 'mianhaeyo', pos: 'expr' },
    '미안': { fr: 'Désolé (informel)', rom: 'mian', pos: 'expr' },
    '괜찮아요': { fr: 'Ça va / Pas de souci', rom: 'gwaenchanayo', pos: 'expr' },
    '괜찮다': { fr: 'aller bien / convenir', rom: 'gwaenchanta', pos: 'verbe' },
    '반가워요': { fr: 'Enchanté(e)', rom: 'bangawoyo', pos: 'expr' },
    '환영합니다': { fr: 'Bienvenue', rom: 'hwanyeonghamnida', pos: 'expr' },

    /* === RÉPONSES === */
    '네': { fr: 'Oui', rom: 'ne', pos: 'adv' },
    '예': { fr: 'Oui (formel)', rom: 'ye', pos: 'adv' },
    '아니요': { fr: 'Non', rom: 'aniyo', pos: 'adv' },
    '아니': { fr: 'Non (informel)', rom: 'ani', pos: 'adv' },
    '맞아요': { fr: "C'est ça / Exact", rom: 'majayo', pos: 'expr' },
    '몰라요': { fr: 'Je ne sais pas', rom: 'mollayo', pos: 'expr' },
    '알아요': { fr: 'Je sais', rom: 'arayo', pos: 'expr' },
    '알았어요': { fr: 'Compris', rom: 'arasseoyo', pos: 'expr' },
    '좋아요': { fr: "Bien / J'aime / OK", rom: 'joahyo', pos: 'expr' },
    '싫어요': { fr: "Je n'aime pas", rom: 'sireoyo', pos: 'expr' },

    /* === PRONOMS === */
    '저': { fr: 'je / moi (poli)', rom: 'jeo', pos: 'pron' },
    '나': { fr: 'je / moi (informel)', rom: 'na', pos: 'pron' },
    '제': { fr: 'mon / ma (poli)', rom: 'je', pos: 'pron' },
    '내': { fr: 'mon / ma (informel)', rom: 'nae', pos: 'pron' },
    '너': { fr: 'tu (informel)', rom: 'neo', pos: 'pron' },
    '당신': { fr: 'vous (entre conjoints)', rom: 'dangsin', pos: 'pron' },
    '우리': { fr: 'nous / notre', rom: 'uri', pos: 'pron' },
    '저희': { fr: 'nous (humble)', rom: 'jeohui', pos: 'pron' },
    '그': { fr: 'il / ce', rom: 'geu', pos: 'pron' },
    '이': { fr: 'ce / celui-ci', rom: 'i', pos: 'pron' },

    /* === FAMILLE === */
    '가족': { fr: 'famille', rom: 'gajok', pos: 'nom' },
    '엄마': { fr: 'maman', rom: 'eomma', pos: 'nom' },
    '아빠': { fr: 'papa', rom: 'appa', pos: 'nom' },
    '어머니': { fr: 'mère (poli)', rom: 'eomeoni', pos: 'nom' },
    '아버지': { fr: 'père (poli)', rom: 'abeoji', pos: 'nom' },
    '부모님': { fr: 'parents (poli)', rom: 'bumonim', pos: 'nom' },
    '형': { fr: 'grand frère (pour un homme)', rom: 'hyeong', pos: 'nom' },
    '오빠': { fr: 'grand frère (pour une femme)', rom: 'oppa', pos: 'nom' },
    '누나': { fr: 'grande sœur (pour un homme)', rom: 'nuna', pos: 'nom' },
    '언니': { fr: 'grande sœur (pour une femme)', rom: 'eonni', pos: 'nom' },
    '동생': { fr: 'petit frère / petite sœur', rom: 'dongsaeng', pos: 'nom' },
    '남동생': { fr: 'petit frère', rom: 'namdongsaeng', pos: 'nom' },
    '여동생': { fr: 'petite sœur', rom: 'yeodongsaeng', pos: 'nom' },
    '아들': { fr: 'fils', rom: 'adeul', pos: 'nom' },
    '딸': { fr: 'fille', rom: 'ttal', pos: 'nom' },
    '아이': { fr: 'enfant', rom: 'ai', pos: 'nom' },
    '할아버지': { fr: 'grand-père', rom: 'harabeoji', pos: 'nom' },
    '할머니': { fr: 'grand-mère', rom: 'halmeoni', pos: 'nom' },
    '남편': { fr: 'mari', rom: 'nampyeon', pos: 'nom' },
    '아내': { fr: 'épouse', rom: 'anae', pos: 'nom' },
    '친구': { fr: 'ami(e)', rom: 'chingu', pos: 'nom' },

    /* === LIEUX === */
    '집': { fr: 'maison', rom: 'jip', pos: 'nom' },
    '학교': { fr: 'école', rom: 'hakgyo', pos: 'nom' },
    '회사': { fr: 'entreprise', rom: 'hoesa', pos: 'nom' },
    '병원': { fr: 'hôpital', rom: 'byeongwon', pos: 'nom' },
    '약국': { fr: 'pharmacie', rom: 'yakguk', pos: 'nom' },
    '식당': { fr: 'restaurant', rom: 'sikdang', pos: 'nom' },
    '카페': { fr: 'café (lieu)', rom: 'kape', pos: 'nom' },
    '카페에': { fr: 'au café', rom: 'kape-e', pos: 'expr' },
    '시장': { fr: 'marché', rom: 'sijang', pos: 'nom' },
    '마트': { fr: 'supermarché', rom: 'mateu', pos: 'nom' },
    '백화점': { fr: 'grand magasin', rom: 'baekhwajeom', pos: 'nom' },
    '공원': { fr: 'parc', rom: 'gongwon', pos: 'nom' },
    '도서관': { fr: 'bibliothèque', rom: 'doseogwan', pos: 'nom' },
    '은행': { fr: 'banque', rom: 'eunhaeng', pos: 'nom' },
    '우체국': { fr: 'bureau de poste', rom: 'ucheguk', pos: 'nom' },
    '역': { fr: 'gare / station', rom: 'yeok', pos: 'nom' },
    '공항': { fr: 'aéroport', rom: 'gonghang', pos: 'nom' },
    '호텔': { fr: 'hôtel', rom: 'hotel', pos: 'nom' },
    '서울': { fr: 'Séoul', rom: 'seoul', pos: 'nom' },
    '부산': { fr: 'Busan', rom: 'busan', pos: 'nom' },
    '한국': { fr: 'Corée', rom: 'hanguk', pos: 'nom' },
    '나라': { fr: 'pays', rom: 'nara', pos: 'nom' },
    '방': { fr: 'chambre / pièce', rom: 'bang', pos: 'nom' },

    /* === CUISINE === */
    '음식': { fr: 'nourriture', rom: 'eumsik', pos: 'nom' },
    '밥': { fr: 'riz / repas', rom: 'bap', pos: 'nom' },
    '국': { fr: 'soupe', rom: 'guk', pos: 'nom' },
    '김치': { fr: 'kimchi', rom: 'kimchi', pos: 'nom' },
    '비빔밥': { fr: 'bibimbap', rom: 'bibimbap', pos: 'nom' },
    '떡볶이': { fr: 'tteokbokki (galettes de riz épicées)', rom: 'tteokbokki', pos: 'nom' },
    '김밥': { fr: 'kimbap (rouleau de riz)', rom: 'kimbap', pos: 'nom' },
    '불고기': { fr: 'bulgogi (bœuf mariné)', rom: 'bulgogi', pos: 'nom' },
    '냉면': { fr: 'naengmyeon (nouilles froides)', rom: 'naengmyeon', pos: 'nom' },
    '삼겹살': { fr: 'samgyeopsal (poitrine de porc)', rom: 'samgyeopsal', pos: 'nom' },
    '치킨': { fr: 'poulet', rom: 'chikin', pos: 'nom' },
    '맥주': { fr: 'bière', rom: 'maekju', pos: 'nom' },
    '소주': { fr: 'soju', rom: 'soju', pos: 'nom' },
    '커피': { fr: 'café (boisson)', rom: 'keopi', pos: 'nom' },
    '차': { fr: 'thé / voiture', rom: 'cha', pos: 'nom' },
    '물': { fr: 'eau', rom: 'mul', pos: 'nom' },
    '우유': { fr: 'lait', rom: 'uyu', pos: 'nom' },
    '빵': { fr: 'pain', rom: 'ppang', pos: 'nom' },
    '과일': { fr: 'fruit', rom: 'gwail', pos: 'nom' },
    '사과': { fr: 'pomme', rom: 'sagwa', pos: 'nom' },
    '바나나': { fr: 'banane', rom: 'banana', pos: 'nom' },
    '맛있어요': { fr: 'C\'est délicieux', rom: 'masisseoyo', pos: 'expr' },
    '맛있다': { fr: 'être délicieux', rom: 'masitda', pos: 'adj' },

    /* === VERBES COURANTS === */
    '가다': { fr: 'aller', rom: 'gada', pos: 'verbe' },
    '오다': { fr: 'venir', rom: 'oda', pos: 'verbe' },
    '먹다': { fr: 'manger', rom: 'meokda', pos: 'verbe' },
    '먹어요': { fr: '(je) mange', rom: 'meogeoyo', pos: 'verbe' },
    '마시다': { fr: 'boire', rom: 'masida', pos: 'verbe' },
    '보다': { fr: 'voir / regarder', rom: 'boda', pos: 'verbe' },
    '봐요': { fr: '(je) regarde', rom: 'bwayo', pos: 'verbe' },
    '듣다': { fr: 'écouter', rom: 'deutda', pos: 'verbe' },
    '읽다': { fr: 'lire', rom: 'ikda', pos: 'verbe' },
    '쓰다': { fr: 'écrire / utiliser', rom: 'sseuda', pos: 'verbe' },
    '말하다': { fr: 'parler', rom: 'malhada', pos: 'verbe' },
    '하다': { fr: 'faire', rom: 'hada', pos: 'verbe' },
    '해요': { fr: '(je) fais', rom: 'haeyo', pos: 'verbe' },
    '있다': { fr: 'être (existence) / avoir', rom: 'itda', pos: 'verbe' },
    '있어요': { fr: '(il) y a / j\'ai', rom: 'isseoyo', pos: 'verbe' },
    '없다': { fr: 'ne pas être / ne pas avoir', rom: 'eopda', pos: 'verbe' },
    '없어요': { fr: '(il) n\'y a pas / je n\'ai pas', rom: 'eopseoyo', pos: 'verbe' },
    '이다': { fr: 'être (identité)', rom: 'ida', pos: 'verbe' },
    '아니다': { fr: 'ne pas être', rom: 'anida', pos: 'verbe' },
    '자다': { fr: 'dormir', rom: 'jada', pos: 'verbe' },
    '일어나다': { fr: 'se lever', rom: 'ireonada', pos: 'verbe' },
    '살다': { fr: 'vivre / habiter', rom: 'salda', pos: 'verbe' },
    '만나다': { fr: 'rencontrer', rom: 'mannada', pos: 'verbe' },
    '공부하다': { fr: 'étudier', rom: 'gongbuhada', pos: 'verbe' },
    '일하다': { fr: 'travailler', rom: 'ilhada', pos: 'verbe' },
    '사다': { fr: 'acheter', rom: 'sada', pos: 'verbe' },
    '팔다': { fr: 'vendre', rom: 'palda', pos: 'verbe' },
    '주다': { fr: 'donner', rom: 'juda', pos: 'verbe' },
    '받다': { fr: 'recevoir', rom: 'batda', pos: 'verbe' },
    '알다': { fr: 'savoir / connaître', rom: 'alda', pos: 'verbe' },
    '모르다': { fr: 'ne pas savoir', rom: 'moreuda', pos: 'verbe' },
    '좋아하다': { fr: 'aimer (qqch)', rom: 'joahada', pos: 'verbe' },
    '사랑하다': { fr: 'aimer (qqn)', rom: 'saranghada', pos: 'verbe' },
    '싫어하다': { fr: 'ne pas aimer', rom: 'sireohada', pos: 'verbe' },
    '원하다': { fr: 'vouloir', rom: 'wonhada', pos: 'verbe' },
    '필요하다': { fr: 'avoir besoin', rom: 'piryohada', pos: 'verbe' },
    '운동하다': { fr: 'faire du sport', rom: 'undonghada', pos: 'verbe' },
    '쉬다': { fr: 'se reposer', rom: 'swida', pos: 'verbe' },
    '걷다': { fr: 'marcher', rom: 'geotda', pos: 'verbe' },
    '뛰다': { fr: 'courir', rom: 'ttwida', pos: 'verbe' },
    '타다': { fr: 'monter (transport)', rom: 'tada', pos: 'verbe' },

    /* === ADJECTIFS === */
    '좋다': { fr: 'être bon / bien', rom: 'jota', pos: 'adj' },
    '나쁘다': { fr: 'être mauvais', rom: 'nappeuda', pos: 'adj' },
    '크다': { fr: 'être grand', rom: 'keuda', pos: 'adj' },
    '작다': { fr: 'être petit', rom: 'jakda', pos: 'adj' },
    '많다': { fr: 'être nombreux / beaucoup', rom: 'manta', pos: 'adj' },
    '적다': { fr: 'être peu', rom: 'jeokda', pos: 'adj' },
    '높다': { fr: 'être haut', rom: 'nopda', pos: 'adj' },
    '낮다': { fr: 'être bas', rom: 'natda', pos: 'adj' },
    '길다': { fr: 'être long', rom: 'gilda', pos: 'adj' },
    '짧다': { fr: 'être court', rom: 'jjalpda', pos: 'adj' },
    '예쁘다': { fr: 'être joli', rom: 'yeppeuda', pos: 'adj' },
    '아름답다': { fr: 'être beau / belle', rom: 'areumdapda', pos: 'adj' },
    '귀엽다': { fr: 'être mignon', rom: 'gwiyeopda', pos: 'adj' },
    '재미있다': { fr: 'être amusant', rom: 'jaemiitda', pos: 'adj' },
    '재미없다': { fr: 'être ennuyeux', rom: 'jaemieopda', pos: 'adj' },
    '어렵다': { fr: 'être difficile', rom: 'eoryeopda', pos: 'adj' },
    '쉽다': { fr: 'être facile', rom: 'swipda', pos: 'adj' },
    '비싸다': { fr: 'être cher', rom: 'bissada', pos: 'adj' },
    '싸다': { fr: 'être bon marché', rom: 'ssada', pos: 'adj' },
    '뜨겁다': { fr: 'être brûlant', rom: 'tteugeopda', pos: 'adj' },
    '차갑다': { fr: 'être froid (au toucher)', rom: 'chagapda', pos: 'adj' },
    '덥다': { fr: 'faire chaud', rom: 'deopda', pos: 'adj' },
    '춥다': { fr: 'faire froid', rom: 'chupda', pos: 'adj' },
    '맛없다': { fr: 'être mauvais (goût)', rom: 'maseopda', pos: 'adj' },
    '바쁘다': { fr: 'être occupé', rom: 'bappeuda', pos: 'adj' },
    '피곤하다': { fr: 'être fatigué', rom: 'pigonhada', pos: 'adj' },

    /* === COULEURS === */
    '색': { fr: 'couleur', rom: 'saek', pos: 'nom' },
    '빨강': { fr: 'rouge', rom: 'ppalgang', pos: 'nom' },
    '빨간색': { fr: 'rouge', rom: 'ppalgansaek', pos: 'nom' },
    '파랑': { fr: 'bleu', rom: 'parang', pos: 'nom' },
    '파란색': { fr: 'bleu', rom: 'paransaek', pos: 'nom' },
    '노란색': { fr: 'jaune', rom: 'noransaek', pos: 'nom' },
    '하얀색': { fr: 'blanc', rom: 'hayansaek', pos: 'nom' },
    '검정': { fr: 'noir', rom: 'geomjeong', pos: 'nom' },
    '검은색': { fr: 'noir', rom: 'geomeunsaek', pos: 'nom' },
    '초록색': { fr: 'vert', rom: 'choroksaek', pos: 'nom' },

    /* === TEMPS === */
    '시간': { fr: 'temps / heure', rom: 'sigan', pos: 'nom' },
    '오늘': { fr: 'aujourd\'hui', rom: 'oneul', pos: 'nom' },
    '어제': { fr: 'hier', rom: 'eoje', pos: 'nom' },
    '내일': { fr: 'demain', rom: 'naeil', pos: 'nom' },
    '지금': { fr: 'maintenant', rom: 'jigeum', pos: 'adv' },
    '나중에': { fr: 'plus tard', rom: 'najunge', pos: 'adv' },
    '아침': { fr: 'matin', rom: 'achim', pos: 'nom' },
    '점심': { fr: 'midi / déjeuner', rom: 'jeomsim', pos: 'nom' },
    '저녁': { fr: 'soir / dîner', rom: 'jeonyeok', pos: 'nom' },
    '밤': { fr: 'nuit', rom: 'bam', pos: 'nom' },
    '낮': { fr: 'jour (journée)', rom: 'nat', pos: 'nom' },
    '주말': { fr: 'week-end', rom: 'jumal', pos: 'nom' },
    '월요일': { fr: 'lundi', rom: 'woryoil', pos: 'nom' },
    '화요일': { fr: 'mardi', rom: 'hwayoil', pos: 'nom' },
    '수요일': { fr: 'mercredi', rom: 'suyoil', pos: 'nom' },
    '목요일': { fr: 'jeudi', rom: 'mogyoil', pos: 'nom' },
    '금요일': { fr: 'vendredi', rom: 'geumyoil', pos: 'nom' },
    '토요일': { fr: 'samedi', rom: 'toyoil', pos: 'nom' },
    '일요일': { fr: 'dimanche', rom: 'iryoil', pos: 'nom' },
    '년': { fr: 'année', rom: 'nyeon', pos: 'nom' },
    '월': { fr: 'mois', rom: 'wol', pos: 'nom' },
    '일': { fr: 'jour / un (chiffre)', rom: 'il', pos: 'nom' },
    '주': { fr: 'semaine', rom: 'ju', pos: 'nom' },

    /* === MÉTÉO === */
    '날씨': { fr: 'météo', rom: 'nalssi', pos: 'nom' },
    '비': { fr: 'pluie', rom: 'bi', pos: 'nom' },
    '눈': { fr: 'neige / œil', rom: 'nun', pos: 'nom' },
    '바람': { fr: 'vent', rom: 'baram', pos: 'nom' },
    '해': { fr: 'soleil / année', rom: 'hae', pos: 'nom' },
    '구름': { fr: 'nuage', rom: 'gureum', pos: 'nom' },
    '하늘': { fr: 'ciel', rom: 'haneul', pos: 'nom' },
    '봄': { fr: 'printemps', rom: 'bom', pos: 'nom' },
    '여름': { fr: 'été', rom: 'yeoreum', pos: 'nom' },
    '가을': { fr: 'automne', rom: 'gaeul', pos: 'nom' },
    '겨울': { fr: 'hiver', rom: 'gyeoul', pos: 'nom' },

    /* === CHIFFRES === */
    '이': { fr: '2 (sino-coréen)', rom: 'i', pos: 'num' },
    '삼': { fr: '3', rom: 'sam', pos: 'num' },
    '사': { fr: '4', rom: 'sa', pos: 'num' },
    '오': { fr: '5', rom: 'o', pos: 'num' },
    '육': { fr: '6', rom: 'yuk', pos: 'num' },
    '칠': { fr: '7', rom: 'chil', pos: 'num' },
    '팔': { fr: '8', rom: 'pal', pos: 'num' },
    '구': { fr: '9', rom: 'gu', pos: 'num' },
    '십': { fr: '10', rom: 'sip', pos: 'num' },
    '백': { fr: '100', rom: 'baek', pos: 'num' },
    '천': { fr: '1 000', rom: 'cheon', pos: 'num' },
    '만': { fr: '10 000 / seulement', rom: 'man', pos: 'num' },
    '하나': { fr: '1 (natif)', rom: 'hana', pos: 'num' },
    '둘': { fr: '2 (natif)', rom: 'dul', pos: 'num' },
    '셋': { fr: '3 (natif)', rom: 'set', pos: 'num' },
    '넷': { fr: '4 (natif)', rom: 'net', pos: 'num' },
    '다섯': { fr: '5 (natif)', rom: 'daseot', pos: 'num' },
    '여섯': { fr: '6 (natif)', rom: 'yeoseot', pos: 'num' },
    '일곱': { fr: '7 (natif)', rom: 'ilgop', pos: 'num' },
    '여덟': { fr: '8 (natif)', rom: 'yeodeol', pos: 'num' },
    '아홉': { fr: '9 (natif)', rom: 'ahop', pos: 'num' },
    '열': { fr: '10 (natif)', rom: 'yeol', pos: 'num' },

    /* === MOTS INTERROGATIFS === */
    '뭐': { fr: 'quoi', rom: 'mwo', pos: 'interr' },
    '무엇': { fr: 'quoi (formel)', rom: 'mueot', pos: 'interr' },
    '뭐예요': { fr: "C'est quoi ?", rom: 'mwoyeyo', pos: 'expr' },
    '어디': { fr: 'où', rom: 'eodi', pos: 'interr' },
    '어디예요': { fr: "C'est où ?", rom: 'eodi-yeyo', pos: 'expr' },
    '언제': { fr: 'quand', rom: 'eonje', pos: 'interr' },
    '왜': { fr: 'pourquoi', rom: 'wae', pos: 'interr' },
    '어떻게': { fr: 'comment', rom: 'eotteoke', pos: 'interr' },
    '누구': { fr: 'qui', rom: 'nugu', pos: 'interr' },
    '얼마': { fr: 'combien', rom: 'eolma', pos: 'interr' },
    '얼마예요': { fr: "Combien ça coûte ?", rom: 'eolma-yeyo', pos: 'expr' },
    '몇': { fr: 'combien de', rom: 'myeot', pos: 'interr' },

    /* === ADVERBES & MODIFICATEURS === */
    '아주': { fr: 'très', rom: 'aju', pos: 'adv' },
    '너무': { fr: 'trop', rom: 'neomu', pos: 'adv' },
    '조금': { fr: 'un peu', rom: 'jogeum', pos: 'adv' },
    '많이': { fr: 'beaucoup', rom: 'mani', pos: 'adv' },
    '잘': { fr: 'bien', rom: 'jal', pos: 'adv' },
    '못': { fr: 'ne pas pouvoir', rom: 'mot', pos: 'adv' },
    '안': { fr: 'ne pas (volonté)', rom: 'an', pos: 'adv' },
    '빨리': { fr: 'vite', rom: 'ppalli', pos: 'adv' },
    '천천히': { fr: 'lentement', rom: 'cheoncheonhi', pos: 'adv' },
    '같이': { fr: 'ensemble', rom: 'gachi', pos: 'adv' },
    '혼자': { fr: 'seul(e)', rom: 'honja', pos: 'adv' },
    '아직': { fr: 'encore / pas encore', rom: 'ajik', pos: 'adv' },
    '벌써': { fr: 'déjà', rom: 'beolsseo', pos: 'adv' },
    '항상': { fr: 'toujours', rom: 'hangsang', pos: 'adv' },
    '자주': { fr: 'souvent', rom: 'jaju', pos: 'adv' },
    '가끔': { fr: 'parfois', rom: 'gakkeum', pos: 'adv' },

    /* === ÉMOTIONS === */
    '기쁘다': { fr: 'être joyeux', rom: 'gippeuda', pos: 'adj' },
    '슬프다': { fr: 'être triste', rom: 'seulpeuda', pos: 'adj' },
    '화나다': { fr: 'être en colère', rom: 'hwanada', pos: 'verbe' },
    '무섭다': { fr: 'avoir peur / faire peur', rom: 'museopda', pos: 'adj' },
    '행복하다': { fr: 'être heureux', rom: 'haengbokhada', pos: 'adj' },
    '슬픔': { fr: 'tristesse', rom: 'seulpeum', pos: 'nom' },
    '기쁨': { fr: 'joie', rom: 'gippeum', pos: 'nom' },
    '사랑': { fr: 'amour', rom: 'sarang', pos: 'nom' },
    '걱정': { fr: 'souci', rom: 'geokjeong', pos: 'nom' },

    /* === EXPRESSIONS UTILES === */
    '안녕히 가세요': { fr: 'Au revoir (à celui qui part)', rom: 'annyeonghi gaseyo', pos: 'expr' },
    '안녕히 계세요': { fr: 'Au revoir (à celui qui reste)', rom: 'annyeonghi gyeseyo', pos: 'expr' },
    '만나서 반가워요': { fr: 'Enchanté(e)', rom: 'mannaseo bangawoyo', pos: 'expr' },
    '잘 자요': { fr: 'Bonne nuit', rom: 'jal jayo', pos: 'expr' },
    '잘 가요': { fr: 'Bon voyage / Salut', rom: 'jal gayo', pos: 'expr' },
    '잘 먹겠습니다': { fr: 'Bon appétit (avant)', rom: 'jal meokgesseumnida', pos: 'expr' },
    '잘 먹었습니다': { fr: 'Merci pour le repas (après)', rom: 'jal meogeotseumnida', pos: 'expr' },
    '화이팅': { fr: 'Courage ! (Fighting!)', rom: 'hwaiting', pos: 'expr' },
    '사랑해요': { fr: "Je t'aime", rom: 'saranghaeyo', pos: 'expr' },
    '보고 싶어요': { fr: 'Tu me manques', rom: 'bogo sipeoyo', pos: 'expr' },

    /* === PARTICULES (les plus fréquentes) === */
    '이/가': { fr: 'particule de sujet', rom: 'i/ga', pos: 'part' },
    '을/를': { fr: 'particule d\'objet direct', rom: 'eul/reul', pos: 'part' },
    '은/는': { fr: 'particule de thème', rom: 'eun/neun', pos: 'part' },
    '에': { fr: 'à / dans (lieu, temps)', rom: 'e', pos: 'part' },
    '에서': { fr: 'depuis / à (action)', rom: 'eseo', pos: 'part' },
    '로': { fr: 'vers / par', rom: 'ro', pos: 'part' },
    '으로': { fr: 'vers / par', rom: 'euro', pos: 'part' },
    '와': { fr: 'et / avec', rom: 'wa', pos: 'part' },
    '과': { fr: 'et / avec', rom: 'gwa', pos: 'part' },
    '도': { fr: 'aussi', rom: 'do', pos: 'part' },
    '만': { fr: 'seulement', rom: 'man', pos: 'part' },
    '의': { fr: 'de (possessif)', rom: 'ui', pos: 'part' },
    '에게': { fr: 'à (qqn)', rom: 'ege', pos: 'part' },
    '한테': { fr: 'à (qqn) informel', rom: 'hante', pos: 'part' },
    '부터': { fr: 'depuis', rom: 'buteo', pos: 'part' },
    '까지': { fr: 'jusqu\'à', rom: 'kkaji', pos: 'part' }
  };

  /* ── Particules à retirer en fin de mot pour matcher la racine ── */
  var TRAILING_PARTICLES = [
    '에서는','에서도','에서','한테는','한테','에게는','에게','으로는','으로도','으로',
    '에는','에도','와는','과는','로는','부터','까지','이라고','라고',
    '에','를','을','이','가','은','는','도','만','의','과','와','로','요'
  ];

  function lookup(word){
    if (!word) return null;
    return DICT[word] || null;
  }

  /* Lookup "flex" : si pas trouvé, on essaye en retirant les particules
     attachées à la fin du mot. Ex : "학교에서" → "학교에" → "학교". */
  function lookupFlex(word){
    if (!word) return null;
    var exact = DICT[word];
    if (exact) return { entry: exact, matched: word };
    /* Essaye chaque particule du plus long au plus court */
    for (var i = 0; i < TRAILING_PARTICLES.length; i++) {
      var p = TRAILING_PARTICLES[i];
      if (word.length > p.length && word.endsWith(p)) {
        var root = word.substring(0, word.length - p.length);
        if (DICT[root]) {
          return { entry: DICT[root], matched: root, particle: p };
        }
      }
    }
    /* Essaye en retirant les dernières syllabes une à une (max 3) */
    for (var n = 1; n <= 3 && n < word.length; n++) {
      var sub = word.substring(0, word.length - n);
      if (DICT[sub]) return { entry: DICT[sub], matched: sub };
    }
    return null;
  }

  global.KSDict = {
    lookup: lookup,
    lookupFlex: lookupFlex,
    count: Object.keys(DICT).length,
    raw: function(){ return DICT; }
  };

})(window);
