/* ═══════════════════════════════════════════════════════════════════
   ks-reviews-feed.js — Les vrais avis, sur la page d'accueil.
   ──────────────────────────────────────────────────────────────────
   Demande de Stella (2026-08-06) : « on ne voit pas bien les avis ».
   Ils n'existaient en effet que sur avis.html, une page ou personne ne
   va spontanement. Ce module les remonte la ou ils comptent.

   ⚠️ REGLE ABSOLUE DE CE FICHIER : il n'affiche QUE des avis reels,
   ecrits par de vraies personnes et approuves a la main. S'il n'y en a
   aucun, il ne fait STRICTEMENT RIEN et la page garde son texte
   honnete (« les tout premiers avis sont en train de s'ecrire »).
   Aucun avis d'exemple, aucun placeholder, aucune moyenne inventee.
   Le 2026-08-05 on a retire trois faux temoignages de cette page ; ce
   fichier ne doit jamais servir a les faire revenir par la fenetre.

   ── Pourquoi l'API REST et pas le SDK Firebase ──
   Charger firebase-app + firebase-firestore pour afficher trois avis
   couterait 151 Ko a chaque visiteur de la page d'accueil, y compris
   quand il n'y a aucun avis a montrer. Une seule requete REST fait le
   meme travail en ~2 Ko de code et zero dependance. La cle API Firebase
   Web est publique par conception (elle identifie le projet, elle ne
   l'ouvre pas — la securite vient des regles Firestore, voir
   firestore.rules) : la meme cle est deja en clair dans avis.html,
   login.html, signup.html, profil.html, classement.html et reglages.html.

   ── Pourquoi pas de orderBy dans la requete ──
   Deux egalites + un tri sur un troisieme champ = index composite
   obligatoire cote Firestore. Cet index n'a jamais existe, ce qui a
   rendu la page d'avis muette pendant des semaines. Des egalites seules
   sont servies sans aucun index a creer : on trie donc par date en JS.
   Meme choix que dans avis.html — ne pas y remettre un orderBy sans
   creer l'index (voir firestore.indexes.json).

   Balises attendues dans la page hote :
     #ksHomeReviews   conteneur vide ou le bloc est injecte
     #ksReviewsTeaser paragraphe « premiers avis » a masquer s'il y a des avis
     #ksReviewsCta    lien dont le libelle change s'il y a des avis
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PROJECT = 'korean-stories-68377';
  var KEY = 'AIzaSyDvFbaoXmB23ayTNRk1-npQ9-s8inwCJao';
  var URL = 'https://firestore.googleapis.com/v1/projects/' + PROJECT +
            '/databases/(default)/documents:runQuery?key=' + KEY;

  var host = document.getElementById('ksHomeReviews');
  if (!host) return;

  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
                'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function stars(n) {
    var full = '<svg viewBox="0 0 24 24" class="krv-s on"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>';
    var empty = '<svg viewBox="0 0 24 24" class="krv-s"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>';
    var h = '';
    for (var i = 1; i <= 5; i++) h += (i <= n ? full : empty);
    return h;
  }

  /* Les valeurs REST sont typees : {stringValue}, {integerValue} (une
     chaine !), {booleanValue}, {timestampValue} (ISO 8601). */
  function readDoc(fields) {
    if (!fields) return null;
    var name = fields.name && fields.name.stringValue;
    var rating = parseInt((fields.rating && fields.rating.integerValue) || '0', 10);
    var comment = (fields.comment && fields.comment.stringValue) || '';
    var when = 0;
    try {
      var ts = fields.createdAt && fields.createdAt.timestampValue;
      if (ts) when = new Date(ts).getTime() || 0;
    } catch (e) {}
    if (!name || !(rating >= 1 && rating <= 5)) return null;
    return { name: name, rating: rating, comment: comment.trim(), when: when };
  }

  function injectCSS() {
    if (document.getElementById('ks-krv-css')) return;
    var s = document.createElement('style');
    s.id = 'ks-krv-css';
    s.textContent = [
      '.krv{margin:0 0 26px}',
      '.krv-head{display:flex;align-items:center;justify-content:center;gap:14px;',
        'flex-wrap:wrap;margin-bottom:22px}',
      '.krv-avg{font-family:"Playfair Display",Georgia,serif;font-weight:800;',
        'font-size:42px;line-height:1;color:var(--t)}',
      '.krv-meta{text-align:left}',
      '.krv-row{display:flex;gap:2px;margin-bottom:3px}',
      '.krv-s{width:17px;height:17px;fill:none;stroke:var(--gold);stroke-width:1.6}',
      '.krv-s.on{fill:var(--gold);stroke:var(--gold)}',
      '.krv-count{font-size:13px;color:var(--t2)}',
      '.krv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}',
      '@media(max-width:820px){.krv-grid{grid-template-columns:1fr}',
        '.krv-avg{font-size:36px}}',
      '.krv-card{background:var(--surf);border:1px solid var(--bd);',
        'border-radius:var(--rl,22px);padding:24px 22px;text-align:left;',
        'display:flex;flex-direction:column}',
      '.krv-card .krv-row{margin-bottom:11px}',
      '.krv-quote{font-size:14.5px;line-height:1.65;color:var(--t2);',
        'flex:1;margin:0 0 14px}',
      '.krv-by{font-size:13px;font-weight:700;color:var(--t)}',
      /* --t2 et non --t3 : sur fond blanc, --t3 ne donne que 2,53:1, sous
         le minimum lisible (4,5:1). La date reste secondaire par sa taille
         et sa graisse, pas en devenant illisible. Meme piege que la passe
         de contraste deja faite ailleurs sur le site. */
      '.krv-when{font-size:12px;color:var(--t2);font-weight:400}'
    ].join('');
    document.head.appendChild(s);
  }

  function render(list, count, avg) {
    injectCSS();

    var head =
      '<div class="krv-head">' +
        '<div class="krv-avg">' + avg.toFixed(1).replace('.', ',') + '</div>' +
        '<div class="krv-meta">' +
          '<div class="krv-row">' + stars(Math.round(avg)) + '</div>' +
          '<div class="krv-count">' + count + (count > 1 ? ' avis' : ' avis') +
            ' de personnes qui apprennent ici</div>' +
        '</div>' +
      '</div>';

    var grid = '';
    if (list.length) {
      grid = '<div class="krv-grid">';
      list.forEach(function (r) {
        var when = '';
        if (r.when) {
          var d = new Date(r.when);
          when = MONTHS[d.getMonth()] + ' ' + d.getFullYear();
        }
        grid +=
          '<div class="krv-card fw">' +
            '<div class="krv-row">' + stars(r.rating) + '</div>' +
            '<p class="krv-quote">' + esc(r.comment) + '</p>' +
            '<div class="krv-by">' + esc(r.name) +
              (when ? ' <span class="krv-when">— ' + when + '</span>' : '') +
            '</div>' +
          '</div>';
      });
      grid += '</div>';
    }

    host.innerHTML = '<div class="krv">' + head + grid + '</div>';

    /* Le texte « les tout premiers avis sont en train de s'ecrire » n'est
       plus vrai des qu'il y en a un : on l'efface, et le bouton cesse de
       proposer « le premier avis ». */
    var teaser = document.getElementById('ksReviewsTeaser');
    if (teaser) teaser.style.display = 'none';
    var cta = document.getElementById('ksReviewsCta');
    if (cta) cta.textContent = 'Lire tous les avis, ou laisser le tien →';

    /* Les cartes arrivent apres le scan initial de l'animation d'entree :
       sans ca elles resteraient invisibles (.fw = fade when visible). */
    if (typeof window.ksRevealScan === 'function') {
      try { window.ksRevealScan(); } catch (e) {}
    }
  }

  function load() {
    var body = {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'public' }, op: 'EQUAL', value: { booleanValue: true } } },
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'approved' } } }
            ]
          }
        },
        limit: 100
      }
    };

    fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (!rows || !rows.length) return;

        var all = [];
        rows.forEach(function (row) {
          if (!row || !row.document) return;   /* ligne vide = 0 resultat */
          var d = readDoc(row.document.fields);
          if (d) all.push(d);
        });
        if (!all.length) return;

        /* La moyenne compte TOUS les avis, y compris ceux sans texte —
           une note est une note. Mais seuls ceux qui ont ecrit quelque
           chose sont affiches en carte : « 5 etoiles, aucun commentaire »
           ne convainc personne et remplit la grille pour rien. */
        var total = 0;
        all.forEach(function (r) { total += r.rating; });
        var avg = total / all.length;

        var quoted = all
          .filter(function (r) { return r.comment.length >= 25; })
          .sort(function (a, b) { return b.when - a.when; })
          .slice(0, 3);

        render(quoted, all.length, avg);
      })
      .catch(function () {
        /* Silence volontaire : un avis qui ne charge pas ne doit jamais
           degrader la page d'accueil. Elle garde son texte d'origine. */
      });
  }

  /* Rien d'urgent ici : on laisse la page finir de s'afficher d'abord. */
  if (document.readyState === 'complete') setTimeout(load, 300);
  else window.addEventListener('load', function () { setTimeout(load, 300); });
})();
