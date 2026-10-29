# -*- coding: utf-8 -*-
"""Genere une page par regle de grammaire, a partir de grammaire.html.

Rien n'est reecrit : formule, explication, exemples, astuce, erreur
frequente et quiz sont repris tels quels de la fiche d'origine, deja
relue. S'y ajoutent, quand le corpus en fournit, des phrases REELLES du
site ou la regle est employee, avec leur audio et la page ou les
rencontrer, et la lecture a la francaise de chaque exemple.

    python3 _gen_grammaire.py           # ecrit grammaire-<slug>.html
    python3 _gen_grammaire.py --essai   # n'ecrit rien, affiche le bilan
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _extraire_grammaire as E
from _motifs_grammaire import exemples
from _slug_grammaire import slug

SITE = 'https://koreanstories.fr/'
NIVEAUX = {'A1': 'debutant', 'A2': 'elementaire', 'B1': 'intermediaire', 'B2': 'avance'}
CSS_EXTRA = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              '_gram_fiche.css'), encoding='utf-8').read()


def sanstags(h):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h)).strip()


def attr(t):
    return html.escape(t, quote=True)


def chapeau(f):
    """Phrase d'introduction : l'explication propre a la regle, pas un moule."""
    for n in f['morceaux']['notes']:
        t = sanstags(n)
        if len(t) > 40:
            return t
    # Quatre fiches n'ont pas de texte d'explication : on compose alors le
    # chapeau avec la forme, son sens et sa formule, sans recopier le titre.
    titre = sanstags(f['titre'])
    forme = titre.split(':')[0].strip()
    sens = titre.split(':')[-1].strip().strip('«» ')
    base = re.sub(r'^\s*Formule\s*', '', sanstags(f['formule'])).strip()
    if base:
        return '%s sert à dire « %s ». Sa formule : %s' % (forme, sens, base)
    return '%s, en coréen, sert à dire « %s ».' % (forme, sens)


def lien_lecon(f):
    if not f['lecon']:
        return ''
    titre = sanstags(f['lecon_titre'] or 'la leçon du parcours')
    return ('<a class="gr-lecon" href="%s"><span>La leçon qui l\'enseigne : <strong>%s</strong>'
            '</span><span class="fl">&rarr;</span></a>' % (attr(f['lecon']), html.escape(titre)))


def bloc_corpus(phrases, idx):
    if not phrases:
        return ''
    out = ['<h2>Cette tournure dans les phrases du site</h2>',
           '<p class="gr-sous">Des phrases tirées des leçons et des histoires, '
           'où la règle est à l\'œuvre. Touche le haut-parleur pour les entendre.</p>',
           '<div class="gr-corpus">']
    for p in phrases:
        page, titre = idx[p][0]
        out.append(
            '<div class="gr-c"><button class="gr-c-spk" onclick="speakKorean(this,%s)" '
            'aria-label="Écouter">%s</button>'
            '<div class="gr-c-txt"><div class="gr-c-kr">%s</div>'
            '<div class="gr-c-lire" data-lire="%s"></div>'
            '<a class="gr-c-src" href="%s">%s</a></div></div>'
            % ("'" + p.replace("'", "\\'") + "'", SPK, html.escape(p), attr(p),
               attr(page), html.escape(titre)))
    out.append('</div>')
    return '\n'.join(out)


SPK = ('<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
       '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>')


def voisines(f, toutes, slugs):
    m = [g for g in toutes if g['niveau'] == f['niveau'] and g['id'] != f['id']]
    if len(m) < 3:
        m = [g for g in toutes if g['id'] != f['id']]
    m = m[:8]
    liens = ''.join(
        '<a href="grammaire-%s.html"><span class="kr">%s</span><span class="fr">%s</span></a>'
        % (slugs[g['id']], html.escape(sanstags(g['titre']).split(':')[0].strip()),
           html.escape(sanstags(g['titre']).split(':')[-1].strip()))
        for g in m)
    return liens


def page(f, toutes, slugs, idx, corpus):
    s = slugs[f['id']]
    url = SITE + 'grammaire-' + s + '.html'
    forme = sanstags(f['titre']).split(':')[0].strip()
    sens = sanstags(f['titre']).split(':')[-1].strip()
    chap = chapeau(f)
    desc = ('%s en coréen (%s) : la formule, des exemples lus à la française, '
            'et un mini-quiz. %s' % (forme, f['niveau'], chap))[:300]
    mo = f['morceaux']

    notes = ''.join('<p class="rule-note">%s</p>' % n for n in mo['notes'])
    corps = []
    if mo['formule']:
        corps.append(mo['formule'])
    if notes:
        corps.append('<h2>Comment ça marche</h2>' + notes)
    if mo['exemples']:
        corps.append('<h2>Des exemples</h2>' + mo['exemples'])
    if mo['memo']:
        corps.append('<h2>Pour s\'en souvenir</h2>' + mo['memo'])
    if mo['mistake']:
        corps.append('<h2>L\'erreur fréquente</h2>' + mo['mistake'])
    bc = bloc_corpus(corpus.get(f['id'], []), idx)
    if bc:
        corps.append(bc)
    if mo['quiz']:
        corps.append('<h2>Teste-toi</h2>' + mo['quiz'])

    fil = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Korean Stories", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": "Grammaire coréenne", "item": SITE + "grammaire-coreen.html"},
        {"@type": "ListItem", "position": 3, "name": forme, "item": url}]}

    return TEMPLATE.format(
        titre=html.escape('%s : %s en coréen' % (forme, sens)),
        desc=attr(desc), url=url, slug=s,
        forme=html.escape(forme), sens=html.escape(sens),
        chapeau=html.escape(chap),
        niveau=f['niveau'], cat=html.escape(f['cat'].rsplit(' ', 1)[0]),
        corps='\n  '.join(corps),
        lecon=lien_lecon(f),
        voisines=voisines(f, toutes, slugs),
        fil=json.dumps(fil, ensure_ascii=False),
        css=CSS_EXTRA)


TEMPLATE = '''<!DOCTYPE html>
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
  </style>
  <script type="application/ld+json">{fil}</script>
</head>
<body>
<nav class="bar"><a class="back-btn" href="grammaire-coreen.html" aria-label="Toutes les règles">&larr;</a><span class="bar-title">Grammaire</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div class="gr">
  <nav class="gr-fil"><a href="grammaire-coreen.html">Grammaire coréenne</a> <span>›</span> {niveau}</nav>
  <h1><span class="kr">{forme}</span><br><span class="sens">{sens}</span></h1>
  <p class="gr-chapeau">{chapeau}</p>
  <div class="gr-tags"><span class="gr-tag">{niveau}</span><span class="gr-tag">{cat}</span></div>

  {corps}

  <h2>Aller plus loin</h2>
  {lecon}
  <div class="gr-liens">
    <a href="grammaire-coreen.html">Les 53 règles de grammaire</a>
    <a href="conjugaison-coreen.html">Conjuguer un verbe</a>
    <a href="dictionnaire.html">Le dictionnaire</a>
    <a href="cours.html">Le parcours complet</a>
  </div>

  <h2>Les autres règles du niveau {niveau}</h2>
  <div class="gr-autres">{voisines}</div>
</div></main></div>
<script src="ks.js"></script>
<script src="ks-lecture-fr.js"></script>
<script>
function speakKorean(el, text){{
  /* Regle produit : zero voix robotique. Pas de repli speechSynthesis. */
  if (typeof window.speak === 'function') window.speak(text, el);
}}
/* Progression partagee avec grammaire.html : meme cle, meme identifiant. */
function quizAnswer(btn, result, quizId, cardId){{
  btn.parentElement.querySelectorAll('.quiz-opt').forEach(function(o){{ o.disabled = true; }});
  btn.classList.add(result);
  var fb = document.getElementById('fb-' + quizId);
  if (result === 'ok') {{
    fb.textContent = 'Exactement.';
    fb.className = 'quiz-fb ok';
    try {{
      var m = JSON.parse(localStorage.getItem('ks_grammar_mastered') || '{{}}');
      m[cardId] = true;
      localStorage.setItem('ks_grammar_mastered', JSON.stringify(m));
    }} catch(e) {{}}
  }} else {{
    fb.textContent = "Ce n'est pas tout à fait ça. Relis la règle et réessaie.";
    fb.className = 'quiz-fb ko';
    document.getElementById('retry-' + quizId).style.display = 'inline-block';
  }}
}}
function resetQuiz(quizId){{
  var box = document.getElementById(quizId);
  box.querySelectorAll('.quiz-opt').forEach(function(o){{ o.disabled = false; o.className = 'quiz-opt'; }});
  box.querySelector('.quiz-fb').className = 'quiz-fb';
  box.querySelector('.quiz-fb').textContent = '';
  document.getElementById('retry-' + quizId).style.display = 'none';
}}
/* Lecture a la francaise : la romanisation officielle est pensee pour
   l'anglais et piege un francophone. */
window.addEventListener('load', function(){{
  if (!window.KSLectureFR) return;
  document.querySelectorAll('[data-lire]').forEach(function(e){{
    e.textContent = KSLectureFR.lire(e.getAttribute('data-lire'));
  }});
}});
/* Un bouton qui ne joue rien est pire que pas de bouton. */
fetch('audio/manifest.json', {{cache:'no-cache'}}).then(function(r){{return r.ok?r.json():null;}}).then(function(m){{
  if (!m) return;
  document.querySelectorAll('[onclick^="speakKorean"]').forEach(function(b){{
    var t = (b.getAttribute('onclick')||'').match(/speakKorean\\(this,'([^']+)'\\)/);
    if (t && !m[t[1]]) {{ b.classList.add('muet'); b.disabled = true; b.setAttribute('aria-hidden','true'); }}
  }});
}});
try{{var t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}
</script>
<script src="ks-menu.js" defer></script>
</body></html>
'''


def main():
    essai = '--essai' in sys.argv
    toutes = E.fiches()
    slugs = {f['id']: slug(f['titre']) for f in toutes}
    idx = json.load(open('_index_phrases.json', encoding='utf-8'))
    phrases = list(idx.keys())
    corpus = {f['id']: exemples(f['titre'], f['cat'], phrases) for f in toutes}
    ecrites, tailles = [], []
    for f in toutes:
        h = page(f, toutes, slugs, idx, corpus)
        nom = 'grammaire-%s.html' % slugs[f['id']]
        tailles.append(len(h))
        if not essai:
            open(nom, 'w', encoding='utf-8').write(h)
        ecrites.append(nom)
    avec = sum(1 for v in corpus.values() if v)
    print('%d pages %s' % (len(ecrites), 'simulees' if essai else 'ecrites'))
    print('   taille : %d a %d octets (mediane %d)'
          % (min(tailles), max(tailles), sorted(tailles)[len(tailles)//2]))
    print('   %d avec des phrases du site, %d sans' % (avec, len(toutes) - avec))
    return ecrites, slugs


if __name__ == '__main__':
    main()


INDEX_TPL = '''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
<script src="ks-account-gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Grammaire coréenne : les 53 règles, une par une · Korean Stories</title>
  <meta name="description" content="Les 53 règles de grammaire coréenne du niveau A1 au B2, chacune sur sa page : la formule, des exemples lus à la française, des phrases tirées des leçons, et un mini-quiz. Gratuit, sans compte."/>
  <link rel="canonical" href="https://koreanstories.fr/grammaire-coreen.html"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <meta property="og:title" content="Grammaire coréenne : les 53 règles, une par une"/>
  <meta property="og:description" content="Les 53 règles de grammaire coréenne du A1 au B2, chacune sur sa page, avec exemples audio et mini-quiz."/>
  <meta property="og:type" content="website"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="Korean Stories"/>
  <meta property="og:url" content="https://koreanstories.fr/grammaire-coreen.html"/>
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
<nav class="bar"><button class="back-btn" aria-label="Retour" onclick="history.back()">&larr;</button><span class="bar-title">Grammaire</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div class="gr">
  <h1>Grammaire coréenne :<br>les 53 règles, une par une</h1>
  <p class="gr-chapeau">Chaque règle a sa page : la formule, ce qu'elle change dans la phrase, des exemples lus à la française, et un mini-quiz. Trente-deux d'entre elles sont illustrées par des phrases tirées des leçons et des histoires du site, avec leur audio.</p>
{sections}
  <h2>Aller plus loin</h2>
  <div class="gr-liens">
    <a href="conjugaison-coreen.html">Conjuguer un verbe</a>
    <a href="dictionnaire.html">Le dictionnaire</a>
    <a href="cours.html">Le parcours complet</a>
    <a href="hangeul.html">Apprendre le hangeul</a>
  </div>
</div></main></div>
<script src="ks.js"></script>
<script>try{{var t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}</script>
<script src="ks-menu.js" defer></script>
</body></html>
'''

INTRO = {
    'A1': "Les fondations : ce qui permet de faire une phrase correcte dès les premiers jours.",
    'A2': "De quoi relier les idées, situer dans le temps et exprimer une intention.",
    'B1': "Les nuances : la cause, le rapport, l'impression, le décor d'une situation.",
    'B2': "Les tournures qu'on lit dans la presse et qu'on entend dans les séries.",
}


def index(toutes, slugs, corpus):
    sections = []
    items = []
    n = 0
    for niv in ('A1', 'A2', 'B1', 'B2'):
        lot = [f for f in toutes if f['niveau'] == niv]
        if not lot:
            continue
        liens = ''
        for f in lot:
            n += 1
            forme = sanstags(f['titre']).split(':')[0].strip()
            sens = sanstags(f['titre']).split(':')[-1].strip()
            url = 'grammaire-%s.html' % slugs[f['id']]
            items.append({"@type": "ListItem", "position": n, "name": forme, "url": SITE + url})
            liens += ('<a href="%s"><span class="kr">%s</span><span class="fr">%s</span></a>'
                      % (attr(url), html.escape(forme), html.escape(sens)))
        sections.append('  <h2>Niveau %s <span style="font-weight:400;color:var(--tx-muted)">· %d règles</span></h2>\n'
                        '  <p class="gr-sous">%s</p>\n  <div class="gr-autres">%s</div>'
                        % (niv, len(lot), INTRO[niv], liens))
    ld = {"@context": "https://schema.org", "@type": "CollectionPage",
          "name": "Grammaire coréenne : les 53 règles",
          "url": SITE + "grammaire-coreen.html",
          "mainEntity": {"@type": "ItemList", "numberOfItems": n, "itemListElement": items}}
    return INDEX_TPL.format(css=CSS_EXTRA, ld=json.dumps(ld, ensure_ascii=False),
                            sections='\n'.join(sections))
