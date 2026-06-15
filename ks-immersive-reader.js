/* ═══════════════════════════════════════════════════════════════════
   ks-immersive-reader.js — Mode lecture immersive pour les histoires.
   ──────────────────────────────────────────────────────────────────
   - Détecte les .bubble (dialogue) sur les pages histoire*.html
   - Ajoute un toggle "Mode immersif" en haut
   - En mode immersif :
     · Affiche UNE seule bulle à la fois en grand
     · Audio + flèches ← → + barre de progression
     · Compte les mots tapés (intégration tap-translate)
     · Stats finales : durée + mots découverts
   - Bénéficie automatiquement du tap-translate déjà chargé
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function currentPath(){
    return location.pathname.split('/').pop() || 'index.html';
  }
  /* N'active que sur les pages histoire */
  if (!/^histoire\d+\.html$/i.test(currentPath())) return;

  /* ── État ────────────────────────────────────────────────────── */
  var bubbles = [];
  var idx = 0;
  var startTime = 0;
  var tappedWords = new Set();
  var active = false;

  /* ── CSS ──────────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-im-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-im-css';
    s.textContent = [
      /* Toggle button injecté dans la nav bar */
      '.ks-im-toggle{',
        'background:linear-gradient(135deg,#C9A96E,#D4B582);color:#0a1220;',
        'border:none;cursor:pointer;border-radius:100px;padding:6px 12px 6px 10px;',
        'font-size:11.5px;font-weight:700;font-family:inherit;',
        'display:inline-flex;align-items:center;gap:5px;margin-right:6px;',
        '-webkit-tap-highlight-color:transparent;transition:transform .15s',
      '}',
      '.ks-im-toggle:hover{transform:scale(1.04)}',
      '.ks-im-toggle:active{transform:scale(.95)}',
      '.ks-im-toggle svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;flex-shrink:0}',
      /* Mobile : icône seule — la barre porte déjà retour/note/favori/thème/XP */
      '@media(max-width:599px){',
        '.ks-im-toggle{font-size:0;gap:0;width:34px;height:34px;padding:0;justify-content:center}',
        '.ks-im-toggle svg{width:15px;height:15px}',
      '}',

      /* Overlay du mode */
      '.ks-im-overlay{',
        'position:fixed;inset:0;z-index:9700;background:var(--bg,#FFF8EC);',
        'display:flex;flex-direction:column;',
        'opacity:0;pointer-events:none;transition:opacity .3s',
      '}',
      '[data-theme="dark"] .ks-im-overlay{background:var(--bg,#0a1220)}',
      '.ks-im-overlay.show{opacity:1;pointer-events:auto}',

      /* Header avec progression */
      '.ks-im-head{',
        'padding:18px 20px 0;display:flex;align-items:center;justify-content:space-between;',
        'gap:10px;flex-shrink:0',
      '}',
      '.ks-im-close{',
        'background:rgba(0,0,0,.08);border:none;padding:6px 12px;border-radius:8px;',
        'font-size:12px;font-weight:700;color:inherit;cursor:pointer;font-family:inherit',
      '}',
      '[data-theme="dark"] .ks-im-close{background:rgba(255,255,255,.1)}',
      '.ks-im-position{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tx-muted,#9ca3af)}',

      '.ks-im-bar-wrap{padding:8px 20px 0;flex-shrink:0}',
      '.ks-im-bar{',
        'width:100%;height:5px;border-radius:3px;background:rgba(201,169,110,.18);',
        'overflow:hidden',
      '}',
      '.ks-im-bar-fill{',
        'height:100%;background:linear-gradient(90deg,#C9A96E,#E8C589);',
        'border-radius:3px;width:0%;transition:width .35s cubic-bezier(.4,0,.2,1)',
      '}',

      /* Bulle au centre */
      '.ks-im-stage{',
        'flex:1;display:flex;align-items:center;justify-content:center;',
        'padding:24px 20px;min-height:0;overflow-y:auto',
      '}',
      '.ks-im-card{',
        'width:100%;max-width:520px;background:var(--surf,#fff);',
        'border:1px solid rgba(201,169,110,.22);border-radius:24px;',
        'padding:28px 24px;box-shadow:0 12px 36px rgba(0,0,0,.07);',
        'text-align:center;animation:ksImIn .4s cubic-bezier(.34,1.2,.64,1)',
      '}',
      '[data-theme="dark"] .ks-im-card{background:rgba(255,255,255,.04);border-color:rgba(201,169,110,.3)}',
      '@keyframes ksImIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '.ks-im-speaker{',
        'display:inline-flex;align-items:center;gap:6px;',
        'font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;',
        'color:#C9A96E;background:rgba(201,169,110,.13);',
        'padding:4px 10px;border-radius:100px;margin-bottom:14px',
      '}',
      '.ks-im-kr{',
        'font-family:"Playfair Display",Georgia,serif;font-size:clamp(20px,4.5vw,26px);',
        'font-weight:600;line-height:1.45;color:var(--tx,#111);margin-bottom:12px',
      '}',
      '[data-theme="dark"] .ks-im-kr{color:#f7f8fa}',
      '.ks-im-rom{',
        'font-size:13px;color:var(--tx-muted,#9ca3af);font-style:italic;',
        'margin-bottom:14px;letter-spacing:.01em',
      '}',
      '.ks-im-fr{',
        'font-size:14px;color:var(--tx-muted,#6b7280);line-height:1.55;',
        'padding-top:14px;border-top:1px dashed rgba(201,169,110,.3);',
        'display:none',
      '}',
      '.ks-im-fr.show{display:block}',
      '.ks-im-toggle-fr{',
        'background:none;border:1.5px solid rgba(201,169,110,.4);color:#C9A96E;',
        'font-size:11px;font-weight:700;padding:5px 12px;border-radius:100px;',
        'cursor:pointer;font-family:inherit;margin-top:14px;',
        '-webkit-tap-highlight-color:transparent',
      '}',
      '.ks-im-toggle-fr:hover{background:rgba(201,169,110,.1)}',

      '.ks-im-audio{',
        'margin-top:18px;width:60px;height:60px;border-radius:50%;',
        'background:#C9A96E;color:#0a1220;border:none;cursor:pointer;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'box-shadow:0 6px 18px rgba(201,169,110,.35);',
        'transition:transform .15s,background .15s;-webkit-tap-highlight-color:transparent',
      '}',
      '.ks-im-audio:hover{transform:scale(1.06)}',
      '.ks-im-audio:active{transform:scale(.94)}',
      '.ks-im-audio.playing{background:#16A34A;color:#fff}',
      '.ks-im-audio svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',

      /* Navigation flèches */
      '.ks-im-nav{',
        'padding:14px 20px 22px;display:flex;gap:10px;align-items:center;justify-content:center;',
        'flex-shrink:0',
      '}',
      '.ks-im-arrow{',
        'flex:1;max-width:200px;background:var(--surf,#fff);',
        'border:1.5px solid var(--bd,#e5e7eb);color:inherit;',
        'border-radius:14px;padding:12px;font-size:14px;font-weight:700;',
        'cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;',
        '-webkit-tap-highlight-color:transparent;transition:all .15s',
      '}',
      '.ks-im-arrow:hover:not(:disabled){border-color:#C9A96E;color:#C9A96E}',
      '.ks-im-arrow:disabled{opacity:.3;cursor:default}',
      '.ks-im-arrow svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}',
      '[data-theme="dark"] .ks-im-arrow{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12)}',

      /* Écran final */
      '.ks-im-done{',
        'background:linear-gradient(135deg,rgba(201,169,110,.10),rgba(11,28,52,.04));',
        'border-radius:24px;padding:36px 28px;text-align:center;width:100%;max-width:480px',
      '}',
      '[data-theme="dark"] .ks-im-done{background:linear-gradient(135deg,rgba(201,169,110,.15),rgba(11,28,52,.4))}',
      '.ks-im-done-emblem{',
        'width:60px;height:60px;margin:0 auto 14px;border-radius:50%;',
        'background:linear-gradient(135deg,#C9A96E,#E8C589);color:#0a1220;',
        'display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 6px 18px rgba(201,169,110,.35)',
      '}',
      '.ks-im-done-emblem svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}',
      '.ks-im-done h2{font-family:"Playfair Display",Georgia,serif;font-size:24px;color:var(--tx,#111);margin:0 0 6px}',
      '[data-theme="dark"] .ks-im-done h2{color:#f7f8fa}',
      '.ks-im-done p{font-size:13px;color:var(--tx-muted,#6b7280);line-height:1.55;margin:.4rem 0 1rem}',
      '.ks-im-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}',
      '.ks-im-stat{background:rgba(201,169,110,.10);border:1px solid rgba(201,169,110,.22);border-radius:12px;padding:10px}',
      '.ks-im-stat-val{font-size:20px;font-weight:800;color:#C9A96E}',
      '.ks-im-stat-lbl{font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--tx-muted,#6b7280);margin-top:2px}',
      '.ks-im-done-btns{display:flex;gap:8px;margin-top:18px}',
      '.ks-im-done-btn{',
        'flex:1;padding:12px;border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid var(--bd,#e5e7eb);background:transparent;color:inherit',
      '}',
      '.ks-im-done-btn.primary{background:#C9A96E;color:#0a1220;border-color:#C9A96E}',
      '.ks-im-done-btn.primary:hover{background:#D4B582}',

      /* Mobile : layout adapté */
      '@media (max-width:480px){',
        '.ks-im-card{padding:22px 18px;border-radius:18px}',
        '.ks-im-kr{font-size:21px}',
        '.ks-im-audio{width:54px;height:54px}',
        '.ks-im-stage{padding:18px 14px}',
        '.ks-im-arrow{padding:11px;font-size:13px}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Extract bubbles from page ──────────────────────────────── */
  function extractBubbles(){
    var nodes = document.querySelectorAll('.bubble');
    var out = [];
    nodes.forEach(function(node){
      var kr = node.querySelector('.bubble-kr');
      var rom = node.querySelector('.bubble-rom');
      var fr = node.querySelector('.bubble-fr');
      var audioBtn = node.querySelector('.bubble-audio');
      /* Le speaker est souvent dans un sibling .speaker-name */
      var parent = node.closest('.bubble-row, .dialogue-row, [class*="row"]');
      var speakerEl = parent ? parent.querySelector('.speaker, .speaker-name, [class*="name"]') : null;
      /* Récupère le texte coréen brut (sans les span .kw qui sont décoratifs) */
      var krText = kr ? kr.textContent.trim() : '';
      /* Récupère le texte à passer à speak() depuis l'onclick s'il existe */
      var spoken = krText;
      if (audioBtn) {
        var oc = audioBtn.getAttribute('onclick') || '';
        var m = oc.match(/speak\(['"`]([^'"`]+)['"`]/);
        if (m) spoken = m[1];
      }
      if (!krText) return;
      out.push({
        kr: krText,
        krHtml: kr ? kr.innerHTML : '',
        rom: rom ? rom.textContent.trim() : '',
        fr: fr ? fr.textContent.trim() : '',
        spoken: spoken,
        speaker: speakerEl ? speakerEl.textContent.trim() : ''
      });
    });
    return out;
  }

  /* ── Render bubble courant ───────────────────────────────── */
  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }
  function renderCurrent(){
    if (idx >= bubbles.length) return showDone();
    var b = bubbles[idx];
    var card = document.getElementById('ksImCard');
    card.innerHTML =
      (b.speaker ? '<div class="ks-im-speaker">' + escapeHtml(b.speaker) + '</div>' : '') +
      '<div class="ks-im-kr">' + b.krHtml + '</div>' +
      (b.rom ? '<div class="ks-im-rom">' + escapeHtml(b.rom) + '</div>' : '') +
      '<button class="ks-im-audio" id="ksImAudio" aria-label="Écouter">' +
        '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
      '</button>' +
      '<div><button class="ks-im-toggle-fr" id="ksImToggleFr">Voir la traduction</button></div>' +
      (b.fr ? '<div class="ks-im-fr" id="ksImFr">' + escapeHtml(b.fr) + '</div>' : '');

    /* Audio */
    document.getElementById('ksImAudio').addEventListener('click', function(){
      var btn = document.getElementById('ksImAudio');
      btn.classList.add('playing');
      if (typeof speak === 'function') speak(b.spoken, btn);
      setTimeout(function(){ btn.classList.remove('playing'); }, 3000);
    });
    /* Toggle FR */
    var toggleFr = document.getElementById('ksImToggleFr');
    if (toggleFr && b.fr) {
      toggleFr.addEventListener('click', function(){
        var fr = document.getElementById('ksImFr');
        var shown = fr.classList.toggle('show');
        toggleFr.textContent = shown ? 'Masquer la traduction' : 'Voir la traduction';
      });
    } else if (toggleFr) {
      toggleFr.style.display = 'none';
    }

    /* Position + barre */
    document.getElementById('ksImPos').textContent = (idx + 1) + ' / ' + bubbles.length;
    document.getElementById('ksImBarFill').style.width = ((idx + 1) / bubbles.length * 100) + '%';
    /* Boutons nav */
    document.getElementById('ksImPrev').disabled = idx === 0;
    document.getElementById('ksImNext').textContent = (idx === bubbles.length - 1) ? 'Terminer' : 'Suivant →';
    /* Auto-play de la phrase au passage */
    setTimeout(function(){
      var auto = document.getElementById('ksImAudio');
      if (auto) auto.click();
    }, 300);
  }

  /* ── Stats finales ─────────────────────────────────────── */
  function showDone(){
    var minutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    var card = document.getElementById('ksImCard').parentNode;
    card.innerHTML =
      '<div class="ks-im-done">' +
        '<div class="ks-im-done-emblem">' +
          '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<h2>Histoire terminée</h2>' +
        '<p>Bravo, tu as parcouru toute l\'histoire en mode immersif !</p>' +
        '<div class="ks-im-stats">' +
          '<div class="ks-im-stat"><div class="ks-im-stat-val">' + bubbles.length + '</div><div class="ks-im-stat-lbl">Phrases</div></div>' +
          '<div class="ks-im-stat"><div class="ks-im-stat-val">' + tappedWords.size + '</div><div class="ks-im-stat-lbl">Mots tapés</div></div>' +
          '<div class="ks-im-stat"><div class="ks-im-stat-val">' + minutes + ' min</div><div class="ks-im-stat-lbl">Durée</div></div>' +
        '</div>' +
        '<div class="ks-im-done-btns">' +
          '<button class="ks-im-done-btn" id="ksImRestart">Recommencer</button>' +
          '<button class="ks-im-done-btn primary" id="ksImExit">Fermer</button>' +
        '</div>' +
      '</div>';
    document.getElementById('ksImRestart').addEventListener('click', function(){
      idx = 0; tappedWords = new Set(); startTime = Date.now();
      reopen();
    });
    document.getElementById('ksImExit').addEventListener('click', closeMode);
  }

  function reopen(){
    /* Re-render la carte vide pour relancer le flux */
    var stage = document.querySelector('.ks-im-stage');
    if (!stage) return;
    stage.innerHTML = '<div class="ks-im-card" id="ksImCard"></div>';
    renderCurrent();
  }

  /* ── Open / Close ──────────────────────────────────────── */
  function openMode(){
    if (active) return;
    bubbles = extractBubbles();
    if (!bubbles.length) {
      alert('Aucune phrase de dialogue détectée sur cette page.');
      return;
    }
    injectCSS();
    idx = 0;
    tappedWords = new Set();
    startTime = Date.now();

    var overlay = document.createElement('div');
    overlay.className = 'ks-im-overlay';
    overlay.id = 'ksImOverlay';
    overlay.innerHTML =
      '<div class="ks-im-head">' +
        '<button class="ks-im-close" id="ksImClose">Fermer</button>' +
        '<span class="ks-im-position" id="ksImPos">1 / ' + bubbles.length + '</span>' +
        '<span style="font-size:11px;font-weight:700;color:var(--gold,#C9A96E)">Mode immersif</span>' +
      '</div>' +
      '<div class="ks-im-bar-wrap"><div class="ks-im-bar"><div class="ks-im-bar-fill" id="ksImBarFill"></div></div></div>' +
      '<div class="ks-im-stage">' +
        '<div class="ks-im-card" id="ksImCard"></div>' +
      '</div>' +
      '<div class="ks-im-nav">' +
        '<button class="ks-im-arrow" id="ksImPrev">' +
          '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Précédent' +
        '</button>' +
        '<button class="ks-im-arrow" id="ksImNext">Suivant →</button>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.classList.add('show'); });
    active = true;

    document.getElementById('ksImClose').addEventListener('click', closeMode);
    document.getElementById('ksImPrev').addEventListener('click', function(){
      if (idx > 0) { idx--; renderCurrent(); }
    });
    document.getElementById('ksImNext').addEventListener('click', function(){
      if (idx < bubbles.length - 1) { idx++; renderCurrent(); }
      else { idx = bubbles.length; showDone(); }
    });
    /* Flèches clavier */
    document.addEventListener('keydown', keyHandler);
    /* Swipe mobile */
    bindSwipe(overlay);
    /* Compte les mots tapés (via ks-tap-translate) */
    document.addEventListener('click', wordTapCounter);

    renderCurrent();
  }

  function closeMode(){
    var overlay = document.getElementById('ksImOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('click', wordTapCounter);
    setTimeout(function(){
      if (overlay.parentNode) overlay.remove();
      active = false;
    }, 300);
  }

  function keyHandler(e){
    if (!active) return;
    if (e.key === 'Escape') closeMode();
    else if (e.key === 'ArrowLeft') {
      if (idx > 0) { idx--; renderCurrent(); }
    } else if (e.key === 'ArrowRight') {
      if (idx < bubbles.length - 1) { idx++; renderCurrent(); }
      else if (idx === bubbles.length - 1) { idx = bubbles.length; showDone(); }
    }
  }

  function bindSwipe(target){
    var sx = 0, sy = 0;
    target.addEventListener('touchstart', function(e){
      if (e.touches[0]) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
    }, { passive: true });
    target.addEventListener('touchend', function(e){
      var ex = e.changedTouches[0] ? e.changedTouches[0].clientX : sx;
      var ey = e.changedTouches[0] ? e.changedTouches[0].clientY : sy;
      var dx = ex - sx, dy = ey - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && idx < bubbles.length - 1) { idx++; renderCurrent(); }
        else if (dx > 0 && idx > 0) { idx--; renderCurrent(); }
      }
    }, { passive: true });
  }

  /* Compte les mots tapés pendant la session */
  function wordTapCounter(e){
    var pop = e.target.closest && e.target.closest('.ks-tt-pop');
    if (pop) return;
    setTimeout(function(){
      var visiblePop = document.querySelector('.ks-tt-pop.show');
      if (visiblePop) {
        var w = visiblePop.querySelector('.ks-tt-word');
        if (w) tappedWords.add(w.textContent);
      }
    }, 100);
  }

  /* ── Toggle button dans la bar ────────────────────────── */
  function injectToggle(){
    var bar = document.querySelector('nav.bar, .bar');
    if (!bar || bar.querySelector('.ks-im-toggle')) return;

    /* Le CSS doit exister AVANT le bouton, sinon il s'affiche
       avec les styles navigateur par défaut (blob gris/noir) */
    injectCSS();

    var btn = document.createElement('button');
    btn.className = 'ks-im-toggle';
    btn.type = 'button';
    btn.title = 'Démarrer le mode lecture immersive';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
      'Immersif';
    btn.addEventListener('click', openMode);

    /* Place avant le bouton thème ou favori */
    var barR = bar.querySelector('.bar-r');
    var anchor = bar.querySelector('.ks-note-btn, .ks-fav-btn, .theme-btn, .bar-theme');
    if (barR) {
      barR.insertBefore(btn, barR.firstChild);
    } else if (anchor) {
      bar.insertBefore(btn, anchor);
    } else {
      bar.appendChild(btn);
    }
    /* Sur petit écran, design.css masque le logo centré quand la barre
       porte des outils (sinon ils se chevauchent) */
    bar.classList.add('bar-has-tools');
  }

  /* ── Init ──────────────────────────────────────────────── */
  function init(){
    /* Attend un tick que les autres modules aient injecté leurs boutons */
    setTimeout(injectToggle, 150);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API publique */
  window.KSImmersive = {
    open: openMode,
    close: closeMode,
    isActive: function(){ return active; }
  };
})();
