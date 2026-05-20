/* ── Site Access Gate ─────────────────────────────────────────────
   Protects the entire site with a password stored in sessionStorage.
   Password is checked once per session (browser tab).
─────────────────────────────────────────────────────────────────── */
(function () {
  var PASS = ['Timo', 'Institut'];
  var KEY  = 'ks_access';

  try { if (sessionStorage.getItem(KEY) === 'ok') return; } catch (e) {}

  /* Hide page immediately to prevent flash of content */
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.style.visibility = '';

    /* ── Inject gate styles ── */
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

      '#ks-gate-input{',
        'width:100%;padding:13px 16px;',
        'background:rgba(255,255,255,.05);',
        'border:1.5px solid rgba(255,255,255,.12);border-radius:12px;',
        'font-size:16px;font-family:inherit;color:#fff;text-align:center;',
        'outline:none;transition:border-color .2s;box-sizing:border-box;',
        'letter-spacing:.12em;margin-bottom:12px}',
      '#ks-gate-input::placeholder{color:rgba(247,248,250,.25);letter-spacing:0}',
      '#ks-gate-input:focus{border-color:#C9A96E}',

      '#ks-gate-btn{',
        'width:100%;padding:13px;border-radius:12px;border:none;cursor:pointer;',
        'background:#C9A96E;color:#0a1220;',
        'font-family:inherit;font-size:14px;font-weight:700;',
        'transition:background .2s,transform .1s;',
        'box-shadow:0 4px 16px rgba(201,169,110,.3)}',
      '#ks-gate-btn:hover{background:#D5BA8A}',
      '#ks-gate-btn:active{transform:scale(.97)}',

      '#ks-gate-err{',
        'font-size:12px;color:#f87171;margin-top:10px;',
        'min-height:18px;transition:opacity .2s;opacity:0}',
      '#ks-gate-err.show{opacity:1}'
    ].join('');
    document.head.appendChild(s);

    /* ── Inject gate HTML ── */
    var gate = document.createElement('div');
    gate.id = 'ks-gate';
    gate.innerHTML =
      '<div id="ks-gate-box">' +
        '<div id="ks-gate-logo">Korean <em>Stories</em></div>' +
        '<div id="ks-gate-sub">Site en accès privé · Entrez le mot de passe</div>' +
        '<input id="ks-gate-input" type="password" placeholder="Mot de passe" autocomplete="off" autocorrect="off" spellcheck="false"/>' +
        '<button id="ks-gate-btn">Accéder →</button>' +
        '<div id="ks-gate-err">Mot de passe incorrect</div>' +
      '</div>';
    document.body.prepend(gate);

    var input = document.getElementById('ks-gate-input');
    var btn   = document.getElementById('ks-gate-btn');
    var err   = document.getElementById('ks-gate-err');

    input.focus();

    function tryUnlock() {
      if (PASS.indexOf(input.value) !== -1) {
        try { sessionStorage.setItem(KEY, 'ok'); } catch (e) {}
        gate.style.transition = 'opacity .3s';
        gate.style.opacity = '0';
        setTimeout(function () { gate.remove(); }, 300);
      } else {
        err.classList.add('show');
        input.value = '';
        input.focus();
        input.style.borderColor = '#f87171';
        setTimeout(function () {
          err.classList.remove('show');
          input.style.borderColor = '';
        }, 2000);
      }
    }

    btn.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  });
})();
