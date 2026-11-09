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
}
