# -*- coding: utf-8 -*-
"""Verifie chaque lemme coreen contre les deux dictionnaires du site.
Usage : python3 verif_mots.py mot1 mot2 ...   (ou une liste sur stdin)
"""
import json, re, sys, os
BASE = os.path.dirname(os.path.abspath(__file__))
kr = json.load(open(os.path.join(BASE, 'ks-krdict.json'), encoding='utf-8'))
js = open(os.path.join(BASE, 'ks-dictionary.js'), encoding='utf-8').read()

def look(w):
    e = kr.get(w)
    if e:
        return 'krdict', e.get('pos', '?'), e.get('fr', '')
    m = re.search(r"'" + re.escape(w) + r"':\{([^}]*)\}", js)
    if m:
        body = m.group(1)
        fr = re.search(r"fr:'([^']*)'", body)
        pos = re.search(r"pos:'([^']*)'", body)
        return 'ks-dict', (pos.group(1) if pos else '?'), (fr.group(1) if fr else '')
    return None, None, None

mots = sys.argv[1:] or sys.stdin.read().split()
manq = []
for w in dict.fromkeys(mots):
    src, pos, fr = look(w)
    if src:
        print(u'OK   %-12s %-8s %-10s %s' % (w, pos, src, fr[:55]))
    else:
        manq.append(w)
        print(u'MANQ %-12s' % w)
print('\n%d verifies, %d absents des deux dictionnaires' % (len(set(mots)), len(manq)))
if manq:
    print('a verifier a la main : ' + ' '.join(manq))
