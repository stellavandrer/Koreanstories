/* ═══════════════════════════════════════════════════════════════════
   ks-presse.js — Logique partagée des articles de presse (presseN.html).
   La page définit :
     window.ART = { vocab:[[kr,rom,fr,type],…], quiz:[[q,[opts],ansIndex],…],
                    xpKey:'ks_presse_x', xp:18, id:'presse_x' }
   et fournit : #npDate #body #frToggle #vocabGrid #quizSection #checkBtn
                #xpReward #scoreDisplay #progressFill  (+ toggleFr() inline)
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var ART = window.ART || {};
  var VOCAB = ART.vocab || [];
  var QUIZ  = ART.quiz  || [];
  var XP_KEY = ART.xpKey, XP_VAL = ART.xp || 18, STORY_ID = ART.id || XP_KEY;

  /* Date du jour (coréen) dans la manchette */
  try{
    var d=new Date();
    var jours=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    var el=document.getElementById('npDate');
    if(el) el.textContent='서울 · '+d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+jours[d.getDay()];
  }catch(e){}

  /* Mots cliquables : romanisation + sens */
  var body=document.getElementById('body');
  if(body){
    body.addEventListener('click',function(e){
      var w=e.target.closest('.w');
      if(!w){document.querySelectorAll('.w.on').forEach(function(x){x.classList.remove('on');});return;}
      e.stopPropagation();
      var was=w.classList.contains('on');
      document.querySelectorAll('.w.on').forEach(function(x){x.classList.remove('on');});
      if(!was) w.classList.add('on');
    });
    document.addEventListener('click',function(e){ if(!e.target.closest('.w')) document.querySelectorAll('.w.on').forEach(function(x){x.classList.remove('on');}); });
  }

  /* Traduction FR optionnelle (préférence mémorisée) — expose toggleFr/applyFr */
  function applyFr(on){
    var a=document.getElementById('article'); var btn=document.getElementById('frToggle');
    if(a) a.classList.toggle('show-fr',on);
    if(btn) btn.setAttribute('aria-pressed',on?'true':'false');
  }
  window.applyFr=applyFr;
  window.toggleFr=function(){
    var btn=document.getElementById('frToggle');
    var on=btn?btn.getAttribute('aria-pressed')!=='true':true;
    applyFr(on);
    try{localStorage.setItem('ks_pref_artfr',on?'1':'0');}catch(e){}
  };
  try{ if(localStorage.getItem('ks_pref_artfr')==='1') applyFr(true); }catch(e){}

  /* Lexique */
  (function(){
    var grid=document.getElementById('vocabGrid'); if(!grid) return;
    var labels={n:'nom',v:'verbe',adj:'adjectif',adv:'adverbe',exp:'expression'};
    VOCAB.forEach(function(v){
      var el=document.createElement('div'); el.className='vocab-card';
      el.innerHTML='<div class="vocab-kr">'+v[0]+'</div><div class="vocab-rom">'+v[1]+'</div><div class="vocab-fr">'+v[2]+'</div><span class="vocab-type vt-'+v[3]+'">'+(labels[v[3]]||v[3])+'</span>';
      grid.appendChild(el);
    });
  })();

  /* Quiz */
  var selected={}, done=false;
  (function(){
    var sec=document.getElementById('quizSection'); if(!sec) return;
    QUIZ.forEach(function(q,qi){
      var qd=document.createElement('div'); qd.className='quiz-q';
      qd.innerHTML='<div class="quiz-q-num">Question '+(qi+1)+' / '+QUIZ.length+'</div><div class="quiz-q-text">'+q[0]+'</div><div class="quiz-opts" id="opts'+qi+'"></div>';
      var opts=qd.querySelector('#opts'+qi);
      q[1].forEach(function(opt,oi){
        var btn=document.createElement('button'); btn.className='quiz-opt'; btn.textContent=opt;
        btn.addEventListener('click',function(){
          if(done)return;
          opts.querySelectorAll('.quiz-opt').forEach(function(b){b.classList.remove('correct');});
          btn.classList.add('correct'); selected[qi]=oi;
          if(Object.keys(selected).length===QUIZ.length) document.getElementById('checkBtn').classList.add('show');
        });
        opts.appendChild(btn);
      });
      sec.appendChild(qd);
    });
  })();

  window.checkAll=function(){
    done=true; var score=0;
    QUIZ.forEach(function(q,qi){
      document.querySelectorAll('#opts'+qi+' .quiz-opt').forEach(function(b,oi){
        b.setAttribute('disabled','');
        if(oi===q[2]) b.classList.add('correct');
        else if(oi===selected[qi]&&selected[qi]!==q[2]) b.classList.add('wrong');
      });
      if(selected[qi]===q[2]) score++;
    });
    var cb=document.getElementById('checkBtn'); if(cb) cb.style.display='none';
    var sd=document.getElementById('scoreDisplay'); if(sd) sd.textContent=score;
    if(XP_KEY && !localStorage.getItem(XP_KEY)){
      try{
        localStorage.setItem('ks_xp',(parseInt(localStorage.getItem('ks_xp')||'0')+XP_VAL));
        localStorage.setItem(XP_KEY,'1');
        localStorage.setItem(XP_KEY+'_prog','100');
        var prog=JSON.parse(localStorage.getItem('ks_lect_progress')||'{}');
        prog[STORY_ID]={done:true,score:score,date:Date.now()};
        localStorage.setItem('ks_lect_progress',JSON.stringify(prog));
      }catch(e){}
    }
    var r=document.getElementById('xpReward');
    if(r){ r.classList.add('show'); r.scrollIntoView({behavior:'smooth',block:'center'}); }
    if(typeof window.ksConfetti==='function'){ try{ window.ksConfetti(); }catch(e){} }
  };

  /* Progression de lecture */
  function updateProgress(){
    var fill=document.getElementById('progressFill'); if(!fill) return;
    var total=document.documentElement.scrollHeight-window.innerHeight;
    fill.style.width=(total>0?Math.min(100,(window.scrollY/total)*100):0)+'%';
  }
  window.addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();
})();
