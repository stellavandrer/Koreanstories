// Korean Stories — Premium License Worker
// Routes:
//   POST /webhook  — reçoit les événements Stripe
//   GET  /verify?key=XXX — vérifie une clé de licence depuis l'app
//
// Variables d'environnement à configurer dans Cloudflare (jamais dans le code) :
//   STRIPE_SECRET_KEY       sk_live_...
//   STRIPE_WEBHOOK_SECRET   whsec_...
//   RESEND_API_KEY          re_...
// KV binding : KS_LICENSES

const PRICE_MONTHLY  = 'price_1TlSZWPab8Hr1KXaBRSn6YZo';
const PRICE_LIFETIME = 'price_1TlSZvPab8Hr1KXaXLoambKW';

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
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      await handleCancellation(event.data.object, env);
      break;
  }

  return new Response('OK', { status: 200 });
}

// ── Nouveau paiement (abonnement ou à vie) ────────────────────────────────────
async function handleCheckout(session, env) {
  const email = session.customer_email || session.customer_details?.email;
  if (!email) return;

  const isLifetime = session.mode === 'payment';

  // Clé existante ? On la réactive
  const existingKey = await env.KS_LICENSES.get(`email:${email}`);
  if (existingKey) {
    const data = await env.KS_LICENSES.get(existingKey, { type: 'json' });
    if (data) {
      data.status = 'active';
      if (isLifetime) data.type = 'lifetime';
      await env.KS_LICENSES.put(existingKey, JSON.stringify(data));
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
async function handleCancellation(obj, env) {
  const email = obj.customer_email;
  if (!email) return;

  const key = await env.KS_LICENSES.get(`email:${email}`);
  if (!key) return;

  const data = await env.KS_LICENSES.get(key, { type: 'json' });
  if (data && data.type === 'monthly') {
    data.status = 'cancelled';
    await env.KS_LICENSES.put(key, JSON.stringify(data));
  }
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
      <p style="color:#888;font-size:13px">Korean Stories · koreanstories.fr</p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Korean Stories <premium@koreanstories.fr>',
      to: email,
      subject: '💛 Ta clé Premium Korean Stories',
      html
    })
  });
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
