# Passage en mode LIVE — Premium Korean Stories

Check-list pour ouvrir les **vrais paiements** (clients réels) quand tu es prête.
Tant que tu n'as pas fait ces étapes, tout reste en **mode test** (gratuit, fausse carte `4242 4242 4242 4242`).

> 🔑 Règle d'or : les clés/secrets vont **uniquement dans Cloudflare** (Settings → Variables and Secrets), **jamais** dans le code du repo.

---

## 1. Activer ton compte Stripe (vérification entreprise)
- [ ] Stripe → **Activer le compte** : renseigner identité, activité (auto-entreprise), **IBAN** pour recevoir les virements.
- [ ] Vérifier que tu n'es **pas** assujettie à la TVA (franchise en base) → dans Stripe, ne pas activer Stripe Tax, ou le configurer en conséquence.

## 2. Créer les produits + liens de paiement en mode LIVE
- [ ] En haut à gauche de Stripe, **basculer le toggle « Mode test » → OFF** (tu es maintenant en live).
- [ ] Recréer les 2 produits (ils n'existent qu'en test pour l'instant) :
  - **Korean Stories — Premium** : 5 €/mois (récurrent)
  - **Korean Stories — Premium à vie** : 79 € (paiement unique)
- [ ] Créer un **Payment Link** pour chacun.
- [ ] Pour chaque lien : **Après le paiement → rediriger vers** `https://koreanstories.fr/premium-success.html`
- [ ] Noter les 2 nouvelles URLs (elles commencent par `https://buy.stripe.com/` **sans** `test_`).

## 3. Mettre à jour les liens dans le site
- [ ] Dans **`ks-premium.js`** (haut du fichier) : remplacer `BUY_URL_MONTHLY` et `BUY_URL_LIFETIME` par les liens live.
- [ ] Dans **`premium.html`** : remplacer les 2 `href` Stripe par les liens live.
- [ ] Bumper la version du cache dans **`sw.js`** (`const CACHE = 'ks-vX.X'`) puis `git push`.

## 4. Webhook Stripe en mode LIVE
- [ ] Stripe (mode live) → **Developers → Webhooks → Add endpoint**
  - URL : `https://ks-premium.delicate-voice-1d19.workers.dev/webhook`
  - Événements : `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Copier la **clé de signature** live (`whsec_...`).

## 5. Mettre à jour les secrets dans Cloudflare
Cloudflare → Worker `ks-premium` → **Settings → Variables and Secrets** :
- [ ] `STRIPE_SECRET_KEY` → la clé **live** (`sk_live_...`, depuis Stripe → Developers → API keys en mode live)
- [ ] `STRIPE_WEBHOOK_SECRET` → le `whsec_...` **live** de l'étape 4
- [ ] `RESEND_API_KEY` → inchangée (déjà bonne)
- [ ] `RESEND_FROM` (optionnel) → déjà `contact@koreanstories.fr` par défaut dans le code
- [ ] **Deploy** le Worker.

## 6. Mettre à jour les prix IDs dans le Worker (si changés)
- [ ] Dans `premium-worker/index.js`, `PRICE_MONTHLY` / `PRICE_LIFETIME` ne sont utilisés que pour info — le Worker se base sur `session.mode` (`payment` = à vie, `subscription` = mensuel), donc **rien à changer** côté logique. Mettre à jour les IDs seulement si tu veux garder la trace des bons produits.
- [ ] Copier-coller `premium-worker/index.js` dans l'éditeur Cloudflare + **Deploy** (le repo ne déploie pas tout seul).

## 7. Rouvrir le site au public
- [ ] Dans **`gate.js`** : `GATE_ENABLED = false` (retire le mot de passe « Jae »).
- [ ] Bumper `sw.js`, `git push`.

## 8. Test final en conditions réelles
- [ ] Faire **un vrai achat** (ta propre carte, petit montant) → vérifier : email de clé reçu, activation dans Réglages, virement Stripe à venir.
- [ ] (Tu peux te **rembourser** ce test depuis Stripe → Paiements → Rembourser.)

---

### Rappel coûts
- Stripe : ~1,5 % + 0,25 € par transaction réussie. Aucun frais fixe, aucun frais en l'absence de vente.
- Resend : gratuit jusqu'à 3 000 emails/mois.
- Cloudflare Worker + KV : gratuit (offre gratuite).
