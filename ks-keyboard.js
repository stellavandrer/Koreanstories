/* ═══════════════════════════════════════════════════════════════════
   ks-keyboard.js — Clavier coréen virtuel + moteur de composition
   Mobile-first : grandes touches tactiles, layout 2-beolsik standard,
   shift pour les doubles (ㄲㄸㅃㅆㅉ · ㅒㅖ), retour-arrière qui
   décompose jamo par jamo comme un vrai IME coréen.

   API :
     KSHangulIME            — moteur pur (testable sans DOM)
       .push(jamo)  .backspace()  .getText()  .reset()  .setText(t)
     KSKeyboard.create(container, opts)
       opts.onInput(text)   — à chaque frappe
       opts.onSubmit(text)  — touche 확인
       retourne { ime, destroy() }
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── Tables Unicode Hangeul ──────────────────────────────────── */
  var CHO  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  var JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  /* Voyelles composées : base + ajout → composée */
  var VOWEL_COMBO = {
    'ㅗㅏ':'ㅘ', 'ㅗㅐ':'ㅙ', 'ㅗㅣ':'ㅚ',
    'ㅜㅓ':'ㅝ', 'ㅜㅔ':'ㅞ', 'ㅜㅣ':'ㅟ',
    'ㅡㅣ':'ㅢ'
  };
  /* Décomposition inverse des voyelles composées */
  var VOWEL_SPLIT = {};
  Object.keys(VOWEL_COMBO).forEach(function(k){ VOWEL_SPLIT[VOWEL_COMBO[k]] = [k[0], k[1]]; });

  /* Batchim composés : base + ajout → composé */
  var JONG_COMBO = {
    'ㄱㅅ':'ㄳ', 'ㄴㅈ':'ㄵ', 'ㄴㅎ':'ㄶ',
    'ㄹㄱ':'ㄺ', 'ㄹㅁ':'ㄻ', 'ㄹㅂ':'ㄼ', 'ㄹㅅ':'ㄽ',
    'ㄹㅌ':'ㄾ', 'ㄹㅍ':'ㄿ', 'ㄹㅎ':'ㅀ', 'ㅂㅅ':'ㅄ'
  };
  var JONG_SPLIT = {};
  Object.keys(JONG_COMBO).forEach(function(k){ JONG_SPLIT[JONG_COMBO[k]] = [k[0], k[1]]; });

  function isVowel(j){ return JUNG.indexOf(j) !== -1; }
  function isConsonant(j){ return CHO.indexOf(j) !== -1 || JONG.indexOf(j) > 0; }

  function compose(cho, jung, jong){
    var ci = CHO.indexOf(cho), ji = JUNG.indexOf(jung), gi = JONG.indexOf(jong || '');
    if (ci < 0 || ji < 0 || gi < 0) return null;
    return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + gi);
  }
  function decompose(syl){
    var code = syl.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return null;
    return {
      cho:  CHO[Math.floor(code / 28 / 21)],
      jung: JUNG[Math.floor(code / 28) % 21],
      jong: JONG[code % 28]
    };
  }

  /* ── Moteur IME ──────────────────────────────────────────────────
     state : { cho, jung, jong } du bloc en cours, ou null.
     text  : texte déjà validé (blocs terminés).                    */
  function KSHangulIME(){
    this.text = '';
    this.state = null; /* {cho, jung, jong} */
  }

  KSHangulIME.prototype._flush = function(){
    if (!this.state) return;
    var s = this.state;
    if (s.cho && s.jung) this.text += compose(s.cho, s.jung, s.jong || '');
    else if (s.cho)      this.text += s.cho;
    else if (s.jung)     this.text += s.jung;
    this.state = null;
  };

  KSHangulIME.prototype.getText = function(){
    var s = this.state;
    var pending = '';
    if (s) {
      if (s.cho && s.jung) pending = compose(s.cho, s.jung, s.jong || '');
      else pending = s.cho || s.jung || '';
    }
    return this.text + pending;
  };

  KSHangulIME.prototype.reset = function(){ this.text = ''; this.state = null; };
  KSHangulIME.prototype.setText = function(t){ this.text = t || ''; this.state = null; };

  KSHangulIME.prototype.push = function(j){
    if (j === ' '){ this._flush(); this.text += ' '; return; }
    var s = this.state;

    if (isVowel(j)){
      if (!s){ this.state = { cho:null, jung:j, jong:null }; return; }
      if (s.jung && s.jong){
        /* Le batchim (ou sa 2e partie) migre vers la nouvelle syllabe */
        var split = JONG_SPLIT[s.jong];
        var moving, staying;
        if (split){ staying = split[0]; moving = split[1]; }
        else { staying = ''; moving = s.jong; }
        var prev = { cho:s.cho, jung:s.jung, jong:staying };
        this.state = prev; this._flush();
        this.state = { cho:moving, jung:j, jong:null };
        return;
      }
      if (s.jung){
        var combo = VOWEL_COMBO[s.jung + j];
        if (combo){ s.jung = combo; return; }
        this._flush();
        this.state = { cho:null, jung:j, jong:null };
        return;
      }
      /* s.cho seul → on lui attache la voyelle */
      s.jung = j; return;
    }

    /* Consonne */
    if (!s){ this.state = { cho:j, jung:null, jong:null }; return; }
    if (!s.jung){
      /* Deux consonnes de suite sans voyelle : la 1re sort telle quelle */
      this._flush();
      this.state = { cho:j, jung:null, jong:null };
      return;
    }
    if (!s.jong){
      /* Peut-elle être batchim ? (toutes sauf ㄸㅃㅉ) */
      if (JONG.indexOf(j) > 0){ s.jong = j; return; }
      this._flush();
      this.state = { cho:j, jung:null, jong:null };
      return;
    }
    /* Batchim existant : tenter le batchim composé */
    var jc = JONG_COMBO[s.jong + j];
    if (jc){ s.jong = jc; return; }
    this._flush();
    this.state = { cho:j, jung:null, jong:null };
  };

  KSHangulIME.prototype.backspace = function(){
    var s = this.state;
    if (s){
      if (s.jong){
        var sp = JONG_SPLIT[s.jong];
        s.jong = sp ? sp[0] : null;
        return;
      }
      if (s.jung){
        var vs = VOWEL_SPLIT[s.jung];
        if (vs){ s.jung = vs[0]; return; }
        if (s.cho){ s.jung = null; return; }
        this.state = null; return;
      }
      this.state = null; return;
    }
    if (!this.text) return;
    var last = this.text.slice(-1);
    this.text = this.text.slice(0, -1);
    if (last === ' ') return;
    var d = decompose(last);
    if (d){
      /* On ré-ouvre la dernière syllabe pour décomposer pas à pas */
      this.state = { cho:d.cho, jung:d.jung, jong:d.jong || null };
      this.backspace();
    }
  };

  /* ── UI Clavier ─────────────────────────────────────────────── */
  var SHIFT_MAP = { 'ㅂ':'ㅃ','ㅈ':'ㅉ','ㄷ':'ㄸ','ㄱ':'ㄲ','ㅅ':'ㅆ','ㅐ':'ㅒ','ㅔ':'ㅖ' };

  var ROWS = [
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
    ['SHIFT','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ','BKSP'],
    ['SPACE','ENTER']
  ];

  function injectCSS(){
    if (document.getElementById('ks-kb-css')) return;
    var st = document.createElement('style');
    st.id = 'ks-kb-css';
    st.textContent = [
      '.ks-kb{user-select:none;-webkit-user-select:none;touch-action:manipulation;',
        'max-width:560px;margin:0 auto;padding:8px 6px calc(8px + env(safe-area-inset-bottom));',
        'background:var(--s2,#F5F8FF);border-top:1.5px solid var(--bd,#DAE3F2);border-radius:18px 18px 0 0}',
      '.ks-kb-row{display:flex;gap:5px;margin-bottom:6px;justify-content:center}',
      '.ks-kb-row:last-child{margin-bottom:0}',
      '.ks-kb-key{flex:1;min-width:0;height:46px;border:none;border-radius:9px;',
        'background:var(--surf,#fff);color:var(--t,#0D1823);',
        'font-family:inherit;font-size:19px;font-weight:600;cursor:pointer;',
        'box-shadow:0 1.5px 0 var(--bd2,#BFCEE6);',
        'display:flex;align-items:center;justify-content:center;',
        '-webkit-tap-highlight-color:transparent;transition:background .06s}',
      '.ks-kb-key:active{background:var(--goldbg,#FBF2E3);transform:translateY(1px);box-shadow:none}',
      '.ks-kb-key.ks-kb-fn{font-size:13px;font-weight:700;color:var(--t2,#475E78);background:var(--s3,#E9EEFA);flex:1.4}',
      '.ks-kb-key.ks-kb-shift.on{background:var(--gold,#B8924E);color:#fff}',
      '.ks-kb-key.ks-kb-space{flex:4}',
      '.ks-kb-key.ks-kb-enter{flex:2;background:var(--gold,#B8924E);color:#fff;font-size:15px;font-weight:800}',
      '.ks-kb-key.ks-kb-enter:active{background:var(--goldl,#CAA96E)}',
      '.ks-kb-key svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
      '@media (max-width:380px){.ks-kb-key{height:44px;font-size:17px}.ks-kb{padding-left:3px;padding-right:3px}.ks-kb-row{gap:4px}}',
      '@media (min-width:600px){.ks-kb-key{height:52px}}',
      '[data-theme=dark] .ks-kb{background:var(--s2,#192840)}',
    ].join('\n');
    document.head.appendChild(st);
  }

  function create(container, opts){
    opts = opts || {};
    injectCSS();
    var ime = new KSHangulIME();
    var shifted = false;
    var root = document.createElement('div');
    root.className = 'ks-kb';
    root.setAttribute('role','group');
    root.setAttribute('aria-label','Clavier coréen');

    var keyEls = {}; /* base char → bouton (pour le shift) */

    function emit(){
      if (typeof opts.onInput === 'function') opts.onInput(ime.getText());
    }

    function press(code){
      if (code === 'SHIFT'){
        shifted = !shifted;
        Object.keys(SHIFT_MAP).forEach(function(base){
          if (keyEls[base]) keyEls[base].textContent = shifted ? SHIFT_MAP[base] : base;
        });
        var sk = root.querySelector('.ks-kb-shift');
        if (sk) sk.classList.toggle('on', shifted);
        return;
      }
      if (code === 'BKSP'){ ime.backspace(); emit(); return; }
      if (code === 'SPACE'){ ime.push(' '); emit(); return; }
      if (code === 'ENTER'){
        if (typeof opts.onSubmit === 'function') opts.onSubmit(ime.getText());
        return;
      }
      var ch = shifted && SHIFT_MAP[code] ? SHIFT_MAP[code] : code;
      if (shifted){ press('SHIFT'); } /* shift non verrouillé, comme iOS */
      ime.push(ch);
      emit();
    }

    ROWS.forEach(function(row){
      var rowEl = document.createElement('div');
      rowEl.className = 'ks-kb-row';
      row.forEach(function(code){
        var b = document.createElement('button');
        b.type = 'button';
        if (code === 'SHIFT'){
          b.className = 'ks-kb-key ks-kb-fn ks-kb-shift';
          b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4l8 8h-5v8H9v-8H4z"/></svg>';
          b.setAttribute('aria-label','Majuscule (doubles consonnes)');
        } else if (code === 'BKSP'){
          b.className = 'ks-kb-key ks-kb-fn';
          b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>';
          b.setAttribute('aria-label','Effacer');
        } else if (code === 'SPACE'){
          b.className = 'ks-kb-key ks-kb-fn ks-kb-space';
          b.textContent = '띄어쓰기';
          b.setAttribute('aria-label','Espace');
        } else if (code === 'ENTER'){
          b.className = 'ks-kb-key ks-kb-enter';
          b.textContent = '확인';
          b.setAttribute('aria-label','Valider');
        } else {
          b.className = 'ks-kb-key';
          b.textContent = code;
          keyEls[code] = b;
        }
        /* pointerdown = réactivité tactile immédiate (pas de délai click) */
        b.addEventListener('pointerdown', function(e){
          e.preventDefault();
          press(code);
        });
        rowEl.appendChild(b);
      });
      root.appendChild(rowEl);
    });

    container.appendChild(root);

    return {
      ime: ime,
      el: root,
      reset: function(){ ime.reset(); emit(); },
      destroy: function(){ root.remove(); }
    };
  }

  global.KSHangulIME = KSHangulIME;
  global.KSKeyboard = { create: create };

})(window);
