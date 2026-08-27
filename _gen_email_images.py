#!/usr/bin/env python3
"""_gen_email_images.py — prépare les illustrations de la newsletter.

Le site est en WebP. Outlook (moteur de rendu Word) ne sait pas afficher le
WebP : une newsletter qui pointerait vers img/stories/*.webp montrerait des
cases vides à une part importante des abonnés. On convertit donc en JPEG,
format que tous les clients mail comprennent depuis toujours.

Deuxième raison de passer par ici : les images du blog sont hébergées sur
Wikimedia, qui coupe au bout de quelques requêtes. Un envoi à toute la liste
en ferait des milliers. Tout ce qui part en e-mail doit être hébergé chez
nous — d'où ce dossier img/email/.

Largeur cible 600 px : la largeur du gabarit. Plus large ne sert à rien et
alourdit l'envoi ; plus étroit pixellise sur écran Retina.

  python3 _gen_email_images.py           # convertit ce qui manque
  python3 _gen_email_images.py --force   # reconvertit tout
"""
import os
import subprocess
import sys

SOURCES = ['img/anecdotes', 'img/lessons']
COUVERTURES = 'img/stories'        # seulement les histoireNN.webp
DEST = 'img/email'
LARGEUR = 600
QUALITE = '80'


def a_convertir():
    lot = []
    for d in SOURCES:
        for f in sorted(os.listdir(d)):
            if f.endswith('.webp'):
                lot.append((os.path.join(d, f), f[:-5] + '.jpg'))
    for f in sorted(os.listdir(COUVERTURES)):
        if f.startswith('histoire') and f.endswith('.webp'):
            lot.append((os.path.join(COUVERTURES, f), f[:-5] + '.jpg'))
    return lot


def main():
    force = '--force' in sys.argv
    os.makedirs(DEST, exist_ok=True)
    faits = sautes = rates = 0
    poids = 0
    for src, nom in a_convertir():
        dst = os.path.join(DEST, nom)
        if os.path.isfile(dst) and not force:
            sautes += 1
            poids += os.path.getsize(dst)
            continue
        r = subprocess.run(
            ['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', QUALITE,
             '--resampleWidth', str(LARGEUR), src, '--out', dst],
            capture_output=True)
        if r.returncode == 0 and os.path.isfile(dst):
            faits += 1
            poids += os.path.getsize(dst)
        else:
            rates += 1
            print('  ÉCHEC', src, r.stderr.decode()[:80])
    print(f'{faits} converties · {sautes} déjà présentes · {rates} échecs')
    print(f'{DEST} : {len(os.listdir(DEST))} fichiers, {poids/1024/1024:.1f} Mo')


if __name__ == '__main__':
    main()
