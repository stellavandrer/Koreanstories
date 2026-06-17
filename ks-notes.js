/* ═══════════════════════════════════════════════════════════════════
   ks-notes.js — Notes personnelles sur les leçons.
   ──────────────────────────────────────────────────────────────────
   - Bouton "Note" injecté dans la nav bar (à côté du favori)
   - Panel slide-up depuis le bas avec textarea
   - Auto-save 800ms après la dernière frappe
   - Stockage : ks_notes (objet { href: { text, updatedAt } })
     synchronisé Firebase via ks-sync.js
   - Page notes.html liste toutes les notes
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var EXCLUDED = {
    'app.html':1, 'index.html':1, 'profil.html':1, 'reglages.html':1,
    'cours.html':1, 'histoires.html':1, 'challenge.html':1,
    'classement.html':1, 'revision.html':1, 'statistiques.html':1,
    'trophees.html':1, 'aide.html':1, 'ressources.html':1,
    'login.html':1, 'signup.html':1, 'test-niveau.html':1,
    'bienvenue.html':1, 'vocabulaire.html':1, 'hangeul.html':1,
    'histoires.html':1, 'exercice.html':1, 'favoris.html':1, 'notes.html':1
  };

  function currentPath(){
    return location.pathname.split('/').pop() || 'index.html';
  }
  function isLessonPage(){
    var p = currentPath();
    if (EXCLUDED[p]) return false;
    return /^(lecon|exercice|quiz|histoire|anecdote|conseil|chanson|pro)/.test(p);
  }

  /* ── Storage helpers ───────────────────────────────────────── */
  function getAll(){
    try { return JSON.parse(localStorage.getItem('ks_notes') || '{}'); }
    catch(e){ return {}; }
  }
  function setAll(obj){
    try { localStorage.setItem('ks_notes', JSON.stringify(obj)); }
    catch(e){}
  }
  function getNote(href){
    var all = getAll();
    return all[href] || null;
  }
  function setNote(href, text, title){
    var all = getAll();
    if (!text || !text.trim()) {
      delete all[href];
    } else {
      all[href] = {
        text: text,
        title: title || href,
        updatedAt: Date.now()
      };
    }
    setAll(all);
  }
  function hasNote(href){
    var n = getNote(href);
    return n && n.text && n.text.trim().length > 0;
  }

  /* ── Titre courant ────────────────────────────────────────── */
  function detectTitle(){
    var t = (document.title || '').replace(/\s*[–—\-]\s*Korean Stories.*$/i, '').trim();
    if (t) return t;
    var h = document.querySelector('h2, h1');
    if (h) return (h.textContent || '').trim();
    return currentPath();
  }

  /* ── CSS ──────────────────────────────────────────────────── */
  function injectCSS(){
    if (document.getElementById('ks-notes-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-notes-css';
    s.textContent = [
      /* Bouton note (même style que ks-fav-btn pour cohérence) */
      '.ks-note-btn{',
        'background:none;border:none;cursor:pointer;',
        'min-width:40px;min-height:40px;padding:8px;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'color:currentColor;opacity:.55;transition:opacity .2s,transform .2s;',
        'border-radius:10px;-webkit-tap-highlight-color:transparent;position:relative',
      '}',
      '.ks-note-btn:hover{opacity:1;background:rgba(201,169,110,.12)}',
      '.ks-note-btn:active{transform:scale(.9)}',
      '.ks-note-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;',
        'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:fill .2s}',
      '.ks-note-btn.on{opacity:1;color:#C9A96E}',
      '.ks-note-btn.on svg{fill:rgba(201,169,110,.2);stroke:#C9A96E}',
      '.ks-note-btn .ks-note-dot{',
        'position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;',
        'background:#C9A96E;border:1.5px solid var(--surf,#fff);display:none',
      '}',
      '.ks-note-btn.on .ks-note-dot{display:block}',

      /* Overlay du panel */
      '.ks-note-overlay{',
        'position:fixed;inset:0;z-index:9600;background:rgba(8,14,24,.45);',
        'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);',
        'opacity:0;pointer-events:none;transition:opacity .2s;',
        'display:flex;align-items:flex-end;justify-content:center',
      '}',
      '.ks-note-overlay.show{opacity:1;pointer-events:auto}',

      /* Panel (slide up depuis le bas) */
      '.ks-note-panel{',
        'background:var(--surf,#fff);width:100%;max-width:560px;',
        'max-height:80vh;border-radius:20px 20px 0 0;',
        'box-shadow:0 -10px 40px rgba(0,0,0,.25);',
        'display:flex;flex-direction:column;',
        'transform:translateY(100%);transition:transform .3s cubic-bezier(.4,0,.2,1)',
      '}',
      '.ks-note-overlay.show .ks-note-panel{transform:translateY(0)}',
      '@media (min-width:640px){',
        '.ks-note-overlay{align-items:center;padding:24px}',
        '.ks-note-panel{border-radius:18px;max-height:none}',
      '}',

      '.ks-note-header{',
        'display:flex;align-items:center;justify-content:space-between;',
        'padding:14px 18px;border-bottom:1px solid var(--bd,#e5e7eb);',
        'flex-shrink:0',
      '}',
      '.ks-note-title{',
        'font-size:14px;font-weight:700;color:var(--tx,#111);line-height:1.3;',
        'min-width:0;flex:1;padding-right:.5rem;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
      '}',
      '.ks-note-title-sub{',
        'font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;',
        'color:#C9A96E;margin-bottom:2px',
      '}',
      '.ks-note-close{',
        'background:rgba(0,0,0,.06);border:none;padding:6px 10px;border-radius:8px;',
        'font-size:11px;font-weight:700;color:var(--tx-muted,#6b7280);cursor:pointer;',
        'font-family:inherit;-webkit-tap-highlight-color:transparent',
      '}',
      '[data-theme="dark"] .ks-note-close{background:rgba(255,255,255,.08)}',

      '.ks-note-body{padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:.5rem;min-height:0}',
      '.ks-note-textarea{',
        'width:100%;flex:1;min-height:180px;max-height:calc(80vh - 180px);',
        'padding:14px 16px;border-radius:12px;',
        'background:var(--bg,#fff);color:var(--tx,#111);',
        'border:1.5px solid var(--bd,#e5e7eb);',
        'font-family:inherit;font-size:14px;line-height:1.55;',
        'outline:none;resize:none;transition:border-color .15s;',
        '-webkit-appearance:none;box-sizing:border-box',
      '}',
      '.ks-note-textarea:focus{border-color:#C9A96E}',
      '.ks-note-textarea::placeholder{color:var(--tx-muted,#9ca3af)}',

      '.ks-note-footer{',
        'display:flex;align-items:center;justify-content:space-between;',
        'padding:10px 16px 14px;font-size:11.5px;color:var(--tx-muted,#6b7280);',
        'flex-shrink:0',
      '}',
      '.ks-note-status{display:inline-flex;align-items:center;gap:4px;font-weight:600}',
      '.ks-note-status.saved{color:#16A34A}',
      '.ks-note-status svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}',
      '.ks-note-delete{',
        'background:none;border:none;color:#EF4444;font-size:11.5px;cursor:pointer;',
        'font-weight:600;font-family:inherit;padding:4px 6px;border-radius:6px',
      '}',
      '.ks-note-delete:hover{background:rgba(239,68,68,.08)}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Icônes ──────────────────────────────────────────────── */
  var NOTE_SVG  = '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var CHECK_SVG = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ── État ────────────────────────────────────────────────── */
  var SAVE_TIMER = null;

  function openPanel(){
    injectCSS();
    if (document.querySelector('.ks-note-overlay')) return;
    var title = detectTitle();
    var path = currentPath();
    var existing = getNote(path);

    var overlay = document.createElement('div');
    overlay.className = 'ks-note-overlay';
    overlay.innerHTML =
      '<div class="ks-note-panel" role="dialog" aria-modal="true" aria-label="Mes notes">' +
        '<div class="ks-note-header">' +
          '<div style="min-width:0;flex:1">' +
            '<div class="ks-note-title-sub">Ma note</div>' +
            '<div class="ks-note-title">' + escapeHtml(title) + '</div>' +
          '</div>' +
          '<button class="ks-note-close" aria-label="Fermer">Fermer</button>' +
        '</div>' +
        '<div class="ks-note-body">' +
          '<textarea class="ks-note-textarea" placeholder="Écris tes mémorisations, mnémoniques, exemples persos, traductions alternatives… Ça sera là à chaque fois que tu reviens sur cette page."></textarea>' +
        '</div>' +
        '<div class="ks-note-footer">' +
          '<span class="ks-note-status" id="ksNoteStatus"></span>' +
          '<button class="ks-note-delete" id="ksNoteDelete" style="display:none">Supprimer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.classList.add('show'); });

    var ta = overlay.querySelector('.ks-note-textarea');
    var status = overlay.querySelector('#ksNoteStatus');
    var deleteBtn = overlay.querySelector('#ksNoteDelete');
    var closeBtn = overlay.querySelector('.ks-note-close');

    if (existing && existing.text) {
      ta.value = existing.text;
      deleteBtn.style.display = '';
      setStatus('saved');
    }
    setTimeout(function(){ ta.focus(); }, 350);

    function setStatus(state){
      if (state === 'saving') {
        status.className = 'ks-note-status';
        status.innerHTML = 'Enregistrement…';
      } else if (state === 'saved') {
        status.className = 'ks-note-status saved';
        status.innerHTML = CHECK_SVG + ' Enregistrée';
      } else {
        status.className = 'ks-note-status';
        status.innerHTML = '';
      }
    }

    ta.addEventListener('input', function(){
      setStatus('saving');
      if (SAVE_TIMER) clearTimeout(SAVE_TIMER);
      SAVE_TIMER = setTimeout(function(){
        var txt = ta.value;
        setNote(path, txt, title);
        if (txt.trim().length > 0) {
          setStatus('saved');
          deleteBtn.style.display = '';
        } else {
          setStatus('');
          deleteBtn.style.display = 'none';
        }
        updateButton();
      }, 800);
    });

    deleteBtn.addEventListener('click', function(){
      if (!confirm('Supprimer ta note ?')) return;
      ta.value = '';
      setNote(path, '', title);
      setStatus('');
      deleteBtn.style.display = 'none';
      updateButton();
    });

    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closePanel();
    });
    /* Esc */
    function escHandler(e){
      if (e.key === 'Escape') { closePanel(); document.removeEventListener('keydown', escHandler); }
    }
    document.addEventListener('keydown', escHandler);
  }

  function closePanel(){
    var overlay = document.querySelector('.ks-note-overlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(function(){ if (overlay.parentNode) overlay.remove(); }, 300);
  }

  function escapeHtml(s){
    return String(s||'').replace(/[<>&"]/g, function(c){
      return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c];
    });
  }

  /* ── Bouton ──────────────────────────────────────────────── */
  function updateButton(){
    var btn = document.querySelector('.ks-note-btn');
    if (!btn) return;
    var on = hasNote(currentPath());
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('title', on ? 'Voir / modifier ma note' : 'Prendre une note');
  }

  function injectButton(){
    /* On l'injecte à côté du bouton favori si présent, sinon dans la
       nav bar. */
    var bar = document.querySelector('nav.bar, .bar');
    if (!bar) return;
    if (bar.querySelector('.ks-note-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'ks-note-btn';
    btn.type = 'button';
    btn.innerHTML = NOTE_SVG + '<span class="ks-note-dot"></span>';
    btn.addEventListener('click', openPanel);

    /* Placement : si .bar-r existe (lecons), au début de .bar-r.
       Sinon AVANT le bouton thème détecté.
       Sinon avant le favori si présent.
       Sinon en fin de barre. */
    var barR = bar.querySelector('.bar-r');
    var favBtn = bar.querySelector('.ks-fav-btn');
    var themeBtn = bar.querySelector('.theme-btn, .bar-theme');

    if (barR) {
      barR.insertBefore(btn, barR.firstChild);
    } else if (favBtn) {
      favBtn.parentNode.insertBefore(btn, favBtn);
    } else if (themeBtn) {
      bar.insertBefore(btn, themeBtn);
    } else {
      bar.appendChild(btn);
    }
    /* Sur petit écran, design.css masque le logo centré quand la barre
       porte des outils (sinon ils se chevauchent) */
    bar.classList.add('bar-has-tools');
    updateButton();
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init(){
    if (!isLessonPage()) return;
    injectCSS();
    /* Attend ks-favorites pour que les boutons soient ordonnés correctement */
    setTimeout(injectButton, 100);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API publique */
  window.KSNotes = {
    all: getAll,
    get: getNote,
    set: setNote,
    has: hasNote,
    delete: function(href){
      var a = getAll(); delete a[href]; setAll(a);
    },
    open: openPanel
  };
})();
