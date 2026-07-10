# Sécurisation des fiches PDF Premium (2026-07-10)

## Le problème (audit du 2026-07-09)
Les 35 fiches PDF étaient des fichiers statiques publics sur GitHub Pages
(`/pdf/*.pdf`) : accessibles par URL directe, sans aucune vérification, et
en plus indexées par Google. Le "verrou" n'existait que côté navigateur
(un flag `localStorage`), contournable en une ligne de console.

## La solution
Les PDF sont maintenant stockés dans le KV du Worker `ks-premium` (jamais
comme fichier public), et ne sont renvoyés qu'après vérification d'une
licence active — exactement la même vérification que `/verify`.

- `premium-worker/index.js` : nouvelle route `GET /pdf?file=XXX` (en-tête
  `X-License-Key`) qui vérifie la licence puis renvoie le PDF depuis KV.
- `ressources.html` : les boutons "Ouvrir PDF"/"Télécharger" passent
  maintenant par cette route sécurisée (fetch + blob), plus de lien direct
  vers un fichier `.pdf` public.
- `robots.txt` / `sitemap.xml` : `/pdf/` exclu de l'indexation (déjà fait).

## Ce qu'il te reste à faire (une seule fois)

1. **Ajouter le secret `ADMIN_UPLOAD_TOKEN`** dans Cloudflare → Worker
   `ks-premium` → Settings → Variables and Secrets. N'importe quelle chaîne
   aléatoire (ex. génère-en une sur https://1password.com/password-generator/,
   30+ caractères). Note-la temporairement quelque part, tu en as besoin
   à l'étape 3.
2. **Déployer le Worker mis à jour** : copie-colle le contenu de
   `premium-worker/index.js` dans l'éditeur Cloudflare (comme d'habitude,
   cf. `PASSAGE-LIVE.md`) puis clique **Deploy**.
3. **Envoyer les 31 PDF vers KV** : ouvre `premium-worker/admin-upload-pdfs.html`
   directement dans ton navigateur (double-clic sur le fichier), colle le
   jeton de l'étape 1, sélectionne les 31 fichiers du dossier `pdf/`
   (Cmd+A dans le sélecteur de fichiers si tu es dans le bon dossier), et
   clique "Envoyer vers KV". Le journal en bas confirme chaque fichier.
4. **Supprime le secret `ADMIN_UPLOAD_TOKEN`** de Cloudflare une fois
   l'upload terminé — ça désactive définitivement la route d'upload.
5. **Préviens-moi** : je pousserai alors le changement de `ressources.html`
   (actuellement préparé mais pas encore déployé, pour ne pas casser les
   téléchargements le temps que tu fasses les étapes 1 à 4), puis je
   vérifierai qu'un vrai téléchargement fonctionne de bout en bout, et je
   pourrai retirer les 31 fichiers `.pdf` statiques du dépôt (devenus
   inutiles et toujours risqués tant qu'ils restent publics).

## Limite assumée (comblée ci-dessous, partie 2)
~~Les 35 pages "fiche" HTML (`pdf/*.html`) affichent encore leur contenu
textuel complet dans le code source (visible via "Afficher le code source"
ou navigateur sans JS) — seul le fichier PDF téléchargeable est désormais
protégé.~~

---

# Partie 2 — Sécurisation du contenu des pages `pdf/*.html` (2026-07-10)

## Le problème
Les 35 pages de prévisualisation (`pdf/*.html`) avaient un overlay visuel
(`ks-pdf-gate.js`) qui cachait le contenu à l'écran pour un non-Premium —
mais le texte complet (tableaux de vocabulaire, règles de grammaire) restait
présent dans le DOM, donc visible via "Afficher le code source" ou avec
JavaScript désactivé. Contournable en quelques secondes.

## La solution
Même principe que les PDF (partie 1) : le contenu réel de chaque fiche a été
extrait de la page et déplacé dans le KV du Worker, sous la clé
`pdfpage:<nom>`. La page statique ne contient plus qu'une coquille vide
(titre, badge, sous-titre — pas sensible) avec un point de montage
`<div class="wrap" id="pdf-content" data-file="...">`.

- `premium-worker/index.js` : nouvelle route `GET /pdf-preview?file=XXX`
  (même vérification de licence que `/pdf`), qui renvoie le fragment HTML
  depuis KV.
- `pdf/ks-pdf-content.js` (nouveau, remplace `ks-pdf-gate.js` supprimé) :
  au chargement, vérifie la clé de licence locale, va chercher le fragment
  via `/pdf-preview`, et l'injecte dans le DOM seulement si la licence est
  valide. Sinon affiche une carte "Fiche PDF Premium" (comme avant), mais
  cette fois sans AUCUN texte de la fiche présent nulle part dans la page.
- Testé en navigateur : le contenu n'apparaît dans le DOM à aucun moment
  pour un visiteur non-Premium, y compris avec une fausse clé de licence
  (repli propre sur la carte verrouillée en cas d'échec du fetch).

## Ce qu'il te reste à faire (une seule fois, même mécanique que la partie 1)

1. **Ajoute de nouveau le secret `ADMIN_UPLOAD_TOKEN`** dans Cloudflare →
   Worker `ks-premium` → Settings → Variables and Secrets (une nouvelle
   chaîne aléatoire, ou la même méthode que la dernière fois).
2. **Déploie le Worker mis à jour** : copie-colle `premium-worker/index.js`
   dans l'éditeur Cloudflare, clique **Deploy**.
3. **Envoie les 35 fragments vers KV** : ouvre
   `premium-worker/admin-upload-pdfs.html` dans ton navigateur, colle le
   jeton, et cette fois utilise le **deuxième** champ de fichiers
   ("Fragments de contenu des pages") — sélectionne les 35 fichiers dans
   `premium-worker/pdf-content-local/` (déjà préparés sur ton Mac, jamais
   poussés sur GitHub). Clique "Envoyer les fragments HTML vers KV".
4. **Supprime à nouveau `ADMIN_UPLOAD_TOKEN`** de Cloudflare une fois
   l'upload terminé.
5. **Préviens-moi** : je vérifierai qu'une fiche s'affiche bien pour un
   compte Premium, puis je pourrai supprimer le dossier
   `premium-worker/pdf-content-local/` (il n'est de toute façon jamais
   envoyé sur GitHub, mais autant faire le ménage une fois l'upload confirmé).

## Limite restante (acceptée)
Le code source du Worker (`premium-worker/index.js`) reste visible sur le
dépôt public GitHub (comme toujours pour un hébergement Pages gratuit) —
mais il ne contient aucune donnée, juste la logique. Le contenu réel des 35
fiches, lui, n'existe plus que dans KV.
