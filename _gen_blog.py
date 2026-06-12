#!/usr/bin/env python3
"""Génère blog.html + les articles blog-*.html (template partagé)."""
import json

SPK = '<button class="spk" onclick="window.speak(\'{kr}\',this)" aria-label="Écouter {kr}"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>'
def kr(word, rom=''):
    r = f' <em class="rom">{rom}</em>' if rom else ''
    return f'<span class="kr">{word}</span>{SPK.format(kr=word)}{r}'

CATS = {
  'voyage':  {'label':'Voyage',  'emoji':'✈️', 'color':'#0d9488'},
  'cuisine': {'label':'Cuisine', 'emoji':'🍜', 'color':'#dc2626'},
  'culture': {'label':'Culture', 'emoji':'🏮', 'color':'#7c3aed'},
  'etudier': {'label':'Étudier', 'emoji':'📚', 'color':'#2563eb'},
}

ARTICLES = [
{
 'slug':'blog-premier-voyage-coree', 'cat':'voyage',
 'title':'Préparer son premier voyage en Corée : le guide pratique',
 'desc':"K-ETA, T-money, Naver Map, phrases de survie avec audio natif — tout ce qu'il faut savoir avant de poser le pied à Séoul.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'8 min',
 'body':f'''
<p class="lead">Premier voyage en Corée ? Bonne nouvelle : c'est l'un des pays les plus faciles à voyager au monde — sûr, ponctuel, hyper connecté. Mais quelques spécificités locales peuvent dérouter. Voici le guide qu'on aurait aimé avoir avant de partir.</p>

<h2>1. Avant de partir : les formalités</h2>
<p>Pour les Français, pas de visa pour un séjour touristique de moins de 90 jours, mais la <strong>K-ETA</strong> (autorisation électronique de voyage) peut être exigée selon les périodes — vérifie le site officiel <em>k-eta.go.kr</em> quelques semaines avant le départ. Compte une dizaine d'euros et une réponse sous 72 h. Garde aussi ton billet retour sous la main : il est parfois demandé à l'embarquement.</p>

<h2>2. L'argent : la T-money, ta meilleure amie</h2>
<p>Première chose à faire en arrivant : acheter une carte <strong>T-money</strong> dans n'importe quel konbini (supérette) ou distributeur du métro. Elle paie le métro, le bus, le taxi et même tes courses en supérette. Recharge-la en espèces aux bornes.</p>
<p>Les cartes Visa/Mastercard passent presque partout, mais garde toujours <strong>50 000 ₩ en espèces</strong> (~35 €) : certains marchés, pojangmacha (stands de rue) et petits restaurants n'acceptent que le liquide.</p>

<h2>3. Se déplacer : oublie Google Maps</h2>
<p>Le piège classique du voyageur : <strong>Google Maps ne fonctionne quasiment pas en Corée</strong> (restrictions cartographiques). Télécharge <strong>Naver Map</strong> (interface anglaise disponible) avant de partir — c'est l'app que tout le pays utilise. Pour les taxis, <strong>Kakao T</strong> est l'équivalent local d'Uber, et les chauffeurs ne parlent pas anglais : montre ta destination écrite en coréen.</p>
<p>Le métro de Séoul est un bijou : annonces en quatre langues, wifi gratuit, numérotation claire des sorties. Apprends juste à lire le Hangeul avant de partir — <a href="hangeul.html">2 h 30 suffisent avec notre méthode</a> — et tous les panneaux s'ouvrent à toi.</p>

<h2>4. Les 8 phrases qui changent tout</h2>
<p>Pas besoin d'être bilingue : ces huit phrases, prononcées même maladroitement, déclenchent des sourires immédiats. Touche le haut-parleur pour entendre la prononciation native :</p>
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
<p><strong>Hongdae</strong> pour l'ambiance jeune et la vie nocturne, <strong>Myeongdong</strong> pour le shopping et la proximité de tout, <strong>Insadong / Bukchon</strong> pour le charme traditionnel des hanok, <strong>Gangnam</strong> pour le côté moderne. Notre conseil pour un premier séjour : Hongdae ou Myeongdong, bien reliés à l'aéroport par l'AREX.</p>

<h2>6. Les pièges à éviter</h2>
<ul>
  <li><strong>Le pourboire :</strong> ça ne se fait pas. Laisser de l'argent sur la table crée un malaise — le serveur te courra après pour te le rendre.</li>
  <li><strong>Les poubelles publiques :</strong> quasi inexistantes. Garde un petit sac pour tes déchets, comme les locaux.</li>
  <li><strong>Le métro après minuit :</strong> il ferme ! Vérifie l'heure du dernier train ou prévois un Kakao T.</li>
  <li><strong>La période Chuseok / Seollal :</strong> pendant les grandes fêtes, beaucoup de commerces ferment et les transports longue distance sont pleins des semaines à l'avance.</li>
</ul>

<div class="cta-inline">
  <strong>🎯 Avant de décoller :</strong> nos histoires « <a href="histoire14.html">À l'aéroport d'Incheon</a> », « <a href="histoire2.html">Au restaurant</a> » et la fiche PDF <a href="pdf/seoul-map.html">Carte de Séoul</a> te mettent en situation réelle — gratuitement, audio natif compris.
</div>
'''},
{
 'slug':'blog-cuisine-coreenne-debutants', 'cat':'cuisine',
 'title':'10 plats coréens à goûter absolument (et comment les commander)',
 'desc':"Du bibimbap au bingsu : les plats incontournables, leur niveau de piquant, et la phrase exacte pour les commander — avec prononciation audio.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'7 min',
 'body':f'''
<p class="lead">La cuisine coréenne, c'est bien plus que le barbecue. Voici les 10 plats par lesquels commencer, leur niveau de piquant réel, et — surtout — comment les commander en coréen. Touche les haut-parleurs : chaque nom est prononcé par une voix native.</p>

<h2>Les essentiels</h2>
<div class="dish"><h3>1. {kr('비빔밥','bibimbap')} — le bol qui a tout compris</h3>
<p>Riz, légumes, œuf, bœuf mariné et gochujang à mélanger vigoureusement. 🌶️ Piquant ajustable (la sauce est à part). L'option parfaite pour un premier repas.</p></div>
<div class="dish"><h3>2. {kr('김치찌개','gimchi-jjigae')} — le ragoût de kimchi</h3>
<p>LE plat réconfort des Coréens : kimchi mûr mijoté avec porc et tofu. 🌶️🌶️ Ça pique franchement, mais le riz blanc équilibre tout.</p></div>
<div class="dish"><h3>3. {kr('삼겹살','samgyeopsal')} — la poitrine de porc grillée</h3>
<p>Le barbecue social par excellence : on grille soi-même, on enroule dans une feuille de salade avec ail et ssamjang. 🌶️ Doux. À partager obligatoirement.</p></div>
<div class="dish"><h3>4. {kr('떡볶이','tteokbokki')} — les bâtonnets de riz sauce rouge</h3>
<p>Street-food culte : moelleux, sucré-épicé, addictif. 🌶️🌶️🌶️ Le vrai test du palais — commence par la version « moins épicée ».</p></div>
<div class="dish"><h3>5. {kr('김밥','gimbap')} — le rouleau du quotidien</h3>
<p>Riz et garnitures roulés dans une algue. Le casse-croûte des pique-niques, à 3 000 ₩ dans n'importe quel konbini. 🌶️ Zéro piquant. <a href="histoire35.html">On t'apprend même à le faire dans une histoire.</a></p></div>

<h2>Pour aller plus loin</h2>
<div class="dish"><h3>6. {kr('냉면','naengmyeon')} — les nouilles glacées</h3>
<p>Nouilles de sarrasin dans un bouillon GLACÉ avec glaçons. Bizarre sur le papier, divin par 35 °C en août.</p></div>
<div class="dish"><h3>7. {kr('삼계탕','samgyetang')} — le poulet au ginseng</h3>
<p>Un poulet entier farci de riz gluant, ginseng et jujube, servi bouillonnant. Les Coréens le mangent les jours les PLUS chauds de l'été — combattre le feu par le feu.</p></div>
<div class="dish"><h3>8. {kr('치킨','chikin')} — le poulet frit coréen</h3>
<p>Double friture, croûte fine, sauces folles. Avec une bière, ça devient le 치맥 (chimaek) — institution nationale, surtout livré au bord du fleuve Han.</p></div>
<div class="dish"><h3>9. {kr('파전','pajeon')} — la galette aux oignons verts</h3>
<p>La crêpe salée des jours de pluie : quand il pleut, les Coréens mangent du pajeon avec du makgeolli. Vraiment. C'est culturel.</p></div>
<div class="dish"><h3>10. {kr('빙수','bingsu')} — la montagne de glace pilée</h3>
<p>Le dessert d'été : neige de lait, haricots rouges ou mangue, parfois 30 cm de haut. Prévois deux cuillères.</p></div>

<h2>Commander comme un local</h2>
<p>La formule magique tient en deux mots — le plat + {kr('주세요','juseyo')} (« s'il vous plaît ») :</p>
<div class="phrase-list">
  <div class="phrase">{kr('김치찌개 주세요','gimchi-jjigae juseyo')}<span class="fr">Un kimchi-jjigae, svp</span></div>
  <div class="phrase">{kr('메뉴 주세요','menyu juseyo')}<span class="fr">Le menu, svp</span></div>
  <div class="phrase">{kr('물 주세요','mul juseyo')}<span class="fr">De l'eau, svp (gratuite partout !)</span></div>
</div>
<p>Bon à savoir : l'eau et les <em>banchan</em> (petits accompagnements) sont gratuits et resservis à volonté. Et on appelle le serveur d'un franc {kr('저기요!','jeogiyo!')} — pas de malaise, c'est la norme.</p>

<div class="cta-inline">
  <strong>🍜 Envie de pratiquer ?</strong> La leçon « <a href="lecon10.html">La nourriture coréenne</a> » (40 mots, audio natif) et l'histoire « <a href="histoire2.html">Au restaurant — Commander</a> » te préparent à ta première commande réelle.
</div>
'''},
{
 'slug':'blog-etiquette-coreenne', 'cat':'culture',
 'title':'Étiquette coréenne : 12 règles pour ne pas faire de faux pas',
 'desc':"Deux mains, chaussures, pourboire, aînés : les codes sociaux coréens expliqués simplement — pour voyager ou regarder tes dramas autrement.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'6 min',
 'body':f'''
<p class="lead">La Corée est un pays où la politesse est une grammaire sociale à part entière — elle est même intégrée dans la langue. Pas de panique : on pardonne tout aux étrangers. Mais connaître ces 12 codes te fera passer du statut de touriste à celui d'invité respecté.</p>

<h2>À table</h2>
<p><strong>1. Les deux mains.</strong> On donne et on reçoit (un verre, un cadeau, sa carte bancaire) à deux mains, ou une main soutenant l'autre bras. C'est LE réflexe à prendre.</p>
<p><strong>2. On ne se sert jamais à boire soi-même.</strong> Tu remplis le verre des autres, ils remplissent le tien. Devant un aîné, on tourne légèrement la tête en buvant.</p>
<p><strong>3. Les aînés d'abord.</strong> On attend que la personne la plus âgée commence à manger. Dire {kr('잘 먹겠습니다','jal meokgesseumnida')} (« je vais bien manger ») avant le repas fait toujours plaisir.</p>
<p><strong>4. Les baguettes ne se plantent pas dans le riz.</strong> Jamais : ça évoque l'encens des funérailles. Pose-les sur le bol ou le repose-baguettes.</p>
<p><strong>5. Se moucher à table : non.</strong> Renifler discrètement est mieux accepté que sortir le mouchoir. Va aux toilettes si besoin.</p>

<h2>Au quotidien</h2>
<p><strong>6. Les chaussures s'enlèvent.</strong> Chez quelqu'un, dans certains restaurants traditionnels, dans les temples : déchausse-toi dès que tu vois des chaussures alignées à l'entrée ou un sol surélevé.</p>
<p><strong>7. Pas de pourboire.</strong> Ni au restaurant, ni au taxi, ni au café. Insister mettrait ton interlocuteur mal à l'aise.</p>
<p><strong>8. L'inclinaison.</strong> Un léger signe de tête suffit pour saluer ou remercier. Plus la personne est âgée ou importante, plus on s'incline. Tu le feras naturellement au bout de trois jours.</p>
<p><strong>9. Le métro silencieux.</strong> On parle bas, on ne téléphone pas, et les sièges colorés sont réservés (personnes âgées, femmes enceintes) — même vides, on ne s'y assoit pas.</p>

<h2>Dans les relations</h2>
<p><strong>10. L'âge n'est pas une question indiscrète.</strong> On te demandera ton âge très vite : c'est pour savoir comment te parler (le niveau de politesse de la langue en dépend !). Réponds simplement.</p>
<p><strong>11. Le compliment se refuse d'abord.</strong> « Tu parles bien coréen ! » → réponds modestement {kr('아직 멀었어요','ajik meoreosseoyo')} (« j'ai encore du chemin ») plutôt qu'un merci frontal. Modestie d'abord.</p>
<p><strong>12. Les cadeaux se donnent… et se refusent une fois.</strong> Refuser poliment une première fois avant d'accepter fait partie du jeu. Et on n'ouvre pas le cadeau devant la personne, sauf si elle insiste.</p>

<h2>Pourquoi la langue rend tout ça plus simple</h2>
<p>Ces codes peuvent sembler abstraits — mais ils sont <em>dans la langue</em>. Le coréen possède des registres entiers de politesse : c'est en l'apprenant qu'on comprend vraiment quand s'incliner, comment s'adresser à un aîné, pourquoi 언니 / 오빠 / 선배 structurent les relations. Notre leçon « <a href="lecon32.html">존댓말 vs 반말</a> » et l'histoire « <a href="histoire40.html">Le premier hoesik d'Emma</a> » te plongent dans ces situations réelles.</p>

<div class="cta-inline">
  <strong>🏮 Pour aller plus loin :</strong> l'anecdote « <a href="anecdote3.html">Oppa, Unnie, Sunbae</a> » décortique la hiérarchie sociale coréenne, et la fiche <a href="pdf/culture-a2.html">Culture & Société</a> est téléchargeable gratuitement.
</div>
'''},
{
 'slug':'blog-combien-temps-apprendre-coreen', 'cat':'etudier',
 'title':'Combien de temps pour apprendre le coréen ? Un plan réaliste',
 'desc':"Hangeul en 1 semaine, conversation en 6 mois, B1 en 18 mois : ce qui est vraiment possible selon ton rythme, et le plan exact pour y arriver.",
 'date':'2026-06-12','dateFr':'12 juin 2026','read':'7 min',
 'body':f'''
<p class="lead">« Le coréen, c'est dur ? » La vraie réponse : l'alphabet est l'un des plus faciles au monde, la grammaire demande un déclic, et la régularité bat le talent à plate couture. Voici des jalons honnêtes — sans promesse marketing.</p>

<h2>Semaine 1 : lire le Hangeul (oui, vraiment)</h2>
<p>Le Hangeul a été conçu au XVᵉ siècle pour être appris par tous : 24 lettres de base, des formes logiques (ㅁ = une bouche, ㄴ = une langue qui touche le palais). En <strong>2 à 3 heures réparties sur une semaine</strong>, tu déchiffres tout — les enseignes, les menus, les noms de stations. C'est le meilleur retour sur investissement de tout ton apprentissage, et ça débloque immédiatement 10 % du vocabulaire moderne (le Konglish : 커피, 버스, 호텔…).</p>

<h2>Mois 1-3 : niveau « survie » (A1)</h2>
<p>À raison de <strong>15 minutes par jour</strong> : salutations, se présenter, les deux systèmes de chiffres, commander ({kr('물 주세요','mul juseyo')}), demander son chemin ({kr('화장실이 어디에 있어요?','hwajangsil-i eodie isseoyo?')}), les particules de base. De quoi voyager confortablement et tenir tes premiers mini-dialogues.</p>

<h2>Mois 4-9 : la conversation simple (A2)</h2>
<p>Le palier où tout devient amusant : passé et futur, exprimer l'envie et l'opinion, raconter sa journée. C'est aussi le moment où les K-dramas commencent à « s'ouvrir » — tu attrapes des phrases entières. Compte <strong>6 à 9 mois à 20 min/jour</strong>.</p>

<h2>Année 2 : l'autonomie (B1)</h2>
<p>Discours indirect, niveaux de politesse, conditionnel : tu peux travailler dans un environnement coréen simple, suivre une conversation de groupe, viser le TOPIK 3. Le B1 demande <strong>12 à 24 mois</strong> selon l'intensité — c'est là que la plupart des apprenants décrochent, et c'est exactement pour ça que notre niveau B1 est rempli d'histoires immersives plutôt que de listes.</p>

<h2>Ce qui accélère (vraiment)</h2>
<ul>
  <li><strong>La régularité absolue :</strong> 15 min/jour > 2 h le dimanche. La courbe de l'oubli est implacable ; les streaks existent pour ça.</li>
  <li><strong>L'audio natif dès le premier jour :</strong> apprendre un mot avec sa vraie prononciation évite des mois de correction. (Toutes nos activités ont des voix natives, pas de synthèse robotique.)</li>
  <li><strong>Taper en coréen :</strong> chercher ses mots sur Naver, écrire à des Coréens — le clavier ancre le vocabulaire. <a href="ecriture.html">Notre atelier l'enseigne sans rien installer.</a></li>
  <li><strong>La révision espacée :</strong> revoir un mot juste avant de l'oublier. C'est le rôle du <a href="daily-mix.html">Mix du jour</a> et des <a href="revision.html">révisions SRS</a>.</li>
</ul>

<h2>Le plan type qui fonctionne</h2>
<p>Notre recommandation pour démarrer aujourd'hui :</p>
<ol>
  <li><strong>Jours 1-7 :</strong> le <a href="hangeul.html">module Hangeul</a> complet (2 h 30 au total).</li>
  <li><strong>Ensuite, chaque jour :</strong> une activité du <a href="cours.html">parcours</a> (10-20 min) + le Mix du jour (3 min).</li>
  <li><strong>Chaque semaine :</strong> une histoire en mode « Écouter » pour l'oreille, une série à l'atelier clavier pour les doigts.</li>
</ol>
<p>Ce rythme t'amène au niveau conversation simple en 6 mois — gratuitement, sans publicité, et avec de vraies voix coréennes.</p>

<div class="cta-inline">
  <strong>📚 Prêt·e ?</strong> <a href="cours.html">Commence le parcours maintenant</a> — la première leçon prend 10 minutes, et le Hangeul n'attendra pas.
</div>
'''},
]

def page(a):
    cat = CATS[a['cat']]
    others = [x for x in ARTICLES if x['slug'] != a['slug']][:2]
    related = ''.join(f'''<a class="rel-card" href="{o['slug']}.html">
      <span class="rel-cat" style="color:{CATS[o['cat']]['color']}">{CATS[o['cat']]['emoji']} {CATS[o['cat']]['label']}</span>
      <span class="rel-t">{o['title']}</span>
    </a>''' for o in others)
    ld = json.dumps({
      "@context":"https://schema.org","@type":"Article",
      "headline":a['title'],"description":a['desc'],
      "datePublished":a['date'],"inLanguage":"fr",
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
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <script type="application/ld+json">{ld}</script>
  <link rel="stylesheet" href="design.css">
  <style>
    body{{font-family:'Inter',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--t)}}
    .art{{max-width:680px;margin:0 auto;padding:20px 18px 60px}}
    .crumb{{font-size:11.5px;color:var(--t3);margin-bottom:14px}}
    .crumb a{{color:var(--t2);text-decoration:none}}
    .crumb a:hover{{color:var(--gold)}}
    .art-cat{{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:{cat['color']};background:color-mix(in srgb,{cat['color']} 10%, transparent);border:1px solid color-mix(in srgb,{cat['color']} 28%, transparent);border-radius:100px;padding:4px 12px;margin-bottom:12px}}
    h1{{font-family:'Playfair Display',serif;font-size:clamp(24px,5.4vw,34px);line-height:1.25;margin:0 0 10px;color:var(--t)}}
    .art-meta{{font-size:12px;color:var(--t3);margin-bottom:22px;display:flex;gap:12px;flex-wrap:wrap}}
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
    .art-foot{{margin-top:34px;border-top:1.5px solid var(--bd);padding-top:22px}}
    .rel-lbl{{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:10px}}
    .rel-grid{{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px}}
    @media(max-width:520px){{.rel-grid{{grid-template-columns:1fr}}}}
    .rel-card{{background:var(--surf);border:1.5px solid var(--bd);border-radius:14px;padding:13px 14px;text-decoration:none;display:block}}
    .rel-card:hover{{border-color:var(--goldbd)}}
    .rel-cat{{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}}
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
  <div class="crumb"><a href="index.html">Accueil</a> › <a href="blog.html">Blog</a> › {cat['label']}</div>
  <div class="art-cat">{cat['emoji']} {cat['label']}</div>
  <h1>{a['title']}</h1>
  <div class="art-meta"><span>📅 {a['dateFr']}</span><span>⏱ {a['read']} de lecture</span><span>✍️ L'équipe Korean Stories</span></div>
  {a['body']}
  <div class="art-foot">
    <div class="rel-lbl">À lire ensuite</div>
    <div class="rel-grid">{related}</div>
    <a class="big-cta" href="cours.html">
      <span class="t">Apprends le coréen gratuitement 🇰🇷</span>
      <span class="s">200+ activités · 42 histoires audio · voix natives · sans publicité</span>
      <span class="b">Commencer le parcours →</span>
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
        cards += f'''    <a class="b-card" href="{a['slug']}.html" data-cat="{a['cat']}">
      <div class="b-banner" style="background:linear-gradient(135deg,{c['color']},color-mix(in srgb,{c['color']} 55%, #0F1B2D))"><span aria-hidden="true">{c['emoji']}</span></div>
      <div class="b-body">
        <span class="b-cat" style="color:{c['color']}">{c['emoji']} {c['label']}</span>
        <span class="b-title">{a['title']}</span>
        <span class="b-desc">{a['desc']}</span>
        <span class="b-meta">📅 {a['dateFr']} · ⏱ {a['read']}</span>
      </div>
    </a>
'''
    chips = '<button class="fchip act" data-f="all">Tout</button>' + ''.join(
        f'<button class="fchip" data-f="{k}">{v["emoji"]} {v["label"]}</button>' for k,v in CATS.items())
    return f'''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Blog — Voyage, cuisine & culture coréenne · Korean Stories</title>
  <meta name="description" content="Guides pratiques pour voyager en Corée, découvrir la cuisine coréenne, comprendre la culture et bien apprendre la langue — par Korean Stories."/>
  <link rel="canonical" href="https://koreanstories.fr/blog.html"/>
  <meta property="og:title" content="Le blog Korean Stories — Corée pratique"/>
  <meta property="og:description" content="Voyage, cuisine, culture, méthode : des guides utiles et gratuits sur la Corée, avec prononciations audio natives."/>
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <style>
    body{{font-family:'Inter',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--t)}}
    .wrap{{max-width:720px;margin:0 auto;padding:0 16px 60px}}
    .hero{{background:var(--navy);margin:0 -16px;padding:30px 20px 38px;text-align:center;position:relative;overflow:hidden}}
    .hero::after{{content:'';position:absolute;bottom:-1px;left:0;right:0;height:26px;background:var(--bg);border-radius:26px 26px 0 0}}
    .hero-tag{{display:inline-block;background:rgba(201,169,110,.14);border:1px solid rgba(201,169,110,.3);color:var(--gold);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;border-radius:100px;padding:4px 13px;margin-bottom:12px}}
    .hero h1{{font-family:'Playfair Display',serif;color:#fff;font-size:clamp(24px,5.4vw,32px);margin:0 0 8px}}
    .hero h1 em{{color:var(--gold);font-style:italic}}
    .hero p{{font-size:13px;color:rgba(247,248,250,.55);margin:0;line-height:1.65}}
    .chips{{display:flex;gap:8px;overflow-x:auto;padding:18px 2px 4px;scrollbar-width:none}}
    .chips::-webkit-scrollbar{{display:none}}
    .grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}}
    @media(max-width:640px){{.grid{{grid-template-columns:1fr}}}}
    .b-card{{background:var(--surf);border:1.5px solid var(--bd);border-radius:18px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:transform .18s, box-shadow .18s}}
    .b-card:hover{{transform:translateY(-3px);box-shadow:var(--sh2);border-color:var(--goldbd)}}
    .b-card.hide{{display:none}}
    .b-banner{{height:86px;display:flex;align-items:center;justify-content:center;font-size:40px}}
    .b-body{{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px}}
    .b-cat{{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}}
    .b-title{{font-size:15.5px;font-weight:800;color:var(--t);line-height:1.35}}
    .b-desc{{font-size:12.5px;color:var(--t2);line-height:1.55}}
    .b-meta{{font-size:11px;color:var(--t3);margin-top:2px}}
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
    <div class="hero-tag">📰 Le blog</div>
    <h1>La Corée <em>pratique</em></h1>
    <p>Voyage, cuisine, culture & méthode — des guides utiles et gratuits,<br/>avec les mots coréens prononcés par de vraies voix natives.</p>
  </div>
  <div class="chips" role="tablist" aria-label="Filtrer par thème">{chips}</div>
  <div class="grid" id="grid">
{cards}  </div>
  <p class="soon">De nouveaux articles arrivent régulièrement — K-dramas, quartiers de Séoul, fêtes traditionnelles…<br/>Une idée de sujet ? Écris-nous : <a href="mailto:contact@koreanstories.fr" style="color:var(--gold-text,#8B6B3D);font-weight:700">contact@koreanstories.fr</a></p>
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
print('✓ blog.html')
for a in ARTICLES:
    open(a['slug']+'.html','w',encoding='utf-8').write(page(a))
    print('✓', a['slug']+'.html')
