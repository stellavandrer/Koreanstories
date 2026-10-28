/* ═══════════════════════════════════════════════════════════════════
   ks-conjugueur.js — Le conjugueur coréen du site, extrait de
   dictionnaire.html pour pouvoir servir ailleurs.

   Il vit maintenant à un seul endroit : dictionnaire.html le charge, les
   pages de conjugaison le chargent, et le générateur de ces pages
   l'exécute dans Node. Une seule source de vérité, donc aucune chance
   qu'une page affiche une forme et une autre page une forme différente.

   API : window.KSConj
     .conjuguer(mot)   -> [[libellé, forme], ...] ou null si le mot
                          n'est pas un verbe ou un adjectif en 다
     .irregulier(mot)  -> {famille, explication} ou null

   Les deux helpers dec() et comp() sont recopiés ici parce que le module
   doit être autonome ; dictionnaire.html garde les siens, qui servent
   aussi à sa romanisation.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function dec(ch){var c=ch.charCodeAt(0)-0xAC00;if(c<0||c>11171)return null;return {l:Math.floor(c/588),v:Math.floor((c%588)/28),t:c%28};}
  function comp(l,v,t){return String.fromCharCode(0xAC00+(l*21+v)*28+(t||0));}

  /* ── Conjugueur ──────────────────────────────────────────────────────
     Couvre régulier + 하다 + contractions vocaliques + irréguliers
     ㄷ, ㅂ, ㅅ, 르, 으, ㅎ, ㄹ. Formes générées (haut→bas registre). */
  var IRR_D={'듣':1,'걷':1,'묻':1,'싣':1,'깨닫':1,'붇':1};            // ㄷ → ㄹ
  var IRR_B={'덥':1,'춥':1,'쉽':1,'어렵':1,'무겁':1,'가볍':1,'아름답':1,'반갑':1,'맵':1,'싱겁':1,'귀엽':1,'더럽':1,'눕':1,'줍':1,'곱':1,'돕':1,'굽':1,'고맙':1};  // ㅂ → 우/와
  var IRR_S={'짓':1,'낫':1,'붓':1,'긋':1,'잇':1};                    // ㅅ drop
  var IRR_H={'그렇':1,'어떻':1,'이렇':1,'저렇':1,'빨갛':1,'파랗':1,'노랗':1,'하얗':1,'까맣':1,'동그랗':1};  // ㅎ
  var REU_REGULAR={'따르':1,'들르':1,'치르':1};                      // 르 mais régulier (으-drop)
  function bright(v){return v===0||v===8;}  // ㅏ ou ㅗ → voyelle claire (아)

  /* Forme « 아/어 » (= base du présent poli sans 요, et du tutoiement) */
  function infin(stem){
    if(stem.charAt(stem.length-1)==='하') return stem.slice(0,-1)+'해';
    var last=stem.charAt(stem.length-1), d=dec(last), pre=stem.slice(0,-1);
    if(!d) return stem+'어';
    /* 르 irrégulier */
    if(last==='르' && stem.length>=2 && !REU_REGULAR[stem]){
      var pc=dec(stem.charAt(stem.length-2));
      if(pc){ var nv=bright(pc.v)?0:4; return stem.slice(0,-2)+comp(pc.l,pc.v,8)+comp(5,nv,0); }
    }
    if(d.t!==0){
      if(d.t===7 && IRR_D[stem]){ var vv=bright(d.v)?'아':'어'; return pre+comp(d.l,d.v,8)+vv; }          // ㄷ→ㄹ +아/어
      if(d.t===17 && IRR_B[stem]){ var base=comp(d.l,d.v,0); return pre+base+((stem==='돕'||stem==='곱')?'와':'워'); } // ㅂ→우/와
      if(d.t===19 && IRR_S[stem]){ var v2=bright(d.v)?'아':'어'; return pre+comp(d.l,d.v,0)+v2; }          // ㅅ drop
      if(d.t===27 && IRR_H[stem]){ var nv2=(d.v===2)?3:1; return pre+comp(d.l,nv2,0); }                    // ㅎ → ㅐ/ㅒ
      return stem+(bright(d.v)?'아':'어');                                                                  // régulier consonne
    }
    switch(d.v){
      case 0: case 4: case 1: case 5: return stem;                 // ㅏㅓㅐㅔ : pas de changement
      case 8: return pre+comp(d.l,9,0);                            // ㅗ→ㅘ
      case 13: return pre+comp(d.l,14,0);                          // ㅜ→ㅝ
      case 20: return pre+comp(d.l,6,0);                           // ㅣ→ㅕ
      case 11: return pre+comp(d.l,10,0);                          // ㅚ→ㅙ
      case 18: { var hb=false; if(pre){var pd=dec(pre.charAt(pre.length-1)); if(pd) hb=bright(pd.v);} return pre+comp(d.l,hb?0:4,0); } // ㅡ drop
      default: return stem+'어';
    }
  }
  function addSS(infForm){ /* ajoute ㅆ à la dernière syllabe (pour le passé) */
    var last=infForm.charAt(infForm.length-1), d=dec(last);
    if(!d) return infForm+'었';
    return infForm.slice(0,-1)+comp(d.l,d.v,20)+'어'; /* ㅆ=20 */
  }
  function formal(stem){
    var last=stem.charAt(stem.length-1), d=dec(last), pre=stem.slice(0,-1);
    if(!d) return stem+'습니다';
    if(d.t===0||d.t===8) return pre+comp(d.l,d.v,17)+'니다';  /* voyelle ou ㄹ → ㅂ니다 (합니다, 삽니다) */
    return stem+'습니다';
  }
  function vstem(stem){ /* radical avant 으/ㄹ (futur, impératif) → {s, eul:bool} */
    if(stem.charAt(stem.length-1)==='하') return {s:stem, eul:false};
    var last=stem.charAt(stem.length-1), d=dec(last), pre=stem.slice(0,-1);
    if(!d) return {s:stem, eul:true};
    if(last==='르' && !REU_REGULAR[stem]) return {s:stem, eul:false};     /* 르 → +ㄹ */
    if(d.t===0) return {s:stem, eul:false};                               /* voyelle → +ㄹ */
    if(d.t===8) return {s:pre+comp(d.l,d.v,0), eul:false};                /* ㄹ drop → +ㄹ */
    if(d.t===7 && IRR_D[stem]) return {s:pre+comp(d.l,d.v,8), eul:true}; /* ㄷ→ㄹ +을 */
    if(d.t===17 && IRR_B[stem]) return {s:pre+comp(d.l,d.v,0)+'우', eul:false}; /* ㅂ→우 +ㄹ */
    if(d.t===19 && IRR_S[stem]) return {s:pre+comp(d.l,d.v,0), eul:true}; /* ㅅ drop +을 */
    if(d.t===27 && IRR_H[stem]) return {s:pre+comp(d.l,d.v,0), eul:false}; /* ㅎ drop → +ㄹ */
    return {s:stem, eul:true};                                           /* régulier consonne +을 */
  }
  function addRieul(s){ var last=s.charAt(s.length-1),d=dec(last); if(!d)return s+'ㄹ'; return s.slice(0,-1)+comp(d.l,d.v,8); }
  function conjugate(word){
    if(!word||word.charAt(word.length-1)!=='다') return null;
    var stem=word.slice(0,-1);
    if(!stem||!dec(stem.charAt(stem.length-1))) return null;
    var inf=infin(stem);
    var vs=vstem(stem);
    var futurBase = vs.eul ? vs.s+'을' : addRieul(vs.s);
    var imper = vs.eul ? (vs.s+'으세요') : (vs.s+'세요');  /* voyelle → 세요 ; consonne → 으세요 */
    var forms=[
      ['Présent (poli)', inf+'요'],
      ['Présent (formel)', formal(stem)],
      ['Passé', addSS(inf)+'요'],
      ['Futur', futurBase+' 거예요'],
      ['Impératif (poli)', imper],
      ['Tutoiement', inf]
    ];
    return forms;
  }

  /* ── Quelle irrégularité, et pourquoi ────────────────────────────────
     Le tableau de conjugaison seul ne fait pas comprendre. Savoir que
     듣다 appartient à la famille ㄷ, et que son ㄷ devient ㄹ devant une
     voyelle, vaut mieux que mémoriser 들어요 isolément. */
  var FAMILLES = {
    'ㄷ': 'Le ㄷ final devient ㄹ devant une voyelle. C’est pour cela que 듣다 donne 들어요 et non 듣어요.',
    'ㅂ': 'Le ㅂ final devient 우 devant une voyelle (et 오 pour 돕다 et 곱다). 춥다 donne donc 추워요.',
    'ㅅ': 'Le ㅅ final tombe devant une voyelle, mais la voyelle suivante reste. 짓다 donne 지어요.',
    '르': 'Le 르 perd son 으 et ajoute un ㄹ à la syllabe précédente. 모르다 donne 몰라요.',
    'ㅎ': 'Le ㅎ tombe et la voyelle change. 그렇다 donne 그래요.',
    'ㄹ': 'Le ㄹ final tombe devant ㄴ, ㅂ et ㅅ. 살다 donne 삽니다.',
    '으': 'Le 으 final tombe devant une voyelle. 쓰다 donne 써요.'
  };

  function irregulier(mot) {
    if (!mot || mot.charAt(mot.length - 1) !== '다') return null;
    var stem = mot.slice(0, -1);
    var last = stem.charAt(stem.length - 1);
    var d = dec(last);
    if (!d) return null;
    var f = null;
    if (last === '르' && stem.length >= 2 && !REU_REGULAR[stem]) f = '르';
    else if (d.t === 7 && IRR_D[stem]) f = 'ㄷ';
    else if (d.t === 17 && IRR_B[stem]) f = 'ㅂ';
    else if (d.t === 19 && IRR_S[stem]) f = 'ㅅ';
    else if (d.t === 27 && IRR_H[stem]) f = 'ㅎ';
    else if (d.t === 8) f = 'ㄹ';
    else if (d.t === 0 && d.v === 18) f = '으';   /* y compris les radicaux d'une syllabe : 쓰다, 크다 */
    return f ? { famille: f, explication: FAMILLES[f] } : null;
  }

  global.KSConj = { conjuguer: conjugate, irregulier: irregulier };

})(typeof window !== 'undefined' ? window : globalThis);
