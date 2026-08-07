# R2 : pas nécessaire aujourd'hui, prêt pour plus tard

## Ce qui a été décidé

Le Livret A1 sortait pixelisé parce qu'il était plafonné à 120 dpi. La cause
n'était pas un mauvais réglage de compression : Cloudflare KV refuse toute
valeur au-delà de **25 Mio**, et le livret est un PDF entièrement rasterisé
(280 photos de pages, aucun texte réel, 174 Mo en 300 dpi à la source).

La première piste était de déménager sur R2, qui n'a pas cette limite. Elle a
été écartée le 2026-08-07 : Cloudflare exige une carte enregistrée même pour le
palier gratuit, et cinq étapes de configuration pour un seul fichier, c'est
disproportionné.

## Ce qui a été fait à la place

Le fichier a été réencodé, et tient désormais dans KV **en 160 dpi** au lieu
de 120.

Le gain ne vient pas d'une compression plus agressive mais du **bon format par
page**. Le réflexe est de tout passer en JPEG ; or 266 des 280 pages sont du
texte et des aplats, moins de 8 000 couleurs distinctes. Sur ce type d'image le
JPEG est le mauvais outil — il dépense des octets à encoder du bruit qui
n'existe pas, et salit les contours du hangeul. Une palette indexée y est
nettement plus compacte, sans perte visible. Les 14 pages qui portent une photo
(~290 000 couleurs) restent en JPEG, qu'une palette détruirait.

Le choix se fait page par page en mesurant l'erreur réelle de quantification,
pas sur une supposition. Générateur : `scratchpad/livret/ecrire_pdf.py`.

Un détail qui a coûté du temps : PyMuPDF ré-étale toute image en RGB complet à
l'écriture, ce qui annulait entièrement le gain de la palette. Le PDF est donc
écrit directement, pour que les octets produits par l'encodeur arrivent
intacts dans le fichier.

## Quand R2 redeviendra utile

Le code du worker **sait déjà lire dans R2** (`servePdfFromR2`) et s'en passe
proprement quand le binding est absent — il retombe sur KV sans erreur. Rien à
écrire le jour où le besoin reviendra : un livret A2, B1 ou B2 plus lourd, ou
un livret A1 qu'on voudrait en 300 dpi (86 Mo).

Étapes, ce jour-là :

1. Cloudflare → **R2** → activer (carte demandée, rien n'est facturé sous 10 Go).
2. **Create bucket** nommé `korean-stories-files`, sans accès public.
3. ks-premium → Settings → **Bindings** → R2 bucket, variable `KS_FILES`.
4. Décommenter le bloc `[[r2_buckets]]` dans `wrangler.toml`.
5. Coller `index.js` dans l'éditeur Cloudflare, **Deploy**.
6. Envoyer le fichier : `admin-upload-pdfs.html` route automatiquement vers R2
   au-delà de 25 Mio.

⚠️ L'ordre compte. Un envoi de gros fichier avant l'étape 5 part dans la voie
KV, fait tomber le worker par épuisement mémoire, et le navigateur n'affiche
qu'un « erreur réseau » qui ne dit rien de la cause.

## Envoyer une nouvelle version du livret

Ouvrir `admin-upload-pdfs.html`, coller `ADMIN_UPLOAD_TOKEN`, choisir le
fichier. La destination est choisie automatiquement selon la taille.

Le nom du fichier local n'a **aucune importance** : la page l'enregistre
toujours sous `livret-a1`. C'est ce piège qui avait causé un « livret
introuvable » le 6 août, quand un fichier nommé `livret-a1-koreanstories.pdf`
était arrivé sous une clé que personne ne cherchait.

Supprimer `ADMIN_UPLOAD_TOKEN` une fois l'envoi terminé.

| Message | Cause |
|---|---|
| Erreur 403 | `ADMIN_UPLOAD_TOKEN` absent, faux, ou worker pas redéployé |
| « KV plafonne à 25 Mo » | fichier trop gros : il faut R2 (voir plus haut) |
| Le livret téléchargé a l'ancienne taille | l'envoi n'a pas abouti |
