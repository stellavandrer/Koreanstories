# -*- coding: utf-8 -*-
"""Fabrique le nom de fichier d'une fiche de grammaire a partir de son titre.

Aucun caractere coreen n'est saisi ici : les jamo isoles (ㄴ, ㄹ) sont
reconnus par leur point de code et romanises en composant une syllabe
dont ils sont la finale, puis en retirant le debut. La table sort donc du
module de romanisation, pas de la main.
"""
import re
import unicodedata

from _romanisation import rr

BASE = 0xAC00
# ㅏ, premiere voyelle : sert de support neutre pour isoler une finale
V_SUPPORT = 0


def _finale(jamo):
    """Romanisation d'un jamo consonne pris comme finale."""
    forme = unicodedata.normalize('NFC', jamo)
    for f in range(1, 28):
        syl = chr(BASE + 0 * 588 + V_SUPPORT * 28 + f)
        if unicodedata.normalize('NFD', syl)[-1] == unicodedata.normalize('NFD', forme)[-1]:
            return rr(syl).lower()[1:]   # retire le « g » initial de ga
    return ''


def _sans_accent(t):
    return ''.join(c for c in unicodedata.normalize('NFD', t)
                   if unicodedata.category(c) != 'Mn')


def slug(titre):
    """« -(으)ㄹ 거예요 : Le futur » -> « eul-geoyeyo »."""
    t = titre.split(':')[0]
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('·', ' ').replace('/', ' ').replace('(', '').replace(')', '')
    t = t.replace('-', ' ').replace('&', ' ').replace(',', ' ')
    morceaux = []
    for mot in t.split():
        if re.search(r'[가-힣]', mot) or re.search(r'[㄰-㆏]', mot):
            sortie = ''
            for ch in mot:
                if 0x3130 <= ord(ch) <= 0x318F:
                    sortie += _finale(ch)
                else:
                    sortie += rr(ch).lower().replace('-', '')
            morceaux.append(sortie)
        else:
            m = _sans_accent(mot).lower()
            m = re.sub(r'[^a-z0-9]+', '', m)
            if m:
                morceaux.append(m)
    base = '-'.join(x for x in morceaux if x)
    return re.sub(r'-+', '-', base).strip('-')


if __name__ == '__main__':
    import sys
    sys.path.insert(0, '.')
    import _extraire_grammaire as E
    vus = {}
    for f in E.fiches():
        s = slug(f['titre'])
        vus.setdefault(s, []).append(f['id'])
        print(f['id'], f['niveau'].ljust(3), ('grammaire-' + s + '.html').ljust(42), f['titre'][:40])
    doubles = {k: v for k, v in vus.items() if len(v) > 1}
    print('\ndoublons :', doubles or 'aucun')
    print('vides    :', [k for k in vus if not k] or 'aucun')
