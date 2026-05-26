#!/usr/bin/env python3
"""
Korean Stories — Génération multi-voix
=======================================

Génère les MP3 dans plusieurs voix Edge TTS pour que chaque
utilisateur puisse choisir sa préférée dans Réglages.

Structure :
  audio/sunhi/{hash}.mp3
  audio/injoon/{hash}.mp3
  audio/hyunsu/{hash}.mp3
  audio/manifest.json  → mapping { "texte" : "{hash}.mp3" }
                          (le hash est le même quelle que soit la voix)

Le client choisit la voix via localStorage.ks_voice et joue
audio/{voice}/{hash}.mp3 → 3 voix sans dupliquer le manifest.

Usage :
  pip3 install edge-tts
  python3 generate_audio.py [--voices sunhi,injoon,hyunsu]
"""

import asyncio
import edge_tts
import os
import hashlib
import json
import sys
import argparse

VOICES = {
    'sunhi':  {'edge':'ko-KR-SunHiNeural',                 'lbl':'SunHi (femme)'},
    'injoon': {'edge':'ko-KR-InJoonNeural',                'lbl':'InJoon (homme)'},
    'hyunsu': {'edge':'ko-KR-HyunsuMultilingualNeural',    'lbl':'Hyunsu (homme expressif)'},
}
RATE = "-10%"
AUDIO_DIR = "audio"
MANIFEST_PATH = os.path.join(AUDIO_DIR, "manifest.json")
INPUT = "audio_strings.txt"
CONCURRENCY = 6

def short_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def clean_text(s):
    s = s.strip()
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    return s

async def gen_one(text, filepath, voice_edge, sema):
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        return 'cache'
    async with sema:
        try:
            comm = edge_tts.Communicate(text, voice_edge, rate=RATE)
            await comm.save(filepath)
            return 'created' if os.path.getsize(filepath) > 0 else 'empty'
        except Exception as e:
            return f'error: {e}'

async def gen_voice(voice_key, voice_edge, strings, sema):
    voice_dir = os.path.join(AUDIO_DIR, voice_key)
    os.makedirs(voice_dir, exist_ok=True)
    print(f"\n🎙  {voice_key} ({voice_edge})")
    results = []
    for i, text in enumerate(strings):
        h = short_hash(text)
        filepath = os.path.join(voice_dir, f"{h}.mp3")
        result = await gen_one(text, filepath, voice_edge, sema)
        results.append(result)
        if (i+1) % 100 == 0:
            created = sum(1 for r in results if r=='created')
            cached  = sum(1 for r in results if r=='cache')
            print(f"   [{i+1}/{len(strings)}] créés:{created} · cache:{cached}")
    created = sum(1 for r in results if r=='created')
    cached  = sum(1 for r in results if r=='cache')
    errors  = sum(1 for r in results if r.startswith('error'))
    print(f"   ✓ Terminé : créés:{created} · cache:{cached} · erreurs:{errors}")
    return results

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--voices', default='sunhi,injoon,hyunsu',
                        help='liste de voix séparées par virgule')
    args = parser.parse_args()

    chosen = [v.strip() for v in args.voices.split(',') if v.strip() in VOICES]
    if not chosen:
        print("❌ Aucune voix valide. Choisir parmi :", list(VOICES.keys())); sys.exit(1)

    if not os.path.exists(INPUT):
        print(f"❌ {INPUT} introuvable."); sys.exit(1)

    os.makedirs(AUDIO_DIR, exist_ok=True)

    with open(INPUT, 'r', encoding='utf-8') as f:
        raw = [l for l in f if l.strip()]

    seen = {}
    for r in raw:
        c = clean_text(r)
        if c and c not in seen: seen[c] = True
    strings = list(seen.keys())

    print(f"🎙  {len(strings)} chaînes × {len(chosen)} voix = {len(strings)*len(chosen)} fichiers")
    print(f"    Voix : {', '.join(VOICES[v]['edge'] for v in chosen)}")
    print(f"    Sortie : {AUDIO_DIR}/{{voix}}/{{hash}}.mp3")

    sema = asyncio.Semaphore(CONCURRENCY)

    # Manifest = mapping text → hash (commun aux 3 voix)
    manifest = {text: short_hash(text)+'.mp3' for text in strings}
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)

    # Génère chaque voix séquentiellement (pour ne pas saturer Edge)
    for voice_key in chosen:
        await gen_voice(voice_key, VOICES[voice_key]['edge'], strings, sema)

    # Stats finales
    total_size = 0
    for v in chosen:
        d = os.path.join(AUDIO_DIR, v)
        if os.path.isdir(d):
            total_size += sum(os.path.getsize(os.path.join(d,f)) for f in os.listdir(d) if f.endswith('.mp3'))
    print(f"\n✅ Tout terminé. Taille totale : {total_size/1024/1024:.1f} Mo")
    print(f"   Manifeste : {MANIFEST_PATH}")

if __name__ == '__main__':
    asyncio.run(main())
