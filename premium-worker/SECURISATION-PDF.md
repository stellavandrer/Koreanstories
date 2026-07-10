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

## Limite assumée
Les 35 pages "fiche" HTML (`pdf/*.html`) affichent encore leur contenu
textuel complet dans le code source (visible via "Afficher le code source"
ou navigateur sans JS) — seul le fichier PDF téléchargeable est désormais
protégé. Corriger aussi ce point demanderait de restructurer ces 35 pages
pour charger leur contenu dynamiquement après vérification (chantier plus
lourd, à décider séparément si tu veux aller jusque-là).
