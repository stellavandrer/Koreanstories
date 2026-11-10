# -*- coding: utf-8 -*-
"""Interroge le dictionnaire officiel de l'Institut national de la langue
coreenne (krdict), d'ou Naver tire son contenu grammatical, et enregistre
les SENS OFFICIELS de chaque tournure. On ne copie rien dans le site : ces
donnees servent a verifier ce que j'ecris ensuite en francais."""
import html as H
import json
import os
import re
import subprocess
import sys
import time

sys.path.insert(0, '.')
import _extraire_grammaire as E

KR = re.compile(r'[가-힣㄰-㆏]')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
BASE = ('https://krdict.korean.go.kr/eng/dicMarinerSearch/search'
        '?nation=eng&nationCode=6&ParaWordNo=&mainSearchWord=')


def variantes(titre):
    """Formes a interroger, tirees du titre de la fiche."""
    t = re.sub(r'<[^>]+>', '', titre).split(':')[0]
    t = t.replace('·', '|').replace('/', '|').replace('&', '|')
    t = re.sub(r'\bvs\b|\bet\b', '|', t)
    out = []
    for part in t.split('|'):
        p = part.strip()
        if not p or not KR.search(p):
            continue
        avec = p.replace('(', '').replace(')', '')          # -(으)면 -> -으면
        sans = re.sub(r'\([^)]*\)', '', p).strip()          # -(으)면 -> -면
        for v in (avec, sans):
            v = v.strip()
            if v and v not in out:
                out.append(v)
    return out


def nettoie(x):
    x = re.sub(r'<[^>]+>', ' ', x)
    return re.sub(r'\s+', ' ', H.unescape(x)).strip()


def interroge(mot):
    from urllib.parse import quote
    r = subprocess.run(['curl', '-s', '--max-time', '25', '-A', UA, BASE + quote(mot)],
                       capture_output=True, text=True)
    return r.stdout


def entrees(page, mot):
    """Les sens de l'entree dont le mot-vedette est EXACTEMENT `mot`."""
    res = []
    for dl in re.findall(r'<dl>(.*?)</dl>', page, re.S):
        m = re.search(r'class="word_type1_17"[^>]*>(.*?)</span>', dl, re.S)
        if not m:
            continue
        tete = nettoie(m.group(1))
        if tete != mot:
            continue
        pos = ''
        mp = re.search(r'class="word_att_type1"[^>]*>(.*?)</span>\s*</span>', dl, re.S)
        if mp:
            pos = nettoie(mp.group(1))
        sens = []
        for dd in re.findall(r'<dd[^>]*>(.*?)</dd>', dl, re.S):
            txt = nettoie(dd)
            if not txt or len(txt) < 12:
                continue
            sens.append(txt)
        if sens:
            res.append({'tete': tete, 'pos': pos, 'sens': sens})
    return res


def main():
    fiches = E.fiches()
    out = {}
    for n, f in enumerate(fiches, 1):
        titre = re.sub(r'<[^>]+>', '', f['titre'])
        bloc = {'titre': titre, 'niveau': f['niveau'], 'formes': {}}
        for v in variantes(f['titre']):
            page = interroge(v)
            ent = entrees(page, v)
            bloc['formes'][v] = ent
            time.sleep(1.1)
        out[f['id']] = bloc
        trouve = sum(len(e['sens']) for fs in bloc['formes'].values() for e in fs)
        print('%2d/%d  %-6s %-34s %d sens officiels'
              % (n, len(fiches), f['id'], titre[:34], trouve), flush=True)
    chemin = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'krdict_grammaire.json')
    json.dump(out, open(chemin, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ecrit :', chemin)


main()
