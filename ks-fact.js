/* ═══════════════════════════════════════════════════════════════════
   ks-fact.js — Fait coréen du jour.
   ──────────────────────────────────────────────────────────────────
   30+ faits culturels / linguistiques courts. Un seul est affiché
   par jour, sélectionné déterministiquement à partir de la date pour
   être stable jusqu'à minuit. Pure pédagogie en français avec touche
   coréenne. Utilisé sur app.html via KSFact.today().
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* Faits courts (≤120 caractères pour le titre, ≤220 pour le corps) */
  var FACTS = [
    {cat:'Linguistique', t:"Le Hangeul est le SEUL alphabet inventé scientifiquement", b:"Créé en 1443 par le roi Sejong. Les consonnes imitent la position de la bouche, les voyelles s'inspirent du ciel, de la terre et de l'humain."},
    {cat:'Culture', t:"Il n'existe PAS de mot pour \"tu\" entre adultes", b:"Les Coréens utilisent le prénom + titre (선배, 친구) ou le statut social. Dire \"너\" à un inconnu adulte serait très impoli."},
    {cat:'Société', t:"La Corée du Sud a le taux de scolarisation supérieure le plus élevé au monde", b:"Plus de 70 % des 25-34 ans ont un diplôme universitaire. Le seul pays qui s'approche : le Japon."},
    {cat:'Cuisine', t:"Le kimchi a son propre frigo dédié dans 95 % des foyers", b:"Les frigos à kimchi maintiennent une température et humidité spécifiques. La fermentation y est plus stable qu'en frigo classique."},
    {cat:'Langue', t:"\"Aigo !\" est l'interjection la plus utilisée en Corée", b:"아이고 exprime la fatigue, la surprise, la frustration, l'attendrissement. Un seul mot pour 10 émotions différentes selon le ton."},
    {cat:'Histoire', t:"La Corée a son propre calendrier — le Dangun", b:"L'an 2025 correspond à l'an 4358 du calendrier Dangun (fondation mythique de Gojoseon en 2333 av. J.-C.). Encore utilisé pour les fêtes traditionnelles."},
    {cat:'K-Pop', t:"La trainee period chez BTS a duré 3-5 ans avant débuts", b:"Devenir idole demande typiquement 5-10 ans de formation. Danse, chant, langues, médias, sport. Plus rigoureux qu'une école militaire."},
    {cat:'Astuce', t:"Le ㅂ + 어 = 워, pas 버", b:"Quand un batchim ㅂ rencontre 어 → \"우오\" (irrégulier 'b'). Exemple : 덥다 + 어요 = 더워요 (il fait chaud)."},
    {cat:'Géographie', t:"Séoul est une mégalopole de 25 millions d'habitants", b:"Avec sa zone métropolitaine, Séoul concentre près de 50 % de la population coréenne. Plus dense que NYC."},
    {cat:'Habitudes', t:"On enlève TOUJOURS ses chaussures en entrant chez quelqu'un", b:"Même chez le médecin ou dans certains restaurants traditionnels. Marcher avec ses chaussures à l'intérieur est extrêmement impoli."},
    {cat:'Linguistique', t:"Le verbe coréen se conjugue à la fin de la phrase", b:"Structure SOV (sujet-objet-verbe). On dit littéralement \"Je sushi mange\". Cela permet de garder le suspense de l'action jusqu'au dernier mot."},
    {cat:'Politesse', t:"Il existe 7 niveaux de politesse en coréen", b:"Du plus formel (합쇼체) au plus intime (해체). Les apprenants en pratiquent 2-3. Les vrais natifs en jonglent sans réfléchir."},
    {cat:'Culture', t:"Le cinéma coréen n'a connu son explosion qu'en 1999", b:"Avant, les quotas obligeaient à diffuser des films coréens 146 jours/an. Avec l'assouplissement et la Vague Coréenne, le secteur est devenu mondial."},
    {cat:'Cuisine', t:"Le BBQ coréen se mange à 2 mains : pince + ciseaux", b:"Tu retournes la viande avec les pinces, tu coupes en morceaux avec des ciseaux directement sur la plaque. Pas de couteau à table."},
    {cat:'Langue', t:"Hello s'écrit DIFFÉREMMENT selon qui tu salues", b:"안녕 (ami), 안녕하세요 (poli), 안녕하십니까 (très formel). Trois formes pour trois contextes."},
    {cat:'Société', t:"Les Coréens portent un masque dès qu'ils sont malades — pas par peur, par respect", b:"Avant le COVID, c'était déjà la norme. \"Je suis enrhumé, je protège les autres\" est culturellement intégré depuis les années 90."},
    {cat:'K-Drama', t:"95 % des K-dramas ont une scène de \"piggyback\"", b:"Le héros transporte l'héroïne ivre/blessée sur son dos. C'est le moment romantique-cliché par excellence — devenu un running gag dans le genre."},
    {cat:'Astuce', t:"Les particules 은/는 et 이/가 ne sont PAS des synonymes", b:"은/는 → ce dont on parle (topic). 이/가 → qui fait l'action (sujet). \"저는 사과를 좋아해요\" vs \"제가 먹었어요\". Différence subtile mais essentielle."},
    {cat:'Culture', t:"Le rouge en Corée = la chance, pas le danger", b:"Les enveloppes de bonne année (세뱃돈) sont rouges. Les portes de temples aussi. Mais écrire un nom en rouge reste tabou (signe de mort)."},
    {cat:'Cuisine', t:"Le poulet frit coréen (chimaek) a sa propre culture", b:"치맥 = 치킨 + 맥주 (poulet + bière). Sport national d'été. 30 000+ restaurants spécialisés dans tout le pays."},
    {cat:'Linguistique', t:"En coréen, on ne dit pas \"je\" sauf pour insister", b:"\"먹었어요\" (j'ai mangé) — le sujet est sous-entendu. Ajouter 저는 / 나는 = mettre l'emphase ou contraster. Comme l'italien."},
    {cat:'Histoire', t:"La Corée du Sud était plus pauvre que le Ghana en 1960", b:"PIB/habitant 76 $/an. Aujourd'hui : 33 000 $. Le \"miracle du fleuve Han\" est l'une des plus rapides croissances économiques de l'histoire moderne."},
    {cat:'Politesse', t:"On accepte un cadeau à 2 mains, jamais à 1", b:"Recevoir un objet d'une seule main signifie le mépriser. À table, servir et être servi se fait aussi à 2 mains face à un aîné."},
    {cat:'K-Pop', t:"Le mot \"oppa\" (오빠) ne se dit pas n'importe comment", b:"오빠 = grand frère, MAIS aussi appellatif romantique d'une fille pour son copain. Une femme âgée qui dit \"오빠\" à un jeune homme, c'est tout autre chose."},
    {cat:'Langue', t:"Le 받침 ㅎ + voyelle → souvent il \"disparaît\"", b:"좋아요 se prononce \"jo-a-yo\" (le ㅎ s'efface devant la voyelle). Une des règles de prononciation à apprendre tôt."},
    {cat:'Culture', t:"Les Coréens fêtent leurs 100 jours, pas leurs 100 ans", b:"백일잔치 (baek-il janchi) : la grande fête du 100ème jour d'un bébé. Une survie ancestrale célébrée. Les centenaires ne reçoivent qu'une mention au journal."},
    {cat:'Cuisine', t:"Il n'existe PAS de doggy bag en Corée", b:"Demander à emporter les restes au resto est socialement étrange. Soit on finit, soit on laisse. Exception : le BBQ familial où on peut emporter."},
    {cat:'Société', t:"Les femmes coréennes peuvent garder leur nom de famille au mariage", b:"Officiellement, la femme conserve son nom. Les enfants prennent celui du père. Aucune obligation légale de changer comme dans certains pays."},
    {cat:'Astuce', t:"-(으)면 + verbe = la base de toute hypothèse", b:"비가 오면 (s'il pleut), 시간이 있으면 (si j'ai le temps). Une des 5 structures à automatiser dès A2."},
    {cat:'Histoire', t:"Le Hangeul a longtemps été méprisé par les élites", b:"Pendant 400 ans, les nobles ont continué à utiliser le chinois et appelaient le Hangeul \"l'écriture des femmes\". Il n'est devenu officiel qu'en 1894."}
  ];

  /* Hash déterministe sur la date YYYY-MM-DD */
  function todayIndex() {
    var d = new Date().toISOString().slice(0, 10);
    var h = 0;
    for (var i = 0; i < d.length; i++) h = ((h << 5) - h) + d.charCodeAt(i) | 0;
    return Math.abs(h) % FACTS.length;
  }

  function today() {
    return FACTS[todayIndex()];
  }

  global.KSFact = {
    today: today,
    all: function () { return FACTS.slice(); },
    count: FACTS.length
  };

})(window);
