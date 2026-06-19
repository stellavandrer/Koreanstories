/**
 * Korean Stories — Shared JS utilities
 * Loaded by all pages for consistent behavior.
 */

/* ── Global UX polish — injected on every page ────────────────────── */
(function injectPolish() {
  if (document.getElementById('ks-polish-css')) return;
  var css = [
    /* iOS: no font auto-inflation, no blue tap flash */
    'html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}',
    '*{-webkit-tap-highlight-color:transparent}',
    /* Brand-coloured text selection */
    '::selection{background:rgba(201,169,110,.28)}',
    /* Keyboard focus ring (accessibility) — only on keyboard nav */
    ':focus-visible{outline:2px solid #C9A96E;outline-offset:2px;border-radius:3px}',
    'a:focus:not(:focus-visible),button:focus:not(:focus-visible){outline:none}',
    /* Tactile press feedback on interactive elements (mobile + desktop) */
    'a:active,button:active,[role="button"]:active,[onclick]:active{',
      'transition:transform .04s ease}',
    /* Discreet custom scrollbar on desktop pointers */
    '@media(pointer:fine){',
      '::-webkit-scrollbar{width:10px;height:10px}',
      '::-webkit-scrollbar-track{background:transparent}',
      '::-webkit-scrollbar-thumb{background:rgba(140,140,140,.34);',
        'border-radius:8px;border:2px solid transparent;background-clip:padding-box}',
      '::-webkit-scrollbar-thumb:hover{background:rgba(140,140,140,.55);background-clip:padding-box}',
    '}',
    /* Respect the OS "reduce motion" setting */
    '@media(prefers-reduced-motion:reduce){',
      '*,*::before,*::after{',
        'animation-duration:.001ms!important;animation-iteration-count:1!important;',
        'transition-duration:.001ms!important;scroll-behavior:auto!important}',
    '}',
    ''
  ].join('');
  var s = document.createElement('style');
  s.id = 'ks-polish-css';
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
})();

/* ── Dark Mode Toggle ─────────────────────────────────────────────── */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('ks_theme', next); } catch(e) {}
  document.querySelectorAll('[data-dark-icon]').forEach(el => {
    el.setAttribute('data-dark-icon', next);
  });
}
// Aliases for backwards compatibility — exposed on window for onclick handlers
window.ksDarkToggle = toggleTheme;
window.toggleDarkGlobal = toggleTheme;

/* ── XP / Streak from localStorage ────────────────────────────────── */
function ksGetXP()     { try { return parseInt(localStorage.getItem('ks_xp') || '0'); } catch(e) { return 0; } }

/* ── Count-up animation pour les chiffres ──
   Anime un nombre de la valeur courante vers une valeur cible en
   utilisant requestAnimationFrame. Easing cubic-out pour un arrêt
   doux. Respecte prefers-reduced-motion. */
function ksCountUp(el, target, opts) {
  if (!el) return;
  opts = opts || {};
  var duration = opts.duration || 700;
  var suffix = opts.suffix || '';
  var locale = opts.locale || 'fr-FR';
  /* Respect du système : si reduce motion, on saute l'anim */
  var prefersReduce = false;
  try { prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  /* Valeur de départ : lit le contenu courant si numérique, sinon 0 */
  var startTxt = (el.textContent || '').replace(/[^\d-]/g, '');
  var start = parseInt(startTxt, 10) || 0;
  var end = parseInt(target, 10) || 0;
  if (start === end || prefersReduce) {
    el.textContent = end.toLocaleString(locale) + suffix;
    return;
  }
  var t0 = performance.now();
  function step(now) {
    var p = Math.min(1, (now - t0) / duration);
    /* easeOutCubic */
    var eased = 1 - Math.pow(1 - p, 3);
    var v = Math.round(start + (end - start) * eased);
    el.textContent = v.toLocaleString(locale) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
window.ksCountUp = ksCountUp;
function ksGetStreak() { try { return parseInt(localStorage.getItem('ks_streak') || '0'); } catch(e) { return 0; } }
function ksAddXP(n)    { try { const v = ksGetXP() + n; localStorage.setItem('ks_xp', v); return v; } catch(e) {} }

/* ── Best-streak tracking — capture le record de série sur chaque page ── */
(function trackBestStreak() {
  try {
    var cur  = parseInt(localStorage.getItem('ks_streak') || '0') || 0;
    var best = parseInt(localStorage.getItem('ks_beststreak') || '0') || 0;
    if (cur > best) localStorage.setItem('ks_beststreak', String(cur));
  } catch (e) {}
})();

/* ── Streak Freeze — 2 sauvetages par mois ─────────────────────────
   Si l'utilisateur rate UN jour, un freeze est consommé automatiquement
   pour préserver le streak. Renouvelé au 1er de chaque mois.
   - ks_freezes_left : nombre de freezes disponibles ce mois
   - ks_freezes_month : YYYY-MM du dernier renouvellement
   - ks_freezes_used_log : JSON [{date, streakAtTime}] pour historique */
var KS_FREEZE_MAX = 2;
function _ksFreezeMonth(){ return new Date().toISOString().slice(0,7); }
function ksMaybeRenewFreezes(){
  try {
    var m = _ksFreezeMonth();
    if (localStorage.getItem('ks_freezes_month') !== m) {
      localStorage.setItem('ks_freezes_month', m);
      localStorage.setItem('ks_freezes_left', String(KS_FREEZE_MAX));
    }
  } catch (e) {}
}
function ksFreezesLeft(){
  ksMaybeRenewFreezes();
  try { return parseInt(localStorage.getItem('ks_freezes_left') || String(KS_FREEZE_MAX)); }
  catch (e) { return 0; }
}
function ksUseFreeze(){
  ksMaybeRenewFreezes();
  var n = ksFreezesLeft();
  if (n <= 0) return false;
  try {
    localStorage.setItem('ks_freezes_left', String(n - 1));
    /* Log d'historique pour affichage */
    var log = [];
    try { log = JSON.parse(localStorage.getItem('ks_freezes_used_log') || '[]'); } catch(_e){}
    log.push({ date: new Date().toISOString().slice(0,10), streak: parseInt(localStorage.getItem('ks_streak')||'0') });
    if (log.length > 20) log = log.slice(-20);
    localStorage.setItem('ks_freezes_used_log', JSON.stringify(log));
    return true;
  } catch (e) { return false; }
}
/* Init au chargement de chaque page */
ksMaybeRenewFreezes();

/* ── Completion tracking ───────────────────────────────────────────── */
function ksMarkDone(key) {
  try {
    var wasAlreadyDone = localStorage.getItem(key) === 'done';
    localStorage.setItem(key, 'done');
    /* Première complétion : on garde la date d'origine.
       Re-complétion : on met à jour la date de "dernière révision". */
    var now = Date.now();
    if (!wasAlreadyDone) {
      localStorage.setItem('ks_first_at_' + key, String(now));
    }
    localStorage.setItem('ks_done_at_' + key, String(now));
  } catch(e) {}
}
function ksIsDone(key) {
  try { return localStorage.getItem(key) === 'done'; } catch(e) { return false; }
}
/* Récupère le timestamp de dernière complétion / révision d'une activité.
   Retourne 0 si jamais terminée ou si le tracking n'existait pas. */
function ksDoneAt(key) {
  try {
    var v = localStorage.getItem('ks_done_at_' + key);
    return v ? parseInt(v) || 0 : 0;
  } catch(e) { return 0; }
}

/* ── Korean TTS — meilleure voix disponible (fallback) ─────────────
   Priorités séparées par genre pour matcher le choix utilisateur :
   si elle a choisi InJoon/Hyunsu (homme), le fallback essaie aussi
   de jouer une voix masculine du navigateur. */
var _ksFemaleVoice = null;
var _ksMaleVoice = null;
var _ksVoiceReady = false;

function _ksLoadVoice() {
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  var koVoices = voices.filter(function(v){ return v.lang.toLowerCase().indexOf('ko') === 0; });
  if (!koVoices.length) return;

  /* Voix coréennes connues triées par genre (basé sur les noms exposés
     par chaque OS/navigateur). */
  var femalePriority = ['yuna', 'sora', 'sun-hi', 'heami', 'sun', 'seoyeon', 'google 한국의', 'google korean'];
  var malePriority   = ['injoon', 'jinho', 'in-joon', 'donghyun', 'jihun', 'minjun', 'hyunsu'];

  function pick(prio) {
    for (var i = 0; i < prio.length; i++) {
      var found = koVoices.find(function(v){ return v.name.toLowerCase().indexOf(prio[i]) >= 0; });
      if (found) return found;
    }
    return null;
  }

  _ksFemaleVoice = pick(femalePriority) || koVoices[0];
  _ksMaleVoice   = pick(malePriority);
  /* Si aucune voix masculine trouvée sur cet OS, on garde la féminine
     (le navigateur ne propose souvent qu'une seule voix coréenne). */
  if (!_ksMaleVoice) _ksMaleVoice = _ksFemaleVoice;
  _ksVoiceReady = true;
}

/* Renvoie la voix navigateur qui matche le mieux la préférence
   d'avatar de l'utilisateur (homme/femme). */
function _ksVoiceForChoice() {
  var pref = (typeof ksGetVoice === 'function') ? ksGetVoice() : 'sunhi';
  /* sunhi = femme, injoon/hyunsu = homme */
  return (pref === 'sunhi') ? _ksFemaleVoice : _ksMaleVoice;
}

// Les voix peuvent se charger après le script
if (window.speechSynthesis) {
  _ksLoadVoice();
  window.speechSynthesis.onvoiceschanged = _ksLoadVoice;
}

/* ── Audio Korean : MP3 pré-générés (qualité native, Edge TTS) ──────
   3 voix disponibles : sunhi (femme, défaut), injoon (homme),
   hyunsu (homme expressif). Le choix utilisateur est dans
   localStorage.ks_voice. Manifest = mapping { texte : "{hash}.mp3" }.
   Chemin final : audio/{voice}/{hash}.mp3. Fallback speechSynthesis
   si le MP3 manque ou que le réseau coupe. */
var _ksAudioManifest = null;
var _ksAudioManifestLoading = null;
var _ksCurrentAudio = null;
var KS_VOICES = ['injoon'];
/* Voix unique : InJoon (homme, ko-KR-InJoonNeural). Choix retiré
   le 2026-05-31 sur demande de l'éditrice. Le site sert
   uniquement les MP3 d'audio/injoon/, fallback speechSynthesis
   masculin si manquant. */

function ksGetVoice() {
  return 'injoon';
}
function ksSetVoice(v) {
  /* No-op : la voix est verrouillée sur injoon. On force aussi le
     storage pour rétro-compat des consommateurs qui lisent ks_voice
     directement (ex : profil export RGPD). */
  try { localStorage.setItem('ks_voice', 'injoon'); } catch (e) {}
}
window.ksGetVoice = ksGetVoice;
window.ksSetVoice = ksSetVoice;
/* Migration silencieuse : si un utilisateur avait sunhi/hyunsu sauvegardés,
   on bascule à injoon au prochain load sans le notifier. */
try {
  var _vMigr = localStorage.getItem('ks_voice');
  if (_vMigr !== 'injoon') localStorage.setItem('ks_voice', 'injoon');
} catch (e) {}

/* ── Vitesse de lecture (mode lent) ──────────────────────────────
   ks_rate = '0.75' (lent) ou absent/'1' (normal). Appliqué à tous les
   MP3 via playbackRate (pitch préservé par le navigateur) et au
   fallback speechSynthesis via u.rate. Persisté entre pages. */
function ksGetRate() {
  try { return parseFloat(localStorage.getItem('ks_rate') || '1') || 1; } catch (e) { return 1; }
}
function ksSetRate(r) {
  try { localStorage.setItem('ks_rate', String(r)); } catch (e) {}
  document.querySelectorAll('.ks-rate-toggle').forEach(function(b){
    b.classList.toggle('on', r !== 1);
  });
}
window.ksGetRate = ksGetRate;
window.ksSetRate = ksSetRate;
function _ksApplyRate(audio) {
  var r = ksGetRate();
  if (r !== 1) {
    try {
      audio.playbackRate = r;
      /* Préserve le pitch (évite la voix grave) — défaut true sur
         Chrome/Firefox modernes, on force pour Safari */
      audio.preservesPitch = true;
      audio.webkitPreservesPitch = true;
    } catch (e) {}
  }
}

function _ksLoadManifest() {
  if (_ksAudioManifest) return Promise.resolve(_ksAudioManifest);
  if (_ksAudioManifestLoading) return _ksAudioManifestLoading;
  _ksAudioManifestLoading = fetch('audio/manifest.json', {cache:'default'})
    .then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(m){ _ksAudioManifest = m || {}; return _ksAudioManifest; })
    .catch(function(){ _ksAudioManifest = {}; return _ksAudioManifest; });
  return _ksAudioManifestLoading;
}
/* Précharge le manifest dès le chargement de la page (non bloquant) */
if (typeof window !== 'undefined') { try { _ksLoadManifest(); } catch(e){} }

function _ksFallbackTTS(text, btn, opts) {
  opts = opts || {};
  var onEnded = typeof opts.onended === 'function' ? opts.onended : null;
  var onError = typeof opts.onerror === 'function' ? opts.onerror : null;
  /* Voix du navigateur — pour les mots qui n'ont pas de MP3
     (onomatopées, ou textes ajoutés après la dernière génération).
     On essaie de matcher le genre choisi par l'utilisateur. */
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang  = 'ko-KR';
    u.rate  = 0.78 * ksGetRate();
    u.pitch = 1.0;
    var v = _ksVoiceForChoice();
    if (v) u.voice = v;
    /* Si on a choisi une voix masculine mais qu'on n'en a aucune,
       on baisse un peu le pitch pour faire "plus masculin". */
    var pref = (typeof ksGetVoice === 'function') ? ksGetVoice() : 'injoon';
    if (pref !== 'sunhi' && v && _ksFemaleVoice && v === _ksFemaleVoice) {
      u.pitch = 0.7;  // approximation grossière
      u.rate  = 0.85;
    }
    u.onend  = function() { if (btn) btn.classList.remove('playing'); if (onEnded) onEnded(); };
    u.onerror = function() { if (btn) btn.classList.remove('playing'); if (onError) onError(); };
    window.speechSynthesis.speak(u);
  } catch(e) { if (btn) btn.classList.remove('playing'); if (onError) onError(); }
}

/**
 * speak(text, btn) — joue le MP3 natif s'il existe, sinon utilise
 * la synthèse vocale du navigateur en fallback.
 */
/* ── Casting des voix Typecast (voix naturelles par personnage) ──────
   Chaque personnage a son dossier audio/{clé}/. Genre = pour le repli
   neuronal (jamais de voix robotique : si le MP3 Typecast manque, on
   retombe sur les voix neuronales edge-tts sunhi/injoon, pas sur la
   synthèse du navigateur). Source : character_voices.json. */
var KS_TC_VOICES = {
  narrateur:'F', mina:'F', emma:'F', jiwoo:'F', sujin:'F', maman:'F',
  halmeoni:'F', joon:'M', barista:'M', agent:'M', directeur:'M',
  recruteur:'M', harabeoji:'M'
};
/* Nom affiché dans .speaker-name (normalisé : minuscules, sans
   parenthèses) → clé de personnage. Inconnu → narrateur (défaut). */
var KS_SPEAKER_MAP = {
  'emma':'emma','mina':'mina','ji-woo':'jiwoo','jiwoo':'jiwoo','joon':'joon',
  'halmeoni':'halmeoni','grand-mère':'halmeoni','grand-mere':'halmeoni',
  'agent immobilier':'agent','agent':'agent','directeur':'directeur',
  'recruteur':'recruteur','maman':'maman','mère':'maman','mere':'maman',
  'harabeoji':'harabeoji','sujin':'sujin','barista':'barista',
  'min-ji':'sujin','minji':'sujin','민지':'sujin','infirmière':'sujin',
  'infirmiere':'sujin','sarah':'sujin','médecin':'agent','medecin':'agent',
  'tom':'agent','jihan':'agent','daru':'narrateur','guide':'narrateur',
  'réceptionniste':'narrateur','receptionniste':'narrateur','voix':'narrateur'
};

/* Attribut data-speaker sur la bulle (signal le plus fiable, histoires
   récentes : <div class="bubble-row" data-speaker="mom">) → clé de voix. */
var KS_DATASPEAKER_MAP = {
  mom:'maman', bujang:'directeur', interviewer:'recruteur',
  emma:'emma', mina:'mina', joon:'joon', jiwoo:'jiwoo', sujin:'sujin',
  barista:'barista', halmeoni:'halmeoni', harabeoji:'harabeoji', agent:'agent'
};

/* Voix neuronale de repli (edge-tts) selon le genre de la voix perso. */
function _ksNeuralFor(vkey) { return (KS_TC_VOICES[vkey] === 'M') ? 'injoon' : 'sunhi'; }

/* Détecte le personnage qui parle via .speaker-name dans la bulle.
   Renvoie la clé de voix Typecast (ex. 'emma') ou null (→ narrateur). */
function _ksDetectCharVoice(btn) {
  if (!btn) return null;
  try {
    /* 0) data-speaker sur la bulle (le plus fiable) */
    var dsEl = btn.closest('[data-speaker]');
    if (dsEl) {
      var ds = (dsEl.getAttribute('data-speaker') || '').toLowerCase().trim();
      var dc = KS_DATASPEAKER_MAP[ds] || (KS_TC_VOICES[ds] ? ds : null);
      if (dc) return dc;
    }
    var bubble = btn.closest('.bubble');
    /* 1) .speaker-name (histoires récentes, ex. « Joon (반말) ») */
    if (bubble) {
      var nameEl = bubble.querySelector('.speaker-name');
      if (nameEl) {
        var raw = (nameEl.textContent || '').toLowerCase().split('(')[0].trim().replace(/:$/, '').trim();
        if (KS_SPEAKER_MAP[raw]) return KS_SPEAKER_MAP[raw];
      }
    }
    /* 2) avatar .ava-<clé> dans la ligne (histoires plus anciennes : les
       bulles n'ont pas de .speaker-name mais un avatar ava-joon/ava-mina).
       Sans ça, tout tombait sur le narrateur (voix féminine) → Joon
       sonnait « fille ». */
    var line = btn.closest('.line') || bubble;
    if (line) {
      var ava = line.querySelector('[class*="ava-"]');
      if (ava) {
        var key = null;
        (ava.className || '').split(/\s+/).forEach(function (c) {
          if (c.indexOf('ava-') === 0 && c !== 'ava-init') key = c.slice(4);
        });
        if (key && KS_TC_VOICES[key]) return key;
        if (key && KS_SPEAKER_MAP[key]) return KS_SPEAKER_MAP[key];
      }
    }
    return null;
  } catch (e) { return null; }
}

function speak(text, btn, opts) {
  if (!text) return;
  opts = opts || {};
  /* Voix par défaut = narrateur (Seohyeon). Si le bouton est dans la
     bulle d'un personnage, on prend SA voix. Le repli neuronal évite
     toute voix robotique tant que le MP3 Typecast n'est pas généré. */
  var primary = _ksDetectCharVoice(btn) || 'narrateur';
  _ksPlay(text, btn, [primary, _ksNeuralFor(primary)], opts);
}
window.speak = speak;  // accessible depuis les onclick inline

/* speakAs(text, voiceOverride, btn, opts)
   Permet de forcer une voix spécifique pour un appel ponctuel,
   sans changer la préférence globale ks_voice. Cas d'usage :
   histoires où Mina (personnage féminin) parle → on force 'sunhi'
   pour ce bouton-là, tout en gardant InJoon pour les autres.

   Voix possibles : 'injoon', 'sunhi', 'hyunsu'
   (toutes ont leur dossier audio/{voice}/*.mp3 sur le site) */
function speakAs(text, voiceOverride, btn, opts) {
  opts = opts || {};
  if (!text) return;
  if (!voiceOverride) return speak(text, btn, opts);
  /* Voix Typecast (personnage) → repli neuronal du même genre.
     Voix edge classique (sunhi/injoon/hyunsu) → telle quelle. */
  var chain = KS_TC_VOICES[voiceOverride]
    ? [voiceOverride, _ksNeuralFor(voiceOverride)]
    : [voiceOverride];
  _ksPlay(text, btn, chain, opts);
}
window.speakAs = speakAs;

/* ── Lecteur audio à repli en cascade ───────────────────────────────
   Essaie chaque dossier de voix de `chain` jusqu'à ce qu'un MP3 joue
   (ex. ['emma','sunhi'] : voix Typecast du perso, sinon voix neuronale).
   Si AUCUN ne joue (chaîne hors manifest), on ne joue RIEN de robotique
   — exigence : jamais de synthèse vocale du navigateur. */
function _ksPlay(text, btn, chain, opts) {
  opts = opts || {};
  var onEnded = typeof opts.onended === 'function' ? opts.onended : null;
  var onError = typeof opts.onerror === 'function' ? opts.onerror : null;
  if (_ksCurrentAudio) { try { _ksCurrentAudio.pause(); } catch(e){} _ksCurrentAudio = null; }
  try { window.speechSynthesis.cancel(); } catch(e){}
  /* Nettoie l'état "playing" sur TOUS les types de boutons audio :
     pause() ne déclenche pas l'événement 'ended', donc sans ce balayage
     un bouton interrompu garderait son animation indéfiniment. */
  document.querySelectorAll('.speak-btn.playing, .bubble-audio.playing, .card-audio.playing, .recap-item.playing, .vplay.playing, .cr-play.playing').forEach(function(b){ b.classList.remove('playing'); });
  if (btn) btn.classList.add('playing');

  var cleaned = text.trim();
  if ((cleaned.charAt(0)==='"' && cleaned.charAt(cleaned.length-1)==='"') ||
      (cleaned.charAt(0)==="'" && cleaned.charAt(cleaned.length-1)==="'")) {
    cleaned = cleaned.substring(1, cleaned.length-1).trim();
  }

  _ksLoadManifest().then(function(manifest){
    var hash = manifest[cleaned];
    if (!hash) {            /* chaîne inconnue → pas de robotique, on s'arrête */
      if (btn) btn.classList.remove('playing');
      if (onError) onError();
      return;
    }
    var i = 0;
    (function tryNext(){
      if (i >= chain.length) {   /* tous les dossiers ont échoué */
        if (btn) btn.classList.remove('playing');
        if (onError) onError();
        return;
      }
      var src = 'audio/' + chain[i] + '/' + hash;
      i++;
      var audio = new Audio(src);
      _ksApplyRate(audio);
      _ksCurrentAudio = audio;
      var done = false;
      audio.onended = function(){ if (done) return; done = true;
        if (btn) btn.classList.remove('playing');
        if (_ksCurrentAudio===audio) _ksCurrentAudio=null;
        if (onEnded) onEnded(); };
      audio.onerror = function(){ if (done) return; done = true;
        if (_ksCurrentAudio===audio) _ksCurrentAudio=null; tryNext(); };
      audio.play().catch(function(){ if (done) return; done = true;
        if (_ksCurrentAudio===audio) _ksCurrentAudio=null; tryNext(); });
    })();
  });
}

/* Fallback TTS qui prend en compte la voix override (femme/homme) */
function _ksFallbackForVoice(text, voiceOverride, btn, opts) {
  opts = opts || {};
  var onEnded = typeof opts.onended === 'function' ? opts.onended : null;
  var onError = typeof opts.onerror === 'function' ? opts.onerror : null;
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang  = 'ko-KR';
    u.rate  = 0.78 * ksGetRate();
    /* sunhi = femme → utiliser voix féminine si dispo, pitch 1.0
       injoon/hyunsu = homme → voix masculine, pitch 0.85 */
    if (voiceOverride === 'sunhi') {
      if (_ksFemaleVoice) u.voice = _ksFemaleVoice;
      u.pitch = 1.0;
    } else {
      if (_ksMaleVoice) u.voice = _ksMaleVoice;
      u.pitch = (_ksMaleVoice === _ksFemaleVoice) ? 0.7 : 0.95;
    }
    u.onend  = function() { if (btn) btn.classList.remove('playing'); if (onEnded) onEnded(); };
    u.onerror = function() { if (btn) btn.classList.remove('playing'); if (onError) onError(); };
    window.speechSynthesis.speak(u);
  } catch(e) { if (btn) btn.classList.remove('playing'); if (onError) onError(); }
}

/* ksListenAll(container, opts)
   Mode "écouter l'histoire" : enchaîne automatiquement tous les
   éléments avec .ko (texte coréen) dans un conteneur. Détecte le
   speaker via data-speaker (mina/sunhi → voix féminine, autre →
   InJoon par défaut). Pause naturelle entre bulles selon la
   ponctuation finale (?, ! → 800ms · . → 600ms · sinon 400ms).

   opts = { onProgress: (idx, total) => {}, onEnd: () => {} }
   Retourne un objet { stop } pour interrompre. */
function ksListenAll(container, opts) {
  opts = opts || {};
  if (!container) return { stop: function(){} };
  /* Sélection des éléments à lire : on cible les .bubble.ko ou .ko
     directement à l'intérieur de bulles avec data-speaker. */
  var nodes = container.querySelectorAll('[data-speaker] .ko, .bubble .ko, .listen-line');
  if (!nodes.length) {
    /* Fallback : on prend tous les .ko visibles dans le conteneur */
    nodes = container.querySelectorAll('.ko');
  }
  var items = [];
  nodes.forEach(function(el){
    var text = (el.textContent || '').trim();
    if (!text) return;
    /* Détection speaker : data-speaker sur el ou parent le plus proche */
    var speakerEl = el.closest('[data-speaker]');
    var speaker = speakerEl ? (speakerEl.getAttribute('data-speaker') || '').toLowerCase() : '';
    /* Mapping speaker → voice : mina/mère/sœur/femme → sunhi · sinon injoon */
    var voice = (speaker === 'mina' || speaker === 'sunhi' || speaker === 'female' || speaker === 'f') ? 'sunhi' : 'injoon';
    items.push({ text: text, voice: voice, el: el });
  });

  var stopped = false;
  var i = 0;
  function next(){
    if (stopped) return;
    if (i >= items.length) { if (opts.onEnd) opts.onEnd(); return; }
    var item = items[i];
    if (opts.onProgress) opts.onProgress(i, items.length, item.el);
    /* Highlight visuel temporaire de l'élément en cours */
    item.el.classList.add('listening');
    speakAs(item.text, item.voice, null, {
      onended: function(){
        item.el.classList.remove('listening');
        /* Pause naturelle selon ponctuation finale */
        var last = item.text.charAt(item.text.length - 1);
        var pause = (last === '?' || last === '!') ? 800
                   : (last === '.' || last === '。') ? 600
                   : 400;
        i++;
        setTimeout(next, pause);
      },
      onerror: function(){
        item.el.classList.remove('listening');
        i++;
        setTimeout(next, 300);
      }
    });
  }
  next();
  return {
    stop: function(){
      stopped = true;
      try { window.speechSynthesis.cancel(); } catch(e){}
      if (_ksCurrentAudio) { try { _ksCurrentAudio.pause(); } catch(e){} _ksCurrentAudio = null; }
      document.querySelectorAll('.listening').forEach(function(el){ el.classList.remove('listening'); });
    }
  };
}
window.ksListenAll = ksListenAll;

/* ── Page navigate-out helper (fade) ──────────────────────────────── */
function ksNavigate(href) {
  if (ksNavigate._going) return;
  ksNavigate._going = true;
  try {
    document.body.style.transition = 'opacity .22s ease';
    document.body.style.opacity = '0';
  } catch (e) {}
  setTimeout(() => { window.location.href = href; }, 200);
}
window.ksNavigate = ksNavigate;

/* ── Bfcache : empêche la page de rester invisible quand on revient ── */
/* Quand le navigateur restaure la page depuis son cache (bouton retour),
   l'opacité avait été mise à 0 pour le fondu — il faut la remettre. */
window.addEventListener('pageshow', function (e) {
  if (e.persisted || (document.body && document.body.style.opacity === '0')) {
    try {
      document.body.style.transition = '';
      document.body.style.opacity = '';
    } catch (err) {}
    ksNavigate._going = false;
  }
});

/* ── Lesson quit-confirmation + smooth page transitions ───────────── */
(function () {
  'use strict';

  var isLesson = /(^|\/)(lecon|exercice|quiz)[0-9a-z_]*\.html(\?|#|$)/i.test(location.pathname + location.search)
              || /(^|\/)(lecon|exercice|quiz)[0-9a-z_]*\.html$/i.test(location.pathname);
  var loadedAt = Date.now();

  /* ---- shared CSS for the confirm modal ---- */
  function injectCSS() {
    if (document.getElementById('ks-quit-css')) return;
    var css = [
      '#ks-quit{position:fixed;inset:0;z-index:99000;display:none;',
        'align-items:center;justify-content:center;padding:24px;',
        'background:rgba(8,14,24,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
        'animation:ksqIn .2s ease both}',
      '#ks-quit.on{display:flex}',
      '@keyframes ksqIn{from{opacity:0}to{opacity:1}}',
      '.ks-qm{width:100%;max-width:340px;background:#152030;',
        'border:1.5px solid rgba(255,255,255,.1);border-radius:20px;',
        'padding:28px 24px;text-align:center;',
        'box-shadow:0 24px 64px rgba(0,0,0,.55);',
        'animation:ksqUp .3s cubic-bezier(.34,1.4,.64,1) both}',
      '@keyframes ksqUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
      '.ks-qm-ic{width:52px;height:52px;border-radius:50%;margin:0 auto 14px;',
        'background:rgba(248,113,113,.13);display:flex;align-items:center;justify-content:center}',
      '.ks-qm-ic svg{width:26px;height:26px;stroke:#f87171;fill:none;stroke-width:2;',
        'stroke-linecap:round;stroke-linejoin:round}',
      '.ks-qm-t{font-family:"Playfair Display",serif;font-size:19px;font-weight:700;',
        'color:#fff;margin-bottom:6px}',
      '.ks-qm-x{font-size:13px;line-height:1.6;color:rgba(247,248,250,.5);margin-bottom:20px}',
      '.ks-qm-btns{display:flex;flex-direction:column;gap:9px}',
      '.ks-qm-b{width:100%;padding:13px;border-radius:12px;cursor:pointer;',
        'font-family:"Inter",sans-serif;font-size:14px;font-weight:700;transition:all .18s;border:none}',
      '.ks-qm-stay{background:#C9A96E;color:#0a1220}',
      '.ks-qm-stay:hover{background:#D5BA8A}',
      '.ks-qm-leave{background:transparent;border:1.5px solid rgba(255,255,255,.14);',
        'color:rgba(247,248,250,.62)}',
      '.ks-qm-leave:hover{border-color:rgba(248,113,113,.5);color:#f87171}',
      ''
    ].join('');
    var s = document.createElement('style');
    s.id = 'ks-quit-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---- build modal, return element ---- */
  function getModal() {
    var m = document.getElementById('ks-quit');
    if (m) return m;
    injectCSS();
    m = document.createElement('div');
    m.id = 'ks-quit';
    m.innerHTML =
      '<div class="ks-qm" role="dialog" aria-modal="true" aria-label="Quitter la leçon">' +
        '<div class="ks-qm-ic"><svg viewBox="0 0 24 24">' +
          '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
          '<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
        '<div class="ks-qm-t">Quitter la leçon&thinsp;?</div>' +
        '<div class="ks-qm-x">Ta progression dans cette leçon ne sera pas sauvegardée. Tu devras la recommencer.</div>' +
        '<div class="ks-qm-btns">' +
          '<button class="ks-qm-b ks-qm-stay" type="button">Rester sur la leçon</button>' +
          '<button class="ks-qm-b ks-qm-leave" type="button">Quitter quand même</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    return m;
  }

  var pendingAction = null;

  function closeModal() {
    var m = document.getElementById('ks-quit');
    if (m) m.classList.remove('on');
    document.body.style.overflow = '';
    pendingAction = null;
  }

  function openModal(action) {
    pendingAction = action;
    var m = getModal();
    m.classList.add('on');
    document.body.style.overflow = 'hidden';
    m.querySelector('.ks-qm-stay').onclick = closeModal;
    m.querySelector('.ks-qm-leave').onclick = function () {
      var a = pendingAction;
      closeModal();
      if (a) a();
    };
    m.onclick = function (e) { if (e.target === m) closeModal(); };
  }

  /* ---- is the lesson already finished? (results overlay visible) ---- */
  function lessonFinished() {
    if (document.querySelector('#ks-res.show')) return true;
    if (document.querySelector('.results.show, .results.on')) return true;
    var r = document.getElementById('results');
    if (r && (r.style.display === 'block' || r.style.display === 'flex')) return true;
    return false;
  }

  /* ---- intercept quit buttons (capture phase, lesson pages only) ---- */
  if (isLesson) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.quit,.bar-back,.back-btn,[data-quit]');
      if (!btn) return;
      /* grace period: ignore mis-clicks in the first 4s */
      if (Date.now() - loadedAt < 4000) return;
      /* lesson done → no progress to lose, let it through */
      if (lessonFinished()) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      var href = btn.getAttribute('href');
      openModal(function () {
        if (href && href !== '#') ksNavigate(href);
        else history.back();
      });
    }, true);

    /* Escape key closes (= stay) */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('ks-quit') &&
          document.getElementById('ks-quit').classList.contains('on')) {
        closeModal();
      }
    });
  }

  /* ---- smooth fade-out for ordinary internal navigation ---- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#') return;
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
    /* only same-document .html navigations */
    if (!/\.html(\?|#|$)/i.test(href)) return;
    /* don't intercept quit buttons here — handled above */
    if (a.matches && a.matches('.quit,.bar-back,.back-btn')) return;

    e.preventDefault();
    ksNavigate(href);
  }, false);
})();

/* ─────────────────────────────────────────────────────────────────────
   Écran de fin universel — ksFinish(opts)
   Appelé à la fin d'une leçon / exercice / quiz / histoire / anecdote.
   Affiche un overlay plein écran avec :
     • 3 étoiles (filled si score>=80%, mid-fill si score>=50%, sinon 1)
     • Titre + phrase d'encouragement coréen/français
     • XP gagnés
     • Bouton "Continuer →" qui amène à l'activité suivante du parcours
       (via KSCurriculum.next() — auto-chargé si besoin)
     • Lien "Retour au parcours" pour revenir à cours.html

   Usage minimal :  ksFinish({ key:'ks_c02', xp:15 })
   Avec score :     ksFinish({ key:'ks_c02', xp:15, score:9, total:10 })
   ───────────────────────────────────────────────────────────────────── */

/* Charge ks-curriculum.js de manière paresseuse si pas déjà là. */
function _ksEnsureCurriculum() {
  if (typeof window.KSCurriculum !== 'undefined') return Promise.resolve();
  if (window._ksCurriculumLoading) return window._ksCurriculumLoading;
  window._ksCurriculumLoading = new Promise(function (resolve) {
    var s = document.createElement('script');
    s.src = 'ks-curriculum.js';
    s.onload = function () { resolve(); };
    s.onerror = function () { resolve(); }; // on tolère l'absence
    document.head.appendChild(s);
  });
  return window._ksCurriculumLoading;
}

/* Phrases d'encouragement variées (mix coréen + français). */
var _KS_ENCOURAGE = [
  { kr: '잘했어요 !',  fr: 'Bien joué !' },
  { kr: '완벽해요 !',  fr: 'Parfait !' },
  { kr: '훌륭해요 !',  fr: 'Excellent !' },
  { kr: '대단해요 !',  fr: 'Tu es au top.' },
  { kr: '멋있어요 !',  fr: 'Magnifique session.' },
  { kr: '화이팅 !',    fr: 'Continue, tu progresses bien.' },
  { kr: '최고예요 !',  fr: 'Tu déchires.' },
  { kr: '계속 가요 !', fr: 'Encore une et tu seras imbattable.' }
];

function _ksInjectFinishCSS() {
  if (document.getElementById('ks-finish-css')) return;
  var s = document.createElement('style');
  s.id = 'ks-finish-css';
  s.textContent = [
    '#ks-finish{position:fixed;inset:0;z-index:99500;display:none;',
      'flex-direction:column;align-items:center;justify-content:center;',
      'padding:24px 20px;',
      'background:linear-gradient(160deg,#0a1628 0%,#0F1B2D 50%,#1a2f4a 100%);',
      'overflow-y:auto;animation:ksfIn .35s ease both}',
    '#ks-finish.on{display:flex}',
    '@keyframes ksfIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '.ksf-inner{width:100%;max-width:380px;text-align:center}',
    '.ksf-stars{display:flex;gap:6px;justify-content:center;margin-bottom:18px}',
    '.ksf-star{width:32px;height:32px;opacity:.22;transform:scale(.7);',
      'transition:all .45s cubic-bezier(.34,1.56,.64,1);display:inline-flex}',
    '.ksf-star svg{width:32px;height:32px;fill:#C9A96E;stroke:#C9A96E;stroke-width:1}',
    '.ksf-star.lit{opacity:1;transform:scale(1);filter:drop-shadow(0 2px 8px rgba(201,169,110,.55))}',
    '.ksf-kr{font-family:"Playfair Display",Georgia,serif;font-size:34px;',
      'font-weight:700;color:#C9A96E;margin:0 0 4px;line-height:1.1;letter-spacing:-.01em}',
    '.ksf-title{font-family:"Inter",sans-serif;font-size:14px;letter-spacing:.18em;',
      'text-transform:uppercase;color:rgba(247,248,250,.45);margin:0 0 22px;font-weight:600}',
    '.ksf-stats{display:flex;gap:10px;width:100%;margin-bottom:22px}',
    '.ksf-stat{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);',
      'border-radius:14px;padding:14px 8px}',
    '.ksf-stat-n{font-family:"Playfair Display",serif;font-size:24px;color:#C9A96E;line-height:1}',
    '.ksf-stat-l{font-size:10.5px;color:rgba(247,248,250,.5);text-transform:uppercase;',
      'letter-spacing:.08em;font-weight:600;margin-top:4px}',
    '.ksf-msg{font-size:14px;color:rgba(247,248,250,.7);line-height:1.65;',
      'margin-bottom:24px;max-width:320px;margin-left:auto;margin-right:auto}',
    '.ksf-msg em{color:#fff;font-style:normal;font-weight:600}',
    '.ksf-next{width:100%;padding:15px 18px;border:none;border-radius:14px;',
      'background:#C9A96E;color:#0a1220;font-family:"Inter",sans-serif;',
      'font-size:15px;font-weight:800;cursor:pointer;transition:all .2s;',
      'display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;',
      'box-shadow:0 8px 24px rgba(201,169,110,.22)}',
    '.ksf-next:hover{background:#D4B582;transform:translateY(-1px);',
      'box-shadow:0 12px 32px rgba(201,169,110,.32)}',
    '.ksf-next svg{width:16px;height:16px;stroke:currentColor;fill:none;',
      'stroke-width:2.5;stroke-linecap:round}',
    '.ksf-next-sub{font-size:11px;font-weight:600;opacity:.65;display:block;',
      'margin-top:3px;letter-spacing:.04em}',
    '.ksf-row{display:flex;gap:10px;width:100%;margin-top:10px}',
    '.ksf-sec{flex:1;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);',
      'border:1.5px solid rgba(255,255,255,.1);color:rgba(247,248,250,.65);',
      'font-family:"Inter",sans-serif;font-size:13px;font-weight:600;',
      'cursor:pointer;text-decoration:none;text-align:center;transition:all .2s;',
      'display:flex;align-items:center;justify-content:center;gap:6px}',
    '.ksf-sec:hover{border-color:rgba(201,169,110,.4);color:#C9A96E}',
    '.ksf-sec svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
    /* ── Milestone banner ── */
    '.ksf-milestone{width:100%;background:linear-gradient(135deg,rgba(201,169,110,.18),rgba(201,169,110,.06));',
      'border:1.5px solid rgba(201,169,110,.45);border-radius:14px;padding:14px 16px;margin-bottom:18px;',
      'animation:ksfMilestone .6s cubic-bezier(.34,1.56,.64,1) both;text-align:left;position:relative;overflow:hidden}',
    '@keyframes ksfMilestone{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}',
    '.ksf-milestone::before{content:"";position:absolute;top:-30px;right:-30px;width:90px;height:90px;',
      'background:radial-gradient(circle,rgba(201,169,110,.35),transparent 70%);border-radius:50%}',
    '.ksf-milestone-pct{font-family:"Playfair Display",serif;font-size:32px;font-weight:800;color:#C9A96E;line-height:1;display:inline-block;margin-right:10px}',
    '.ksf-milestone-kr{font-family:"Playfair Display",serif;font-size:17px;color:#fff;font-weight:600;line-height:1.2;margin-bottom:4px}',
    '.ksf-milestone-fr{font-size:13px;color:rgba(247,248,250,.7);line-height:1.4;margin-bottom:10px}',
    '.ksf-milestone-cta{display:inline-flex;align-items:center;gap:6px;background:#C9A96E;color:#0a1220;',
      'text-decoration:none;font-size:12px;font-weight:700;padding:7px 12px;border-radius:8px;letter-spacing:.02em}',
    '.ksf-milestone-cta:hover{background:#D4B582}',
    '.ksf-milestone-cta svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round}',
    /* ── Confetti palier ── */
    '.ksf-confetti{position:fixed;inset:0;pointer-events:none;z-index:99600;overflow:hidden}',
    '.ksf-conf-p{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;',
      'animation:ksfConfFall var(--dur,2.8s) cubic-bezier(.32,.55,.62,1) var(--delay,0s) forwards;',
      'opacity:0}',
    '@keyframes ksfConfFall{',
      '0%{opacity:0;transform:translate3d(0,-20px,0) rotate(0deg)}',
      '8%{opacity:1}',
      '90%{opacity:1}',
      '100%{opacity:0;transform:translate3d(var(--dx,0px),100vh,0) rotate(var(--rot,720deg))}',
    '}',
    ''
  ].join('');
  (document.head || document.documentElement).appendChild(s);
}

/* ── Système de paliers ──────────────────────────────────────────────
   Détecte si l'utilisateur vient de franchir un seuil de progression
   (25 / 50 / 75 / 100 %). Renvoie l'objet décrit, ou null sinon.
   Utilise ks_milestone_<pct> en localStorage pour ne déclencher
   chaque seuil qu'une seule fois. */
function _ksCheckMilestone() {
  if (!window.KSCurriculum || typeof window.KSCurriculum.progress !== 'function') return null;
  var p;
  try { p = window.KSCurriculum.progress(); } catch (e) { return null; }
  if (!p || !p.total) return null;
  var pct = Math.round(p.done / p.total * 100);
  var thresholds = [
    { pct: 100, kr: '한국어 마스터!',     fr: 'Tu as fini le parcours.',        sub: 'C\'est le moment de réclamer ton diplôme.' },
    { pct: 75,  kr: '거의 다 왔어요',      fr: 'Trois quarts du parcours !',     sub: 'Tu vois la ligne d\'arrivée.' },
    { pct: 50,  kr: '반 왔어요!',          fr: 'Tu es à mi-chemin du parcours.', sub: 'Le palier B1 est juste devant.' },
    { pct: 25,  kr: '잘 시작했어요!',      fr: 'Quart du parcours franchi.',     sub: 'Le rythme est lancé.' }
  ];
  for (var i = 0; i < thresholds.length; i++) {
    var t = thresholds[i];
    if (pct >= t.pct) {
      var flag = 'ks_milestone_' + t.pct;
      try {
        if (!localStorage.getItem(flag)) {
          localStorage.setItem(flag, String(Date.now()));
          return t;
        }
      } catch (e) {}
      return null; // déjà célébré, on n'en cherche pas un inférieur
    }
  }
  return null;
}

function _ksRenderFinishOverlay(opts, next) {
  _ksInjectFinishCSS();
  var existing = document.getElementById('ks-finish');
  if (existing) existing.remove();

  /* Étoiles : 3 si pas de score, sinon basé sur le %. */
  var stars = 3;
  if (typeof opts.score === 'number' && typeof opts.total === 'number' && opts.total > 0) {
    var pct = opts.score / opts.total;
    stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
  }

  /* Palier franchi ? On le détecte ici pour pouvoir l'injecter
     directement dans l'overlay (au-dessus du message d'encouragement). */
  var milestone = _ksCheckMilestone();

  /* Phrase d'encouragement aléatoire (déterministe sur la clé pour
     éviter un message différent à chaque refresh). */
  var seed = (opts.key || 'x').split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
  var enc = _KS_ENCOURAGE[seed % _KS_ENCOURAGE.length];

  /* Construction du bouton "Continuer" */
  var nextHref = next && next.href ? next.href : 'cours.html';
  var nextLabel = next && next.title ? next.title : 'Mon parcours';
  var nextSubLbl = next && next.lvlName ? next.lvlName : '';

  /* XP & streak depuis localStorage */
  var xp = (typeof ksGetXP === 'function') ? ksGetXP() : 0;
  var streak = (typeof ksGetStreak === 'function') ? ksGetStreak() : 0;
  var gainedXP = opts.xp || 0;

  var starSvg = '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  var arrowSvg = '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';
  var homeSvg = '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var bookSvg = '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>';

  /* Bannière palier : injectée uniquement si _ksCheckMilestone a retourné un seuil non encore célébré. */
  var milestoneHtml = '';
  if (milestone) {
    var mctaLabel = milestone.pct === 100 ? 'Voir mon diplôme' : 'Voir mon certificat';
    milestoneHtml =
      '<div class="ksf-milestone">' +
        '<div style="position:relative;z-index:1">' +
          '<div><span class="ksf-milestone-pct">' + milestone.pct + '%</span>' +
            '<span class="ksf-milestone-kr">' + milestone.kr + '</span></div>' +
          '<div class="ksf-milestone-fr">' + milestone.fr + ' ' + milestone.sub + '</div>' +
          '<a class="ksf-milestone-cta" href="certificat.html">' + mctaLabel + arrowSvg + '</a>' +
        '</div>' +
      '</div>';
  }

  var html =
    '<div class="ksf-inner">' +
      '<div class="ksf-stars">' +
        '<span class="ksf-star' + (stars >= 1 ? ' lit' : '') + '">' + starSvg + '</span>' +
        '<span class="ksf-star' + (stars >= 2 ? ' lit' : '') + '">' + starSvg + '</span>' +
        '<span class="ksf-star' + (stars >= 3 ? ' lit' : '') + '">' + starSvg + '</span>' +
      '</div>' +
      '<h2 class="ksf-kr">' + enc.kr + '</h2>' +
      '<div class="ksf-title">' + (opts.title || (typeof opts.score === 'number' ? 'Score ' + opts.score + ' / ' + opts.total : 'Activité terminée')) + '</div>' +
      '<div class="ksf-stats">' +
        '<div class="ksf-stat"><div class="ksf-stat-n">+' + gainedXP + '</div><div class="ksf-stat-l">XP gagnés</div></div>' +
        '<div class="ksf-stat"><div class="ksf-stat-n">' + xp + '</div><div class="ksf-stat-l">XP total</div></div>' +
        (streak > 0 ? '<div class="ksf-stat"><div class="ksf-stat-n" style="color:#FF8050">' + streak + '</div><div class="ksf-stat-l">Jours</div></div>' : '') +
      '</div>' +
      milestoneHtml +
      '<p class="ksf-msg">' + enc.fr + (opts.mina ? '<br/><em>' + opts.mina + '</em>' : '') + '</p>' +
      '<a class="ksf-next" href="' + nextHref + '">' +
        '<span>Continuer' + (nextLabel && nextLabel !== 'Mon parcours' ? ' — ' + nextLabel : '') + (nextSubLbl ? '<span class="ksf-next-sub">' + nextSubLbl + '</span>' : '') + '</span>' +
        arrowSvg +
      '</a>' +
      '<div class="ksf-row">' +
        '<a class="ksf-sec" href="cours.html">' + bookSvg + 'Mon parcours</a>' +
        '<a class="ksf-sec" href="app.html">' + homeSvg + 'Accueil</a>' +
      '</div>' +
    '</div>';

  var overlay = document.createElement('div');
  overlay.id = 'ks-finish';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  /* Force reflow puis affiche pour déclencher l'animation. */
  // eslint-disable-next-line no-unused-expressions
  overlay.offsetHeight;
  overlay.classList.add('on');

  /* Burst confetti — uniquement si un palier est célébré.
     Plus de particules pour le 100 % (vrai diplôme). */
  if (milestone) {
    var intensity = milestone.pct === 100 ? 90 : 50;
    _ksConfetti(intensity);
  }

  /* Prefetch de la prochaine activité + cours.html (destination la plus
     fréquente du bouton "Mon parcours"). Le navigateur télécharge en
     arrière-plan pendant que l'utilisateur lit le récap, le clic
     "Continuer" devient quasi-instantané. */
  _ksPrefetch([nextHref, 'cours.html', milestone ? 'certificat.html' : null]);
}

/* ── Prefetch low-priority de pages cibles ──
   Idempotent (skip si déjà prefetché ou si url invalide). */
function _ksPrefetch(urls) {
  if (!Array.isArray(urls)) urls = [urls];
  urls.forEach(function (url) {
    if (!url || typeof url !== 'string') return;
    /* Skip URLs externes et ancres */
    if (url.indexOf('://') !== -1 || url[0] === '#') return;
    /* Skip si déjà prefetché */
    if (document.querySelector('link[rel="prefetch"][href="' + url + '"]')) return;
    try {
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    } catch (e) {}
  });
}

/* ── Confetti palier — CSS-driven, no dep ──
   Crée N particules colorées qui tombent depuis le haut avec
   rotation et dérive horizontale aléatoires. Auto-cleanup
   après l'animation. */
function _ksConfetti(count) {
  count = count || 60;
  /* Couleurs depuis la palette niveaux du site */
  var COLORS = ['#C9A96E', '#16A34A', '#2563EB', '#F59E0B', '#7C3AED', '#EC4899'];
  /* Nettoie un éventuel ancien container */
  var prev = document.getElementById('ks-conf');
  if (prev) prev.remove();
  var wrap = document.createElement('div');
  wrap.id = 'ks-conf';
  wrap.className = 'ksf-confetti';
  wrap.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < count; i++) {
    var p = document.createElement('span');
    p.className = 'ksf-conf-p';
    var dur = 2.4 + Math.random() * 1.8;        // 2.4 → 4.2 s
    var delay = Math.random() * 0.4;             // jitter départ
    var startX = Math.random() * 100;            // % horizontal
    var dx = (Math.random() - 0.5) * 280;        // dérive ±140 px
    var rot = (Math.random() - 0.5) * 1440;      // ±2 tours
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];
    var w = 6 + Math.floor(Math.random() * 6);   // 6 → 11 px
    var h = 10 + Math.floor(Math.random() * 8);  // 10 → 17 px
    p.style.cssText =
      'left:' + startX + '%;' +
      'width:' + w + 'px;height:' + h + 'px;' +
      'background:' + color + ';' +
      '--dur:' + dur + 's;' +
      '--delay:' + delay + 's;' +
      '--dx:' + dx + 'px;' +
      '--rot:' + rot + 'deg;';
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  /* Cleanup après la fin de l'animation la plus longue */
  setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 5000);
}

/* ── Récompense de fin de jeu ──────────────────────────────────────
   ksGameReward(key, xp, score, opts)
   - Crédite l'XP UNE seule fois (flag {key}_xp) — les jeux 1-6
     n'attribuaient aucune XP avant.
   - Persiste le meilleur score dans ks_best_{key} et affiche un
     toast « Nouveau record » quand il est battu.
   opts.lowerIsBetter : pour les jeux où moins = mieux (memory).
   opts.label : unité affichée (« pts » par défaut, « coups »…). */
function ksGameReward(key, xp, score, opts) {
  opts = opts || {};
  var gotXP = false;
  try {
    if (xp > 0 && !localStorage.getItem(key + '_xp')) {
      localStorage.setItem(key + '_xp', '1');
      if (typeof ksAddXP === 'function') ksAddXP(xp);
      gotXP = true;
    }
  } catch (e) {}
  var isNew = false, best = null;
  try {
    if (typeof score === 'number' && !isNaN(score)) {
      var raw = localStorage.getItem('ks_best_' + key);
      var prev = raw === null ? null : parseInt(raw);
      var better = prev === null || (opts.lowerIsBetter ? score < prev : score > prev);
      if (better) {
        localStorage.setItem('ks_best_' + key, String(score));
        isNew = prev !== null; /* pas de toast au tout premier essai */
        best = score;
      } else {
        best = prev;
      }
    }
  } catch (e) {}
  /* Toast récap (record battu et/ou XP gagnée) */
  var msgs = [];
  if (isNew) msgs.push('Nouveau record : ' + score + (opts.label ? ' ' + opts.label : ''));
  if (gotXP) msgs.push('+' + xp + ' XP');
  if (msgs.length) {
    try {
      var t = document.createElement('div');
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(8px);z-index:9600;background:var(--navy,#0F1B2D);color:#fff;padding:10px 18px;border-radius:100px;font-size:13px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transition:all .3s;white-space:nowrap;border:1.5px solid rgba(201,169,110,.4)';
      t.textContent = msgs.join(' · ');
      document.body.appendChild(t);
      requestAnimationFrame(function(){ t.style.opacity = '1'; t.style.transform = 'translateX(-50%)'; });
      setTimeout(function(){ t.style.opacity = '0'; setTimeout(function(){ t.remove(); }, 350); }, 2600);
    } catch (e) {}
  }
  return { best: best, isNew: isNew, gotXP: gotXP };
}
window.ksGameReward = ksGameReward;

function ksFinish(opts) {
  opts = opts || {};
  /* Garde anti-double-clic : l'overlay n'apparaît qu'après un chargement
     async du curriculum, pendant lequel #doneBtn reste cliquable. Sans ce
     garde, un spam de clics créditerait l'XP plusieurs fois. */
  if (opts.key) {
    if (!window._ksFinished) window._ksFinished = Object.create(null);
    if (window._ksFinished[opts.key]) return;   // déjà crédité
    window._ksFinished[opts.key] = true;
  }
  var _doneBtn = document.getElementById('doneBtn');
  if (_doneBtn) _doneBtn.disabled = true;
  /* 1. Marque l'activité comme terminée */
  if (opts.key && typeof ksMarkDone === 'function') ksMarkDone(opts.key);
  /* 2. Crédite l'XP (une seule fois grâce au garde ci-dessus) */
  if (opts.xp && typeof ksAddXP === 'function') ksAddXP(opts.xp);
  /* 3. Charge le curriculum si besoin puis affiche l'overlay */
  _ksEnsureCurriculum().then(function () {
    var nextAct = null;
    if (window.KSCurriculum && typeof window.KSCurriculum.next === 'function') {
      /* On passe la page courante : « Suivant » = prochaine activité
         non faite APRÈS celle-ci, pas la première non faite du
         parcours entier (sinon ça renvoie vers les trous passés). */
      try { nextAct = window.KSCurriculum.next(location.pathname); } catch (e) {}
    }
    _ksRenderFinishOverlay(opts, nextAct);
  });
}
window.ksFinish = ksFinish;
window.ksConfetti = _ksConfetti;

/* ── Page entrance animation ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* ── View Transitions API : crossfade entre pages ──
     Chrome 126+ / Edge 126+ utilisent la transition cross-document
     si cette balise est présente. Autres navigateurs : ignorent
     silencieusement. */
  (function(){
    if (document.querySelector('meta[name="view-transition"]')) return;
    var m = document.createElement('meta');
    m.name = 'view-transition';
    m.content = 'same-origin';
    document.head.appendChild(m);
  })();

  /* ── A11y : skip-to-content universel ──
     Injecte un lien « Aller au contenu » en tout début de body, ciblant
     le premier conteneur .main de la page. Invisible jusqu'au focus
     clavier (styles .ks-skip-link définis dans design.css). */
  (function(){
    if (document.querySelector('.ks-skip-link')) return;
    var mainEl = document.querySelector('main, .main, #main');
    if (!mainEl) return;
    /* On donne un id ciblable et tabindex pour pouvoir y focuser */
    if (!mainEl.id) mainEl.id = 'ks-main-content';
    if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
    var link = document.createElement('a');
    link.className = 'ks-skip-link';
    link.href = '#' + mainEl.id;
    link.textContent = 'Aller au contenu';
    document.body.insertBefore(link, document.body.firstChild);
  })();

  /* ── A11y : labels et aria-current sur les navs ──
     - aria-label sur .bar (top) et .bnav (bottom) pour annoncer le rôle
     - aria-current="page" sur le lien qui correspond à la page courante
       (utile pour les lecteurs d'écran ET pour pouvoir styler en CSS
       si besoin via [aria-current="page"]) */
  (function(){
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('nav.bar').forEach(function(n){
      if (!n.hasAttribute('aria-label')) n.setAttribute('aria-label', 'Barre supérieure');
    });
    document.querySelectorAll('nav.bnav').forEach(function(n){
      if (!n.hasAttribute('aria-label')) n.setAttribute('aria-label', 'Navigation principale');
      n.querySelectorAll('a[href]').forEach(function(a){
        var href = (a.getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
        if (!href) return;
        /* Match strict du fichier final (app.html, cours.html, etc.) */
        if (href === here || href.endsWith('/' + here)) {
          a.setAttribute('aria-current', 'page');
        }
      });
    });
    document.querySelectorAll('nav.sidenav').forEach(function(n){
      if (!n.hasAttribute('aria-label')) n.setAttribute('aria-label', 'Menu latéral');
    });
  })();

  /* ── Footer global discret (mentions légales + contact) ──
     Injecté sur toutes les pages contenu (skip auth + mentions elle-même).
     Apparaît juste avant la bnav, ne casse pas la mise en page existante. */
  (function(){
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var SKIP = ['gate.html','login.html','signup.html','onboarding.html','mentions-legales.html','a-propos.html','aide.html','404.html'];
    if (SKIP.indexOf(here) !== -1) return;
    if (document.querySelector('.ks-global-footer')) return;
    /* Style scoped */
    if (!document.getElementById('ks-footer-css')) {
      var s = document.createElement('style');
      s.id = 'ks-footer-css';
      s.textContent =
        '.ks-global-footer{text-align:center;padding:14px 16px 18px;font-size:11px;color:var(--gray);' +
        'background:transparent;line-height:1.6}' +
        '.ks-global-footer a{color:var(--gray);text-decoration:none;transition:color .15s}' +
        '.ks-global-footer a:hover{color:var(--gold)}' +
        '.ks-global-footer .sep{margin:0 6px;opacity:.5}';
      document.head.appendChild(s);
    }
    var footer = document.createElement('footer');
    footer.className = 'ks-global-footer';
    footer.setAttribute('role', 'contentinfo');
    footer.innerHTML =
      '<a href="aide.html">Aide</a>' +
      '<span class="sep">·</span>' +
      '<a href="a-propos.html">À propos</a>' +
      '<span class="sep">·</span>' +
      '<a href="mentions-legales.html">Mentions légales</a>' +
      '<span class="sep">·</span>' +
      '<a href="mailto:contact@koreanstories.fr">Contact</a>' +
      '<span class="sep">·</span>' +
      '<span>© 2026 Korean Stories</span>';
    /* Insertion : juste avant la bnav s'il y en a une, sinon en fin de body */
    var bnav = document.querySelector('nav.bnav');
    if (bnav && bnav.parentNode) {
      bnav.parentNode.insertBefore(footer, bnav);
    } else {
      document.body.appendChild(footer);
    }
  })();

  // Populate XP pills
  const xp = ksGetXP();
  const streak = ksGetStreak();
  /* Animation count-up vers la valeur cible — UX plus vivante que
     le saut brutal de 0 → N au load. */
  document.querySelectorAll('#xpVal, .xp-val, #xpEl, #xpSide').forEach(el => { ksCountUp(el, xp); });
  document.querySelectorAll('#streakVal, .streak-val').forEach(el => {
    ksCountUp(el, streak, { duration: 500 });
    /* Pulse visuel quand le streak atteint 7 jours (badge Semaine
       de feu débloqué) — petit signal de fierté permanent. */
    if (streak >= 7) el.classList.add('streak-hot');
    else             el.classList.remove('streak-hot');
  });

  // Wire up dark toggle buttons
  document.querySelectorAll('.js-dark-toggle, [data-action="dark-toggle"]').forEach(btn => {
    btn.addEventListener('click', ksDarkToggle);
    // Set initial icon state
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.setAttribute('data-dark-icon', isDark ? 'dark' : 'light');
  });

  /* ── Détection des pages "légères" (landing + info statique) ──
     Sur ces pages, on évite de charger les modules qui ciblent
     uniquement les leçons / l'app authentifiée. Gain ~120 KB de
     JS inutilisé sur la home + pages info → boost Perf Lighthouse. */
  var _ksHere = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var KS_LIGHT_PAGES = {
    'index.html':1,'':1,
    'a-propos.html':1, 'mentions-legales.html':1,
    'aide.html':1, '404.html':1
  };
  var _ksIsLight = !!KS_LIGHT_PAGES[_ksHere];

  /* Charge la bannière visuelle de leçon (auto-skip si page exclue) */
  if (!_ksIsLight) (function(){
    if (document.getElementById('ks-lesson-image-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-lesson-image-script';
    s.src = 'ks-lesson-image.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le système de favoris (bouton marque-page sur chaque leçon) */
  if (!_ksIsLight) (function(){
    if (document.getElementById('ks-favorites-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-favorites-script';
    s.src = 'ks-favorites.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge la navigation intelligente (smart back + prev/next + scroll) */
  if (!_ksIsLight) (function(){
    if (document.getElementById('ks-nav-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-nav-script';
    s.src = 'ks-nav.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le mode prononciation (micro à côté de chaque speak button) */
  if (!_ksIsLight) (function(){
    if (document.getElementById('ks-pronounce-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-pronounce-script';
    s.src = 'ks-pronounce.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge la recherche globale (bouton flottant + ⌘K) */
  if (!_ksIsLight) (function(){
    if (document.getElementById('ks-search-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-search-script';
    s.src = 'ks-search.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le prompt PWA d'installation (Chrome/Edge/Samsung) */
  (function(){
    if (document.getElementById('ks-install-prompt-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-install-prompt-script';
    s.src = 'ks-install-prompt.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge la notification de mise à jour PWA (nouveau SW dispo) */
  (function(){
    if (document.getElementById('ks-sw-update-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-sw-update-script';
    s.src = 'ks-sw-update.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le tour d'onboarding (self-disable hors app.html/index.html
     et si ks_onboarded déjà posé) — skip aussi sur pages info pures */
  if (!_ksIsLight || _ksHere === 'index.html' || _ksHere === '') (function(){
    if (document.getElementById('ks-onboarding-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-onboarding-script';
    s.src = 'ks-onboarding.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge les notes personnelles (bouton dans la nav bar) */
  if (!_ksIsLight) (function(){
    if (document.getElementById('ks-notes-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-notes-script';
    s.src = 'ks-notes.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le "Quoi de neuf" — modal pour annoncer les nouveautés */
  (function(){
    if (document.getElementById('ks-whatsnew-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-whatsnew-script';
    s.src = 'ks-whatsnew.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le pop-up traduction au tap (avec son dictionnaire) */
  (function(){
    if (document.getElementById('ks-tap-translate-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-tap-translate-script';
    s.src = 'ks-tap-translate.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* Charge le mode lecture immersive (pour les histoires) */
  (function(){
    if (document.getElementById('ks-immersive-reader-script')) return;
    var s = document.createElement('script');
    s.id = 'ks-immersive-reader-script';
    s.src = 'ks-immersive-reader.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  /* ── Toggle vitesse lente ──────────────────────────────────────
     Uniquement sur les pages de dialogue/lecture (bulles audio ou
     bouton « Écouter l'histoire »). Pill fixe en bas à gauche — le
     coin droit est réservé au FAB recherche. Persiste via ks_rate. */
  (function(){
    if (!document.querySelector('.bubble-audio, #listenBtn')) return;
    if (document.querySelector('.ks-rate-toggle')) return;
    var st = document.createElement('style');
    st.textContent =
      '.ks-rate-toggle{position:fixed;left:14px;bottom:calc(76px + env(safe-area-inset-bottom));' +
      'z-index:80;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:100px;' +
      'background:var(--surf,#fff);border:1.5px solid var(--bd,#DAE3F2);color:var(--t2,#475E78);' +
      'font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.12);transition:all .2s;opacity:.85;-webkit-tap-highlight-color:transparent}' +
      '.ks-rate-toggle:hover{opacity:1}' +
      '.ks-rate-toggle.on{background:var(--gold,#B8924E);border-color:var(--gold,#B8924E);color:#fff;opacity:1}' +
      '.ks-rate-toggle .krt-ico{font-size:13px;line-height:1}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.className = 'ks-rate-toggle';
    b.type = 'button';
    b.innerHTML = '<span class="krt-ico"><svg class="ks-i" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle"><path d="M3 14a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6 1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14Z"/><path d="m17.5 11.5 2-.8"/><path d="M6.5 15.5 5 18"/><path d="M17.5 15.5 19 18"/></svg></span><span>Lent</span>';
    b.setAttribute('aria-pressed', ksGetRate() !== 1 ? 'true' : 'false');
    b.title = 'Lecture ralentie (×0.75) — idéal pour décortiquer la prononciation';
    if (ksGetRate() !== 1) b.classList.add('on');
    b.addEventListener('click', function(){
      var slow = ksGetRate() === 1;
      ksSetRate(slow ? 0.75 : 1);
      b.setAttribute('aria-pressed', slow ? 'true' : 'false');
      /* Applique immédiatement à l'audio en cours de lecture */
      if (_ksCurrentAudio) { try { _ksApplyRate(_ksCurrentAudio); if (!slow) _ksCurrentAudio.playbackRate = 1; } catch(e){} }
    });
    document.body.appendChild(b);
  })();

  /* ═══════════════ ACCESSIBILITÉ — retrofit global ═══════════════
     Appliqué au chargement sur toutes les pages qui incluent ks.js.
     1. Skip-link « Aller au contenu » (styles dans design.css).
     2. Les centaines de <div onclick> / <span onclick> du site
        deviennent utilisables au clavier : role=button + tabindex=0,
        et Entrée/Espace déclenchent le clic (délégation globale,
        couvre aussi les éléments créés dynamiquement).
     3. Les zones de feedback de quiz/exercices passent en aria-live
        pour les lecteurs d'écran. */
  (function(){
    /* 1 ── Skip-link vers le contenu principal */
    try {
      if (!document.querySelector('.ks-skip-link')) {
        var main = document.querySelector('main') || document.querySelector('.main');
        if (main) {
          if (!main.id) main.id = 'ks-main';
          if (main.tagName !== 'MAIN' && !main.getAttribute('role')) main.setAttribute('role', 'main');
          main.setAttribute('tabindex', '-1');
          var skip = document.createElement('a');
          skip.className = 'ks-skip-link';
          skip.href = '#' + main.id;
          skip.textContent = 'Aller au contenu';
          skip.addEventListener('click', function(e){
            e.preventDefault();
            main.focus({ preventScroll: false });
            main.scrollIntoView();
          });
          document.body.insertBefore(skip, document.body.firstChild);
        }
      }
    } catch (e) {}

    /* 2 ── Clavier sur les éléments cliquables non natifs */
    var CLICKABLE = 'div[onclick], span[onclick], li[onclick], td[onclick]';
    function retrofit(root){
      try {
        (root.querySelectorAll ? root.querySelectorAll(CLICKABLE) : []).forEach(function(el){
          if (el.closest('button, a, [role="button"], input, select, textarea') && el.getAttribute('onclick') === null) return;
          if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        });
      } catch (e) {}
    }
    retrofit(document);
    /* Les quiz injectent leurs options après coup → on observe */
    try {
      new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(n){
            if (n.nodeType === 1) {
              if (n.matches && n.matches(CLICKABLE)) retrofit({ querySelectorAll: function(){ return [n]; } });
              retrofit(n);
            }
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    /* Entrée / Espace = clic (délégation, marche aussi sans retrofit) */
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target;
      if (!t || t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return;
      if (t.hasAttribute('onclick') || (t.getAttribute('role') === 'button' && typeof t.onclick === 'function')) {
        e.preventDefault();
        t.click();
      }
    });

    /* 3 ── Feedback dynamique annoncé aux lecteurs d'écran */
    ['#expl', '.exo-feedback', '.qz-feedback', '#exoFeedback', '#qzFeedback', '#factTitle']
      .forEach(function(sel){
        try {
          document.querySelectorAll(sel).forEach(function(el){
            if (!el.hasAttribute('aria-live')) el.setAttribute('aria-live', 'polite');
          });
        } catch (e) {}
      });
  })();
});

/* Charge le module de refonte des histoires sur les pages histoireN.html */
(function () {
  try {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!/^histoire\d+\.html$/.test(f)) return;
    if (document.querySelector('script[src="ks-stories.js"]')) return;
    var s = document.createElement('script');
    s.src = 'ks-stories.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();

/* ─────────────────────────────────────────────────────────────────────
   Complétion des planches BD ouvertes depuis le parcours.
   Le parcours (cours.html / ks-curriculum.js) pointe désormais vers
   histoireN-bd.html. Ces planches n'avaient pas de logique de validation
   d'étape (contrairement aux pages chat avec quiz). Ici : quand le lecteur
   atteint la fin de la planche, on marque l'étape de cours (clé ks_xxx)
   comme « done » et on crédite les XP — une seule fois.
   Map N → [clé de cours, XP], extraite de cours.html (34 histoires du
   parcours ; les planches hors parcours sont simplement ignorées). */
(function () {
  try {
    var m = (location.pathname.split('/').pop() || '').toLowerCase().match(/^histoire(\d+)-bd\.html$/);
    if (!m) return;
    var MAP = {'1':['ks_a03',12],'2':['ks_a15',12],'3':['ks_a27',15],'12':['ks_b09',12],'13':['ks_b12',12],'14':['ks_b17',12],'15':['ks_b31',12],'16':['ks_c13',12],'17':['ks_c16',12],'18':['ks_c21',12],'19':['ks_c23',15],'20':['ks_d06',12],'21':['ks_d09',12],'22':['ks_d22',12],'23':['ks_d23',12],'24':['ks_d24',15],'25':['ks_c30',12],'26':['ks_c31',12],'27':['ks_b37',12],'28':['ks_b38',12],'29':['ks_a41',12],'30':['ks_a42',10],'31':['ks_a43',15],'32':['ks_a35',15],'33':['ks_a37',15],'34':['ks_b43',18],'35':['ks_b44',18],'36':['ks_b45',18],'37':['ks_c36',20],'38':['ks_c37',20],'39':['ks_c38',20],'40':['ks_d35',22],'41':['ks_d36',22],'42':['ks_d37',22]};
    var e = MAP[m[1]];
    if (!e) return;
    var KEY = e[0], XP = e[1];
    if (localStorage.getItem(KEY) === 'done') return;
    var marked = false;
    function markDone() {
      if (marked) return;
      try {
        if (localStorage.getItem(KEY) === 'done') { marked = true; return; }
        localStorage.setItem(KEY, 'done');
        localStorage.setItem('ks_xp', String((parseInt(localStorage.getItem('ks_xp') || '0', 10) || 0) + XP));
        /* objectif quotidien + série, comme à la fin des autres activités */
        var today = new Date().toISOString().slice(0, 10);
        var l = localStorage.getItem('ks_lastplay'), st = parseInt(localStorage.getItem('ks_streak') || '0', 10) || 0;
        if (l !== today) {
          localStorage.setItem('ks_streak', String(l && (new Date(today) - new Date(l)) / 86400000 === 1 ? st + 1 : 1));
          localStorage.setItem('ks_lastplay', today);
        }
        marked = true;
        window.removeEventListener('scroll', check);
      } catch (err) {}
    }
    function check() {
      var sc = document.scrollingElement || document.documentElement;
      var max = sc.scrollHeight - sc.clientHeight;
      var y = window.scrollY || sc.scrollTop || 0;
      if (max <= 40 || y >= max - 90) markDone();
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('load', function () { setTimeout(check, 500); });
    if (document.readyState !== 'loading') setTimeout(check, 500);
    else document.addEventListener('DOMContentLoaded', function () { setTimeout(check, 500); });
  } catch (e) {}
})();
