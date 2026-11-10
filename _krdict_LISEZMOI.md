# Données de vérification grammaticale (krdict)

`_krdict_grammaire.json` contient, pour chacune des 53 règles de grammaire du
site, les sens officiels relevés dans le dictionnaire de l'Institut national de
la langue coréenne (krdict.korean.go.kr), qui est aussi la source du contenu
grammatical publié par Naver.

## Pourquoi ce fichier existe

Les fiches de grammaire du site n'enseignaient souvent qu'un seul emploi d'une
tournure qui en compte plusieurs. Ces données servent à **vérifier** ce qu'on
écrit, règle par règle, dans `_grammaire_sens.py`.

## La règle de licence, qui n'est pas négociable

Le dictionnaire est diffusé en **CC BY-SA**. L'usage commercial est permis, mais
le partage à l'identique oblige à republier toute œuvre **dérivée** sous la même
licence. Traduire leurs définitions et les publier imposerait donc CC BY-SA à une
partie du site.

Conséquence : **on ne traduit jamais leurs définitions**. Un fait n'est pas
protégeable, sa formulation l'est. Le français publié est écrit de zéro, vérifié
contre ces données, et la source est citée comme référence.

Ce fichier JSON reste un document de travail interne : il n'est ni publié ni
servi par le site.

## Regénérer les données

    python3 _moisson_krdict.py           # première passe, toutes les règles
    python3 _moisson_krdict_rattrape.py  # rattrape les formes non trouvées
    python3 _moisson_krdict_final.py     # mots-vedettes relevés à la main

Les scripts écrivent dans leur propre dossier : déplacer le JSON produit ici.
Rythme volontairement lent (une requête par seconde) pour ne pas peser sur un
service public.

## Ce qu'il faut savoir avant d'utiliser une entrée

La collecte ramène parfois une **fausse correspondance** : `히` l'adverbe (un
rire) pour le passif `-이/히/리/기`, `잔` le récipient pour les compteurs. Toujours
lire l'entrée avant de s'en servir ; une correspondance n'est pas une preuve.

Six règles n'ont aucune entrée parce qu'elles ne sont pas des mots-vedettes du
dictionnaire : `-기 때문에`, `-(으)ㄹ 거예요`, `-고 나서`, `-(으)ㄴ/는 탓에`,
`-(으)ㄹ지도 모르다`, `-에 달려 있다`. Elles restent sans section ajoutée.
