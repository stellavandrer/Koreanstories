#!/usr/bin/env python3
"""Génère blog.html + les articles blog-*.html (template partagé).
v2 : icônes SVG (zéro émoji), photos Wikimedia Commons créditées,
lien retour explicite, faits vérifiés sur sources coréennes/officielles
avec bloc « Sources » par article."""
import json

# ── Icônes SVG (stroke currentColor, 24×24) ──────────────────────────
I = {
 'plane':   '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
 'bowl':    '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M12 4c-1.5 1.5-1.5 3 0 4.5"/><path d="M8 5c-1 1-1 2 0 3"/><path d="M16 5c-1 1-1 2 0 3"/>',
 'gate':    '<path d="M3 9h18"/><path d="M4 9c2-3 6-5 8-5s6 2 8 5"/><path d="M5 9v11"/><path d="M19 9v11"/><path d="M9 9v11"/><path d="M15 9v11"/><path d="M3 20h18"/>',
 'book':    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
 'cal':     '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
 'clock':   '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
 'pen':     '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
 'left':    '<polyline points="15 18 9 12 15 6"/>',
 'right':   '<polyline points="9 18 15 12 9 6"/>',
 'check':   '<polyline points="20 6 9 17 4 12"/>',
 'target':  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
 'info':    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
 'camera':  '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
 'link':    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
}
def ico(name, size=14, sw=2):
    return f'<svg viewBox="0 0 24 24" style="width:{size}px;height:{size}px;fill:none;stroke:currentColor;stroke-width:{sw};stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px" aria-hidden="true">{I[name]}</svg>'

SPK = '<button class="spk" onclick="window.speak(\'{kr}\',this)" aria-label="Écouter {kr}"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>'
def kr(word, rom=''):
    r = f' <em class="rom">{rom}</em>' if rom else ''
    return f'<span class="kr">{word}</span>{SPK.format(kr=word)}{r}'

CATS = {
  'voyage':  {'label':'Voyage',  'icon':'plane', 'color':'#0d9488'},
  'cuisine': {'label':'Cuisine', 'icon':'bowl',  'color':'#dc2626'},
  'culture': {'label':'Culture', 'icon':'gate',  'color':'#7c3aed'},
  'etudier': {'label':'Étudier', 'icon':'book',  'color':'#2563eb'},
}

# ── Photos Wikimedia Commons (vérifiées, licences libres) ────────────
PHOTOS = {
 'voyage': {
   'url':'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Night_View_%28127028137%29.jpeg/1280px-Night_View_%28127028137%29.jpeg',
   'alt':'Vue nocturne de Séoul avec la tour Namsan illuminée',
   'credit':'Ji Won Eum', 'lic':'CC BY 3.0',
   'page':'https://commons.wikimedia.org/wiki/File:Night_View_(127028137).jpeg'},
 'cuisine': {
   'url':'https://upload.wikimedia.org/wikipedia/commons/d/d6/Korea-Jeonju-Bibimbap_festival-01.jpg',
   'alt':'Bibimbap traditionnel servi au festival de Jeonju',
   'credit':'jetohs', 'lic':'CC BY-SA 2.0',
   'page':'https://commons.wikimedia.org/wiki/File:Korea-Jeonju-Bibimbap_festival-01.jpg'},
 'culture': {
   'url':'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Gyeongbokgung_Palace_Changing_of_the_Guard_Ceremony_20.jpg/1280px-Gyeongbokgung_Palace_Changing_of_the_Guard_Ceremony_20.jpg',
   'alt':'Cérémonie de la relève de la garde au palais Gyeongbokgung',
   'credit':'Ethan Doyle White', 'lic':'CC BY-SA 4.0',
   'page':'https://commons.wikimedia.org/wiki/File:Gyeongbokgung_Palace_Changing_of_the_Guard_Ceremony_20.jpg'},
 'etudier': {
   'url':'https://upload.wikimedia.org/wikipedia/commons/4/4f/King_sejong_the_great_gwanghwamun_square_police-859145.jpg',
   'alt':'Statue du roi Sejong, créateur du Hangeul, place Gwanghwamun à Séoul',
   'credit':'Wikimedia Commons', 'lic':'CC0 (domaine public)',
   'page':'https://commons.wikimedia.org/wiki/File:King_sejong_the_great_gwanghwamun_square_police-859145.jpg'},
}

ARTICLES = [
{
 'slug':'blog-premier-voyage-coree', 'cat':'voyage',
 'title':'Préparer son premier voyage en Corée : le guide pratique',
 'desc':"Exemption K-ETA jusqu'à fin 2026, e-Arrival Card, T-money, Naver Map et 8 phrases de survie avec audio natif — l'essentiel vérifié avant de partir.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'8 min',
 'sources':[
   ("Ambassade de Corée en France — prolongation de l'exemption K-ETA jusqu'au 31 déc. 2026","https://fra.mofa.go.kr/fr-fr/brd/m_9481/view.do?seq=758387"),
   ("France Diplomatie — Corée du Sud, entrée et séjour","https://www.diplomatie.gouv.fr/fr/information-par-pays/coree-du-sud/conseils-aux-voyageurs-entree-sejour"),
 ],
 'body':f'''
<p class="lead">Premier voyage en Corée ? Bonne nouvelle : c'est l'un des pays les plus simples à visiter — sûr, ponctuel, hyper connecté. Voici l'essentiel, vérifié sur les sources officielles, pour arriver serein·e à Incheon.</p>

<h2>1. Les formalités (mises à jour 2026)</h2>
<p>Pour les ressortissants français, pas de visa pour un séjour touristique de moins de 90 jours. Et bonne nouvelle confirmée par l'ambassade de Corée : <strong>l'exemption de K-ETA est prolongée jusqu'au 31 décembre 2026</strong> — tu n'as donc pas d'autorisation électronique à payer avant le départ.</p>
<p>Une formalité demeure : la <strong>e-Arrival Card</strong>, à remplir gratuitement en ligne dans les 3 jours précédant l'arrivée. Garde aussi une preuve de billet retour, parfois demandée à l'embarquement.</p>

<h2>2. L'argent : la T-money dès l'aéroport</h2>
<p>Premier achat utile : une carte <strong>T-money</strong>, vendue dans les supérettes (convenience stores) et aux distributeurs du métro. Elle règle métro, bus, taxis et petits achats, et se recharge en espèces aux bornes.</p>
<p>Les cartes Visa et Mastercard passent dans la grande majorité des commerces, mais garde un peu de liquide (50 000 ₩, soit environ 35 €) pour les marchés traditionnels et certains petits restaurants.</p>

<h2>3. Se déplacer : Naver Map plutôt que Google Maps</h2>
<p>Pour des raisons réglementaires liées aux données cartographiques, <strong>Google Maps fonctionne mal en Corée</strong> (pas d'itinéraires piétons ni voiture fiables). Les applications locales le remplacent avantageusement : <strong>Naver Map</strong> (interface disponible en anglais) pour les itinéraires, <strong>Kakao T</strong> pour commander un taxi. Astuce : enregistre l'adresse de ton logement en coréen pour la montrer au chauffeur.</p>
<p>Le métro de Séoul est remarquablement lisible : lignes numérotées et colorées, annonces multilingues, sorties numérotées. Savoir lire le Hangeul transforme l'expérience — <a href="hangeul.html">2 h 30 suffisent avec notre méthode</a>.</p>

<h2>4. Les 8 phrases qui changent tout</h2>
<p>Pas besoin d'être bilingue : ces huit phrases couvrent l'essentiel des situations. Touche le haut-parleur pour entendre la prononciation par une voix native :</p>
<div class="phrase-list">
  <div class="phrase">{kr('안녕하세요','annyeonghaseyo')}<span class="fr">Bonjour</span></div>
  <div class="phrase">{kr('감사합니다','gamsahamnida')}<span class="fr">Merci</span></div>
  <div class="phrase">{kr('얼마예요?','eolmayeyo?')}<span class="fr">C'est combien ?</span></div>
  <div class="phrase">{kr('화장실이 어디에 있어요?','hwajangsil-i eodie isseoyo?')}<span class="fr">Où sont les toilettes ?</span></div>
  <div class="phrase">{kr('물 주세요','mul juseyo')}<span class="fr">De l'eau, s'il vous plaît</span></div>
  <div class="phrase">{kr('천천히 말해 주세요','cheoncheonhi malhae juseyo')}<span class="fr">Parlez lentement, svp</span></div>
  <div class="phrase">{kr('도와주세요!','dowajuseyo!')}<span class="fr">Aidez-moi !</span></div>
  <div class="phrase">{kr('맛있어요','masisseoyo')}<span class="fr">C'est délicieux</span></div>
</div>

<h2>5. Où dormir à Séoul ?</h2>
<p><strong>Hongdae</strong> pour l'ambiance étudiante et la vie nocturne, <strong>Myeongdong</strong> pour le shopping et la centralité, <strong>Insadong / Bukchon</strong> pour les ruelles de hanok, <strong>Gangnam</strong> pour le Séoul contemporain. Pour un premier séjour, Hongdae et Myeongdong ont l'avantage d'être directement reliés à l'aéroport par la ligne AREX.</p>

<h2>6. À savoir avant de partir</h2>
<ul>
  <li><strong>Le pourboire ne se pratique pas</strong> — ni au restaurant, ni en taxi. Le prix affiché est le prix payé.</li>
  <li><strong>Les poubelles publiques sont rares</strong> : le tri sélectif est strict et chacun rapporte ses déchets. Prévois un petit sac.</li>
  <li><strong>Le métro ferme autour de minuit</strong> — vérifie le dernier train ou prévois Kakao T.</li>
  <li><strong>Pendant Seollal et Chuseok</strong> (fêtes lunaires), de nombreux commerces ferment et les trains longue distance affichent complet très tôt.</li>
</ul>

<div class="cta-inline">
  <strong>{ico('target',13)} Avant de décoller :</strong> nos histoires « <a href="histoire14.html">À l'aéroport d'Incheon</a> » et « <a href="histoire2.html">Au restaurant — Commander</a> » te mettent en situation réelle, audio natif compris.
</div>
'''},
{
 'slug':'blog-cuisine-coreenne-debutants', 'cat':'cuisine',
 'title':'10 plats coréens à goûter absolument (et comment les commander)',
 'desc':"Du bibimbap au bingsu : les plats incontournables, leur niveau de piquant, et la phrase exacte pour les commander — avec prononciation audio native.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'7 min',
 'sources':[
   ("Service du patrimoine de Corée (국가유산청) — Boknal et samgyetang","https://www.cha.go.kr/cop/bbs/selectBoardArticle.do?nttId=14484&bbsId=BBSMSTR_1008&mn=NS_01_09_01"),
   ("OhmyNews — pourquoi pajeon et makgeolli les jours de pluie","https://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=A0001153587"),
 ],
 'body':f'''
<p class="lead">La cuisine coréenne ne se résume pas au barbecue. Voici dix plats par lesquels commencer, leur niveau de piquant réel, et la phrase exacte pour les commander. Touche les haut-parleurs : chaque nom est prononcé par une voix native.</p>

<h2>Les essentiels</h2>
<div class="dish"><h3>1. {kr('비빔밥','bibimbap')} — le bol équilibré</h3>
<p>Riz, légumes assaisonnés, œuf, bœuf mariné et pâte de piment gochujang, à mélanger vigoureusement. Piquant ajustable, la sauce étant servie à part. La version de Jeonju, capitale historique du plat, est classée parmi les spécialités régionales les plus réputées du pays.</p></div>
<div class="dish"><h3>2. {kr('김치찌개','gimchi-jjigae')} — le ragoût de kimchi</h3>
<p>Kimchi mûr mijoté avec porc et tofu : le plat réconfort par excellence des tables familiales. Relevé, mais le riz blanc servi avec équilibre l'ensemble.</p></div>
<div class="dish"><h3>3. {kr('삼겹살','samgyeopsal')} — la poitrine de porc grillée</h3>
<p>On grille soi-même à table, puis on enroule dans une feuille de salade avec ail et pâte ssamjang. Doux, convivial, à partager.</p></div>
<div class="dish"><h3>4. {kr('떡볶이','tteokbokki')} — les bâtonnets de riz sauce piquante</h3>
<p>Référence absolue de la cuisine de rue : moelleux, sucré-épicé. C'est le plat le plus relevé de cette liste — il existe presque toujours une version « moins épicée » (덜 맵게).</p></div>
<div class="dish"><h3>5. {kr('김밥','gimbap')} — le rouleau du quotidien</h3>
<p>Riz et garnitures roulés dans une feuille d'algue. L'en-cas des pique-niques et des trajets, vendu partout en supérette. Aucun piquant. <a href="histoire35.html">Notre histoire « Le kimbap de Joon » t'apprend même à le préparer.</a></p></div>

<h2>Pour aller plus loin</h2>
<div class="dish"><h3>6. {kr('냉면','naengmyeon')} — les nouilles glacées</h3>
<p>Nouilles de sarrasin servies dans un bouillon froid, parfois avec des glaçons. Déroutant sur le papier, très recherché pendant l'été humide.</p></div>
<div class="dish"><h3>7. {kr('삼계탕','samgyetang')} — le poulet au ginseng</h3>
<p>Un jeune poulet farci de riz gluant, ginseng et jujube, servi en bouillon brûlant. Selon le Service du patrimoine de Corée, il se déguste traditionnellement lors des <em>boknal</em> (삼복), les trois journées réputées les plus chaudes de l'été lunaire — en vertu du principe {kr('이열치열','iyeol-chiyeol')}, « traiter la chaleur par la chaleur ».</p></div>
<div class="dish"><h3>8. {kr('치킨','chikin')} — le poulet frit coréen</h3>
<p>Double friture, croûte fine, déclinaisons sucrées-salées. Associé à une bière, il forme le fameux <em>chimaek</em> (치맥), très présent dans les parcs au bord du fleuve Han à la belle saison.</p></div>
<div class="dish"><h3>9. {kr('파전','pajeon')} — la galette aux oignons verts</h3>
<p>La presse coréenne s'est souvent penchée sur cette habitude documentée : les jours de pluie, les commandes de pajeon et de makgeolli grimpent. Les explications avancées tiennent à l'histoire agricole (jour de pluie = pause des champs, farine de blé disponible l'été) et au crépitement de la pâte qui rappelle celui de l'averse.</p></div>
<div class="dish"><h3>10. {kr('빙수','bingsu')} — la glace pilée généreuse</h3>
<p>Neige de lait surmontée de haricots rouges (le classique 팥빙수) ou de fruits. Un dessert d'été à partager, souvent spectaculaire.</p></div>

<h2>Commander comme un local</h2>
<p>La formule tient en deux mots — le nom du plat suivi de {kr('주세요','juseyo')} (« s'il vous plaît ») :</p>
<div class="phrase-list">
  <div class="phrase">{kr('김치찌개 주세요','gimchi-jjigae juseyo')}<span class="fr">Un kimchi-jjigae, svp</span></div>
  <div class="phrase">{kr('메뉴 주세요','menyu juseyo')}<span class="fr">Le menu, svp</span></div>
  <div class="phrase">{kr('물 주세요','mul juseyo')}<span class="fr">De l'eau, svp</span></div>
</div>
<p>Bon à savoir : l'eau et les <em>banchan</em> (accompagnements) sont inclus et généralement resservis à la demande. Pour appeler le personnel, un {kr('저기요!','jeogiyo!')} clair est parfaitement poli — certaines tables disposent même d'une sonnette d'appel.</p>

<div class="cta-inline">
  <strong>{ico('target',13)} Envie de pratiquer ?</strong> La leçon « <a href="lecon10.html">La nourriture coréenne</a> » (40 mots, audio natif) et l'histoire « <a href="histoire2.html">Au restaurant — Commander</a> » préparent ta première commande réelle.
</div>
'''},
{
 'slug':'blog-etiquette-coreenne', 'cat':'culture',
 'title':'Étiquette coréenne : 12 usages pour se sentir à l\'aise',
 'desc':"Les deux mains, les chaussures, le pourboire, la place des aînés : les codes sociaux coréens expliqués sans clichés, utiles en voyage comme devant tes dramas.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'6 min',
 'sources':[
   ("Organisation du tourisme coréen — étiquette et culture","https://english.visitkorea.or.kr/svc/main/index.do"),
 ],
 'body':f'''
<p class="lead">Comme partout, les codes sociaux coréens s'apprennent vite sur place, et personne n'attend d'un visiteur qu'il soit parfait. Connaître ces douze usages t'évitera simplement les hésitations — et montrera un respect qui est toujours remarqué et apprécié.</p>

<h2>À table</h2>
<p><strong>1. Donner et recevoir à deux mains.</strong> Un verre, un cadeau, une carte bancaire : l'objet se tend à deux mains, ou une main soutenant l'avant-bras. C'est le geste de respect le plus visible du quotidien.</p>
<p><strong>2. On ne remplit pas son propre verre.</strong> Lors d'un repas arrosé, chacun sert les autres. Face à une personne plus âgée, beaucoup tournent légèrement la tête en buvant — un usage encore très répandu, notamment en contexte professionnel.</p>
<p><strong>3. Les aînés commencent.</strong> On attend que la personne la plus âgée entame le repas. Dire {kr('잘 먹겠습니다','jal meokgesseumnida')} (« je vais bien manger ») avant de commencer est une politesse toujours bienvenue.</p>
<p><strong>4. Les baguettes ne se plantent pas dans le riz.</strong> Le geste évoque les bâtonnets d'encens des rites funéraires. On les pose sur le bol ou sur un repose-baguettes.</p>
<p><strong>5. Se moucher à table se fait discrètement ailleurs.</strong> Si besoin, on s'éclipse un instant — c'est une question de délicatesse plus que d'interdit.</p>

<h2>Au quotidien</h2>
<p><strong>6. Les chaussures s'enlèvent à l'intérieur.</strong> Chez les particuliers, dans certains restaurants traditionnels au sol surélevé et dans les temples : des chaussures alignées à l'entrée sont le signal.</p>
<p><strong>7. Le pourboire n'existe pas.</strong> Restaurant, café, taxi : le prix affiché est le prix final. Insister peut mettre l'interlocuteur dans l'embarras.</p>
<p><strong>8. Le salut s'accompagne d'une inclinaison.</strong> Un signe de tête suffit entre pairs ; l'inclinaison se fait plus marquée envers une personne âgée ou dans un cadre formel. Le geste devient naturel en quelques jours.</p>
<p><strong>9. Le métro est un espace calme.</strong> Conversations à voix basse, appels écourtés, et sièges prioritaires laissés libres — même quand la rame est pleine.</p>

<h2>Dans les relations</h2>
<p><strong>10. La question de l'âge vient tôt — et ce n'est pas de l'indiscrétion.</strong> La langue coréenne ajuste ses formes de politesse selon la relation d'âge : savoir qui est l'aîné permet simplement de bien se parler. Réponds avec le sourire.</p>
<p><strong>11. Le compliment s'accueille avec modestie.</strong> À « tu parles bien coréen ! », une réponse comme {kr('아직 멀었어요','ajik meoreosseoyo')} (« il me reste du chemin ») est plus idiomatique qu'un merci frontal.</p>
<p><strong>12. Les cadeaux ont leur chorégraphie.</strong> Un présent peut être poliment décliné une fois avant d'être accepté, et il s'ouvre rarement devant la personne — sauf invitation explicite.</p>

<h2>Pourquoi la langue rend tout cela limpide</h2>
<p>Ces usages ne sont pas un folklore plaqué : ils sont inscrits dans la grammaire même du coréen, qui distingue des registres de politesse entiers. C'est en apprenant la langue qu'on comprend de l'intérieur quand s'incliner, comment s'adresser à un aîné, et ce que recouvrent les termes comme 언니, 오빠 ou 선배. Notre leçon « <a href="lecon32.html">존댓말 vs 반말</a> » et l'histoire « <a href="histoire40.html">Le premier hoesik d'Emma</a> » te plongent dans ces situations.</p>

<div class="cta-inline">
  <strong>{ico('target',13)} Pour aller plus loin :</strong> l'anecdote « <a href="anecdote3.html">Oppa, Unnie, Sunbae</a> » décortique les termes d'adresse, et la fiche <a href="pdf/culture-a2.html">Culture & Société</a> se télécharge gratuitement.
</div>
'''},
{
 'slug':'blog-combien-temps-apprendre-coreen', 'cat':'etudier',
 'title':'Combien de temps pour apprendre le coréen ? Un plan réaliste',
 'desc':"Hangeul en une semaine, conversation simple en 6 mois, B1 en 18 mois : des jalons honnêtes selon ton rythme, et le plan concret pour y arriver.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'7 min',
 'sources':[
   ("Institut national de la langue coréenne (국립국어원) — le système Hangeul","https://www.korean.go.kr/"),
 ],
 'body':f'''
<p class="lead">« Le coréen, c'est difficile ? » Réponse honnête : l'alphabet est l'un des plus accessibles au monde, la grammaire demande un vrai déclic, et la régularité compte plus que le talent. Voici des jalons réalistes, sans promesse marketing.</p>

<h2>Semaine 1 : lire le Hangeul</h2>
<p>Promulgué en 1446 sous le roi Sejong pour être appris par tous, le Hangeul compte 24 lettres de base aux formes logiques — ㅁ évoque une bouche, ㄴ la langue touchant le palais. En <strong>2 à 3 heures réparties sur une semaine</strong>, on déchiffre enseignes, menus et noms de stations. C'est le meilleur retour sur investissement de tout l'apprentissage : il débloque aussi d'emblée les nombreux mots d'emprunt du coréen moderne (커피, 버스, 호텔…).</p>

<h2>Mois 1-3 : le niveau « survie » (A1)</h2>
<p>À raison de <strong>15 minutes par jour</strong> : salutations, présentation, les deux systèmes de nombres, commander ({kr('물 주세요','mul juseyo')}), demander son chemin ({kr('화장실이 어디에 있어요?','hwajangsil-i eodie isseoyo?')}), particules de base. De quoi voyager confortablement et tenir ses premiers mini-dialogues.</p>

<h2>Mois 4-9 : la conversation simple (A2)</h2>
<p>Le palier le plus gratifiant : passé et futur, exprimer l'envie et l'opinion, raconter sa journée. C'est aussi le moment où les dramas « s'ouvrent » — des phrases entières deviennent reconnaissables. Compte <strong>6 à 9 mois à 20 minutes par jour</strong>.</p>

<h2>Année 2 : l'autonomie (B1)</h2>
<p>Discours indirect, registres de politesse, conditionnel : on peut évoluer dans un environnement coréen simple et viser le TOPIK 3. Le B1 demande <strong>12 à 24 mois</strong> selon l'intensité — c'est statistiquement le palier où l'on décroche, et c'est précisément pourquoi notre niveau B1 privilégie les histoires immersives aux listes à mémoriser.</p>

<h2>Ce qui accélère vraiment</h2>
<ul>
  <li><strong>La régularité absolue :</strong> 15 minutes quotidiennes battent 2 heures dominicales — la courbe de l'oubli ne négocie pas.</li>
  <li><strong>L'audio natif dès le premier jour :</strong> apprendre chaque mot avec sa vraie prononciation évite des mois de correction. Toutes nos activités utilisent des voix natives.</li>
  <li><strong>Taper en coréen :</strong> chercher ses mots sur Naver, écrire à des correspondants — le clavier ancre le vocabulaire. <a href="ecriture.html">Notre atelier l'enseigne sans rien installer.</a></li>
  <li><strong>La répétition espacée :</strong> revoir un mot juste avant de l'oublier. C'est le rôle du <a href="daily-mix.html">Mix du jour</a> et des <a href="revision.html">révisions SRS</a>.</li>
</ul>

<h2>Le plan type qui fonctionne</h2>
<ol>
  <li><strong>Jours 1-7 :</strong> le <a href="hangeul.html">module Hangeul</a> complet (2 h 30 au total).</li>
  <li><strong>Ensuite, chaque jour :</strong> une activité du <a href="cours.html">parcours</a> (10-20 min) + le Mix du jour (3 min).</li>
  <li><strong>Chaque semaine :</strong> une histoire en mode « Écouter » pour l'oreille, une série à l'atelier clavier pour les doigts.</li>
</ol>
<p>Ce rythme mène à la conversation simple en six mois — gratuitement, sans publicité, avec de vraies voix coréennes.</p>

<div class="cta-inline">
  <strong>{ico('target',13)} Prêt·e ?</strong> <a href="cours.html">Commence le parcours maintenant</a> — la première leçon prend dix minutes.
</div>
'''},
]

def page(a):
    cat = CATS[a['cat']]
    ph = PHOTOS[a['cat']]
    others = [x for x in ARTICLES if x['slug'] != a['slug']][:2]
    related = ''.join(f'''<a class="rel-card" href="{o['slug']}.html">
      <span class="rel-cat" style="color:{CATS[o['cat']]['color']}">{ico(CATS[o['cat']]['icon'],12)} {CATS[o['cat']]['label']}</span>
      <span class="rel-t">{o['title']}</span>
    </a>''' for o in others)
    sources = ''.join(f'<li><a href="{u}" rel="noopener nofollow" target="_blank">{t}</a></li>' for t,u in a.get('sources',[]))
    ld = json.dumps({
      "@context":"https://schema.org","@type":"Article",
      "headline":a['title'],"description":a['desc'],
      "datePublished":a['date'],"inLanguage":"fr",
      "image":ph['url'],
      "author":{"@type":"Organization","name":"Korean Stories"},
      "publisher":{"@type":"Organization","name":"Korean Stories","url":"https://koreanstories.fr"},
      "mainEntityOfPage":f"https://koreanstories.fr/{a['slug']}.html"
    }, ensure_ascii=False)
    return f'''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{a['title']} · Blog Korean Stories</title>
  <meta name="description" content="{a['desc']}"/>
  <link rel="canonical" href="https://koreanstories.fr/{a['slug']}.html"/>
  <meta property="og:title" content="{a['title']}"/>
  <meta property="og:description" content="{a['desc']}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:url" content="https://koreanstories.fr/{a['slug']}.html"/>
  <meta property="og:image" content="{ph['url']}"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <script type="application/ld+json">{ld}</script>
  <link rel="stylesheet" href="design.css">
  <style>
    body{{font-family:'Inter',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--t)}}
    .art{{max-width:680px;margin:0 auto;padding:20px 18px 60px}}
    .backlink{{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--t2);text-decoration:none;border:1.5px solid var(--bd2);border-radius:100px;padding:7px 14px;margin-bottom:16px}}
    .backlink:hover{{color:var(--gold);border-color:var(--goldbd)}}
    .crumb{{font-size:11.5px;color:var(--t3);margin-bottom:14px}}
    .crumb a{{color:var(--t2);text-decoration:none}}
    .crumb a:hover{{color:var(--gold)}}
    .art-cat{{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:{cat['color']};background:color-mix(in srgb,{cat['color']} 10%, transparent);border:1px solid color-mix(in srgb,{cat['color']} 28%, transparent);border-radius:100px;padding:4px 12px;margin-bottom:12px}}
    h1{{font-family:'Playfair Display',serif;font-size:clamp(24px,5.4vw,34px);line-height:1.25;margin:0 0 10px;color:var(--t)}}
    .art-meta{{font-size:12px;color:var(--t3);margin-bottom:18px;display:flex;gap:14px;flex-wrap:wrap;align-items:center}}
    .art-meta span{{display:inline-flex;align-items:center;gap:5px}}
    .hero-photo{{margin:0 0 6px;border-radius:18px;overflow:hidden;border:1.5px solid var(--bd)}}
    .hero-photo img{{width:100%;height:auto;display:block;aspect-ratio:16/9;object-fit:cover}}
    .photo-credit{{font-size:10.5px;color:var(--t3);margin:6px 2px 20px;display:flex;align-items:center;gap:5px}}
    .photo-credit a{{color:var(--t3)}}
    .lead{{font-size:16px;color:var(--t2);line-height:1.75;border-left:3px solid {cat['color']};padding-left:14px;margin-bottom:22px}}
    h2{{font-family:'Playfair Display',serif;font-size:21px;margin:30px 0 10px;color:var(--t)}}
    h3{{font-size:16px;margin:20px 0 6px;color:var(--t)}}
    p,li{{font-size:14.5px;line-height:1.8;color:var(--t2)}}
    p{{margin:0 0 14px}}
    ul,ol{{padding-left:20px;margin:0 0 14px}}
    li{{margin-bottom:8px}}
    strong{{color:var(--t)}}
    a{{color:{cat['color']};text-decoration:underline;text-underline-offset:2px}}
    .kr{{font-weight:700;color:{cat['color']};font-size:1.06em}}
    .rom{{font-style:italic;color:var(--t3);font-size:.86em;font-weight:400}}
    .spk{{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:color-mix(in srgb,{cat['color']} 12%, transparent);border:1px solid color-mix(in srgb,{cat['color']} 30%, transparent);border-radius:50%;cursor:pointer;margin:0 4px;vertical-align:-6px}}
    .spk svg{{width:11px;height:11px;stroke:{cat['color']};fill:none;stroke-width:2.4;stroke-linecap:round}}
    .spk.playing{{background:{cat['color']}}}
    .spk.playing svg{{stroke:#fff}}
    .phrase-list{{background:var(--surf);border:1.5px solid var(--bd);border-radius:16px;padding:8px 16px;margin:14px 0 20px}}
    .phrase{{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd);font-size:14.5px;flex-wrap:wrap}}
    .phrase:last-child{{border-bottom:none}}
    .phrase .fr{{color:var(--t2);font-size:13px}}
    .dish{{margin-bottom:18px}}
    .dish p{{margin-bottom:6px}}
    .cta-inline{{background:linear-gradient(135deg,rgba(184,146,78,.10),rgba(184,146,78,.04));border:1.5px solid rgba(184,146,78,.3);border-radius:16px;padding:16px 18px;margin:26px 0 8px;font-size:14px;line-height:1.7;color:var(--t2)}}
    .cta-inline a{{color:var(--gold-text,#8B6B3D);font-weight:700}}
    .sources{{margin-top:26px;background:var(--s2);border:1.5px solid var(--bd);border-radius:14px;padding:14px 18px}}
    .sources .s-t{{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:8px;display:flex;align-items:center;gap:6px}}
    .sources ul{{margin:0;padding-left:18px}}
    .sources li{{font-size:12.5px;margin-bottom:5px}}
    .sources a{{color:var(--t2)}}
    .art-foot{{margin-top:30px;border-top:1.5px solid var(--bd);padding-top:22px}}
    .rel-lbl{{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:10px}}
    .rel-grid{{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px}}
    @media(max-width:520px){{.rel-grid{{grid-template-columns:1fr}}}}
    .rel-card{{background:var(--surf);border:1.5px solid var(--bd);border-radius:14px;padding:13px 14px;text-decoration:none;display:block}}
    .rel-card:hover{{border-color:var(--goldbd)}}
    .rel-cat{{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}}
    .rel-t{{font-size:13.5px;font-weight:700;color:var(--t);line-height:1.4}}
    .big-cta{{display:block;background:linear-gradient(135deg,#0F1B2D,#1a2f4a);border-radius:18px;padding:22px 20px;text-align:center;color:#fff;text-decoration:none}}
    .big-cta .t{{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;display:block;margin-bottom:4px}}
    .big-cta .s{{font-size:12.5px;color:rgba(247,248,250,.6)}}
    .big-cta .b{{display:inline-block;background:var(--gold);color:#fff;border-radius:100px;padding:10px 24px;font-size:13px;font-weight:800;margin-top:14px}}
  </style>
<style>.bnav{{padding-left:2px;padding-right:2px}}.bni{{padding:6px 4px;min-width:0}}.bni span{{font-size:8px;letter-spacing:.02em}}</style>
<link rel="icon" type="image/png" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<link rel="apple-touch-icon" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
</head>
<body>
<nav class="bar">
  <a href="blog.html" class="bar-back"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Blog</a>
  <span class="bar-logo">Korean <em>Stories</em></span>
  <div class="bar-r">
    <button onclick="toggleTheme()" class="bar-theme" aria-label="Changer de thème">
      <svg class="ico-l" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      <svg class="ico-d" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
  </div>
</nav>
<div class="shell"><main class="main"><article class="art">
  <a class="backlink" href="blog.html">{ico('left',13,2.5)} Tous les articles</a>
  <div class="crumb"><a href="index.html">Accueil</a> › <a href="blog.html">Blog</a> › {cat['label']}</div>
  <div class="art-cat">{ico(cat['icon'],13)} {cat['label']}</div>
  <h1>{a['title']}</h1>
  <div class="art-meta"><span>{ico('cal',12)} {a['dateFr']}</span><span>{ico('clock',12)} {a['read']} de lecture</span><span>{ico('pen',12)} L'équipe Korean Stories</span></div>
  <figure class="hero-photo"><img src="{ph['url']}" alt="{ph['alt']}" loading="lazy" decoding="async" width="1280" height="720"></figure>
  <div class="photo-credit">{ico('camera',11)} Photo : {ph['credit']} · <a href="{ph['page']}" rel="noopener nofollow" target="_blank">{ph['lic']} via Wikimedia Commons</a></div>
  {a['body']}
  <div class="sources">
    <div class="s-t">{ico('link',11)} Sources & références</div>
    <ul>{sources}</ul>
  </div>
  <div class="art-foot">
    <div class="rel-lbl">À lire ensuite</div>
    <div class="rel-grid">{related}</div>
    <a class="big-cta" href="cours.html">
      <span class="t">Apprends le coréen gratuitement</span>
      <span class="s">200+ activités · 42 histoires audio · voix natives · sans publicité</span>
      <span class="b">Commencer le parcours {ico('right',12,2.5)}</span>
    </a>
  </div>
</article></main></div>
<nav class="bnav">
  <a href="app.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Accueil</span></a>
  <a href="cours.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><span>Cours</span></a>
  <a href="blog.html" class="bni act"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>Blog</span></a>
  <a href="challenge.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Défi</span></a>
  <a href="classement.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span>Records</span></a>
  <a href="profil.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profil</span></a>
</nav>
<script src="ks.js"></script>
<script>try{{const t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}</script>
</body></html>'''

# ═══════════ INDEX DU BLOG ═══════════
def blog_index():
    cards = ''
    for a in ARTICLES:
        c = CATS[a['cat']]
        ph = PHOTOS[a['cat']]
        cards += f'''    <a class="b-card" href="{a['slug']}.html" data-cat="{a['cat']}">
      <div class="b-banner"><img src="{ph['url']}" alt="" loading="lazy" decoding="async"></div>
      <div class="b-body">
        <span class="b-cat" style="color:{c['color']}">{ico(c['icon'],12)} {c['label']}</span>
        <span class="b-title">{a['title']}</span>
        <span class="b-desc">{a['desc']}</span>
        <span class="b-meta">{ico('cal',11)} {a['dateFr']} · {ico('clock',11)} {a['read']}</span>
      </div>
    </a>
'''
    chips = '<button class="fchip act" data-f="all">Tout</button>' + ''.join(
        f'<button class="fchip" data-f="{k}">{ico(v["icon"],12)} {v["label"]}</button>' for k,v in CATS.items())
    return f'''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Blog — Voyage, cuisine & culture coréenne · Korean Stories</title>
  <meta name="description" content="Guides pratiques et vérifiés pour voyager en Corée, découvrir la cuisine, comprendre la culture et bien apprendre la langue — par Korean Stories."/>
  <link rel="canonical" href="https://koreanstories.fr/blog.html"/>
  <meta property="og:title" content="Le blog Korean Stories — la Corée pratique"/>
  <meta property="og:description" content="Voyage, cuisine, culture, méthode : des guides utiles et gratuits sur la Corée, avec prononciations audio natives."/>
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <style>
    body{{font-family:'Inter',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--t)}}
    .wrap{{max-width:720px;margin:0 auto;padding:0 16px 60px}}
    .hero{{background:var(--navy);margin:0 -16px;padding:30px 20px 38px;text-align:center;position:relative;overflow:hidden}}
    .hero::after{{content:'';position:absolute;bottom:-1px;left:0;right:0;height:26px;background:var(--bg);border-radius:26px 26px 0 0}}
    .hero-tag{{display:inline-flex;align-items:center;gap:6px;background:rgba(201,169,110,.14);border:1px solid rgba(201,169,110,.3);color:var(--gold);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;border-radius:100px;padding:4px 13px;margin-bottom:12px}}
    .hero h1{{font-family:'Playfair Display',serif;color:#fff;font-size:clamp(24px,5.4vw,32px);margin:0 0 8px}}
    .hero h1 em{{color:var(--gold);font-style:italic}}
    .hero p{{font-size:13px;color:rgba(247,248,250,.55);margin:0;line-height:1.65}}
    .chips{{display:flex;gap:8px;overflow-x:auto;padding:18px 2px 4px;scrollbar-width:none}}
    .chips::-webkit-scrollbar{{display:none}}
    .chips .fchip{{display:inline-flex;align-items:center;gap:5px}}
    .grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}}
    @media(max-width:640px){{.grid{{grid-template-columns:1fr}}}}
    .b-card{{background:var(--surf);border:1.5px solid var(--bd);border-radius:18px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:transform .18s, box-shadow .18s}}
    .b-card:hover{{transform:translateY(-3px);box-shadow:var(--sh2);border-color:var(--goldbd)}}
    .b-card.hide{{display:none}}
    .b-banner{{height:130px;overflow:hidden;background:var(--s3)}}
    .b-banner img{{width:100%;height:100%;object-fit:cover;display:block}}
    .b-body{{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px}}
    .b-cat{{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}}
    .b-title{{font-size:15.5px;font-weight:800;color:var(--t);line-height:1.35}}
    .b-desc{{font-size:12.5px;color:var(--t2);line-height:1.55}}
    .b-meta{{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t3);margin-top:2px}}
    .soon{{text-align:center;font-size:12.5px;color:var(--t3);margin-top:26px;line-height:1.7}}
  </style>
<style>.bnav{{padding-left:2px;padding-right:2px}}.bni{{padding:6px 4px;min-width:0}}.bni span{{font-size:8px;letter-spacing:.02em}}</style>
<link rel="icon" type="image/png" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<link rel="apple-touch-icon" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
</head>
<body>
<nav class="bar">
  <a href="index.html" class="bar-back"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Accueil</a>
  <span class="bar-logo">Korean <em>Stories</em></span>
  <div class="bar-r">
    <button onclick="toggleTheme()" class="bar-theme" aria-label="Changer de thème">
      <svg class="ico-l" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      <svg class="ico-d" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
  </div>
</nav>
<div class="shell"><main class="main"><div class="wrap">
  <div class="hero">
    <div class="hero-tag">{ico('pen',11)} Le blog</div>
    <h1>La Corée <em>pratique</em></h1>
    <p>Voyage, cuisine, culture & méthode — des guides utiles, vérifiés et gratuits,<br/>avec les mots coréens prononcés par de vraies voix natives.</p>
  </div>
  <div class="chips" role="tablist" aria-label="Filtrer par thème">{chips}</div>
  <div class="grid" id="grid">
{cards}  </div>
  <p class="soon">De nouveaux articles arrivent régulièrement — quartiers de Séoul, fêtes traditionnelles, K-dramas pour apprendre…<br/>Une idée de sujet ? Écris-nous : <a href="mailto:contact@koreanstories.fr" style="color:var(--gold-text,#8B6B3D);font-weight:700">contact@koreanstories.fr</a></p>
</div></main></div>
<nav class="bnav">
  <a href="app.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Accueil</span></a>
  <a href="cours.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><span>Cours</span></a>
  <a href="blog.html" class="bni act"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>Blog</span></a>
  <a href="challenge.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Défi</span></a>
  <a href="classement.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span>Records</span></a>
  <a href="profil.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profil</span></a>
</nav>
<script src="ks.js"></script>
<script>
document.querySelectorAll('.fchip').forEach(ch => ch.addEventListener('click', () => {{
  document.querySelectorAll('.fchip').forEach(c => c.classList.remove('act'));
  ch.classList.add('act');
  const f = ch.dataset.f;
  document.querySelectorAll('.b-card').forEach(card => {{
    card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f);
  }});
}}));
try{{const t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}
</script>
</body></html>'''

open('blog.html','w',encoding='utf-8').write(blog_index())
print('OK blog.html')
for a in ARTICLES:
    open(a['slug']+'.html','w',encoding='utf-8').write(page(a))
    print('OK', a['slug']+'.html')
