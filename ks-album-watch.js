/* ks-album-watch.js — Guetteur de l'Album des histoires.
   Injecté partout (sauf pages « light ») par ks.js. À chaque chargement de
   page, compare le nombre de cartes débloquées au dernier total notifié
   (ks_album_notified) : s'il a augmenté, affiche un toast discret
   « Nouvelle carte dans ton Album ! » avec un lien vers album.html.
   La liste [n, cléDeComplétion] est dérivée du dataset de ks-album.js
   (une carte est débloquée si sa clé existe OU si ks_bd_h{n}_prog==='100'). */
(function () {
  if (/album\.html$/i.test(location.pathname)) return; /* pas sur l'album lui-même */

  var KEYS = [[1, "ks_h1"], [2, "ks_h2"], [3, "ks_h3"], [4, "ks_h4"], [5, "ks_h5"], [6, "ks_h6"], [7, "ks_h7"], [8, "ks_h8"], [9, "ks_h9"], [10, "ks_h10"], [11, "ks_h11"], [12, "ks_b09"], [13, "ks_b12"], [14, "ks_b17"], [15, "ks_b31"], [16, "ks_c13"], [17, "ks_c16"], [18, "ks_c21"], [19, "ks_c23"], [20, "ks_d06"], [21, "ks_d09"], [29, "ks_a41"], [30, "ks_a42"], [31, "ks_a43"], [32, "ks_a35"], [33, "ks_a37"], [34, "ks_b43"], [35, "ks_b44"], [36, "ks_b45"], [37, "ks_c36"], [38, "ks_c37"], [39, "ks_c38"], [40, "ks_d35"], [41, "ks_d36"], [42, "ks_d37"], [27, "ks_b37"], [28, "ks_b38"], [25, "ks_c30"], [26, "ks_c31"], [22, "ks_d22"], [23, "ks_d23"], [24, "ks_d24"]];

  function ls(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }

  function unlockedCount(){
    var n = 0;
    for (var i = 0; i < KEYS.length; i++){
      if (ls(KEYS[i][1]) || ls('ks_bd_h' + KEYS[i][0] + '_prog') === '100') n++;
    }
    return n;
  }

  function show(count, gained){
    if (document.getElementById('ksAlbumToast')) return;
    var st = document.createElement('style');
    st.textContent =
      '#ksAlbumToast{position:fixed;left:50%;transform:translateX(-50%) translateY(20px);bottom:calc(84px + env(safe-area-inset-bottom));' +
      'z-index:180;display:flex;align-items:center;gap:12px;max-width:min(420px,calc(100vw - 28px));padding:13px 16px;border-radius:16px;' +
      'background:#152030;color:#F7F8FA;border:1.5px solid rgba(201,169,110,.45);box-shadow:0 14px 40px rgba(0,0,0,.35);' +
      'font-family:"Segoe UI",system-ui,sans-serif;opacity:0;transition:opacity .3s,transform .3s}' +
      '#ksAlbumToast.on{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '#ksAlbumToast .kat-ico{flex:none;width:38px;height:38px;border-radius:11px;background:rgba(201,169,110,.16);display:flex;align-items:center;justify-content:center;color:#C9A96E}' +
      '#ksAlbumToast .kat-t{font-size:13.5px;font-weight:700;line-height:1.3}' +
      '#ksAlbumToast .kat-s{font-size:11.5px;color:rgba(247,248,250,.55);margin-top:2px}' +
      '#ksAlbumToast a{color:#C9A96E;font-weight:800;text-decoration:none;font-size:12.5px;white-space:nowrap}' +
      '#ksAlbumToast .kat-x{flex:none;background:none;border:none;color:rgba(247,248,250,.4);font-size:16px;cursor:pointer;padding:4px;line-height:1}';
    (document.head || document.documentElement).appendChild(st);

    var el = document.createElement('div');
    el.id = 'ksAlbumToast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<span class="kat-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span>' +
      '<span style="min-width:0;flex:1"><span class="kat-t">' +
        (gained > 1 ? gained + ' nouvelles cartes dans ton Album !' : 'Nouvelle carte dans ton Album !') +
      '</span><span class="kat-s" style="display:block">' + count + ' / ' + KEYS.length + ' histoires collectionnées</span></span>' +
      '<a href="album.html">Voir</a>' +
      '<button class="kat-x" aria-label="Fermer">&times;</button>';
    document.body.appendChild(el);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('on'); }); });
    function hide(){ el.classList.remove('on'); setTimeout(function(){ el.remove(); }, 350); }
    el.querySelector('.kat-x').addEventListener('click', hide);
    setTimeout(hide, 8000);
  }

  function check(){
    var cur = unlockedCount();
    var prevRaw = ls('ks_album_notified');
    try { localStorage.setItem('ks_album_notified', String(cur)); } catch(e){}
    if (prevRaw === null){
      /* Première visite depuis le déploiement de l'Album : petit toast de
         découverte uniquement si des cartes existent déjà. */
      if (cur > 0) show(cur, cur);
      return;
    }
    var prev = parseInt(prevRaw, 10) || 0;
    if (cur > prev) show(cur, cur - prev);
  }

  /* Après le rendu de la page (et après que ksFinish/markRead aient pu écrire). */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(check, 800); });
  else setTimeout(check, 800);
})();
