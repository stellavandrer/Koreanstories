/* ═══════════════════════════════════════════════════════════════════
   ks-notifications.js — Notifications de rappel quotidien (PWA).
   ──────────────────────────────────────────────────────────────────
   Sans backend / sans push server : on déclenche localement quand
   l'utilisateur ouvre la page. Si la permission est accordée ET
   qu'il n'a pas pratiqué depuis 24h ET qu'on est passé après l'heure
   choisie, on tire une notification via le Service Worker.

   ks_notif_enabled  : 'yes' / 'no' / null
   ks_notif_hour     : 0-23 (heure choisie pour le rappel)
   ks_notif_last_sent: YYYY-MM-DD du dernier rappel envoyé
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function ls(k){ try { return localStorage.getItem(k); } catch(e) { return null; } }
  function setLs(k,v){ try { localStorage.setItem(k,v); } catch(e) {} }

  /* ── État ────────────────────────────────────────────────────────── */
  function isSupported(){
    return ('Notification' in window) && ('serviceWorker' in navigator);
  }
  function isEnabled(){ return ls('ks_notif_enabled') === 'yes'; }
  function getHour(){
    var h = parseInt(ls('ks_notif_hour') || '19', 10);
    return (isNaN(h) || h < 0 || h > 23) ? 19 : h;
  }
  function getPermission(){
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  /* ── Permission ──────────────────────────────────────────────────── */
  function requestPermission(){
    if (!isSupported()) return Promise.resolve('unsupported');
    return Notification.requestPermission();
  }

  /* ── Réglages ────────────────────────────────────────────────────── */
  function setEnabled(yes){
    setLs('ks_notif_enabled', yes ? 'yes' : 'no');
  }
  function setHour(h){
    var v = parseInt(h, 10);
    if (isNaN(v) || v < 0 || v > 23) return;
    setLs('ks_notif_hour', String(v));
  }

  /* ── Logique de déclenchement ───────────────────────────────────── */
  /* On affiche un rappel si :
     - permission accordée
     - notifs activées dans les réglages
     - on est passé l'heure choisie aujourd'hui
     - on n'a pas déjà envoyé de rappel aujourd'hui
     - dernière pratique > 18h (sinon ça serait stressant) */
  function shouldFireToday(){
    if (!isSupported()) return false;
    if (Notification.permission !== 'granted') return false;
    if (!isEnabled()) return false;

    var now = new Date();
    var todayStr = now.toISOString().slice(0,10);

    /* Pas plus d'une notif par jour */
    if (ls('ks_notif_last_sent') === todayStr) return false;

    /* Heure dépassée ? */
    if (now.getHours() < getHour()) return false;

    /* Dernière pratique récente → pas de rappel inutile */
    var last = ls('ks_lastplay');
    if (last === todayStr) return false; /* déjà pratiqué aujourd'hui */
    if (last) {
      var diffH = (now - new Date(last)) / 3600000;
      if (diffH < 18) return false;
    }
    return true;
  }

  function fireReminder(){
    var todayStr = new Date().toISOString().slice(0,10);
    setLs('ks_notif_last_sent', todayStr);

    var streak = parseInt(ls('ks_streak') || '0', 10) || 0;
    var titles = [
      '안녕하세요 ! Prêt·e pour ta dose de coréen ?',
      'Le coréen t\'attend 📚',
      'Petite session du soir ?',
      '15 min de coréen = grand pas'
    ];
    var bodies = streak > 0
      ? ['Continue ton streak de '+streak+' jours !', 'Ne casse pas la chaîne — un freeze sera consommé sinon.', 'Reviens valider ta journée.']
      : ['Commence une nouvelle série dès aujourd\'hui.', 'Une petite leçon suffit pour relancer la dynamique.', 'C\'est le moment idéal pour reprendre.'];
    var t = titles[Math.floor(Math.random() * titles.length)];
    var b = bodies[Math.floor(Math.random() * bodies.length)];

    var options = {
      body: b,
      icon: 'Logo/Logo - KoreanStories_logo_4x4_bleu.png',
      badge: 'Logo/Logo - KoreanStories_logo_4x4_bleu.png',
      tag: 'ks-daily-reminder',
      requireInteraction: false,
      data: { url: '/app.html' }
    };

    /* Préférer le Service Worker (plus fiable pour PWA installée) */
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (reg) {
        try { reg.showNotification(t, options); }
        catch (e) {
          /* Fallback */
          try { new Notification(t, options); } catch (_) {}
        }
      }).catch(function () {
        try { new Notification(t, options); } catch (_) {}
      });
    } else {
      try { new Notification(t, options); } catch (e) {}
    }
  }

  /* Vérifie au chargement de l'app */
  function checkAndFire(){
    if (shouldFireToday()) fireReminder();
  }

  /* Auto-init : check au load, puis toutes les 15 min si l'utilisateur
     laisse la page ouverte (l'heure peut passer pendant l'usage) */
  function init(){
    setTimeout(checkAndFire, 4000); /* attend que la page se stabilise */
    setInterval(checkAndFire, 15 * 60 * 1000);
  }
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);

  /* ── API publique ─────────────────────────────────────────────── */
  global.KSNotifications = {
    isSupported: isSupported,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    getHour: getHour,
    setHour: setHour,
    getPermission: getPermission,
    requestPermission: requestPermission,
    fireTestNow: fireReminder,
    check: checkAndFire
  };

})(window);
