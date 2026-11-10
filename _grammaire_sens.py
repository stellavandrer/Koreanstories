# -*- coding: utf-8 -*-
"""Les emplois d'une tournure que la fiche d'origine ne couvre pas.

PROVENANCE ET LICENCE, a lire avant d'ajouter une entree
────────────────────────────────────────────────────────
Les FAITS (combien d'emplois a une tournure, lesquels, dans quel registre)
sont verifies contre le dictionnaire de l'Institut national de la langue
coreenne, krdict.korean.go.kr, qui est aussi la source du contenu
grammatical publie par Naver.

Ce dictionnaire est diffuse en CC BY-SA. L'usage commercial est permis,
mais le partage a l'identique oblige a republier toute oeuvre DERIVEE sous
la meme licence. Traduire leurs definitions imposerait donc cette licence
a une partie du site.

Consequence, et elle est ferme : on ne traduit jamais leurs definitions.
Un fait n'est pas protegeable, sa formulation l'est. Le francais ci-dessous
est ecrit de zero, verifie contre la source, et le site reste libre de ses
propres conditions. La source est citee comme reference, pas comme texte.

Format d'une entree :
    'g25': {
        'intro': "...",                       # pourquoi cette section existe ici
        'emplois': [("Titre court", "..."), ...],
    }
Une fiche absente de ce dictionnaire n'affiche simplement pas la section.
"""

SOURCE = ('Emplois vérifiés contre le dictionnaire de l\'Institut national de la '
          'langue coréenne (krdict.korean.go.kr). Les explications sont les nôtres.')

SENS = {

 # ── A1 ──────────────────────────────────────────────────────────────
 'g01': {
  'intro': "La fiche présente cette particule comme le marqueur du thème, et c'est "
           "bien son rôle principal. Mais le dictionnaire officiel range le contraste "
           "en premier, avant le thème, et ce détail d'ordre en dit long : pour une "
           "oreille coréenne, poser un thème, c'est déjà l'opposer discrètement à "
           "autre chose. Deux emplois en découlent, qu'on utilise longtemps sans "
           "savoir qu'on les utilise.",
  'emplois': [
   ("Opposer, sans le dire",
    "C'est l'emploi que les francophones produisent par accident et interprètent "
    "de travers. Dès que deux éléments portent cette particule dans la même phrase "
    "ou dans deux phrases qui se suivent, le coréen comprend qu'on les met en "
    "balance. Si tu parles de ce que tu aimes puis de ce que tu n'aimes pas en "
    "marquant les deux ainsi, tu n'as pas énuméré : tu as opposé. À l'inverse, "
    "quand un Coréen semble insister lourdement sur un mot, c'est souvent ce "
    "contraste que tu entends, pas de l'agacement."),
   ("Insister",
    "Troisième emploi reconnu : l'emphase pure. La particule peut se greffer "
    "ailleurs que sur le sujet ou le thème, simplement pour souligner un élément. "
    "C'est pour cela qu'on la rencontre à des endroits où la règle du thème ne "
    "l'explique pas, et qu'une phrase paraît alors mal formée alors qu'elle est "
    "seulement appuyée."),
  ]},

 'g05': {
  'intro': "La fiche l'enseigne comme le marqueur de l'objet direct, ce qui est "
           "l'emploi le plus fréquent et le plus simple à expliquer à un "
           "francophone. Le dictionnaire officiel en recense onze. Il n'est pas "
           "utile de tous les retenir, mais trois d'entre eux expliquent des "
           "phrases réelles qui, sans eux, paraissent fautives.",
  'emplois': [
   ("Avec un verbe de déplacement, là où tu attendais la particule de lieu",
    "C'est le cas qui déroute le plus. Un verbe de mouvement peut marquer sa "
    "destination avec la particule d'objet au lieu de celle de lieu. La phrase "
    "n'est pas fautive : elle insiste sur le trajet comme sur une chose qu'on "
    "accomplit, plutôt que sur l'endroit où l'on se rend. Si tu as déjà entendu "
    "ce que tu croyais être une faute, c'était probablement cela."),
   ("Une durée ou une quantité",
    "La particule peut aussi marquer la quantité d'une chose ou l'étendue d'une "
    "action, dont sa durée. « Attendre une heure » se construit alors comme si "
    "l'heure était l'objet de l'attente. Pour un francophone, cela revient à "
    "traiter le temps passé comme une chose qu'on subit activement."),
   ("Insister",
    "Comme la particule de thème, celle-ci connaît un emploi d'emphase. Elle "
    "apparaît alors sur un élément qui n'est grammaticalement pas un objet, "
    "uniquement pour le mettre en relief. C'est fréquent à l'oral et pratiquement "
    "absent des manuels."),
  ]},

 # ── A2 ──────────────────────────────────────────────────────────────
 'g09': {
  'intro': "L'opposition « destination contre lieu d'action » est la bonne porte "
           "d'entrée, et elle suffit longtemps. Mais la particule de lieu d'action "
           "a six emplois officiels, et trois reviennent constamment dès qu'on "
           "sort de la salle de classe.",
  'emplois': [
   ("D'où l'on vient",
    "Le même mot sert à marquer le point de départ. Dire d'où l'on vient, d'où "
    "part un train, depuis quand dure une chose : c'est cette particule. Les "
    "francophones l'apprennent souvent comme un second mot à mémoriser, alors "
    "que c'est le même, avec la même logique : le lieu d'où l'action émane."),
   ("La provenance d'une chose",
    "Au-delà des lieux, elle marque l'origine de ce dont on parle : d'où vient "
    "une information, une habitude, un produit. C'est ce qui permet de citer une "
    "source sans construction lourde."),
   ("Quand une organisation agit",
    "Emploi inattendu et pourtant courant dans la presse et les annonces : "
    "lorsqu'une institution, une entreprise ou un gouvernement est le sujet de la "
    "phrase, c'est cette particule qui le marque, et non celle du sujet. Une "
    "phrase qui semble dire « depuis le ministère » dit en réalité « le ministère "
    "a annoncé ». Le savoir change la lecture d'un article entier."),
  ]},

 # ── B1 ──────────────────────────────────────────────────────────────
 'g25': {
  'intro': "La fiche explique l'emploi connecteur, celui qui pose le décor avant "
           "la suite, et c'est de loin le plus fréquent. Le dictionnaire officiel "
           "en recense deux autres, et ce sont justement ceux qui déroutent, parce "
           "qu'ils apparaissent en fin de phrase, là où l'on n'attend plus un "
           "connecteur. Une phrase qui s'arrête sur cette terminaison n'est pas "
           "une phrase inachevée.",
  'emplois': [
   ("S'exclamer en attendant une réaction",
    "En fin de phrase et sur un ton familier, la tournure sert à marquer "
    "l'admiration ou la surprise, tout en sollicitant implicitement une réponse. "
    "Ce n'est pas tout à fait un commentaire pour soi : la personne attend que "
    "tu réagisses. En français, on rendrait cela par une exclamation suivie d'un "
    "regard, ce que l'écrit ne note pas et que le coréen, lui, grammaticalise."),
   ("Poser une question qui appelle une réponse précise",
    "Toujours en fin de phrase, la même terminaison sert à interroger en "
    "réclamant une réponse déterminée, pas un simple oui ou non. C'est la raison "
    "pour laquelle une question entendue avec cette finale peut sembler insistante "
    "alors qu'elle demande seulement une précision."),
  ]},


 'g02': {
  'intro': "Marqueur du sujet : c'est juste, et c'est ce qu'il faut retenir d'abord. "
           "Le dictionnaire officiel précise pourtant deux emplois que la règle "
           "générale n'annonce pas, et qui expliquent pourquoi cette particule "
           "surgit là où tu attendais celle du thème.",
  'emplois': [
   ("Ce qui change, et ce qu'on nie",
    "Quand une phrase dit qu'une chose en devient une autre, ou qu'elle n'est pas "
    "ce qu'on croyait, c'est cette particule qui marque l'élément concerné. C'est "
    "systématique avec le verbe de transformation et avec la négation d'identité. "
    "Si tu hésites toujours entre les deux particules, voilà un repère net : "
    "devenir et ne pas être appellent celle-ci, sans discussion."),
   ("Insister",
    "Elle connaît aussi un emploi d'emphase, qui appuie ce qui précède. C'est la "
    "raison pour laquelle on l'entend parfois là où la grammaire du sujet seule "
    "ne la justifie pas."),
  ]},

 'g03': {
  'intro': "La fiche l'appelle le présent poli, ce qui est la bonne façon de "
           "l'aborder. Mais la définition officielle est plus large, et cette "
           "largeur est une bonne nouvelle pour un débutant.",
  'emplois': [
   ("Une seule forme pour quatre actes de parole",
    "Cette terminaison ne sert pas qu'à affirmer. Elle sert aussi à poser une "
    "question, à donner un ordre et à proposer quelque chose. La forme ne change "
    "pas : seule l'intonation, et parfois le contexte, distinguent les quatre. "
    "Pour un francophone habitué à conjuguer différemment l'indicatif et "
    "l'impératif, c'est trois conjugaisons en moins à apprendre. C'est aussi "
    "pourquoi une phrase lue à plat peut être ambiguë à l'écrit, là où la voix "
    "tranche immédiatement."),
  ]},

 'g07': {
  'intro': "La fiche enseigne le passé, et c'est l'emploi massif. Le dictionnaire "
           "officiel en recense trois, et le troisième surprend assez pour valoir "
           "le détour.",
  'emplois': [
   ("Un passé dont le résultat dure encore",
    "Deuxième emploi reconnu : marquer qu'une action est achevée et que son "
    "résultat tient toujours au moment où l'on parle. Le français distingue cela "
    "par le passé composé et l'imparfait, ou par des tournures comme « ça y est, "
    "c'est fait ». Le coréen n'a pas besoin d'une forme différente : la même "
    "marque sert, et c'est le sens du verbe qui décide."),
   ("Un passé qui parle du futur",
    "Troisième emploi, et le plus déroutant : cette marque de passé s'emploie pour "
    "affirmer avec certitude qu'une chose à venir sera ainsi. On énonce le futur "
    "comme s'il était déjà accompli, pour signifier qu'il ne fait aucun doute. Si "
    "tu as déjà entendu un Coréen parler au passé d'une chose qui n'a pas encore "
    "eu lieu, ce n'était ni une erreur ni une mauvaise écoute de ta part."),
  ]},

 'g10': {
  'intro': "« Si », c'est la traduction utile et c'est par là qu'il faut commencer. "
           "Le dictionnaire officiel distingue pourtant quatre emplois, et deux "
           "d'entre eux ne sont pas des conditions du tout.",
  'emplois': [
   ("Le regret et l'irréel",
    "La tournure sert aussi à poser un fait contraire à la réalité : ce qu'on "
    "aurait souhaité, ce qu'on regrette, ce qui aurait pu être. Le français emploie "
    "là le conditionnel et change le temps du verbe ; le coréen garde la même "
    "terminaison. C'est pour cette raison qu'une phrase peut sembler poser une "
    "simple hypothèse alors qu'elle exprime un regret."),
   ("L'habitude, pas la condition",
    "Quatrième emploi : marquer ce qui se produit chaque fois, de façon répétée. "
    "Il ne s'agit plus d'un « si » mais d'un « quand » ou d'un « chaque fois que ». "
    "La phrase ne suppose rien, elle décrit une régularité. Traduire "
    "mécaniquement par « si » donne alors un contresens."),
  ]},

 'g23': {
  'intro': "La fiche regroupe ces particules sous l'idée de nuance, ce qui est la "
           "bonne intuition. Le dictionnaire officiel donne à celle qui marque la "
           "limite trois emplois, dont deux n'ont rien à voir avec une borne.",
  'emplois': [
   ("Ajouter, et pas seulement s'arrêter",
    "Au-delà de marquer la fin d'un intervalle, cette particule sert à signaler "
    "qu'une chose s'ajoute à l'état présent. Elle se traduit alors par « en plus », "
    "« et même », et non par « jusqu'à ». Une énumération qui semblait s'arrêter "
    "était en fait en train de monter d'un cran."),
   ("Aller au-delà de ce qui serait normal",
    "Troisième emploi : souligner qu'on dépasse la mesure attendue. La particule "
    "porte alors un jugement, souvent de surprise ou de reproche, sur le fait qu'on "
    "soit allé si loin. C'est ce qui donne à certaines phrases un ton que la "
    "traduction littérale perd entièrement."),
  ]},

 'g53': {
  'intro': "Le registre de l'écrit : c'est l'usage le plus visible, celui des "
           "journaux et des livres. Le dictionnaire officiel distingue deux "
           "terminaisons de ce type, et la distinction entre elles tient à une "
           "chose que la fiche ne précise pas.",
  'emplois': [
   ("Ce n'est pas qu'une affaire d'écrit",
    "Cette terminaison n'est pas réservée au papier. On l'entend à l'oral, dans un "
    "monologue, une exclamation pour soi, ou entre personnes très proches. La "
    "lire comme un simple marqueur de style écrit fait manquer tout un pan de "
    "l'oral coréen, notamment dans les dramas, où elle signale qu'un personnage "
    "se parle à lui-même."),
   ("Deux formes selon le verbe",
    "Le choix de la terminaison dépend de la nature du mot auquel elle s'attache, "
    "et le dictionnaire les range d'ailleurs comme deux entrées distinctes. C'est "
    "le même réflexe que pour le présent poli : regarder d'abord à quoi on "
    "s'accroche, décider ensuite de la forme."),
  ]},

 'g47': {
  'intro': "La fiche retient le regret, et c'est l'emploi le plus courant. Le "
           "dictionnaire officiel en recense un second, qui dit presque le "
           "contraire.",
  'emplois': [
   ("La volonté farouche, et non le regret",
    "La même tournure sert à marquer une détermination forte : aller au bout "
    "coûte que coûte. Le regret et la résolution partagent donc une seule forme, "
    "et c'est le contexte qui tranche. Traduire systématiquement par « j'ai fini "
    "par, hélas » fait alors un contresens complet sur une phrase qui exprimait "
    "une promesse à soi-même."),
  ]},

 'g42': {
  'intro': "La fiche retient l'avertissement : si tu continues ainsi, il arrivera "
           "quelque chose de fâcheux. Le dictionnaire officiel place pourtant un "
           "autre emploi en premier.",
  'emplois': [
   ("Interrompre et basculer",
    "Premier emploi reconnu : marquer qu'une action ou un état s'arrête et cède "
    "la place à un autre. Il n'y a là ni menace ni conséquence fâcheuse, "
    "seulement un changement. C'est ce qui explique que la tournure apparaisse "
    "dans des récits parfaitement neutres, où l'on attendait un avertissement."),
  ]},

 'g18': {
  'intro': "« En train de » : la traduction est juste et c'est la bonne entrée. "
           "Le dictionnaire officiel distingue pourtant deux emplois, et confondre "
           "les deux produit des contresens sur des phrases très courantes.",
  'emplois': [
   ("L'action qui se déroule",
    "Premier emploi : l'action elle-même est en cours. C'est celui que la fiche "
    "enseigne et il couvre la majorité des cas."),
   ("Le résultat qui dure",
    "Second emploi : l'action est terminée, mais son résultat tient toujours. "
    "Avec les verbes d'habillement, de port ou de position, la tournure ne dit "
    "pas qu'on est en train d'enfiler un manteau, mais qu'on le porte. C'est la "
    "source d'un contresens classique : traduire par « il est en train de mettre "
    "sa veste » une phrase qui dit « il a sa veste sur le dos ». Quand le verbe "
    "décrit un état qu'on prend puis qu'on garde, pense au résultat, pas au geste."),
  ]},

 'g19': {
  'intro': "La fiche enseigne « pouvoir », ce qui couvre l'essentiel. Le "
           "dictionnaire officiel sépare pourtant deux choses que le français "
           "confond sous un seul verbe.",
  'emplois': [
   ("Savoir faire, et être possible",
    "Le premier emploi est la capacité propre à quelqu'un : il en est capable, il "
    "a appris. Le second est la possibilité objective : la chose est faisable, "
    "indépendamment de qui agit. Le français dit « je peux » dans les deux cas et "
    "laisse le contexte décider ; le coréen aussi, mais le dictionnaire les "
    "distingue parce que la nuance porte. Dire d'une personne qu'elle « peut » "
    "nager, ou d'une piscine qu'on « peut » y nager, ce n'est pas la même phrase, "
    "et c'est utile de savoir laquelle on produit."),
  ]},

 'g31': {
  'intro': "Annoncer ou proposer : la fiche oppose bien les deux terminaisons. Le "
           "dictionnaire officiel précise ce qui les sépare vraiment, et ce n'est "
           "pas une question de politesse.",
  'emplois': [
   ("La promesse faite à quelqu'un",
    "La première terminaison engage celui qui parle envers celui qui écoute : "
    "c'est une promesse ou une notification de ce qu'on va faire. Elle suppose "
    "donc un interlocuteur concerné par l'annonce. L'employer seul, sans personne "
    "à qui promettre, sonne étrangement."),
   ("L'intention, et la question posée à l'autre",
    "La seconde dit l'intention propre de celui qui parle, mais sert aussi, telle "
    "quelle, à demander à l'autre quelle est la sienne. Une même forme pour "
    "annoncer ce qu'on veut et pour demander ce que l'autre veut : c'est ce qui "
    "la rend si fréquente à l'oral, et si déroutante quand on l'entend sans savoir "
    "qui elle interroge."),
  ]},

 'g26': {
  'intro': "Une précision de périmètre d'abord. La fiche enseigne la construction complète du discours indirect, terminaison plus verbe de parole. "
           "Le dictionnaire officiel, lui, traite la TERMINAISON SEULE, et la range sous deux entrées distinctes, l'une de liaison et l'autre de fin de phrase. "
           "Ces emplois-là appartiennent donc à la terminaison employée sans le verbe de parole, et trois d'entre eux n'ont rien à voir avec rapporter des propos.",
  'emplois': [
   ("Le motif, pas la citation",
    "Comme terminaison de liaison, elle marque aussi l'intention qui a présidé à "
    "une action, ou la cause d'une situation. La phrase n'est alors le rapport de "
    "rien du tout : elle explique pourquoi. C'est la même forme, et c'est ce qui "
    "égare quand on cherche qui a bien pu dire quoi."),
   ("Insister sur ce qu'on pense",
    "En fin de phrase et sur un ton familier, elle sert à appuyer sa propre "
    "opinion face à quelqu'un. Ce n'est plus une parole rapportée mais la sienne, "
    "assénée. Voilà pourquoi on l'entend dans les disputes de drama sans qu'aucun "
    "tiers ne soit cité."),
   ("Redemander, ou réaliser",
    "Toujours en fin de phrase, elle sert à faire répéter pour vérifier ce qu'on "
    "a cru entendre, et aussi à constater qu'une chose n'est pas ce qu'on avait "
    "prévu. Dans les deux cas, celui qui parle ajuste ce qu'il croyait savoir."),
   ("Citer un proverbe",
    "Dernier emploi reconnu de la forme de liaison : signaler que ce qui précède "
    "est un dicton. Le coréen marque grammaticalement la citation d'une sagesse "
    "commune, là où le français se contente de « comme on dit »."),
  ]},

 'g46': {
  'intro': "Le souvenir vécu : la fiche vise juste. Le dictionnaire officiel "
           "distingue pourtant nettement les deux terminaisons, et la différence "
           "tient à ce qu'on attend de l'autre.",
  'emplois': [
   ("Transmettre ce qu'on a découvert soi-même",
    "La première sert à rapporter, maintenant, un fait qu'on a appris par "
    "expérience directe dans le passé. La condition est stricte : il faut l'avoir "
    "constaté soi-même. L'employer pour une chose qu'on vous a racontée est une "
    "faute, et c'est l'erreur la plus fréquente des apprenants sur cette tournure."),
   ("S'étonner, en attendant une réaction",
    "La seconde ajoute une attente : on raconte un fait passé avec étonnement, et "
    "on guette la réponse de l'autre. Ce n'est pas un simple compte rendu, c'est "
    "une perche tendue. La confondre avec la première fait manquer l'invitation "
    "à répondre, et le silence qui suit paraît alors incompréhensible."),
  ]},

 'g39': {
  'intro': "La fiche retient l'idée de conséquence annoncée. Le dictionnaire "
           "officiel sépare deux emplois selon qui décide de ce qui va arriver.",
  'emplois': [
   ("Je m'en charge, donc toi…",
    "Premier emploi : celui qui parle annonce son intention d'agir, et cette "
    "intention devient la condition de ce qu'il demande ensuite. C'est la tournure "
    "du partage des tâches, celle qui dit « je fais ça, alors fais ceci »."),
   ("Ça va sûrement être ainsi, donc…",
    "Second emploi : ce n'est plus une intention mais une forte supposition sur "
    "ce qui va se passer, posée comme condition de la suite. Personne ne s'engage "
    "à rien, on anticipe. Confondre les deux revient à entendre une promesse là "
    "où il n'y avait qu'un pronostic."),
  ]},

 'g45': {
  'intro': "La fiche retient l'enchaînement : j'ai fait cela, et voilà ce qui est "
           "arrivé. Le dictionnaire officiel distingue deux emplois, et le premier "
           "précise une condition que la fiche laisse implicite.",
  'emplois': [
   ("Une découverte, différente d'avant",
    "Premier emploi : ce qui suit est un fait nouveau, qui contraste avec la "
    "situation passée. L'intérêt de la tournure est justement cet écart : on "
    "raconte une surprise, pas une simple suite d'événements. Si rien ne change, "
    "une autre construction conviendrait mieux."),
   ("Une cause passée",
    "Second emploi : le fait passé devient la raison de ce qui suit. La nuance "
    "avec le premier est fine, mais elle existe : ici il n'y a pas forcément de "
    "surprise, seulement un lien de cause."),
  ]},

 'g24': {
  'intro': "Les deux « parce que » : la fiche pose bien l'opposition. Le "
           "dictionnaire officiel apporte sur la seconde une précision qui "
           "explique pourquoi elle paraît parfois brutale.",
  'emplois': [
   ("Une cause mise en avant, pas seulement énoncée",
    "La définition officielle de la seconde terminaison ne dit pas qu'elle donne "
    "la cause : elle dit qu'elle la MET EN AVANT. Ce n'est pas la même chose. "
    "Celui qui l'emploie souligne sa raison, la présente comme acquise, parfois "
    "comme une évidence que l'autre devrait admettre. C'est pour cela qu'on la "
    "déconseille dans les excuses : s'excuser en appuyant sur sa raison revient "
    "à se justifier plutôt qu'à reconnaître un tort."),
   ("Elle accepte aussi une simple prémisse",
    "Le dictionnaire ajoute qu'elle peut introduire non seulement une cause mais "
    "une prémisse : le point de départ admis d'un raisonnement. Dans cet emploi "
    "il n'y a plus de causalité du tout, seulement un « puisque » logique."),
  ]},

 'g27': {
  'intro': "La fiche oppose le but du déplacement et le but général. Le "
           "dictionnaire officiel confirme cette opposition et en donne la raison "
           "grammaticale, qui est plus nette que l'intuition.",
  'emplois': [
   ("La première est réservée au déplacement",
    "La définition officielle de la première terminaison précise qu'elle exprime "
    "le but d'une action de déplacement, aller ou venir. Ce n'est pas une "
    "tendance d'usage, c'est sa définition. L'employer avec un verbe qui n'est "
    "pas un déplacement n'est donc pas maladroit : c'est hors de son emploi. "
    "Voilà le critère simple qui tranche les hésitations."),
   ("La seconde dit l'intention, quel que soit le verbe",
    "La seconde marque l'intention qui motive une action, sans restriction sur le "
    "verbe. Elle est donc toujours disponible quand on doute, au prix d'un ton "
    "un peu plus formel."),
  ]},

 'g30': {
  'intro': "« Même si » traduit les deux tournures, mais le dictionnaire officiel "
           "définit la seconde avec une précision que le français perd.",
  'emplois': [
   ("Supposer, ou admettre, mais sans conséquence",
    "La définition de la seconde terminaison combine deux gestes : on suppose ou "
    "l'on reconnaît que ce qui précède est vrai, puis on signale que cela ne "
    "change rien à la suite. Elle sert donc aussi bien pour une hypothèse que "
    "pour un fait admis, ce qui la rend plus large que son équivalent français. "
    "C'est ce qui lui donne, à l'oral, cette nuance de concession appuyée."),
  ]},

 'g33': {
  'intro': "La fiche traduit par le désordre ambiant. Le dictionnaire officiel "
           "ajoute une contrainte que la fiche ne formule pas et qui décide de "
           "tout.",
  'emplois': [
   ("Ce qui suit est forcément mauvais",
    "La définition officielle précise que cette tournure introduit la cause d'un "
    "résultat MAUVAIS. Ce n'est pas une nuance de ton, c'est une condition "
    "d'emploi. L'utiliser devant une conséquence heureuse sonne faux pour une "
    "oreille coréenne. Si ce qui suit est positif, il faut une autre "
    "construction, et c'est le piège le plus courant sur cette forme."),
  ]},

 'g35': {
  'intro': "Les deux tournures disent la fatalité, et la fiche les présente "
           "ensemble. Le dictionnaire officiel les définit pourtant différemment, "
           "et cette différence est utilisable.",
  'emplois': [
   ("Ce qui est naturel, et ce qui est déjà décidé",
    "La première dit qu'il est NATUREL qu'une chose arrive ou devienne ainsi : "
    "c'est l'ordre des choses, la pente habituelle du monde. La seconde dit que "
    "la chose est DÉJÀ DÉCIDÉE ou établie : c'est une règle, presque une loi. "
    "L'une observe une tendance, l'autre énonce un principe. Pour choisir, "
    "demande-toi si tu constates ou si tu décrètes."),
  ]},

 'g43': {
  'intro': "La fiche décrit l'enchaînement vécu : j'ai constaté, donc j'ai agi. "
           "Le dictionnaire officiel la définit plus sobrement, et cette sobriété "
           "est instructive.",
  'emplois': [
   ("Une cause, simplement",
    "La définition officielle ne mentionne ni observation ni surprise : elle dit "
    "seulement que la terminaison renvoie à la cause ou à la raison de ce qui "
    "suit. Ce que la fiche décrit, l'idée d'avoir constaté quelque chose puis "
    "d'avoir réagi, est l'usage réel le plus fréquent, pas une contrainte "
    "grammaticale. Le savoir évite de se bloquer quand une phrase entendue ne "
    "correspond pas à ce schéma."),
  ]},

 'g44': {
  'intro': "« Tant que j'y suis » : la traduction est heureuse. Le dictionnaire "
           "officiel précise la structure temporelle, et elle est plus souple que "
           "ce que la fiche laisse entendre.",
  'emplois': [
   ("À l'occasion de, pendant ou après",
    "La définition officielle couvre deux moments : on profite d'une action soit "
    "pendant qu'on la fait, soit une fois qu'elle est faite. La tournure ne "
    "suppose donc pas forcément qu'on soit encore occupé à la première chose. "
    "C'est ce qui permet de l'employer pour dire « puisque j'y étais allé » aussi "
    "bien que « pendant que j'y suis »."),
  ]},

 'g49': {
  'intro': "« C'est précisément cela » : la fiche saisit bien l'effet. Le "
           "dictionnaire officiel la range comme une particule, pas comme une "
           "terminaison, et cela change où elle se place.",
  'emplois': [
   ("Une particule, qui se colle à un nom",
    "Le dictionnaire la classe parmi les particules : elle s'attache donc à un "
    "nom, pas à un verbe. C'est un repère pratique quand on hésite sur la "
    "construction, et cela explique pourquoi elle ouvre si souvent la phrase, "
    "sur l'élément qu'on veut désigner comme étant LE bon."),
  ]},

 'g51': {
  'intro': "« Loin de là » : la fiche rend bien le renversement. Le dictionnaire "
           "officiel la classe elle aussi parmi les particules, ce qui donne un "
           "repère de construction.",
  'emplois': [
   ("Elle s'accroche à un nom, et nie plus que lui",
    "Comme particule, elle se colle au nom qu'elle écarte. Et elle ne se contente "
    "pas de le nier : elle signale que même quelque chose de bien moindre n'a pas "
    "eu lieu. C'est cette double négation implicite qui fait sa force, et qu'une "
    "traduction par un simple « pas du tout » laisse tomber."),
  ]},

 'g34': {
  'intro': "La fiche traduit l'impossibilité. Le dictionnaire officiel formule "
           "cela comme un jugement de probabilité, ce qui est plus juste et plus "
           "utilisable.",
  'emplois': [
   ("Une certitude de celui qui parle, pas un fait",
    "La définition officielle dit que celui qui parle EST CERTAIN que la chose a "
    "peu de chances d'être vraie. Ce n'est donc pas une impossibilité objective : "
    "c'est une conviction. La nuance compte, parce qu'elle autorise la "
    "contradiction. On peut répondre à cette tournure, alors qu'on ne discute pas "
    "un fait. En français, « ça m'étonnerait beaucoup » est plus proche que « c'est "
    "impossible »."),
  ]},

 'g40': {
  'intro': "Attention au périmètre avant de lire ce qui suit. La fiche enseigne la "
           "forme COURTE, celle qui relie deux propositions et qui, comme elle le "
           "dit justement, ne termine jamais une phrase. Le dictionnaire officiel, "
           "lui, range cette tournure sous sa forme LONGUE, avec le verbe de "
           "perception conjugué en fin de phrase. Ce sont deux usages d'une même "
           "famille, et c'est en les confondant qu'on croit voir une "
           "contradiction. La forme longue a deux sens, et le premier surprend.",
  'emplois': [
   ("La forme longue sert d'abord à annoncer une intention",
    "Premier sens officiel de la forme longue : celui qui parle annonce qu'il "
    "envisage de faire la chose. Aucune crainte là-dedans. C'est l'équivalent "
    "d'un « je pense que je vais peut-être… » français, avec la même hésitation "
    "polie. Si tu as déjà buté sur une phrase se terminant ainsi, où la "
    "traduction par « de peur que » ne donnait rien, c'était cet emploi."),
   ("Et ensuite seulement l'inquiétude",
    "Second sens de la forme longue : on redoute que la situation se produise. "
    "C'est celui que la fiche enseigne, et c'est le seul que porte la forme "
    "courte. Pour trancher à la lecture, regarde qui agit : si c'est celui qui "
    "parle et qu'il en décide, c'est une intention ; si la chose lui échappe, "
    "c'est une crainte."),
  ]},

 'g14': {
  'intro': "La fiche l'appelle l'impératif poli, et c'est son emploi le plus "
           "visible. La définition officielle est nettement plus large, et cette "
           "largeur explique des phrases qu'on prendrait à tort pour des ordres.",
  'emplois': [
   ("Quatre actes de parole, une seule forme",
    "Le dictionnaire lui reconnaît quatre valeurs : expliquer, interroger, "
    "ordonner et demander. Ce n'est donc pas un impératif au sens français du "
    "terme, c'est une terminaison polie qui sert à tout. Une phrase qui se "
    "termine ainsi n'est pas forcément une injonction : elle peut simplement "
    "décrire, ou poser une question. C'est important pour ne pas percevoir comme "
    "autoritaire un interlocuteur qui ne l'est pas, et c'est le même "
    "fonctionnement que pour le présent poli."),
  ]},

 'g15': {
  'intro': "La fiche enseigne ces mots comme des interrogatifs, ce qui est leur "
           "rôle principal. Le dictionnaire officiel leur donne pourtant des "
           "emplois où ils ne posent aucune question.",
  'emplois': [
   ("« Qui ? » veut aussi dire « quelqu'un »",
    "Le mot interrogatif pour les personnes sert aussi à désigner une personne "
    "quelconque, sans l'identifier. La phrase n'interroge alors plus : elle dit "
    "« quelqu'un », « n'importe qui ». Ce double emploi vaut pour les autres mots "
    "de cette famille, et c'est pourquoi une phrase qui semble poser une question "
    "peut n'être qu'une affirmation vague."),
   ("Taire un nom sans le cacher",
    "Troisième emploi reconnu : désigner une personne dont le nom n'a pas besoin "
    "d'être donné. Ce n'est ni du mystère ni de la discrétion, simplement une "
    "économie : le nom n'apporterait rien."),
  ]},

 'g16': {
  'intro': "Les compteurs : la fiche les présente comme une catégorie à part, ce "
           "qui aide à démarrer. Le dictionnaire officiel montre autre chose, et "
           "c'est plus rassurant.",
  'emplois': [
   ("Un compteur est souvent un mot ordinaire",
    "Le compteur des boissons est d'abord, dans le dictionnaire, le nom du "
    "récipient lui-même : le verre, la tasse. Son emploi comme unité de mesure "
    "n'arrive qu'en troisième sens. Autrement dit, le coréen ne possède pas une "
    "liste de mots exotiques à apprendre par cœur : il réutilise des noms "
    "courants pour compter. Savoir cela allège considérablement la tâche, parce "
    "qu'un compteur inconnu est souvent un mot que tu connais déjà."),
  ]},

 'g21': {
  'intro': "Comparatif et superlatif : la fiche donne les outils. Le dictionnaire "
           "officiel distingue deux emplois de l'adverbe de comparaison, et le "
           "premier n'est pas une comparaison.",
  'emplois': [
   ("Ajouter, sans comparer",
    "Premier sens officiel : l'idée d'ajout continu, « encore », « davantage », "
    "sans aucun terme de comparaison. On en redemande, on en remet. Le second "
    "sens seulement est le comparatif proprement dit, par rapport à quelque chose "
    "ou à un seuil. C'est pour cela qu'on rencontre ce mot dans des phrases où "
    "rien n'est comparé à rien, et qu'il faut alors l'entendre comme « encore un "
    "peu » plutôt que « plus que »."),
  ]},

 'g29': {
  'intro': "La nominalisation : la fiche oppose les deux terminaisons. Un fait "
           "vaut d'être signalé, parce qu'il recadre l'apprentissage.",
  'emplois': [
   ("Le dictionnaire leur donne la même définition",
    "Les deux terminaisons reçoivent, officiellement, la même définition : rendre "
    "nominal ce qui précède. Ce qui les sépare ne tient donc pas au sens mais à "
    "l'usage, aux verbes qui appellent l'une ou l'autre, et au registre. Il est "
    "inutile de chercher une règle logique qui les distinguerait : il faut les "
    "rencontrer en contexte. Le savoir évite des heures perdues à vouloir "
    "comprendre une différence qui n'est pas de l'ordre de la définition."),
  ]},

 'g50': {
  'intro': "« Nous nous proposons de » : la fiche vise le registre formel, et c'est juste. "
           "Le dictionnaire traite ici la terminaison seule, sans le verbe qui la suit dans la fiche, et sa définition est un peu plus ouverte.",
  'emplois': [
   ("Le but, l'intention, mais aussi le souhait",
    "Le dictionnaire mentionne trois choses : un objectif, une intention, et un "
    "espoir. Ce dernier terme élargit la tournure au-delà du registre "
    "administratif : elle peut porter un souhait, pas seulement un projet "
    "annoncé. Cela explique qu'on la rencontre dans des discours ou des vœux, et "
    "pas uniquement dans des documents officiels."),
  ]},

 'g48': {
  'intro': "Position contre moyen : la fiche pose la bonne opposition, celle qui "
           "fait trébucher même les Coréens à l'écrit. La source officielle "
           "apporte un repère de classement.",
  'emplois': [
   ("Ce sont des particules, donc elles suivent un nom",
    "Le dictionnaire range celle qui marque la position parmi les particules, et "
    "la définit par trois mots : un statut, une position, une qualification. "
    "Retenir ces trois mots suffit souvent à trancher : si ce qui précède est ce "
    "QUE l'on est, c'est celle-là. Si c'est ce PAR QUOI on agit, c'est l'autre. "
    "Le doute vient presque toujours de ce qu'on n'a pas tranché cette question "
    "avant de choisir la forme."),
  ]},

 'g36': {
  'intro': "Cette fiche reprend le connecteur sous ses deux formes. Le "
           "dictionnaire officiel les traite comme deux entrées distinctes, avec "
           "les mêmes emplois, dont deux en fin de phrase que la fiche ne couvre "
           "pas.",
  'emplois': [
   ("Deux formes, un seul fonctionnement",
    "Les deux terminaisons reçoivent des définitions identiques : le choix entre "
    "elles ne dépend pas du sens mais de ce à quoi elles s'attachent. C'est le "
    "même réflexe que partout ailleurs en coréen : regarder d'abord le mot "
    "support, décider ensuite de la forme."),
   ("Deux emplois en fin de phrase",
    "Comme pour la forme simple, ces terminaisons servent aussi à conclure une "
    "phrase : pour s'exclamer en attendant une réaction, et pour interroger en "
    "sollicitant une réponse. Une phrase qui s'arrête là n'est pas laissée en "
    "plan, elle tend la perche."),
  ]},
}
