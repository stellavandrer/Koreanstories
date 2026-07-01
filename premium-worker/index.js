// Korean Stories — Premium License Worker
// Routes:
//   POST /webhook  — reçoit les événements Stripe
//   GET  /verify?key=XXX — vérifie une clé de licence depuis l'app
//   POST /newsletter — inscription/désinscription newsletter (Resend Contacts)
//   GET  /newsletter/unsubscribe?email=… — lien de désinscription en un clic (depuis l'e-mail)
//
// Variables d'environnement à configurer dans Cloudflare (jamais dans le code) :
//   STRIPE_SECRET_KEY       sk_live_...
//   STRIPE_WEBHOOK_SECRET   whsec_...
//   RESEND_API_KEY          re_...
// KV binding : KS_LICENSES

const PRICE_MONTHLY  = 'price_1TlkvnPab8Hr1KXaK2D5ZSvn';
const PRICE_LIFETIME = 'price_1TlkwTPab8Hr1KXaM5WwjXWX';

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

    if (request.method === 'POST' && url.pathname === '/webhook') {
      return handleWebhook(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/newsletter') {
      return handleNewsletter(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/newsletter/unsubscribe') {
      return handleNewsletterUnsubscribeLink(request, env);
    }

    return new Response('Korean Stories Premium API', { status: 200 });
  }
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

// ── Newsletter : inscription / désinscription via Resend Contacts ────────────
// Base de contacts réelle (dashboard resend.com/audience, export CSV inclus) —
// remplace l'ancien flux FormSubmit (e-mail simple, sans base consultable).
async function handleNewsletter(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ success: false, message: 'Requête invalide' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
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

  const ok = await resendSubscribe(email, env);
  if (!ok) return json({ success: false, message: 'Erreur serveur' }, 502);
  await sendNewsletterWelcomeEmail(email, env);
  return json({ success: true });
}

// ── Lien de désinscription en un clic (ouvert depuis l'e-mail, GET simple) ───
async function handleNewsletterUnsubscribeLink(request, env) {
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  const page = (title, msg) => new Response(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${title} — Korean Stories</title>
     <meta name="viewport" content="width=device-width,initial-scale=1"></head>
     <body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:0 24px;text-align:center;color:#1a2744">
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

async function resendSubscribe(email, env) {
  const headers = { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' };
  let res = await fetch('https://api.resend.com/contacts', {
    method: 'POST', headers, body: JSON.stringify({ email, unsubscribed: false })
  });
  if (!res.ok) {
    console.log('[KS] newsletter create response', res.status, await res.text());
    res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH', headers, body: JSON.stringify({ unsubscribed: false })
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

// ── Nouveau paiement (abonnement ou à vie) ────────────────────────────────────
async function handleCheckout(session, env) {
  const email = session.customer_email || session.customer_details?.email;
  console.log('[KS] checkout email:', email, '| mode:', session.mode);
  if (!email) { console.log('[KS] no email found, aborting'); return; }

  const isLifetime = session.mode === 'payment';

  // Clé existante ? On la réactive
  const existingKey = await env.KS_LICENSES.get(`email:${email}`);
  if (existingKey) {
    const data = await env.KS_LICENSES.get(existingKey, { type: 'json' });
    if (data) {
      data.status = 'active';
      if (isLifetime) data.type = 'lifetime';
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
    createdAt: new Date().toISOString(),
    stripeCustomerId: session.customer || null
  }));
  await env.KS_LICENSES.put(`email:${email}`, key);
  // Index inverse client → clé (permet de retrouver la licence à la résiliation,
  // car l'événement subscription.deleted ne contient pas l'e-mail).
  if (session.customer) await env.KS_LICENSES.put('cust:' + session.customer, key);
  await sendLicenseEmail(email, key, env);
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
    if (notify && data.email && !data.cancelEmailSent) await sendCancellationEmail(data.email, env);
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
      await sendCancellationEmail(data.email, env, sub.current_period_end || sub.cancel_at);
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

// ── Email de licence via Resend ───────────────────────────────────────────────
async function sendLicenseEmail(email, key, env) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
      <h2 style="color:#1a2744">Ta clé Premium Korean Stories 💛</h2>
      <p>Merci pour ton soutien — tu fais partie de l'aventure !</p>
      <p style="margin-bottom:8px"><strong>Ta clé de licence :</strong></p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:6px;
                background:#f5f0e8;padding:16px 24px;border-radius:10px;
                text-align:center;color:#1a2744">${key}</p>
      <h3 style="color:#1a2744">Comment activer le Premium :</h3>
      <ol style="line-height:2">
        <li>Ouvre l'app <strong>Korean Stories</strong></li>
        <li>Va dans <strong>Réglages</strong></li>
        <li>Section <strong>Premium</strong> → clique sur « Voir »</li>
        <li>Colle ta clé → clique sur <strong>Débloquer</strong></li>
      </ol>
      <p>Conserve cet email précieusement — ta clé est unique.</p>
      <p style="font-size:13px;color:#555">Abonnement mensuel : tu peux le gérer ou le résilier à tout moment depuis le
        <a href="https://billing.stripe.com/p/login/5kQbJ35BtcZH36f1NSe7m00" style="color:#B8924E">portail client sécurisé</a>.</p>
      <p style="color:#888;font-size:13px">Korean Stories · koreanstories.fr</p>
    </div>
  `;
  await sendEmail(email, '💛 Ta clé Premium Korean Stories', html, env);
}

// ── Date au format français (sans dépendre de l'ICU du runtime) ──────────────────
function frDate(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return d.getUTCDate() + ' ' + mois[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

// ── Email de confirmation de résiliation via Resend ──────────────────────────────
async function sendCancellationEmail(email, env, endTs) {
  const endStr = frDate(endTs);
  const endLine = endStr
    ? `Ton accès Premium reste actif jusqu'au <strong>${endStr}</strong>, puis s'arrête sans nouveau prélèvement.`
    : `Tu conserves l'accès Premium jusqu'à la <strong>fin de la période déjà payée</strong> ; aucun nouveau prélèvement ne sera effectué ensuite.`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
      <h2 style="color:#1a2744">Résiliation confirmée</h2>
      <p>Ton abonnement Premium mensuel à Korean Stories a bien été résilié.</p>
      <p>${endLine}</p>
      <p>Tout le parcours d'apprentissage reste évidemment <strong>gratuit</strong> — tu peux continuer à apprendre sans rien changer.</p>
      <p style="font-size:13px;color:#555">Tu changes d'avis ? Tu peux te réabonner à tout moment depuis la page Premium. Merci d'avoir soutenu le projet 💛</p>
      <p style="color:#888;font-size:13px">Korean Stories · koreanstories.fr</p>
    </div>
  `;
  await sendEmail(email, 'Confirmation de résiliation — Korean Stories', html, env);
}

// ── Emails newsletter (bienvenue / désinscription) via Resend ────────────────
async function sendNewsletterWelcomeEmail(email, env) {
  const unsubUrl = 'https://ks-premium.delicate-voice-1d19.workers.dev/newsletter/unsubscribe?email=' + encodeURIComponent(email);
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
      <h2 style="color:#1a2744">Bienvenue dans la newsletter Korean Stories 💛</h2>
      <p>Merci de t'être inscrit·e ! Tu recevras environ <strong>1 à 2 e-mails par mois</strong> : nouvelles leçons, ressources gratuites, conseils pour apprendre le coréen.</p>
      <p>En attendant, continue ton parcours sur <a href="https://koreanstories.fr/app.html" style="color:#B8924E">koreanstories.fr</a>.</p>
      <p style="font-size:13px;color:#555;margin-top:24px">Tu peux te désinscrire à tout moment en cliquant <a href="${unsubUrl}" style="color:#B8924E">ici</a>.</p>
      <p style="color:#888;font-size:13px">Korean Stories · koreanstories.fr</p>
    </div>
  `;
  await sendEmail(email, 'Bienvenue dans la newsletter Korean Stories', html, env);
}

async function sendNewsletterGoodbyeEmail(email, env) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
      <h2 style="color:#1a2744">Désinscription confirmée</h2>
      <p>Tu ne recevras plus la newsletter Korean Stories. C'est noté !</p>
      <p style="font-size:13px;color:#555">Tu changes d'avis ? Tu peux te réinscrire à tout moment depuis <a href="https://koreanstories.fr" style="color:#B8924E">koreanstories.fr</a> ou tes Réglages.</p>
      <p style="color:#888;font-size:13px">Korean Stories · koreanstories.fr</p>
    </div>
  `;
  await sendEmail(email, 'Désinscription confirmée — Korean Stories', html, env);
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
function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-');
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
