# -*- coding: utf-8 -*-
"""Fabrique les pages publiques de conjugaison, une par verbe.

Pourquoi ces pages existent : le concurrent francophone en publie 445 et
Korean Stories n'en avait aucune. Son conjugueur est pourtant meilleur
(il traite les 7 familles d'irréguliers et explique pourquoi) et son
audio est gratuit là où le leur est derrière l'abonnement.

Rien n'est écrit à la main ici : les formes viennent de ks-conjugueur.js
exécuté dans Node, les sens du noyau curé de ks-dictionary.js, et les
phrases d'exemple du manifeste audio, donc uniquement des phrases qui
existent déjà sur le site et qu'on peut entendre.

    python3 _gen_conjugaison.py            # écrit les pages
    python3 _gen_conjugaison.py --phrases  # liste l'audio à générer
"""
import json
import os
import re
import subprocess
import sys

VERBES = ['하다', '보다', '있다', '가다', '오다', '먹다', '없다', '자다', '입다', '타다',
          '읽다', '좋다', '받다', '마시다', '공부하다', '일하다', '사다', '만나다', '주다',
          '기다리다', '배우다', '가르치다', '좋아하다', '말하다',
          '모르다', '알다', '아프다', '살다', '듣다', '쓰다', '춥다', '만들다', '크다',
          '예쁘다', '어렵다', '쉽다', '덥다', '바쁘다', '부르다', '낫다']

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _romanisation import rr


def slug(mot):
    return re.sub(r'[^a-z]', '', rr(mot).lower())


def donnees():
    """Fait tourner les modules du site dans Node : une seule source de vérité."""
    js = '''
    const fs=require('fs');
    global.window={}; require('./ks-dictionary.js'); require('./ks-conjugueur.js');
    const D=global.window.KSDict.raw(), K=global.window.KSConj;
    const man=JSON.parse(fs.readFileSync('audio/manifest.json','utf8'));
    const out={};
    for (const v of %s) {
      const stem=v.slice(0,-1);
      /* Une phrase n'illustre le verbe que si elle en contient une forme
         conjuguee. Filtrer sur le radical seul ramasse n'importe quel mot
         qui le contient : 삼겹살 pour 살다, 사랑 pour 사다. */
      /* Deux garde-fous, appris a la dure :
         - une forme d'une seule syllabe (le tutoiement 사, 커) se retrouve
           dans n'importe quel mot : 사진, 커피. On les ecarte.
         - une forme doit commencer un 어절, sinon 들어 se trouve dans
           만들어 et 살 dans 삼겹살. On exige une espace avant, ou le debut. */
      const formes=K.conjuguer(v).map(f=>f[1]).concat([v]).filter(f=>f.length>=2);
      const fin=/[\s.!?,…]/;
      const porte=(p,f)=>{ let i=p.indexOf(f);
        while(i>=0){ const avant=(i===0||p[i-1]===' ');
          const apres=(i+f.length>=p.length)||fin.test(p[i+f.length]);
          if(avant&&apres) return true; i=p.indexOf(f,i+1); } return false; };
      const ex=Object.keys(man)
        .filter(p=>p.length>=10 && p.length<=42 && /[.!?]$/.test(p) && !/[A-Za-z_<>=]/.test(p)
                   && formes.some(f=>porte(p,f)))
        .sort((a,b)=>a.length-b.length).slice(0,2);
      out[v]={fr:(D[v]||{}).fr||'', pos:(D[v]||{}).pos||'', formes:K.conjuguer(v),
              irr:K.irregulier(v), exemples:ex};
    }
    process.stdout.write(JSON.stringify(out));
    ''' % json.dumps(VERBES, ensure_ascii=False)
    r = subprocess.run(['node', '-e', js], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit('node a échoué : ' + r.stderr[:400])
    return json.loads(r.stdout)


SPK = ('<button class="cj-spk" onclick="dire(this,\'%s\')" aria-label="Écouter %s">'
       '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
       '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>')

CSS = """    body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--tx)}
    .cj{max-width:720px;margin:0 auto;padding:1rem 1.1rem 2.5rem}
    h1{font-size:1.55rem;line-height:1.25;margin:.2rem 0 .5rem;color:var(--navy)}
    [data-theme="dark"] h1{color:#EDF2FA}
    h1 .kr{color:#C9A96E}
    h2{font-size:1.02rem;margin:2rem 0 .6rem;color:var(--navy)}
    [data-theme="dark"] h2{color:#EDF2FA}
    .cj-chapeau{color:var(--tx-muted);font-size:.93rem;line-height:1.65;margin:0 0 .4rem}
    .cj-tags{display:flex;flex-wrap:wrap;gap:6px;margin:.7rem 0 0}
    .cj-tag{font-size:.75rem;font-weight:700;padding:.2rem .6rem;border-radius:100px;
      background:rgba(201,169,110,.14);color:#8a6d35}
    [data-theme="dark"] .cj-tag{color:#C9A96E}
    .cj-irr{background:rgba(219,39,119,.07);border-left:3px solid #DB2777;border-radius:0 10px 10px 0;
      padding:.8rem 1rem;margin:1.1rem 0;font-size:.9rem;line-height:1.6}
    .cj-irr strong{color:#DB2777}
    [data-theme="dark"] .cj-irr strong{color:#f9a8d4}
    table.cj-t{width:100%;border-collapse:collapse;font-size:.92rem;margin:.5rem 0 0}
    .cj-t th,.cj-t td{border-bottom:1px solid var(--bd);padding:.62rem .5rem;text-align:left;vertical-align:middle}
    .cj-t th{font-size:.73rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-muted);font-weight:700}
    .cj-t td.f{font-weight:700;font-size:1.05rem;white-space:nowrap}
    .cj-t td.l{color:var(--tx-muted);font-size:.8rem;font-style:italic}
    .cj-spk{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
      background:rgba(201,169,110,.12);border:none;border-radius:50%;cursor:pointer;vertical-align:middle}
    .cj-spk:hover{background:rgba(201,169,110,.26)}
    .cj-spk svg{width:13px;height:13px;stroke:#8a6d35;fill:none;stroke-width:2}
    [data-theme="dark"] .cj-spk svg{stroke:#C9A96E}
    .cj-spk.muet{opacity:.25;cursor:default}
    .cj-ex{background:var(--surf);border:1px solid var(--bd);border-radius:12px;padding:.7rem .9rem;margin:.5rem 0}
    .cj-ex .k{font-weight:700;font-size:.98rem}
    .cj-ex .f{color:var(--tx-muted);font-size:.82rem;font-style:italic;margin-top:.15rem}
    .cj-liens{display:flex;flex-wrap:wrap;gap:8px;margin-top:1rem}
    .cj-liens a{font-size:.84rem;font-weight:600;padding:.55rem .9rem;border-radius:10px;
      border:1px solid var(--bd);text-decoration:none;color:var(--tx)}
    .cj-liens a:hover{border-color:#C9A96E}
    .cj-autres{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:7px;margin-top:.7rem}
    .cj-autres a{font-size:.83rem;padding:.45rem .6rem;border-radius:9px;border:1px solid var(--bd);
      text-decoration:none;color:var(--tx);text-align:center}
    .cj-autres a:hover{border-color:#C9A96E}
    .cj-autres .kr{font-weight:700;display:block}
    .cj-autres .fr{font-size:.72rem;color:var(--tx-muted)}
"""

JS = """
function dire(btn, texte){ if (typeof window.speak === 'function') window.speak(texte, btn); }
/* Un bouton qui ne joue rien est pire que pas de bouton : on grise ceux
   dont la forme n'a pas encore d'enregistrement, au lieu de laisser
   l'utilisateur cliquer dans le vide. */
fetch('audio/manifest.json').then(function(r){return r.ok?r.json():null;}).then(function(m){
  if(!m) return;
  document.querySelectorAll('.cj-spk').forEach(function(b){
    var t=(b.getAttribute('onclick')||'').match(/dire\\(this,'([^']+)'\\)/);
    if(t && !m[t[1]]){ b.classList.add('muet'); b.disabled=true; b.setAttribute('aria-hidden','true'); }
  });
});
/* Lecture à la française sous chaque forme : la romanisation officielle
   est pensée pour l'anglais et induit un francophone en erreur. */
window.addEventListener('load', function(){
  if(!window.KSLectureFR) return;
  document.querySelectorAll('[data-lire]').forEach(function(e){
    e.textContent = KSLectureFR.lire(e.getAttribute('data-lire'));
  });
});
"""


def page(mot, e, voisins):
    s = slug(mot)
    fr = e['fr']
    titre = 'Conjuguer %s (%s) en coréen' % (mot, fr.split(' / ')[0])
    irr = e['irr']
    nature = 'adjectif' if e['pos'] == 'adj' else 'verbe'

    chapeau = ('%s se conjugue comme ceci, à tous les temps et dans les trois registres que tu '
               'entendras vraiment. Chaque forme est calculée, pas recopiée, et se prononce : '
               'touche le haut-parleur.' % mot)

    h = []
    h.append('  <h1>Conjuguer <span class="kr">%s</span><br>(%s) en coréen</h1>' % (mot, fr))
    h.append('  <p class="cj-chapeau">%s</p>' % chapeau)
    h.append('  <div class="cj-tags"><span class="cj-tag">%s</span>' % nature)
    h.append('    <span class="cj-tag">%s</span>' % ('irrégulier en %s' % irr['famille'] if irr else 'régulier'))
    h.append('    <span class="cj-tag">%d formes</span></div>' % len(e['formes']))

    if irr:
        h.append('  <div class="cj-irr"><strong>Irrégulier, famille %s.</strong> %s</div>'
                 % (irr['famille'], irr['explication']))

    h.append('  <h2>Les formes</h2>')
    h.append('  <table class="cj-t">')
    h.append('    <tr><th>Quand l\'employer</th><th>Forme</th><th>Ça se lit</th></tr>')
    for libelle, forme in e['formes']:
        h.append('    <tr><td>%s</td><td class="f">%s %s</td><td class="l" data-lire="%s"></td></tr>'
                 % (libelle, forme, SPK % (forme, forme), forme))
    h.append('  </table>')

    if e['exemples']:
        h.append('  <h2>Dans une vraie phrase</h2>')
        for ex in e['exemples']:
            h.append('  <div class="cj-ex"><div class="k">%s %s</div>'
                     '<div class="f" data-lire="%s"></div></div>' % (ex, SPK % (ex, ex), ex))
        h.append('  <p class="cj-chapeau" style="margin-top:.5rem;font-size:.82rem">'
                 'Ces phrases viennent des leçons et des histoires du site : elles sont enregistrées, '
                 'pas inventées pour l\'occasion.</p>')

    h.append('  <h2>Pour aller plus loin</h2>')
    h.append('  <div class="cj-liens">')
    h.append('    <a href="dictionnaire.html">Chercher %s dans le dictionnaire</a>' % mot)
    if irr:
        h.append('    <a href="blog-verbes-irreguliers-coreens.html">Les verbes irréguliers expliqués</a>')
    h.append('    <a href="grammaire.html">Les 53 règles de grammaire</a>')
    h.append('    <a href="conjugaison-coreen.html">Tous les verbes</a>')
    h.append('  </div>')

    h.append('  <h2>D\'autres verbes</h2>')
    h.append('  <div class="cj-autres">')
    for v2, fr2 in voisins:
        h.append('    <a href="conjugaison-%s.html"><span class="kr">%s</span>'
                 '<span class="fr">%s</span></a>' % (slug(v2), v2, fr2.split(' / ')[0]))
    h.append('  </div>')

    corps = '\n'.join(h)

    ld = json.dumps({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://koreanstories.fr/"},
            {"@type": "ListItem", "position": 2, "name": "Conjugaison coréenne",
             "item": "https://koreanstories.fr/conjugaison-coreen.html"},
            {"@type": "ListItem", "position": 3, "name": titre,
             "item": "https://koreanstories.fr/conjugaison-%s.html" % s}]},
        ensure_ascii=False, indent=2)

    desc = ('%s (%s) : toutes les formes du présent, du passé, du futur et de l\'impératif, '
            'avec l\'audio de chacune et la lecture à la française.%s Gratuit, sans compte.'
            % (mot, fr, ' Verbe irrégulier de la famille %s, expliquée.' % irr['famille'] if irr else ''))

    return TEMPLATE.replace('__TITRE__', titre).replace('__DESC__', desc) \
                   .replace('__SLUG__', s).replace('__CORPS__', corps) \
                   .replace('__LD__', ld).replace('__CSS__', CSS).replace('__JS__', JS)


TEMPLATE = """<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
<script src="gate.js"></script>
<script src="ks-account-gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>__TITRE__ · Korean Stories</title>
  <meta name="description" content="__DESC__"/>
  <link rel="canonical" href="https://koreanstories.fr/conjugaison-__SLUG__.html"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <meta property="og:title" content="__TITRE__"/>
  <meta property="og:description" content="__DESC__"/>
  <meta property="og:type" content="article"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="Korean Stories"/>
  <meta property="og:url" content="https://koreanstories.fr/conjugaison-__SLUG__.html"/>
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <link rel="preload" href="fonts/ks-fonts-kr.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="fonts/ks-fonts-kr.css"></noscript>
  <style>
__CSS__  </style>
<link rel="icon" type="image/png" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<script type="application/ld+json">
__LD__
</script>
<script defer src="ks-boot-sync.js"></script>
</head>
<body>
<nav class="bar"><button class="back-btn" aria-label="Retour" onclick="history.back()">&larr;</button><span class="bar-title">Conjugaison</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div class="cj">
__CORPS__
</div></main></div>
<script src="ks.js"></script>
<script src="ks-lecture-fr.js"></script>
<script>
__JS__
try{const t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
</script>
  <script src="ks-menu.js" defer></script>
</body></html>
"""


def index(d):
    lignes = []
    irr = [(v, d[v]) for v in VERBES if d[v]['irr']]
    reg = [(v, d[v]) for v in VERBES if not d[v]['irr']]
    for titre, lot, intro in [
        ('Les verbes réguliers', reg,
         'Ceux qui suivent la règle. Une fois le mécanisme compris sur l\'un, il vaut pour tous.'),
        ('Les verbes irréguliers', irr,
         'Ceux qui changent de forme devant une voyelle. Chaque fiche dit à quelle famille le verbe '
         'appartient et pourquoi la forme change, au lieu de vous laisser apprendre la liste par cœur.')]:
        lignes.append('  <h2>%s <span style="font-weight:400;color:var(--tx-muted)">· %d</span></h2>'
                      % (titre, len(lot)))
        lignes.append('  <p class="cj-chapeau">%s</p>' % intro)
        lignes.append('  <div class="cj-autres">')
        for v, e in lot:
            lignes.append('    <a href="conjugaison-%s.html"><span class="kr">%s</span>'
                          '<span class="fr">%s</span></a>' % (slug(v), v, e['fr'].split(' / ')[0]))
        lignes.append('  </div>')
    corps = ('  <h1>Conjugaison coréenne :<br>%d verbes, forme par forme</h1>\n'
             '  <p class="cj-chapeau">Chaque fiche donne les six formes utiles du verbe, du tutoiement '
             'au registre formel, avec l\'audio de chacune et la lecture à la française. Les formes sont '
             'calculées par le conjugueur du site, celui-là même qui tourne dans le dictionnaire, et qui '
             'traite les sept familles d\'irréguliers.</p>\n' % len(VERBES)) + '\n'.join(lignes)
    ld = json.dumps({"@context": "https://schema.org", "@type": "CollectionPage",
                     "name": "Conjugaison coréenne", "inLanguage": "fr",
                     "url": "https://koreanstories.fr/conjugaison-coreen.html"},
                    ensure_ascii=False, indent=2)
    desc = ('Conjuguer %d verbes coréens, forme par forme : présent, passé, futur, impératif et '
            'tutoiement, avec l\'audio et la lecture à la française. Les sept familles '
            'd\'irréguliers expliquées. Gratuit, sans compte.' % len(VERBES))
    return TEMPLATE.replace('__TITRE__', 'Conjugaison coréenne : %d verbes' % len(VERBES)) \
                   .replace('__DESC__', desc).replace('__SLUG__', 'coreen') \
                   .replace('__CORPS__', corps).replace('__LD__', ld) \
                   .replace('__CSS__', CSS).replace('__JS__', JS) \
                   .replace('conjugaison-coreen.html"/>', 'conjugaison-coreen.html"/>')


def main():
    d = donnees()
    if '--phrases' in sys.argv:
        man = json.load(open('audio/manifest.json', encoding='utf-8'))
        manque = []
        for v in VERBES:
            for _, f in d[v]['formes']:
                if f not in man and f not in manque:
                    manque.append(f)
        print('\n'.join(manque))
        sys.stderr.write('%d formes sans audio\n' % len(manque))
        return
    n = 0
    for i, v in enumerate(VERBES):
        voisins = [(VERBES[(i + k) % len(VERBES)], d[VERBES[(i + k) % len(VERBES)]]['fr'])
                   for k in range(1, 9)]
        open('conjugaison-%s.html' % slug(v), 'w', encoding='utf-8').write(page(v, d[v], voisins))
        n += 1
    open('conjugaison-coreen.html', 'w', encoding='utf-8').write(index(d))
    print('%d fiches + 1 index ecrits' % n)


if __name__ == '__main__':
    main()
