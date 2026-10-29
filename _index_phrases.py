# -*- coding: utf-8 -*-
"""Index inverse : quelle phrase coreenne apparait sur quelle page.

Sert aux pages de grammaire, qui citent des phrases REELLES du site
plutot que des exemples fabriques. Chaque phrase retenue a deja son
audio (elle vient du manifeste) et une page ou la rencontrer.

    python3 _index_phrases.py          # construit _index_phrases.json
"""
import glob
import json
import os
import re

MANIFESTE = 'audio/manifest.json'
SORTIE = '_index_phrases.json'

# Pages ou une phrase est « rencontree en contexte ». On evite les pages
# outils (dictionnaire, revision) : y renvoyer n'apprend rien de la phrase.
EXCLUS = re.compile(r'^(dictionnaire|revision|recherche|mes-mots|album|progression|'
                    r'statistiques|trophees|classement|grammaire|conjugaison-|topik|'
                    r'test-niveau|daily-mix|vocabulaire|prenom-coreen|hangeul)')


def titre_de(html):
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    if not m:
        return None
    t = re.sub(r'\s*·\s*Korean Stories\s*$', '', m.group(1)).strip()
    return re.sub(r'\s+', ' ', t)


def construire():
    man = json.load(open(MANIFESTE, encoding='utf-8'))
    # on ne retient que les phrases : au moins 8 caracteres et un espace
    phrases = [t for t in man
               if len(t) >= 8 and ' ' in t and re.search(r'[가-힣]', t)]
    index = {}
    pages = [f for f in sorted(glob.glob('*.html')) if not EXCLUS.match(f)]
    for f in pages:
        html = open(f, encoding='utf-8').read()
        titre = titre_de(html)
        if not titre:
            continue
        for p in phrases:
            if p in html:
                index.setdefault(p, []).append([f, titre])
    json.dump(index, open(SORTIE, 'w', encoding='utf-8'), ensure_ascii=False)
    return index, phrases, pages


if __name__ == '__main__':
    idx, phrases, pages = construire()
    print('%d pages scannees, %d phrases candidates' % (len(pages), len(phrases)))
    print('%d phrases rattachees a au moins une page' % len(idx))
    multi = sum(1 for v in idx.values() if len(v) > 1)
    print('%d phrases vues sur plusieurs pages' % multi)
    for p, v in list(idx.items())[:4]:
        print('   %-34s -> %s' % (p[:32], ', '.join(x[0] for x in v[:3])))
