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

}
