# -*- coding: utf-8 -*-
"""Genere pdf/nombres-coreens.html, fiche gratuite imprimable.

Aucun coreen n'est saisi : les deux series viennent de ks-curriculum.js,
les compteurs et les formes courtes de lecon44.html, les romanisations
natives de lecon6b.html, les autres de _romanisation.py. Chaque forme a
ete verifiee presente dans le manifeste audio.
"""
import json
import re
import sys

sys.path.insert(0, '.')
from _romanisation import rr

CUR = open('ks-curriculum.js', encoding='utf-8').read()
L6B = open('lecon6b.html', encoding='utf-8').read()
L44 = open('lecon44.html', encoding='utf-8').read()
MAN = json.load(open('audio/manifest.json', encoding='utf-8'))


def serie(key):
    m = re.search(r'\{[^{}]*"' + key + r'"[^{}]*\}', CUR)
    return json.loads(m.group(0))['sub'].split(',')[0].split('·')


SINO = serie('ks_a05')
NATIF = serie('ks_a06')
VAL_SINO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 1000, 10000]

ROM_NATIF = dict(re.findall(r'>([\uac00-\ud7a3]{1,4})</[^>]+>\s*<[^>]*>([a-z][a-z-]{1,14})<', L6B))
# l'apostrophe est echappee dans les chaines JS (« d\'eau ») : si on
# s'arrete au premier guillemet simple, l'exemple est coupe en plein mot.
COMPTEURS = [(a, b, c, d.replace("\\'", "'"))
             for a, b, c, d in re.findall(
                 r"kor:'([^']+)',rom:'([^']+)',used:'([^']+)',ex:'((?:[^'\\]|\\.)*)'", L44)]

# Les formes courtes devant compteur. On ne devine pas : on releve les
# correspondances la ou le site les ECRIT avec leur traduction, dans les
# exemples de lecon44 (« 사과 세 개 = trois pommes ») et dans la liste des
# heures de lecon42 (« 네 시(4h) »). Une forme non attestee reste vide.
L42 = open('lecon42.html', encoding='utf-8').read()
FR_NB = {'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5, 'six': 6}
_vus = {}
for _cpt, _r, _u, _ex in COMPTEURS:
    for _seg in _ex.split('·'):
        _m = re.search(r'([\uac00-\ud7a3]+)\s+' + re.escape(_cpt) + r'\s*=\s*([A-Za-zÀ-ÿ]+)', _seg)
        if _m:
            _n = FR_NB.get(_m.group(2).lower())
            if _n:
                _vus.setdefault(_n, {})
                _vus[_n][_m.group(1)] = _vus[_n].get(_m.group(1), 0) + 1
for _forme, _h in re.findall(r'([\uac00-\ud7a3]+)\s*시\((\d+)h\)', L42):
    _n = int(_h)
    _vus.setdefault(_n, {})
    _vus[_n][_forme] = _vus[_n].get(_forme, 0) + 1
# pour chaque nombre, la forme la plus souvent attestee
COURTES = {n: max(v, key=v.get) for n, v in _vus.items()}


def romanise(k):
    return ROM_NATIF.get(k) or rr(k).lower()


def spk(txt):
    return ('<button class="nb-spk" onclick="dire(this,\'%s\')" aria-label="Écouter %s">'
            '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
            '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>'
            % (txt, txt))


def table(entetes, lignes):
    th = ''.join('<th>%s</th>' % e for e in entetes)
    tr = ''.join('<tr>%s</tr>' % ''.join('<td%s>%s</td>' % c for c in l) for l in lignes)
    return '<table class="tbl"><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (th, tr)


def section(icone, titre, corps):
    return ('<div class="section"><div class="section-head">'
            '<div class="section-icon"><svg viewBox="0 0 24 24">%s</svg></div>'
            '<div class="section-title">%s</div></div>'
            '<div class="section-body">%s</div></div>' % (icone, titre, corps))


IC_NB = '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>'
IC_CLE = '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3"/>'
IC_BOITE = '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'


def construire():
    # 1. sino
    l = [[('', str(v)), (' class="kr"', k + spk(k)), ('', romanise(k)),
          (' class="lire" data-lire="%s"' % k, '')]
         for v, k in zip(VAL_SINO, SINO)]
    s_sino = section(IC_NB, 'Les chiffres sino-coréens',
                     '<p class="nb-intro">Ceux d\'origine chinoise. Ils servent pour l\'argent, les dates, '
                     'les numéros de téléphone, les minutes et tout ce qui dépasse la centaine.</p>'
                     + table(['Nombre', 'Hangeul', 'Romanisation', 'Ça se lit'], l))

    # 2. natifs, avec la forme courte devant un compteur
    l2 = []
    for v, k in enumerate(NATIF, start=1):
        c = COURTES.get(v, '')
        if c == k:
            c = ''          # la forme ne change pas a partir de cinq
        l2.append([('', str(v)), (' class="kr"', k + spk(k)), ('', romanise(k)),
                   (' class="lire" data-lire="%s"' % k, ''),
                   (' class="kr"', c or '<span class="inchange">inchangé</span>')])
    s_natif = section(IC_NB, 'Les chiffres natifs coréens',
                      '<p class="nb-intro">Les coréens d\'origine. Ils servent pour l\'âge, l\'heure, '
                      'et pour compter les choses avec un compteur. Les quatre premiers changent de forme '
                      'devant un compteur : c\'est le piège le plus fréquent.</p>'
                      + table(['Nombre', 'Hangeul', 'Romanisation', 'Ça se lit', 'Devant un compteur'], l2))

    # 3. quand utiliser lequel
    usages = [('L\'âge', 'natif'), ('L\'heure (les heures)', 'natif'),
              ('Les minutes', 'sino'), ('L\'argent, les prix', 'sino'),
              ('Les dates, les mois', 'sino'), ('Un numéro de téléphone', 'sino'),
              ('Compter des objets', 'natif'), ('Au-delà de 100', 'sino')]
    l3 = [[('', u), (' class="sys ' + s + '"', 'natif' if s == 'natif' else 'sino-coréen')] for u, s in usages]
    s_quand = section(IC_CLE, 'Lequel employer, et quand',
                      '<p class="nb-intro">La question que tout le monde se pose. Voici la réponse, cas par cas.</p>'
                      + table(['Ce que tu comptes', 'Le système'], l3))

    # 4. compteurs
    l4 = [[(' class="kr"', c[0] + spk(c[0])), ('', c[1]), ('', c[2]),
           (' class="kr ex"', c[3])] for c in COMPTEURS]
    s_cpt = section(IC_BOITE, 'Les 8 compteurs à connaître',
                    '<p class="nb-intro">En coréen, on ne compte pas « trois pommes » mais « pomme trois [objet] ». '
                    'Le compteur se place après le nombre, et il change selon ce qu\'on compte.</p>'
                    + table(['Compteur', 'Romanisation', 'Pour quoi', 'Exemple'], l4))

    return s_sino + s_natif + s_quand + s_cpt


if __name__ == '__main__':
    corps = construire()
    gabarit = open('pdf/hangeul-chart.html', encoding='utf-8').read()
    # head : on garde tout, on change les metadonnees
    page = gabarit
    page = page.replace('<title>Tableau Hangeul Complet · Korean Stories</title>',
                        '<title>Les nombres coréens : les deux systèmes, les compteurs · Korean Stories</title>')
    page = re.sub(r'<meta name="description" content="[^"]*"',
                  '<meta name="description" content="Les deux systèmes de numération coréens, sino-coréen et natif, '
                  'quand employer l\'un ou l\'autre, et les 8 compteurs. Fiche gratuite à imprimer, avec l\'audio de chaque forme."',
                  page, count=1)
    page = re.sub(r'<link rel="canonical" href="[^"]*"',
                  '<link rel="canonical" href="https://koreanstories.fr/pdf/nombres-coreens.html"',
                  page, count=1)
    page = re.sub(r'<meta property="og:title" content="[^"]*"',
                  '<meta property="og:title" content="Les nombres coréens : les deux systèmes, les compteurs"',
                  page, count=1)
    page = re.sub(r'<meta property="og:url" content="[^"]*"',
                  '<meta property="og:url" content="https://koreanstories.fr/pdf/nombres-coreens.html"',
                  page, count=1)
    page = page.replace('>Tableau Hangeul Complet<', '>Les nombres coréens<')
    page = re.sub(r'<div class="hero-badge">[^<]*</div>',
                  '<div class="hero-badge">Nombres · Fiche gratuite</div>', page, count=1)
    page = re.sub(r'<div class="hero-title">[^<]*</div>',
                  '<div class="hero-title">Les nombres coréens</div>', page, count=1)
    page = re.sub(r'<div class="hero-sub">[^<]*</div>',
                  '<div class="hero-sub">Deux systèmes, leurs usages, et les 8 compteurs</div>', page, count=1)
    # corps
    deb = page.index('<div class="wrap" id="pdf-content"')
    fin = page.index('<div class="pfoot">')
    page = (page[:deb] + '<div class="wrap" id="pdf-content" data-file="nombres-coreens">'
            + corps + '</div>\n' + page[fin:])
    # styles propres a la fiche + lecture a la francaise
    page = page.replace('</head>', '''<style>
    .nb-intro{font-size:12.5px;color:#475E78;line-height:1.6;margin:0 0 10px}
    .nb-spk{margin-left:6px;width:22px;height:22px;border-radius:50%;border:1px solid #e3e8f0;
      background:rgba(201,169,110,.1);color:#8a6d35;cursor:pointer;padding:0;vertical-align:middle;
      display:inline-flex;align-items:center;justify-content:center}
    .nb-spk svg{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
    .nb-spk.muet{opacity:.3;cursor:default}
    .tbl td.lire{font-style:italic;color:#475E78;font-size:12.5px}
    .tbl td.ex{font-size:12.5px;font-weight:400}
    /* Le sujet de la fiche, ce sont les caracteres : ils dominent. */
    .tbl td.kr{font-size:17px;font-weight:600}
    .tbl td.kr.ex{font-size:12.5px;font-weight:400}
    .tbl td.sys{font-weight:700}
    .tbl td.sys.natif{color:#8a6d35}
    .tbl td.sys.sino{color:#2f6fb5}
    .inchange{font-size:12px;color:#8FA5BE;font-style:italic}
    @media print{.nb-spk{display:none}}
  </style>
  <script src="../ks-lecture-fr.js" defer></script>
</head>''')
    page = page.replace('<script src="../ks.js"></script>', '''<script src="../ks.js"></script>
<script>
function dire(btn, texte){ if (typeof window.speak === 'function') window.speak(texte, btn); }
window.addEventListener('load', function(){
  if (window.KSLectureFR) {
    document.querySelectorAll('[data-lire]').forEach(function(e){
      e.textContent = KSLectureFR.lire(e.getAttribute('data-lire'));
    });
  }
  /* Un bouton qui ne joue rien est pire que pas de bouton. */
  fetch('../audio/manifest.json', {cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(m){
    if(!m) return;
    document.querySelectorAll('.nb-spk').forEach(function(b){
      var t=(b.getAttribute('onclick')||'').match(/dire\\(this,'([^']+)'\\)/);
      if(t && !m[t[1]]){ b.classList.add('muet'); b.disabled=true; }
    });
  });
});
</script>''')
    open('pdf/nombres-coreens.html', 'w', encoding='utf-8').write(page)
    sansaudio = [k for k in SINO + NATIF + [c[0] for c in COMPTEURS] if k not in MAN]
    print('pdf/nombres-coreens.html ecrit :', len(page), 'octets')
    print('  %d sino, %d natifs, %d compteurs, %d formes courtes'
          % (len(SINO), len(NATIF), len(COMPTEURS), sum(1 for n, f in COURTES.items() if n <= len(NATIF) and f != NATIF[n-1])))
    print('  formes courtes attestees :', {n: COURTES[n] for n in sorted(COURTES)})
    print('  formes sans audio :', sansaudio or 'aucune')
