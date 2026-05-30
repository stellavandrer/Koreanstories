/* ═══════════════════════════════════════════════════════════════════
   ks-curriculum.js — Catalogue partagé du parcours d'apprentissage.
   Liste ordonnée des activités « cœur » (leçons, exercices, quiz,
   histoires) extraite de cours.html. Permet à n'importe quelle page
   de connaître la PROCHAINE activité à faire.
   API : window.KSCurriculum
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* Activités cœur, dans l'ordre du parcours */
  var ACTIVITIES = [
    {"key": "ks_h01", "href": "lecon.html", "t": "lecon", "title": "Voyelles de base", "sub": "아·야·어·여·오·요·우·유·으·이 — les 10 voyelles fondamentales", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h04", "href": "lecon2.html", "t": "lecon", "title": "Consonnes simples", "sub": "ㄱ·ㄴ·ㄷ·ㄹ·ㅁ·ㅂ·ㅅ·ㅇ — les 8 consonnes de base à maîtriser", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h06", "href": "exercice1.html", "t": "exercice", "title": "Écriture des consonnes", "sub": "Tracé correct + ordre des traits · Du plus simple au plus complexe", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h07", "href": "lecon3.html", "t": "lecon", "title": "Consonnes aspirées & tendues", "sub": "ㅋ·ㅌ·ㅍ·ㅊ·ㅎ · ㄲ·ㄸ·ㅃ·ㅆ·ㅉ — sons forts et doublés", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h09", "href": "lecon4.html", "t": "lecon", "title": "Syllabes & Batchim", "sub": "Assembler les blocs syllabiques · 받침 · Règles de prononciation", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h14", "href": "lecon9.html", "t": "lecon", "title": "Diphtongues — Voyelles composées", "sub": "ㅘ(wa)·ㅝ(wo)·ㅕ(yeo)·ㅒ·ㅖ·ㅙ·ㅚ·ㅞ·ㅟ·ㅢ — 10 voyelles composées essentielles", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h10", "href": "exercice2.html", "t": "exercice", "title": "Lis tes premières syllabes", "sub": "가나다라 → 갈비탕 → 안녕하세요 · Du simple au complexe", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h13", "href": "quiz1.html", "t": "quiz", "title": "Checkpoint Hangeul", "sub": "20 questions · Validation · Badge Hangeul officiel", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_a01", "href": "lecon5.html", "t": "lecon", "title": "Salutations & Se présenter", "sub": "안녕하세요 · 저는 …이에요 · 만나서 반가워요 — les formules incontournables du quotidien", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a02", "href": "prononciation.html", "t": "prononciation", "title": "Prononciation au micro", "sub": "Pratique tes premiers mots au micro · L'IA évalue ton accent · 51 phrases essentielles", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a03", "href": "histoire1.html", "t": "histoire", "title": "Au café — Première rencontre", "sub": "Ji-woo rencontre Emma · Dialogue naturel complet · 15 expressions du quotidien à retenir", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a05", "href": "lecon6.html", "t": "lecon", "title": "Chiffres Sino-coréens", "sub": "일·이·삼·사·오·육·칠·팔·구·십·백·천·만 — système d'origine chinoise pour prix, dates, étages", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a06", "href": "lecon6b.html", "t": "lecon", "title": "Chiffres Natifs coréens", "sub": "하나·둘·셋·넷·다섯·여섯·일곱·여덟·아홉·열 — système purement coréen pour âge, heures, objets", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a09", "href": "lecon7.html", "t": "lecon", "title": "Famille & Pronoms personnels", "sub": "저·나 · 엄마·아빠·오빠·언니·누나·형·남동생·여동생 — toute la famille coréenne", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a11", "href": "exercice3.html", "t": "exercice", "title": "Décris ta famille en coréen", "sub": "8 situations concrètes · Production orale guidée · Correction automatique · Audio natif", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a12", "href": "lecon8.html", "t": "lecon", "title": "Couleurs & Adjectifs essentiels", "sub": "빨간·파란·노란·하얀·검은·예쁜·크다·작다·좋다·싫다 — 30 adjectifs du quotidien", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a13", "href": "exercice5.html", "t": "exercice", "title": "Décris ce que tu vois", "sub": "Photos de Séoul · Décris en coréen · 10 exercices progressifs avec feedback instantané", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a14", "href": "lecon10.html", "t": "lecon", "title": "La nourriture coréenne", "sub": "비빔밥·김치찌개·삼겹살·떡볶이·냉면 · 40 mots · Commander, demander, payer", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a15", "href": "histoire2.html", "t": "histoire", "title": "Au restaurant — Commander", "sub": "Ha-eun et ses amis au pojangmacha · Dialogue authentique · Expressions indispensables", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a18", "href": "lecon11.html", "t": "lecon", "title": "Lieux de la vie quotidienne", "sub": "학교·병원·카페·슈퍼·지하철역·공원 — 30 lieux essentiels · Particules 에/에서/로", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a19", "href": "lecon12.html", "t": "lecon", "title": "Directions & Positions", "sub": "앞·뒤·왼쪽·오른쪽·위·아래·옆·근처 — se repérer dans Séoul · 10 expressions de trajet", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a22", "href": "lecon41.html", "t": "lecon", "title": "20 Verbes essentiels + Conjugaison", "sub": "가다·오다·먹다·마시다·보다·자다·살다·만나다·공부하다·일하다 — présent/passé/futur", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a23", "href": "lecon13.html", "t": "lecon", "title": "La négation : 안 & 못", "sub": "안 = ne pas vouloir · 못 = ne pas pouvoir · 50 exemples en contexte · Nuances cruciales", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a24", "href": "lecon14.html", "t": "lecon", "title": "Poser des questions en coréen", "sub": "뭐·어디·언제·왜·어떻게·누구·얼마나 — les 7 mots interrogatifs + structures grammaticales", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a31", "href": "lecon15.html", "t": "lecon", "title": "Particules 이/가 et 은/는", "sub": "Sujet vs thème — distinction fondamentale · 이/가 = info nouvelle · 은/는 = contexte connu · 30 exemples", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a32", "href": "lecon16.html", "t": "lecon", "title": "Particules 을/를, 에, 에서, 로", "sub": "Objet direct · Lieu statique vs dynamique · Direction · Moyen — 4 particules essentielles maîtrisées", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a33", "href": "exercice6.html", "t": "exercice", "title": "Choisir la bonne particule", "sub": "이/가 · 은/는 · 을/를 · 에 · 에서 — 10 exercices en contexte · Correction immédiate · Explications", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a34", "href": "quiz3.html", "t": "quiz", "title": "Checkpoint Particules", "sub": "10 questions TOPIK-style · Valider l'acquis de toutes les particules A1 · Badge Particules", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a25", "href": "exercice4.html", "t": "exercice", "title": "Conjugaison en contexte", "sub": "Passé · Présent · Futur · 15 exercices avec scénarios réels · Correction IA instantanée", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a_time", "href": "lecon42.html", "t": "lecon", "title": "Heure, Jours & Mois", "sub": "몇 시예요 ? · Nombres natifs pour heures · Sino-coréens pour minutes · 월요일→일요일 · 1월→12월", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a_meteo", "href": "lecon43.html", "t": "lecon", "title": "Météo & Saisons", "sub": "날씨가 어때요? · 맑아요·흐려요·비가 와요·눈이 와요 · 봄여름가을겨울 · 6 températures", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a_counters", "href": "lecon44.html", "t": "lecon", "title": "Les Compteurs Coréens", "sub": "개·명·잔·권·마리·장·병·대 — 8 compteurs TOPIK 1 essentiels · Nombres natifs + règles des formes courtes", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a27", "href": "histoire3.html", "t": "histoire", "title": "Une journée à Séoul", "sub": "Se lever → prendre le métro → travailler → manger → rentrer · Routine quotidienne complète", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a38", "href": "lecon58.html", "t": "lecon", "title": "Le corps & la santé", "sub": "머리·눈·코·입·손·발 · 30 parties du corps · Décrire ses symptômes · 아파요 · 열이 나요 · Chez le médecin", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a39", "href": "lecon59.html", "t": "lecon", "title": "Les vêtements & la mode", "sub": "옷 · 바지 · 치마 · 신발 · 가방 + couleurs · Shopping vocab · 입어봐도 돼요?", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a40", "href": "lecon60.html", "t": "lecon", "title": "Les émotions & l'état d'esprit", "sub": "기쁘다 · 슬프다 · 화나다 · 무섭다 · 행복하다 · 걱정되다 · 30 émotions essentielles · Expressions naturelles", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a41", "href": "histoire29.html", "t": "histoire", "title": "Une journée à Gyeongbokgung", "sub": "경복궁 · Palais royal · Emma en visite · 한복 rental · Dialogue complet + 15 expressions touristiques", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a42", "href": "histoire30.html", "t": "histoire", "title": "Chez le médecin — Premiers symptômes", "sub": "병원 · 증상 설명 · 약 처방 · Dialogue A1 simplifié · 10 mots clés médicaux pour débutants", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a44", "href": "exercice24.html", "t": "exercice", "title": "Commander en ligne / Au téléphone", "sub": "배달 앱 · Formulaire de livraison · 주문하다 · 배달 주소 · 몇 시에 와요? · 3 scénarios pratiques", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a30", "href": "quiz2.html", "t": "quiz", "title": "Checkpoint A1 Final", "sub": "40 questions · Grammaire + Vocabulaire + Écoute + Production · Badge A1 TOPIK certifié", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_b01", "href": "lecon21.html", "t": "lecon", "title": "Le futur en coréen : -(으)ㄹ 거예요", "sub": "Exprimer ses projets et intentions · 갈 거예요 · 먹을 거예요 · 20 exemples contextualisés", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b23", "href": "lecon22.html", "t": "lecon", "title": "Progressif & Résultatif : -고 있어요 / -아 있어요", "sub": "Action en cours vs état résultant — 먹고 있어요 · 앉아 있어요 · Différence clé", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24", "href": "lecon23.html", "t": "lecon", "title": "Capacité & Obligation : -ㄹ 수 있다 / -아야 하다", "sub": "할 수 있어요 · 해야 해요 · Possibilité et nécessité en contexte", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b25", "href": "lecon24.html", "t": "lecon", "title": "Désir & Envie : -고 싶다", "sub": "-고 싶어요 · -고 싶어해요 · -고 싶지 않아요 — exprimer vos envies et celles des autres · 20 exemples", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b26", "href": "lecon25.html", "t": "lecon", "title": "Exprimer une opinion : -(으)ㄹ 것 같다", "sub": "-(으)ㄹ 것 같아요 · -다고 생각해요 · 제 생각에는 — donner son avis avec nuance", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b27", "href": "lecon26.html", "t": "lecon", "title": "Requêtes polies : -아/어 주세요", "sub": "-아/어 주세요 · -아/어 주실 수 있어요? — demander de l'aide · 6 scénarios réels du quotidien", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b28", "href": "lecon27.html", "t": "lecon", "title": "Temps & Durée : 전에 · 후에 · 동안", "sub": "Avant · Après · Pendant · -은 다음에 · -(으)면서 — situer, ordonner, raconter", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b29", "href": "exercice10.html", "t": "exercice", "title": "Production : Désir, Opinion, Requêtes", "sub": "15 situations réelles — choisir la bonne structure · -고 싶다 · 것 같다 · -아/어 주세요", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04b", "href": "lecon45.html", "t": "lecon", "title": "Voix passive : -이/히/리/기 & -되다", "sub": "보이다·먹히다·팔리다·끊기다 · 4 suffixes passifs + -되다 pour 하다 · -아/어지다 — voix passive complète", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04c", "href": "lecon46.html", "t": "lecon", "title": "L'expérience : -아/어 봤어요 & -본 적이 있다", "sub": "-아/어 봐요 · -아/어 봤어요 · -본 적이 있어요 · -본 적이 없어요 — essayer & avoir vécu quelque chose", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04d", "href": "lecon47.html", "t": "lecon", "title": "Permission & Interdiction", "sub": "-아/어도 되다 · -면 안 되다 · -지 않아도 되다— 3 structures essentielles de la vie quotidienne", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04e", "href": "lecon48.html", "t": "lecon", "title": "Comparaisons : 더, 보다, 가장, 만큼, 처럼", "sub": "A보다 더 [adj] · 가장/제일 · A만큼 · A처럼 — 5 outils pour comparer en coréen", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b05", "href": "lecon17.html", "t": "lecon", "title": "Construire des phrases complexes", "sub": "SOV · Modificateurs · Propositions relatives — ordre des mots en coréen", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b06", "href": "lecon18.html", "t": "lecon", "title": "Conjonctions : et, mais, parce que", "sub": "-고 · -지만 · -어서/-니까/-는데 — relier des idées naturellement", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b07", "href": "exercice7.html", "t": "exercice", "title": "Production de phrases A2", "sub": "10 situations réelles · Construire des phrases complètes · Voir le modèle", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b09", "href": "histoire12.html", "t": "histoire", "title": "K-Drama : 사랑해요", "sub": "Dialogues romantiques authentiques · Vocabulaire émotionnel · Analyse grammaticale", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b12", "href": "histoire13.html", "t": "histoire", "title": "Un week-end à Hongdae", "sub": "Quartier branché de Séoul · Street art · Shopping · 20 expressions", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b31", "href": "histoire15.html", "t": "histoire", "title": "Emma chez le médecin à Séoul", "sub": "Décrire ses symptômes · Clinique · Pharmacie · Dialogue complet + 15 mots médicaux clés", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b13", "href": "lecon19.html", "t": "lecon", "title": "Achats & Argent", "sub": "얼마예요 · 비싸다 · 싸다 · Négocier · Payer · Rendre la monnaie", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b14", "href": "exercice8.html", "t": "exercice", "title": "Dans un grand magasin", "sub": "Trouver un rayon · Essayer un vêtement · Payer · 3 dialogues complets", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b16", "href": "lecon20.html", "t": "lecon", "title": "Planifier un voyage en Corée", "sub": "Réservation · Hôtel · Transports · 경복궁 · 홍대 · 제주도 — vocabulaire tourisme", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b17", "href": "histoire14.html", "t": "histoire", "title": "À l'aéroport d'Incheon", "sub": "Check-in · Contrôle · Embarquement · Dialogue complet avec vocabulaire clé", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b21", "href": "exercice9.html", "t": "exercice", "title": "Scénarios de conversation A2", "sub": "5 scénarios réels : café · métro · pharmacie · restaurant · magasin · modèles inclus", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b34", "href": "lecon55.html", "t": "lecon", "title": "-ㄴ/는다 — Style journal & narration", "sub": "Style neutre/littéraire · Journaux intimes · Articles · Différence avec -아요/해요 · Passer du parlé à l'écrit", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b35", "href": "lecon56.html", "t": "lecon", "title": "Propositions concessive : -아/어도 · -더라도", "sub": "\"Même si\" en A2 · 비가 와도 갈 거예요 · -더라도 (hypothèse forte) · Différence clé avec -(으)면", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b36", "href": "lecon57.html", "t": "lecon", "title": "Exprimer la raison : -거든요 & -잖아요", "sub": "-거든요 : informer de quelque chose que l'autre ne sait pas · -잖아요 : rappeler ce que l'autre sait · 20 exemples", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b37", "href": "histoire27.html", "t": "histoire", "title": "Chuseok chez une famille coréenne", "sub": "La fête de la lune · 차례 · 한복 · 성묘 · Traditions en famille · 10 expressions festives essentielles", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b38", "href": "histoire28.html", "t": "histoire", "title": "Emma et le jimjilbang", "sub": "Sauna coréen · 찜질방 · 식혜 · 계란 · Culture du bain collectif · Dialogues et vocabulaire", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b42", "href": "exercice23.html", "t": "exercice", "title": "Écrire son journal intime en coréen", "sub": "오늘 일기 · Routine journalière · 기분 표현 · Template de journal · 3 exemples corrigés · Modèles à compléter", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b22", "href": "quiz4.html", "t": "quiz", "title": "Checkpoint A2 Final", "sub": "10 questions TOPIK-style · Grammaire + Vocab + Compréhension · Badge A2 débloqué", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_c01", "href": "lecon28.html", "t": "lecon", "title": "Propositions relatives : -는 / -(으)ㄴ / -(으)ㄹ", "sub": "Modifier les noms avec des verbes · 4 formes essentielles · \"la personne qui mange\" · structures figées", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c02", "href": "lecon29.html", "t": "lecon", "title": "Discours indirect : -다고 하다", "sub": "Rapporter ce que quelqu'un a dit · Affirmation · Question · Ordre · Proposition · Direct → Indirect", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c03", "href": "lecon30.html", "t": "lecon", "title": "Conditionnel : -(으)면 · -아/어도 · -더라도", "sub": "\"Si…\" · \"Même si…\" · Hypothèse forte · Conditions du quotidien · 12 exemples contextualisés", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c04", "href": "lecon31.html", "t": "lecon", "title": "Cause avancée : -기 때문에 · -는 바람에", "sub": "Formel · Cause inattendue · -아/어서 vs -니까 décryptés définitivement · Tableau comparatif", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c05", "href": "exercice11.html", "t": "exercice", "title": "Exercice : Grammaire B1 — 12 questions", "sub": "Propositions relatives · Discours indirect · Conditionnel · Cause · Tout en un exercice ciblé", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c06", "href": "lecon32.html", "t": "lecon", "title": "존댓말 vs 반말 — Niveaux de langue", "sub": "Poli standard · Informel · Quand utiliser quoi · 반말 써도 돼요? — demander la permission", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c07", "href": "lecon33.html", "t": "lecon", "title": "Formes formelles : -습니다 / 합쇼체", "sub": "Présent · Passé · Questions · -(으)겠습니다 · Dialogues professionnels · Présentations", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09", "href": "exercice12.html", "t": "exercice", "title": "Exercice : Choisir le bon niveau de langue", "sub": "8 scénarios réels · Patron · Ami · Magasin · Présentation · Prof · Hôtes coréens", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c10", "href": "lecon34.html", "t": "lecon", "title": "Exprimer le temps (avancé)", "sub": "-면서 · -곤 했어요 · -아/어지다 · -아/어 버리다 · -자마자 · Simultanéité et changement", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c11", "href": "lecon35.html", "t": "lecon", "title": "Vocabulaire TOPIK 3-4 — Essentiel", "sub": "Verbes d'opinion · Connecteurs discursifs · Émotions coréennes · 설레다 · 아쉽다 · 뿌듯하다", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c13", "href": "histoire16.html", "t": "histoire", "title": "Premier jour au bureau à Séoul", "sub": "Emma en stage dans une IT coréenne · 존댓말 · 잘 부탁드립니다 · Déjeuner avec le 선배", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c15", "href": "exercice13.html", "t": "exercice", "title": "Exercice mixte B1 — 10 questions", "sub": "Temps · Vocabulaire · Politesse · Culture · Connecteurs · Changement progressif · Formel", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c16", "href": "histoire17.html", "t": "histoire", "title": "Week-end à Busan avec les collègues", "sub": "KTX · Haeundae · Marché Jagalchi · 해산물 · -곤 했어요 · -아/어지고 있어요 en contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c19", "href": "pro4.html", "t": "lecon", "title": "Coréen en milieu professionnel", "sub": "Emails · Réunions · Titres (팀장님, 부장님) · 수고하세요 · 알겠습니다 · Dialogues bureau", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c21", "href": "histoire18.html", "t": "histoire", "title": "Retour de voyage — Emma raconte", "sub": "Discours indirect · -는 바람에 · -자마자 · 설레다 · Raconter en coréen naturellement", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c22", "href": "exercice14.html", "t": "exercice", "title": "Exercice style TOPIK 3-4", "sub": "Questions inspirées de l'examen officiel · Structures · Compréhension de texte · Contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09b", "href": "lecon49.html", "t": "lecon", "title": "Nominalisation : -기 & -음/-ㅁ", "sub": "-기 (activités, expressions figées) vs -음/-ㅁ (formel, écrit, TOPIK) · 배우기 · 죽음 · 삶 · 8 expressions figées", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09c", "href": "lecon50.html", "t": "lecon", "title": "-게 되다 & -기로 하다", "sub": "-게 되다 : changement progressif / involontaire · -기로 하다 : décision délibérée — nuance essentielle TOPIK", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09d", "href": "lecon51.html", "t": "lecon", "title": "-는 반면에 & -(으)ㄹ수록", "sub": "Contraste (alors que, tandis que) · Degré progressif (plus...plus) · 벼는 익을수록 고개를 숙인다", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c23", "href": "histoire19.html", "t": "histoire", "title": "Histoire longue : L'examen TOPIK d'Emma", "sub": "5 chapitres · Toutes les structures B1 · Vocabulaire riche · Compréhension avancée", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c25", "href": "exercice15.html", "t": "quiz", "title": "Quiz final B1 — 15 questions", "sub": "Validation complète · Toutes les structures B1 · Score + message personnalisé · Prêt pour TOPIK 3 ?", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c27", "href": "lecon52.html", "t": "lecon", "title": "-ㄴ/는 편이다 & -(으)ㄹ 만하다", "sub": "-ㄴ 편이에요 : plutôt · -(으)ㄹ 만해요 : ça vaut la peine · Exprimer des degrés et recommandations nuancées", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c28", "href": "lecon53.html", "t": "lecon", "title": "-아/어 가다 · -아/어 오다 — Changement dans le temps", "sub": "Action qui progresse vers le futur (-아가다) ou qui a évolué jusqu'au présent (-아오다) · 살아가다 · 알아오다 · 10 exemples", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c29", "href": "lecon54.html", "t": "lecon", "title": "Structures de regret & hypothèse passée", "sub": "-(으)ㄹ걸 그랬다 · -(으)ㄹ 뻔했다 · -았/었더라면 — Regret, manque de peu, contre-factuel · 15 exemples", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c30", "href": "histoire25.html", "t": "histoire", "title": "Séoul by night — Itaewon & Hongdae", "sub": "Vie nocturne coréenne · Rencontres internationales · Dialogues en 반말 et 존댓말 · Expressions de la nuit", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c31", "href": "histoire26.html", "t": "histoire", "title": "La dispute — réconciliation en coréen", "sub": "Dialogues de conflit puis réconciliation · 미안해 · 화 풀어 · Expressions émotionnelles · -는 바람에 en contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c34", "href": "exercice22.html", "t": "exercice", "title": "Lire un blog coréen — Compréhension B1", "sub": "Article de blog natif sur la vie à Séoul · Questions de compréhension · Vocabulaire en contexte · Annotation", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c35", "href": "quiz9.html", "t": "quiz", "title": "Simulation TOPIK 3-4 — 20 questions", "sub": "Format officiel TOPIK II · Lecture · Grammaire · Vocabulaire · Résultat personnalisé avec analyses", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c26", "href": "quiz5.html", "t": "quiz", "title": "Bilan TOPIK 3-4 & Prochaines étapes", "sub": "Récapitulatif · Guide TOPIK · Prochaines étapes B2 · Badge B1 Intermédiaire", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_d01", "href": "lecon36.html", "t": "lecon", "title": "Discours indirect avancé & citation", "sub": "-다고/-(으)라고/-냐고 hada · Nuances · Verbes de citation · Presse", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d02", "href": "lecon37.html", "t": "lecon", "title": "Formes verbales complexes B2", "sub": "-는 것 같다 · -(으)ㄹ 텐데 · -(으)ㄹ 뻔했다 · Regret · Hypothèse", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d03", "href": "exercice16.html", "t": "exercice", "title": "Débat en coréen", "sub": "Défendre un point de vue · Contre-argumenter · Expressions de débat", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d06", "href": "histoire20.html", "t": "histoire", "title": "Histoire littéraire — La rencontre", "sub": "Style Han Kang · 4 chapitres · Analyse linguistique · -ㄴ 채로 · -기도 하고", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d08", "href": "lecon38.html", "t": "lecon", "title": "Comprendre les médias coréens", "sub": "Journaux · Podcasts · Structures journalistiques · Lire les titres", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d09", "href": "histoire21.html", "t": "histoire", "title": "Article de presse coréen — guidé", "sub": "Article sur le coréen dans le monde · Vocabulaire · Analyse structures", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d10", "href": "exercice17.html", "t": "exercice", "title": "Compréhension orale sans sous-titres", "sub": "Stratégies d'écoute · Podcast simulé · Vocabulaire 워라밸 · 눈치", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d12", "href": "lecon39.html", "t": "lecon", "title": "Coréen des affaires avancé", "sub": "Email formel · Présentation · 여쭤보다 · 회식 · 체면 · Business vocab", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d13", "href": "exercice18.html", "t": "exercice", "title": "Négociation en coréen", "sub": "Dialogue de négociation · 검토해 보겠습니다 · 절충안 · Culture 체면", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d15", "href": "quiz6.html", "t": "quiz", "title": "Simulation TOPIK II — Section 읽기", "sub": "12 questions · Compréhension écrite · Format officiel · Niveau 5-6", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d16", "href": "quiz7.html", "t": "quiz", "title": "Simulation TOPIK II — Section 쓰기", "sub": "10 questions · Expression écrite · Dissertation · Registre formel", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d18", "href": "lecon40.html", "t": "lecon", "title": "Formes rhétoriques : -(으)ㄹ 리가 없다 · -기 마련이다", "sub": "-(으)ㄹ 리가 없다 : impossible · -기 마련이다 : inévitable · -는 법이다 — 3 formes figées TOPIK 5-6 avec 15 exemples contextualisés", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d19", "href": "lecon40b.html", "t": "lecon", "title": "Connecteurs formels : 게다가 · 그럼에도 · 따라서", "sub": "게다가 · 그러나 · 따라서 · 반면에 · 즉 · 한편 — 10 connecteurs discursifs essentiels pour dissertations et TOPIK", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d20", "href": "lecon40c.html", "t": "lecon", "title": "Honorifiques approfondis : 여쭙다 · 드리다 · 뵙다", "sub": "여쭈다 · 드리다 · 뵙다 · 말씀드리다 — les 8 verbes honorifiques · Entretiens d'embauche · Contextes ultra-formels", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d21", "href": "lecon40d.html", "t": "lecon", "title": "속담 — Proverbes coréens essentiels", "sub": "가는 말이 고와야 오는 말이 곱다 · 10 속담 avec contexte culturel · Analyse linguistique · Utilisation naturelle", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d22", "href": "histoire22.html", "t": "histoire", "title": "Webtoon coréen — Lecture guidée", "sub": "Extrait de 신의 탑 (Tower of God) · Langage des personnages · Argot · Onomatopées · Structure narrative", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d23", "href": "histoire23.html", "t": "histoire", "title": "Podcast simulé — Le coréen naturel", "sub": "Discussion sur l'identité coréenne post-Hallyu · Débit natif · Stratégies d'écoute avancée · Script complet annoté", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d24", "href": "histoire24.html", "t": "histoire", "title": "Essai littéraire — style Han Kang", "sub": "Fragment inspiré de 채식주의자 · Analyse stylistique · Vocabulaire littéraire · -ㄴ 채로 · -(으)며 · Nuances", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d28", "href": "exercice19.html", "t": "exercice", "title": "Rédiger un email professionnel", "sub": "Structure formelle · 귀하 · 안녕하십니까 · Formules de clôture · 3 modèles complets · Corrections annotées", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d29", "href": "exercice20.html", "t": "exercice", "title": "Essai TOPIK II — Entraînement rédaction", "sub": "Format 쓰기 section B · Plan en 3 parties · Introduction · Développement · Conclusion · Modèle corrigé", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d34", "href": "exercice21.html", "t": "exercice", "title": "Compréhension d'un article de presse coréen", "sub": "Article réel sur la société coréenne · Vocabulaire académique · Questions de compréhension · Analyse des structures", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d17", "href": "quiz8.html", "t": "quiz", "title": "Bilan B2 & TOPIK 5-6 — Checkpoint final", "sub": "Récapitulatif · 5 questions · Prochaines étapes · Badge B2 Expert", "lvl": "b2", "lvlName": "B2 — Avancé"}
  ];

  /* Alias de clés (une activité peut avoir été validée sous une ancienne clé) */
  var KEY_ALIAS = {'ks_a01':'ks_l5','ks_a05':'ks_l6','ks_a09':'ks_l7','ks_a12':'ks_l8','ks_a14':'ks_l10','ks_a22':'ks_l9','ks_a03':'ks_h1','ks_a15':'ks_h2','ks_a27':'ks_h3','ks_h01':'ks_l1','ks_h04':'ks_l2','ks_h07':'ks_l3','ks_h09':'ks_l4'};

  /* Activités annoncées mais dont la page n'existe pas encore.
     On les expose pour que cours.html / app.html puissent les marquer
     "Bientôt" au lieu de laisser l'utilisateur tomber sur un 404.
     À chaque page créée, retirer son nom de cette liste. */
  var COMING_SOON = {
    /* Seules pages encore non livrées : chansons K-pop (différées pour
       traitement du copyright). Tout le reste du curriculum est livré. */
    'chanson5.html':1,'chanson6.html':1,
  };

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* Une activité est terminée si sa clé (ou son alias) vaut done / 1 / true */
  function isDone(key) {
    var v = ls(key);
    if (v === 'done' || v === '1' || v === 'true') return true;
    var alt = KEY_ALIAS[key];
    if (alt) {
      var v2 = ls(alt);
      if (v2 === 'done' || v2 === '1' || v2 === 'true') return true;
    }
    return false;
  }

  function isComingSoon(href) {
    if (!href) return false;
    /* Strip query / fragment */
    var clean = href.split('?')[0].split('#')[0];
    /* Strip leading "./" or "/" */
    clean = clean.replace(/^\.?\//, '');
    return !!COMING_SOON[clean];
  }

  /* Première activité non terminée — null si tout est fait.
     Saute les activités "bientôt" pour ne pas envoyer l'utilisateur
     sur un 404 depuis la carte "Reprendre" du dashboard. */
  function next() {
    for (var i = 0; i < ACTIVITIES.length; i++) {
      var a = ACTIVITIES[i];
      if (isComingSoon(a.href)) continue;
      if (!isDone(a.key)) return a;
    }
    return null;
  }

  /* Progression globale sur les activités cœur.
     On exclut les "bientôt" du total pour que le % reflète ce qui
     est réellement faisable aujourd'hui. */
  function progress() {
    var done = 0, total = 0;
    for (var i = 0; i < ACTIVITIES.length; i++) {
      if (isComingSoon(ACTIVITIES[i].href)) continue;
      total++;
      if (isDone(ACTIVITIES[i].key)) done++;
    }
    return { done: done, total: total };
  }

  global.KSCurriculum = {
    activities:    ACTIVITIES,
    isDone:        isDone,
    isComingSoon:  isComingSoon,
    comingSoon:    COMING_SOON,
    next:          next,
    progress:      progress
  };

})(window);
