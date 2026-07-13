/* ═══════════════════════════════════════════════════════════════════
   ks-pronounce.js — Pratique de la prononciation au micro.
   ──────────────────────────────────────────────────────────────────
   Utilise l'API Web Speech Recognition (gratuite, native, sans backend)
   pour écouter la prononciation utilisateur et donner un feedback.

   Stratégie :
   1. Détecte tous les boutons onclick="speak('TEXT',...)" sur la page
   2. Injecte un bouton micro juste à côté de chacun
   3. Au clic, écoute (lang ko-KR), récupère la transcription
   4. Compare au texte attendu via similarité de Levenshtein
   5. Affiche feedback visuel (vert / orange / rouge)

   Support navigateur :
   - Chrome desktop/Android ✓
   - Safari iOS 14.5+ ✓
   - Edge ✓
   - Firefox ✗ (le bouton micro reste caché)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Détection support */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    /* Pas de support → on n'injecte rien. La fonctionnalité reste latente. */
    window.KSPronounce = { supported: false };
    return;
  }

  /* ── Pages exclues ─────────────────────────────────────────────── */
  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'histoires.html':1, 'challenge.html':1,
    'classement.html':1, 'statistiques.html':1, 'trophees.html':1,
    'aide.html':1, 'ressources.html':1, 'login.html':1, 'signup.html':1,
    'test-niveau.html':1, 'bienvenue.html':1, 'favoris.html':1
  };
  function isExcludedPage(){
    var p = location.pathname.split('/').pop() || 'index.html';
    return !!EXCLUDED[p];
  }

  /* ── Décomposition Hangul → Jamo ───────────────────────────────
     Une syllabe coréenne 가 = ㄱ + ㅏ (2 jamo)
     강 = ㄱ + ㅏ + ㅇ (3 jamo)
     Comparer en jamo donne une mesure plus juste : si l'utilisateur
     a dit "안녀" au lieu de "안녕", la syllabe entière est différente
     mais les 4 jamo sur 5 sont corrects. */
  var JAMO_INITIALS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var JAMO_MEDIALS  = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  var JAMO_FINALS   = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  function decomposeHangul(s){
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xAC00 && c <= 0xD7A3) {
        var off = c - 0xAC00;
        var ini = Math.floor(off / (21 * 28));
        var med = Math.floor((off % (21 * 28)) / 28);
        var fin = off % 28;
        out += JAMO_INITIALS[ini] + JAMO_MEDIALS[med] + JAMO_FINALS[fin];
      } else {
        out += s.charAt(i);
      }
    }
    return out;
  }

  /* ── Distance de Levenshtein ──────────────────────────────────── */
  function levenshtein(a, b){
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var m = [];
    for (var i = 0; i <= b.length; i++) m[i] = [i];
    for (var j = 0; j <= a.length; j++) m[0][j] = j;
    for (var i2 = 1; i2 <= b.length; i2++) {
      for (var j2 = 1; j2 <= a.length; j2++) {
        m[i2][j2] = b.charAt(i2-1) === a.charAt(j2-1)
          ? m[i2-1][j2-1]
          : Math.min(m[i2-1][j2-1]+1, m[i2][j2-1]+1, m[i2-1][j2]+1);
      }
    }
    return m[b.length][a.length];
  }

  /* Normalise — vire ponctuation et espaces */
  function normalize(s){
    return (s || '')
      .toLowerCase()
      .replace(/[.,!?;:""''""()\[\]\-_/\s]+/g, '')
      .trim();
  }

  /* Score de similarité 0-1 (1 = parfait).
     On compare en JAMO décomposés pour une mesure plus juste sur le
     coréen — un seul caractère différent dans une syllabe ne fait
     plus chuter le score brutalement. */
  function similarity(heard, expected){
    var a = decomposeHangul(normalize(heard));
    var b = decomposeHangul(normalize(expected));
    if (!b.length) return 0;
    if (!a.length) return 0;
    if (a === b) return 1;
    /* Pénalité de longueur : si l'utilisateur a dit beaucoup moins ou
       beaucoup plus que ce qu'on attend, on pénalise sans laisser
       Levenshtein être trop indulgent sur le ratio. */
    var lenRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    var d = levenshtein(a, b);
    var maxLen = Math.max(a.length, b.length);
    var rawScore = Math.max(0, 1 - (d / maxLen));
    /* On combine score brut avec ratio de longueur (50/50) pour
       éviter qu'un "안녕" très court matche bien "안녕하세요". */
    return rawScore * (0.5 + 0.5 * lenRatio);
  }

  /* ── CSS partagé ────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-pron-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-pron-css';
    s.textContent = [
      /* Le bouton micro reprend le style des .speak-btn / .bubble-audio
         existants pour s'intégrer harmonieusement. */
      '.ks-mic-btn{',
        'display:inline-flex;align-items:center;justify-content:center;',
        'width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(201,169,110,.3);',
        'background:rgba(201,169,110,.10);color:#C9A96E;cursor:pointer;',
        'margin-left:6px;vertical-align:middle;padding:0;transition:all .2s;',
        '-webkit-tap-highlight-color:transparent;flex-shrink:0',
      '}',
      '.ks-mic-btn:hover{background:rgba(201,169,110,.18);transform:scale(1.05)}',
      '.ks-mic-btn:active{transform:scale(.95)}',
      '.ks-mic-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
      /* Animation pulse pendant l\'écoute */
      '.ks-mic-btn.listening{background:#EF4444;color:#fff;border-color:#EF4444;',
        'animation:ksMicPulse 1.2s ease-in-out infinite}',
      '@keyframes ksMicPulse{',
        '0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}',
        '50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}',
      '}',
      /* États après écoute */
      '.ks-mic-btn.success{background:#16A34A;color:#fff;border-color:#16A34A}',
      '.ks-mic-btn.partial{background:#F59E0B;color:#fff;border-color:#F59E0B}',
      '.ks-mic-btn.fail{background:#EF4444;color:#fff;border-color:#EF4444}',

      /* Feedback popup */
      '.ks-pron-feedback{',
        'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);',
        'z-index:99000;background:#0F1B2D;color:#fff;',
        'padding:16px 20px;border-radius:16px;min-width:280px;max-width:340px;',
        'box-shadow:0 12px 32px rgba(0,0,0,.35);',
        'border:1.5px solid rgba(201,169,110,.25);',
        'opacity:0;transition:opacity .25s,transform .25s;pointer-events:none',
      '}',
      '.ks-pron-feedback.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}',
      /* Diff mot à mot : chaque mot de la phrase attendue coloré selon
         sa similarité avec ce qui a été entendu */
      '.pf-header .pf-score{margin-left:auto;margin-right:2px}',
      '.pf-text .pw-ok{color:#22C55E}',
      '.pf-text .pw-mid{color:#F59E0B}',
      '.pf-text .pw-bad{color:#EF4444;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}',
      '.pf-actions{display:flex;gap:8px;margin-top:12px}',
      '.pf-retry{flex:1;padding:9px 12px;border:none;border-radius:10px;',
        'background:#C9A96E;color:#0F1B2D;font-weight:800;font-size:13px;cursor:pointer}',
      '.pf-retry:active{transform:scale(.98)}',
      '.pf-replay{flex:1;padding:9px 12px;border-radius:10px;cursor:pointer;',
        'background:none;border:1.5px solid rgba(201,169,110,.5);color:#C9A96E;font-weight:800;font-size:13px}',
      '.pf-replay:active{transform:scale(.98)}',
      '.ks-pron-feedback .pf-header{',
        'display:flex;align-items:center;justify-content:space-between;',
        'margin-bottom:10px;font-size:11px;font-weight:800;',
        'letter-spacing:.1em;text-transform:uppercase',
      '}',
      '.ks-pron-feedback .pf-score{font-size:13px;font-weight:800}',
      '.ks-pron-feedback.success .pf-score{color:#22C55E}',
      '.ks-pron-feedback.partial .pf-score{color:#F59E0B}',
      '.ks-pron-feedback.fail .pf-score{color:#EF4444}',
      '.ks-pron-feedback .pf-status{color:rgba(247,248,250,.55)}',
      '.ks-pron-feedback .pf-row{margin:6px 0;font-size:13px;line-height:1.5}',
      '.ks-pron-feedback .pf-label{',
        'font-size:10px;font-weight:700;color:rgba(247,248,250,.4);',
        'text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px',
      '}',
      '.ks-pron-feedback .pf-text{',
        'font-family:"Playfair Display",Georgia,serif;font-size:16px;font-weight:600;',
        'color:#C9A96E;line-height:1.4',
      '}',
      '.ks-pron-feedback .pf-heard{color:rgba(247,248,250,.85);font-size:14px;font-style:italic}',
      '.ks-pron-feedback .pf-msg{',
        'margin-top:10px;font-size:12px;color:rgba(247,248,250,.7);font-style:italic',
      '}',
      '.ks-pron-feedback .pf-close{',
        'background:none;border:none;color:rgba(247,248,250,.45);cursor:pointer;',
        'padding:4px 6px;font-size:18px;line-height:1',
      '}',
      '@media (max-width:480px){',
        '.ks-pron-feedback{left:12px;right:12px;transform:translateY(20px);max-width:none;min-width:0}',
        '.ks-pron-feedback.show{transform:translateY(0)}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Statistiques (stockées localement) ──────────────────────── */
  function recordAttempt(score){
    try {
      var stats = JSON.parse(localStorage.getItem('ks_pron_stats') || '{"total":0,"success":0,"partial":0,"fail":0}');
      stats.total++;
      if (score >= 0.85)      stats.success++;
      else if (score >= 0.6)  stats.partial++;
      else                    stats.fail++;
      stats.lastScore = Math.round(score * 100);
      stats.lastAt = Date.now();
      localStorage.setItem('ks_pron_stats', JSON.stringify(stats));
    } catch (e) {}
  }

  /* ── Diff mot à mot ────────────────────────────────────────────
     Aligne les mots entendus sur les mots attendus (programmation
     dynamique maximisant la somme des similarités jamo) et rend,
     pour CHAQUE mot attendu, sa similarité avec le mot entendu qui
     lui correspond — c'est ce qui permet de colorer la phrase cible
     mot par mot dans le feedback (vert/orange/rouge) au lieu d'un
     simple pourcentage global. */
  function wordDiff(expected, heard){
    var E = String(expected||'').trim().split(/\s+/).filter(Boolean);
    var H = String(heard||'').trim().split(/\s+/).filter(Boolean);
    var n = E.length, m = H.length;
    var sims = new Array(n);
    for (var z = 0; z < n; z++) sims[z] = 0;
    if (n && m) {
      var dp = [], bt = [];
      for (var i = 0; i <= n; i++) {
        dp.push(new Array(m+1)); bt.push(new Array(m+1));
        for (var j = 0; j <= m; j++) { dp[i][j] = 0; bt[i][j] = 0; }
      }
      for (var i2 = 1; i2 <= n; i2++) {
        for (var j2 = 1; j2 <= m; j2++) {
          var s = similarity(H[j2-1], E[i2-1]);
          var diag = dp[i2-1][j2-1] + s;
          var up   = dp[i2-1][j2];
          var left = dp[i2][j2-1];
          if (diag >= up && diag >= left) { dp[i2][j2] = diag; bt[i2][j2] = 1; }
          else if (up >= left)            { dp[i2][j2] = up;   bt[i2][j2] = 2; }
          else                            { dp[i2][j2] = left; bt[i2][j2] = 3; }
        }
      }
      var bi = n, bj = m;
      while (bi > 0 && bj > 0) {
        if (bt[bi][bj] === 1) { sims[bi-1] = similarity(H[bj-1], E[bi-1]); bi--; bj--; }
        else if (bt[bi][bj] === 2) bi--;
        else bj--;
      }
    }
    return E.map(function(w, k){ return { w: w, sim: sims[k] }; });
  }

  function renderExpectedDiff(expected, heard){
    if (!String(heard||'').trim()) return escapeHtml(expected);
    return wordDiff(expected, heard).map(function(d){
      var cls = d.sim >= 0.8 ? 'pw-ok' : d.sim >= 0.5 ? 'pw-mid' : 'pw-bad';
      return '<span class="' + cls + '">' + escapeHtml(d.w) + '</span>';
    }).join(' ');
  }

  /* ── Affichage feedback ──────────────────────────────────────── */
  var FEEDBACK_TIMEOUT = null;
  function showFeedback(opts){
    var existing = document.querySelector('.ks-pron-feedback');
    if (existing) existing.remove();
    if (FEEDBACK_TIMEOUT) clearTimeout(FEEDBACK_TIMEOUT);

    var cls = opts.tier; /* success / partial / fail */
    var icons = {
      success: '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#22C55E;stroke-width:3;stroke-linecap:round"><polyline points="20 6 9 17 4 12"/></svg>',
      partial: '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#F59E0B;stroke-width:2.5;stroke-linecap:round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      fail:    '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#EF4444;stroke-width:2.5;stroke-linecap:round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    };
    var labels = {
      success: 'Excellent',
      partial: 'Pas mal',
      fail:    'À retravailler'
    };
    var messages = {
      success: ['Prononciation parfaite !', 'Tu es prêt·e à parler !', 'Magnifique !'],
      partial: ['Bien essayé, encore un effort.', 'Tu y es presque.', 'Réécoute et retente.'],
      fail:    ['Réécoute attentivement.', 'Concentre-toi sur les syllabes.', 'Pas grave, on recommence ?']
    };
    var msg = messages[cls][Math.floor(Math.random()*messages[cls].length)];

    var hasRetry  = typeof opts.retry === 'function';
    var hasReplay = typeof opts.replay === 'function';
    var hasDiff   = !!String(opts.heard||'').trim();

    var box = document.createElement('div');
    box.className = 'ks-pron-feedback ' + cls;
    box.innerHTML =
      '<div class="pf-header">' +
        '<span class="pf-status">' + icons[cls] + ' ' + labels[cls] + '</span>' +
        '<span class="pf-score">' + Math.round(opts.score * 100) + '%</span>' +
        '<button class="pf-close" type="button" aria-label="Fermer">×</button>' +
      '</div>' +
      '<div class="pf-row">' +
        '<div class="pf-label">Texte attendu' + (hasDiff ? ' — mot par mot' : '') + '</div>' +
        '<div class="pf-text">' + renderExpectedDiff(opts.expected, opts.heard) + '</div>' +
      '</div>' +
      '<div class="pf-row">' +
        '<div class="pf-label">Tu as dit</div>' +
        '<div class="pf-heard">"' + escapeHtml(opts.heard || '(rien entendu)') + '"</div>' +
      '</div>' +
      '<div class="pf-msg">' + msg + '</div>' +
      (hasRetry || hasReplay ?
        '<div class="pf-actions">' +
          (hasReplay ? '<button class="pf-replay" type="button">Réécouter</button>' : '') +
          (hasRetry  ? '<button class="pf-retry" type="button">Réessayer</button>'  : '') +
        '</div>' : '');
    document.body.appendChild(box);

    function closeBox(){
      if (FEEDBACK_TIMEOUT) clearTimeout(FEEDBACK_TIMEOUT);
      box.classList.remove('show');
      setTimeout(function(){ if (box.parentNode) box.remove(); }, 200);
    }
    var cb = box.querySelector('.pf-close');
    if (cb) cb.addEventListener('click', closeBox);
    if (hasRetry) {
      box.querySelector('.pf-retry').addEventListener('click', function(){
        closeBox();
        opts.retry();
      });
    }
    if (hasReplay) {
      box.querySelector('.pf-replay').addEventListener('click', function(){
        /* On rejoue le modèle SANS fermer le popup : l'utilisateur
           compare l'audio natif au diff mot à mot encore affiché. */
        if (FEEDBACK_TIMEOUT) clearTimeout(FEEDBACK_TIMEOUT);
        FEEDBACK_TIMEOUT = setTimeout(function(){
          box.classList.remove('show');
          setTimeout(function(){ if (box.parentNode) box.remove(); }, 300);
        }, 9000);
        opts.replay();
      });
    }
    requestAnimationFrame(function(){ box.classList.add('show'); });

    /* Plus long quand des actions sont proposées — il faut le
       temps de lire le diff et de cliquer. */
    FEEDBACK_TIMEOUT = setTimeout(function(){
      box.classList.remove('show');
      setTimeout(function(){ if (box.parentNode) box.remove(); }, 300);
    }, (hasRetry || hasReplay) ? 8000 : 4500);
  }

  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }

  /* ── Reconnaissance ────────────────────────────────────────────
     - Résultats intermédiaires affichés en direct (opts.onInterim) :
       sans ça, 3-4 s de silence visuel donnent l'impression que rien
       ne se passe — cause n°1 du ressenti « ça ne marche pas ».
     - 3 alternatives : on garde celle qui ressemble le plus à LA
       phrase attendue. Pas de triche possible (la comparaison reste
       contre la cible), mais on ne pénalise plus l'utilisateur quand
       le moteur hésite entre deux transcriptions dont une est bonne.
     - Seuils inchangés : 90% success, 70% partial.
     opts (tous optionnels) :
       onState(s)  — 'listening'|'hearing'|'done'|'idle' pour l'UI hôte
       onInterim(t)— transcription partielle en direct
       retry()     — si fourni, bouton « Réessayer » dans le feedback
       replay()    — si fourni, bouton « Réécouter » (modèle natif) */
  var ACTIVE_REC = null;
  function startListening(expectedText, btn, opts){
    opts = opts || {};
    var say = typeof opts.onState === 'function' ? opts.onState : function(){};
    var onInterim = typeof opts.onInterim === 'function' ? opts.onInterim : null;
    /* Relance de grâce : une session qui meurt quasi instantanément
       sans rien capter (raté classique du moteur au démarrage) est
       relancée UNE fois en silence au lieu d'afficher un échec. */
    var graceUsed = !!opts._graceUsed;
    var startTime = Date.now();
    if (ACTIVE_REC) { try { ACTIVE_REC.abort(); } catch(e){} ACTIVE_REC = null; }
    if (window._ksCurrentAudio) { try { _ksCurrentAudio.pause(); } catch(e){} }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e){}

    var rec = new SR();
    rec.lang = 'ko-KR';
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    ACTIVE_REC = rec;

    btn.classList.remove('success','partial','fail');
    btn.classList.add('listening');
    say('listening');

    /* Filet de sécurité : sur certains navigateurs/versions, le moteur
       déclenche onend sans jamais avoir déclenché onresult ni onerror
       (fin silencieuse). Sans ce drapeau, l'utilisateur ne voit alors
       strictement rien — ni feedback, ni alerte. */
    var settled = false;

    rec.onspeechstart = function(){ say('hearing'); };

    function failEmpty(){
      if (!graceUsed && Date.now() - startTime < 3000) {
        /* Mort prématurée sans capture → on relance sans rien montrer.
           Un seul rejeu (marqueur _graceUsed) pour éviter toute boucle. */
        var o2 = {};
        for (var k in opts) o2[k] = opts[k];
        o2._graceUsed = true;
        startListening(expectedText, btn, o2);
        return;
      }
      btn.classList.remove('listening');
      btn.classList.add('fail');
      setTimeout(function(){ btn.classList.remove('fail'); }, 2500);
      recordAttempt(0);
      say('done');
      showFeedback({ score: 0, expected: expectedText, heard: '', tier: 'fail', retry: opts.retry, replay: opts.replay });
    }

    rec.onresult = function(e){
      var last = e.results[e.results.length - 1];
      if (!last.isFinal) {
        /* Transcription partielle → retour visuel immédiat */
        if (onInterim) {
          var t = '';
          for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
          if (t.trim()) onInterim(t.trim());
        }
        return;
      }
      settled = true;

      /* Meilleure alternative par rapport à la phrase ATTENDUE */
      var best = { score: -1, heard: '' };
      for (var k = 0; k < last.length; k++) {
        var alt = last[k];
        var heardK = (alt && alt.transcript) ? alt.transcript.trim() : '';
        if (!heardK) continue;
        var confidence = (alt && typeof alt.confidence === 'number') ? alt.confidence : 0;
        /* La confidence du moteur module le score :
           - Si confiance ≥ 70% on garde le score brut
           - Sinon on le pondère (la reconnaissance n'était pas sûre) */
        var confFactor = confidence > 0 ? Math.max(0.6, Math.min(1, confidence + 0.2)) : 0.85;
        var s = similarity(heardK, expectedText) * confFactor;
        if (s > best.score) best = { score: s, heard: heardK };
      }

      /* Si rien d'audible, on échoue tout de suite. */
      if (!best.heard) { failEmpty(); return; }

      var finalScore = best.score;
      var tier = finalScore >= 0.90 ? 'success' : finalScore >= 0.70 ? 'partial' : 'fail';

      btn.classList.remove('listening');
      btn.classList.add(tier);
      setTimeout(function(){ btn.classList.remove(tier); }, 2500);
      recordAttempt(finalScore);
      say('done');
      showFeedback({ score: finalScore, expected: expectedText, heard: best.heard, tier: tier, retry: opts.retry, replay: opts.replay });
    };

    rec.onerror = function(e){
      settled = true;
      btn.classList.remove('listening');
      if (e.error === 'no-speech') {
        say('done');
        showFeedback({ score: 0, expected: expectedText, heard: '', tier: 'fail', retry: opts.retry, replay: opts.replay });
      } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        say('idle');
        alert('Le micro est bloqué. Autorise l\'accès au microphone dans les réglages du navigateur.');
      } else if (e.error === 'audio-capture') {
        say('idle');
        alert('Aucun micro détecté. Vérifie qu\'un microphone est branché et qu\'aucune autre appli ne l\'utilise déjà.');
      } else if (e.error === 'network') {
        say('idle');
        alert('Le service de reconnaissance vocale est injoignable. Vérifie ta connexion internet et réessaie.');
      } else if (e.error === 'aborted') {
        /* Interruption volontaire (nouvelle écoute lancée juste après) — pas d'alerte. */
      } else {
        /* Tout autre code (language-not-supported, bad-grammar…) : on ne laisse
           jamais le bouton revenir à l'état neutre sans un mot d'explication. */
        say('idle');
        alert('Erreur de reconnaissance vocale (' + e.error + '). Réessaie dans quelques secondes.');
      }
    };

    rec.onend = function(){
      var isCurrent = (ACTIVE_REC === rec);
      btn.classList.remove('listening');
      if (isCurrent) ACTIVE_REC = null;
      if (!settled && isCurrent) {
        /* Fin silencieuse confirmée : on affiche le même retour que pour
           "aucun son détecté" plutôt que de laisser le bouton redevenir
           neutre sans explication. */
        failEmpty();
      } else if (isCurrent) {
        say('idle');
      }
    };

    try { rec.start(); }
    catch (e) {
      btn.classList.remove('listening');
      say('idle');
      alert('Erreur micro : ' + e.message);
    }
  }

  /* ── Extrait le texte de l'attribut onclick d'un bouton speak ──── */
  function extractSpeakText(el){
    var oc = el.getAttribute('onclick') || '';
    var m = oc.match(/speak\(\s*['"`]([^'"`]+)['"`]/);
    return m ? m[1] : null;
  }

  /* ── Injection des boutons micro ─────────────────────────────── */
  var MIC_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';

  function injectMicButtons(){
    var speakers = document.querySelectorAll('[onclick*="speak("]');
    speakers.forEach(function(speakBtn){
      if (speakBtn.dataset.ksMicAttached) return;
      var text = extractSpeakText(speakBtn);
      if (!text) return;
      speakBtn.dataset.ksMicAttached = '1';

      var mic = document.createElement('button');
      mic.className = 'ks-mic-btn';
      mic.type = 'button';
      mic.setAttribute('aria-label', 'Tester ma prononciation');
      mic.setAttribute('title', 'Tester ma prononciation');
      mic.innerHTML = MIC_SVG;
      mic.addEventListener('click', function(e){
        e.stopPropagation();
        e.preventDefault();
        startListening(text, mic);
      });

      /* Insertion : juste APRÈS le bouton speak */
      if (speakBtn.nextSibling) {
        speakBtn.parentNode.insertBefore(mic, speakBtn.nextSibling);
      } else {
        speakBtn.parentNode.appendChild(mic);
      }
    });
  }

  /* ── Observer pour les boutons ajoutés dynamiquement ─────────── */
  function startObserving(){
    if (!window.MutationObserver) return;
    var obs = new MutationObserver(function(mutations){
      var hasNew = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.addedNodes && m.addedNodes.length) { hasNew = true; break; }
      }
      if (hasNew) injectMicButtons();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ── Init : on injecte juste le CSS, PAS les boutons.
     L'auto-injection est désactivée — le mode prononciation est
     désormais un exercice dédié sur la page prononciation.html. */
  function init(){
    injectCSS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API publique : utilisée par prononciation.html */
  window.KSPronounce = {
    supported: true,
    listen: startListening,
    similarity: similarity,
    showFeedback: showFeedback,
    stats: function(){
      try { return JSON.parse(localStorage.getItem('ks_pron_stats')||'{}'); }
      catch(e){ return {}; }
    },
    reset: function(){ try { localStorage.removeItem('ks_pron_stats'); } catch(e){} }
  };
})();
