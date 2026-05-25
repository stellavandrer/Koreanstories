#!/usr/bin/env python3
"""
Korean Stories — Génération des fichiers audio Korean
======================================================

Utilise Microsoft Edge TTS (gratuit, voix neuronales natives)
pour pré-générer tous les MP3 du site.

Voix : ko-KR-SunHiNeural (femme, naturelle, posée)
       ko-KR-InJoonNeural (homme — alternative)

Usage :
  pip3 install edge-tts
  python3 generate_audio.py

Le script lit audio_strings.txt (1 chaîne par ligne) et génère
audio/{md5}.mp3 + audio/manifest.json (mapping texte → fichier).

Idempotent : skippe les fichiers déjà existants. Tu peux relancer
sans risque pour ajouter de nouvelles entrées.
"""

import asyncio
import edge_tts
import os
import hashlib
import json
import sys

VOICE = "ko-KR-SunHiNeural"  # femme, naturelle. Alt : ko-KR-InJoonNeural (homme)
RATE = "-10%"                # un peu plus lent = plus pédagogique
AUDIO_DIR = "audio"
MANIFEST_PATH = os.path.join(AUDIO_DIR, "manifest.json")
INPUT = "audio_strings.txt"
CONCURRENCY = 6              # nb de requêtes parallèles

def short_hash(text):
    """Hash court et déterministe (md5 tronqué) pour nom de fichier."""
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def clean_text(s):
    """Nettoie une chaîne pour la TTS."""
    s = s.strip()
    # Retire les guillemets enveloppants
    if (s.startswith('"') and s.endswith('"')) or \
       (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    return s

async def gen_one(text, filepath, sema):
    """Génère un MP3 (idempotent)."""
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        return 'cache'
    async with sema:
        try:
            comm = edge_tts.Communicate(text, VOICE, rate=RATE)
            await comm.save(filepath)
            return 'created' if os.path.getsize(filepath) > 0 else 'empty'
        except Exception as e:
            return f'error: {e}'

async def main():
    if not os.path.exists(INPUT):
        print(f"❌ Fichier {INPUT} introuvable. Lance d'abord le scan du site.")
        sys.exit(1)

    os.makedirs(AUDIO_DIR, exist_ok=True)

    with open(INPUT, 'r', encoding='utf-8') as f:
        raw_lines = [l for l in f if l.strip()]

    # Déduplique après nettoyage
    seen = {}
    for raw in raw_lines:
        cleaned = clean_text(raw)
        if cleaned and cleaned not in seen:
            seen[cleaned] = True

    strings = list(seen.keys())
    print(f"🎙  Génération de {len(strings)} fichiers audio")
    print(f"    Voix : {VOICE} · Vitesse : {RATE}")
    print(f"    Sortie : {AUDIO_DIR}/")
    print()

    manifest = {}
    sema = asyncio.Semaphore(CONCURRENCY)

    async def process(i, text):
        h = short_hash(text)
        filename = f"{h}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        manifest[text] = f"audio/{filename}"
        result = await gen_one(text, filepath, sema)
        # Compact log
        display = text if len(text) < 50 else text[:47] + '...'
        marker = '✓' if result in ('cache', 'created') else '✗'
        print(f"  [{i+1:>4}/{len(strings)}] {marker} {display}  ({result})")
        return result

    results = await asyncio.gather(*[process(i, t) for i, t in enumerate(strings)])

    # Manifest
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)

    # Stats
    created = sum(1 for r in results if r == 'created')
    cached = sum(1 for r in results if r == 'cache')
    errors = sum(1 for r in results if r.startswith('error'))
    total_size = sum(os.path.getsize(os.path.join(AUDIO_DIR, f))
                     for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3'))

    print()
    print(f"✅ Terminé.")
    print(f"   Créés : {created} · Déjà en cache : {cached} · Erreurs : {errors}")
    print(f"   Taille totale : {total_size/1024/1024:.1f} Mo")
    print(f"   Manifeste : {MANIFEST_PATH}")

if __name__ == '__main__':
    asyncio.run(main())
