/* ═══════════════════════════════════════════════════════════════════
   ks-podcast.js — Lecteur de podcast par synthèse vocale (voix native).
   ──────────────────────────────────────────────────────────────────
   Chaque page podcast fournit :
     • des segments  <div class="pc-seg"><div class="pc-seg-kr">…</div>
                       <div class="pc-seg-fr">…</div></div>
     • un lecteur    #pcPlay #pcIco #pcFill #pcCur #pcDur #pcRate #pcSoon
     • un bouton FR  #frBtn
     • (optionnel)   #pcReward (.pcr-xp) affiché à la fin
     • window.KS_POD = { key:'ks_pod_x', xp:15, id:'pod_x' }

   Le player lit la transcription coréenne à voix haute via l'API
   speechSynthesis du navigateur (ko-KR) — fonctionne hors-ligne, sans
   MP3. À la fin de l'épisode, l'XP est accordée une seule fois et la
   progression est enregistrée (ks_pod_progress) pour le hub.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Bascule traduction FR (préférence mémorisée) ── */
  var frBtn = document.getElementById('frBtn');
  function syncFr(){
    var on=false; try{ on=localStorage.getItem('ks_pref_podfr')==='1'; }catch(e){}
    document.body.classList.toggle('show-fr', on);
    if(frBtn) frBtn.setAttribute('aria-pressed', on?'true':'false');
  }
  syncFr();
  if(frBtn) frBtn.addEventListener('click', function(){
    var on=document.body.classList.toggle('show-fr');
    try{ localStorage.setItem('ks_pref_podfr', on?'1':'0'); }catch(e){}
    frBtn.setAttribute('aria-pressed', on?'true':'false');
  });

  var segs   = [].slice.call(document.querySelectorAll('.pc-seg'));
  var playBtn= document.getElementById('pcPlay');
  var ico    = document.getElementById('pcIco');
  var fill   = document.getElementById('pcFill');
  var curEl  = document.getElementById('pcCur');
  var durEl  = document.getElementById('pcDur');
  var rateBtn= document.getElementById('pcRate');
  var soon   = document.getElementById('pcSoon');
  var ICO_PLAY  = '<polygon points="6 4 20 12 6 20 6 4"/>';
  var ICO_PAUSE = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
  var synth = window.speechSynthesis;

  if(durEl) durEl.textContent = segs.length + ' parties';

  /* Pas de synthèse vocale (ou pas de segments) → transcription lisible seule. */
  if(!synth || typeof SpeechSynthesisUtterance==='undefined' || !segs.length){
    if(soon) soon.classList.add('show');
    if(playBtn) playBtn.setAttribute('disabled','');
    return;
  }

  /* Choix d'une voix coréenne si le système en a une. */
  var koVoice=null;
  function pickVoice(){
    var vs = synth.getVoices()||[];
    koVoice = vs.filter(function(v){ return /^ko/i.test(v.lang||''); })[0] || null;
  }
  pickVoice();
  if(typeof synth.onvoiceschanged!=='undefined') synth.onvoiceschanged=pickVoice;

  var idx=0, playing=false, finished=false;
  var RATES=[1,1.15,1.3,0.85], ri=0;

  function setProg(i){
    if(fill) fill.style.width = (i/segs.length*100)+'%';
    if(curEl) curEl.textContent = i+'/'+segs.length;
  }
  function highlight(i){
    segs.forEach(function(s,j){ s.classList.toggle('on', j===i); });
    if(segs[i]) segs[i].scrollIntoView({behavior:'smooth',block:'center'});
  }

  function speakSeg(i){
    if(i>=segs.length){ finishAll(); return; }
    idx=i; highlight(i); setProg(i);
    var txt = ((segs[i].querySelector('.pc-seg-kr')||{}).textContent||'').trim();
    if(!txt){ speakSeg(i+1); return; }
    var u = new SpeechSynthesisUtterance(txt);
    u.lang='ko-KR'; u.rate = 0.95*RATES[ri]; u.pitch=1;
    if(koVoice) u.voice=koVoice;
    u.onend = function(){ if(playing) speakSeg(i+1); };
    u.onerror = function(){ if(playing) speakSeg(i+1); };
    synth.speak(u);
  }

  function play(){
    playing=true; if(ico) ico.innerHTML=ICO_PAUSE;
    if(synth.paused){ synth.resume(); }
    else { synth.cancel(); speakSeg(idx>=segs.length?0:idx); }
  }
  function pause(){
    playing=false; if(ico) ico.innerHTML=ICO_PLAY;
    try{ synth.pause(); }catch(e){}
  }
  playBtn.addEventListener('click', function(){ playing?pause():play(); });

  /* Clic sur un segment → démarre la lecture à partir de là. */
  segs.forEach(function(s,i){
    s.style.cursor='pointer';
    s.addEventListener('click', function(){
      idx=i;
      if(!playing){ play(); }
      else { synth.cancel(); speakSeg(i); }
    });
  });

  if(rateBtn) rateBtn.addEventListener('click', function(){
    ri=(ri+1)%RATES.length; rateBtn.textContent=RATES[ri]+'×';
  });

  function finishAll(){
    playing=false; if(ico) ico.innerHTML=ICO_PLAY;
    if(fill) fill.style.width='100%';
    if(curEl) curEl.textContent = segs.length+'/'+segs.length;
    segs.forEach(function(s){ s.classList.remove('on'); });
    if(finished) return; finished=true;
    grantXP();
  }

  function grantXP(){
    var cfg = window.KS_POD||{};
    if(cfg.key){
      try{
        if(!localStorage.getItem(cfg.key)){
          localStorage.setItem('ks_xp', (parseInt(localStorage.getItem('ks_xp')||'0') + (cfg.xp||10)));
          localStorage.setItem(cfg.key, '1');
          localStorage.setItem(cfg.key+'_prog', '100');
          var p = JSON.parse(localStorage.getItem('ks_pod_progress')||'{}');
          p[cfg.id||cfg.key] = { done:true, date:Date.now() };
          localStorage.setItem('ks_pod_progress', JSON.stringify(p));
        }
      }catch(e){}
    }
    var el = document.getElementById('pcReward');
    if(el){
      var x=el.querySelector('.pcr-xp'); if(x) x.textContent='+'+(cfg.xp||10)+' XP';
      el.classList.add('show');
      el.scrollIntoView({behavior:'smooth',block:'center'});
    }
    if(typeof window.ksConfetti==='function'){ try{ window.ksConfetti(); }catch(e){} }
  }

  /* Coupe la voix en quittant la page. */
  window.addEventListener('pagehide', function(){ try{ synth.cancel(); }catch(e){} });
  window.addEventListener('beforeunload', function(){ try{ synth.cancel(); }catch(e){} });
})();
