# Passer le Livret A1 sur R2 (200 dpi)

**Pourquoi.** Le livret est un PDF entièrement rasterisé : 280 photos de pages,
aucun texte réel. Cloudflare KV, où il était rangé, plafonne à **25 Mo par
valeur**. Pour tenir dessous il fallait descendre à 120 dpi — d'où le rendu
pixelisé. Aucun réglage de compression n'y change rien : même 150 dpi pèse
33 Mo. R2 n'a pas cette limite. Le livret repasse donc à **200 dpi (53 Mo)**.

**Rien n'est cassé en attendant.** Tant que les étapes ci-dessous ne sont pas
faites, le worker continue de servir l'ancien fichier 120 dpi depuis KV, sans
erreur. Le basculement se fait au moment de l'envoi du nouveau fichier.

---

## 1. Activer R2

Cloudflare → **R2 Object Storage** → *Purchase R2* / *Enable*.

Cloudflare demande une **carte enregistrée même pour le palier gratuit**. C'est
une vérification, pas un paiement : le gratuit couvre 10 Go de stockage,
1 million d'opérations d'écriture et 10 millions de lectures par mois, et
**zéro frais de sortie**. Le livret occupe 53 Mo, soit 0,5 % du quota.

## 2. Créer le bucket

R2 → **Create bucket** → nom exact : `korean-stories-files`

Laisser la région sur automatique. **Ne pas** activer l'accès public : le
fichier est payant, il ne doit être accessible qu'à travers le worker, qui
vérifie la licence.

## 3. Brancher le bucket sur le worker

Workers & Pages → **ks-premium** → Settings → **Bindings** → *Add* → **R2 bucket**

- Variable name : `KS_FILES`
- R2 bucket : `korean-stories-files`

Le nom `KS_FILES` doit être exact — c'est celui que le code cherche.

## 4. Déployer le nouveau code du worker

Copier tout le contenu de `premium-worker/index.js` dans l'éditeur Cloudflare
du worker `ks-premium`, puis **Deploy**.

⚠️ Cette étape doit précéder l'envoi du fichier : c'est elle qui apprend au
worker à lire dans R2 et à accepter `?store=r2`.

## 5. Vérifier ADMIN_UPLOAD_TOKEN

Workers → ks-premium → Settings → **Variables and Secrets**.

S'il n'existe plus, en créer un : n'importe quelle longue chaîne aléatoire.
C'est ce qui protège la route d'envoi. Le garder pour l'étape 6, puis le
supprimer une fois l'envoi terminé.

## 6. Envoyer le livret

Ouvrir `premium-worker/admin-upload-pdfs.html` (double-clic, ça marche depuis
le disque), coller le jeton, choisir le fichier :

    Korean Stories Fichier/Livret/A1/livret-a1-200dpi.pdf

Le nom du fichier local n'a **aucune importance** : la page l'enregistre
toujours sous `livret-a1`. C'est ce piège précis qui avait causé un
« livret introuvable » le 6 août, quand un fichier nommé
`livret-a1-koreanstories.pdf` était arrivé sous une clé que personne ne
cherchait.

Une barre de progression suit l'envoi des 53 Mo.

## 7. Vérifier

Aller sur https://koreanstories.fr/livret-a1.html et télécharger. Le fichier
obtenu doit faire **53 Mo** (et non 24). Ouvrir une page, zoomer : le texte
coréen doit être net.

## 8. Refermer

Supprimer `ADMIN_UPLOAD_TOKEN` dans Cloudflare pour désactiver la route
d'envoi.

---

## Si ça ne marche pas

| Message | Cause |
|---|---|
| « R2 n'est pas branché sur ce worker » | étape 3 oubliée, ou worker pas redéployé après |
| Erreur 403 à l'envoi | `ADMIN_UPLOAD_TOKEN` absent, faux, ou worker pas redéployé |
| Erreur réseau après une longue attente | fichier au-dessus de 100 Mo (limite du plan gratuit) |
| Le livret téléchargé fait toujours 24 Mo | l'envoi n'a pas abouti : le worker retombe sur KV |

Le repli sur KV est volontaire : tant que R2 ne contient pas le fichier, le
livret reste téléchargeable dans son ancienne qualité plutôt que de renvoyer
une erreur à un client qui vient de payer.
