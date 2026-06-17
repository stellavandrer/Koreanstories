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
      '.ks-pron-feedback.show{opacity:1;transform:translateX(-50%) translateY(0)}',
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

    var box = document.createElement('div');
    box.className = 'ks-pron-feedback ' + cls;
    box.innerHTML =
      '<div class="pf-header">' +
        '<span class="pf-status">' + icons[cls] + ' ' + labels[cls] + '</span>' +
        '<span class="pf-score">' + Math.round(opts.score * 100) + '%</span>' +
      '</div>' +
      '<div class="pf-row">' +
        '<div class="pf-label">Texte attendu</div>' +
        '<div class="pf-text">' + escapeHtml(opts.expected) + '</div>' +
      '</div>' +
      '<div class="pf-row">' +
        '<div class="pf-label">Tu as dit</div>' +
        '<div class="pf-heard">"' + escapeHtml(opts.heard || '(rien entendu)') + '"</div>' +
      '</div>' +
      '<div class="pf-msg">' + msg + '</div>';
    document.body.appendChild(box);
    requestAnimationFrame(function(){ box.classList.add('show'); });

    FEEDBACK_TIMEOUT = setTimeout(function(){
      box.classList.remove('show');
      setTimeout(function(){ if (box.parentNode) box.remove(); }, 300);
    }, 4500);
  }

  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }

  /* ── Reconnaissance ────────────────────────────────────────────
     Stratégie stricte :
     - Une seule alternative (la plus confiante) — pas de cherry-pick
     - On combine similarité texte + confidence du moteur
     - Seuils relevés : 90% success, 70% partial */
  var ACTIVE_REC = null;
  function startListening(expectedText, btn){
    if (ACTIVE_REC) { try { ACTIVE_REC.abort(); } catch(e){} ACTIVE_REC = null; }
    if (window._ksCurrentAudio) { try { _ksCurrentAudio.pause(); } catch(e){} }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e){}

    var rec = new SR();
    rec.lang = 'ko-KR';
    rec.interimResults = false;
    /* UN SEUL résultat : on évite que le moteur "trouve" une variante
       qui matche par hasard la phrase attendue. */
    rec.maxAlternatives = 1;
    rec.continuous = false;
    ACTIVE_REC = rec;

    btn.classList.remove('success','partial','fail');
    btn.classList.add('listening');

    rec.onresult = function(e){
      var top = e.results[0][0];
      var heard = (top && top.transcript) || '';
      var confidence = (top && typeof top.confidence === 'number') ? top.confidence : 0;

      /* Si rien d'audible, on échoue tout de suite. */
      if (!heard.trim()) {
        btn.classList.remove('listening');
        btn.classList.add('fail');
        setTimeout(function(){ btn.classList.remove('fail'); }, 2500);
        recordAttempt(0);
        showFeedback({ score: 0, expected: expectedText, heard: '', tier: 'fail' });
        return;
      }

      var sim = similarity(heard, expectedText);
      /* La confidence du moteur module le score :
         - Si confiance ≥ 70% on garde le score brut
         - Sinon on le pondère (la reconnaissance n'était pas sûre) */
      var confFactor = confidence > 0 ? Math.max(0.6, Math.min(1, confidence + 0.2)) : 0.85;
      var finalScore = sim * confFactor;

      /* Seuils plus stricts qu'avant */
      var tier = finalScore >= 0.90 ? 'success' : finalScore >= 0.70 ? 'partial' : 'fail';

      btn.classList.remove('listening');
      btn.classList.add(tier);
      setTimeout(function(){ btn.classList.remove(tier); }, 2500);
      recordAttempt(finalScore);
      showFeedback({ score: finalScore, expected: expectedText, heard: heard, tier: tier });
    };

    rec.onerror = function(e){
      btn.classList.remove('listening');
      if (e.error === 'no-speech') {
        showFeedback({ score: 0, expected: expectedText, heard: '', tier: 'fail' });
      } else if (e.error === 'not-allowed') {
        alert('Le micro est bloqué. Autorise l\'accès au microphone dans les réglages du navigateur.');
      }
    };

    rec.onend = function(){
      btn.classList.remove('listening');
      if (ACTIVE_REC === rec) ACTIVE_REC = null;
    };

    try { rec.start(); }
    catch (e) {
      btn.classList.remove('listening');
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
