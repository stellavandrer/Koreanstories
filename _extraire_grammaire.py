# -*- coding: utf-8 -*-
"""Extrait les 53 fiches de grammaire.html, telles qu'elles sont ecrites.

Aucun coreen n'est saisi ici : tout vient de grammaire.html, deja relu.
Sortie : une liste de dicts, un par fiche.

    python3 _extraire_grammaire.py        # inventaire
"""
import json
import re
import sys

SOURCE = 'grammaire.html'

BALISE = re.compile(r'<(/?)div\b[^>]*>', re.I)


def bornes(s, debut):
    """Fin de la <div> ouverte en `debut`, en comptant les div imbriquees.

    La derniere fiche n'est suivie d'aucun </main> : compter les balises est
    la seule facon fiable de savoir ou elle s'arrete.
    """
    niveau = 0
    for m in BALISE.finditer(s, debut):
        niveau += -1 if m.group(1) else 1
        if niveau == 0:
            return m.end()
    raise ValueError('div non refermee a %d' % debut)


def _blocs(corps, classe):
    """Tous les <div class="<classe>…"> de premier niveau, entiers."""
    out = []
    for m in re.finditer(r'<div class="' + classe + r'[^"]*"', corps):
        out.append(corps[m.start():bornes(corps, m.start())])
    return out


def decoupe(corps):
    """Separe le corps d'une fiche en ses parties nommees.

    Les fiches sont toutes batties sur le meme gabarit : formule,
    explication, exemples, astuce, erreur frequente, lien de lecon, quiz.
    On les reprend telles quelles, sans rien reecrire.
    """
    m = {}
    b = _blocs(corps, 'rule-box')
    m['formule'] = b[0] if b else ''
    m['notes'] = re.findall(r'<p class="rule-note">(.*?)</p>', corps, re.S)
    ex = _blocs(corps, 'ex-list')
    m['exemples'] = ex[0] if ex else ''
    me = _blocs(corps, 'memo')
    m['memo'] = me[0] if me else ''
    mi = _blocs(corps, 'mistake')
    m['mistake'] = mi[0] if mi else ''
    q = _blocs(corps, 'quiz-box')
    m['quiz'] = q[0] if q else ''
    # tout ce qui n'entre dans aucune case : on le garde pour ne rien perdre
    reste = corps
    for cle in ('formule', 'exemples', 'memo', 'mistake', 'quiz'):
        if m[cle]:
            reste = reste.replace(m[cle], '')
    for n in m['notes']:
        reste = reste.replace('<p class="rule-note">' + n + '</p>', '')
    reste = re.sub(r'<a class="gcard-lesson".*?</a>', '', reste, flags=re.S)
    m['reste'] = reste.strip()
    return m


def fiches():
    s = open(SOURCE, encoding='utf-8').read()
    out = []
    deb = [m.start() for m in re.finditer(r'<div class="gcard"[^>]*data-id="g\d+"', s)]
    for d in deb:
        bloc = s[d:bornes(s, d)]
        f = {
            'id':       re.search(r'data-id="(g\d+)"', bloc).group(1),
            'cat':      re.search(r'data-cat="([^"]*)"', bloc).group(1),
            'keywords': re.search(r'data-keywords="([^"]*)"', bloc).group(1),
            'bloc':     bloc,
        }
        m = re.search(r'<div class="gcard-level">(.*?)</div>', bloc, re.S)
        f['sous_titre'] = m.group(1).strip() if m else ''
        m = re.search(r'<div class="gcard-title">(.*?)<span class="mastered-badge"', bloc, re.S)
        f['titre'] = m.group(1).strip() if m else ''
        m = re.search(r'<div class="gcard-formula">(.*?)</div>', bloc, re.S)
        f['formule'] = m.group(1).strip() if m else ''
        m = re.search(r'<div class="gcard-peek">(.*?)</div>', bloc, re.S)
        f['peek'] = m.group(1).strip() if m else ''
        m = re.search(r'<span class="gcard-tag tag-\w+">(\w+)</span>', bloc)
        f['niveau'] = m.group(1) if m else ''
        j = bloc.index('<div class="gcard-content">')
        interieur = bloc[j:bornes(bloc, j)]
        f['corps'] = interieur[interieur.index('>') + 1:interieur.rindex('</div>')].strip()
        m = re.search(r'<a class="gcard-lesson" href="([^"]+)"', bloc)
        f['lecon'] = m.group(1) if m else None
        m = re.search(r'<span>Approfondir\s*:\s*<strong>(.*?)</strong>', bloc, re.S)
        f['lecon_titre'] = m.group(1).strip() if m else None
        f['morceaux'] = decoupe(f['corps'])
        f['exemples'] = re.findall(r"speakKorean\(this,'([^']+)'\)", bloc)
        f['a_quiz'] = 'class="quiz-box"' in bloc
        out.append(f)
    return out


if __name__ == '__main__':
    fs = fiches()
    print(len(fs), 'fiches')
    par_niveau = {}
    for f in fs:
        par_niveau[f['niveau']] = par_niveau.get(f['niveau'], 0) + 1
    print('par niveau :', par_niveau)
    manque = [f['id'] for f in fs if not f['titre'] or not f['corps']]
    print('incompletes :', manque or 'aucune')
    print('sans quiz   :', [f['id'] for f in fs if not f['a_quiz']] or 'aucune')
    print('sans lecon  :', [f['id'] for f in fs if not f['lecon']] or 'aucune')
    for f in fs[:4]:
        print('  ', f['id'], '|', f['niveau'], '|', f['titre'][:46], '|', len(f['corps']), 'o |', len(f['exemples']), 'ex')
