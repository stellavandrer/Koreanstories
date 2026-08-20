/* ═══════════════════════════════════════════════════════════════════
   ks-cadeau.js — la fiche PDF offerte à qui termine le Hangeul.
   ──────────────────────────────────────────────────────────────────
   Une seule fiche A1 parmi sept, choisie par l'apprenant, gardée pour
   toujours. Le choix se fait sur hangeul.html ; ressources.html
   déverrouille ensuite la fiche retenue.

   Le worker est seul juge : il exige un compte à l'adresse vérifiée et
   n'inscrit qu'un cadeau par uid (clé KV « cadeau:<uid> »). Rien ici
   n'est une sécurité — l'affichage ne fait que refléter sa réponse.

   ⚠️ hangeul.html et ressources.html sont PUBLIQUES : on tombe donc
   régulièrement sur quelqu'un sans compte. C'est le bon moment pour en
   proposer un, pas pour cacher le cadeau.

   Couleurs : ni --navy ni --gray. Le premier n'est pas redéfini en
   thème sombre (texte noir sur fond noir), le second plafonne à 2,5:1.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var WORKER = 'https://ks-premium.delicate-voice-1d19.workers.dev';

  /* Les sept fiches A1 du choix. Doit rester aligné sur FICHES_OFFERTES
     (premium-worker/index.js) — le worker refuse tout id absent de SA
     liste, donc une divergence se voit tout de suite à l'usage. */
  var FICHES = [
    { id: 'vocab-a1',      t: 'Vocabulaire A1',       s: '200 mots essentiels, par thème' },
    { id: 'expressions-a1',t: 'Expressions courantes', s: '50 phrases du quotidien' },
    { id: 'grammaire-a1',  t: 'Grammaire A1',          s: 'Particules, structure, présent' },
    { id: 'exister-avoir', t: '있어요 / 없어요',        s: 'Le verbe le plus rentable du coréen' },
    { id: 'conjugaison-a1',t: 'Conjugaison A1',        s: 'Présent, passé, futur, irréguliers' },
    { id: 'corps-a1',      t: 'Corps & émotions',      s: '80 mots, santé et ressenti' },
    { id: 'topik1-prep',   t: 'Préparation TOPIK I',   s: '400 mots et exercices types' }
  ];

  function aUnCompte() {
    try { return !!localStorage.getItem('ks_user'); } catch (e) { return false; }
  }

  /* Firebase est chargé paresseusement par ks-boot-sync.js : au moment où
     ce code tourne, `firebase` peut ne pas exister encore. On attend donc
     son apparition, puis le premier onAuthStateChanged — avec un plafond,
     pour ne jamais laisser un bouton tourner indéfiniment. */
  var _jeton = null;
  function jeton() {
    if (_jeton) return _jeton;
    _jeton = new Promise(function (resolve) {
      var fini = false, essais = 0;
      function rendre(v) { if (!fini) { fini = true; resolve(v); } }
      if (!aUnCompte()) return rendre(null);
      setTimeout(function () { rendre(null); }, 8000);
      (function attendre() {
        if (fini) return;
        try {
          if (global.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged(function (u) {
              if (!u) return rendre(null);
              u.getIdToken().then(rendre).catch(function () { rendre(null); });
            });
            return;
          }
        } catch (e) { return rendre(null); }
        if (++essais > 60) return rendre(null);
        setTimeout(attendre, 120);
      })();
    });
    return _jeton;
  }

  /* Ce que le worker sait de ce compte. Mémorisé : la page peut poser la
     question à deux endroits (bandeau + bouton de téléchargement). */
  var _etat = null;
  function etat() {
    if (_etat) return _etat;
    _etat = jeton().then(function (tok) {
      /* Deux absences de jeton très différentes : personne n'a de compte sur
         cet appareil (on propose d'en créer un), ou il y en a un mais on n'a
         pas pu le vérifier — Firebase lent, hors ligne, session expirée.
         Proposer « crée un compte » à quelqu'un qui en a déjà un fait douter
         du sien. */
      if (!tok) return { anonyme: !aUnCompte(), muet: aUnCompte(), fiche: null };
      return fetch(WORKER + '/fiche-offerte', { headers: { 'X-Firebase-Token': tok } })
        .then(function (r) { return r.json(); })
        .then(function (d) { return { anonyme: false, fiche: d && d.fiche ? d.fiche : null }; })
        .catch(function () { return { anonyme: false, fiche: null, panne: true }; });
    });
    return _etat;
  }

  function choisir(id) {
    return jeton().then(function (tok) {
      if (!tok) throw new Error('Reconnecte-toi pour choisir ta fiche.');
      return fetch(WORKER + '/fiche-offerte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Firebase-Token': tok },
        body: JSON.stringify({ file: id })
      });
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok || !d.success) throw new Error(d.message || 'Choix impossible pour le moment.');
        _etat = Promise.resolve({ anonyme: false, fiche: d.fiche });
        return d.fiche;
      });
    });
  }

  function titre(id) {
    for (var i = 0; i < FICHES.length; i++) if (FICHES[i].id === id) return FICHES[i].t;
    return id;
  }

  /* ── Rendu ──────────────────────────────────────────────────────── */
  var CSS = '\
.kcd{border-radius:20px;padding:22px 20px;margin-top:14px;\
  background:var(--goldbg,rgba(201,169,110,.1));\
  border:1.5px solid var(--goldbd,rgba(201,169,110,.3))}\
.kcd-l{font-size:.68rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;\
  color:#8B6B3D;margin-bottom:6px}\
[data-theme=dark] .kcd-l{color:#D5BA8A}\
.kcd h3{font-family:"Playfair Display",Georgia,serif;font-size:1.25rem;font-weight:800;\
  margin:0 0 6px;color:var(--t,#0D1823);line-height:1.25}\
.kcd p{font-size:.88rem;line-height:1.6;color:var(--t2,#475E78);margin:0 0 14px}\
.kcd-gr{display:grid;gap:8px;grid-template-columns:1fr 1fr}\
@media(max-width:560px){.kcd-gr{grid-template-columns:1fr}}\
.kcd-f{text-align:left;padding:12px 14px;border-radius:13px;cursor:pointer;\
  font-family:inherit;background:var(--surf,#fff);\
  border:1.5px solid var(--bd,#e6e6e6);transition:.16s}\
.kcd-f:hover:not(:disabled){border-color:#C9A96E;transform:translateY(-1px)}\
.kcd-f:disabled{opacity:.5;cursor:default}\
.kcd-f-t{font-size:.86rem;font-weight:700;color:var(--t,#0D1823)}\
.kcd-f-s{font-size:.75rem;color:var(--t2,#475E78);margin-top:2px;line-height:1.4}\
.kcd-note{font-size:.75rem;color:var(--t2,#475E78);margin:12px 0 0}\
.kcd-err{font-size:.8rem;font-weight:600;color:#b91c1c;margin:12px 0 0}\
[data-theme=dark] .kcd-err{color:#fca5a5}\
.kcd-cta{display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:11px 20px;\
  border-radius:12px;font-size:.86rem;font-weight:800;text-decoration:none;\
  background:linear-gradient(135deg,#e0c48a,#C9A96E);color:#3a2c12}\
.kcd-ok{font-family:"Noto Sans KR","Playfair Display",serif;font-size:1.4rem;\
  font-weight:700;color:var(--t,#0D1823);margin-bottom:4px}';

  function injecterCSS() {
    if (document.getElementById('kcd-css')) return;
    var s = document.createElement('style');
    s.id = 'kcd-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function vueChoisie(id, ici) {
    /* `ici` = on est déjà sur ressources.html. Un bouton qui renvoie vers la
       page qu'on regarde ne mène nulle part : on désigne la carte à la place. */
    return '<div class="kcd"><div class="kcd-l">Ta fiche offerte</div>' +
      '<div class="kcd-ok">' + ech(titre(id)) + '</div>' +
      (ici
        ? '<p>Elle est à toi, définitivement. Tu la retrouves dans la liste ' +
          'ci-dessous, marquée <strong>« Ta fiche offerte »</strong> — ' +
          'téléchargeable autant de fois que tu veux.</p>'
        : '<p>Elle est à toi, définitivement. Tu la retrouveras toujours dans ' +
          'tes ressources.</p>' +
          '<a class="kcd-cta" href="ressources.html">Ouvrir ma fiche →</a>') +
      '</div>';
  }

  function vueAnonyme() {
    return '<div class="kcd"><div class="kcd-l">Un cadeau t’attend</div>' +
      '<h3>Une fiche PDF, offerte</h3>' +
      '<p>Tu viens de finir le Hangeul — choisis une fiche A1 parmi sept, elle est à toi ' +
      'pour toujours. Il faut juste un compte pour qu’on sache à qui elle appartient. ' +
      'C’est gratuit et ça prend trente secondes.</p>' +
      '<a class="kcd-cta" href="signup.html">Créer mon compte →</a>' +
      '<p class="kcd-note">Déjà inscrite ? <a href="login.html">Connecte-toi</a>, ' +
      'ta fiche t’attend ici.</p></div>';
  }

  function vueIndispo() {
    return '<div class="kcd"><div class="kcd-l">Un cadeau t’attend</div>' +
      '<h3>Une fiche PDF, offerte</h3>' +
      '<p>Tu as fini le Hangeul — une fiche A1 t’attend. On n’arrive pas à ' +
      'vérifier ton compte à l’instant : recharge la page dans un moment, ' +
      'le cadeau ne s’en va pas.</p>' +
      '<p class="kcd-note">Si ça persiste, <a href="login.html">reconnecte-toi</a>.</p></div>';
  }

  function vueChoix() {
    var cartes = FICHES.map(function (f) {
      return '<button type="button" class="kcd-f" data-fiche="' + f.id + '">' +
        '<div class="kcd-f-t">' + ech(f.t) + '</div>' +
        '<div class="kcd-f-s">' + ech(f.s) + '</div></button>';
    }).join('');
    return '<div class="kcd"><div class="kcd-l">Un cadeau pour la suite</div>' +
      '<h3>Choisis ta fiche offerte</h3>' +
      '<p>Tu connais les 40 caractères. Voilà de quoi attaquer le A1 : ' +
      '<strong>une</strong> de ces sept fiches PDF, offerte, à garder.</p>' +
      '<div class="kcd-gr">' + cartes + '</div>' +
      '<p class="kcd-note">Un seul choix, et il est définitif — prends celle qui te ' +
      'manque vraiment.</p><p class="kcd-err" id="kcdErr" hidden></p></div>';
  }

  /* Monte le bloc dans `el`. Sûr à appeler plusieurs fois.
     opts.ici : le bloc est posé sur ressources.html même. */
  function monter(el, opts) {
    if (!el || el.dataset.kcd === '1') return;
    el.dataset.kcd = '1';
    injecterCSS();
    var ici = !!(opts && opts.ici);

    etat().then(function (e) {
      if (e.fiche) { el.innerHTML = vueChoisie(e.fiche, ici); return; }
      if (e.anonyme) { el.innerHTML = vueAnonyme(); return; }
      if (e.muet || e.panne) { el.innerHTML = vueIndispo(); return; }
      el.innerHTML = vueChoix();

      el.addEventListener('click', function (ev) {
        var b = ev.target.closest('button[data-fiche]');
        if (!b) return;
        var err = el.querySelector('#kcdErr');
        var tous = el.querySelectorAll('.kcd-f');
        for (var i = 0; i < tous.length; i++) tous[i].disabled = true;
        if (err) err.hidden = true;
        b.querySelector('.kcd-f-s').textContent = 'Un instant…';
        choisir(b.getAttribute('data-fiche')).then(function (id) {
          el.innerHTML = vueChoisie(id, ici);
        }).catch(function (e2) {
          for (var j = 0; j < tous.length; j++) tous[j].disabled = false;
          if (err) { err.hidden = false; err.textContent = e2.message; }
          /* Remettre le sous-titre : sinon la carte garde « Un instant… »
             et paraît bloquée alors qu'elle est de nouveau cliquable. */
          var f = FICHES.filter(function (x) { return x.id === b.getAttribute('data-fiche'); })[0];
          if (f) b.querySelector('.kcd-f-s').textContent = f.s;
        });
      });
    });
  }

  global.KSCadeau = {
    monter: monter, etat: etat, jeton: jeton, choisir: choisir,
    titre: titre, fiches: FICHES
  };

})(typeof window !== 'undefined' ? window : this);
