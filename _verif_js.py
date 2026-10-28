# -*- coding: utf-8 -*-
"""Extrait chaque <script> inline d'une page et verifie qu'il parse."""
import re, subprocess, sys, tempfile, os
mauvais = 0
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    for i, m in enumerate(re.finditer(r'<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>', s, re.S)):
        code = m.group(1)
        if not code.strip():
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as t:
            # les fonctions appelees au chargement n'existent pas hors page : on parse seulement
            t.write(code); chemin = t.name
        r = subprocess.run(['node', '--check', chemin], capture_output=True, text=True)
        os.unlink(chemin)
        if r.returncode != 0:
            mauvais += 1
            erreur = [l for l in r.stderr.split('\n') if 'Error' in l or '^' in l][:2]
            print('ERREUR %s script #%d : %s' % (f, i + 1, ' | '.join(erreur)))
    else:
        pass
print('%d fichier(s) verifie(s), %d script(s) en erreur' % (len(sys.argv) - 1, mauvais))
