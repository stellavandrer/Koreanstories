/* ═══════════════════════════════════════════════════════════════════
   ks-stories.js — Refonte des histoires (chargé par ks.js sur histoireN.html)
   Ajoute partout, sans toucher au HTML des 42 histoires :
   - une scène illustrée (SVG) en en-tête, choisie selon le thème ;
   - un bouton « Lire la conversation » qui enchaîne les répliques
     (voix par personnage, surlignage, défilement auto) ;
   - l'apparition animée des bulles au défilement.
   Fonctionne pour les deux structures (.line et .bubble-row).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var file = (location.pathname.split('/').pop() || '').toLowerCase().replace('.html', '');
  if (!/^histoire\d+$/.test(file)) return;

  /* ── Thème de scène par histoire (selon le sujet) ── */
  var THEMES = {
    histoire1:'day', histoire2:'market', histoire3:'food', histoire4:'food',
    histoire5:'market', histoire6:'transport', histoire7:'home', histoire8:'night',
    histoire9:'clinic', histoire10:'market', histoire11:'home', histoire12:'heart',
    histoire13:'day', histoire14:'transport', histoire15:'clinic', histoire16:'day',
    histoire17:'nature', histoire18:'transport', histoire19:'day', histoire20:'night',
    histoire21:'day', histoire22:'night', histoire23:'day', histoire24:'night',
    histoire25:'night', histoire26:'heart', histoire27:'culture', histoire28:'home',
    histoire29:'culture', histoire30:'clinic', histoire31:'home', histoire32:'food',
    histoire33:'day', histoire34:'day', histoire35:'food', histoire36:'home',
    histoire37:'day', histoire38:'nature', histoire39:'culture', histoire40:'food',
    histoire41:'nature', histoire42:'culture'
  };

  /* ── Bibliothèque de scènes SVG (dégradé + silhouette) ── */
  function S(id, stops, inner) {
    return '<svg viewBox="0 0 560 150" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + stops + '</linearGradient></defs>' +
      '<rect width="560" height="150" fill="url(#' + id + ')"/>' + inner + '</svg>';
  }
  var SKYLINE = '<rect x="24" y="98" width="30" height="52"/><rect x="60" y="82" width="22" height="68"/><rect x="88" y="106" width="26" height="44"/><rect x="150" y="90" width="24" height="60"/><rect x="180" y="104" width="30" height="46"/><rect x="330" y="94" width="26" height="56"/><rect x="362" y="108" width="22" height="42"/><rect x="470" y="98" width="28" height="52"/><rect x="502" y="86" width="20" height="64"/><rect x="262" y="66" width="6" height="84"/><circle cx="265" cy="64" r="7"/>';

  var SCENES = {
    day: S('s_day', '<stop offset="0" stop-color="#FFE7C2"/><stop offset=".5" stop-color="#FFD29A"/><stop offset="1" stop-color="#F4A86A"/>',
      '<circle cx="448" cy="42" r="42" fill="#FFF6DD" opacity=".35"/><circle cx="448" cy="42" r="25" fill="#FFF6DD"/>' +
      '<g fill="#fff" opacity=".5"><ellipse cx="120" cy="36" rx="38" ry="11"/><ellipse cx="300" cy="24" rx="30" ry="8"/></g>' +
      '<g fill="#B5683A">' + SKYLINE + '</g>'),
    night: S('s_night', '<stop offset="0" stop-color="#241F45"/><stop offset=".6" stop-color="#3A2E60"/><stop offset="1" stop-color="#574A78"/>',
      '<circle cx="458" cy="40" r="19" fill="#FFF3C4"/><circle cx="450" cy="36" r="19" fill="#3A2E60"/>' +
      '<g fill="#fff" opacity=".85"><circle cx="80" cy="30" r="1.4"/><circle cx="160" cy="48" r="1"/><circle cx="240" cy="28" r="1.2"/><circle cx="360" cy="44" r="1"/><circle cx="120" cy="62" r="1"/></g>' +
      '<g fill="#19153A">' + SKYLINE + '</g>' +
      '<g fill="#FFD27A" opacity=".85"><rect x="32" y="106" width="4" height="5"/><rect x="66" y="92" width="4" height="5"/><rect x="158" y="100" width="4" height="5"/><rect x="338" y="104" width="4" height="5"/><rect x="478" y="108" width="4" height="5"/><rect x="508" y="96" width="4" height="5"/></g>'),
    food: S('s_food', '<stop offset="0" stop-color="#FBE3CF"/><stop offset="1" stop-color="#E29A60"/>',
      '<circle cx="452" cy="44" r="30" fill="#FFF1DE" opacity=".45"/>' +
      '<ellipse cx="280" cy="98" rx="78" ry="14" fill="#B5683A"/><path d="M204 96 a76 26 0 0 0 152 0z" fill="#9C4E2E"/>' +
      '<g stroke="#7E3D22" stroke-width="3" stroke-linecap="round" opacity=".75"><path d="M262 86 l16-24"/><path d="M272 86 l20-24"/></g>' +
      '<path d="M0 134 h560 v16 H0z" fill="#C9803F" opacity=".45"/>'),
    home: S('s_home', '<stop offset="0" stop-color="#FCEEDB"/><stop offset="1" stop-color="#E8B98A"/>',
      '<circle cx="455" cy="42" r="26" fill="#FFF3DD" opacity=".5"/>' +
      '<g fill="#B5683A"><path d="M150 96 l60-40 60 40z"/><rect x="166" y="96" width="88" height="54"/></g>' +
      '<rect x="196" y="112" width="28" height="38" fill="#7E3D22"/><rect x="300" y="104" width="46" height="46" fill="#A85C34"/><rect x="356" y="118" width="40" height="32" fill="#9C4E2E"/>' +
      '<g fill="#FFE6B8"><rect x="204" y="120" width="12" height="14"/></g>'),
    market: S('s_market', '<stop offset="0" stop-color="#FFE2BC"/><stop offset="1" stop-color="#EFA968"/>',
      '<g><rect x="36" y="74" width="150" height="10" fill="#C0392B"/><rect x="206" y="74" width="150" height="10" fill="#2E7D5B"/><rect x="376" y="74" width="150" height="10" fill="#C99A2E"/></g>' +
      '<g opacity=".85"><path d="M36 84 l15 14 15-14 15 14 15-14 15 14 15-14 15 14 15-14 15 14 15-14 v-2 h-150z" fill="#E05C4E"/>' +
      '<path d="M206 84 l15 14 15-14 15 14 15-14 15 14 15-14 15 14 15-14 15 14 15-14 v-2 h-150z" fill="#3EA378"/>' +
      '<path d="M376 84 l15 14 15-14 15 14 15-14 15 14 15-14 15 14 15-14 15 14 15-14 v-2 h-150z" fill="#E0B84E"/></g>' +
      '<rect x="0" y="126" width="560" height="24" fill="#B5683A" opacity=".4"/>'),
    transport: S('s_transport', '<stop offset="0" stop-color="#D9E8F5"/><stop offset="1" stop-color="#8FB3D4"/>',
      '<g fill="#fff" opacity=".5"><ellipse cx="130" cy="34" rx="34" ry="10"/><ellipse cx="330" cy="26" rx="28" ry="8"/></g>' +
      '<g fill="#3E5C78"><rect x="60" y="86" width="200" height="46" rx="10"/><rect x="74" y="96" width="36" height="22" rx="3" fill="#BFE0FF"/><rect x="120" y="96" width="36" height="22" rx="3" fill="#BFE0FF"/><rect x="166" y="96" width="36" height="22" rx="3" fill="#BFE0FF"/><rect x="212" y="96" width="36" height="22" rx="3" fill="#BFE0FF"/></g>' +
      '<rect x="0" y="134" width="560" height="5" fill="#33485E"/><rect x="0" y="143" width="560" height="4" fill="#33485E" opacity=".6"/>'),
    nature: S('s_nature', '<stop offset="0" stop-color="#DDF1D8"/><stop offset="1" stop-color="#8FC79A"/>',
      '<circle cx="455" cy="40" r="26" fill="#FFF7CF" opacity=".7"/>' +
      '<path d="M0 104 Q140 70 280 96 T560 88 V150 H0z" fill="#6FB07E" opacity=".7"/>' +
      '<path d="M0 120 Q160 96 320 116 T560 110 V150 H0z" fill="#4E9466"/>' +
      '<path d="M0 138 h560 v12 H0z" fill="#3E7CA8" opacity=".55"/>'),
    clinic: S('s_clinic', '<stop offset="0" stop-color="#E4F2F1"/><stop offset="1" stop-color="#A9D6D2"/>',
      '<g fill="#fff" opacity=".55"><ellipse cx="130" cy="34" rx="34" ry="10"/><ellipse cx="340" cy="26" rx="26" ry="8"/></g>' +
      '<g fill="#7FB7B3"><rect x="210" y="60" width="140" height="90"/></g>' +
      '<g fill="#fff"><rect x="270" y="78" width="20" height="44"/><rect x="258" y="90" width="44" height="20"/></g>' +
      '<g fill="#5E9D98"><rect x="226" y="72" width="14" height="14"/><rect x="320" y="72" width="14" height="14"/><rect x="226" y="100" width="14" height="14"/><rect x="320" y="100" width="14" height="14"/></g>'),
    culture: S('s_culture', '<stop offset="0" stop-color="#FBE6CE"/><stop offset="1" stop-color="#D99A66"/>',
      '<circle cx="100" cy="40" r="24" fill="#FFF1D6" opacity=".6"/>' +
      '<path d="M0 96 L120 60 L240 96 Z" fill="#8a5a3a" opacity=".5"/><path d="M300 100 L430 66 L560 100 Z" fill="#8a5a3a" opacity=".45"/>' +
      '<g fill="#7E4A2E"><path d="M190 96 q90 -34 180 0 l-14 8 q-76 -26 -152 0z"/><rect x="206" y="104" width="148" height="46"/></g>' +
      '<g fill="#5E3620"><rect x="222" y="118" width="22" height="32"/><rect x="316" y="118" width="22" height="32"/><rect x="266" y="112" width="28" height="38"/></g>'),
    heart: S('s_heart', '<stop offset="0" stop-color="#FBDDE8"/><stop offset="1" stop-color="#E89BB8"/>',
      '<g fill="#fff" opacity=".4"><circle cx="120" cy="44" r="30"/><circle cx="430" cy="56" r="38"/></g>' +
      '<path d="M280 118 c-44 -34 -74 -58 -74 -86 0 -18 14 -30 30 -30 12 0 22 7 28 18 6 -11 16 -18 28 -18 16 0 30 12 30 30 0 28 -30 52 -74 86z" fill="#D9658C" opacity=".85"/>'),
    default: null
  };

  /* ── Injecte le CSS une seule fois ── */
  function injectCSS() {
    if (document.getElementById('ks-stories-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-stories-css';
    s.textContent = [
      '.ks-scene{position:relative;height:152px;border-radius:20px;overflow:hidden;margin:0 0 14px;box-shadow:0 10px 28px rgba(15,27,45,.16)}',
      '.ks-scene>svg{display:block;width:100%;height:100%}',
      '.ks-scene::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(15,27,45,.5) 80%,rgba(15,27,45,.74));pointer-events:none}',
      '.ks-scene-cap{position:absolute;left:18px;right:18px;bottom:13px;z-index:2}',
      '.ks-scene-cap .t{font-family:"Playfair Display",Georgia,serif;font-size:19px;font-weight:700;color:#fff;line-height:1.2;text-shadow:0 2px 14px rgba(0,0,0,.5)}',
      '.ks-scene-cap .s{font-size:11.5px;color:rgba(255,255,255,.9);margin-top:2px;text-shadow:0 1px 8px rgba(0,0,0,.55)}',
      '.conv-play{display:inline-flex;align-items:center;gap:8px;margin:0 0 16px;background:linear-gradient(135deg,#5BA8F5,#B8924E);color:#0F1B2D;border:none;border-radius:100px;padding:9px 17px;font-size:12.5px;font-weight:800;font-family:inherit;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 6px 18px rgba(184,146,78,.3)}',
      '.conv-play:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(184,146,78,.4)}',
      '.conv-play:focus-visible{outline:2px solid #B8924E;outline-offset:2px}',
      '.conv-play svg{width:14px;height:14px;fill:currentColor}',
      '.conv-play.playing{background:rgba(184,146,78,.18);color:#B8924E;box-shadow:none}',
      '.ks-rv{opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s cubic-bezier(.34,1.3,.5,1)}',
      '.ks-rv.ks-shown{opacity:1;transform:none}',
      '.ks-speaking .bubble,.bubble.ks-speaking{box-shadow:0 0 0 2px #B8924E,0 10px 26px rgba(184,146,78,.3)!important;transform:scale(1.012)}',
      '@media(prefers-reduced-motion:reduce){.ks-rv{opacity:1;transform:none;transition:none}}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function storyTitle() {
    var el = document.querySelector('.hero-title, .story-title, h1');
    var kr = '', fr = '';
    if (el) {
      // beaucoup d'histoires ont « 한국어Sous-titre » collés : on sépare
      var raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
      var m = raw.match(/^([가-힣\s!?.…~]+)\s*(.*)$/);
      if (m && m[1].trim()) { kr = m[1].trim(); fr = (m[2] || '').replace(/^[—\-·:\s]+/, '').trim(); }
      else { fr = raw; }
    }
    if (!fr) { var t = document.title.split('·')[0].split('—'); fr = (t[1] || t[0] || '').trim(); }
    return { kr: kr, fr: fr };
  }

  function build() {
    var bubbles = [].slice.call(document.querySelectorAll('.line, .bubble-row'));
    if (!bubbles.length) bubbles = [].slice.call(document.querySelectorAll('.bubble'));
    var audioBtns = [].slice.call(document.querySelectorAll('.bubble-audio'));
    if (!bubbles.length || !audioBtns.length) return;
    injectCSS();

    /* 1) Scène + bouton, insérés juste avant le 1er groupe de bulles */
    var firstBubble = bubbles[0];
    var panel = firstBubble.closest('.story-panel, .panel');
    var anchor = panel || firstBubble;
    var parent = anchor.parentNode;
    if (parent && !document.querySelector('.ks-scene')) {
      var theme = THEMES[file] || 'day';
      var svgStr = SCENES[theme] || SCENES.day;
      var ti = storyTitle();
      var scene = document.createElement('div');
      scene.className = 'ks-scene';
      scene.innerHTML = svgStr + '<div class="ks-scene-cap">' +
        (ti.kr ? '<div class="t">' + ti.kr + '</div>' : '') +
        (ti.fr ? '<div class="s">' + ti.fr + '</div>' : '') + '</div>';
      parent.insertBefore(scene, anchor);

      var pb = document.createElement('button');
      pb.className = 'conv-play'; pb.type = 'button'; pb.id = 'ksConvPlay';
      pb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span class="cp-lbl">Lire la conversation</span>';
      parent.insertBefore(pb, anchor);
      attachSequencer(pb, bubbles, audioBtns);
    }

    /* 2) Apparition animée des bulles */
    bubbles.forEach(function (b) { b.classList.add('ks-rv'); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ks-shown'); io.unobserve(e.target); } });
      }, { threshold: .14 });
      bubbles.forEach(function (b) { io.observe(b); });
    } else { bubbles.forEach(function (b) { b.classList.add('ks-shown'); }); }
  }

  function attachSequencer(pb, bubbles, btns) {
    var lbl = pb.querySelector('.cp-lbl'), playing = false;
    function clearSpk() { bubbles.forEach(function (b) { b.classList.remove('ks-speaking'); }); }
    function stop() {
      playing = false; pb.classList.remove('playing');
      try { window.speechSynthesis.cancel(); } catch (e) {}
      if (window._ksCurrentAudio) { try { window._ksCurrentAudio.pause(); } catch (e) {} }
      clearSpk();
    }
    pb.addEventListener('click', function () {
      if (playing) { stop(); lbl.textContent = 'Reprendre la conversation'; return; }
      playing = true; pb.classList.add('playing'); lbl.textContent = 'Lecture…';
      var i = 0;
      (function step() {
        if (!playing) return;
        if (i >= btns.length) { stop(); lbl.textContent = 'Rejouer la conversation'; return; }
        var btn = btns[i++];
        clearSpk();
        var bub = btn.closest('.line, .bubble-row, .bubble');
        if (bub) { bub.classList.add('ks-shown', 'ks-speaking'); try { bub.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
        var oc = btn.getAttribute('onclick') || '';
        var m = oc.match(/speak(?:As)?\(\s*'([^']+)'/);
        var txt = m ? m[1] : '';
        if (txt && typeof window.speak === 'function') {
          window.speak(txt, btn, {
            onended: function () { if (playing) setTimeout(step, 380); },
            onerror: function () { if (playing) setTimeout(step, 380); }
          });
        } else { setTimeout(step, 800); }
      })();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else { build(); }
})();
