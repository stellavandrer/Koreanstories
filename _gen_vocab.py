# -*- coding: utf-8 -*-
"""Genere une page publique par theme de vocabulaire.

Source : _vocab_themes.json (listes relues, cf. _vocab_themes.py). Chaque mot
a sa romanisation, sa traduction, souvent sa decomposition syllabique, et a
ete verifie present dans le manifeste audio. La lecture a la francaise est
calculee dans le navigateur par ks-lecture-fr.js.
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, '.')

SITE = 'https://koreanstories.fr/'
THEMES = json.load(open('_vocab_themes.json', encoding='utf-8'))
IDX = json.load(open('_index_phrases.json', encoding='utf-8'))
CSS = open('_gram_fiche.css', encoding='utf-8').read()

# slug, titre de page, chapeau : du francais, ecrit ici
PAGES = {
 'h2':  ('marche', 'Le vocabulaire du marché en coréen',
         "Fruits, légumes, viande : les mots des étals coréens, et les quelques phrases pour demander un prix et marchander un peu."),
 'h4':  ('cafe', 'Le vocabulaire du café en coréen',
         "La Corée compte plus de cafés par habitant que presque partout ailleurs. Les mots pour commander, préciser chaud ou glacé, et payer."),
 'h6':  ('metro', 'Le vocabulaire du métro en coréen',
         "Prendre un ticket, trouver sa ligne, descendre au bon arrêt : les mots des transports de Séoul."),
 'h3':  ('restaurant', 'Le vocabulaire du restaurant en coréen',
         "Commander, demander de l'eau, dire que c'est trop piquant : les mots qu'on emploie vraiment dans un restaurant coréen."),
 'h5':  ('konbini', 'Le vocabulaire de la supérette en coréen',
         "Le konbini coréen est ouvert jour et nuit et sert de dépannage à tout le pays. Voici de quoi y payer, demander un sac et compter sa monnaie."),
 'h7':  ('maison', 'Le vocabulaire de la maison en coréen',
         "Les pièces, les meubles, les objets du quotidien : de quoi décrire où l'on vit et ce qu'on y fait."),
 'h8':  ('noraebang', 'Le vocabulaire du noraebang en coréen',
         "Le karaoké coréen est une institution. Les mots pour choisir une chanson, se lancer, applaudir et commenter son score."),
 'h9':  ('medecin', 'Le vocabulaire du médecin en coréen',
         "Dire où on a mal, nommer un symptôme, comprendre une ordonnance : le vocabulaire qu'on espère ne pas avoir à employer, et qu'il vaut mieux connaître."),
 'h10': ('shopping', 'Le vocabulaire du shopping en coréen',
         "Essayer, demander une autre taille, comprendre une réduction : les mots des boutiques et des marchés."),
 'h11': ('fete', 'Le vocabulaire de la fête en coréen',
         "Inviter, offrir, féliciter : les mots des anniversaires, des fêtes traditionnelles et des soirées entre amis."),
 'fam': ('famille', 'La famille en coréen',
         "Le coréen ne dit pas « frère » mais précise qui parle : une fille et un garçon n'emploient pas le même mot pour leur aîné. Voici tous les termes, avec cette règle."),
 'col': ('couleurs', 'Les couleurs en coréen',
         "Les couleurs coréennes se disent de deux façons : la forme en 색 (la couleur elle-même) et la forme courte. Voici les deux."),
 'tps': ('temps', 'Le vocabulaire du temps en coréen',
         "Hier, demain, la semaine prochaine : les repères temporels du quotidien. Pour dire l'heure et la date, la fiche imprimable va plus loin."),
}

SPK = ('<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
       '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>')


def attr(t):
    return html.escape(t, quote=True)


def phrases_du_theme(mots, maxi=4):
    """Phrases du site employant un mot du theme, avec leur page d'origine.

    On n'accepte qu'un mot d'au moins deux syllabes : une syllabe seule
    remonterait n'importe quelle phrase, comme pour la grammaire.
    """
    longs = [m['kr'] for m in mots if len(m['kr']) >= 2]
    vus = []
    for ph in IDX:
        if not (12 <= len(ph) <= 46):
            continue
        n = sum(1 for k in longs if k in ph)
        if n:
            vus.append((n, ph))
    vus.sort(key=lambda x: (-x[0], abs(len(x[1]) - 26)))
    return [p for _, p in vus[:maxi]]


# Chaque theme de vocabulaire a souvent un article de blog qui le prolonge.
# Le lien va dans les deux sens : les articles portent deja un encart vers les
# pages ouvertes, les pages renvoient ici vers l'article. Trois themes (cafe,
# medecin, couleurs) n'ont pas d'article proche et n'ont donc pas de ligne :
# un lien force vaut moins que pas de lien.
ARTICLE = {
 'h2':  ('blog-ingredients-base-cuisine-coreenne.html',
         "Les 8 ingrédients de la cuisine coréenne"),
 'h3':  ('blog-cuisine-coreenne-debutants.html',
         "10 plats coréens à goûter, et comment les commander"),
 'h5':  ('blog-pyeonuijeom-convenience-store-coree.html',
         "Comment la supérette a conquis la Corée"),
 'h6':  ('blog-quartiers-seoul.html', "Les quartiers de Séoul, lequel visiter"),
 'h7':  ('blog-se-loger-en-coree.html', "Se loger en Corée : jeonse, wolse, goshiwon"),
 'h8':  ('blog-noraebang-karaoke-coreen.html', "À l'intérieur du karaoké coréen"),
 'h10': ('blog-shopping-vetements-coree.html',
         "Faire du shopping en Corée : essayer, marchander, se faire rembourser"),
 'h11': ('blog-seollal-chuseok-fetes-coreennes.html',
         "Seollal et Chuseok, les deux plus grandes fêtes"),
 'fam': ('blog-oppa-unnie-hyung-noona.html', "Oppa, unnie, hyung, noona : qui appeler comment"),
 'tps': ('blog-jours-mois-coreen.html', "Les jours et les mois, et les deux mois irréguliers"),
}

def page(code):
    slug, titre, chapeau = PAGES[code]
    d = THEMES[code]
    mots = d['mots']
    url = SITE + 'vocabulaire-' + slug + '.html'

    lignes = ''
    for m in mots:
        kr = html.escape(m['kr'])
        dec = ('<div class="vo-dec">%s</div>' % html.escape(m['decoupe'])) if m.get('decoupe') else ''
        lignes += (
            '<tr><td class="kr"><button class="vo-spk" onclick="dire(this,\'%s\')" '
            'aria-label="Écouter %s">%s</button>%s%s</td>'
            '<td>%s</td><td class="lire" data-lire="%s"></td><td>%s</td></tr>'
            % (attr(m['kr']), attr(m['kr']), SPK, kr, dec,
               html.escape(m.get('rom', '')), attr(m['kr']), html.escape(m['fr'])))

    ph = phrases_du_theme(mots)
    bloc_ph = ''
    if len(ph) >= 3:
        items = ''
        for p in ph:
            page_src, titre_src = IDX[p][0]
            items += ('<div class="gr-c"><button class="gr-c-spk" onclick="dire(this,\'%s\')" '
                      'aria-label="Écouter">%s</button><div class="gr-c-txt">'
                      '<div class="gr-c-kr">%s</div><div class="gr-c-lire" data-lire="%s"></div>'
                      '<a class="gr-c-src" href="%s">%s</a></div></div>'
                      % (attr(p), SPK, html.escape(p), attr(p), attr(page_src), html.escape(titre_src)))
        bloc_ph = ('<h2>Ces mots dans les phrases du site</h2>'
                   '<p class="gr-sous">Des phrases tirées des leçons et des histoires, '
                   'où ce vocabulaire est employé en situation.</p>'
                   '<div class="gr-corpus">%s</div>' % items)

    autres = ''.join(
        '<a href="vocabulaire-%s.html"><span class="kr">%s</span><span class="fr">%d mots</span></a>'
        % (PAGES[c][0], html.escape(THEMES[c]['label']), len(THEMES[c]['mots']))
        for c in PAGES if c != code)

    desc = ('%s %d mots avec l\'audio de chacun, la romanisation et la lecture à la française. '
            'Gratuit, sans compte.' % (chapeau, len(mots)))[:300]

    fil = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Korean Stories", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": "Vocabulaire coréen", "item": SITE + "vocabulaire-coreen.html"},
        {"@type": "ListItem", "position": 3, "name": d['label'], "item": url}]}

    art = ''
    if code in ARTICLE:
        a_url, a_titre = ARTICLE[code]
        art = '\n    <a href="%s">%s</a>' % (a_url, html.escape(a_titre))

    return TPL.format(
        titre=html.escape(titre), desc=attr(desc), url=url, slug=slug,
        label=html.escape(d['label']), chapeau=html.escape(chapeau),
        n=len(mots), lignes=lignes, phrases=bloc_ph, autres=autres, article=art,
        fil=json.dumps(fil, ensure_ascii=False), css=CSS)


TPL = '''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
<script src="ks-account-gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{titre} · Korean Stories</title>
  <meta name="description" content="{desc}"/>
  <link rel="canonical" href="{url}"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <meta property="og:title" content="{titre}"/>
  <meta property="og:description" content="{desc}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="Korean Stories"/>
  <meta property="og:url" content="{url}"/>
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <link rel="preload" href="fonts/ks-fonts-kr.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="fonts/ks-fonts-kr.css"></noscript>
  <style>
{css}
    .vo-t{{width:100%;border-collapse:collapse;font-size:.92rem;margin:.4rem 0 0}}
    .vo-t th,.vo-t td{{border-bottom:1px solid var(--bd);padding:.6rem .5rem;text-align:left;vertical-align:middle}}
    .vo-t th{{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-muted);font-weight:700}}
    .vo-t td.kr{{font-family:'Noto Sans KR',sans-serif;font-size:1.05rem;font-weight:600;color:var(--tx)}}
    .vo-t td.lire{{font-style:italic;color:var(--tx-muted);font-size:.84rem}}
    .vo-dec{{font-family:'Noto Sans KR',sans-serif;font-size:.7rem;color:var(--tx-muted);font-weight:400;margin-top:.1rem}}
    .vo-spk{{margin-right:7px;width:22px;height:22px;border-radius:50%;border:1px solid var(--bd);
      background:rgba(201,169,110,.1);color:#8a6d35;cursor:pointer;padding:0;vertical-align:middle;
      display:inline-flex;align-items:center;justify-content:center}}
    .vo-spk svg{{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}}
    .vo-spk.muet{{opacity:.3;cursor:default}}
    /* Un mot coreen coupe en deux n'est plus lisible : on l'empeche, et sur
       telephone on retire la romanisation officielle, qui fait doublon avec
       la lecture a la francaise et volait la place. */
    .vo-t td.kr{{white-space:nowrap}}
    @media(max-width:560px){{
      .vo-t th:nth-child(2),.vo-t td:nth-child(2){{display:none}}
      .vo-t th,.vo-t td{{padding:.55rem .35rem;font-size:.88rem}}
    }}
  </style>
  <script type="application/ld+json">{fil}</script>
</head>
<body>
<nav class="bar"><a class="back-btn" href="vocabulaire-coreen.html" aria-label="Tous les thèmes">&larr;</a><span class="bar-title">Vocabulaire</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div class="gr">
  <nav class="gr-fil"><a href="vocabulaire-coreen.html">Vocabulaire coréen</a> <span>›</span> {label}</nav>
  <h1><span class="sens">{titre}</span></h1>
  <p class="gr-chapeau">{chapeau}</p>
  <div class="gr-tags"><span class="gr-tag">{n} mots</span><span class="gr-tag">Audio</span><span class="gr-tag">Lecture à la française</span></div>

  <h2>Les mots</h2>
  <p class="gr-sous">Touche le haut-parleur pour entendre chaque mot. La troisième colonne donne la prononciation écrite à la française, pas la romanisation officielle, qui est pensée pour l'anglais.</p>
  <table class="vo-t"><thead><tr><th>Coréen</th><th>Romanisation</th><th>Ça se lit</th><th>Français</th></tr></thead><tbody>{lignes}</tbody></table>

  {phrases}

  <h2>Aller plus loin</h2>
  <div class="gr-liens">
    <a href="vocabulaire-coreen.html">Tous les thèmes de vocabulaire</a>
    <a href="dictionnaire.html">Le dictionnaire</a>
    <a href="grammaire-coreen.html">Les 53 règles de grammaire</a>
    <a href="conjugaison-coreen.html">Conjuguer un verbe</a>{article}
    <a href="cours.html">Le parcours complet<em class="gr-compte">compte gratuit</em></a>
  </div>

  <h2>Les autres thèmes</h2>
  <div class="gr-autres">{autres}</div>
</div></main></div>
<script src="ks.js"></script>
<script src="ks-lecture-fr.js"></script>
<script>
function dire(btn, texte){{ if (typeof window.speak === 'function') window.speak(texte, btn); }}
window.addEventListener('load', function(){{
  if (window.KSLectureFR) {{
    document.querySelectorAll('[data-lire]').forEach(function(e){{
      e.textContent = KSLectureFR.lire(e.getAttribute('data-lire'));
    }});
  }}
  /* Un bouton qui ne joue rien est pire que pas de bouton. */
  fetch('audio/manifest.json', {{cache:'no-cache'}}).then(function(r){{return r.ok?r.json():null;}}).then(function(m){{
    if(!m) return;
    document.querySelectorAll('[onclick^="dire"]').forEach(function(b){{
      var t=(b.getAttribute('onclick')||'').match(/dire\\(this,'([^']+)'\\)/);
      if(t && !m[t[1]]){{ b.classList.add('muet'); b.disabled=true; b.setAttribute('aria-hidden','true'); }}
    }});
  }});
}});
try{{var t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}
</script>
<script src="ks-menu.js" defer></script>
</body></html>
'''


if __name__ == '__main__':
    n = 0
    tailles = []
    for code in PAGES:
        if len(THEMES[code]['mots']) < 20:
            print('   ignore (moins de 20 mots) :', THEMES[code]['label']); continue
        h = page(code)
        nom = 'vocabulaire-%s.html' % PAGES[code][0]
        open(nom, 'w', encoding='utf-8').write(h)
        tailles.append(len(h)); n += 1
    print('%d pages ecrites, %d a %d octets' % (n, min(tailles), max(tailles)))


INDEX = '''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
<script src="ks-account-gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Vocabulaire coréen par thème : {n} mots à écouter · Korean Stories</title>
  <meta name="description" content="Le vocabulaire coréen du quotidien, rangé par situation : au restaurant, chez le médecin, à la maison, en boutique. {n} mots avec l'audio de chacun et la prononciation écrite à la française. Gratuit, sans compte."/>
  <link rel="canonical" href="https://koreanstories.fr/vocabulaire-coreen.html"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <meta property="og:title" content="Vocabulaire coréen par thème : {n} mots à écouter"/>
  <meta property="og:description" content="Le vocabulaire du quotidien rangé par situation, avec l'audio de chaque mot."/>
  <meta property="og:type" content="website"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="Korean Stories"/>
  <meta property="og:url" content="https://koreanstories.fr/vocabulaire-coreen.html"/>
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <link rel="preload" href="fonts/ks-fonts-kr.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="fonts/ks-fonts-kr.css"></noscript>
  <style>
{css}
  </style>
  <script type="application/ld+json">{ld}</script>
</head>
<body>
<nav class="bar"><button class="back-btn" aria-label="Retour" onclick="history.back()">&larr;</button><span class="bar-title">Vocabulaire</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div class="gr">
  <h1><span class="sens">Vocabulaire coréen par thème</span></h1>
  <p class="gr-chapeau">Le vocabulaire du quotidien, rangé par situation plutôt que par ordre alphabétique : ce qu'on dit au restaurant, chez le médecin, dans une boutique. Chaque mot se prononce d'un clic, et la prononciation est écrite à la française, pas en romanisation officielle.</p>
  <div class="gr-tags"><span class="gr-tag">{n} mots</span><span class="gr-tag">{t} thèmes</span><span class="gr-tag">Audio</span></div>

  <h2>Les thèmes</h2>
  <div class="gr-autres">{liens}</div>

  <h2>Aller plus loin</h2>
  <div class="gr-liens">
    <a href="grammaire-coreen.html">Les 53 règles de grammaire</a>
    <a href="conjugaison-coreen.html">Conjuguer un verbe</a>
    <a href="dictionnaire.html">Le dictionnaire</a>
    <a href="pdf/nombres-coreens.html">Les nombres, fiche à imprimer</a>
    <a href="pdf/heure-date-coreen.html">L'heure et la date, fiche à imprimer</a>
  </div>
</div></main></div>
<script src="ks.js"></script>
<script>try{{var t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}</script>
<script src="ks-menu.js" defer></script>
</body></html>
'''


def index():
    pub = [c for c in PAGES if len(THEMES[c]['mots']) >= 20]
    total = sum(len(THEMES[c]['mots']) for c in pub)
    liens = ''.join(
        '<a href="vocabulaire-%s.html"><span class="kr">%s</span><span class="fr">%d mots</span></a>'
        % (PAGES[c][0], html.escape(THEMES[c]['label']), len(THEMES[c]['mots'])) for c in pub)
    items = [{"@type": "ListItem", "position": i + 1, "name": THEMES[c]['label'],
              "url": SITE + 'vocabulaire-' + PAGES[c][0] + '.html'} for i, c in enumerate(pub)]
    ld = {"@context": "https://schema.org", "@type": "CollectionPage",
          "name": "Vocabulaire coréen par thème", "url": SITE + "vocabulaire-coreen.html",
          "mainEntity": {"@type": "ItemList", "numberOfItems": len(pub), "itemListElement": items}}
    return INDEX.format(n=total, t=len(pub), liens=liens, css=CSS,
                        ld=json.dumps(ld, ensure_ascii=False))


# Meme remarque que dans _gen_grammaire.py : index() est defini apres le premier bloc
# __main__, donc son ecriture se fait ici, en fin de fichier.
if __name__ == '__main__':
    open('vocabulaire-coreen.html', 'w', encoding='utf-8').write(index())
    print('   + index vocabulaire-coreen.html')
