// Korean Stories — Premium License Worker
// Routes:
//   POST /webhook  — reçoit les événements Stripe
//   GET  /verify?key=XXX — vérifie une clé de licence depuis l'app
//   GET  /pdf?file=XXX (en-tête X-License-Key) — téléchargement sécurisé
//        d'une fiche PDF Premium, stockée dans KV (clé "pdf:<nom>"), jamais
//        exposée en fichier statique public. Entitlement par fichier : une
//        licence 'booklet-a1' (achat unique du Livret A1, 5€, hors Premium)
//        ne peut télécharger QUE file=livret-a1 (voir canAccessFile).
//   GET  /pdf-preview?file=XXX (en-tête X-License-Key) — renvoie le fragment
//        HTML (le contenu réel) d'une page pdf/<nom>.html, stocké dans KV
//        (clé "pdfpage:<nom>"). Les 35 pages pdf/*.html sont désormais des
//        coquilles vides côté statique : ks-pdf-content.js injecte ce
//        fragment dans le DOM seulement après vérification de la licence
//        (avant, tout le texte était visible en clair via "Voir le code
//        source" malgré l'overlay visuel — cf. audit du 2026-07-10).
//   POST /admin-upload-pdf?file=XXX&token=... — upload initial (une fois) d'un
//        PDF vers KV, protégé par ADMIN_UPLOAD_TOKEN. Voir
//        premium-worker/admin-upload-pdfs.html (outil local, pas d'CLI requis).
//   POST /admin-upload-pdfpage?file=XXX&token=... — même chose pour les
//        fragments HTML des pages pdf/*.html (texte brut au lieu de binaire).
//   POST /newsletter — inscription/désinscription newsletter (Resend Contacts)
//   GET  /newsletter/unsubscribe?email=… — lien de désinscription en un clic (depuis l'e-mail)
//   GET  /newsletter/test-send?theme=culture|histoire|actu&token=... — déclenchement
//        manuel d'une édition (test, ou renvoi si un Cron a raté son horaire).
//        Nécessite la variable NEWSLETTER_TEST_TOKEN (voir plus bas).
//
// Cron Triggers (à configurer dans Cloudflare → Worker ks-premium → Triggers) :
//   Chaque expression déclenche scheduled() ; on distingue via controller.cron.
//   Exemple : mar 9h  → '0 9 * * 2' (Culture)
//             jeu 9h  → '0 9 * * 4' (Histoire)
//             sam 9h  → '0 9 * * 6' (Actu & tendances)
//
// Variables d'environnement à configurer dans Cloudflare (jamais dans le code) :
//   STRIPE_SECRET_KEY       sk_live_...
//   STRIPE_WEBHOOK_SECRET   whsec_...
//   RESEND_API_KEY          re_...
//   NEWSLETTER_TEST_TOKEN   une chaîne aléatoire au choix (protège /newsletter/test-send)
//   ADMIN_UPLOAD_TOKEN      une chaîne aléatoire au choix (protège /admin-upload-pdf) —
//                           à supprimer de Cloudflare une fois les 31 PDF envoyés,
//                           l'endpoint devient alors inutilisable (KV write refusé).
// KV binding : KS_LICENSES

const PRICE_MONTHLY  = 'price_1TlkvnPab8Hr1KXaK2D5ZSvn';
const PRICE_LIFETIME = 'price_1TlkwTPab8Hr1KXaM5WwjXWX';
// Achat unique du Livret A1 (5€, hors abonnement Premium). Gardé ici pour
// référence uniquement (jamais lu par le code) : la détection réelle dans
// handleCheckout() se fait via session.metadata.product === 'livret-a1',
// une métadonnée posée sur ce Payment Link — pas via cet identifiant.
// ⚠️ Cette métadonnée DOIT être présente sur le Payment Link. Sans elle,
// handleCheckout() se rabat sur le montant payé (filet ajouté le 2026-08-06)
// et journalise un avertissement : le comportement reste correct, mais la
// configuration Stripe est alors à réparer.
const PAYMENT_LINK_BOOKLET_A1 = 'plink_1Ttj9fPab8Hr1KXarL7fCXzB'; // https://buy.stripe.com/fZu14p8NF1gZfT178ce7m02

// Tous les envois déclenchés via /newsletter/test-send partent vers cette
// adresse (jamais vers la vraie liste de contacts) — c'est un destinataire
// de test, pas un secret, donc pas besoin de variable d'environnement.
const NEWSLETTER_TEST_RECIPIENT = 'justinetilleul27@gmail.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse('', 204);
    }

    if (request.method === 'GET' && url.pathname === '/verify') {
      return handleVerify(request, env);
    }

    // Téléchargement d'une fiche PDF Premium : la vérification de licence se
    // fait ICI, côté serveur, avant de renvoyer le PDF (stocké dans KV, jamais
    // exposé en fichier statique public). Remplace l'ancien système où les
    // PDF étaient dans /pdf/ sur GitHub Pages, accessibles par URL directe
    // sans aucun contrôle (cf. audit sécurité du 2026-07-09).
    if (request.method === 'GET' && url.pathname === '/pdf') {
      return handlePdfDownload(request, env);
    }

    // Contenu (fragment HTML) d'une page de prévisualisation pdf/<nom>.html —
    // même vérification de licence que /pdf, cf. commentaire en tête de fichier.
    if (request.method === 'GET' && url.pathname === '/pdf-preview') {
      return handlePdfPreview(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/admin-upload-pdf') {
      return handleAdminUploadPdf(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/admin-upload-pdfpage') {
      return handleAdminUploadPdfPage(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/webhook') {
      return handleWebhook(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/newsletter') {
      return handleNewsletter(request, env);
    }

    // Alerte e-mail quand quelqu'un depose un avis (avis.html).
    if (request.method === 'POST' && url.pathname === '/review-notify') {
      return handleReviewNotify(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/newsletter/unsubscribe') {
      return handleNewsletterUnsubscribeLink(request, env);
    }

    // Déclenchement manuel d'une édition (test, ou renvoi si un Cron a raté
    // son horaire) — la route standard Cloudflare /cdn-cgi/handler/scheduled
    // ne fonctionne qu'en local (wrangler dev), pas sur un Worker déployé via
    // le dashboard, d'où cette route maison protégée par un jeton.
    if (request.method === 'GET' && url.pathname === '/newsletter/test-send') {
      const theme = url.searchParams.get('theme');
      const token = url.searchParams.get('token');
      if (!env.NEWSLETTER_TEST_TOKEN || token !== env.NEWSLETTER_TEST_TOKEN) return new Response('Forbidden', { status: 403 });
      if (!NEWSLETTER_CONTENT[theme]) return json({ success: false, message: 'Thème inconnu (culture/histoire/actu)' }, 400);
      await sendNewsletterEdition(theme, env, NEWSLETTER_TEST_RECIPIENT);
      return json({ success: true, message: `Édition ${theme} envoyée en test à ${NEWSLETTER_TEST_RECIPIENT}.` });
    }

    // Déclenchement manuel des e-mails licence/résiliation (normalement
    // envoyés par les webhooks Stripe) — mêmes garde-fous que /newsletter/test-send.
    if (request.method === 'GET' && url.pathname === '/test-send') {
      const type = url.searchParams.get('type');
      const token = url.searchParams.get('token');
      if (!env.NEWSLETTER_TEST_TOKEN || token !== env.NEWSLETTER_TEST_TOKEN) return new Response('Forbidden', { status: 403 });
      if (type === 'license') {
        await sendLicenseEmail(NEWSLETTER_TEST_RECIPIENT, 'TEST-DEMO-0000-KSFR', env);
      } else if (type === 'cancellation') {
        await sendCancellationEmail(NEWSLETTER_TEST_RECIPIENT, env, Math.floor(Date.now() / 1000) + 15 * 24 * 3600);
      } else if (type === 'trial-ended') {
        await sendCancellationEmail(NEWSLETTER_TEST_RECIPIENT, env, null, true);
      } else {
        return json({ success: false, message: 'Type inconnu (license/cancellation/trial-ended)' }, 400);
      }
      return json({ success: true, message: `E-mail ${type} envoyé en test à ${NEWSLETTER_TEST_RECIPIENT}.` });
    }

    return new Response('Korean Stories Premium API', { status: 200 });
  },

  // ── Cron Triggers : envoi hebdomadaire de la newsletter par thème ──────────
  // Cloudflare exécute scheduled() à chaque Cron Trigger configuré dans le
  // dashboard (Worker → Triggers). controller.cron indique QUELLE expression
  // a déclenché l'appel, ce qui permet de faire correspondre un jour à un thème.
  async scheduled(controller, env, ctx) {
    const theme = CRON_THEME[controller.cron];
    if (!theme) { console.log('[KS] cron inconnu, ignoré :', controller.cron); return; }
    ctx.waitUntil(sendNewsletterEdition(theme, env));
  }
};

// ── Mapping expression cron → thème de newsletter ─────────────────────────────
// À adapter si les horaires choisis dans Cloudflare diffèrent (garder les
// mêmes clés que les Cron Triggers ajoutés dans le dashboard).
const CRON_THEME = {
  '0 9 * * 2': 'culture',   // mardi 9h UTC
  '0 9 * * 4': 'histoire',  // jeudi 9h UTC
  '0 9 * * 6': 'actu'       // samedi 9h UTC
};

// ── Vérification d'une clé depuis l'app ──────────────────────────────────────
async function handleVerify(request, env) {
  const url = new URL(request.url);
  const key = (url.searchParams.get('key') || '').trim().toUpperCase();

  if (!key) return json({ success: false, message: 'Clé manquante' }, 400);

  const data = await env.KS_LICENSES.get(key, { type: 'json' });

  if (!data) return json({ success: false, message: 'Clé invalide' });

  if (data.type === 'monthly' && data.status !== 'active') {
    return json({ success: false, message: 'Abonnement expiré ou annulé' });
  }

  return json({ success: true, type: data.type, email: data.email });
}

// ── Entitlement par fichier ────────────────────────────────────────────────────
// monthly (actif) et lifetime donnent accès à toutes les fiches. Une licence
// 'booklet-a1' (achat unique du Livret A1 seul, hors Premium) ne donne accès
// QU'à ce livret — sans ce garde-fou, une clé à 5€ pourrait télécharger les
// 35+ autres fiches Premium via /pdf?file=<autre-fiche>.
function canAccessFile(license, file) {
  if (license.type === 'booklet-a1') return file === 'livret-a1';
  return true;
}

// ── Téléchargement sécurisé d'une fiche PDF Premium ───────────────────────────
// Les 35 fiches PDF (+ le Livret A1) sont stockées dans KV (clé "pdf:<nom>",
// valeur = octets bruts du PDF), jamais comme fichier statique public sur
// GitHub Pages. Upload initial : script upload-pdfs.sh (voir premium-worker/README
// ou PASSAGE-LIVE.md) à lancer une fois avec wrangler après déploiement.
async function handlePdfDownload(request, env) {
  const url = new URL(request.url);
  const file = (url.searchParams.get('file') || '').trim();
  const key = (request.headers.get('X-License-Key') || url.searchParams.get('key') || '').trim().toUpperCase();

  // Liste blanche stricte du nom de fichier (lettres/chiffres/tirets) pour
  // empêcher toute tentative de path traversal ou d'injection de clé KV.
  if (!/^[a-z0-9-]{1,60}$/.test(file)) {
    return corsResponse('Fichier invalide', 400);
  }
  if (!key) return corsResponse('Clé manquante', 401);

  if (await rateLimited(request, env, 'pdf', 40, 3600)) {
    return corsResponse('Trop de requêtes, réessaie dans un moment.', 429);
  }

  const data = await env.KS_LICENSES.get(key, { type: 'json' });
  if (!data) return corsResponse('Clé invalide', 403);
  if (data.type === 'monthly' && data.status !== 'active') {
    return corsResponse('Abonnement expiré ou annulé', 403);
  }
  if (!canAccessFile(data, file)) return corsResponse('Cette clé ne donne pas accès à cette fiche', 403);

  const pdfBytes = await env.KS_LICENSES.get('pdf:' + file, { type: 'arrayBuffer' });
  if (!pdfBytes) return corsResponse('Fiche introuvable', 404);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + file + '.pdf"',
      'Cache-Control': 'private, no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-License-Key'
    }
  });
}

// ── Contenu sécurisé d'une page de prévisualisation pdf/<nom>.html ────────────
// Les 35 pages pdf/*.html ne contiennent plus le texte des fiches en clair :
// leur div .wrap est vide (id="pdf-content", data-file="<nom>") et
// ks-pdf-content.js va chercher ce fragment ICI, après vérification de
// licence, avant de l'injecter dans le DOM. Remplace l'ancien ks-pdf-gate.js
// (overlay purement visuel, contournable via "Voir le code source").
async function handlePdfPreview(request, env) {
  const url = new URL(request.url);
  const file = (url.searchParams.get('file') || '').trim();
  const key = (request.headers.get('X-License-Key') || url.searchParams.get('key') || '').trim().toUpperCase();

  if (!/^[a-z0-9-]{1,60}$/.test(file)) {
    return corsResponse('Fichier invalide', 400);
  }
  if (!key) return corsResponse('Clé manquante', 401);

  if (await rateLimited(request, env, 'pdfpreview', 60, 3600)) {
    return corsResponse('Trop de requêtes, réessaie dans un moment.', 429);
  }

  const data = await env.KS_LICENSES.get(key, { type: 'json' });
  if (!data) return corsResponse('Clé invalide', 403);
  if (data.type === 'monthly' && data.status !== 'active') {
    return corsResponse('Abonnement expiré ou annulé', 403);
  }
  if (!canAccessFile(data, file)) return corsResponse('Cette clé ne donne pas accès à cette fiche', 403);

  const html = await env.KS_LICENSES.get('pdfpage:' + file, { type: 'text' });
  if (!html) return corsResponse('Page introuvable', 404);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-License-Key'
    }
  });
}

// ── Upload initial des PDF vers KV (à usage unique) ───────────────────────────
// Protégé par ADMIN_UPLOAD_TOKEN (variable Cloudflare, jamais dans le code).
// Utilisé une seule fois via premium-worker/admin-upload-pdfs.html (outil
// local, aucun CLI requis) pour envoyer les 31 PDF existants dans KV.
// Une fois l'upload terminé, supprime ADMIN_UPLOAD_TOKEN de Cloudflare pour
// désactiver définitivement cette route.
async function handleAdminUploadPdf(request, env) {
  const url = new URL(request.url);
  const file = (url.searchParams.get('file') || '').trim();
  const token = url.searchParams.get('token') || request.headers.get('X-Admin-Token') || '';

  // Anti brute-force du token, même si l'endpoint est déjà protégé par secret.
  // Plafond au-dessus de 31 (le nombre de fiches à envoyer en une fois).
  if (await rateLimited(request, env, 'admin-upload', 60, 3600)) {
    return corsResponse('Trop de requêtes.', 429);
  }
  if (!env.ADMIN_UPLOAD_TOKEN || token !== env.ADMIN_UPLOAD_TOKEN) {
    return corsResponse('Forbidden', 403);
  }
  if (!/^[a-z0-9-]{1,60}$/.test(file)) {
    return corsResponse('Nom de fichier invalide', 400);
  }

  const bytes = await request.arrayBuffer();
  if (!bytes || bytes.byteLength === 0) return corsResponse('Fichier vide', 400);

  await env.KS_LICENSES.put('pdf:' + file, bytes);
  return json({ success: true, file: file, bytes: bytes.byteLength });
}

// ── Upload initial des fragments HTML des pages pdf/*.html (à usage unique) ───
// Même principe et même jeton que handleAdminUploadPdf, mais stocke du texte
// (le contenu de la div .wrap extraite de chaque page) au lieu d'un binaire.
async function handleAdminUploadPdfPage(request, env) {
  const url = new URL(request.url);
  const file = (url.searchParams.get('file') || '').trim();
  const token = url.searchParams.get('token') || request.headers.get('X-Admin-Token') || '';

  if (await rateLimited(request, env, 'admin-upload', 60, 3600)) {
    return corsResponse('Trop de requêtes.', 429);
  }
  if (!env.ADMIN_UPLOAD_TOKEN || token !== env.ADMIN_UPLOAD_TOKEN) {
    return corsResponse('Forbidden', 403);
  }
  if (!/^[a-z0-9-]{1,60}$/.test(file)) {
    return corsResponse('Nom de fichier invalide', 400);
  }

  const html = await request.text();
  if (!html) return corsResponse('Contenu vide', 400);

  await env.KS_LICENSES.put('pdfpage:' + file, html);
  return json({ success: true, file: file, bytes: html.length });
}

// ── Newsletter : inscription / désinscription via Resend Contacts ────────────
// Base de contacts réelle (dashboard resend.com/audience, export CSV inclus) —
// remplace l'ancien flux FormSubmit (e-mail simple, sans base consultable).
// ── Limite de débit par IP (anti-inscription en masse) ───────────────────────
// Compteur stocké dans KV avec expiration : au-delà de `max` requêtes dans la
// fenêtre, on refuse (429). Note : KV est à cohérence éventuelle (propagation
// ~qq s entre edges), donc un attaquant très déterminé réparti sur plusieurs
// régions peut contourner à la marge — mais ça stoppe les scripts simples et
// les abus accidentels, ce qui est proportionné à l'enjeu (endpoint newsletter).
async function rateLimited(request, env, bucket, max, windowSec) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = 'rl:' + bucket + ':' + ip;
    const cur = parseInt(await env.KS_LICENSES.get(key) || '0', 10) || 0;
    if (cur >= max) return true;
    await env.KS_LICENSES.put(key, String(cur + 1), { expirationTtl: windowSec });
    return false;
  } catch (e) {
    // En cas d'erreur KV, on ne bloque pas un utilisateur légitime.
    return false;
  }
}

// ── Alerte e-mail : nouvel avis depose sur avis.html ──────────────────────────
// Sans ca, un avis arrive silencieusement dans Firestore en status "pending" et
// personne n'est prevenu — il faut penser a ouvrir la console Firebase. Cet
// endpoint ne fait qu'envoyer une notification : il n'ecrit rien, ne lit rien,
// et ne sert pas a publier l'avis (la moderation reste manuelle).
// Le contenu recu vient du public : il est tronque et echappe avant d'entrer
// dans le HTML de l'e-mail.
async function handleReviewNotify(request, env) {
  if (await rateLimited(request, env, 'review', 5, 3600)) {
    return corsResponse(JSON.stringify({ ok: false, error: 'rate_limited' }), 429);
  }
  let body = {};
  try { body = await request.json(); } catch (e) {}

  const esc = (v) => String(v == null ? '' : v)
    .replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  const name    = esc(body.name).slice(0, 40) || '(sans prenom)';
  const rating  = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 0));
  const comment = esc(body.comment).slice(0, 500);
  const isPublic = body.public === true;

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const html =
    '<div style="font-family:system-ui,sans-serif;max-width:520px">' +
      '<h2 style="font-family:Georgia,serif">Nouvel avis sur Korean Stories</h2>' +
      '<p style="font-size:20px;letter-spacing:2px;color:#C9A96E;margin:0 0 4px">' + stars + '</p>' +
      '<p style="margin:0 0 14px;color:#475E78"><strong>' + name + '</strong> — ' +
        (isPublic ? 'souhaite que son avis soit <strong>public</strong>' : 'avis <strong>prive</strong>, a ne pas publier') + '</p>' +
      (comment ? '<blockquote style="margin:0;padding:12px 16px;background:#F5F7FF;border-left:3px solid #C9A96E;white-space:pre-wrap">' + comment + '</blockquote>' : '<p><em>Aucun commentaire ecrit.</em></p>') +
      '<p style="font-size:13px;color:#8FA5BE;margin-top:20px">' +
        'Il est enregistre en <strong>pending</strong> : il ne s\'affichera sur avis.html que ' +
        'si tu passes son champ <code>status</code> a <code>approved</code> dans la console ' +
        'Firebase (Firestore → collection <code>reviews</code>).</p>' +
    '</div>';

  try {
    await sendEmail(env.REVIEW_NOTIFY_TO || 'contact@koreanstories.fr',
                    'Nouvel avis (' + rating + '/5) sur Korean Stories', html, env);
  } catch (e) {
    console.log('[KS] review-notify send error', e);
  }
  // On repond toujours OK : l'avis est deja enregistre cote Firestore, un echec
  // d'e-mail ne doit jamais faire croire a la visiteuse que son avis est perdu.
  return corsResponse(JSON.stringify({ ok: true }), 200);
}

async function handleNewsletter(request, env) {
  // Max 6 opérations (inscription/désinscription) par IP par heure.
  if (await rateLimited(request, env, 'newsletter', 6, 3600)) {
    return json({ success: false, message: 'Trop de tentatives, réessaie dans un moment.' }, 429);
  }

  let body;
  try { body = await request.json(); } catch { return json({ success: false, message: 'Requête invalide' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  // Prénom facultatif (utilisé pour personnaliser le salut dans les e-mails) —
  // tronqué et nettoyé, jamais bloquant si absent ou mal formé.
  const firstName = (body.firstName || '').trim().slice(0, 40).replace(/[<>]/g, '') || null;
  const unsubscribe = body.action === 'unsubscribe';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, message: 'E-mail invalide' }, 400);
  }

  if (unsubscribe) {
    const ok = await resendUnsubscribe(email, env);
    if (!ok) return json({ success: false, message: 'Erreur serveur' }, 502);
    await sendNewsletterGoodbyeEmail(email, env);
    return json({ success: true });
  }

  const ok = await resendSubscribe(email, env, firstName);
  if (!ok) return json({ success: false, message: 'Erreur serveur' }, 502);
  await sendNewsletterWelcomeEmail(email, env, firstName);
  return json({ success: true });
}

// ── Lien de désinscription en un clic (ouvert depuis l'e-mail, GET simple) ───
async function handleNewsletterUnsubscribeLink(request, env) {
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  const page = (title, msg) => new Response(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${title} — Korean Stories</title>
     <meta name="viewport" content="width=device-width,initial-scale=1"></head>
     <body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:0 24px;text-align:center;color:#0F1B2D">
       <h2>${title}</h2><p>${msg}</p>
       <p style="margin-top:24px"><a href="https://koreanstories.fr" style="color:#B8924E;font-weight:bold">← Retour à Korean Stories</a></p>
     </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return page('E-mail invalide', "Le lien utilisé n'est pas valide.");
  }
  const ok = await resendUnsubscribe(email, env);
  if (!ok) return page('Erreur', "Une erreur est survenue, réessaie plus tard ou écris-nous à contact@koreanstories.fr.");
  await sendNewsletterGoodbyeEmail(email, env);
  return page('Désinscription confirmée', `L'adresse <strong>${email}</strong> ne recevra plus la newsletter Korean Stories.`);
}

// ── Resend Contacts : inscrire / désinscrire (partagé POST JSON + lien e-mail) ──
async function resendUnsubscribe(email, env) {
  const headers = { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' };
  const res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
    method: 'PATCH', headers, body: JSON.stringify({ unsubscribed: true })
  });
  // 404 = le contact n'existait pas → rien à désinscrire, on considère que c'est OK.
  if (!res.ok && res.status !== 404) {
    console.log('[KS] newsletter unsubscribe error', res.status, await res.text());
    return false;
  }
  return true;
}

async function resendSubscribe(email, env, firstName = null) {
  const headers = { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' };
  const payload = { email, unsubscribed: false };
  if (firstName) payload.first_name = firstName;
  let res = await fetch('https://api.resend.com/contacts', {
    method: 'POST', headers, body: JSON.stringify(payload)
  });
  if (!res.ok) {
    console.log('[KS] newsletter create response', res.status, await res.text());
    const { email: _omit, ...patchPayload } = payload;
    res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH', headers, body: JSON.stringify(patchPayload)
    });
    if (!res.ok) {
      console.log('[KS] newsletter reactivate error', res.status, await res.text());
      return false;
    }
  }
  return true;
}

// ── Réception des webhooks Stripe ─────────────────────────────────────────────
async function handleWebhook(request, env) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  let event;
  try {
    event = await verifyStripeWebhook(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckout(event.data.object, env);
      break;
    case 'invoice.payment_succeeded':
      await handleRenewal(event.data.object, env);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event, env);            // résiliation programmée → email immédiat
      break;
    case 'customer.subscription.deleted':
      await handleCancellation(event.data.object, env, true);  // fin de période → désactivation (+ email si pas déjà envoyé)
      break;
    case 'invoice.payment_failed':
      await handleCancellation(event.data.object, env, false); // échec paiement → pas d'email
      break;
  }

  return new Response('OK', { status: 200 });
}

// ── Nouveau paiement (abonnement, à vie, ou Livret A1 seul) ───────────────────
async function handleCheckout(session, env) {
  const email = session.customer_email || session.customer_details?.email;
  console.log('[KS] checkout email:', email, '| mode:', session.mode);
  if (!email) { console.log('[KS] no email found, aborting'); return; }

  // Achat du Livret A1 seul (Payment Link distinct, 5€, hors abonnement) :
  // reconnu via la métadonnée `product=livret-a1` posée sur le Payment Link
  // Stripe (Stripe la reporte automatiquement sur la Checkout Session).
  const bookletByMeta = session.metadata?.product === 'livret-a1';

  // ⚠️ FILET DE SÉCURITÉ — NE PAS RETIRER.
  // Si cette métadonnée manque sur le Payment Link (oubli de configuration,
  // lien recréé, duplication), l'achat du livret retombe silencieusement dans
  // la branche `mode === 'payment'` ci-dessous, c'est-à-dire l'ACCÈS À VIE :
  // 79€ de produit livrés pour 5€, sans aucune alerte. On recoupe donc avec
  // le montant réellement payé.
  //
  // Seuil : les deux seuls paiements en mode 'payment' sont l'accès à vie
  // (79€) et le livret (5€). 30€ les sépare largement. En cas d'erreur, le
  // sens de l'échec compte : sous-attribuer se rattrape d'un message, alors
  // qu'un accès à vie donné par erreur est irrécupérable.
  //
  // ⚠️ Si le prix de l'accès à vie passe un jour SOUS 30€ (promotion, offre
  // de lancement), il faut baisser ce seuil, sinon les acheteurs à vie ne
  // recevront que le livret.
  const LIFETIME_MIN_CENTS = 3000;
  const cents = typeof session.amount_total === 'number' ? session.amount_total : null;
  const bookletByAmount = session.mode === 'payment'
                       && cents !== null
                       && cents < LIFETIME_MIN_CENTS;

  if (bookletByMeta || bookletByAmount) {
    if (!bookletByMeta) {
      console.warn('[KS] Livret reconnu par le MONTANT (' + cents + ' centimes) et non par ' +
        'la métadonnée : le Payment Link Stripe n\'a pas product=livret-a1. ' +
        'À corriger dans le dashboard Stripe — sans ce filet, cet achat ' +
        'aurait donné un accès à vie.');
    }
    return handleBookletCheckout(session, email, env);
  }

  const isLifetime = session.mode === 'payment';
  // 'paid' = déjà prélevé à l'instant du checkout (achat à vie, ou abonnement
  // sans période d'essai). 'no_payment_required' = essai gratuit démarré sans
  // moyen de paiement — encore rien facturé. Sert à adapter l'email si ça
  // se termine sans qu'aucun prélèvement n'ait jamais eu lieu (cf handleCancellation).
  const charged = session.payment_status === 'paid';

  // Clé existante ? On la réactive
  const existingKey = await env.KS_LICENSES.get(`email:${email}`);
  if (existingKey) {
    const data = await env.KS_LICENSES.get(existingKey, { type: 'json' });
    if (data) {
      data.status = 'active';
      data.everCharged = data.everCharged || charged;
      if (isLifetime) data.type = 'lifetime';
      else if (data.type === 'booklet-a1') data.type = 'monthly'; // upgrade : avait juste le livret, prend un abonnement
      await env.KS_LICENSES.put(existingKey, JSON.stringify(data));
      if (session.customer) await env.KS_LICENSES.put('cust:' + session.customer, existingKey);
      await sendLicenseEmail(email, existingKey, env);
      return;
    }
  }

  // Nouvelle clé
  const key = generateKey();
  await env.KS_LICENSES.put(key, JSON.stringify({
    email,
    type: isLifetime ? 'lifetime' : 'monthly',
    status: 'active',
    everCharged: charged,
    createdAt: new Date().toISOString(),
    stripeCustomerId: session.customer || null
  }));
  await env.KS_LICENSES.put(`email:${email}`, key);
  // Index inverse client → clé (permet de retrouver la licence à la résiliation,
  // car l'événement subscription.deleted ne contient pas l'e-mail).
  if (session.customer) await env.KS_LICENSES.put('cust:' + session.customer, key);
  await sendLicenseEmail(email, key, env);
}

// ── Achat unique du Livret A1 (hors Premium) ──────────────────────────────────
// Une licence 'booklet-a1' ne donne accès qu'au Livret A1 (cf. canAccessFile) —
// jamais aux 35 autres fiches Premium. Si la personne a déjà une licence
// monthly/lifetime, elle a déjà accès au livret : on ne crée rien de plus et on
// le lui rappelle, plutôt que d'écraser sa licence existante par un downgrade.
async function handleBookletCheckout(session, email, env) {
  const existingKey = await env.KS_LICENSES.get(`email:${email}`);
  if (existingKey) {
    const data = await env.KS_LICENSES.get(existingKey, { type: 'json' });
    if (data) {
      if (data.type === 'monthly' || data.type === 'lifetime') {
        await sendBookletAlreadyPremiumEmail(email, env);
        return;
      }
      // Déjà une clé 'booklet-a1' (rachat, ou changement d'e-mail) : idempotent.
      data.status = 'active';
      await env.KS_LICENSES.put(existingKey, JSON.stringify(data));
      if (session.customer) await env.KS_LICENSES.put('cust:' + session.customer, existingKey);
      await sendBookletEmail(email, existingKey, env);
      return;
    }
  }

  const key = generateKey();
  await env.KS_LICENSES.put(key, JSON.stringify({
    email,
    type: 'booklet-a1',
    status: 'active',
    everCharged: true,
    createdAt: new Date().toISOString(),
    stripeCustomerId: session.customer || null
  }));
  await env.KS_LICENSES.put(`email:${email}`, key);
  if (session.customer) await env.KS_LICENSES.put('cust:' + session.customer, key);
  await sendBookletEmail(email, key, env);
}

// ── Renouvellement mensuel ────────────────────────────────────────────────────
async function handleRenewal(invoice, env) {
  const email = invoice.customer_email;
  if (!email) return;

  const key = await env.KS_LICENSES.get(`email:${email}`);
  if (!key) return;

  const data = await env.KS_LICENSES.get(key, { type: 'json' });
  if (data && data.type === 'monthly') {
    data.status = 'active';
    data.everCharged = true;
    await env.KS_LICENSES.put(key, JSON.stringify(data));
  }
}

// ── Annulation / échec ────────────────────────────────────────────────────────
async function handleCancellation(obj, env, notify) {
  // obj = subscription (subscription.deleted) ou invoice (payment_failed).
  // On retrouve la clé via l'index client (l'e-mail n'est pas dans subscription.deleted),
  // avec repli sur l'e-mail si présent (ex. invoice.payment_failed).
  const key = await findLicenseKey(obj, env);
  if (!key) { console.log('[KS] résiliation : licence introuvable pour', obj.customer || obj.customer_email); return; }

  const data = await env.KS_LICENSES.get(key, { type: 'json' });
  if (data && data.type === 'monthly') {
    data.status = 'cancelled';
    console.log('[KS] licence résiliée :', key);
    if (notify && data.email && !data.cancelEmailSent) await sendCancellationEmail(data.email, env, null, !data.everCharged);
    await env.KS_LICENSES.put(key, JSON.stringify(data));
  }
}

// ── Résiliation programmée (à la fin de période) → confirmation immédiate ────────
async function handleSubscriptionUpdated(event, env) {
  const sub = event.data.object;
  console.log('[KS] sub.updated | cancel_at_period_end:', sub.cancel_at_period_end, '| cust:', sub.customer);

  const key = await findLicenseKey(sub, env);
  if (!key) { console.log('[KS] sub.updated : licence introuvable pour', sub.customer); return; }
  const data = await env.KS_LICENSES.get(key, { type: 'json' });
  if (!data) { console.log('[KS] sub.updated : données licence absentes', key); return; }

  if (sub.cancel_at_period_end === true) {
    // Résiliation programmée. L'accès reste ACTIF jusqu'à la fin de période.
    // Garde anti-doublon : on n'envoie l'e-mail qu'une fois.
    if (!data.cancelEmailSent && data.email) {
      await sendCancellationEmail(data.email, env, sub.current_period_end || sub.cancel_at, !data.everCharged);
      data.cancelEmailSent = true;
      await env.KS_LICENSES.put(key, JSON.stringify(data));
      console.log('[KS] résiliation programmée → e-mail envoyé à', data.email);
    } else {
      console.log('[KS] résiliation déjà notifiée, e-mail non renvoyé');
    }
  } else if (data.cancelEmailSent) {
    // Réabonnement / réactivation : on réarme pour une future résiliation.
    data.cancelEmailSent = false;
    await env.KS_LICENSES.put(key, JSON.stringify(data));
    console.log('[KS] abonnement réactivé → garde e-mail réarmée');
  }
}

// ── Envoi générique d'un e-mail via Resend ────────────────────────────────────
// Domaine koreanstories.fr vérifié dans Resend → envoi depuis l'adresse du
// site. Surchargeable via la variable RESEND_FROM dans Cloudflare si besoin.
async function sendEmail(to, subject, html, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'Korean Stories <contact@koreanstories.fr>',
      to, subject, html
    })
  });
  const resJson = await res.json();
  console.log('[KS] Resend send:', to, '|', subject, '|', JSON.stringify(resJson));
  return resJson;
}

// ── Mise en page HTML partagée (branding cohérent sur tous les emails) ───────
// Structure en tables (compatible Outlook/Gmail/Apple Mail) : bandeau logo sur
// fond marine, bandeau « héros » coloré optionnel (utilisé par la newsletter),
// corps de texte, pied de page avec lien de désinscription optionnel.
function emailLayout({ preheader = '', kicker = '', title = '', hero = null, bodyHtml = '', noteHtml = '', related = null, ctaLabel = 'Continuer mon apprentissage', ctaUrl = 'https://koreanstories.fr/app.html', unsubUrl = null }) {
  // Héros : soit une vraie illustration du site (bandeau photo + bandeau de
  // légende coloré en dessous), soit — à défaut d'image dédiée pour le sujet —
  // une carte de couleur pleine avec le mot-clé en hangeul en grand.
  const heroBlock = hero ? (hero.image ? `
        <tr><td style="padding:24px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden">
            <tr><td><img src="${hero.image}" width="496" alt="${hero.sub || ''}" style="display:block;width:100%;max-width:496px;height:auto"/></td></tr>
            <tr><td style="background:${hero.bg};padding:14px 20px;text-align:center">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${hero.color};font-weight:700">${hero.word}</span>
              ${hero.sub ? `<span style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${hero.color};opacity:.85;margin-left:10px">${hero.sub}</span>` : ''}
            </td></tr>
          </table>
        </td></tr>` : `
        <tr><td style="padding:24px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${hero.bg};border-radius:16px;padding:36px 24px;text-align:center">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:${hero.fontSize}px;line-height:1.15;color:${hero.color};font-weight:700">${hero.word}</div>
              ${hero.sub ? `<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${hero.color};opacity:.85;margin-top:12px">${hero.sub}</div>` : ''}
            </td></tr>
          </table>
        </td></tr>`) : '';

  const noteBlock = noteHtml ? `
        <tr><td style="padding:4px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#FBF2E3;border:1px solid #E0CBA0;border-radius:12px;padding:16px 18px">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8B6B3D;font-weight:700">✦ À retenir</p>
              <div style="font-size:14px;line-height:1.6;color:#0D1823">${noteHtml}</div>
            </td></tr>
          </table>
        </td></tr>` : '';

  // Carte « Pour aller plus loin » : renvoie vers un vrai contenu du site
  // (BD, article, podcast, jeu, dictionnaire) en lien avec le sujet du jour —
  // un CTA thématique en plus du CTA générique vers l'app, en bas d'email.
  const relatedBlock = related ? `
        <tr><td style="padding:16px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#F5F8FF;border:1px solid #DAE3F2;border-radius:12px;padding:18px 20px">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8FA5BE;font-weight:700">Pour aller plus loin</p>
              <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#0F1B2D;line-height:1.4">${related.label}</p>
              <a href="${related.url}" style="display:inline-block;background:#0F1B2D;color:#FFFFFF;font-size:13px;font-weight:700;padding:10px 20px;border-radius:999px;text-decoration:none">${related.cta} →</a>
            </td></tr>
          </table>
        </td></tr>` : '';

  const unsubLine = unsubUrl
    ? `<p style="margin:10px 0 0;font-size:11px"><a href="${unsubUrl}" style="color:#8FA5BE;text-decoration:underline">Se désabonner</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#EEF2FB;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2FB">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #DAE3F2">
        <tr><td style="background:#0F1B2D;padding:24px 32px;text-align:center">
          <span style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:21px;font-weight:800;color:#FFFFFF;letter-spacing:-.01em">Korean </span><span style="font-family:Georgia,'Times New Roman',serif;font-size:23px;font-style:italic;font-weight:700;color:#CAA96E">Stories</span>
        </td></tr>
        ${heroBlock}
        <tr><td style="padding:${hero ? '24px' : '36px'} 32px 8px">
          ${kicker ? `<p style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#B8924E;font-weight:700;margin:0 0 12px">${kicker}</p>` : ''}
          <div style="font-size:15px;line-height:1.75;color:#0D1823">${bodyHtml}</div>
        </td></tr>
        ${noteBlock}
        ${relatedBlock}
        <tr><td style="padding:26px 32px 4px;text-align:center">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
            <tr><td style="background:#B8924E;border-radius:999px">
              <a href="${ctaUrl}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none">${ctaLabel}</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 0"><div style="border-top:1px solid #DAE3F2;font-size:0;line-height:0">&nbsp;</div></td></tr>
        <tr><td style="padding:18px 32px 30px;text-align:center">
          <p style="margin:0;font-size:12px;color:#8FA5BE">Korean Stories · koreanstories.fr</p>
          ${unsubLine}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Email de licence via Resend ───────────────────────────────────────────────
async function sendLicenseEmail(email, key, env) {
  const bodyHtml = `
    <p>Merci pour ton soutien — tu fais partie de l'aventure !</p>
    <p style="margin-bottom:8px"><strong>Ta clé de licence :</strong></p>
    <p style="font-size:22px;font-weight:bold;letter-spacing:6px;
              background:#FBF2E3;padding:16px 24px;border-radius:10px;
              text-align:center;color:#0F1B2D">${key}</p>
    <h3 style="color:#0F1B2D;margin-bottom:8px">Comment activer le Premium :</h3>
    <ol style="line-height:2;margin-top:0">
      <li>Ouvre l'app <strong>Korean Stories</strong></li>
      <li>Va dans <strong>Réglages</strong></li>
      <li>Section <strong>Premium</strong> → clique sur « Voir »</li>
      <li>Colle ta clé → clique sur <strong>Débloquer</strong></li>
    </ol>
    <p>Conserve cet email précieusement — ta clé est unique.</p>
    <p style="font-size:13px;color:#475E78">Abonnement mensuel : tu peux le gérer ou le résilier à tout moment depuis le
      <a href="https://billing.stripe.com/p/login/5kQbJ35BtcZH36f1NSe7m00" style="color:#B8924E">portail client sécurisé</a>.</p>
  `;
  const hero = { word: '💛', sub: 'Accès Premium débloqué', bg: 'linear-gradient(135deg,#B8924E,#CAA96E)', color: '#1a1208', fontSize: 48 };
  const html = emailLayout({ preheader: 'Ta clé Premium Korean Stories', title: 'Ta clé Premium', kicker: 'Korean Stories · Premium', hero, bodyHtml });
  await sendEmail(email, '💛 Ta clé Premium Korean Stories', html, env);
}

// ── Email de la clé Livret A1 (achat unique, hors Premium) ────────────────────
async function sendBookletEmail(email, key, env) {
  const bodyHtml = `
    <p>Merci pour ton achat — ton Livret A1 t'attend !</p>
    <p style="margin-bottom:8px"><strong>Ta clé d'accès :</strong></p>
    <p style="font-size:22px;font-weight:bold;letter-spacing:6px;
              background:#FBF2E3;padding:16px 24px;border-radius:10px;
              text-align:center;color:#0F1B2D">${key}</p>
    <h3 style="color:#0F1B2D;margin-bottom:8px">Comment télécharger ton livret :</h3>
    <ol style="line-height:2;margin-top:0">
      <li>Va sur <strong>koreanstories.fr/livret-a1.html</strong></li>
      <li>Colle ta clé dans le champ prévu</li>
      <li>Clique sur <strong>Télécharger le PDF</strong></li>
    </ol>
    <p>Conserve cet email précieusement — ta clé est unique et personnelle.</p>
    <p style="font-size:13px;color:#475E78">Ce livret est réservé à ton usage personnel : merci de ne pas le partager ni le publier en ligne.</p>
  `;
  const hero = { word: '📘', sub: 'Ton Livret A1 est prêt', bg: 'linear-gradient(135deg,#B8924E,#CAA96E)', color: '#1a1208', fontSize: 48 };
  const html = emailLayout({ preheader: 'Ton Livret A1 Korean Stories', title: 'Ton Livret A1', kicker: 'Korean Stories · Livret A1', hero, bodyHtml, ctaLabel: 'Télécharger mon livret', ctaUrl: 'https://koreanstories.fr/livret-a1.html' });
  await sendEmail(email, '📘 Ton Livret A1 est prêt — Korean Stories', html, env);
}

// ── Email si la personne a acheté le Livret A1 alors qu'elle a déjà Premium ───
// Son abonnement/accès à vie lui donne déjà accès au livret gratuitement — on
// l'en informe plutôt que de créer une licence 'booklet-a1' qui pourrait prêter
// à confusion à côté de sa licence monthly/lifetime existante.
async function sendBookletAlreadyPremiumEmail(email, env) {
  const bodyHtml = `
    <p>Bonne nouvelle : ton compte a déjà accès au Premium Korean Stories, ce qui inclut le <strong>Livret A1</strong> gratuitement.</p>
    <p>Aucune clé supplémentaire n'est nécessaire — utilise simplement ta clé Premium existante sur <strong>koreanstories.fr/livret-a1.html</strong> pour le télécharger.</p>
    <p style="font-size:13px;color:#475E78">On a annulé ce paiement en double de notre côté — si un remboursement est nécessaire, écris-nous à contact@koreanstories.fr.</p>
  `;
  const hero = { word: '💛', sub: 'Déjà inclus dans ton Premium', bg: 'linear-gradient(135deg,#B8924E,#CAA96E)', color: '#1a1208', fontSize: 48 };
  const html = emailLayout({ preheader: 'Le Livret A1 est déjà inclus dans ton Premium', title: 'Déjà inclus dans ton Premium', kicker: 'Korean Stories · Livret A1', hero, bodyHtml, ctaLabel: 'Télécharger mon livret', ctaUrl: 'https://koreanstories.fr/livret-a1.html' });
  await sendEmail(email, 'Ton Livret A1 est déjà inclus dans ton Premium — Korean Stories', html, env);
}

// ── Date au format français (sans dépendre de l'ICU du runtime) ──────────────────
function frDate(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return d.getUTCDate() + ' ' + mois[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

// ── Email de confirmation de résiliation via Resend ──────────────────────────────
// trialOnly = true : l'essai gratuit s'est terminé sans qu'aucun prélèvement
// n'ait jamais eu lieu (pas de moyen de paiement enregistré) — on évite de
// parler de « résiliation » ou de remercier pour un soutien qui n'a pas eu lieu.
async function sendCancellationEmail(email, env, endTs, trialOnly = false) {
  if (trialOnly) {
    const bodyHtml = `
      <p>Ton essai gratuit Premium à Korean Stories est terminé — aucun moyen de paiement n'étant enregistré, aucun prélèvement n'a eu lieu.</p>
      <p>Tout le parcours d'apprentissage reste évidemment <strong>gratuit</strong> — tu peux continuer à apprendre sans rien changer.</p>
      <p style="font-size:13px;color:#475E78">Tu veux retrouver les avantages Premium (PDF, certificat, etc.) ? Tu peux t'abonner à tout moment depuis la page Premium. Merci d'avoir testé Korean Stories 💛</p>
    `;
    const hero = { word: '또 만나요', sub: 'Essai terminé', bg: 'linear-gradient(135deg,#0F1B2D,#1a2f4a)', color: '#D5BA8A', fontSize: 30 };
    const html = emailLayout({ preheader: "Ton essai gratuit s'est terminé", title: 'Essai terminé', kicker: 'Korean Stories · Premium', hero, bodyHtml });
    await sendEmail(email, "Ton essai gratuit Korean Stories Premium est terminé", html, env);
    return;
  }

  const endStr = frDate(endTs);
  const endLine = endStr
    ? `Ton accès Premium reste actif jusqu'au <strong>${endStr}</strong>, puis s'arrête sans nouveau prélèvement.`
    : `Tu conserves l'accès Premium jusqu'à la <strong>fin de la période déjà payée</strong> ; aucun nouveau prélèvement ne sera effectué ensuite.`;
  const bodyHtml = `
    <p>Ton abonnement Premium mensuel à Korean Stories a bien été résilié.</p>
    <p>${endLine}</p>
    <p>Tout le parcours d'apprentissage reste évidemment <strong>gratuit</strong> — tu peux continuer à apprendre sans rien changer.</p>
    <p style="font-size:13px;color:#475E78">Tu changes d'avis ? Tu peux te réabonner à tout moment depuis la page Premium. Merci d'avoir soutenu le projet 💛</p>
  `;
  const hero = { word: '조심히 가요', sub: 'Résiliation confirmée', bg: 'linear-gradient(135deg,#0F1B2D,#1a2f4a)', color: '#D5BA8A', fontSize: 30 };
  const html = emailLayout({ preheader: 'Confirmation de résiliation', title: 'Résiliation confirmée', kicker: 'Korean Stories · Premium', hero, bodyHtml });
  await sendEmail(email, 'Confirmation de résiliation — Korean Stories', html, env);
}

// ── Emails newsletter (bienvenue / désinscription) via Resend ────────────────
async function sendNewsletterWelcomeEmail(email, env, firstName = null) {
  const unsubUrl = 'https://ks-premium.delicate-voice-1d19.workers.dev/newsletter/unsubscribe?email=' + encodeURIComponent(email);
  const bodyHtml = `
    <p style="font-weight:700;margin:0 0 10px">Salut${firstName ? ' ' + firstName : ''} !</p>
    <p>Merci de t'être inscrit·e ! Tu recevras jusqu'à <strong>3 e-mails par semaine</strong>, chacun sur un thème différent :</p>
    <ul style="line-height:1.9;padding-left:20px">
      <li><strong>Culture</strong> — traditions, cuisine, vie quotidienne en Corée</li>
      <li><strong>Histoire</strong> — dynasties, grandes figures, événements marquants</li>
      <li><strong>Tendances</strong> — Hallyu, société coréenne d'aujourd'hui</li>
    </ul>
    <p>En attendant, continue ton parcours sur <a href="https://koreanstories.fr/app.html" style="color:#B8924E">koreanstories.fr</a>.</p>
  `;
  const hero = { word: '환영해요', sub: 'Bienvenue dans la newsletter', bg: 'linear-gradient(135deg,#B8924E,#CAA96E)', color: '#1a1208', fontSize: 34 };
  const html = emailLayout({ preheader: 'Bienvenue dans la newsletter Korean Stories', title: 'Bienvenue', kicker: 'Korean Stories · Newsletter', hero, bodyHtml, unsubUrl });
  await sendEmail(email, 'Bienvenue dans la newsletter Korean Stories', html, env);
}

async function sendNewsletterGoodbyeEmail(email, env) {
  const bodyHtml = `
    <p>Tu ne recevras plus la newsletter Korean Stories. C'est noté !</p>
    <p style="font-size:13px;color:#475E78">Tu changes d'avis ? Tu peux te réinscrire à tout moment depuis <a href="https://koreanstories.fr" style="color:#B8924E">koreanstories.fr</a> ou tes Réglages.</p>
  `;
  const hero = { word: '안녕', sub: 'Désinscription confirmée', bg: 'linear-gradient(135deg,#0F1B2D,#1a2f4a)', color: '#D5BA8A', fontSize: 44 };
  const html = emailLayout({ preheader: 'Désinscription confirmée', title: 'Désinscription confirmée', kicker: 'Korean Stories · Newsletter', hero, bodyHtml });
  await sendEmail(email, 'Désinscription confirmée — Korean Stories', html, env);
}

// ── Contenu des 3 séries de newsletter ────────────────────────────────────────
// Chaque thème a sa propre liste d'éditions. On tourne dans l'ordre (KV garde
// l'index) puis on recommence au début — ajouter de nouvelles éditions ici à
// tout moment (pas besoin de toucher au reste du code).
const NEWSLETTER_CONTENT = {
  culture: [
    { subject: 'Le hanbok, bien plus qu\'un costume', hangeul: '한복', title: 'Le hanbok',
      hook: 'Un hanbok, ce n\'est jamais juste un vêtement — sous Joseon, c\'était presque une carte d\'identité brodée.',
      related: { label: 'Suis Emma en hanbok à Gyeongbokgung, le grand palais de Séoul.', cta: 'Lire l\'histoire', url: 'https://koreanstories.fr/histoire29.html', image: 'https://koreanstories.fr/img/stories/histoire29.webp' }, html:
      `<p>Le <strong>hanbok</strong> (한복) est le vêtement traditionnel coréen, porté aujourd'hui surtout lors des grandes occasions : Seollal (nouvel an lunaire), Chuseok, mariages.</p>
       <p>Il se compose pour les femmes d'un <strong>jeogori</strong> (veste courte) et d'une <strong>chima</strong> (jupe ample et haute), et pour les hommes d'un <strong>jeogori</strong> plus long porté avec un <strong>baji</strong> (pantalon bouffant). Les couleurs et motifs n'étaient pas choisis au hasard sous Joseon : elles indiquaient le rang social, l'âge ou le statut marital.</p>
       <p>Aujourd'hui, de nombreux jeunes Coréens louent un hanbok moderne pour visiter les palais de Séoul (comme Gyeongbokgung) — l'entrée y est même gratuite si tu en portes un !</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>한복이 예뻐요</strong> (hanbogi yeoppeoyo) — « le hanbok est joli ».</p>` },
    { subject: 'Le kimchi, un art plus qu\'un plat', hangeul: '김치', title: 'Le kimchi',
      hook: 'Il existe plus d\'une centaine de kimchis différents. Toi, tu en connais combien ?',
      related: { label: 'Sauras-tu reconnaître les plats coréens rien qu\'en image ?', cta: 'Jouer maintenant', url: 'https://koreanstories.fr/jeu5.html', image: null }, html:
      `<p>Le <strong>kimchi</strong> (김치) désigne en réalité toute une famille de légumes fermentés — on en compte plus d'une centaine de variétés selon la région et la saison, le plus connu étant à base de chou chinois (napa) et de piment.</p>
       <p>Sa fabrication (<strong>gimjang</strong>, 김장) était traditionnellement un événement communautaire à l'automne : familles et voisins préparaient ensemble assez de kimchi pour tenir tout l'hiver. Cette tradition est inscrite au patrimoine culturel immatériel de l'UNESCO depuis 2013.</p>
       <p>Le kimchi accompagne quasiment tous les repas coréens, servi comme <strong>banchan</strong> (반찬, accompagnement) — jamais seul comme plat principal.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>김치 주세요</strong> (gimchi juseyo) — « du kimchi, s'il vous plaît ».</p>` },
    { subject: 'Chuseok : Noël, Thanksgiving et un road-trip, en un seul week-end', hangeul: '추석', title: 'Chuseok',
      hook: 'Imagine Noël, Thanksgiving et un road-trip familial compressés en un seul week-end. Bienvenue à Chuseok.',
      related: { label: 'Vis un vrai Chuseok à travers l\'histoire d\'une famille coréenne.', cta: 'Lire l\'histoire', url: 'https://koreanstories.fr/histoire27.html', image: 'https://koreanstories.fr/img/stories/histoire27.webp' }, html:
      `<p><strong>Chuseok</strong> (추석), parfois appelé « Thanksgiving coréen », est l'une des deux plus grandes fêtes du pays avec le nouvel an lunaire. Elle a lieu au 15e jour du 8e mois lunaire, généralement en septembre.</p>
       <p>Les familles se rassemblent, souvent après de longs trajets (les embouteillages de Chuseok sont légendaires en Corée), pour honorer les ancêtres lors d'un rite appelé <strong>charye</strong> (차례) et partager un repas de fête.</p>
       <p>Le plat emblématique est le <strong>songpyeon</strong> (송편), un petit gâteau de riz gluant en forme de demi-lune, fourré de sésame, haricots ou châtaignes, cuit à la vapeur sur des aiguilles de pin.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>추석 잘 보내세요</strong> (chuseok jal bonaeseyo) — « passe un bon Chuseok ».</p>` },
    { subject: 'Le nunchi, cet art coréen de « lire » les gens', hangeul: '눈치', title: 'Le nunchi',
      hook: 'Il n\'existe aucun mot français pour ça — et c\'est bien tout le problème.',
      related: { label: 'Retrouve 눈치 (et sa prononciation) dans le dictionnaire coréen-français.', cta: 'Voir le mot', url: 'https://koreanstories.fr/dictionnaire.html?q=%EB%88%88%EC%B9%98', image: null }, html:
      `<p>Le <strong>nunchi</strong> (눈치, littéralement « mesure des yeux ») est une notion centrale de la culture coréenne : la capacité à percevoir rapidement l'humeur et les intentions d'un groupe, pour adapter son comportement en conséquence.</p>
       <p>Avoir « du nunchi » (눈치가 있다), c'est savoir quand parler ou se taire, quand proposer de payer l'addition, quand quitter une réunion. À l'inverse, en manquer (눈치가 없다) est une critique sociale assez sévère.</p>
       <p>Ce sens de l'observation collective est lié à une société où la hiérarchie (âge, statut) structure fortement les interactions et le langage — d'où l'importance du <strong>존댓말</strong> (jondaetmal), le registre poli du coréen.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>눈치가 빠르다</strong> (nunchiga ppareuda) — « avoir du flair social », littéralement « le nunchi est rapide ».</p>` },
    { subject: 'Seollal : la tradition qui peut te rapporter de l\'argent', hangeul: '설날', title: 'Seollal',
      hook: 'Chuseok a une fête sœur : Seollal, le nouvel an lunaire — et elle a ses propres règles (et ses propres avantages).',
      related: { label: 'Découvre les 5 fêtes coréennes incontournables, dont Seollal.', cta: 'Lire l\'anecdote', url: 'https://koreanstories.fr/anecdote13.html', image: null }, html:
      `<p><strong>Seollal</strong> (설날) est le nouvel an lunaire coréen, l'autre grande fête familiale du pays avec Chuseok. Toute la famille se réunit, souvent en hanbok, pour un rituel bien précis.</p>
       <p>Le geste central s'appelle le <strong>sebae</strong> (세배) : les plus jeunes font une révérence profonde devant les aînés, qui leur donnent en retour de l'argent (<strong>세뱃돈</strong>, sebaetdon) accompagné de quelques mots de sagesse (<strong>덕담</strong>, dokdam).</p>
       <p>Le plat obligatoire est le <strong>tteokguk</strong> (떡국), une soupe de gâteaux de riz — et selon la tradition, en manger un bol le jour de Seollal fait symboliquement gagner un an d'âge !</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>새해 복 많이 받으세요</strong> (saehae bok mani badeuseyo) — « bonne année », la formule qu'on utilise précisément à Seollal.</p>` },
    { subject: 'Le jjimjilbang, ou comment les Coréens réinventent la détente', hangeul: '찜질방', title: 'Le jjimjilbang',
      hook: 'Un sauna, une salle de sieste collective et des œufs cuits à la vapeur, ouvert 24h/24 — bienvenue au jjimjilbang.',
      related: { label: 'Suis Emma dans son premier jjimjilbang coréen.', cta: 'Lire l\'histoire', url: 'https://koreanstories.fr/histoire28.html', image: 'https://koreanstories.fr/img/stories/histoire28.webp' }, html:
      `<p>Le <strong>jjimjilbang</strong> (찜질방) est un établissement de bains publics et de sauna, immense institution du quotidien coréen. Zones de bains séparées par sexe, mais espaces communs (saunas, salle de repos, restauration) mixtes — ouverts jour et nuit.</p>
       <p>Le détail qui ne trompe pas : la fameuse serviette pliée en forme d'oreilles de mouton (<strong>양머리</strong>, yangmeori) que tout le monde porte sur la tête. On y trouve aussi des saunas à thème (sel, charbon, glace), et deux en-cas incontournables : l'œuf cuit à la vapeur et le <strong>sikhye</strong> (식혜), une boisson sucrée au riz.</p>
       <p>Beaucoup de Coréens y passent la nuit — moins cher qu'un hôtel, et un vrai moment de détente entre amis ou en famille, pas juste un lieu d'hygiène.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>찜질방 가자!</strong> (jjimjilbang gaja !) — « allons au jjimjilbang ! ».</p>` },
    { subject: 'Le soju, une boisson qui suit ses propres règles de politesse', hangeul: '회식', title: 'Le soju & le hoesik',
      hook: 'En Corée, refuser de servir le soju à deux mains à son patron n\'est pas un détail — c\'est une vraie faute de politesse.',
      related: { label: 'L\'histoire complète du soju et des codes du hoesik, sur le blog.', cta: 'Lire l\'article', url: 'https://koreanstories.fr/blog-soju-hoesik-culture-coreenne.html', image: null }, html:
      `<p>Le <strong>soju</strong> (소주) est l'alcool le plus vendu au monde en volume — devant la vodka — et pourtant presque personne n'en boit en dehors de la Corée. Distillé à l'origine à partir de riz, il titre aujourd'hui le plus souvent entre 16 et 20°, bien loin des 45° d'avant les années 1960.</p>
       <p>Il est indissociable du <strong>hoesik</strong> (회식), le repas d'entreprise qui soude l'équipe autant qu'il entretient la hiérarchie — rarement en une seule étape : un dîner (1차), suivi très souvent d'un 2차 dans un bar ou un karaoké. S'y ajoutent des règles précises : on sert le verre du plus âgé à deux mains, et on détourne légèrement la tête pour boire devant un supérieur.</p>
       <p>Autre incontournable des soirées coréennes : le <strong>somaek</strong> (소맥), mélange de soju et de bière — une tradition presque aussi codifiée que le service du soju pur.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>한 잔 받으세요</strong> (han jan badeuseyo) — « acceptez un verre », la phrase-clé de tout hoesik.</p>` },
    { subject: 'Pourquoi tous les hommes coréens disparaissent 18 à 21 mois', hangeul: '군대', title: 'Le service militaire',
      hook: 'Chaque année, des dizaines de milliers de jeunes Coréens interrompent leur vie civile — carrière, études, groupe de K-pop compris.',
      related: { label: 'Durées, grades, et pourquoi même des membres de BTS y sont passés — sur le blog.', cta: 'Lire l\'article', url: 'https://koreanstories.fr/blog-service-militaire-coree-armee.html', image: null }, html:
      `<p>En Corée du Sud, le <strong>service militaire</strong> (군대, gundae) est obligatoire pour presque tous les hommes valides, en général entre 18 et 21 mois selon l'arme choisie — conséquence directe de l'armistice de 1953 avec la Corée du Nord, jamais suivi d'un traité de paix.</p>
       <p>Le sujet dépasse largement l'armée elle-même : plusieurs acteurs et membres de groupes de K-pop ont dû suspendre leur carrière le temps de leur service, un vrai événement médiatique à chaque fois. Il a aussi donné naissance à tout un folklore partagé, les <strong>군대 이야기</strong> (« histoires d'armée ») que tout homme coréen raconte (et enjolive) toute sa vie.</p>
       <p>Expression culte qui en découle : <strong>고무신 거꾸로 신다</strong> (gomusin geokkuro sinda), « porter ses chaussons en caoutchouc à l'envers » — désigne une compagne qui rompt unilatéralement pendant le service de son copain.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>말년</strong> (mallyeon) — la dernière ligne droite du service, réputée la période la plus détendue.</p>` }
  ],
  histoire: [
    { subject: 'Le roi qui a inventé un alphabet pour que tout le monde sache lire', hangeul: '세종대왕', title: 'Le roi Sejong le Grand',
      hook: 'Un roi qui invente un alphabet en quelques années pour que TOUT le monde puisse lire — dans l\'Histoire, ça n\'arrive presque jamais.',
      related: { label: 'L\'anecdote complète du Roi Sejong et de l\'invention du Hangeul.', cta: 'Lire l\'anecdote', url: 'https://koreanstories.fr/anecdote1.html', image: null }, html:
      `<p>En 1443, le roi <strong>Sejong</strong> (세종, 1397-1450), quatrième souverain de la dynastie Joseon, fait créer le <strong>hangeul</strong> (한글) : un alphabet pensé pour que le peuple, qui n'avait pas accès aux caractères chinois classiques réservés à l'élite lettrée, puisse enfin lire et écrire facilement.</p>
       <p>Le système est publié en 1446 dans le <em>Hunminjeongeum</em> (훈민정음, « les sons corrects pour l'instruction du peuple »). Les formes des consonnes imitent la position de la bouche et de la langue en les prononçant — un alphabet conçu scientifiquement, chose rarissime dans l'histoire de l'écriture.</p>
       <p>Le 9 octobre, jour du Hangeul (한글날), est aujourd'hui férié en Corée du Sud pour célébrer cette invention.</p>
       <p style="font-size:13px;color:#475E78">Sans Sejong, tu ne lirais pas les leçons de Korean Stories en hangeul aujourd'hui !</p>` },
    { subject: 'Joseon, cinq siècles qui ont façonné la Corée', hangeul: '조선', title: 'La dynastie Joseon',
      hook: 'Cinq siècles. Une seule dynastie. La Corée moderne lui doit (presque) tout, de la langue aux dramas historiques.',
      related: { label: 'Un texte de lecture niveau B2 sur la vie quotidienne sous la dynastie Joseon.', cta: 'Lire l\'article', url: 'https://koreanstories.fr/lect-b2-1.html', image: null }, html:
      `<p>La dynastie <strong>Joseon</strong> (조선, 1392-1897) est la plus longue de l'histoire coréenne : plus de cinq siècles, fondée par le général <strong>Yi Seong-gye</strong>.</p>
       <p>Elle installe le confucianisme comme doctrine d'État, structurant en profondeur la société : respect des aînés, importance de l'éducation et des examens d'État (<strong>gwageo</strong>), hiérarchie stricte entre classes sociales (yangban, roturiers).</p>
       <p>C'est aussi l'âge d'or culturel et scientifique du pays sous Sejong (hangeul, astronomie, imprimerie), et la période où Séoul (alors Hanyang) devient capitale, avec la construction du palais <strong>Gyeongbokgung</strong> — toujours visitable aujourd'hui.</p>
       <p style="font-size:13px;color:#475E78">Beaucoup de dramas historiques coréens (« sageuk », 사극) se déroulent sous Joseon.</p>` },
    { subject: 'Les Trois Royaumes : aux origines de la Corée', hangeul: '삼국시대', title: 'Les Trois Royaumes',
      hook: 'Avant qu\'il n\'y ait « la Corée », il y en avait trois, qui se disputaient la péninsule depuis des siècles.',
      related: { label: 'Découvre toutes nos histoires en coréen — BD, articles et podcasts, du niveau A1 au B2.', cta: 'Explorer', url: 'https://koreanstories.fr/histoires.html', image: null }, html:
      `<p>Avant l'unification, la péninsule coréenne était partagée entre trois royaumes rivaux, du 1er siècle avant J.-C. au 7e siècle : <strong>Goguryeo</strong> (au nord, le plus vaste, jusqu'en Mandchourie), <strong>Baekje</strong> (au sud-ouest, réputé pour son raffinement artistique) et <strong>Silla</strong> (au sud-est).</p>
       <p>C'est Silla qui finit par unifier la péninsule en 668, alliée à la dynastie chinoise Tang — donnant naissance à la période de « Silla unifié ».</p>
       <p>Cette ère a laissé un immense patrimoine : tombes royales de Gyeongju (ancienne capitale de Silla, aujourd'hui classée UNESCO), bouddhisme florissant, et les bases du système d'écriture et d'administration qui influenceront toute la suite de l'histoire coréenne.</p>
       <p style="font-size:13px;color:#475E78">Le nom « Corée » lui-même vient de <strong>Goryeo</strong> (고려), la dynastie qui succède à Silla en 918.</p>` },
    { subject: 'Une frontière tracée sans qu\'un seul Coréen soit consulté', hangeul: '분단', title: 'La division de la Corée',
      hook: 'En 1945, une ligne a été tracée sur une carte sans qu\'aucun Coréen ne soit consulté. 80 ans plus tard, elle est toujours là.',
      related: { label: 'Un texte de lecture niveau B2 sur l\'histoire de la division Nord-Sud.', cta: 'Lire l\'article', url: 'https://koreanstories.fr/lect-b2-4.html', image: null }, html:
      `<p>En 1945, la libération de la Corée de l'occupation japonaise (1910-1945) s'accompagne d'une division du pays au 38e parallèle, entre une zone d'occupation soviétique au nord et américaine au sud — décision prise sans consultation du peuple coréen, dans le contexte de la guerre froide naissante.</p>
       <p>Cette division se durcit avec la fondation de deux États séparés en 1948, puis la <strong>guerre de Corée</strong> (1950-1953), qui fait des millions de victimes et se termine par un armistice — jamais suivi d'un traité de paix formel à ce jour.</p>
       <p>La <strong>zone démilitarisée</strong> (DMZ), l'une des frontières les plus surveillées au monde, sépare toujours aujourd'hui la Corée du Nord et la Corée du Sud.</p>
       <p style="font-size:13px;color:#475E78">Un sujet sensible et encore très présent dans la société sud-coréenne d'aujourd'hui.</p>` },
    { subject: 'Le mythe qui explique pourquoi la Corée existe depuis 4000 ans', hangeul: '단군', title: 'Dangun, le mythe fondateur',
      hook: 'Un ours transformé en femme, un fils du ciel, et un royaume vieux de plus de 4000 ans — voici comment naît la légende de la Corée.',
      related: { label: 'Découvre toutes nos histoires en coréen — BD, articles et podcasts, du niveau A1 au B2.', cta: 'Explorer', url: 'https://koreanstories.fr/histoires.html', image: null }, html:
      `<p>Selon la légende fondatrice de la Corée, <strong>Hwanung</strong> (환웅), fils du roi céleste, descend sur terre. Un ours et un tigre, qui rêvent de devenir humains, lui demandent de l'aide — à condition de survivre 100 jours dans une grotte en ne mangeant que de l'armoise et de l'ail.</p>
       <p>Seul l'ours tient bon : il se transforme en femme, <strong>Ungnyeo</strong> (웅녀), épouse Hwanung, et leur fils <strong>Dangun</strong> (단군) fonde en 2333 av. J.-C. le royaume de <strong>Gojoseon</strong> (고조선), premier royaume coréen de l'histoire.</p>
       <p>Ce mythe, enseigné à tous les écoliers coréens, est célébré chaque 3 octobre lors du <strong>Gaecheonjeol</strong> (개천절, jour de la fondation nationale) — un jour férié en Corée du Sud, encore aujourd'hui.</p>
       <p style="font-size:13px;color:#475E78">Les historiens débattent encore des dates exactes de Gojoseon, mais le mythe, lui, reste une pierre fondatrice de l'identité coréenne.</p>` },
    { subject: 'Le jour où toute la Corée a dit non, en même temps', hangeul: '삼일운동', title: 'Le mouvement du 1er mars',
      hook: 'Le 1er mars 1919, des millions de Coréens sont descendus dans la rue au même moment, dans tout le pays, pour dire un seul mot : liberté.',
      related: { label: 'Découvre toutes nos histoires en coréen — BD, articles et podcasts, du niveau A1 au B2.', cta: 'Explorer', url: 'https://koreanstories.fr/histoires.html', image: null }, html:
      `<p>En 1910, la Corée est annexée par le Japon, qui met fin à la dynastie Joseon. Le 1er mars 1919, 33 représentants coréens lisent publiquement à Séoul une <strong>déclaration d'indépendance</strong> (독립선언서) — le point de départ d'un mouvement de protestation pacifique sans précédent.</p>
       <p>Des manifestations éclatent dans presque toutes les provinces du pays, réunissant selon les estimations près de deux millions de participants dans les semaines qui suivent — réprimées avec une grande brutalité par les autorités coloniales japonaises.</p>
       <p>Ce mouvement mène directement à la création d'un gouvernement provisoire coréen en exil à Shanghai. <strong>Yu Gwan-sun</strong> (유관순), lycéenne activiste morte en prison après y avoir participé, est aujourd'hui une héroïne nationale étudiée par tous les écoliers.</p>
       <p style="font-size:13px;color:#475E78">Le 1er mars (삼일절, Samiljeol) est un jour férié en Corée du Sud, en mémoire de ce mouvement.</p>` },
    { subject: 'La ville que les Coréens surnomment « le musée sans toit »', hangeul: '경주', title: 'Gyeongju, capitale de Silla',
      hook: 'Pendant près de mille ans, cette ville a été la capitale d\'un royaume entier — aujourd\'hui, on peut encore marcher sur ses vestiges, en pleine rue.',
      related: { label: 'Le guide complet de Gyeongju, l\'ancienne capitale de Silla — sur le blog.', cta: 'Lire le guide', url: 'https://koreanstories.fr/blog-gyeongju-guide-voyage.html', image: null }, html:
      `<p><strong>Gyeongju</strong> (경주) fut la capitale du royaume de <strong>Silla</strong> (신라) pendant près de mille ans, de 57 av. J.-C. jusqu'à sa chute en 935 apr. J.-C. — l'un des Trois Royaumes qui se partageaient autrefois la péninsule coréenne.</p>
       <p>Les Coréens la surnomment <strong>지붕 없는 박물관</strong> (jibung eomneun bangmulgwan), « le musée sans toit » : les vestiges archéologiques (temples, tombeaux royaux, observatoire) y sont si nombreux qu'on en croise à ciel ouvert, en pleine ville, sans qu'aucun bâtiment de musée ne les encadre.</p>
       <p>Parmi les incontournables : les temples <strong>Bulguksa</strong> et <strong>Seokguram</strong> (classés UNESCO, entrée gratuite depuis 2023), les tumulus royaux de <strong>Daereungwon</strong>, et le bassin de <strong>Donggung Wolji</strong> — l'un des plus beaux reflets nocturnes du pays, pavillons illuminés doublés dans l'eau.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>지붕 없는 박물관</strong> (jibung eomneun bangmulgwan) — le surnom de Gyeongju, « le musée sans toit ».</p>` }
  ],
  actu: [
    { subject: 'La Hallyu : comment la Corée a conquis le monde', hangeul: '한류', title: 'La vague coréenne',
      hook: 'En 1997, la Corée du Sud était en pleine crise financière. 25 ans plus tard, elle exporte sa culture dans le monde entier. Comment ?',
      related: { label: 'Un vrai article de presse coréen sur la Hallyu, expliqué et traduit.', cta: 'Lire l\'article', url: 'https://koreanstories.fr/presse7.html', image: 'https://koreanstories.fr/img/press/presse7.webp' }, html:
      `<p>La <strong>Hallyu</strong> (한류, « vague coréenne ») désigne l'essor mondial de la culture populaire sud-coréenne depuis la fin des années 1990 : d'abord les dramas dans le reste de l'Asie, puis la K-pop et le cinéma à l'échelle planétaire (Parasite, Squid Game, BTS, BLACKPINK…).</p>
       <p>Ce succès s'appuie sur un vrai soutien de l'État coréen à ses industries culturelles depuis la crise financière de 1997, où le pays a fait le pari de la « soft power » comme relais de croissance.</p>
       <p>Résultat : la demande pour apprendre le coréen a explosé dans le monde entier ces dernières années — et si tu lis ceci, tu en fais sûrement partie !</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>한류 팬이에요</strong> (hallyu paenieyo) — « je suis fan de la Hallyu ».</p>` },
    { subject: 'Pourquoi les Coréens adorent les cafés à thème', hangeul: '카페', title: 'La culture des cafés',
      hook: 'À Séoul, il existe littéralement un café pour chaque obsession possible. Toi aussi, tu as ta place quelque part.',
      related: { label: 'Retrouve Mina dans un café coréen — en BD, avec audio et traduction.', cta: 'Lire la BD', url: 'https://koreanstories.fr/histoire32-bd.html', image: 'https://koreanstories.fr/img/stories/histoire32.webp' }, html:
      `<p>La Corée du Sud compte l'une des plus fortes densités de cafés au monde, en particulier à Séoul. Mais au-delà du café lui-même, ce sont des lieux de vie : on y étudie, on y travaille, on y retrouve des amis pendant des heures.</p>
       <p>Le pays s'est aussi fait une spécialité des <strong>cafés à thème</strong> : cafés à chats ou à chiens, cafés Lego, cafés dédiés à un groupe de K-pop, cafés robots... Le décor devient souvent aussi important que la boisson, pensé pour être partagé sur les réseaux sociaux.</p>
       <p>C'est aussi le reflet d'une vraie compétition entre commerces : pour se démarquer, les cafés innovent sans cesse sur l'ambiance et le concept plutôt que sur le prix.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>카페에 가요</strong> (kapeae gayo) — « je vais au café ».</p>` },
    { subject: 'Les webtoons, la BD qui se lit sur ton téléphone', hangeul: '웹툰', title: 'Le phénomène webtoon',
      hook: 'Pas de pages à tourner, pas de format fixe : la BD coréenne a réinventé ses propres règles, pensées pour ton téléphone.',
      related: { label: 'Lis un vrai webtoon coréen, en lecture guidée avec vocabulaire expliqué.', cta: 'Lecture guidée', url: 'https://koreanstories.fr/histoire22.html', image: 'https://koreanstories.fr/img/stories/histoire22.webp' }, html:
      `<p>Le <strong>webtoon</strong> (웹툰) est un format de bande dessinée numérique né en Corée dans les années 2000 : lecture verticale, en scrollant sur le téléphone, souvent en couleur et parfois animée — pensé dès le départ pour le mobile plutôt qu'adapté du papier.</p>
       <p>Des plateformes comme Naver Webtoon ou Kakao Webtoon publient des milliers de séries, beaucoup gratuites (avec un système d'épisodes en avance-première payants), couvrant tous les genres : romance, fantasy, thriller, tranche de vie.</p>
       <p>De nombreux dramas et films à succès (comme <em>Sweet Home</em> ou <em>The Uncanny Counter</em>) sont aujourd'hui adaptés de webtoons — un vrai pilier de l'industrie culturelle coréenne.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>웹툰 봐요?</strong> (weptun bwayo?) — « tu lis des webtoons ? ».</p>` },
    { subject: '빨리빨리 : vivre à la vitesse coréenne', hangeul: '빨리빨리', title: 'La culture du « vite, vite »',
      hook: 'La livraison en 30 minutes n\'est pas née par hasard en Corée. Ça a même un nom : 빨리빨리.',
      related: { label: 'Écoute un épisode de podcast sur la culture du ppalli-ppalli, en coréen naturel.', cta: 'Écouter le podcast', url: 'https://koreanstories.fr/podcast5.html', image: null }, html:
      `<p>Impossible de comprendre la Corée moderne sans connaître le <strong>ppalli-ppalli</strong> (빨리빨리, « vite vite ») : cette exigence de rapidité qu'on retrouve dans la livraison ultra-rapide, l'un des internets les plus rapides au monde, ou l'impatience générale dans la vie quotidienne.</p>
       <p>Cette culture a largement porté le développement économique fulgurant du pays depuis les années 1960 (le fameux « miracle sur le fleuve Han »). Mais elle a aussi un revers : un rythme de travail parmi les plus soutenus des pays de l'OCDE, et une pression sociale forte.</p>
       <p>D'où l'intérêt croissant, chez les jeunes générations, pour des concepts plus lents : le « <strong>워라밸</strong> » (work-life balance) ou la « vie lente » (소확행, « petit bonheur certain »).</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>빨리빨리!</strong> (ppalli-ppalli) — l'expression que tu entendras partout en Corée.</p>` },
    { subject: 'Ce qu\'il se passe vraiment avant qu\'un groupe de K-pop débute', hangeul: '아이돌', title: 'L\'industrie des idols',
      hook: 'Avant de monter sur scène, un idol de K-pop s\'entraîne en moyenne plusieurs années. Bienvenue dans le système des trainees.',
      related: { label: 'Plonge dans le monde de la K-pop, expliqué en coréen (niveau B1).', cta: 'Lire l\'article', url: 'https://koreanstories.fr/lect-b1-2.html', image: null }, html:
      `<p>Derrière chaque groupe de K-pop se cache un système bien rodé : les grandes agences (SM, YG, JYP, HYBE...) repèrent de jeunes talents via des castings, parfois dans le monde entier, dès l'adolescence, et les signent comme <strong>trainees</strong> (연습생, yeonseupsaeng).</p>
       <p>S'ensuivent des années d'entraînement intensif — chant, danse, langues, parfois à l'étranger — avant qu'une petite fraction seulement ne <strong>débute</strong> (데뷔, debwi). C'est l'agence qui compose le groupe et façonne son concept, pas les membres eux-mêmes.</p>
       <p>Ce système explique les chorégraphies ultra-synchronisées et les univers visuels léchés à chaque comeback — mais il est aussi critiqué pour la pression et la compétition qu'il impose aux trainees.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>데뷔</strong> (debwi, de l'anglais « debut ») — le grand jour où un trainee devient enfin officiellement idol.</p>` },
    { subject: 'Ces mots « anglais » que seuls les Coréens comprennent', hangeul: '콩글리시', title: 'Le Konglish',
      hook: 'Si tu commandes un « hand-phone » ou demandes le « service » en Corée, tu parles peut-être déjà un peu konglish sans le savoir.',
      related: { label: 'Le blog explore 20 mots konglish et 2 vagues d\'histoire linguistique, de 하드캐리 à 화이팅.', cta: 'Lire l\'article complet', url: 'https://koreanstories.fr/blog-konglish-mots-anglais-coreens.html', image: null }, html:
      `<p>Le <strong>konglish</strong> (콩글리시, contraction de 한국 « Corée » et « English ») désigne des mots empruntés à l'anglais, mais utilisés en coréen avec un sens différent — ou carrément inventés.</p>
       <p>Exemples : <strong>핸드폰</strong> (haendeu-pon, « hand phone ») pour téléphone portable, <strong>서비스</strong> (seobiseu, « service ») pour un petit cadeau offert par un commerce (pas le service client !), ou <strong>아이쇼핑</strong> (ai-syoping, « eye shopping ») pour le lèche-vitrines.</p>
       <p>Ce ne sont pas des erreurs : c'est une vraie composante créative du coréen parlé moderne — et de quoi surprendre un anglophone la première fois qu'il les entend.</p>
       <p style="font-size:13px;color:#475E78">Petit mot du jour : <strong>화이팅!</strong> (hwaiting, de « fighting ») — un encouragement, pas une bagarre !</p>` }
  ]
};

// ── Palette « héros » par thème (bandeau coloré en haut de la newsletter) ────
const THEME_META = {
  culture:  { label: 'Culture',   bg: 'linear-gradient(135deg,#B8924E,#CAA96E)', color: '#1a1208' },
  histoire: { label: 'Histoire',  bg: 'linear-gradient(135deg,#0F1B2D,#1a2f4a)', color: '#D5BA8A' },
  actu:     { label: 'Tendances', bg: 'linear-gradient(135deg,#3E6B63,#5C9187)', color: '#F5F8FF' }
};

// ── Envoi hebdomadaire d'une édition (culture / histoire / actu) ─────────────
// testRecipient : si fourni, envoie uniquement à cette adresse (test manuel)
// et n'avance PAS la rotation d'éditions partagée avec les envois réels.
async function sendNewsletterEdition(theme, env, testRecipient = null) {
  const editions = NEWSLETTER_CONTENT[theme];
  if (!editions || !editions.length) { console.log('[KS] aucune édition pour le thème', theme); return; }

  const idxKey = `nl_idx:${theme}`;
  const idx = parseInt(await env.KS_LICENSES.get(idxKey) || '0', 10) || 0;
  const edition = editions[idx % editions.length];
  if (!testRecipient) await env.KS_LICENSES.put(idxKey, String(idx + 1));

  const contacts = testRecipient ? [{ email: testRecipient }] : await listActiveContacts(env);
  console.log(`[KS] newsletter ${theme} · édition ${idx % editions.length} · ${contacts.length} destinataires${testRecipient ? ' (test)' : ''}`);

  // La dernière ligne de chaque édition (mot du jour / anecdote) est mise en
  // avant dans une carte « À retenir » façon fiche de vocabulaire, plutôt que
  // noyée dans le corps du texte.
  const meta = THEME_META[theme] || { label: theme, bg: 'linear-gradient(135deg,#0F1B2D,#1a2f4a)', color: '#FFFFFF' };
  const heroFontSize = edition.hangeul.length <= 2 ? 56 : edition.hangeul.length === 3 ? 46 : 36;
  const noteMatch = edition.html.match(/<p style="font-size:13px;color:#475E78">([\s\S]*?)<\/p>\s*$/);
  const noteHtml = noteMatch ? noteMatch[1] : '';
  const bodyHtml = noteMatch ? edition.html.slice(0, noteMatch.index).trim() : edition.html;
  // Accroche punchy affichée juste après le salut, avant le corps factuel.
  const hookHtml = edition.hook ? `<p style="font-size:17px;font-weight:700;color:#0F1B2D;line-height:1.4;margin:0 0 16px">${edition.hook}</p>` : '';

  let sent = 0, failed = 0;
  for (const contact of contacts) {
    const unsubUrl = 'https://ks-premium.delicate-voice-1d19.workers.dev/newsletter/unsubscribe?email=' + encodeURIComponent(contact.email);
    // Salut personnalisé par contact (prénom Resend s'il existe) — le reste
    // du corps est partagé et calculé une seule fois au-dessus de la boucle.
    const greeting = `<p style="font-weight:700;margin:0 0 10px">Salut${contact.first_name ? ' ' + contact.first_name : ''} !</p>`;
    const html = emailLayout({
      preheader: edition.title,
      title: edition.subject,
      kicker: `Korean Stories · ${meta.label}`,
      hero: { word: edition.hangeul, sub: edition.title, bg: meta.bg, color: meta.color, fontSize: heroFontSize, image: edition.related?.image || null },
      bodyHtml: greeting + hookHtml + bodyHtml,
      noteHtml,
      related: edition.related,
      unsubUrl
    });
    try {
      await sendEmail(contact.email, edition.subject, html, env);
      sent++;
    } catch (e) {
      console.log('[KS] échec envoi newsletter à', contact.email, String(e));
      failed++;
    }
    // Petite pause pour rester sous les limites de débit de l'API Resend.
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`[KS] newsletter ${theme} terminée : ${sent} envoyés, ${failed} échecs`);
}

// ── Liste tous les contacts Resend actifs (non désinscrits), paginée ─────────
async function listActiveContacts(env) {
  const headers = { 'Authorization': `Bearer ${env.RESEND_API_KEY}` };
  let all = [];
  let after = null;
  for (let page = 0; page < 50; page++) { // garde-fou anti-boucle infinie
    const u = new URL('https://api.resend.com/contacts');
    u.searchParams.set('limit', '100');
    if (after) u.searchParams.set('after', after);
    const res = await fetch(u.toString(), { headers });
    if (!res.ok) { console.log('[KS] listActiveContacts error', res.status, await res.text()); break; }
    const data = await res.json();
    const items = data.data || [];
    all = all.concat(items.filter(c => !c.unsubscribed && c.email));
    if (!data.has_more || !items.length) break;
    after = items[items.length - 1].id;
  }
  return all;
}

// ── Retrouver la clé de licence à partir d'un objet Stripe ───────────────────────
// Essaie : index client → e-mail présent dans l'objet → e-mail récupéré via l'API
// Stripe (pour les abonnements créés avant l'index). Recrée l'index au passage.
async function findLicenseKey(obj, env) {
  const customerId = obj.customer || null;
  if (customerId) {
    const k = await env.KS_LICENSES.get('cust:' + customerId);
    if (k) return k;
  }
  let email = obj.customer_email || null;
  if (!email && customerId) email = await emailForCustomer(customerId, env);
  if (!email) return null;
  const key = await env.KS_LICENSES.get('email:' + email);
  if (key && customerId) await env.KS_LICENSES.put('cust:' + customerId, key); // backfill
  return key;
}

// ── E-mail d'un client via l'API Stripe ──────────────────────────────────────────
async function emailForCustomer(customerId, env) {
  try {
    const r = await fetch('https://api.stripe.com/v1/customers/' + customerId, {
      headers: { 'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY }
    });
    if (!r.ok) { console.log('[KS] Stripe customer fetch', r.status); return null; }
    const c = await r.json();
    return c.email || null;
  } catch (e) { console.log('[KS] emailForCustomer err', String(e)); return null; }
}

// ── Génération de clé lisible ──────────────────────────────────────────────────
// Format XXXX-XXXX-XXXX-XXXX (16 caractères). Alphabet de 32 symboles sans
// caractères ambigus (ni I/O/0/1). Aléa CRYPTOGRAPHIQUE (crypto.getRandomValues,
// pas Math.random) : imprévisible, non reproductible à partir d'un état de PRNG.
// `octet & 31` == `octet % 32` sans biais de modulo, car 32 divise 256.
function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += chars[bytes[i] & 31];
    if (i % 4 === 3 && i < 15) out += '-';
  }
  return out;
}

// ── Vérification signature Stripe ─────────────────────────────────────────────
async function verifyStripeWebhook(payload, sigHeader, secret) {
  const parts   = sigHeader.split(',');
  const ts      = parts.find(p => p.startsWith('t=')).slice(2);
  const v1      = parts.find(p => p.startsWith('v1=')).slice(3);
  const signed  = `${ts}.${payload}`;

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (hex !== v1) throw new Error('Bad signature');
  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(ts)) > 300) throw new Error('Replay');

  return JSON.parse(payload);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-License-Key'
    }
  });
}
