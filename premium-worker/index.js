// Korean Stories — Premium License Worker
// Routes:
//   POST /webhook  — reçoit les événements Stripe
//   GET  /verify?key=XXX — vérifie une clé de licence depuis l'app
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

    // Déclenchement manuel d'une édition (test, ou renvoi si un Cron a raté
    // son horaire) — la route standard Cloudflare /cdn-cgi/handler/scheduled
    // ne fonctionne qu'en local (wrangler dev), pas sur un Worker déployé via
    // le dashboard, d'où cette route maison protégée par un jeton.
    if (request.method === 'GET' && url.pathname === '/newsletter/test-send') {
      const theme = url.searchParams.get('theme');
      const token = url.searchParams.get('token');
      if (!env.NEWSLETTER_TEST_TOKEN || token !== env.NEWSLETTER_TEST_TOKEN) return new Response('Forbidden', { status: 403 });
      if (!NEWSLETTER_CONTENT[theme]) return json({ success: false, message: 'Thème inconnu (culture/histoire/actu)' }, 400);
      await sendNewsletterEdition(theme, env);
      return json({ success: true, message: `Édition ${theme} envoyée.` });
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
      <p>Merci de t'être inscrit·e ! Tu recevras jusqu'à <strong>3 e-mails par semaine</strong>, chacun sur un thème différent :</p>
      <ul style="line-height:1.9">
        <li><strong>Culture</strong> — traditions, cuisine, vie quotidienne en Corée</li>
        <li><strong>Histoire</strong> — dynasties, grandes figures, événements marquants</li>
        <li><strong>Tendances</strong> — Hallyu, société coréenne d'aujourd'hui</li>
      </ul>
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

// ── Contenu des 3 séries de newsletter ────────────────────────────────────────
// Chaque thème a sa propre liste d'éditions. On tourne dans l'ordre (KV garde
// l'index) puis on recommence au début — ajouter de nouvelles éditions ici à
// tout moment (pas besoin de toucher au reste du code).
const NEWSLETTER_CONTENT = {
  culture: [
    { subject: 'Le hanbok, bien plus qu\'un costume', html:
      `<h2 style="color:#1a2744">한복 · Le hanbok</h2>
       <p>Le <strong>hanbok</strong> (한복) est le vêtement traditionnel coréen, porté aujourd'hui surtout lors des grandes occasions : Seollal (nouvel an lunaire), Chuseok, mariages.</p>
       <p>Il se compose pour les femmes d'un <strong>jeogori</strong> (veste courte) et d'une <strong>chima</strong> (jupe ample et haute), et pour les hommes d'un <strong>jeogori</strong> plus long porté avec un <strong>baji</strong> (pantalon bouffant). Les couleurs et motifs n'étaient pas choisis au hasard sous Joseon : elles indiquaient le rang social, l'âge ou le statut marital.</p>
       <p>Aujourd'hui, de nombreux jeunes Coréens louent un hanbok moderne pour visiter les palais de Séoul (comme Gyeongbokgung) — l'entrée y est même gratuite si tu en portes un !</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>한복이 예뻐요</strong> (hanbogi yeoppeoyo) — « le hanbok est joli ».</p>` },
    { subject: 'Le kimchi, un art plus qu\'un plat', html:
      `<h2 style="color:#1a2744">김치 · Le kimchi</h2>
       <p>Le <strong>kimchi</strong> (김치) désigne en réalité toute une famille de légumes fermentés — on en compte plus d'une centaine de variétés selon la région et la saison, le plus connu étant à base de chou chinois (napa) et de piment.</p>
       <p>Sa fabrication (<strong>gimjang</strong>, 김장) était traditionnellement un événement communautaire à l'automne : familles et voisins préparaient ensemble assez de kimchi pour tenir tout l'hiver. Cette tradition est inscrite au patrimoine culturel immatériel de l'UNESCO depuis 2013.</p>
       <p>Le kimchi accompagne quasiment tous les repas coréens, servi comme <strong>banchan</strong> (반찬, accompagnement) — jamais seul comme plat principal.</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>김치 주세요</strong> (gimchi juseyo) — « du kimchi, s'il vous plaît ».</p>` },
    { subject: 'Chuseok, la grande fête des récoltes', html:
      `<h2 style="color:#1a2744">추석 · Chuseok</h2>
       <p><strong>Chuseok</strong> (추석), parfois appelé « Thanksgiving coréen », est l'une des deux plus grandes fêtes du pays avec le nouvel an lunaire. Elle a lieu au 15e jour du 8e mois lunaire, généralement en septembre.</p>
       <p>Les familles se rassemblent, souvent après de longs trajets (les embouteillages de Chuseok sont légendaires en Corée), pour honorer les ancêtres lors d'un rite appelé <strong>charye</strong> (차례) et partager un repas de fête.</p>
       <p>Le plat emblématique est le <strong>songpyeon</strong> (송편), un petit gâteau de riz gluant en forme de demi-lune, fourré de sésame, haricots ou châtaignes, cuit à la vapeur sur des aiguilles de pin.</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>추석 잘 보내세요</strong> (chuseok jal bonaeseyo) — « passe un bon Chuseok ».</p>` },
    { subject: 'Le nunchi, cet art coréen de « lire » les gens', html:
      `<h2 style="color:#1a2744">눈치 · Le nunchi</h2>
       <p>Le <strong>nunchi</strong> (눈치, littéralement « mesure des yeux ») est une notion centrale de la culture coréenne : la capacité à percevoir rapidement l'humeur et les intentions d'un groupe, pour adapter son comportement en conséquence.</p>
       <p>Avoir « du nunchi » (눈치가 있다), c'est savoir quand parler ou se taire, quand proposer de payer l'addition, quand quitter une réunion. À l'inverse, en manquer (눈치가 없다) est une critique sociale assez sévère.</p>
       <p>Ce sens de l'observation collective est lié à une société où la hiérarchie (âge, statut) structure fortement les interactions et le langage — d'où l'importance du <strong>존댓말</strong> (jondaetmal), le registre poli du coréen.</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>눈치가 빠르다</strong> (nunchiga ppareuda) — « avoir du flair social », littéralement « le nunchi est rapide ».</p>` }
  ],
  histoire: [
    { subject: 'Le roi Sejong et la naissance du hangeul', html:
      `<h2 style="color:#1a2744">세종대왕 · Le roi Sejong le Grand</h2>
       <p>En 1443, le roi <strong>Sejong</strong> (세종, 1397-1450), quatrième souverain de la dynastie Joseon, fait créer le <strong>hangeul</strong> (한글) : un alphabet pensé pour que le peuple, qui n'avait pas accès aux caractères chinois classiques réservés à l'élite lettrée, puisse enfin lire et écrire facilement.</p>
       <p>Le système est publié en 1446 dans le <em>Hunminjeongeum</em> (훈민정음, « les sons corrects pour l'instruction du peuple »). Les formes des consonnes imitent la position de la bouche et de la langue en les prononçant — un alphabet conçu scientifiquement, chose rarissime dans l'histoire de l'écriture.</p>
       <p>Le 9 octobre, jour du Hangeul (한글날), est aujourd'hui férié en Corée du Sud pour célébrer cette invention.</p>
       <p style="font-size:13px;color:#555">Sans Sejong, tu ne lirais pas les leçons de Korean Stories en hangeul aujourd'hui !</p>` },
    { subject: 'Joseon, cinq siècles qui ont façonné la Corée', html:
      `<h2 style="color:#1a2744">조선 왕조 · La dynastie Joseon</h2>
       <p>La dynastie <strong>Joseon</strong> (조선, 1392-1897) est la plus longue de l'histoire coréenne : plus de cinq siècles, fondée par le général <strong>Yi Seong-gye</strong>.</p>
       <p>Elle installe le confucianisme comme doctrine d'État, structurant en profondeur la société : respect des aînés, importance de l'éducation et des examens d'État (<strong>gwageo</strong>), hiérarchie stricte entre classes sociales (yangban, roturiers).</p>
       <p>C'est aussi l'âge d'or culturel et scientifique du pays sous Sejong (hangeul, astronomie, imprimerie), et la période où Séoul (alors Hanyang) devient capitale, avec la construction du palais <strong>Gyeongbokgung</strong> — toujours visitable aujourd'hui.</p>
       <p style="font-size:13px;color:#555">Beaucoup de dramas historiques coréens (« sageuk », 사극) se déroulent sous Joseon.</p>` },
    { subject: 'Les Trois Royaumes : aux origines de la Corée', html:
      `<h2 style="color:#1a2744">삼국시대 · La période des Trois Royaumes</h2>
       <p>Avant l'unification, la péninsule coréenne était partagée entre trois royaumes rivaux, du 1er siècle avant J.-C. au 7e siècle : <strong>Goguryeo</strong> (au nord, le plus vaste, jusqu'en Mandchourie), <strong>Baekje</strong> (au sud-ouest, réputé pour son raffinement artistique) et <strong>Silla</strong> (au sud-est).</p>
       <p>C'est Silla qui finit par unifier la péninsule en 668, alliée à la dynastie chinoise Tang — donnant naissance à la période de « Silla unifié ».</p>
       <p>Cette ère a laissé un immense patrimoine : tombes royales de Gyeongju (ancienne capitale de Silla, aujourd'hui classée UNESCO), bouddhisme florissant, et les bases du système d'écriture et d'administration qui influenceront toute la suite de l'histoire coréenne.</p>
       <p style="font-size:13px;color:#555">Le nom « Corée » lui-même vient de <strong>Goryeo</strong> (고려), la dynastie qui succède à Silla en 918.</p>` },
    { subject: '1945 : la division de la Corée', html:
      `<h2 style="color:#1a2744">분단 · La division de la Corée</h2>
       <p>En 1945, la libération de la Corée de l'occupation japonaise (1910-1945) s'accompagne d'une division du pays au 38e parallèle, entre une zone d'occupation soviétique au nord et américaine au sud — décision prise sans consultation du peuple coréen, dans le contexte de la guerre froide naissante.</p>
       <p>Cette division se durcit avec la fondation de deux États séparés en 1948, puis la <strong>guerre de Corée</strong> (1950-1953), qui fait des millions de victimes et se termine par un armistice — jamais suivi d'un traité de paix formel à ce jour.</p>
       <p>La <strong>zone démilitarisée</strong> (DMZ), l'une des frontières les plus surveillées au monde, sépare toujours aujourd'hui la Corée du Nord et la Corée du Sud.</p>
       <p style="font-size:13px;color:#555">Un sujet sensible et encore très présent dans la société sud-coréenne d'aujourd'hui.</p>` }
  ],
  actu: [
    { subject: 'La Hallyu : comment la Corée a conquis le monde', html:
      `<h2 style="color:#1a2744">한류 · La vague coréenne</h2>
       <p>La <strong>Hallyu</strong> (한류, « vague coréenne ») désigne l'essor mondial de la culture populaire sud-coréenne depuis la fin des années 1990 : d'abord les dramas dans le reste de l'Asie, puis la K-pop et le cinéma à l'échelle planétaire (Parasite, Squid Game, BTS, BLACKPINK…).</p>
       <p>Ce succès s'appuie sur un vrai soutien de l'État coréen à ses industries culturelles depuis la crise financière de 1997, où le pays a fait le pari de la « soft power » comme relais de croissance.</p>
       <p>Résultat : la demande pour apprendre le coréen a explosé dans le monde entier ces dernières années — et si tu lis ceci, tu en fais sûrement partie !</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>한류 팬이에요</strong> (hallyu paenieyo) — « je suis fan de la Hallyu ».</p>` },
    { subject: 'Pourquoi les Coréens adorent les cafés à thème', html:
      `<h2 style="color:#1a2744">카페 문화 · La culture des cafés</h2>
       <p>La Corée du Sud compte l'une des plus fortes densités de cafés au monde, en particulier à Séoul. Mais au-delà du café lui-même, ce sont des lieux de vie : on y étudie, on y travaille, on y retrouve des amis pendant des heures.</p>
       <p>Le pays s'est aussi fait une spécialité des <strong>cafés à thème</strong> : cafés à chats ou à chiens, cafés Lego, cafés dédiés à un groupe de K-pop, cafés robots... Le décor devient souvent aussi important que la boisson, pensé pour être partagé sur les réseaux sociaux.</p>
       <p>C'est aussi le reflet d'une vraie compétition entre commerces : pour se démarquer, les cafés innovent sans cesse sur l'ambiance et le concept plutôt que sur le prix.</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>카페에 가요</strong> (kapeae gayo) — « je vais au café ».</p>` },
    { subject: 'Les webtoons, la BD qui se lit sur ton téléphone', html:
      `<h2 style="color:#1a2744">웹툰 · Le phénomène webtoon</h2>
       <p>Le <strong>webtoon</strong> (웹툰) est un format de bande dessinée numérique né en Corée dans les années 2000 : lecture verticale, en scrollant sur le téléphone, souvent en couleur et parfois animée — pensé dès le départ pour le mobile plutôt qu'adapté du papier.</p>
       <p>Des plateformes comme Naver Webtoon ou Kakao Webtoon publient des milliers de séries, beaucoup gratuites (avec un système d'épisodes en avance-première payants), couvrant tous les genres : romance, fantasy, thriller, tranche de vie.</p>
       <p>De nombreux dramas et films à succès (comme <em>Sweet Home</em> ou <em>The Uncanny Counter</em>) sont aujourd'hui adaptés de webtoons — un vrai pilier de l'industrie culturelle coréenne.</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>웹툰 봐요?</strong> (weptun bwayo?) — « tu lis des webtoons ? ».</p>` },
    { subject: '빨리빨리 : vivre à la vitesse coréenne', html:
      `<h2 style="color:#1a2744">빨리빨리 · La culture du « vite, vite »</h2>
       <p>Impossible de comprendre la Corée moderne sans connaître le <strong>ppalli-ppalli</strong> (빨리빨리, « vite vite ») : cette exigence de rapidité qu'on retrouve dans la livraison ultra-rapide, l'un des internets les plus rapides au monde, ou l'impatience générale dans la vie quotidienne.</p>
       <p>Cette culture a largement porté le développement économique fulgurant du pays depuis les années 1960 (le fameux « miracle sur le fleuve Han »). Mais elle a aussi un revers : un rythme de travail parmi les plus soutenus des pays de l'OCDE, et une pression sociale forte.</p>
       <p>D'où l'intérêt croissant, chez les jeunes générations, pour des concepts plus lents : le « <strong>워라밸</strong> » (work-life balance) ou la « vie lente » (소확행, « petit bonheur certain »).</p>
       <p style="font-size:13px;color:#555">Petit mot du jour : <strong>빨리빨리!</strong> (ppalli-ppalli) — l'expression que tu entendras partout en Corée.</p>` }
  ]
};

// ── Envoi hebdomadaire d'une édition (culture / histoire / actu) ─────────────
async function sendNewsletterEdition(theme, env) {
  const editions = NEWSLETTER_CONTENT[theme];
  if (!editions || !editions.length) { console.log('[KS] aucune édition pour le thème', theme); return; }

  const idxKey = `nl_idx:${theme}`;
  const idx = parseInt(await env.KS_LICENSES.get(idxKey) || '0', 10) || 0;
  const edition = editions[idx % editions.length];
  await env.KS_LICENSES.put(idxKey, String(idx + 1));

  const contacts = await listActiveContacts(env);
  console.log(`[KS] newsletter ${theme} · édition ${idx % editions.length} · ${contacts.length} destinataires`);

  let sent = 0, failed = 0;
  for (const contact of contacts) {
    const unsubUrl = 'https://ks-premium.delicate-voice-1d19.workers.dev/newsletter/unsubscribe?email=' + encodeURIComponent(contact.email);
    const themeLabel = { culture: 'Culture', histoire: 'Histoire', actu: 'Tendances' }[theme] || theme;
    const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <p style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#B8924E;font-weight:bold;margin-bottom:4px">Korean Stories · ${themeLabel}</p>
        ${edition.html}
        <p style="font-size:13px;color:#555;margin-top:28px;border-top:1px solid #eee;padding-top:16px">Continue ton apprentissage sur <a href="https://koreanstories.fr/app.html" style="color:#B8924E">koreanstories.fr</a>. Tu peux te désinscrire à tout moment en cliquant <a href="${unsubUrl}" style="color:#B8924E">ici</a>.</p>
        <p style="color:#888;font-size:13px">Korean Stories · koreanstories.fr</p>
      </div>
    `;
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
