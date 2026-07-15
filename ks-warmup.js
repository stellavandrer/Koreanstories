/* ks-warmup.js — Rappel (Warm-Up) en début de leçon.
   S'auto-injecte sur les pages lecon*.html : va chercher la leçon
   précédente du parcours qui a une mini-quiz (.card.mq), en extrait
   la question + la bonne réponse (contenu déjà vérifié, aucune
   nouvelle phrase créée) et l'affiche comme flashcard de rappel
   avant le nouveau contenu. Échoue toujours en silence. */
(function(){
  'use strict';

  var m = /\/?(lecon\d+)\.html$/i.exec(location.pathname);
  if(!m) return;
  var currentHref = m[1] + '.html';

  function ls(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k, v); }catch(e){} }

  var seenKey = 'ks_warmup_seen_' + currentHref;
  var today = new Date().toISOString().slice(0,10);
  if (ls(seenKey) === today) return;

  function esc(s){
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function loadScript(src){
    return new Promise(function(resolve){
      var s = document.createElement('script');
      s.src = src;
      s.onload = function(){ resolve(true); };
      s.onerror = function(){ resolve(false); };
      document.head.appendChild(s);
    });
  }

  function ensureCurriculum(){
    if (window.KSCurriculum) return Promise.resolve(true);
    return loadScript('/ks-curriculum.js');
  }

  function findPreviousLessons(){
    if(!window.KSCurriculum || !window.KSCurriculum.activities) return [];
    var acts = window.KSCurriculum.activities;
    var idx = -1;
    for (var i=0;i<acts.length;i++){ if(acts[i].href===currentHref){ idx=i; break; } }
    if (idx <= 0) return [];
    var out = [];
    for (var j=idx-1; j>=0 && out.length<8; j--){
      if (acts[j].t==='lecon') out.push(acts[j]);
    }
    return out;
  }

  function extractQuiz(html){
    try {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var card = doc.querySelector('.card.mq');
      if(!card) return null;
      var p = card.querySelector('p');
      var okOpt = card.querySelector('.opt[onclick*="\'ok\'"]');
      if(!p || !okOpt) return null;
      var q = (p.textContent||'').trim();
      var a = (okOpt.textContent||'').trim();
      if(!q || !a) return null;
      return { q: q, a: a };
    } catch(e){ return null; }
  }

  function tryFetchQuiz(candidates, i){
    if (i>=candidates.length) return Promise.resolve(null);
    var lesson = candidates[i];
    return fetch(lesson.href).then(function(r){ return r.ok ? r.text() : null; })
      .then(function(html){
        if(!html) return tryFetchQuiz(candidates, i+1);
        var quiz = extractQuiz(html);
        if(!quiz) return tryFetchQuiz(candidates, i+1);
        return { lesson: lesson, quiz: quiz };
      })
      .catch(function(){ return tryFetchQuiz(candidates, i+1); });
  }

  function injectCSS(){
    if (document.getElementById('ks-warmup-css')) return;
    var css = [
      '#ks-warmup{background:var(--navy);color:#fff;border-radius:16px;',
        'padding:1rem 1.1rem;margin:0 0 1rem;position:relative;',
        'box-shadow:0 10px 26px rgba(15,27,45,.16);font-family:inherit}',
      '#ks-warmup .kw-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem}',
      '#ks-warmup .kw-badge{font-size:.68rem;font-weight:800;letter-spacing:.09em;',
        'text-transform:uppercase;color:var(--gold);background:rgba(201,169,110,.14);',
        'border-radius:20px;padding:.2rem .7rem}',
      '#ks-warmup .kw-close{background:none;border:none;color:rgba(247,248,250,.5);',
        'font-size:1.2rem;line-height:1;cursor:pointer;padding:.1rem .3rem}',
      '#ks-warmup .kw-close:hover{color:#fff}',
      '#ks-warmup .kw-lbl{font-size:.78rem;color:rgba(247,248,250,.62);margin-bottom:.55rem;line-height:1.45}',
      '#ks-warmup .kw-lbl a{color:var(--gold);text-decoration:none;font-weight:700}',
      '#ks-warmup .kw-lbl a:hover{text-decoration:underline}',
      '#ks-warmup .kw-q{font-size:.98rem;font-weight:700;color:#fff;line-height:1.5;margin-bottom:.7rem}',
      '#ks-warmup .kw-reveal{background:none;border:1.5px solid rgba(201,169,110,.5);',
        'color:var(--gold);border-radius:10px;padding:.55rem 1rem;font-size:.85rem;',
        'font-weight:700;cursor:pointer}',
      '#ks-warmup .kw-reveal:hover{background:rgba(201,169,110,.12)}',
      '#ks-warmup .kw-a{margin-top:.6rem;padding:.6rem .8rem;background:rgba(255,255,255,.06);',
        'border-radius:10px;font-size:.92rem;color:#fff;line-height:1.5}',
      '#ks-warmup .kw-a b{color:var(--gold)}',
      '#ks-warmup .kw-sub{font-size:.85rem;color:rgba(247,248,250,.62);line-height:1.5;margin-bottom:.7rem}',
      '#ks-warmup .kw-link{display:inline-block;color:var(--gold);text-decoration:none;',
        'font-size:.85rem;font-weight:700;border:1.5px solid rgba(201,169,110,.5);',
        'border-radius:10px;padding:.55rem 1rem}',
      '#ks-warmup .kw-link:hover{background:rgba(201,169,110,.12)}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'ks-warmup-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function dismiss(){
    var el = document.getElementById('ks-warmup');
    if (el) el.remove();
    lsSet(seenKey, today);
  }

  function render(result){
    if (!document.body) return;
    injectCSS();
    var wrap = document.createElement('div');
    wrap.id = 'ks-warmup';
    wrap.innerHTML =
      '<div class="kw-top">' +
        '<span class="kw-badge">Rappel</span>' +
        '<button class="kw-close" type="button" aria-label="Fermer">&times;</button>' +
      '</div>' +
      '<div class="kw-lbl">Avant de continuer, un petit rappel de <a href="'+esc(result.lesson.href)+'">'+esc(result.lesson.title)+'</a> :</div>' +
      '<div class="kw-q">'+esc(result.quiz.q)+'</div>' +
      '<button class="kw-reveal" type="button">Voir la réponse</button>' +
      '<div class="kw-a" hidden><b>Réponse : </b>'+esc(result.quiz.a)+'</div>';
    document.body.insertBefore(wrap, document.body.firstChild);

    var closeBtn = wrap.querySelector('.kw-close');
    var revealBtn = wrap.querySelector('.kw-reveal');
    var aBox = wrap.querySelector('.kw-a');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    if (revealBtn) revealBtn.addEventListener('click', function(){
      if (aBox) aBox.hidden = false;
      revealBtn.hidden = true;
      lsSet(seenKey, today);
    });
  }

  /* Repli si aucune des leçons précédentes n'a de mini-quiz exploitable :
     bandeau de continuité (titre + résumé déjà écrits, aucune interaction
     à reproduire, aucun risque de contenu inventé). */
  function renderFallback(lesson){
    if (!document.body) return;
    injectCSS();
    var wrap = document.createElement('div');
    wrap.id = 'ks-warmup';
    wrap.innerHTML =
      '<div class="kw-top">' +
        '<span class="kw-badge">Rappel</span>' +
        '<button class="kw-close" type="button" aria-label="Fermer">&times;</button>' +
      '</div>' +
      '<div class="kw-lbl">Juste avant, tu avais vu :</div>' +
      '<div class="kw-q">'+esc(lesson.title)+'</div>' +
      '<div class="kw-sub">'+esc(lesson.sub||'')+'</div>' +
      '<a class="kw-link" href="'+esc(lesson.href)+'">Revoir cette leçon →</a>';
    document.body.insertBefore(wrap, document.body.firstChild);
    lsSet(seenKey, today);
    var closeBtn = wrap.querySelector('.kw-close');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
  }

  function start(){
    ensureCurriculum().then(function(){
      var candidates = findPreviousLessons();
      if (!candidates.length) return;
      return tryFetchQuiz(candidates, 0).then(function(result){
        if (result) { render(result); return; }
        renderFallback(candidates[0]);
      });
    }).catch(function(){});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
