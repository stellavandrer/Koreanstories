#!/usr/bin/env python3
"""check_audio.py — Vérifie que TOUTE chaîne coréenne jouable du site a son
MP3 dans audio/manifest.json. Couvre les sources que les scans naïfs ratent :
  - appels littéraux speak('…') / speakAs('…')
  - attributs data-say="…" (planches BD — voix du data-speaker le plus proche)
  - champs de données kor:/big:/main:/audio:/verb: (leçons : cartes vocab
    rendues via des templates `speak('${w.kor}')`)
Les gabarits d'affichage (contenant lettres latines, ___, +, →, <, >, =) sont
exclus mais LISTÉS pour revue manuelle (une vraie réplique peut contenir
« BTS »…).

  python3 check_audio.py            # rapport local (audio/manifest.json)
  python3 check_audio.py --prod     # compare au manifest en production

Historique : ce type de trou a causé deux vagues de boutons muets (39 phrases
le 2026-07-03, 93 le 2026-07-04). Lancer ce script après CHAQUE ajout de
contenu coréen. Génération des manquants : voir gen_voices.py /
generate_audio_typecast.py (voix narrateur par défaut, voix du personnage
pour les data-say des BD).
"""
import re, glob, json, html, sys, urllib.request

FIELD = re.compile(r"\b(?:kor|big|main|audio|verb)\s*:\s*'([^']*[가-힣][^']*)'")
LIT   = re.compile(r"speak(?:As)?\(\s*'([^'$]*[가-힣][^'$]*)'")
DSAY  = re.compile(r'data-say="([^"]*[가-힣][^"]*)"')
TEMPLATE_CHARS = re.compile(r'[A-Za-z_+→<>=]')

def collect():
    per_file = {}
    for f in sorted(glob.glob('*.html')):
        t = open(f, encoding='utf-8').read()
        words = set()
        for rx in (FIELD, LIT, DSAY):
            for m in rx.findall(t):
                w = html.unescape(m.replace("\\'", "'")).strip()
                if w and re.search(r'[가-힣]', w):
                    words.add(w)
        if words:
            per_file[f] = words
    return per_file

def main():
    if '--prod' in sys.argv:
        manifest = json.loads(urllib.request.urlopen(
            'https://koreanstories.fr/audio/manifest.json').read().decode('utf-8'))
        src = 'PROD'
    else:
        manifest = json.load(open('audio/manifest.json', encoding='utf-8'))
        src = 'local'
    per_file = collect()
    missing, review = {}, set()
    for f, words in per_file.items():
        for w in words:
            if w in manifest:
                continue
            if TEMPLATE_CHARS.search(w):
                review.add(w)          # gabarit probable — à vérifier à l'œil
            else:
                missing.setdefault(f, []).append(w)
    total = sorted(set(w for v in missing.values() for w in v))
    print(f'Manifest {src} : {len(manifest)} entrées')
    if not total:
        print('OK — aucune chaîne jouable manquante.')
    else:
        print(f'{len(total)} chaîne(s) MANQUANTE(S) :')
        for f in sorted(missing):
            for w in sorted(missing[f]):
                print(f'  {f} : {w[:70]}')
    if review:
        print(f'\n{len(review)} chaîne(s) écartée(s) comme gabarit (revue manuelle si doute) :')
        for w in sorted(review):
            print('  ·', w[:80])
    sys.exit(1 if total else 0)

if __name__ == '__main__':
    main()
