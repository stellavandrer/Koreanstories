/* ═══════════════════════════════════════════════════════════════════
   ks-tour.js — Tour guidé du dashboard (1ère visite app.html)
   ──────────────────────────────────────────────────────────────────
   S'affiche au PREMIER chargement de app.html après l'onboarding
   (test de niveau). 5 étapes avec spotlight + tooltip qui présentent
   les éléments clés du tableau de bord. Stocke ks_tour_dashboard
   pour ne pas réapparaître.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Ne tourne QUE sur app.html et seulement si pas déjà fait */
  if (location.pathname.indexOf('app.html') < 0 && location.pathname !== '/' && location.pathname.replace(/\/$/, '') !== '') return;
  try {
    if (localStorage.getItem('ks_tour_dashboard') === 'done') return;
    /* Skip si on n'a pas encore fait l'onboarding initial (test de niveau) */
    if (localStorage.getItem('ks_onboarded') !== 'done') return;
  } catch (e) { return; }

  /* ── Définition des étapes ─────────────────────────────────────── */
  var STEPS = [
    {
      title: 'Bienvenue sur ton tableau de bord !',
      body:  'Je te montre rapidement les 4 zones clés en 30 secondes. Tu peux passer à tout moment.',
      target: null /* étape sans cible — modal centré */
    },
    {
      title: 'Ta prochaine activité',
      body:  'Cette carte est ton point d\'entrée. Clique sur "Continuer" et tu reprends pile où tu en étais dans le parcours.',
      target: '.cont-card'
    },
    {
      title: 'Défis de la semaine',
      body:  '5 missions chaque semaine pour rester régulier·e. Chaque mission complète te crédite des XP bonus.',
      target: '#wklyCard'
    },
    {
      title: 'Objectif quotidien',
      body:  'Vise les 50 XP par jour pour maintenir ton streak. La barre dorée se remplit au fil de tes leçons.',
      target: '.goal-card'
    },
    {
      title: 'Navigation',
      body:  'En bas : Accueil, Cours (parcours), Histoires, Défi, Profil. Tout est à portée de pouce.',
      target: '.bnav'
    },
    {
      title: 'Tu es prêt·e ! 화이팅',
      body:  'Tu peux retrouver ce tour à tout moment dans Réglages. Bon apprentissage !',
      target: null
    }
  ];

  /* ── CSS injecté ────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('ks-tour-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-tour-css';
    s.textContent = [
      '#ks-tour-mask{position:fixed;inset:0;z-index:99800;pointer-events:auto;',
        'background:rgba(8,14,24,.72);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);',
        'animation:ksTourIn .25s ease}',
      '@keyframes ksTourIn{from{opacity:0}to{opacity:1}}',
      '#ks-tour-spot{position:fixed;z-index:99810;pointer-events:none;',
        'border-radius:14px;box-shadow:0 0 0 9999px rgba(8,14,24,.72),',
        '0 0 0 3px rgba(201,169,110,.6),0 0 32px rgba(201,169,110,.4);',
        'transition:all .35s cubic-bezier(.4,0,.2,1)}',
      '#ks-tour-card{position:fixed;z-index:99820;background:#152030;',
        'border:1.5px solid rgba(201,169,110,.35);border-radius:18px;',
        'padding:22px 22px 18px;max-width:340px;width:calc(100vw - 40px);',
        'box-shadow:0 24px 64px rgba(0,0,0,.55);color:#f7f8fa;',
        'font-family:"Inter",sans-serif;animation:ksTourUp .35s cubic-bezier(.34,1.4,.64,1)}',
      '@keyframes ksTourUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:none}}',
      '#ks-tour-card.center{top:50%;left:50%;transform:translate(-50%,-50%)}',
      '@keyframes ksTourUpC{from{opacity:0;transform:translate(-50%,-50%) scale(.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
      '#ks-tour-card.center{animation:ksTourUpC .35s cubic-bezier(.34,1.4,.64,1)}',
      '.ks-tour-step{font-size:11px;font-weight:700;letter-spacing:.12em;',
        'text-transform:uppercase;color:rgba(201,169,110,.85);margin-bottom:8px}',
      '.ks-tour-title{font-family:"Playfair Display",Georgia,serif;font-size:20px;',
        'font-weight:700;color:#fff;margin:0 0 8px;line-height:1.2}',
      '.ks-tour-body{font-size:13.5px;line-height:1.6;color:rgba(247,248,250,.78);',
        'margin:0 0 18px}',
      '.ks-tour-actions{display:flex;align-items:center;gap:10px}',
      '.ks-tour-skip{flex:0 0 auto;background:none;border:none;color:rgba(247,248,250,.45);',
        'font-size:12px;cursor:pointer;font-family:inherit;font-weight:600;',
        'padding:8px 12px;border-radius:8px;transition:color .15s}',
      '.ks-tour-skip:hover{color:#f7f8fa}',
      '.ks-tour-next{flex:1;background:#C9A96E;color:#0a1220;border:none;border-radius:12px;',
        'padding:12px 16px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;',
        'display:flex;align-items:center;justify-content:center;gap:6px;transition:background .2s}',
      '.ks-tour-next:hover{background:#D4B582}',
      '.ks-tour-next svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}',
      '.ks-tour-dots{display:flex;gap:5px;justify-content:center;margin-bottom:14px}',
      '.ks-tour-dot{width:7px;height:7px;border-radius:50%;background:rgba(247,248,250,.18);transition:all .25s}',
      '.ks-tour-dot.on{background:#C9A96E;width:22px;border-radius:100px}',
      ''
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Place la carte tooltip selon la cible ──────────────────────── */
  function placeCard(card, targetEl) {
    if (!targetEl) {
      card.classList.add('center');
      card.style.top = card.style.left = card.style.transform = '';
      return;
    }
    card.classList.remove('center');
    var rect = targetEl.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var cardH = 200; /* estimation */
    var below = rect.bottom + 16 + cardH < vh;
    if (below) {
      card.style.top = (rect.bottom + 16) + 'px';
    } else {
      card.style.top = Math.max(20, rect.top - cardH - 16) + 'px';
    }
    /* Centrer horizontalement, mais clamper aux bords */
    var cardW = 340;
    var centerLeft = rect.left + rect.width/2 - cardW/2;
    centerLeft = Math.max(20, Math.min(centerLeft, vw - cardW - 20));
    card.style.left = centerLeft + 'px';
    card.style.transform = '';
  }

  function placeSpotlight(spot, targetEl) {
    if (!targetEl) { spot.style.display = 'none'; return; }
    spot.style.display = '';
    var rect = targetEl.getBoundingClientRect();
    var pad = 8;
    spot.style.top    = (rect.top - pad) + 'px';
    spot.style.left   = (rect.left - pad) + 'px';
    spot.style.width  = (rect.width + pad*2) + 'px';
    spot.style.height = (rect.height + pad*2) + 'px';
  }

  /* ── Tour runner ────────────────────────────────────────────────── */
  function start() {
    injectCSS();
    var mask = document.createElement('div');
    mask.id = 'ks-tour-mask';
    document.body.appendChild(mask);

    var spot = document.createElement('div');
    spot.id = 'ks-tour-spot';
    spot.style.display = 'none';
    document.body.appendChild(spot);

    var card = document.createElement('div');
    card.id = 'ks-tour-card';
    document.body.appendChild(card);

    var idx = 0;
    function done() {
      try { localStorage.setItem('ks_tour_dashboard', 'done'); } catch (e) {}
      mask.remove(); spot.remove(); card.remove();
    }
    function render() {
      var step = STEPS[idx];
      var targetEl = step.target ? document.querySelector(step.target) : null;
      /* Si la cible n'existe pas (page différente, etc.), on passe en mode centré */
      if (step.target && !targetEl) { /* on saute cette étape */
        idx++;
        if (idx >= STEPS.length) return done();
        return render();
      }
      var dotsHtml = STEPS.map(function(_, i){
        return '<span class="ks-tour-dot' + (i===idx?' on':'') + '"></span>';
      }).join('');
      var last = idx === STEPS.length - 1;
      card.innerHTML =
        '<div class="ks-tour-step">Étape ' + (idx+1) + ' / ' + STEPS.length + '</div>' +
        '<h3 class="ks-tour-title">' + step.title + '</h3>' +
        '<p class="ks-tour-body">' + step.body + '</p>' +
        '<div class="ks-tour-dots">' + dotsHtml + '</div>' +
        '<div class="ks-tour-actions">' +
          (last ? '' : '<button class="ks-tour-skip" id="ksTourSkip">Passer</button>') +
          '<button class="ks-tour-next" id="ksTourNext">' +
            (last ? "C'est parti !" : 'Suivant') +
            (last ? '' : ' <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>') +
          '</button>' +
        '</div>';
      placeSpotlight(spot, targetEl);
      placeCard(card, targetEl);
      /* Scroll pour rendre la cible visible si besoin */
      if (targetEl) {
        var rect = targetEl.getBoundingClientRect();
        if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          /* Re-place après scroll */
          setTimeout(function(){ placeSpotlight(spot, targetEl); placeCard(card, targetEl); }, 400);
        }
      }
      var nextBtn = document.getElementById('ksTourNext');
      var skipBtn = document.getElementById('ksTourSkip');
      if (nextBtn) nextBtn.onclick = function () {
        idx++;
        if (idx >= STEPS.length) done();
        else render();
      };
      if (skipBtn) skipBtn.onclick = done;
    }
    render();

    /* Re-position au resize */
    window.addEventListener('resize', function () {
      var step = STEPS[idx];
      var targetEl = step && step.target ? document.querySelector(step.target) : null;
      if (mask.parentNode) { placeSpotlight(spot, targetEl); placeCard(card, targetEl); }
    });
  }

  /* Lance après que le dashboard ait pu se rendre (cartes dynamiques) */
  function ready() {
    /* Attend un peu pour laisser le DOM se peupler (weekly card, etc.) */
    setTimeout(start, 800);
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);

})();
