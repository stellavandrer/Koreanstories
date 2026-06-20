/* ═══════════════════════════════════════════════════════════════════
   ks-onboarding.js — Mini tour 4 étapes pour les nouveaux utilisateurs.
   Déclenchement :
   - ks_onboarded non posé (jamais terminé ni passé)
   - page courante = app.html ou index.html
   - délai 1500 ms après load (le temps de voir le dashboard)
   Pose ks_onboarded = '1' à la fin ou au skip.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Skip si déjà fait */
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (ls('ks_onboarded')) return;

  /* Tour réservé au tableau de bord de l'app — JAMAIS sur la landing
     publique (index.html / racine), qui est une page marketing. */
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (here !== 'app.html') return;

  /* Skip si l'utilisateur arrive d'une page interne (clic « back » vers l'app)
     plutôt qu'un cold start. On laisse 1 chance par session. */
  if (sessionStorage.getItem('ks_onboarding_attempted')) return;
  try { sessionStorage.setItem('ks_onboarding_attempted', '1'); } catch (e) {}

  /* ── Définition du tour ────────────────────────────────────────── */
  var STEPS = [
    {
      kr: '환영합니다',
      title: 'Bienvenue sur Korean Stories',
      body: 'Un tour rapide en 4 étapes pour ne rien rater. Ça prend 30 secondes — ou tu peux passer.',
      target: null,
      btn: 'Démarrer',
      skip: 'Passer le tour'
    },
    {
      kr: '한글',
      title: 'Commence par l\'alphabet',
      body: 'Le Hangeul s\'apprend en 2 à 3 semaines. C\'est la fondation de tout — sans ça, le reste du parcours ne fonctionne pas.',
      target: 'a[href="hangeul.html"].scard',
      btn: 'Suivant',
      skip: 'Passer'
    },
    {
      kr: '학습 경로',
      title: 'Ton chemin A1 → B2',
      body: 'Le curriculum complet, structuré par niveau CEFR. La carte « Mon Parcours » montre ton rang actuel, qui évolue automatiquement avec tes XP.',
      target: 'a[href="cours.html"].scard',
      btn: 'Suivant',
      skip: 'Passer'
    },
    {
      kr: '인증서',
      title: 'Ton diplôme évolue avec toi',
      body: 'XP, paliers, rang : tout est sur ton certificat — imprimable, téléchargeable, partageable. Et l\'aide est toujours dans le footer en bas si tu te perds.',
      target: 'a[href="certificat.html"].scard',
      btn: 'C\'est parti !',
      skip: null
    }
  ];

  var currentStep = 0;
  var rootEl = null;
  var backdropEl = null;
  var spotlightEl = null;
  var cardEl = null;

  function injectCSS() {
    if (document.getElementById('ks-onb-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-onb-css';
    s.textContent = [
      '#ks-onb-root{position:fixed;inset:0;z-index:99700;pointer-events:none;font-family:"Inter",system-ui,sans-serif;opacity:0;transition:opacity .35s}',
      '#ks-onb-root.on{opacity:1}',
      '#ks-onb-root .onb-backdrop{position:absolute;inset:0;background:rgba(10,16,28,.72);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);pointer-events:auto}',
      '#ks-onb-root .onb-spotlight{position:absolute;border-radius:16px;box-shadow:0 0 0 9999px rgba(10,16,28,.72), 0 0 0 3px rgba(201,169,110,.85), 0 0 38px rgba(201,169,110,.55);pointer-events:none;transition:all .45s cubic-bezier(.34,1.56,.64,1);animation:onbPulse 2.2s ease-in-out infinite}',
      '@keyframes onbPulse{0%,100%{box-shadow:0 0 0 9999px rgba(10,16,28,.72), 0 0 0 3px rgba(201,169,110,.85), 0 0 38px rgba(201,169,110,.55)}50%{box-shadow:0 0 0 9999px rgba(10,16,28,.72), 0 0 0 3px rgba(201,169,110,1), 0 0 50px rgba(201,169,110,.85)}}',
      /* Card */
      '#ks-onb-root .onb-card{position:absolute;width:340px;max-width:calc(100vw - 32px);background:#fff;color:#0F1B2D;border-radius:18px;padding:18px 18px 16px;box-shadow:0 18px 48px rgba(0,0,0,.4);pointer-events:auto;transition:transform .35s cubic-bezier(.34,1.56,.64,1), top .45s cubic-bezier(.4,0,.2,1), left .45s cubic-bezier(.4,0,.2,1);transform:scale(.96);opacity:0}',
      '#ks-onb-root.on .onb-card{transform:scale(1);opacity:1}',
      '[data-theme="dark"] #ks-onb-root .onb-card{background:#1a2334;color:#EDF2FA}',
      '#ks-onb-root .onb-arrow{position:absolute;width:14px;height:14px;background:#fff;transform:rotate(45deg);pointer-events:none}',
      '[data-theme="dark"] #ks-onb-root .onb-arrow{background:#1a2334}',
      '#ks-onb-root .onb-arrow.top{top:-7px;left:50%;margin-left:-7px}',
      '#ks-onb-root .onb-arrow.bottom{bottom:-7px;left:50%;margin-left:-7px}',
      /* Header */
      '#ks-onb-root .onb-progress{display:flex;align-items:center;gap:6px;margin-bottom:10px}',
      '#ks-onb-root .onb-dot{flex:1;height:3px;border-radius:2px;background:rgba(15,27,45,.1);transition:background .25s}',
      '[data-theme="dark"] #ks-onb-root .onb-dot{background:rgba(255,255,255,.1)}',
      '#ks-onb-root .onb-dot.act{background:linear-gradient(90deg,#C9A96E,#D4B582)}',
      '#ks-onb-root .onb-dot.done{background:#C9A96E}',
      '#ks-onb-root .onb-kr{font-family:"Playfair Display",Georgia,serif;font-size:13px;font-weight:700;color:#8B6B3D;letter-spacing:.06em;margin-bottom:3px}',
      '[data-theme="dark"] #ks-onb-root .onb-kr{color:#D5BA8A}',
      '#ks-onb-root .onb-title{font-family:"Playfair Display",Georgia,serif;font-size:18px;font-weight:700;color:#0F1B2D;line-height:1.2;margin:0 0 6px}',
      '[data-theme="dark"] #ks-onb-root .onb-title{color:#EDF2FA}',
      '#ks-onb-root .onb-body{font-size:13.5px;color:rgba(15,27,45,.7);line-height:1.55;margin:0 0 14px}',
      '[data-theme="dark"] #ks-onb-root .onb-body{color:rgba(237,242,250,.7)}',
      /* Buttons */
      '#ks-onb-root .onb-btns{display:flex;align-items:center;gap:10px}',
      '#ks-onb-root .onb-next{flex:1;background:#0F1B2D;color:#fff;border:none;border-radius:10px;padding:11px 16px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
      '[data-theme="dark"] #ks-onb-root .onb-next{background:#C9A96E;color:#0a1220}',
      '#ks-onb-root .onb-next:hover{background:#1a2f4a}',
      '[data-theme="dark"] #ks-onb-root .onb-next:hover{background:#D4B582}',
      '#ks-onb-root .onb-next svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}',
      '#ks-onb-root .onb-skip{background:none;border:none;color:rgba(15,27,45,.55);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;padding:6px 4px;text-decoration:underline;text-underline-offset:2px}',
      '[data-theme="dark"] #ks-onb-root .onb-skip{color:rgba(237,242,250,.55)}',
      '#ks-onb-root .onb-skip:hover{color:#0F1B2D}',
      '[data-theme="dark"] #ks-onb-root .onb-skip:hover{color:#EDF2FA}',
      /* Mobile */
      '@media (max-width:480px){',
        '#ks-onb-root .onb-card{width:auto;left:16px !important;right:16px !important;max-width:none}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function buildRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'ks-onb-root';
    rootEl.setAttribute('role', 'dialog');
    rootEl.setAttribute('aria-label', 'Tour d\'introduction Korean Stories');
    rootEl.setAttribute('aria-modal', 'true');

    backdropEl = document.createElement('div');
    backdropEl.className = 'onb-backdrop';
    backdropEl.addEventListener('click', function () {
      /* Clic sur backdrop = avance, mais hors zone spotlight */
      next();
    });
    rootEl.appendChild(backdropEl);

    spotlightEl = document.createElement('div');
    spotlightEl.className = 'onb-spotlight';
    rootEl.appendChild(spotlightEl);

    cardEl = document.createElement('div');
    cardEl.className = 'onb-card';
    rootEl.appendChild(cardEl);

    document.body.appendChild(rootEl);
    /* Force reflow puis active */
    // eslint-disable-next-line no-unused-expressions
    rootEl.offsetHeight;
    rootEl.classList.add('on');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function renderProgressDots() {
    var html = '';
    for (var i = 0; i < STEPS.length; i++) {
      var cls = i < currentStep ? 'onb-dot done' : (i === currentStep ? 'onb-dot act' : 'onb-dot');
      html += '<div class="' + cls + '"></div>';
    }
    return html;
  }

  function placeSpotlight(target) {
    if (!target) {
      /* Pas de cible : on cache le spotlight, on centre la card */
      spotlightEl.style.opacity = '0';
      spotlightEl.style.pointerEvents = 'none';
      return null;
    }
    spotlightEl.style.opacity = '1';
    var rect = target.getBoundingClientRect();
    var pad = 8;
    spotlightEl.style.top = (rect.top - pad) + 'px';
    spotlightEl.style.left = (rect.left - pad) + 'px';
    spotlightEl.style.width = (rect.width + pad * 2) + 'px';
    spotlightEl.style.height = (rect.height + pad * 2) + 'px';
    return rect;
  }

  function placeCard(rect) {
    /* Calcul de position : sous le spotlight si possible, sinon au-dessus, sinon centré */
    var cardW = 340;
    var cardMaxW = Math.min(cardW, window.innerWidth - 32);
    var vpH = window.innerHeight;
    var vpW = window.innerWidth;

    /* Mesure rapide de la hauteur de la card (~200 px estimés sans mesurer) */
    var estCardH = 200;

    var pos = { top: 0, left: 0, arrow: null };

    if (!rect) {
      /* Centré */
      pos.top = Math.max(20, (vpH - estCardH) / 2);
      pos.left = (vpW - cardMaxW) / 2;
    } else {
      var spaceBelow = vpH - (rect.bottom + 8);
      var spaceAbove = rect.top - 8;
      var preferBelow = spaceBelow >= estCardH + 20;
      if (preferBelow) {
        pos.top = rect.bottom + 18;
        pos.arrow = 'top';
      } else if (spaceAbove >= estCardH + 20) {
        pos.top = rect.top - estCardH - 18;
        pos.arrow = 'bottom';
      } else {
        /* Pas la place : on centre verticalement */
        pos.top = (vpH - estCardH) / 2;
      }
      /* Horizontal : centré sur la cible, clampé dans le viewport */
      pos.left = rect.left + rect.width / 2 - cardMaxW / 2;
      pos.left = Math.max(16, Math.min(pos.left, vpW - cardMaxW - 16));
    }

    cardEl.style.top = pos.top + 'px';
    cardEl.style.left = pos.left + 'px';
    return pos.arrow;
  }

  function renderStep() {
    var step = STEPS[currentStep];
    if (!step) return finish();

    /* Trouve la cible si présente */
    var target = null;
    if (step.target) {
      try { target = document.querySelector(step.target); } catch (e) {}
      /* Scroll into view si nécessaire */
      if (target) {
        var r = target.getBoundingClientRect();
        if (r.top < 100 || r.bottom > window.innerHeight - 100) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          /* Petit délai pour laisser le scroll s'opérer puis on replace */
          setTimeout(function(){ doRender(target, step); }, 450);
          return;
        }
      }
    }
    doRender(target, step);
  }

  function doRender(target, step) {
    var rect = placeSpotlight(target);
    var arrow = placeCard(rect);

    var arrowHtml = arrow ? '<div class="onb-arrow ' + arrow + '"></div>' : '';
    var skipHtml = step.skip ? '<button class="onb-skip" type="button">' + escapeHtml(step.skip) + '</button>' : '';
    var arrowIcon = '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';

    cardEl.innerHTML =
      arrowHtml +
      '<div class="onb-progress">' + renderProgressDots() + '</div>' +
      '<div class="onb-kr">' + escapeHtml(step.kr) + '</div>' +
      '<h3 class="onb-title">' + escapeHtml(step.title) + '</h3>' +
      '<p class="onb-body">' + escapeHtml(step.body) + '</p>' +
      '<div class="onb-btns">' +
        skipHtml +
        '<button class="onb-next" type="button">' + escapeHtml(step.btn) + arrowIcon + '</button>' +
      '</div>';

    var nextBtn = cardEl.querySelector('.onb-next');
    if (nextBtn) nextBtn.addEventListener('click', next);
    var skipBtn = cardEl.querySelector('.onb-skip');
    if (skipBtn) skipBtn.addEventListener('click', finish);
  }

  function next() {
    currentStep++;
    if (currentStep >= STEPS.length) return finish();
    renderStep();
  }

  function finish() {
    lsSet('ks_onboarded', '1');
    if (rootEl) {
      rootEl.classList.remove('on');
      setTimeout(function () {
        if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
      }, 400);
    }
    /* Cleanup listeners */
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onResize);
    document.removeEventListener('keydown', onKey);
  }

  function onResize() {
    /* Re-place spotlight + card sur resize / scroll */
    if (!rootEl || !rootEl.classList.contains('on')) return;
    var step = STEPS[currentStep];
    if (!step) return;
    var target = step.target ? document.querySelector(step.target) : null;
    var rect = placeSpotlight(target);
    placeCard(rect);
  }

  function onKey(e) {
    if (e.key === 'Escape') finish();
    if (e.key === 'Enter' || e.key === 'ArrowRight') next();
  }

  function start() {
    injectCSS();
    buildRoot();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onResize, { passive: true });
    renderStep();
  }

  /* Boot : on attend 1.5s après le load pour ne pas piéger l'utilisateur
     pendant que le dashboard s'initialise (XP, cards qui s'animent, etc.) */
  if (document.readyState === 'complete') {
    setTimeout(start, 1500);
  } else {
    window.addEventListener('load', function () { setTimeout(start, 1500); });
  }
})();
