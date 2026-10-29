# -*- coding: utf-8 -*-
"""Genere pdf/heure-date-coreen.html, fiche gratuite imprimable.

Tout vient de lecon42.html (heures, minutes, jours, mois) et de
ks-curriculum.js (serie sino, pour reperer les mois irreguliers par
comparaison). Aucune forme n'est saisie a la main.
"""
import json
import re
import sys

sys.path.insert(0, '.')
import _gen_fiche_nombres as N

L42 = open('lecon42.html', encoding='utf-8').read()
MAN = json.load(open('audio/manifest.json', encoding='utf-8'))

HEURES = re.findall(r'([가-힣]+)\s*시\((\d+)h\)', L42)
MINUTES = re.findall(r'([가-힣\s]+?)\s*분\((\d+)min\)', L42)
JOURS = re.findall(r"\{kor:'([^']+)',rom:'([^']+)',mean:'([^']+)',hanja:'([^']+)'\}", L42)
MOIS = re.findall(r"\{n:(\d+),kor:'([^']+)',rom:'([^']+)'\}", L42)

SINO = N.SINO
MOIS_SUFFIXE = None


def irregulier(n, kor):
    """Le mois n devrait s'ecrire <chiffre sino> + <suffixe>. Sinon il sort
    de la regle : c'est exactement ce qu'un apprenant doit reperer."""
    global MOIS_SUFFIXE
    if MOIS_SUFFIXE is None:
        # le suffixe se deduit du mois 1 : 일월 moins 일
        MOIS_SUFFIXE = MOIS[0][1][len(SINO[0]):]
    if n <= 10:
        attendu = SINO[n - 1] + MOIS_SUFFIXE
    else:
        attendu = SINO[9] + SINO[n - 11] + MOIS_SUFFIXE
    return kor != attendu, attendu


def construire():
    l1 = [[('', h + ' h'), (' class="kr"', k + ' ' + '시' + N.spk(k + ' 시')),
           (' class="lire" data-lire="%s"' % (k + ' 시'), '')]
          for k, h in HEURES]
    s1 = N.section(N.IC_NB, 'Les heures',
                   '<p class="nb-intro">L\'heure se dit avec les chiffres <b>natifs</b>, '
                   'suivis de 시. Les quatre premiers prennent leur forme courte.</p>'
                   + N.table(['Heure', 'En coréen', 'Ça se lit'], l1))

    l2 = [[('', m + ' min'), (' class="kr"', k.strip() + ' ' + '분' + N.spk(k.strip() + ' 분')),
           (' class="lire" data-lire="%s"' % (k.strip() + ' 분'), '')]
          for k, m in MINUTES]
    s2 = N.section(N.IC_NB, 'Les minutes',
                   '<p class="nb-intro">Les minutes, elles, se disent avec les chiffres '
                   '<b>sino-coréens</b>, suivis de 분. C\'est le mélange qui surprend : '
                   'dans une même heure, les deux systèmes cohabitent.</p>'
                   + N.table(['Minutes', 'En coréen', 'Ça se lit'], l2))

    l3 = [[('', j[2]), (' class="kr"', j[0] + N.spk(j[0])), ('', j[1]),
           (' class="lire" data-lire="%s"' % j[0], ''), (' class="hanja"', j[3])]
          for j in JOURS]
    s3 = N.section(N.IC_CLE, 'Les jours de la semaine',
                   '<p class="nb-intro">Chaque jour porte le nom d\'un élément, hérité du chinois, '
                   'et finit par 요일. Le caractère d\'origine est donné : il revient souvent.</p>'
                   + N.table(['Jour', 'En coréen', 'Romanisation', 'Ça se lit', 'Origine'], l3))

    l4, notes = [], []
    for n, kor, rom in MOIS:
        n = int(n)
        irr, attendu = irregulier(n, kor)
        l4.append([('', str(n)), (' class="kr"', kor + N.spk(kor)), ('', rom),
                   (' class="lire" data-lire="%s"' % kor, ''),
                   (' class="sys ' + ('natif' if irr else '') + '"', 'irrégulier' if irr else '')])
        if irr:
            notes.append((n, kor, attendu))
    note = ''
    if notes:
        note = ('<p class="nb-intro"><b>Les deux pièges :</b> ' +
                ' et '.join('le mois %d se dit <b class="kr">%s</b>, pas %s' % (n, k, a) for n, k, a in notes) +
                '. Tous les autres suivent la règle.</p>')
    s4 = N.section(N.IC_BOITE, 'Les mois',
                   '<p class="nb-intro">Le mois se dit avec le chiffre <b>sino-coréen</b> suivi de 월. '
                   'Deux mois seulement sortent de la règle.</p>' + note
                   + N.table(['Mois', 'En coréen', 'Romanisation', 'Ça se lit', ''], l4))
    return s1 + s2 + s3 + s4


if __name__ == '__main__':
    corps = construire()
    page = open('pdf/nombres-coreens.html', encoding='utf-8').read()
    page = page.replace('<title>Les nombres coréens : les deux systèmes, les compteurs · Korean Stories</title>',
                        "<title>Dire l'heure et la date en coréen · Korean Stories</title>")
    page = re.sub(r'<meta name="description" content="[^"]*"',
                  '<meta name="description" content="Dire l\'heure, les jours et les mois en coréen : '
                  'pourquoi les heures prennent les chiffres natifs et les minutes les sino-coréens, '
                  'les 7 jours, les 12 mois et leurs deux irréguliers. Fiche gratuite à imprimer, avec l\'audio."',
                  page, count=1)
    page = re.sub(r'<link rel="canonical" href="[^"]*"',
                  '<link rel="canonical" href="https://koreanstories.fr/pdf/heure-date-coreen.html"', page, count=1)
    page = re.sub(r'<meta property="og:title" content="[^"]*"',
                  '<meta property="og:title" content="Dire l\'heure et la date en coréen"', page, count=1)
    page = re.sub(r'<meta property="og:url" content="[^"]*"',
                  '<meta property="og:url" content="https://koreanstories.fr/pdf/heure-date-coreen.html"', page, count=1)
    page = page.replace('>Les nombres coréens<', ">L'heure et la date<")
    page = re.sub(r'<div class="hero-badge">[^<]*</div>',
                  '<div class="hero-badge">Temps · Fiche gratuite</div>', page, count=1)
    page = re.sub(r'<div class="hero-title">[^<]*</div>',
                  "<div class=\"hero-title\">Dire l'heure et la date</div>", page, count=1)
    page = re.sub(r'<div class="hero-sub">[^<]*</div>',
                  '<div class="hero-sub">Heures, minutes, jours et mois</div>', page, count=1)
    page = page.replace('.tbl td.sys.natif{color:#8a6d35}',
                        '.tbl td.sys.natif{color:#8a6d35}\n    .tbl td.hanja{font-size:16px;color:#8a6d35;text-align:center}')
    deb = page.index('<div class="wrap" id="pdf-content"')
    fin = page.index('<div class="pfoot">')
    page = (page[:deb] + '<div class="wrap" id="pdf-content" data-file="heure-date-coreen">'
            + corps + '</div>\n' + page[fin:])
    open('pdf/heure-date-coreen.html', 'w', encoding='utf-8').write(page)
    formes = [k + ' 시' for k, _ in HEURES] + [k.strip() + ' 분' for k, _ in MINUTES] \
             + [j[0] for j in JOURS] + [m[1] for m in MOIS]
    sans = [f for f in formes if f not in MAN]
    print('pdf/heure-date-coreen.html ecrit :', len(page), 'octets')
    print('  %d heures, %d minutes, %d jours, %d mois' % (len(HEURES), len(MINUTES), len(JOURS), len(MOIS)))
    print('  mois irreguliers detectes :', [(n, k) for n, k, a in
          [(int(n), k, irregulier(int(n), k)[1]) for n, k, r in MOIS] if irregulier(n, k)[0]])
    print('  formes sans audio :', len(sans), sans[:6])
