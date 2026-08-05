/* ═══════════════════════════════════════════════════════════════════
   ks-curriculum.js — Catalogue partagé du parcours d'apprentissage.
   Liste ordonnée de TOUTES les activités du parcours (leçons, exercices,
   jeux, conseils, anecdotes, flashcards, chansons, quiz, histoires),
   extraite de cours.html — le bouton « Continuer » suit exactement le
   même chemin que l'affichage du parcours. Permet à n'importe quelle page
   de connaître la PROCHAINE activité à faire.
   API : window.KSCurriculum
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* Activités cœur, dans l'ordre du parcours */
  var ACTIVITIES = [
    {"key": "ks_h01", "href": "lecon.html", "t": "lecon", "title": "Voyelles de base", "sub": "아·야·어·여·오·요·우·유·으·이 — les 10 voyelles fondamentales", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h02", "href": "pro1.html", "t": "prononciation", "title": "Prononce tes premières voyelles", "sub": "Écoute les locuteurs natifs · Répète · Enregistre-toi", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h03", "href": "jeu1.html", "t": "jeu", "title": "Memory Voyelles", "sub": "Associe chaque son à son symbole — mémorisation rapide et fun", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h04", "href": "lecon2.html", "t": "lecon", "title": "Consonnes simples", "sub": "ㄱ·ㄴ·ㄷ·ㄹ·ㅁ·ㅂ·ㅅ·ㅇ — les 8 consonnes de base à maîtriser", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h05", "href": "conseil1.html", "t": "conseil", "title": "L'astuce des formes", "sub": "Une forme = un son — mémoriser chaque consonne en 30 secondes", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h06", "href": "exercice1.html", "t": "exercice", "title": "Écriture des consonnes", "sub": "Tracé correct + ordre des traits · Du plus simple au plus complexe", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h07", "href": "lecon3.html", "t": "lecon", "title": "Consonnes aspirées & tendues", "sub": "ㅋ·ㅌ·ㅍ·ㅊ·ㅎ · ㄲ·ㄸ·ㅃ·ㅆ·ㅉ — sons forts et doublés", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h08", "href": "anecdote1.html", "t": "anecdote", "title": "Le Roi Sejong & le Hangeul", "sub": "1443 · Pourquoi cet alphabet est un chef-d'œuvre scientifique", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h09", "href": "lecon4.html", "t": "lecon", "title": "Syllabes & Batchim", "sub": "Assembler les blocs syllabiques · 받침 · Règles de prononciation", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h14", "href": "lecon9.html", "t": "lecon", "title": "Diphtongues — Voyelles composées", "sub": "ㅘ(wa)·ㅝ(wo)·ㅕ(yeo)·ㅒ·ㅖ·ㅙ·ㅚ·ㅞ·ㅟ·ㅢ — 10 voyelles composées essentielles", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h10", "href": "exercice2.html", "t": "exercice", "title": "Lis tes premières syllabes", "sub": "가나다라 → 갈비탕 → 안녕하세요 · Du simple au complexe", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_ecr_hangeul", "href": "ecriture.html?lvl=hangeul", "t": "exercice", "title": "Atelier d'écriture — Tape tes premières syllabes", "sub": "Clavier coréen 2-beolsik · Compose ㅎ+ㅏ+ㄴ=한 · Copie, dictée audio & traduction · Mode Hangeul", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h11", "href": "hangeul.html", "t": "flashcards", "title": "Flashcards Hangeul complet", "sub": "40 caractères · Recto-verso · Spaced Repetition · Audio natif", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h12", "href": "jeu2.html", "t": "jeu", "title": "Speed Round Hangeul", "sub": "Lis le plus vite possible · Chronomètre · Bats ton record !", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_h13", "href": "quiz1.html", "t": "quiz", "title": "Checkpoint Hangeul", "sub": "20 questions · Validation · Badge Hangeul officiel", "lvl": "hangeul", "lvlName": "Hangeul — L'alphabet"},
    {"key": "ks_a01", "href": "lecon5.html", "t": "lecon", "title": "Salutations & Se présenter", "sub": "안녕하세요 · 저는 …이에요 · 만나서 반가워요 — les formules incontournables du quotidien", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a02", "href": "prononciation.html", "t": "prononciation", "title": "Prononciation au micro", "sub": "Pratique tes premiers mots au micro · L'IA évalue ton accent (90% = excellent) · 51 phrases essentielles", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a03", "href": "histoire1-bd.html", "t": "histoire", "title": "Au café — Première rencontre", "sub": "Ji-woo rencontre Emma · Dialogue naturel complet · 15 expressions du quotidien à retenir", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a04", "href": "anecdote2.html", "t": "anecdote", "title": "La révérence en Corée", "sub": "Angle 15°, 45° ou 90° — saluer selon l'âge et le statut · Les erreurs que font les étrangers", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a31", "href": "lecon15.html", "t": "lecon", "title": "Particules 이/가 et 은/는", "sub": "Sujet vs thème — distinction fondamentale · 이/가 = info nouvelle · 은/는 = contexte connu · 30 exemples", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a32", "href": "lecon16.html", "t": "lecon", "title": "Particules 을/를, 에, 에서, 로", "sub": "Objet direct · Lieu statique vs dynamique · Direction · Moyen — 4 particules essentielles maîtrisées", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a33", "href": "exercice6.html", "t": "exercice", "title": "Choisir la bonne particule", "sub": "이/가 · 은/는 · 을/를 · 에 · 에서 — 10 exercices en contexte · Correction immédiate · Explications", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a48", "href": "lecon62.html", "t": "lecon", "title": "있어요 / 없어요 — Exister & Avoir", "sub": "Il y a · J'ai · Être quelque part — LE verbe à tout faire · 화장실이 어디에 있어요? · Combine 이/가 et 에", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a50", "href": "jeu13.html", "t": "jeu", "title": "Particule Rush", "sub": "이/가 · 은/는 · 을/를 · 에 · 에서 — 20 phrases, 90 secondes, combo ×2 · Le réflexe particules", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a34", "href": "quiz3.html", "t": "quiz", "title": "Checkpoint Particules", "sub": "10 questions TOPIK-style · Valider l'acquis de toutes les particules A1 · Badge Particules", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a22", "href": "lecon41.html", "t": "lecon", "title": "20 Verbes essentiels + Conjugaison", "sub": "가다·오다·먹다·마시다·보다·자다·살다·만나다·공부하다·일하다 — présent/passé/futur", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a68", "href": "lecon73.html", "t": "lecon", "title": "Verbes irréguliers coréens", "sub": "ㅂ · ㄷ · ㅅ · 르 · ㅎ — les 5 familles irrégulières + les faux amis qui restent réguliers", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a69", "href": "exercice34.html", "t": "exercice", "title": "Exercice : Conjugue les irréguliers", "sub": "8 questions corrigées · 5 familles + pièges des faux amis 입다/받다", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a70", "href": "jeu25.html", "t": "jeu", "title": "Conjugaison Express — Verbes irréguliers", "sub": "90 secondes · Conjugue vite sans te faire piéger par les faux amis · Série & chrono", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a23", "href": "lecon13.html", "t": "lecon", "title": "La négation : 안 & 못", "sub": "안 = ne pas vouloir · 못 = ne pas pouvoir · 50 exemples en contexte · Nuances cruciales", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a24", "href": "lecon14.html", "t": "lecon", "title": "Poser des questions en coréen", "sub": "뭐·어디·언제·왜·어떻게·누구·얼마나 — les 7 mots interrogatifs + structures grammaticales", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a25", "href": "exercice4.html", "t": "exercice", "title": "Conjugaison en contexte", "sub": "Passé · Présent · Futur · 15 exercices avec scénarios réels · Correction IA instantanée", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a26", "href": "jeu4.html", "t": "jeu", "title": "Conjugaison Blitz", "sub": "Mode Survival · Conjugue le plus vite possible · Score mondial · Défi entre amis", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a49", "href": "lecon63.html", "t": "lecon", "title": "Demander poliment : -(으)세요 & 주세요", "sub": "앉으세요 · 물 주세요 · 도와주세요! · -지 마세요 — l'impératif poli et les formules de survie", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a05", "href": "lecon6.html", "t": "lecon", "title": "Chiffres Sino-coréens", "sub": "일·이·삼·사·오·육·칠·팔·구·십·백·천·만 — système d'origine chinoise pour prix, dates, étages", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a06", "href": "lecon6b.html", "t": "lecon", "title": "Chiffres Natifs coréens", "sub": "하나·둘·셋·넷·다섯·여섯·일곱·여덟·아홉·열 — système purement coréen pour âge, heures, objets", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a07", "href": "jeu3.html", "t": "jeu", "title": "Chiffres Express", "sub": "Sino ou natif ? Quiz chronométré · 50 rounds · Beat the clock · Score en temps réel", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a08", "href": "conseil2.html", "t": "conseil", "title": "Le secret des deux systèmes", "sub": "Âge → natif · Prix → sino · Téléphone → sino · Heures → natif — la règle en 30 secondes", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a09", "href": "lecon7.html", "t": "lecon", "title": "Famille & Pronoms personnels", "sub": "저·나 · 엄마·아빠·오빠·언니·누나·형·남동생·여동생 — toute la famille coréenne", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a10", "href": "anecdote3.html", "t": "anecdote", "title": "Oppa, Unnie, Sunbae…", "sub": "La hiérarchie sociale coréenne · Pourquoi on ne dit jamais le prénom · Règles implicites", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a11", "href": "exercice3.html", "t": "exercice", "title": "Décris ta famille en coréen", "sub": "8 situations concrètes · Production orale guidée · Correction automatique · Audio natif", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a12", "href": "lecon8.html", "t": "lecon", "title": "Couleurs & Adjectifs essentiels", "sub": "빨간·파란·노란·하얀·검은·예쁜·크다·작다·좋다·싫다 — 30 adjectifs du quotidien", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a13", "href": "exercice5.html", "t": "exercice", "title": "Décris ce que tu vois", "sub": "Photos de Séoul · Décris en coréen · 10 exercices progressifs avec feedback instantané", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a14", "href": "lecon10.html", "t": "lecon", "title": "La nourriture coréenne", "sub": "비빔밥·김치찌개·삼겹살·떡볶이·냉면 · 40 mots · Commander, demander, payer", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a15", "href": "histoire2-bd.html", "t": "histoire", "title": "Au restaurant — Commander", "sub": "Ha-eun et ses amis au pojangmacha · Dialogue authentique · Expressions indispensables", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a16", "href": "anecdote4.html", "t": "anecdote", "title": "Chimaek & Culture food coréenne", "sub": "Poulet frit + bière = chimaek · Pourquoi manger ensemble est une affaire sérieuse en Corée", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a17", "href": "jeu5.html", "t": "jeu", "title": "Menu coréen : Devine le plat !", "sub": "50 plats · Écoute le nom · Associe la photo · Mémorisation par l'image et le son", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a18", "href": "lecon11.html", "t": "lecon", "title": "Lieux de la vie quotidienne", "sub": "학교·병원·카페·슈퍼·지하철역·공원 — 30 lieux essentiels · Particules 에/에서/로", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a19", "href": "lecon12.html", "t": "lecon", "title": "Directions & Positions", "sub": "앞·뒤·왼쪽·오른쪽·위·아래·옆·근처 — se repérer dans Séoul · 10 expressions de trajet", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a20", "href": "jeu6.html", "t": "jeu", "title": "Trouve ton chemin à Séoul", "sub": "Carte interactive du métro · Suis les indications en coréen · Trouve la bonne station", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a21", "href": "anecdote5.html", "t": "anecdote", "title": "Le métro de Séoul", "sub": "Le plus ponctuel du monde · Annonces en coréen · Vocabulaire du transport quotidien", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a_time", "href": "lecon42.html", "t": "lecon", "title": "Heure, Jours & Mois", "sub": "몇 시예요 ? · Nombres natifs pour heures · Sino-coréens pour minutes · 월요일→일요일 · 1월→12월", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a_meteo", "href": "lecon43.html", "t": "lecon", "title": "Météo & Saisons", "sub": "날씨가 어때요? · 맑아요·흐려요·비가 와요·눈이 와요 · 봄여름가을겨울 · 6 températures", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a_counters", "href": "lecon44.html", "t": "lecon", "title": "Les Compteurs Coréens", "sub": "개·명·잔·권·마리·장·병·대 — 8 compteurs TOPIK 1 essentiels · Nombres natifs + règles des formes courtes", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a36", "href": "lecon61.html", "t": "lecon", "title": "Maison & objets", "sub": "집 · 거실 · 부엌 · 침실 · 욕실 · 12 pièces + 20 meubles · Particules de position 위/밑/옆/안/앞/뒤", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a37", "href": "histoire33-bd.html", "t": "histoire", "title": "Le matin de Mina", "sub": "Routine matinale · Petit-déj 김치찌개 · Formules 잘 다녀올게요 · 2 voix féminines · Mode écoute", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a35", "href": "histoire32-bd.html", "t": "histoire", "title": "Au café avec Mina", "sub": "Mina retrouve Jiwoo au café · Commander en coréen · 3 voix différenciées · Mode écoute complète", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a43", "href": "histoire31-bd.html", "t": "histoire", "title": "Bienvenue chez moi", "sub": "Mina invite Emma chez elle · Visite salon + cuisine · Réutilise le vocab Maison & objets · Mode écoute", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a38", "href": "lecon58.html", "t": "lecon", "title": "Le corps & la santé", "sub": "머리·눈·코·입·손·발 · 30 parties du corps · Décrire ses symptômes · 아파요 · 열이 나요 · Chez le médecin", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a39", "href": "lecon59.html", "t": "lecon", "title": "Les vêtements & la mode", "sub": "옷 · 바지 · 치마 · 신발 · 가방 + couleurs · Shopping vocab · 입어봐도 돼요?", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a40", "href": "lecon60.html", "t": "lecon", "title": "Les émotions & l'état d'esprit", "sub": "기쁘다 · 슬프다 · 화나다 · 무섭다 · 행복하다 · 걱정되다 · 30 émotions essentielles · Expressions naturelles", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a52", "href": "anecdote20.html", "t": "anecdote", "title": "Le Konglish — ces mots « anglais » 100% coréens", "sub": "커피 · 핸드폰 · 아파트 · 서비스 · 파이팅 — 10% du coréen moderne déjà dans ta poche", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a27", "href": "histoire3-bd.html", "t": "histoire", "title": "Une journée à Séoul", "sub": "Se lever → prendre le métro → travailler → manger → rentrer · Routine quotidienne complète", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a28", "href": "chanson1.html", "t": "chanson", "title": "어머나 — Apprends en chantant", "sub": "K-Pop classique · +20 mots A1 · Karaoké syllabe par syllabe · Analyse grammaticale", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a29", "href": "flash1.html", "t": "flashcards", "title": "Flashcards A1 — 200 mots clés", "sub": "Les 200 mots les plus fréquents · SRS adaptatif · Audio natif · Révision intelligente", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a41", "href": "histoire29-bd.html", "t": "histoire", "title": "Une journée à Gyeongbokgung", "sub": "경복궁 · Palais royal · Emma en visite · 한복 rental · Dialogue complet + 15 expressions touristiques", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a42", "href": "histoire30-bd.html", "t": "histoire", "title": "Chez le médecin — Premiers symptômes", "sub": "병원 · 증상 설명 · 약 처방 · Dialogue A1 simplifié · 10 mots clés médicaux pour débutants", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a47", "href": "anecdote19.html", "t": "anecdote", "title": "빨리빨리 — La culture de la rapidité", "sub": "Le rythme de vie coréen · Pourquoi tout va vite en Corée · Delivery apps · 빠른 배송 · Vocabulaire", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a44", "href": "exercice24.html", "t": "exercice", "title": "Commander en ligne / Au téléphone", "sub": "배달 앱 · Formulaire de livraison · 주문하다 · 배달 주소 · 몇 시에 와요? · 3 scénarios pratiques", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a45", "href": "jeu12.html", "t": "jeu", "title": "Vocabulaire visuel A1 — Photo Quiz", "sub": "50 photos de la vie quotidienne coréenne · Nomme ce que tu vois · Chronométré · Score mondial", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a46", "href": "chanson6.html", "t": "chanson", "title": "Apprendre en chantant — K-Pop A1", "sub": "Chansons simples · Vocabulaire A1 fondamental · Karaoké syllabe par syllabe · Quiz final", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a51", "href": "conseil9.html", "t": "conseil", "title": "Taper en coréen — téléphone & ordinateur", "sub": "Activer le clavier 2-beolsik partout · iPhone, Android, PC, Mac · + entraînement intégré", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_ecr_a1", "href": "ecriture.html?lvl=a1", "t": "exercice", "title": "Atelier d'écriture — Vocabulaire A1 au clavier", "sub": "Tape les mots A1 sur le clavier coréen · Copie, dictée audio native & traduction · Record à battre", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a60", "href": "lecon64.html", "t": "lecon", "title": "Au restaurant — Commander", "sub": "몇 분이세요? · 주세요 · 인분/개 · 매워요/안 매워요 · 얼마예요? — de l'entrée à l'addition", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a61", "href": "exercice25.html", "t": "exercice", "title": "Commander au restaurant", "sub": "8 situations concrètes · S'installer, commander, payer · Choix mélangés · Correction immédiate", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a62", "href": "jeu14.html", "t": "jeu", "title": "Service Express", "sub": "90 secondes pour servir un maximum de clients · Trouve la bonne phrase avant le chrono !", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a63", "href": "lecon65.html", "t": "lecon", "title": "Décrire quelqu'un", "sub": "Apparence & personnalité · 키가 커요 · 친절해요 · 귀여워요 · adjectif + nom (친절한 사람)", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a64", "href": "exercice26.html", "t": "exercice", "title": "Décris les gens", "sub": "8 questions · Adjectifs d'apparence et de caractère · Forme adjectif + nom · Choix mélangés", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a65", "href": "jeu15.html", "t": "jeu", "title": "Portrait Match", "sub": "Associe chaque adjectif coréen à son sens · Mémorisation rapide · Vise le sans-faute", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a66", "href": "jeu18.html", "t": "jeu", "title": "Photo Match : devine le mot", "sub": "27 photos · Vois l'image, choisis le bon mot coréen · Vocabulaire visuel par l'image", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a67", "href": "jeu19.html", "t": "jeu", "title": "Écoute & Trouve", "sub": "Écoute le mot en voix naturelle · Touche la bonne photo · Entraîne ton oreille", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_a30", "href": "quiz2.html", "t": "quiz", "title": "Checkpoint A1 Final", "sub": "40 questions · Grammaire + Vocabulaire + Écoute + Production · Badge A1 TOPIK certifié", "lvl": "a1", "lvlName": "A1 — Débutant"},
    {"key": "ks_b01", "href": "lecon21.html", "t": "lecon", "title": "Le futur en coréen : -(으)ㄹ 거예요", "sub": "Exprimer ses projets et intentions · 갈 거예요 · 먹을 거예요 · 20 exemples contextualisés", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b23", "href": "lecon22.html", "t": "lecon", "title": "Progressif & Résultatif : -고 있어요 / -아 있어요", "sub": "Action en cours vs état résultant — 먹고 있어요 · 앉아 있어요 · Différence clé", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24", "href": "lecon23.html", "t": "lecon", "title": "Capacité & Obligation : -ㄹ 수 있다 / -아야 하다", "sub": "할 수 있어요 · 해야 해요 · Possibilité et nécessité en contexte", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24e", "href": "lecon77.html", "t": "lecon", "title": "Savoir-faire : -(으)ㄹ 줄 알다/모르다", "sub": "수영할 줄 알아요 (savoir nager) vs 수영할 수 있어요 (pouvoir nager) — la nuance que le français confond", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24f", "href": "exercice38.html", "t": "exercice", "title": "Exercice : Savoir-faire vs pouvoir", "sub": "8 questions corrigées · Compétence apprise (줄 알다) ou possibilité du moment (수 있다) ?", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24g", "href": "jeu29.html", "t": "jeu", "title": "Savoir ou Pouvoir ?", "sub": "90 secondes · Choisir la bonne structure avant le chrono · Série & chrono", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24h", "href": "lecon80.html", "t": "lecon", "title": "Résolution : -아/어야지", "sub": "이제 자야지 (résolution personnelle) vs 학생은 공부해야 해요 (obligation générale) — se motiver soi-même en coréen naturel", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24i", "href": "exercice41.html", "t": "exercice", "title": "Exercice : Résolution -아/어야지", "sub": "8 questions corrigées · Résolution personnelle (아/어야지) ou obligation générale (아/어야 하다) ?", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24j", "href": "jeu32.html", "t": "jeu", "title": "Résolution ou Obligation ?", "sub": "90 secondes · Choisir la bonne structure avant le chrono · Série & chrono", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24k", "href": "lecon81.html", "t": "lecon", "title": "Décision ou Envie : -(으)ㄹ게요 / -(으)ㄹ래요", "sub": "나중에 전화할게요 (décision annoncée) vs 같이 갈래요? (envie, invitation) — la nuance que tout le monde confond", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24l", "href": "exercice42.html", "t": "exercice", "title": "Exercice : -(으)ㄹ게요 vs -(으)ㄹ래요", "sub": "8 questions corrigées · Décision/promesse (게요) ou envie/invitation (래요) ?", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b24m", "href": "jeu33.html", "t": "jeu", "title": "Décision ou Invitation ?", "sub": "90 secondes · Choisir la bonne structure avant le chrono · Série & chrono", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b25", "href": "lecon24.html", "t": "lecon", "title": "Désir & Envie : -고 싶다", "sub": "-고 싶어요 · -고 싶어해요 · -고 싶지 않아요 — exprimer vos envies et celles des autres · 20 exemples", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b26", "href": "lecon25.html", "t": "lecon", "title": "Exprimer une opinion : -(으)ㄹ 것 같다", "sub": "-(으)ㄹ 것 같아요 · -다고 생각해요 · 제 생각에는 — donner son avis avec nuance", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b27", "href": "lecon26.html", "t": "lecon", "title": "Requêtes polies : -아/어 주세요", "sub": "-아/어 주세요 · -아/어 주실 수 있어요? — demander de l'aide · 6 scénarios réels du quotidien", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b28", "href": "lecon27.html", "t": "lecon", "title": "Temps & Durée : 전에 · 후에 · 동안", "sub": "Avant · Après · Pendant · -은 다음에 · -(으)면서 — situer, ordonner, raconter", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b28b", "href": "lecon75.html", "t": "lecon", "title": "Particules auxiliaires : 만, 도, 부터, 까지", "sub": "만 (seulement) · 도 (aussi, même) · 부터...까지 (de...à) — le 2e groupe de particules indispensable", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b28c", "href": "exercice36.html", "t": "exercice", "title": "Exercice : 만, 도, 부터, 까지", "sub": "8 questions corrigées · Choisir la bonne particule auxiliaire en contexte", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b28d", "href": "jeu27.html", "t": "jeu", "title": "Particule Rush 2", "sub": "90 secondes · Choisir la bonne particule auxiliaire avant le chrono · Série & chrono", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b29", "href": "exercice10.html", "t": "exercice", "title": "Production : Désir, Opinion, Requêtes", "sub": "15 situations réelles — choisir la bonne structure · -고 싶다 · 것 같다 · -아/어 주세요", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04b", "href": "lecon45.html", "t": "lecon", "title": "Voix passive : -이/히/리/기 & -되다", "sub": "보이다·먹히다·팔리다·끊기다 · 4 suffixes passifs + -되다 pour 하다 · -아/어지다 — voix passive complète", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04f", "href": "lecon74.html", "t": "lecon", "title": "Voix causative : 사동사", "sub": "먹이다·입히다·태우다 · Le piège 보이다 (passif ou causatif ?) · -게 하다 universel — contraste avec le passif", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04g", "href": "exercice35.html", "t": "exercice", "title": "Exercice : Passif ou causatif ?", "sub": "8 questions corrigées · Suffixes causatifs · Le piège 보이다 · -게 하다", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04h", "href": "jeu26.html", "t": "jeu", "title": "Causatif Express", "sub": "90 secondes · Choisir la bonne forme causative sans te faire piéger par 보이다 · Série & chrono", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04c", "href": "lecon46.html", "t": "lecon", "title": "L'expérience : -아/어 봤어요 & -본 적이 있다", "sub": "-아/어 봐요 · -아/어 봤어요 · -본 적이 있어요 · -본 적이 없어요 — essayer & avoir vécu quelque chose", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04d", "href": "lecon47.html", "t": "lecon", "title": "Permission & Interdiction", "sub": "-아/어도 되다 · -면 안 되다 · -지 않아도 되다— 3 structures essentielles de la vie quotidienne", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b04e", "href": "lecon48.html", "t": "lecon", "title": "Comparaisons : 더, 보다, 가장, 만큼, 처럼", "sub": "A보다 더 [adj] · 가장/제일 · A만큼 · A처럼 — 5 outils pour comparer en coréen", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b34", "href": "lecon55.html", "t": "lecon", "title": "-ㄴ/는다 — Style journal & narration", "sub": "Style neutre/littéraire · Journaux intimes · Articles · Différence avec -아요/해요 · Passer du parlé à l'écrit", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b35", "href": "lecon56.html", "t": "lecon", "title": "Propositions concessive : -아/어도 · -더라도", "sub": "\"Même si\" en A2 · 비가 와도 갈 거예요 · -더라도 (hypothèse forte) · Différence clé avec -(으)면", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b36", "href": "lecon57.html", "t": "lecon", "title": "Exprimer la raison : -거든요 & -잖아요", "sub": "-거든요 : informer de quelque chose que l'autre ne sait pas · -잖아요 : rappeler ce que l'autre sait · 20 exemples", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b36b", "href": "lecon82.html", "t": "lecon", "title": "-네요 : Réagir & découvrir", "sub": "-네요 : la réaction spontanée · -(으)시네요 poli · 3e pièce du puzzle après -거든요/-잖아요", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b36c", "href": "exercice43.html", "t": "exercice", "title": "Exercice : -네요, réagir & découvrir", "sub": "8 questions · -네요 vs -아요/어요 vs -(으)시네요", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b36d", "href": "jeu34.html", "t": "jeu", "title": "Réaction ou Fait ?", "sub": "90 secondes · Choisis entre -네요 et -아요/어요 avant la fin du chrono", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b05", "href": "lecon17.html", "t": "lecon", "title": "Construire des phrases complexes", "sub": "SOV · Modificateurs · Propositions relatives — ordre des mots en coréen", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b06", "href": "lecon18.html", "t": "lecon", "title": "Conjonctions : et, mais, parce que", "sub": "-고 · -지만 · -어서/-니까/-는데 — relier des idées naturellement", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b07", "href": "exercice7.html", "t": "exercice", "title": "Production de phrases A2", "sub": "10 situations réelles · Construire des phrases complètes · Voir le modèle", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b08", "href": "jeu7.html", "t": "jeu", "title": "Grammar Battle", "sub": "10 rounds · Particules & conjugaison · 3 vies · Classement par score", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b09", "href": "histoire12-bd.html", "t": "histoire", "title": "K-Drama : 사랑해요", "sub": "Dialogues romantiques authentiques · Vocabulaire émotionnel · Analyse grammaticale", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b10", "href": "anecdote6.html", "t": "anecdote", "title": "La culture des PC Bang", "sub": "Gaming · Société coréenne · Vocabulaire geek et digital incontournable", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b11", "href": "anecdote7.html", "t": "anecdote", "title": "La K-Beauty expliquée", "sub": "10 étapes de soin · Vocabulaire beauté · Marques coréennes incontournables", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b12", "href": "histoire13-bd.html", "t": "histoire", "title": "Un week-end à Hongdae", "sub": "Quartier branché de Séoul · Street art · Shopping · 20 expressions", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b32", "href": "anecdote8.html", "t": "anecdote", "title": "Noraebang : le karaoké coréen", "sub": "Salles privées · Vocabulaire 노래방 · Phrases pour réserver · Étiquette culturelle", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b31", "href": "histoire15-bd.html", "t": "histoire", "title": "Emma chez le médecin à Séoul", "sub": "Décrire ses symptômes · Clinique · Pharmacie · Dialogue complet + 15 mots médicaux clés", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b13", "href": "lecon19.html", "t": "lecon", "title": "Achats & Argent", "sub": "얼마예요 · 비싸다 · 싸다 · Négocier · Payer · Rendre la monnaie", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b14", "href": "exercice8.html", "t": "exercice", "title": "Dans un grand magasin", "sub": "Trouver un rayon · Essayer un vêtement · Payer · 3 dialogues complets", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b15", "href": "flash2.html", "t": "flashcards", "title": "Flashcards A2 — 80 mots essentiels", "sub": "Verbes · Noms · Adjectifs · Expressions — filtrage par catégorie · Système Connu/À revoir", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b16", "href": "lecon20.html", "t": "lecon", "title": "Planifier un voyage en Corée", "sub": "Réservation · Hôtel · Transports · 경복궁 · 홍대 · 제주도 — vocabulaire tourisme", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b17", "href": "histoire14-bd.html", "t": "histoire", "title": "À l'aéroport d'Incheon", "sub": "Check-in · Contrôle · Embarquement · Dialogue complet avec vocabulaire clé", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b18", "href": "conseil3.html", "t": "conseil", "title": "10 pièges du touriste en Corée", "sub": "Tipping · Chaussures · Baguettes · Politesse · Éviter tous les impairs", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b33", "href": "conseil4.html", "t": "conseil", "title": "Téléphoner & textos en coréen", "sub": "여보세요 · Décrocher · Laisser un message · Abréviations SMS ㅋㅋ ㅠㅠ ㄱㄱ — tout le vocabulaire", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b37", "href": "histoire27-bd.html", "t": "histoire", "title": "Chuseok chez une famille coréenne", "sub": "La fête de la lune · 차례 · 한복 · 성묘 · Traditions en famille · 10 expressions festives essentielles", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b38", "href": "histoire28-bd.html", "t": "histoire", "title": "Emma et le jimjilbang", "sub": "Sauna coréen · 찜질방 · 식혜 · 계란 · Culture du bain collectif · Dialogues et vocabulaire", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b43", "href": "histoire34-bd.html", "t": "histoire", "title": "À l'agence immobilière", "sub": "부동산 · Emma cherche un studio · Comparaisons 보다/더/제일 · Budget en wons · 3 voix · Mode écoute", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b44", "href": "histoire35-bd.html", "t": "histoire", "title": "Le kimbap de Joon", "sub": "김밥 만들기 · Cuisine en duo · -아/어 봤어요 · -는 동안 · Instructions -아/어 주세요 · Mode écoute", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b45", "href": "histoire36-bd.html", "t": "histoire", "title": "L'anniversaire de Jiwoo", "sub": "생일 · 미역국 · Nuances -잖아요/-거든요 · -본 적이 없어요 · 3 voix féminines · Mode écoute", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b39", "href": "anecdote18.html", "t": "anecdote", "title": "La culture du manhwa & webtoon", "sub": "만화 vs 웹툰 · Naver Webtoon · LINE Webtoon · 신의 탑 · 미생 · Vocabulary créatif coréen", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b40", "href": "conseil8.html", "t": "conseil", "title": "Les réseaux sociaux en coréen", "sub": "인스타 · 틱톡 · 유튜브 · Hashtags coréens · Commenter · 팔로우 · Vocabulaire digital A2 complet", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b41", "href": "pro6.html", "t": "prononciation", "title": "Règles de liaison & changements consonantiques", "sub": "연음 · 격음화 · 경음화 · 비음화 · 4 règles fondamentales pour sonner naturel · Exemples audio", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b42", "href": "exercice23.html", "t": "exercice", "title": "Écrire son journal intime en coréen", "sub": "오늘 일기 · Routine journalière · 기분 표현 · Template de journal · 3 exemples corrigés · Modèles à compléter", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b30", "href": "jeu8.html", "t": "jeu", "title": "K-Drama : Complète le dialogue !", "sub": "8 scènes authentiques · Café · Aveu · Médecin · Noraebang · Choisir la bonne réplique", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b19", "href": "chanson2.html", "t": "chanson", "title": "BTS — DNA", "sub": "Grammaire A2 intégrée · -부터 · -지만 · 속 · Karaoké + quiz sur la chanson", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b20", "href": "pro3.html", "t": "prononciation", "title": "Intonation avancée A2", "sub": "Montée finale · Allongement · Liaisons · Patterns émotionnels — 4 règles clés", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b21", "href": "exercice9.html", "t": "exercice", "title": "Scénarios de conversation A2", "sub": "5 scénarios réels : café · métro · pharmacie · restaurant · magasin · modèles inclus", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_ecr_a2", "href": "ecriture.html?lvl=a2", "t": "exercice", "title": "Atelier d'écriture — Vocabulaire A2 au clavier", "sub": "지하철역 · 도서관 · 여행… · Dictée audio native & traduction au clavier coréen · Record à battre", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b50", "href": "lecon66.html", "t": "lecon", "title": "Transports & se déplacer", "sub": "타다 · 내리다 · 갈아타다 · 호선/정거장 · taxi · demander son chemin — naviguer Séoul", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b51", "href": "exercice27.html", "t": "exercice", "title": "Se déplacer en ville", "sub": "8 situations · Métro, bus, taxi · Particules de mouvement · Choix mélangés · Correction", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b52", "href": "jeu16.html", "t": "jeu", "title": "Navigation Séoul", "sub": "90 secondes pour traverser la ville · Trouve la bonne phrase de transport avant le chrono !", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b53", "href": "lecon67.html", "t": "lecon", "title": "Loisirs & hobbies", "sub": "취미 · 좋아하다 · 잘하다/못하다 · fréquence (자주·가끔·보통) — parler de ses passions", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b54", "href": "exercice28.html", "t": "exercice", "title": "Parler de ses loisirs", "sub": "8 questions · Activités, 좋아하다, fréquence · Choix mélangés · Correction immédiate", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b55", "href": "jeu17.html", "t": "jeu", "title": "Hobby Match", "sub": "90 secondes pour répondre sur les loisirs · Trouve la bonne phrase avant le chrono !", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b56", "href": "lecon68.html", "t": "lecon", "title": "Santé & corps", "sub": "머리·배·목 · ~이/가 아프다 · 열이 나다 · 감기에 걸리다 · -아야 하다 — te débrouiller chez le médecin", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b57", "href": "exercice29.html", "t": "exercice", "title": "Chez le médecin", "sub": "8 questions · Parties du corps, 아프다, obligation -아야 하다 · Choix mélangés · Correction immédiate", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b58", "href": "jeu20.html", "t": "jeu", "title": "Docteur Match", "sub": "90 secondes pour répondre sur la santé · Trouve la bonne phrase avant le chrono !", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b59", "href": "lecon69.html", "t": "lecon", "title": "Voyage selon la météo", "sub": "날씨 · 일기예보 · conditionnel -(으)면 · impératif -세요 — organiser un voyage selon la météo", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b60", "href": "exercice30.html", "t": "exercice", "title": "Voyage selon la météo", "sub": "8 questions · Conditionnel -(으)면, impératif -세요, -아야 하다 · Choix mélangés · Correction immédiate", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b61", "href": "jeu21.html", "t": "jeu", "title": "Météo Match", "sub": "90 secondes pour répondre sur la météo et le voyage · Trouve la bonne phrase avant le chrono !", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b62", "href": "lecon70.html", "t": "lecon", "title": "Shopping & vêtements", "sub": "옷, 바지, 신발 · Les TROIS verbes « porter » (입다/신다/쓰다) · Essayer avec -아/어 보세요", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b63", "href": "exercice31.html", "t": "exercice", "title": "En boutique", "sub": "입다/신다/쓰다 + phrases de shopping · 8 questions · Correction immédiate", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b64", "href": "jeu22.html", "t": "jeu", "title": "Shopping Match", "sub": "90 secondes pour choisir le bon verbe « porter » et la bonne phrase · Chrono !", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_b22", "href": "quiz4.html", "t": "quiz", "title": "Checkpoint A2 Final", "sub": "10 questions TOPIK-style · Grammaire + Vocab + Compréhension · Badge A2 débloqué", "lvl": "a2", "lvlName": "A2 — Élémentaire"},
    {"key": "ks_c01", "href": "lecon28.html", "t": "lecon", "title": "Propositions relatives : -는 / -(으)ㄴ / -(으)ㄹ", "sub": "Modifier les noms avec des verbes · 4 formes essentielles · \"la personne qui mange\" · structures figées", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c02", "href": "lecon29.html", "t": "lecon", "title": "Discours indirect : -다고 하다", "sub": "Rapporter ce que quelqu'un a dit · Affirmation · Question · Ordre · Proposition · Direct → Indirect", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c02b", "href": "lecon76.html", "t": "lecon", "title": "Discours indirect contracté : -대, -냬, -래, -재", "sub": "뭐래요? · 비가 온대요 · Les contractions colloquiales omniprésentes à l'oral et en dramas", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c02c", "href": "exercice37.html", "t": "exercice", "title": "Exercice : Discours indirect contracté", "sub": "8 questions corrigées · -대/-냬/-래/-재 en contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c02d", "href": "jeu28.html", "t": "jeu", "title": "Rapporté Express", "sub": "90 secondes · Choisir la bonne contraction du discours rapporté · Série & chrono", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c03", "href": "lecon30.html", "t": "lecon", "title": "Conditionnel : -(으)면 · -아/어도 · -더라도", "sub": "\"Si…\" · \"Même si…\" · Hypothèse forte · Conditions du quotidien · 12 exemples contextualisés", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c04", "href": "lecon31.html", "t": "lecon", "title": "Cause avancée : -기 때문에 · -는 바람에", "sub": "Formel · Cause inattendue · -아/어서 vs -니까 décryptés définitivement · Tableau comparatif", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c05", "href": "exercice11.html", "t": "exercice", "title": "Exercice : Grammaire B1 — 12 questions", "sub": "Propositions relatives · Discours indirect · Conditionnel · Cause · Tout en un exercice ciblé", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c06", "href": "lecon32.html", "t": "lecon", "title": "존댓말 vs 반말 — Niveaux de langue", "sub": "Poli standard · Informel · Quand utiliser quoi · 반말 써도 돼요? — demander la permission", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c07", "href": "lecon33.html", "t": "lecon", "title": "Formes formelles : -습니다 / 합쇼체", "sub": "Présent · Passé · Questions · -(으)겠습니다 · Dialogues professionnels · Présentations", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c08", "href": "conseil5.html", "t": "conseil", "title": "Culture & Hiérarchie coréenne", "sub": "나이 · 선배/후배 · Titres · Règles de table · 잘 부탁드립니다 · Règles sociales essentielles", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09", "href": "exercice12.html", "t": "exercice", "title": "Exercice : Choisir le bon niveau de langue", "sub": "8 scénarios réels · Patron · Ami · Magasin · Présentation · Prof · Hôtes coréens", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c10", "href": "lecon34.html", "t": "lecon", "title": "Exprimer le temps (avancé)", "sub": "-면서 · -곤 했어요 · -아/어지다 · -아/어 버리다 · -자마자 · Simultanéité et changement", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c11", "href": "lecon35.html", "t": "lecon", "title": "Vocabulaire TOPIK 3-4 — Essentiel", "sub": "Verbes d'opinion · Connecteurs discursifs · Émotions coréennes · 설레다 · 아쉽다 · 뿌듯하다", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09b", "href": "lecon49.html", "t": "lecon", "title": "Nominalisation : -기 & -음/-ㅁ", "sub": "-기 (activités, expressions figées) vs -음/-ㅁ (formel, écrit, TOPIK) · 배우기 · 죽음 · 삶 · 8 expressions figées", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09bb", "href": "lecon79.html", "t": "lecon", "title": "Le but : -(으)러 가다/오다 vs -기 위해서", "sub": "밥을 먹으러 가요 (déplacement uniquement) vs 건강을 위해서 운동해요 (n'importe quel verbe) — la nuance du but", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09bc", "href": "exercice40.html", "t": "exercice", "title": "Exercice : Le but -(으)러 vs -기 위해서", "sub": "8 questions corrigées · Le verbe principal est-il un déplacement, ou pas ?", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09bd", "href": "jeu31.html", "t": "jeu", "title": "Déplacement ou pas ?", "sub": "90 secondes · Choisir la bonne structure avant le chrono · Série & chrono", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09c", "href": "lecon50.html", "t": "lecon", "title": "-게 되다 & -기로 하다", "sub": "-게 되다 : changement progressif / involontaire · -기로 하다 : décision délibérée — nuance essentielle TOPIK", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c09d", "href": "lecon51.html", "t": "lecon", "title": "-는 반면에 & -(으)ㄹ수록", "sub": "Contraste (alors que, tandis que) · Degré progressif (plus...plus) · 벼는 익을수록 고개를 숙인다", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c27", "href": "lecon52.html", "t": "lecon", "title": "-ㄴ/는 편이다 & -(으)ㄹ 만하다", "sub": "-ㄴ 편이에요 : plutôt · -(으)ㄹ 만해요 : ça vaut la peine · Exprimer des degrés et recommandations nuancées", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c28", "href": "lecon53.html", "t": "lecon", "title": "-아/어 가다 · -아/어 오다 — Changement dans le temps", "sub": "Action qui progresse vers le futur (-아가다) ou qui a évolué jusqu'au présent (-아오다) · 살아가다 · 알아오다 · 10 exemples", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c29", "href": "lecon54.html", "t": "lecon", "title": "Structures de regret & hypothèse passée", "sub": "-(으)ㄹ걸 그랬다 · -(으)ㄹ 뻔했다 · -았/었더라면 — Regret, manque de peu, contre-factuel · 15 exemples", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c29b", "href": "lecon78.html", "t": "lecon", "title": "Déduction : -나 보다 / -(으)ㄴ가 보다", "sub": "밖에 비가 오나 봐요 (indice observé) vs 배고픈 것 같아요 (ressenti direct) — la nuance que 것 같다 seul ne couvre pas", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c29c", "href": "exercice39.html", "t": "exercice", "title": "Exercice : Déduction -나 보다", "sub": "8 questions corrigées · Ressenti direct (것 같다) ou indice observé (나/는가 보다) ?", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c29d", "href": "jeu30.html", "t": "jeu", "title": "Ressenti ou Indice ?", "sub": "90 secondes · Choisir la bonne structure avant le chrono · Série & chrono", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c12", "href": "anecdote9.html", "t": "anecdote", "title": "Culture : Les Haenyeo de Jeju", "sub": "Femmes-plongeuses · Île de Jeju · Patrimoine UNESCO 2016 · Vocabulaire et traditions", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c13", "href": "histoire16-bd.html", "t": "histoire", "title": "Premier jour au bureau à Séoul", "sub": "Emma en stage dans une IT coréenne · 존댓말 · 잘 부탁드립니다 · Déjeuner avec le 선배", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c14", "href": "jeu9.html", "t": "jeu", "title": "Jeu : Construire des phrases B1", "sub": "6 puzzles · Remettre les mots dans l'ordre · Relatives · Discours indirect · Conditionnels", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c15", "href": "exercice13.html", "t": "exercice", "title": "Exercice mixte B1 — 10 questions", "sub": "Temps · Vocabulaire · Politesse · Culture · Connecteurs · Changement progressif · Formel", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c16", "href": "histoire17-bd.html", "t": "histoire", "title": "Week-end à Busan avec les collègues", "sub": "KTX · Haeundae · Marché Jagalchi · 해산물 · -곤 했어요 · -아/어지고 있어요 en contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c17", "href": "chanson3.html", "t": "chanson", "title": "IU — Palette (팔레트) : Analyse B1", "sub": "좋아지다 · Propositions relatives · Changement progressif · Vocabulaire poétique", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c18", "href": "anecdote10.html", "t": "anecdote", "title": "Culture Gaming : PC방 & Esport", "sub": "피씨방 · Cybercafés coréens · StarCraft · Pro gamers · Vocabulaire gaming en coréen", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c19", "href": "pro4.html", "t": "lecon", "title": "Coréen en milieu professionnel", "sub": "Emails · Réunions · Titres (팀장님, 부장님) · 수고하세요 · 알겠습니다 · Dialogues bureau", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c39", "href": "lecon71.html", "t": "lecon", "title": "Chercher un logement", "sub": "월세 vs 전세 · 보증금 · 부동산 · Visiter, négocier et signer · Le système jeonse expliqué", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c40", "href": "exercice32.html", "t": "exercice", "title": "Exercice : À l'agence immobilière", "sub": "8 questions corrigées · 월세/보증금/옵션 · -(으)러 오다 · -(으)ㄹ게요", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c41", "href": "jeu23.html", "t": "jeu", "title": "Visite express — Logement", "sub": "90 secondes · Choisir la bonne phrase d'agence · Série & chrono", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c42", "href": "lecon72.html", "t": "lecon", "title": "Banque & démarches administratives", "sub": "은행 · 계좌 · 외국인등록증 · 주민센터 · Ouvrir un compte, gérer sa carte de résident, survivre au guichet", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c43", "href": "exercice33.html", "t": "exercice", "title": "Exercice : Au guichet", "sub": "8 questions corrigées · 개설하다/재발급받다/서명하다 · -(으)면 되다", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c44", "href": "jeu24.html", "t": "jeu", "title": "Guichet express — Banque", "sub": "90 secondes · Choisir la bonne phrase de banque ou d'administration · Série & chrono", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c20", "href": "jeu10.html", "t": "jeu", "title": "Traducteur instantané B1", "sub": "8 phrases · Choisir la bonne traduction · Toutes les structures B1 · Score en temps réel", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c21", "href": "histoire18-bd.html", "t": "histoire", "title": "Retour de voyage — Emma raconte", "sub": "Discours indirect · -는 바람에 · -자마자 · 설레다 · Raconter en coréen naturellement", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c22", "href": "exercice14.html", "t": "exercice", "title": "Exercice style TOPIK 3-4", "sub": "Questions inspirées de l'examen officiel · Structures · Compréhension de texte · Contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c30", "href": "histoire25-bd.html", "t": "histoire", "title": "Séoul by night — Itaewon & Hongdae", "sub": "Vie nocturne coréenne · Rencontres internationales · Dialogues en 반말 et 존댓말 · Expressions de la nuit", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c31", "href": "histoire26-bd.html", "t": "histoire", "title": "La dispute — réconciliation en coréen", "sub": "Dialogues de conflit puis réconciliation · 미안해 · 화 풀어 · Expressions émotionnelles · -는 바람에 en contexte", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c36", "href": "histoire37-bd.html", "t": "histoire", "title": "L'entretien d'embauche", "sub": "면접 · Tout en -습니다 · 자기소개 · -라고 합니다 · -기 때문입니다 · Registre formel en immersion · Mode écoute", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c37", "href": "histoire38-bd.html", "t": "histoire", "title": "Soirée au bord du Han", "sub": "한강 캠핑 · 반말 entre amis vs 존댓말 · -기로 하다 · -(으)ㄹ수록 · Conditionnel -(으)면 · Mode écoute", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c38", "href": "histoire39-bd.html", "t": "histoire", "title": "Le kimchi de grand-mère", "sub": "김장 · Souvenirs -곤 했어요 · Discours rapporté -다고 했어요 · Regret -(으)ㄹ걸 그랬어요 · Mode écoute", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c32", "href": "anecdote17.html", "t": "anecdote", "title": "Culture jeunesse coréenne — SNS & trends", "sub": "밈 · 챌린지 · 인플루언서 · 부캐 · Néologismes des jeunes Coréens · Vocabulaire digital incontournable", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c33", "href": "chanson5.html", "t": "chanson", "title": "BLACKPINK — How You Like That : Analyse B1", "sub": "Structures B1 intégrées · Propositions relatives · -잖아 · Argot · Karaoké + quiz grammatical", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c34", "href": "exercice22.html", "t": "exercice", "title": "Lire un blog coréen — Compréhension B1", "sub": "Article de blog natif sur la vie à Séoul · Questions de compréhension · Vocabulaire en contexte · Annotation", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_ecr_b1", "href": "ecriture.html?lvl=b1", "t": "exercice", "title": "Atelier d'écriture — Vocabulaire B1 au clavier", "sub": "회사 · 경험 · 문화 · 의견… · Mots abstraits B1 en dictée & traduction au clavier coréen", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c23", "href": "histoire19-bd.html", "t": "histoire", "title": "Histoire longue : L'examen TOPIK d'Emma", "sub": "5 chapitres · Toutes les structures B1 · Vocabulaire riche · Compréhension avancée", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c24", "href": "flash3.html", "t": "flashcards", "title": "Flashcards B1 — 24 cartes essentielles", "sub": "Grammaire · Émotions · Professionnel · Connecteurs · 4 catégories · Retourner et mémoriser", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c35", "href": "quiz9.html", "t": "quiz", "title": "Simulation TOPIK 3-4 — 20 questions", "sub": "Format officiel TOPIK II · Lecture · Grammaire · Vocabulaire · Résultat personnalisé avec analyses", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c25", "href": "exercice15.html", "t": "quiz", "title": "Quiz final B1 — 15 questions", "sub": "Validation complète · Toutes les structures B1 · Score + message personnalisé · Prêt pour TOPIK 3 ?", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_c26", "href": "quiz5.html", "t": "quiz", "title": "Bilan TOPIK 3-4 & Prochaines étapes", "sub": "Récapitulatif · Guide TOPIK · Prochaines étapes B2 · Badge B1 Intermédiaire", "lvl": "b1", "lvlName": "B1 — Intermédiaire"},
    {"key": "ks_d01", "href": "lecon36.html", "t": "lecon", "title": "Discours indirect avancé & citation", "sub": "-다고/-(으)라고/-냐고 hada · Nuances · Verbes de citation · Presse", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d02", "href": "lecon37.html", "t": "lecon", "title": "Formes verbales complexes B2", "sub": "-는 것 같다 · -(으)ㄹ 텐데 · -(으)ㄹ 뻔했다 · Regret · Hypothèse", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d03", "href": "exercice16.html", "t": "exercice", "title": "Débat en coréen", "sub": "Défendre un point de vue · Contre-argumenter · Expressions de débat", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d04", "href": "conseil6.html", "t": "conseil", "title": "Écrire comme un coréen natif", "sub": "7 pièges de traduction · Naturel vs formel · -거든요 · -잖아요", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d05", "href": "anecdote11.html", "t": "anecdote", "title": "Littérature coréenne moderne", "sub": "Han Kang (Nobel 2024) · Kim Young-ha · Cho Nam-joo · 한국 문학", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d06", "href": "histoire20-bd.html", "t": "histoire", "title": "Histoire littéraire — La rencontre", "sub": "Style Han Kang · 4 chapitres · Analyse linguistique · -ㄴ 채로 · -기도 하고", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d07", "href": "anecdote12.html", "t": "anecdote", "title": "Humour & Jeux de mots coréens", "sub": "아재 개그 · Argot (대박, 헐, ㅋㅋ) · Emoticons coréens · 눈치", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d08", "href": "lecon38.html", "t": "lecon", "title": "Comprendre les médias coréens", "sub": "Journaux · Podcasts · Structures journalistiques · Lire les titres", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d09", "href": "histoire21-bd.html", "t": "histoire", "title": "Article de presse coréen — guidé", "sub": "Article sur le coréen dans le monde · Vocabulaire · Analyse structures", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d10", "href": "exercice17.html", "t": "exercice", "title": "Compréhension orale sans sous-titres", "sub": "Stratégies d'écoute · Podcast simulé · Vocabulaire 워라밸 · 눈치", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d11", "href": "chanson4.html", "t": "chanson", "title": "G-Dragon — 삐딱하게 (Crooked)", "sub": "Argot jeune · -든(지) · 신경 꺼 · 삐딱하다 · Registre rebelle", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d12", "href": "lecon39.html", "t": "lecon", "title": "Coréen des affaires avancé", "sub": "Email formel · Présentation · 여쭤보다 · 회식 · 체면 · Business vocab", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d13", "href": "exercice18.html", "t": "exercice", "title": "Négociation en coréen", "sub": "Dialogue de négociation · 검토해 보겠습니다 · 절충안 · Culture 체면", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d18", "href": "lecon40.html", "t": "lecon", "title": "Formes rhétoriques : -(으)ㄹ 리가 없다 · -기 마련이다", "sub": "-(으)ㄹ 리가 없다 : impossible · -기 마련이다 : inévitable · -는 법이다 — 3 formes figées TOPIK 5-6 avec 15 exemples contextualisés", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d19", "href": "lecon40b.html", "t": "lecon", "title": "Connecteurs formels : 게다가 · 그럼에도 · 따라서", "sub": "게다가 · 그러나 · 따라서 · 반면에 · 즉 · 한편 — 10 connecteurs discursifs essentiels pour dissertations et TOPIK", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d20", "href": "lecon40c.html", "t": "lecon", "title": "Honorifiques approfondis : 여쭙다 · 드리다 · 뵙다", "sub": "여쭈다 · 드리다 · 뵙다 · 말씀드리다 — les 8 verbes honorifiques · Entretiens d'embauche · Contextes ultra-formels", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d21", "href": "lecon40d.html", "t": "lecon", "title": "속담 — Proverbes coréens essentiels", "sub": "가는 말이 고와야 오는 말이 곱다 · 10 속담 avec contexte culturel · Analyse linguistique · Utilisation naturelle", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d22", "href": "histoire22-bd.html", "t": "histoire", "title": "Webtoon coréen — Lecture guidée", "sub": "Extrait de 신의 탑 (Tower of God) · Langage des personnages · Argot · Onomatopées · Structure narrative", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d23", "href": "histoire23-bd.html", "t": "histoire", "title": "Podcast simulé — Le coréen naturel", "sub": "Discussion sur l'identité coréenne post-Hallyu · Débit natif · Stratégies d'écoute avancée · Script complet annoté", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d24", "href": "histoire24-bd.html", "t": "histoire", "title": "Essai littéraire — style Han Kang", "sub": "Fragment inspiré de 채식주의자 · Analyse stylistique · Vocabulaire littéraire · -ㄴ 채로 · -(으)며 · Nuances", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d25", "href": "anecdote13.html", "t": "anecdote", "title": "Hallyu Wave — Impact culturel mondial", "sub": "BTS · Parasite · Squid Game · Pourquoi la culture coréenne conquiert le monde · 한류 expliqué avec données", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d26", "href": "anecdote14.html", "t": "anecdote", "title": "Hansik — La gastronomie patrimoine UNESCO", "sub": "발효 · Kimchi · Doenjang · Temple food · Pourquoi la cuisine coréenne est reconnue mondialement", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d27", "href": "anecdote15.html", "t": "anecdote", "title": "눈치 — L'intelligence sociale coréenne", "sub": "눈치 보다 · 분위기 파악 · Lire entre les lignes · Un concept intraduisible qui régit toutes les relations sociales", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d33", "href": "anecdote16.html", "t": "anecdote", "title": "La culture des 학원 — L'éducation coréenne", "sub": "Hagwon · Suneung · La pression scolaire · 교육열 · Pourquoi la Corée a le taux de diplômés le plus élevé du monde", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d35", "href": "histoire40-bd.html", "t": "histoire", "title": "Le premier hoesik d'Emma", "sub": "회식 · Servir à deux mains · 드리다 · 뵙겠습니다 · 2차 — les honorifiques B2 en immersion · Mode écoute", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d36", "href": "histoire41-bd.html", "t": "histoire", "title": "Le grand débat : ville ou campagne ?", "sub": "토론 · 게다가/반면에/따라서 · -기 마련이다 · -(으)ㄹ 리가 없다 — argumenter comme au TOPIK II · Mode écoute", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d37", "href": "histoire42-bd.html", "t": "histoire", "title": "Les proverbes de grand-père", "sub": "속담 · 가는 말이 고와야… · 금강산도 식후경 · -는 법이다 · Transmission familiale · Mode écoute", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d28", "href": "exercice19.html", "t": "exercice", "title": "Rédiger un email professionnel", "sub": "Structure formelle · 귀하 · 안녕하십니까 · Formules de clôture · 3 modèles complets · Corrections annotées", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d29", "href": "exercice20.html", "t": "exercice", "title": "Essai TOPIK II — Entraînement rédaction", "sub": "Format 쓰기 section B · Plan en 3 parties · Introduction · Développement · Conclusion · Modèle corrigé", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d34", "href": "exercice21.html", "t": "exercice", "title": "Compréhension d'un article de presse coréen", "sub": "Article réel sur la société coréenne · Vocabulaire académique · Questions de compréhension · Analyse des structures", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d30", "href": "jeu11.html", "t": "jeu", "title": "Bataille des idiomes coréens", "sub": "25 expressions idiomatiques · 속담 vs 관용어 · Choix multiple en contexte · Audio natif · Classement mondial", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d31", "href": "pro5.html", "t": "prononciation", "title": "Prosodie avancée — Intonation naturelle", "sub": "Liaisons consonantiques · Accent de groupe · Rythme natif · Enregistre et compare · 5 exercices phonétiques", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d32", "href": "conseil7.html", "t": "conseil", "title": "Penser en coréen — Immersion mentale", "sub": "7 stratégies pour ne plus traduire · Inner monologue en coréen · Techniques des polyglotes avancés · Ressources", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d14", "href": "flash4.html", "t": "flashcards", "title": "Flashcards B2 — 28 cartes avancées", "sub": "Grammaire · Business · Médias · Argot · 4 catégories", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d15", "href": "quiz6.html", "t": "quiz", "title": "Simulation TOPIK II — Section 읽기", "sub": "12 questions · Compréhension écrite · Format officiel · Niveau 5-6", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d16", "href": "quiz7.html", "t": "quiz", "title": "Simulation TOPIK II — Section 쓰기", "sub": "10 questions · Expression écrite · Dissertation · Registre formel", "lvl": "b2", "lvlName": "B2 — Avancé"},
    {"key": "ks_d17", "href": "quiz8.html", "t": "quiz", "title": "Bilan B2 & TOPIK 5-6 — Checkpoint final", "sub": "Récapitulatif · 5 questions · Prochaines étapes · Badge B2 Expert", "lvl": "b2", "lvlName": "B2 — Avancé"},
  ];

  /* Ordre COMPLET du parcours (toutes activités cours.html, y compris
     jeux/anecdotes/conseils hors liste cœur) — sert à next(fromHref)
     pour se repérer depuis n'importe quelle page. Régénéré avec le
     réordonnancement de cours.html. */
  var FULL_ORDER = [
    "lecon.html",
    "pro1.html",
    "jeu1.html",
    "lecon2.html",
    "conseil1.html",
    "exercice1.html",
    "lecon3.html",
    "anecdote1.html",
    "lecon4.html",
    "lecon9.html",
    "exercice2.html",
    "ecriture.html?lvl=hangeul",
    "hangeul.html",
    "jeu2.html",
    "quiz1.html",
    "lecon5.html",
    "prononciation.html",
    "histoire1-bd.html",
    "anecdote2.html",
    "lecon15.html",
    "lecon16.html",
    "exercice6.html",
    "lecon62.html",
    "jeu13.html",
    "quiz3.html",
    "lecon41.html",
    "lecon73.html",
    "exercice34.html",
    "jeu25.html",
    "lecon13.html",
    "lecon14.html",
    "exercice4.html",
    "jeu4.html",
    "lecon63.html",
    "lecon6.html",
    "lecon6b.html",
    "jeu3.html",
    "conseil2.html",
    "lecon7.html",
    "anecdote3.html",
    "exercice3.html",
    "lecon8.html",
    "exercice5.html",
    "lecon10.html",
    "histoire2-bd.html",
    "anecdote4.html",
    "jeu5.html",
    "lecon11.html",
    "lecon12.html",
    "jeu6.html",
    "anecdote5.html",
    "lecon42.html",
    "lecon43.html",
    "lecon44.html",
    "lecon61.html",
    "histoire33-bd.html",
    "histoire32-bd.html",
    "histoire31-bd.html",
    "lecon58.html",
    "lecon59.html",
    "lecon60.html",
    "anecdote20.html",
    "histoire3-bd.html",
    "chanson1.html",
    "flash1.html",
    "histoire29-bd.html",
    "histoire30-bd.html",
    "anecdote19.html",
    "exercice24.html",
    "jeu12.html",
    "chanson6.html",
    "conseil9.html",
    "ecriture.html?lvl=a1",
    "lecon64.html",
    "exercice25.html",
    "jeu14.html",
    "lecon65.html",
    "exercice26.html",
    "jeu15.html",
    "jeu18.html",
    "jeu19.html",
    "quiz2.html",
    "lecon21.html",
    "lecon22.html",
    "lecon23.html",
    "lecon77.html",
    "exercice38.html",
    "jeu29.html",
    "lecon80.html",
    "exercice41.html",
    "jeu32.html",
    "lecon81.html",
    "exercice42.html",
    "jeu33.html",
    "lecon24.html",
    "lecon25.html",
    "lecon26.html",
    "lecon27.html",
    "lecon75.html",
    "exercice36.html",
    "jeu27.html",
    "exercice10.html",
    "lecon45.html",
    "lecon74.html",
    "exercice35.html",
    "jeu26.html",
    "lecon46.html",
    "lecon47.html",
    "lecon48.html",
    "lecon55.html",
    "lecon56.html",
    "lecon57.html",
    "lecon82.html",
    "exercice43.html",
    "jeu34.html",
    "lecon17.html",
    "lecon18.html",
    "exercice7.html",
    "jeu7.html",
    "histoire12-bd.html",
    "anecdote6.html",
    "anecdote7.html",
    "histoire13-bd.html",
    "anecdote8.html",
    "histoire15-bd.html",
    "lecon19.html",
    "exercice8.html",
    "flash2.html",
    "lecon20.html",
    "histoire14-bd.html",
    "conseil3.html",
    "conseil4.html",
    "histoire27-bd.html",
    "histoire28-bd.html",
    "histoire34-bd.html",
    "histoire35-bd.html",
    "histoire36-bd.html",
    "anecdote18.html",
    "conseil8.html",
    "pro6.html",
    "exercice23.html",
    "jeu8.html",
    "chanson2.html",
    "pro3.html",
    "exercice9.html",
    "ecriture.html?lvl=a2",
    "lecon66.html",
    "exercice27.html",
    "jeu16.html",
    "lecon67.html",
    "exercice28.html",
    "jeu17.html",
    "lecon68.html",
    "exercice29.html",
    "jeu20.html",
    "lecon69.html",
    "exercice30.html",
    "jeu21.html",
    "lecon70.html",
    "exercice31.html",
    "jeu22.html",
    "quiz4.html",
    "lecon28.html",
    "lecon29.html",
    "lecon76.html",
    "exercice37.html",
    "jeu28.html",
    "lecon30.html",
    "lecon31.html",
    "exercice11.html",
    "lecon32.html",
    "lecon33.html",
    "conseil5.html",
    "exercice12.html",
    "lecon34.html",
    "lecon35.html",
    "lecon49.html",
    "lecon79.html",
    "exercice40.html",
    "jeu31.html",
    "lecon50.html",
    "lecon51.html",
    "lecon52.html",
    "lecon53.html",
    "lecon54.html",
    "lecon78.html",
    "exercice39.html",
    "jeu30.html",
    "anecdote9.html",
    "histoire16-bd.html",
    "jeu9.html",
    "exercice13.html",
    "histoire17-bd.html",
    "chanson3.html",
    "anecdote10.html",
    "pro4.html",
    "lecon71.html",
    "exercice32.html",
    "jeu23.html",
    "lecon72.html",
    "exercice33.html",
    "jeu24.html",
    "jeu10.html",
    "histoire18-bd.html",
    "exercice14.html",
    "histoire25-bd.html",
    "histoire26-bd.html",
    "histoire37-bd.html",
    "histoire38-bd.html",
    "histoire39-bd.html",
    "anecdote17.html",
    "chanson5.html",
    "exercice22.html",
    "ecriture.html?lvl=b1",
    "histoire19-bd.html",
    "flash3.html",
    "quiz9.html",
    "exercice15.html",
    "quiz5.html",
    "lecon36.html",
    "lecon37.html",
    "exercice16.html",
    "conseil6.html",
    "anecdote11.html",
    "histoire20-bd.html",
    "anecdote12.html",
    "lecon38.html",
    "histoire21-bd.html",
    "exercice17.html",
    "chanson4.html",
    "lecon39.html",
    "exercice18.html",
    "lecon40.html",
    "lecon40b.html",
    "lecon40c.html",
    "lecon40d.html",
    "histoire22-bd.html",
    "histoire23-bd.html",
    "histoire24-bd.html",
    "anecdote13.html",
    "anecdote14.html",
    "anecdote15.html",
    "anecdote16.html",
    "histoire40-bd.html",
    "histoire41-bd.html",
    "histoire42-bd.html",
    "exercice19.html",
    "exercice20.html",
    "exercice21.html",
    "jeu11.html",
    "pro5.html",
    "conseil7.html",
    "flash4.html",
    "quiz6.html",
    "quiz7.html",
    "quiz8.html",
  ];

  /* Alias de clés (une activité peut avoir été validée sous une ancienne clé) */
  var KEY_ALIAS = {'ks_a01':'ks_l5','ks_a05':'ks_l6','ks_a09':'ks_l7','ks_a12':'ks_l8','ks_a14':'ks_l10','ks_a22':'ks_l9','ks_a03':'ks_h1','ks_a15':'ks_h2','ks_a27':'ks_h3','ks_h01':'ks_l1','ks_h04':'ks_l2','ks_h07':'ks_l3','ks_h09':'ks_l4','ks_d30':'ks_jeu11','ks_a45':'ks_jeu12'};

  /* Activités annoncées mais dont la page n'existe pas encore.
     On les expose pour que cours.html / app.html puissent les marquer
     "Bientôt" au lieu de laisser l'utilisateur tomber sur un 404.
     À chaque page créée, retirer son nom de cette liste. */
  var COMING_SOON = {
    /* Curriculum 100 % livré — plus aucune activité en attente.
       Si une nouvelle page est ajoutée à cours.html mais pas encore
       créée, ajoute-la ici sous la forme : 'maPage.html':1, */
  };

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k,v) { try { localStorage.setItem(k,v); } catch (e) {} }
  function lsRemove(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ───────────────────────────────────────────────────────────────
     Migration v3 — réparation de progressions corrompues
     Bugs historiques traités :
     - lecon9.html (Diphtongues Hangeul) écrivait `ks_a22` (qui correspond
       à lecon41 « Verbes essentiels » dans le curriculum) au lieu de
       `ks_h14`. Conséquence : Diphtongues n'était jamais marquée OK,
       et Verbes essentiels apparaissait OK sans avoir été faite.
     - 13 lecons A1/A2 (lecon15-27) avaient une erreur de syntaxe JS
       qui empêchait `completeLesson()` de fonctionner. Rien à
       migrer côté progression — le code corrigé prendra le relais
       au prochain passage de l'utilisateur sur ces leçons.
     ─────────────────────────────────────────────────────────────── */
  (function migrate(){
    if (ls('ks_mig_v3') === '1') return;
    try {
      // 1. Si l'utilisateur a fait lecon9 (ks_l9='done'), on garantit
      //    que ks_h14 (Diphtongues, vraie clé curriculum) est aussi OK
      if (ls('ks_l9') === 'done' && ls('ks_h14') !== 'done') {
        lsSet('ks_h14', 'done');
      }
      // 2. Si ks_a22 (Verbes essentiels = lecon41) était marqué OK
      //    UNIQUEMENT à cause du bug lecon9, il faut le déclassifier.
      //    Heuristique : si ks_a22='done' ET aucun marqueur explicite
      //    de lecon41 (ks_l41 n'existe pas, ks_a22_xp n'est pas posé
      //    par lecon41), ET ks_l9='done', alors c'est un faux positif.
      if (ls('ks_a22') === 'done' && ls('ks_l9') === 'done' && !ls('ks_a22_xp')) {
        lsRemove('ks_a22');
      }
    } catch (e) {}
    lsSet('ks_mig_v3', '1');
  })();

  /* ───────────────────────────────────────────────────────────────
     Migration v4 — valeurs JSON dans les clés d'anecdotes
     anecdote2/anecdote3 écrivaient un OBJET JSON ({"done":true,…})
     dans ks_a04/ks_a10 au lieu de la chaîne 'done' → jamais validées
     (cause directe des « A1-4 / A1-10 impossibles à finir »).
     On normalise les valeurs existantes des utilisateurs touchés.
     ─────────────────────────────────────────────────────────────── */
  (function migrateV4(){
    if (ls('ks_mig_v4') === '1') return;
    try {
      ['ks_a04', 'ks_a10'].forEach(function (k) {
        var v = ls(k);
        if (v && v.charAt(0) === '{' && v.indexOf('"done":true') !== -1) {
          lsSet(k, 'done');
          lsSet(k + '_xp', '1'); /* l'XP avait déjà été créditée */
        }
      });
    } catch (e) {}
    lsSet('ks_mig_v4', '1');
  })();

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

  /* Prochaine activité non terminée.
     - Sans argument : première non-terminée de tout le parcours
       (comportement « Reprendre » du dashboard).
     - Avec fromHref (la page courante) : première non-terminée
       APRÈS la page courante dans le parcours. C'est ce que veut
       dire « Suivant » à la fin d'une activité — on avance, on ne
       renvoie pas l'utilisateur vers une activité passée qu'il a
       sautée. Si tout ce qui suit est fait, on retombe sur la
       première non-terminée globale (rattrapage des trous).
     Saute les activités "bientôt" pour ne pas envoyer l'utilisateur
     sur un 404. */
  function next(fromHref) {
    var start = 0;
    if (fromHref) {
      var clean = String(fromHref).split('?')[0].split('#')[0].split('/').pop();
      /* 1. La page courante est-elle une activité cœur ? */
      var found = false;
      for (var j = 0; j < ACTIVITIES.length; j++) {
        if (ACTIVITIES[j].href.split('?')[0] === clean) { start = j + 1; found = true; break; }
      }
      /* 2. Sinon (anecdote, conseil, jeu, chanson…), on se repère via
         l'ordre complet du parcours : on cherche la première activité
         cœur qui suit cette page dans FULL_ORDER. */
      if (!found && typeof FULL_ORDER !== 'undefined') {
        var pos = FULL_ORDER.indexOf(clean);
        if (pos !== -1) {
          outer:
          for (var p = pos + 1; p < FULL_ORDER.length; p++) {
            for (var q = 0; q < ACTIVITIES.length; q++) {
              if (ACTIVITIES[q].href.split('?')[0] === FULL_ORDER[p]) { start = q; break outer; }
            }
          }
        }
      }
    }
    for (var i = start; i < ACTIVITIES.length; i++) {
      var a = ACTIVITIES[i];
      if (isComingSoon(a.href)) continue;
      if (!isDone(a.key)) return a;
    }
    /* Tout est fait après la page courante → premier trou global */
    if (start > 0) {
      for (var k = 0; k < ACTIVITIES.length; k++) {
        var b = ACTIVITIES[k];
        if (isComingSoon(b.href)) continue;
        if (!isDone(b.key)) return b;
      }
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
