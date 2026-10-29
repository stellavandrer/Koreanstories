# -*- coding: utf-8 -*-
"""Genere pdf/verbes-irreguliers-coreen.html, fiche gratuite imprimable.

Les sept familles et leur explication viennent de ks-conjugueur.js, le
moteur qui tourne dans le dictionnaire. Les formes sont CALCULEES par ce
meme moteur, pas recopiees : si le conjugueur evolue, la fiche suit.
Les verbes pieges (reguliers malgre une finale d'irregulier) sont
reperes par comparaison, pas listes a la main.
"""
import html
import json
import re
import subprocess
import sys

sys.path.insert(0, '.')
import _gen_fiche_nombres as N

SCRATCH = ('/private/tmp/claude-501/-Users-justinetilleul-Desktop-DesignbyStelva-Projet-perso-'
           'Koreanstories--claude-worktrees-peaceful-snyder-413864/'
           '292addcc-67b4-431a-952e-586c154bdafc/scratchpad/')
VERBES = json.load(open(SCRATCH + 'irr.json', encoding='utf-8'))
MAN = json.load(open('audio/manifest.json', encoding='utf-8'))

FAMILLES = dict(re.findall(r"'([^']+)':\s*'((?:[^'\\]|\\.)*)'",
                           re.search(r'var FAMILLES = \{(.*?)\n  \};',
                                     open('ks-conjugueur.js', encoding='utf-8').read(), re.S).group(1)))
ORDRE = ['ㅂ', 'ㄷ', 'ㅅ', '르', '으', 'ㄹ', 'ㅎ']

FIN = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
       'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']


def finale(syl):
    n = ord(syl) - 0xAC00
    return FIN[n % 28] if 0 <= n < 11172 else ''


# le verbe de la famille ㅎ n'est dans aucune page de conjugaison : on le
# prend dans l'explication meme de cette famille, et on le fait conjuguer
EXTRA = json.loads(subprocess.run(
    ['node', SCRATCH + 'irr2.js'], capture_output=True, text=True, cwd='.').stdout)


def par_famille(f):
    return [v for v in VERBES if v['famille'] == f]


def construire():
    out = ['<div class="section"><div class="section-body">'
           '<p class="nb-intro">Un verbe coréen « irrégulier » n\'est pas capricieux : '
           'il suit une autre règle, toujours la même, qui se déclenche quand une voyelle '
           'arrive derrière lui. Il y a sept familles, et les connaître dispense d\'apprendre '
           'chaque forme par cœur. Les formes ci-dessous sont calculées par le conjugueur du '
           'site, celui qui tourne dans le dictionnaire.</p></div></div>']

    for i, f in enumerate(ORDRE, start=1):
        lot = par_famille(f)
        if lot:
            ex = lot[0]
            formes = ex['formes'][:4]
        else:
            k = list(EXTRA)[0]
            ex = {'kr': k, 'fr': 'être ainsi', 'page': None}
            formes = EXTRA[k]['formes'][:4]
        lignes = [[('', lbl), (' class="kr"', fo + N.spk(fo)),
                   (' class="lire" data-lire="%s"' % fo, '')] for lbl, fo in formes]
        autres = ''
        if len(lot) > 1:
            autres = ('<p class="nb-intro"><b>Les autres de cette famille :</b> ' +
                      ' · '.join('<a href="../%s"><span class="kr">%s</span> %s</a>'
                                 % (v['page'], html.escape(v['kr']), html.escape(v['fr'].split('/')[0].strip()))
                                 for v in lot[1:]) + '</p>')
        corps = ('<p class="nb-intro"><b>La règle :</b> %s</p>'
                 '<p class="nb-intro"><b>L\'exemple :</b> <span class="kr">%s</span> — %s</p>%s'
                 % (html.escape(FAMILLES[f]).replace('&#x27;', "'"),
                    html.escape(ex['kr']), html.escape(ex['fr']),
                    N.table(['Forme', 'Ce que ça donne', 'Ça se lit'], lignes)) + autres)
        out.append(N.section(N.IC_CLE, '%d. La famille %s' % (i, f), corps))

    # les faux amis, reperes par calcul
    pieges = [v for v in VERBES if not v['famille']
              and finale(v['kr'][:-1][-1]) in ('ㅂ', 'ㄷ', 'ㅅ')]
    if pieges:
        lignes = [[(' class="kr"', v['kr'] + N.spk(v['kr'])), ('', v['fr']),
                   ('', 'finale ' + finale(v['kr'][:-1][-1])),
                   (' class="kr"', v['formes'][0][1] + N.spk(v['formes'][0][1]))]
                  for v in pieges]
        out.append(N.section(N.IC_BOITE, 'Ceux qui en ont l\'air et n\'en sont pas',
                             '<p class="nb-intro">La finale ne suffit pas à trancher : ces verbes '
                             'se terminent comme un irrégulier et se conjuguent pourtant normalement. '
                             'C\'est pour ça qu\'une liste vaut mieux qu\'une intuition.</p>'
                             + N.table(['Verbe', 'Sens', 'Finale', 'Présent poli'], lignes)))
    return ''.join(out)


if __name__ == '__main__':
    corps = construire()
    page = open('pdf/nombres-coreens.html', encoding='utf-8').read()
    rempl = [
        (r'<title>[^<]*</title>', '<title>Les verbes irréguliers coréens : les 7 familles · Korean Stories</title>'),
        (r'<meta name="description" content="[^"]*"',
         '<meta name="description" content="Les 7 familles de verbes irréguliers coréens (ㅂ, ㄷ, ㅅ, 르, 으, ㄹ, ㅎ), '
         'la règle de chacune, les formes calculées et les verbes qui en ont l\'air sans en être. '
         'Fiche gratuite à imprimer, avec l\'audio."'),
        (r'<link rel="canonical" href="[^"]*"',
         '<link rel="canonical" href="https://koreanstories.fr/pdf/verbes-irreguliers-coreen.html"'),
        (r'<meta property="og:title" content="[^"]*"',
         '<meta property="og:title" content="Les verbes irréguliers coréens : les 7 familles"'),
        (r'<meta property="og:url" content="[^"]*"',
         '<meta property="og:url" content="https://koreanstories.fr/pdf/verbes-irreguliers-coreen.html"'),
        (r'<div class="hero-badge">[^<]*</div>', '<div class="hero-badge">Conjugaison · Fiche gratuite</div>'),
        (r'<div class="hero-title">[^<]*</div>', '<div class="hero-title">Les verbes irréguliers</div>'),
        (r'<div class="hero-sub">[^<]*</div>', '<div class="hero-sub">Les 7 familles, et la règle de chacune</div>'),
    ]
    for pat, rep in rempl:
        page = re.sub(pat, rep.replace('\\', '\\\\'), page, count=1)
    page = page.replace('>Les nombres coréens<', '>Les verbes irréguliers<')
    page = page.replace('.tbl td.ex{font-size:12.5px;font-weight:400}',
                        '.tbl td.ex{font-size:12.5px;font-weight:400}\n'
                        '    .nb-intro a{color:#8a6d35;text-decoration:none;border-bottom:1px dotted rgba(201,169,110,.5)}')
    deb = page.index('<div class="wrap" id="pdf-content"')
    fin = page.index('<div class="pfoot">')
    page = (page[:deb] + '<div class="wrap" id="pdf-content" data-file="verbes-irreguliers-coreen">'
            + corps + '</div>\n' + page[fin:])
    open('pdf/verbes-irreguliers-coreen.html', 'w', encoding='utf-8').write(page)

    toutes = []
    for v in VERBES:
        if v['famille']:
            toutes += [f for _, f in v['formes'][:4]]
    sans = [f for f in set(toutes) if f not in MAN]
    print('pdf/verbes-irreguliers-coreen.html ecrit :', len(page), 'octets')
    print('  7 familles, %d verbes irreguliers du site, %d pieges reperes'
          % (sum(1 for v in VERBES if v['famille']),
             sum(1 for v in VERBES if not v['famille'] and finale(v['kr'][:-1][-1]) in ('ㅂ', 'ㄷ', 'ㅅ'))))
    print('  formes sans audio :', sans or 'aucune')
