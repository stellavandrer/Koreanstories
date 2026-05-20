/* ── Site Access Gate ─────────────────────────────────────────────
   Protects the entire site with a password stored in sessionStorage.
   Password is checked once per session (browser tab).
   After unlocking, prompts for a name (or guest mode) if no profile.
─────────────────────────────────────────────────────────────────── */
(function () {
  var PASS     = ['Timo', 'Institut'];
  var KEY      = 'ks_access';
  var USER_KEY = 'ks_user';

  /* Already unlocked this session? */
  try { if (sessionStorage.getItem(KEY) === 'ok') return; } catch (e) {}

  /* Hide page immediately to prevent flash of content */
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.style.visibility = '';

    /* ── Styles ── */
    var s = document.createElement('style');
    s.textContent = [
      '#ks-gate{position:fixed;inset:0;z-index:999999;',
        'background:#0a1220;',
        'display:flex;align-items:center;justify-content:center;',
        'font-family:"Inter",system-ui,sans-serif;',
        'animation:gfIn .3s ease both}',
      '@keyframes gfIn{from{opacity:0}to{opacity:1}}',

      '#ks-gate-box{',
        'width:100%;max-width:360px;margin:0 20px;',
        'background:#152030;',
        'border:1.5px solid rgba(255,255,255,.08);',
        'border-radius:20px;padding:36px 28px;text-align:center;',
        'box-shadow:0 24px 64px rgba(0,0,0,.6);',
        'animation:gboxIn .4s .05s cubic-bezier(.34,1.2,.64,1) both}',
      '@keyframes gboxIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}',

      '#ks-gate-logo{',
        'font-family:"Playfair Display",serif;font-size:22px;font-weight:700;',
        'color:#fff;margin-bottom:6px}',
      '#ks-gate-logo em{color:#C9A96E;font-style:italic}',
      '#ks-gate-sub{font-size:12px;color:rgba(247,248,250,.35);margin-bottom:28px}',

      /* shared input style */
      '.ks-g-input{',
        'width:100%;padding:13px 16px;',
        'background:rgba(255,255,255,.05);',
        'border:1.5px solid rgba(255,255,255,.12);border-radius:12px;',
        'font-size:16px;font-family:inherit;color:#fff;text-align:center;',
        'outline:none;transition:border-color .2s;box-sizing:border-box;',
        'letter-spacing:.12em;margin-bottom:12px}',
      '.ks-g-input::placeholder{color:rgba(247,248,250,.25);letter-spacing:0}',
      '.ks-g-input:focus{border-color:#C9A96E}',

      /* shared button style */
      '.ks-g-btn{',
        'width:100%;padding:13px;border-radius:12px;border:none;cursor:pointer;',
        'background:#C9A96E;color:#0a1220;',
        'font-family:inherit;font-size:14px;font-weight:700;',
        'transition:background .2s,transform .1s;',
        'box-shadow:0 4px 16px rgba(201,169,110,.3)}',
      '.ks-g-btn:hover{background:#D5BA8A}',
      '.ks-g-btn:active{transform:scale(.97)}',

      '#ks-gate-err{',
        'font-size:12px;color:#f87171;margin-top:10px;',
        'min-height:18px;transition:opacity .2s;opacity:0}',
      '#ks-gate-err.show{opacity:1}',

      /* Name step */
      '#ks-name-step{display:none}',
      '#ks-name-step.show{display:block}',
      '#ks-pass-step.hide{display:none}',

      /* Name input — larger, no letter-spacing */
      '#ks-name-input{letter-spacing:0;text-align:left}',
      '#ks-name-input::placeholder{letter-spacing:0}',

      /* Guest link */
      '#ks-guest-btn{',
        'display:block;width:100%;margin-top:12px;',
        'background:none;border:1.5px solid rgba(255,255,255,.12);',
        'border-radius:12px;padding:11px;',
        'color:rgba(247,248,250,.45);font-family:inherit;font-size:13px;',
        'cursor:pointer;transition:border-color .2s,color .2s}',
      '#ks-guest-btn:hover{border-color:rgba(255,255,255,.28);color:rgba(247,248,250,.7)}'
    ].join('');
    document.head.appendChild(s);

    /* ── HTML ── */
    var gate = document.createElement('div');
    gate.id = 'ks-gate';
    gate.innerHTML =
      '<div id="ks-gate-box">' +
        '<div id="ks-gate-logo">Korean <em>Stories</em></div>' +

        /* Step 1 — password */
        '<div id="ks-pass-step">' +
          '<div id="ks-gate-sub">Site en accès privé · Entrez le mot de passe</div>' +
          '<input id="ks-gate-input" class="ks-g-input" type="password" placeholder="Mot de passe" autocomplete="off" autocorrect="off" spellcheck="false"/>' +
          '<button id="ks-gate-btn" class="ks-g-btn">Accéder →</button>' +
          '<div id="ks-gate-err">Mot de passe incorrect</div>' +
        '</div>' +

        /* Step 2 — name / guest (hidden until password ok) */
        '<div id="ks-name-step">' +
          '<div id="ks-gate-sub" style="margin-bottom:20px">Comment t\'appelles-tu ?</div>' +
          '<input id="ks-name-input" class="ks-g-input" type="text" placeholder="Ton prénom" autocomplete="given-name" maxlength="30"/>' +
          '<button id="ks-name-btn" class="ks-g-btn">Commencer →</button>' +
          '<button id="ks-guest-btn">Continuer en tant qu\'invité</button>' +
        '</div>' +
      '</div>';
    document.body.prepend(gate);

    /* ── Step 1 logic ── */
    var passInput = document.getElementById('ks-gate-input');
    var passBtn   = document.getElementById('ks-gate-btn');
    var passErr   = document.getElementById('ks-gate-err');
    var passStep  = document.getElementById('ks-pass-step');
    var nameStep  = document.getElementById('ks-name-step');
    var nameInput = document.getElementById('ks-name-input');
    var nameBtn   = document.getElementById('ks-name-btn');
    var guestBtn  = document.getElementById('ks-guest-btn');

    passInput.focus();

    function closeGate() {
      gate.style.transition = 'opacity .3s';
      gate.style.opacity = '0';
      setTimeout(function () { gate.remove(); }, 300);
    }

    function tryUnlock() {
      if (PASS.indexOf(passInput.value) !== -1) {
        try { sessionStorage.setItem(KEY, 'ok'); } catch (e) {}

        /* Check if user already has a saved profile */
        var existing = null;
        try { existing = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) {}

        if (existing) {
          /* Already has a profile — just close */
          closeGate();
        } else {
          /* Show name step */
          passStep.classList.add('hide');
          nameStep.classList.add('show');
          setTimeout(function () { nameInput.focus(); }, 50);
        }
      } else {
        passErr.classList.add('show');
        passInput.value = '';
        passInput.focus();
        passInput.style.borderColor = '#f87171';
        setTimeout(function () {
          passErr.classList.remove('show');
          passInput.style.borderColor = '';
        }, 2000);
      }
    }

    /* ── Step 2 logic ── */
    function saveName() {
      var raw  = nameInput.value.trim();
      var name = raw.charAt(0).toUpperCase() + raw.slice(1); /* capitalize */
      if (!name) { nameInput.focus(); return; }
      try {
        localStorage.setItem(USER_KEY, JSON.stringify({ name: name, guest: false }));
      } catch (e) {}
      closeGate();
    }

    function saveGuest() {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify({ name: null, guest: true }));
      } catch (e) {}
      closeGate();
    }

    passBtn.addEventListener('click', tryUnlock);
    passInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });

    nameBtn.addEventListener('click', saveName);
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') saveName();
    });
    guestBtn.addEventListener('click', saveGuest);
  });
})();
