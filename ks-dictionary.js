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
    '까지': { fr: 'jusqu\'à', rom: 'kkaji', pos: 'part' },

    /* === CONNECTEURS & CONJONCTIONS === */
    '그리고': { fr: 'et / ensuite', rom: 'geurigo', pos: 'conj' },
    '그래서': { fr: "c'est pourquoi / alors", rom: 'geuraeseo', pos: 'conj' },
    '그런데': { fr: 'mais / d\'ailleurs', rom: 'geureonde', pos: 'conj' },
    '그러나': { fr: 'cependant (formel)', rom: 'geureona', pos: 'conj' },
    '하지만': { fr: 'mais', rom: 'hajiman', pos: 'conj' },
    '그러면': { fr: 'alors / dans ce cas', rom: 'geureomyeon', pos: 'conj' },
    '그럼': { fr: 'alors (forme courte)', rom: 'geureom', pos: 'conj' },
    '왜냐하면': { fr: 'parce que', rom: 'waenyahamyeon', pos: 'conj' },
    '그러니까': { fr: "c'est pourquoi (informel)", rom: 'geureonikka', pos: 'conj' },
    '또': { fr: 'encore / aussi', rom: 'tto', pos: 'conj' },
    '또는': { fr: 'ou', rom: 'ttoneun', pos: 'conj' },
    '또한': { fr: 'de plus / aussi', rom: 'ttohan', pos: 'conj' },
    '그리고는': { fr: 'puis ensuite', rom: 'geurigoneun', pos: 'conj' },
    '게다가': { fr: 'en plus / de surcroît', rom: 'gedaga', pos: 'conj' },
    '따라서': { fr: 'par conséquent', rom: 'ttaraseo', pos: 'conj' },
    '즉': { fr: 'c\'est-à-dire', rom: 'jeuk', pos: 'conj' },
    '반면에': { fr: 'en revanche', rom: 'banmyeone', pos: 'conj' },
    '한편': { fr: "d'autre part", rom: 'hanpyeon', pos: 'conj' },

    /* === CORPS & SANTÉ === */
    '몸': { fr: 'corps', rom: 'mom', pos: 'nom' },
    '머리': { fr: 'tête / cheveux', rom: 'meori', pos: 'nom' },
    '얼굴': { fr: 'visage', rom: 'eolgul', pos: 'nom' },
    '코': { fr: 'nez', rom: 'ko', pos: 'nom' },
    '입': { fr: 'bouche', rom: 'ip', pos: 'nom' },
    '귀': { fr: 'oreille', rom: 'gwi', pos: 'nom' },
    '이': { fr: 'dent', rom: 'i', pos: 'nom' },
    '혀': { fr: 'langue', rom: 'hyeo', pos: 'nom' },
    '목': { fr: 'cou / gorge', rom: 'mok', pos: 'nom' },
    '어깨': { fr: 'épaule', rom: 'eokkae', pos: 'nom' },
    '팔': { fr: 'bras', rom: 'pal', pos: 'nom' },
    '손': { fr: 'main', rom: 'son', pos: 'nom' },
    '손가락': { fr: 'doigt', rom: 'songarak', pos: 'nom' },
    '다리': { fr: 'jambe', rom: 'dari', pos: 'nom' },
    '발': { fr: 'pied', rom: 'bal', pos: 'nom' },
    '발가락': { fr: 'orteil', rom: 'balgarak', pos: 'nom' },
    '배': { fr: 'ventre / bateau / poire', rom: 'bae', pos: 'nom' },
    '등': { fr: 'dos', rom: 'deung', pos: 'nom' },
    '심장': { fr: 'cœur (organe)', rom: 'simjang', pos: 'nom' },
    '아프다': { fr: 'avoir mal / être malade', rom: 'apeuda', pos: 'adj' },
    '아파요': { fr: "j'ai mal", rom: 'apayo', pos: 'expr' },
    '감기': { fr: 'rhume', rom: 'gamgi', pos: 'nom' },
    '열': { fr: 'fièvre / dix (natif)', rom: 'yeol', pos: 'nom' },
    '의사': { fr: 'médecin', rom: 'uisa', pos: 'nom' },
    '간호사': { fr: 'infirmier(ère)', rom: 'ganhosa', pos: 'nom' },
    '약': { fr: 'médicament', rom: 'yak', pos: 'nom' },
    '건강': { fr: 'santé', rom: 'geongang', pos: 'nom' },
    '건강하다': { fr: 'être en bonne santé', rom: 'geonganghada', pos: 'adj' },

    /* === VÊTEMENTS & MODE === */
    '옷': { fr: 'vêtement', rom: 'ot', pos: 'nom' },
    '바지': { fr: 'pantalon', rom: 'baji', pos: 'nom' },
    '치마': { fr: 'jupe', rom: 'chima', pos: 'nom' },
    '셔츠': { fr: 'chemise', rom: 'syeocheu', pos: 'nom' },
    '티셔츠': { fr: 't-shirt', rom: 'tisyeocheu', pos: 'nom' },
    '재킷': { fr: 'veste', rom: 'jaekit', pos: 'nom' },
    '코트': { fr: 'manteau', rom: 'koteu', pos: 'nom' },
    '신발': { fr: 'chaussures', rom: 'sinbal', pos: 'nom' },
    '운동화': { fr: 'baskets', rom: 'undonghwa', pos: 'nom' },
    '구두': { fr: 'chaussures habillées', rom: 'gudu', pos: 'nom' },
    '양말': { fr: 'chaussettes', rom: 'yangmal', pos: 'nom' },
    '모자': { fr: 'chapeau / casquette', rom: 'moja', pos: 'nom' },
    '가방': { fr: 'sac', rom: 'gabang', pos: 'nom' },
    '안경': { fr: 'lunettes', rom: 'angyeong', pos: 'nom' },
    '시계': { fr: 'montre / horloge', rom: 'sigye', pos: 'nom' },
    '한복': { fr: 'hanbok (tenue traditionnelle)', rom: 'hanbok', pos: 'nom' },
    '입다': { fr: 'porter / mettre (vêt.)', rom: 'ipda', pos: 'verbe' },
    '벗다': { fr: 'enlever (vêt.)', rom: 'beotda', pos: 'verbe' },

    /* === TRANSPORTS === */
    '버스': { fr: 'bus', rom: 'beoseu', pos: 'nom' },
    '지하철': { fr: 'métro', rom: 'jihacheol', pos: 'nom' },
    '택시': { fr: 'taxi', rom: 'taeksi', pos: 'nom' },
    '비행기': { fr: 'avion', rom: 'bihaenggi', pos: 'nom' },
    '기차': { fr: 'train', rom: 'gicha', pos: 'nom' },
    '자전거': { fr: 'vélo', rom: 'jajeongeo', pos: 'nom' },
    '오토바이': { fr: 'moto', rom: 'otobai', pos: 'nom' },
    '배': { fr: 'bateau / ventre / poire', rom: 'bae', pos: 'nom' },
    '길': { fr: 'chemin / rue', rom: 'gil', pos: 'nom' },
    '거리': { fr: 'rue / distance', rom: 'geori', pos: 'nom' },
    '신호등': { fr: 'feu tricolore', rom: 'sinhodeung', pos: 'nom' },
    '횡단보도': { fr: 'passage piéton', rom: 'hoengdanbodo', pos: 'nom' },

    /* === NATURE & ANIMAUX === */
    '산': { fr: 'montagne', rom: 'san', pos: 'nom' },
    '바다': { fr: 'mer', rom: 'bada', pos: 'nom' },
    '강': { fr: 'fleuve / rivière', rom: 'gang', pos: 'nom' },
    '호수': { fr: 'lac', rom: 'hosu', pos: 'nom' },
    '섬': { fr: 'île', rom: 'seom', pos: 'nom' },
    '나무': { fr: 'arbre', rom: 'namu', pos: 'nom' },
    '꽃': { fr: 'fleur', rom: 'kkot', pos: 'nom' },
    '풀': { fr: 'herbe', rom: 'pul', pos: 'nom' },
    '잎': { fr: 'feuille', rom: 'ip', pos: 'nom' },
    '별': { fr: 'étoile', rom: 'byeol', pos: 'nom' },
    '달': { fr: 'lune / mois (natif)', rom: 'dal', pos: 'nom' },
    '땅': { fr: 'terre / sol', rom: 'ttang', pos: 'nom' },
    '돌': { fr: 'pierre', rom: 'dol', pos: 'nom' },
    '동물': { fr: 'animal', rom: 'dongmul', pos: 'nom' },
    '개': { fr: 'chien', rom: 'gae', pos: 'nom' },
    '강아지': { fr: 'chiot', rom: 'gangaji', pos: 'nom' },
    '고양이': { fr: 'chat', rom: 'goyangi', pos: 'nom' },
    '새': { fr: 'oiseau', rom: 'sae', pos: 'nom' },
    '물고기': { fr: 'poisson (vivant)', rom: 'mulgogi', pos: 'nom' },
    '생선': { fr: 'poisson (à manger)', rom: 'saengseon', pos: 'nom' },
    '말': { fr: 'cheval / parole', rom: 'mal', pos: 'nom' },
    '소': { fr: 'vache', rom: 'so', pos: 'nom' },
    '돼지': { fr: 'cochon', rom: 'dwaeji', pos: 'nom' },
    '닭': { fr: 'poule', rom: 'dak', pos: 'nom' },
    '토끼': { fr: 'lapin', rom: 'tokki', pos: 'nom' },
    '호랑이': { fr: 'tigre', rom: 'horangi', pos: 'nom' },
    '곰': { fr: 'ours', rom: 'gom', pos: 'nom' },

    /* === TECH & VIE MODERNE === */
    '핸드폰': { fr: 'téléphone portable', rom: 'haendeupon', pos: 'nom' },
    '휴대폰': { fr: 'portable (formel)', rom: 'hyudaepon', pos: 'nom' },
    '컴퓨터': { fr: 'ordinateur', rom: 'kompyuteo', pos: 'nom' },
    '노트북': { fr: 'ordinateur portable', rom: 'noteubuk', pos: 'nom' },
    '인터넷': { fr: 'internet', rom: 'inteonet', pos: 'nom' },
    '이메일': { fr: 'email', rom: 'imeil', pos: 'nom' },
    '비밀번호': { fr: 'mot de passe', rom: 'bimilbeonho', pos: 'nom' },
    '사진': { fr: 'photo', rom: 'sajin', pos: 'nom' },
    '동영상': { fr: 'vidéo', rom: 'dongyeongsang', pos: 'nom' },
    '음악': { fr: 'musique', rom: 'eumak', pos: 'nom' },
    '영화': { fr: 'film', rom: 'yeonghwa', pos: 'nom' },
    '책': { fr: 'livre', rom: 'chaek', pos: 'nom' },
    '신문': { fr: 'journal', rom: 'sinmun', pos: 'nom' },
    '잡지': { fr: 'magazine', rom: 'japji', pos: 'nom' },
    '텔레비전': { fr: 'télévision', rom: 'tellebijeon', pos: 'nom' },
    '뉴스': { fr: 'actualités', rom: 'nyuseu', pos: 'nom' },

    /* === ÉTUDES & TRAVAIL === */
    '학생': { fr: 'élève / étudiant', rom: 'haksaeng', pos: 'nom' },
    '선생님': { fr: 'professeur / enseignant', rom: 'seonsaengnim', pos: 'nom' },
    '교수': { fr: 'professeur (univ.)', rom: 'gyosu', pos: 'nom' },
    '대학교': { fr: 'université', rom: 'daehakgyo', pos: 'nom' },
    '초등학교': { fr: 'école primaire', rom: 'chodeunghakgyo', pos: 'nom' },
    '중학교': { fr: 'collège', rom: 'junghakgyo', pos: 'nom' },
    '고등학교': { fr: 'lycée', rom: 'godeunghakgyo', pos: 'nom' },
    '시험': { fr: 'examen / épreuve', rom: 'siheom', pos: 'nom' },
    '숙제': { fr: 'devoir', rom: 'sukje', pos: 'nom' },
    '수업': { fr: 'cours', rom: 'sueop', pos: 'nom' },
    '교실': { fr: 'salle de classe', rom: 'gyosil', pos: 'nom' },
    '학년': { fr: 'année scolaire', rom: 'hangnyeon', pos: 'nom' },
    '직업': { fr: 'métier', rom: 'jigeop', pos: 'nom' },
    '일자리': { fr: 'emploi', rom: 'iljari', pos: 'nom' },
    '사장': { fr: 'patron / PDG', rom: 'sajang', pos: 'nom' },
    '팀장': { fr: 'chef d\'équipe', rom: 'timjang', pos: 'nom' },
    '선배': { fr: 'aîné·e (école/boulot)', rom: 'seonbae', pos: 'nom' },
    '후배': { fr: 'cadet·te (école/boulot)', rom: 'hubae', pos: 'nom' },
    '동료': { fr: 'collègue', rom: 'dongnyo', pos: 'nom' },
    '회의': { fr: 'réunion', rom: 'hoeui', pos: 'nom' },

    /* === ARGENT & SHOPPING === */
    '돈': { fr: 'argent', rom: 'don', pos: 'nom' },
    '원': { fr: 'won (monnaie)', rom: 'won', pos: 'nom' },
    '카드': { fr: 'carte (bancaire)', rom: 'kadeu', pos: 'nom' },
    '현금': { fr: 'liquide', rom: 'hyeongeum', pos: 'nom' },
    '값': { fr: 'prix', rom: 'gap', pos: 'nom' },
    '가격': { fr: 'prix (formel)', rom: 'gagyeok', pos: 'nom' },
    '세일': { fr: 'soldes', rom: 'seil', pos: 'nom' },
    '할인': { fr: 'réduction', rom: 'harin', pos: 'nom' },
    '쇼핑': { fr: 'shopping', rom: 'syoping', pos: 'nom' },
    '주문': { fr: 'commande', rom: 'jumun', pos: 'nom' },
    '주문하다': { fr: 'commander', rom: 'jumunhada', pos: 'verbe' },
    '계산하다': { fr: 'payer / calculer', rom: 'gyesanhada', pos: 'verbe' },

    /* === K-POP & CULTURE === */
    '노래': { fr: 'chanson', rom: 'norae', pos: 'nom' },
    '가수': { fr: 'chanteur(se)', rom: 'gasu', pos: 'nom' },
    '춤': { fr: 'danse', rom: 'chum', pos: 'nom' },
    '춤추다': { fr: 'danser', rom: 'chumchuda', pos: 'verbe' },
    '콘서트': { fr: 'concert', rom: 'konseoteu', pos: 'nom' },
    '팬': { fr: 'fan', rom: 'paen', pos: 'nom' },
    '아이돌': { fr: 'idol', rom: 'aidol', pos: 'nom' },
    '드라마': { fr: 'série / drama', rom: 'deurama', pos: 'nom' },
    '영화관': { fr: 'cinéma (salle)', rom: 'yeonghwagwan', pos: 'nom' },
    '배우': { fr: 'acteur(rice)', rom: 'baeu', pos: 'nom' },
    '한류': { fr: 'Hallyu (vague coréenne)', rom: 'hallyu', pos: 'nom' },
    '문화': { fr: 'culture', rom: 'munhwa', pos: 'nom' },
    '전통': { fr: 'tradition', rom: 'jeontong', pos: 'nom' },
    '역사': { fr: 'histoire (discipline)', rom: 'yeoksa', pos: 'nom' },

    /* === ADVERBES & QUANTIFICATEURS === */
    '모두': { fr: 'tout / tous', rom: 'modu', pos: 'pron' },
    '전부': { fr: 'tout / entièrement', rom: 'jeonbu', pos: 'pron' },
    '몇몇': { fr: 'quelques-uns', rom: 'myeotmyeot', pos: 'pron' },
    '아무도': { fr: 'personne', rom: 'amudo', pos: 'pron' },
    '아무것도': { fr: 'rien', rom: 'amugeotdo', pos: 'pron' },
    '여기': { fr: 'ici', rom: 'yeogi', pos: 'adv' },
    '저기': { fr: 'là-bas', rom: 'jeogi', pos: 'adv' },
    '거기': { fr: 'là (près de toi)', rom: 'geogi', pos: 'adv' },
    '이쪽': { fr: 'par ici', rom: 'ijjok', pos: 'adv' },
    '저쪽': { fr: 'par là-bas', rom: 'jeojjok', pos: 'adv' },
    '앞': { fr: 'devant', rom: 'ap', pos: 'nom' },
    '뒤': { fr: 'derrière', rom: 'dwi', pos: 'nom' },
    '위': { fr: 'sur / au-dessus', rom: 'wi', pos: 'nom' },
    '아래': { fr: 'sous / en-dessous', rom: 'arae', pos: 'nom' },
    '밑': { fr: 'sous', rom: 'mit', pos: 'nom' },
    '옆': { fr: 'à côté', rom: 'yeop', pos: 'nom' },
    '왼쪽': { fr: 'gauche', rom: 'oenjjok', pos: 'nom' },
    '오른쪽': { fr: 'droite', rom: 'oreunjjok', pos: 'nom' },
    '안': { fr: 'dedans / ne pas (volonté)', rom: 'an', pos: 'nom' },
    '밖': { fr: 'dehors', rom: 'bak', pos: 'nom' },
    '사이': { fr: 'entre', rom: 'sai', pos: 'nom' },
    '근처': { fr: 'près de', rom: 'geuncheo', pos: 'nom' },
    '먼저': { fr: 'd\'abord', rom: 'meonjeo', pos: 'adv' },
    '다음': { fr: 'suivant / après', rom: 'daeum', pos: 'nom' },
    '마지막': { fr: 'dernier', rom: 'majimak', pos: 'nom' },
    '처음': { fr: 'début / pour la 1ère fois', rom: 'cheoeum', pos: 'nom' },
    '진짜': { fr: 'vraiment', rom: 'jinjja', pos: 'adv' },
    '정말': { fr: 'vraiment (poli)', rom: 'jeongmal', pos: 'adv' },
    '아마': { fr: 'peut-être', rom: 'ama', pos: 'adv' },
    '꼭': { fr: 'absolument / forcément', rom: 'kkok', pos: 'adv' },
    '바로': { fr: 'tout de suite / juste', rom: 'baro', pos: 'adv' },

    /* === VERBES CONJUGUÉS COURANTS (les plus rencontrés en lecture) === */
    /* 가다 → */
    '가요': { fr: '(je) vais', rom: 'gayo', pos: 'verbe' },
    '갔어요': { fr: '(je) suis allé', rom: 'gasseoyo', pos: 'verbe' },
    '갈 거예요': { fr: '(je) vais aller', rom: 'gal geoyeyo', pos: 'verbe' },
    '가세요': { fr: 'va / allez (poli)', rom: 'gaseyo', pos: 'verbe' },
    '갑니다': { fr: '(je) vais (formel)', rom: 'gamnida', pos: 'verbe' },
    /* 오다 → */
    '와요': { fr: '(je) viens', rom: 'wayo', pos: 'verbe' },
    '왔어요': { fr: '(je) suis venu', rom: 'wasseoyo', pos: 'verbe' },
    '올 거예요': { fr: '(je) vais venir', rom: 'ol geoyeyo', pos: 'verbe' },
    '오세요': { fr: 'viens / venez (poli)', rom: 'oseyo', pos: 'verbe' },
    /* 먹다 → */
    '먹어요': { fr: '(je) mange', rom: 'meogeoyo', pos: 'verbe' },
    '먹었어요': { fr: '(j\'ai) mangé', rom: 'meogeosseoyo', pos: 'verbe' },
    '먹을 거예요': { fr: '(je) vais manger', rom: 'meogeul geoyeyo', pos: 'verbe' },
    '먹습니다': { fr: '(je) mange (formel)', rom: 'meokseumnida', pos: 'verbe' },
    /* 마시다 → */
    '마셔요': { fr: '(je) bois', rom: 'masyeoyo', pos: 'verbe' },
    '마셨어요': { fr: '(j\'ai) bu', rom: 'masyeosseoyo', pos: 'verbe' },
    /* 보다 → */
    '봐요': { fr: '(je) vois / regarde', rom: 'bwayo', pos: 'verbe' },
    '봤어요': { fr: '(j\'ai) vu / regardé', rom: 'bwasseoyo', pos: 'verbe' },
    '볼 거예요': { fr: '(je) vais voir', rom: 'bol geoyeyo', pos: 'verbe' },
    /* 하다 → */
    '해요': { fr: '(je) fais', rom: 'haeyo', pos: 'verbe' },
    '했어요': { fr: '(j\'ai) fait', rom: 'haesseoyo', pos: 'verbe' },
    '할 거예요': { fr: '(je) vais faire', rom: 'hal geoyeyo', pos: 'verbe' },
    '하세요': { fr: 'fais / faites (poli)', rom: 'haseyo', pos: 'verbe' },
    /* 있다 → */
    '있었어요': { fr: 'il y avait / j\'avais', rom: 'isseosseoyo', pos: 'verbe' },
    '있어': { fr: 'il y a (informel)', rom: 'isseo', pos: 'verbe' },
    /* 없다 → */
    '없었어요': { fr: 'il n\'y avait pas', rom: 'eopseosseoyo', pos: 'verbe' },
    /* 이다 → */
    '이에요': { fr: '(c\') est', rom: 'ieyo', pos: 'verbe' },
    '예요': { fr: '(c\') est', rom: 'yeyo', pos: 'verbe' },
    '입니다': { fr: '(c\') est (formel)', rom: 'imnida', pos: 'verbe' },
    /* 좋다 → */
    '좋았어요': { fr: 'c\'était bien', rom: 'joasseoyo', pos: 'adj' },
    /* 알다 → */
    '알아': { fr: 'je sais (informel)', rom: 'ara', pos: 'verbe' },
    /* 사랑하다 → */
    '사랑해': { fr: "je t'aime (informel)", rom: 'saranghae', pos: 'verbe' },
    '사랑했어요': { fr: 'j\'aimais', rom: 'saranghaesseoyo', pos: 'verbe' },
    /* 공부하다 → */
    '공부해요': { fr: 'j\'étudie', rom: 'gongbuhaeyo', pos: 'verbe' },
    '공부했어요': { fr: 'j\'ai étudié', rom: 'gongbuhaesseoyo', pos: 'verbe' },
    /* 만나다 → */
    '만나요': { fr: 'je rencontre', rom: 'mannayo', pos: 'verbe' },
    '만났어요': { fr: 'j\'ai rencontré', rom: 'mannasseoyo', pos: 'verbe' },
    /* 살다 → */
    '살아요': { fr: 'je vis / j\'habite', rom: 'sarayo', pos: 'verbe' },
    /* 일하다 → */
    '일해요': { fr: 'je travaille', rom: 'ilhaeyo', pos: 'verbe' },
    /* 자다 → */
    '자요': { fr: 'je dors', rom: 'jayo', pos: 'verbe' },
    '잤어요': { fr: 'j\'ai dormi', rom: 'jasseoyo', pos: 'verbe' },
    /* 가르치다 → */
    '가르치다': { fr: 'enseigner', rom: 'gareuchida', pos: 'verbe' },
    /* 배우다 → */
    '배우다': { fr: 'apprendre', rom: 'baeuda', pos: 'verbe' },
    '배워요': { fr: 'j\'apprends', rom: 'baewoyo', pos: 'verbe' },
    /* Autres expressions hyper fréquentes */
    '있잖아요': { fr: 'tu sais...', rom: 'itjanayo', pos: 'expr' },
    '그렇죠': { fr: "c'est ça", rom: 'geureochyo', pos: 'expr' },
    '그래요': { fr: 'd\'accord / vraiment', rom: 'geuraeyo', pos: 'expr' },
    '진짜요': { fr: 'vraiment ?', rom: 'jinjjayo', pos: 'expr' },
    '대박': { fr: 'incroyable / énorme (argot)', rom: 'daebak', pos: 'expr' },

    /* === EMPLOI DU TEMPS & ACTIVITÉS === */
    '약속': { fr: 'rendez-vous / promesse', rom: 'yaksok', pos: 'nom' },
    '회식': { fr: 'dîner d\'entreprise', rom: 'hoesik', pos: 'nom' },
    '여행': { fr: 'voyage', rom: 'yeohaeng', pos: 'nom' },
    '여행하다': { fr: 'voyager', rom: 'yeohaenghada', pos: 'verbe' },
    '취미': { fr: 'hobby', rom: 'chwimi', pos: 'nom' },
    '운동': { fr: 'sport', rom: 'undong', pos: 'nom' },
    '게임': { fr: 'jeu (vidéo)', rom: 'geim', pos: 'nom' },
    '파티': { fr: 'fête', rom: 'pati', pos: 'nom' },
    '생일': { fr: 'anniversaire', rom: 'saengil', pos: 'nom' },
    '결혼': { fr: 'mariage', rom: 'gyeolhon', pos: 'nom' },
    '결혼하다': { fr: 'se marier', rom: 'gyeolhonhada', pos: 'verbe' },

    /* === FOOD complément === */
    '치즈': { fr: 'fromage', rom: 'chijeu', pos: 'nom' },
    '계란': { fr: 'œuf', rom: 'gyeran', pos: 'nom' },
    '고기': { fr: 'viande', rom: 'gogi', pos: 'nom' },
    '닭고기': { fr: 'poulet (viande)', rom: 'dakgogi', pos: 'nom' },
    '소고기': { fr: 'bœuf', rom: 'sogogi', pos: 'nom' },
    '돼지고기': { fr: 'porc', rom: 'dwaejigogi', pos: 'nom' },
    '야채': { fr: 'légume', rom: 'yachae', pos: 'nom' },
    '채소': { fr: 'légume (formel)', rom: 'chaeso', pos: 'nom' },
    '양파': { fr: 'oignon', rom: 'yangpa', pos: 'nom' },
    '마늘': { fr: 'ail', rom: 'maneul', pos: 'nom' },
    '고추': { fr: 'piment', rom: 'gochu', pos: 'nom' },
    '소금': { fr: 'sel', rom: 'sogeum', pos: 'nom' },
    '설탕': { fr: 'sucre', rom: 'seoltang', pos: 'nom' },
    '간장': { fr: 'sauce soja', rom: 'ganjang', pos: 'nom' },
    '된장': { fr: 'pâte de soja fermentée', rom: 'doenjang', pos: 'nom' },
    '고추장': { fr: 'pâte de piment', rom: 'gochujang', pos: 'nom' },
    '식사': { fr: 'repas', rom: 'siksa', pos: 'nom' },
    '아침밥': { fr: 'petit-déjeuner', rom: 'achimbap', pos: 'nom' },
    '점심밥': { fr: 'déjeuner', rom: 'jeomsimbap', pos: 'nom' },
    '저녁밥': { fr: 'dîner', rom: 'jeonyeokbap', pos: 'nom' },
    '간식': { fr: 'snack / encas', rom: 'gansik', pos: 'nom' },

    /* === EXPRESSIONS DE QUANTITÉ === */
    '많아요': { fr: 'il y en a beaucoup', rom: 'manayo', pos: 'expr' },
    '적어요': { fr: 'il y en a peu', rom: 'jeogeoyo', pos: 'expr' },
    '커요': { fr: 'c\'est grand', rom: 'keoyo', pos: 'expr' },
    '작아요': { fr: 'c\'est petit', rom: 'jagayo', pos: 'expr' },
    '예뻐요': { fr: 'c\'est joli', rom: 'yeppeoyo', pos: 'expr' },
    '귀여워요': { fr: 'c\'est mignon', rom: 'gwiyeowoyo', pos: 'expr' },
    '비싸요': { fr: 'c\'est cher', rom: 'bissayo', pos: 'expr' },
    '싸요': { fr: 'c\'est bon marché', rom: 'ssayo', pos: 'expr' },
    '바빠요': { fr: 'je suis occupé', rom: 'bappayo', pos: 'expr' },
    '피곤해요': { fr: 'je suis fatigué', rom: 'pigonhaeyo', pos: 'expr' },
    '재밌어요': { fr: 'c\'est marrant', rom: 'jaemisseoyo', pos: 'expr' },

    /* === MOTS DE LIAISON / ÉMOTIONNELS === */
    '아': { fr: 'ah !', rom: 'a', pos: 'interj' },
    '아이고': { fr: 'aïe ! / oh là là !', rom: 'aigo', pos: 'interj' },
    '어머': { fr: 'oh ! (surprise)', rom: 'eomeo', pos: 'interj' },
    '와': { fr: 'wow !', rom: 'wa', pos: 'interj' },
    '글쎄요': { fr: 'eh bien...', rom: 'geulsseyo', pos: 'expr' },
    '저기요': { fr: "excusez-moi (s'il vous plaît)", rom: 'jeogiyo', pos: 'expr' },
    '여보세요': { fr: 'allô', rom: 'yeoboseyo', pos: 'expr' },

    /* === SAVED FORMS — 좋다 etc. variants === */
    '좋아': { fr: "c'est bien (informel)", rom: 'joa', pos: 'expr' },
    '싫어': { fr: "je n'aime pas (informel)", rom: 'sireo', pos: 'expr' },

    /* === MOTS B1+ courants en lecture === */
    '생각': { fr: 'pensée', rom: 'saenggak', pos: 'nom' },
    '생각하다': { fr: 'penser', rom: 'saenggakhada', pos: 'verbe' },
    '생각해요': { fr: 'je pense', rom: 'saenggakhaeyo', pos: 'verbe' },
    '의미': { fr: 'sens / signification', rom: 'uimi', pos: 'nom' },
    '이유': { fr: 'raison', rom: 'iyu', pos: 'nom' },
    '문제': { fr: 'problème', rom: 'munje', pos: 'nom' },
    '방법': { fr: 'méthode', rom: 'bangbeop', pos: 'nom' },
    '경우': { fr: 'cas', rom: 'gyeongu', pos: 'nom' },
    '결과': { fr: 'résultat', rom: 'gyeolgwa', pos: 'nom' },
    '필요': { fr: 'besoin', rom: 'piryo', pos: 'nom' },
    '가능': { fr: 'possibilité', rom: 'ganeung', pos: 'nom' },
    '관심': { fr: 'intérêt', rom: 'gwansim', pos: 'nom' },
    '경험': { fr: 'expérience', rom: 'gyeongheom', pos: 'nom' },
    '계획': { fr: 'plan', rom: 'gyehoek', pos: 'nom' },
    '인생': { fr: 'vie / existence', rom: 'insaeng', pos: 'nom' },
    '꿈': { fr: 'rêve', rom: 'kkum', pos: 'nom' },
    '희망': { fr: 'espoir', rom: 'huimang', pos: 'nom' },
    '걱정하다': { fr: 's\'inquiéter', rom: 'geokjeonghada', pos: 'verbe' },
    '느끼다': { fr: 'sentir / ressentir', rom: 'neukkida', pos: 'verbe' },
    '기억하다': { fr: 'se souvenir', rom: 'gieokhada', pos: 'verbe' },
    '잊다': { fr: 'oublier', rom: 'itda', pos: 'verbe' },
    '도와주다': { fr: 'aider', rom: 'dowajuda', pos: 'verbe' },
    '도와주세요': { fr: 'aidez-moi', rom: 'dowajuseyo', pos: 'expr' },
    '같다': { fr: 'être pareil', rom: 'gatda', pos: 'adj' },
    '다르다': { fr: 'être différent', rom: 'dareuda', pos: 'adj' },
    '쉬워요': { fr: "c'est facile", rom: 'swiwoyo', pos: 'expr' },
    '어려워요': { fr: "c'est difficile", rom: 'eoryeowoyo', pos: 'expr' },
    '새롭다': { fr: 'être nouveau', rom: 'saeropda', pos: 'adj' },
    '낡다': { fr: 'être vieux (objet)', rom: 'nakda', pos: 'adj' },
    '늙다': { fr: 'vieillir', rom: 'neukda', pos: 'verbe' },
    '젊다': { fr: 'être jeune', rom: 'jeomda', pos: 'adj' }
  };

  /* ── Particules à retirer en fin de mot pour matcher la racine ── */
  var TRAILING_PARTICLES = [
    '에서는','에서도','에서','한테는','한테','에게는','에게','으로는','으로도','으로',
    '에는','에도','와는','과는','로는','부터','까지','이라고','라고',
    '에','를','을','이','가','은','는','도','만','의','과','와','로','요'
  ];

  /* ── Suffixes verbaux → on cherche la racine + 다 ───────────────
     Ex : "먹었어요" → strip "었어요" → "먹" + "다" = "먹다" → match ! */
  var VERB_SUFFIX_PATTERNS = [
    /* Passé poli */
    { strip: '었습니다', append: '다' },
    { strip: '았습니다', append: '다' },
    { strip: '였습니다', append: '다' },
    { strip: '었어요', append: '다' },
    { strip: '았어요', append: '다' },
    { strip: '였어요', append: '다' },
    /* Formel présent */
    { strip: '습니다', append: '다' },
    { strip: 'ㅂ니다', append: '다' },
    /* Polite présent */
    { strip: '어요', append: '다' },
    { strip: '아요', append: '다' },
    { strip: '여요', append: '다' },
    /* Connectifs */
    { strip: '지만', append: '다' },
    { strip: '으면서', append: '다' },
    { strip: '면서', append: '다' },
    { strip: '으면', append: '다' },
    { strip: '면', append: '다' },
    { strip: '어서', append: '다' },
    { strip: '아서', append: '다' },
    /* Futur */
    { strip: '을 거예요', append: '다' },
    { strip: 'ㄹ 거예요', append: '다' },
    { strip: '겠어요', append: '다' },
    /* Honorifique */
    { strip: '으세요', append: '다' },
    { strip: '세요', append: '다' },
    /* Volition */
    { strip: '고 싶어요', append: '다' },
    { strip: '고 싶다', append: '다' }
  ];

  function lookup(word){
    if (!word) return null;
    return DICT[word] || null;
  }

  /* Lookup "flex" : si pas trouvé, on essaye en retirant les particules
     ou en reconstruisant la forme verbale de base. */
  function lookupFlex(word){
    if (!word) return null;
    var exact = DICT[word];
    if (exact) return { entry: exact, matched: word };

    /* 1) Particules nominales (postpositions) */
    for (var i = 0; i < TRAILING_PARTICLES.length; i++) {
      var p = TRAILING_PARTICLES[i];
      if (word.length > p.length && word.endsWith(p)) {
        var root = word.substring(0, word.length - p.length);
        if (DICT[root]) {
          return { entry: DICT[root], matched: root, particle: p };
        }
      }
    }

    /* 2) Suffixes verbaux → cherche racine + 다 */
    for (var k = 0; k < VERB_SUFFIX_PATTERNS.length; k++) {
      var pat = VERB_SUFFIX_PATTERNS[k];
      if (word.length > pat.strip.length && word.endsWith(pat.strip)) {
        var stem = word.substring(0, word.length - pat.strip.length);
        var verbRoot = stem + pat.append;
        if (DICT[verbRoot]) {
          return { entry: DICT[verbRoot], matched: verbRoot, conjugation: pat.strip };
        }
      }
    }

    /* 3) Fallback : retire les dernières syllabes une à une (max 3) */
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
