#!/usr/bin/env python3
"""gen_sitemap.py — remet les dates du sitemap en accord avec le depot.

Le sitemap etait tenu a la main, et il a derive : 68 URLs sur 80
annoncaient une date plus ancienne que leur dernier commit. dictionnaire.html
se declarait inchange depuis le 2 juillet alors qu'il avait ete refondu la
veille. Un lastmod perime dit litteralement a Google « ne repasse pas » —
c'est-a-dire l'inverse de ce qu'on lui demande en resoumettant le sitemap.

Ce script ne touche QU'AUX DATES. La liste des URLs et les priorites restent
telles quelles : le choix de n'y mettre que les pages publiques est delibere
(voir le commentaire en tete du fichier et ks-account-gate.js), ce n'est pas
au script de le revisiter.

  python3 gen_sitemap.py            # met a jour sitemap.xml
  python3 gen_sitemap.py --verifier # ne modifie rien, signale les ecarts
"""
import io
import re
import subprocess
import sys

FICHIER = 'sitemap.xml'
RACINE = 'https://koreanstories.fr/'


def date_du_depot(chemin):
    """Date du dernier commit touchant ce fichier, au format AAAA-MM-JJ."""
    r = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', chemin],
                       capture_output=True, text=True)
    return r.stdout.strip() or None


def main():
    verifier = '--verifier' in sys.argv
    xml = io.open(FICHIER, encoding='utf-8').read()

    ecarts, inconnus = [], []

    def remplacer(m):
        url, lastmod = m.group(1), m.group(2)
        chemin = url or 'index.html'
        reelle = date_du_depot(chemin)
        if not reelle:
            inconnus.append(chemin)
            return m.group(0)
        if reelle != lastmod:
            ecarts.append((chemin, lastmod, reelle))
        return f'<loc>{RACINE}{url}</loc><lastmod>{reelle}</lastmod>'

    motif = re.compile(r'<loc>' + re.escape(RACINE) + r'([^<]*)</loc><lastmod>([\d-]+)</lastmod>')
    total = len(motif.findall(xml))
    neuf = motif.sub(remplacer, xml)

    print(f'{total} URLs examinees')
    for chemin, avant, apres in ecarts:
        print(f'  {chemin:44} {avant} -> {apres}')
    if inconnus:
        print(f'\nSans historique git (verifier a la main) : {", ".join(inconnus)}')

    if verifier:
        print(f'\n{len(ecarts)} date(s) a rafraichir. Rien n a ete ecrit.')
        return 1 if ecarts else 0

    if ecarts:
        io.open(FICHIER, 'w', encoding='utf-8').write(neuf)
        print(f'\n{len(ecarts)} date(s) mises a jour dans {FICHIER}.')
    else:
        print('\nRien a faire, les dates sont deja justes.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
