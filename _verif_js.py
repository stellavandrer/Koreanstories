# -*- coding: utf-8 -*-
"""Verifie chaque <script> inline d'une page.

Deux traitements selon le type :
  - JavaScript   -> node --check (syntaxe)
  - application/ld+json -> json.loads (donnees structurees)

Un bloc JSON-LD passe a node --check echoue toujours : ce n'est pas du
JavaScript. C'est le piege que ce script a lui-meme declenche le 2026-10-28.

    python3 _verif_js.py page1.html page2.html ...
"""
import json
import os
import re
import subprocess
import sys
import tempfile

BALISE = re.compile(r'<script([^>]*)>(.*?)</script>', re.S)
TYPE = re.compile(r'type\s*=\s*["\']([^"\']+)["\']', re.I)
SRC = re.compile(r'\ssrc\s*=', re.I)


def verifier(fichier):
    s = open(fichier, encoding='utf-8').read()
    erreurs = []
    for i, m in enumerate(BALISE.finditer(s), 1):
        attrs, code = m.group(1), m.group(2)
        if SRC.search(attrs) or not code.strip():
            continue
        t = TYPE.search(attrs)
        type_ = (t.group(1).lower() if t else 'text/javascript')
        if 'json' in type_:
            try:
                json.loads(code)
            except Exception as e:
                erreurs.append('%s script #%d (%s) : %s' % (fichier, i, type_, e))
            continue
        if type_ not in ('text/javascript', 'module', 'application/javascript'):
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(code)
            chemin = f.name
        r = subprocess.run(['node', '--check', chemin], capture_output=True, text=True)
        os.unlink(chemin)
        if r.returncode != 0:
            ligne = [l for l in r.stderr.split('\n') if 'Error' in l][:1]
            erreurs.append('%s script #%d : %s' % (fichier, i, ' '.join(ligne)))
    return erreurs


def main():
    total = 0
    for f in sys.argv[1:]:
        for e in verifier(f):
            print('ERREUR ' + e)
            total += 1
    print('%d fichier(s) verifie(s), %d script(s) en erreur' % (len(sys.argv) - 1, total))
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())
