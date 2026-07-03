#!/usr/bin/env python3
"""Génère l'audio Typecast (voix narrateur) pour tout le corpus krdict du
dictionnaire (ks-krdict.json, ~43 000 mots) — pour que le bouton Écouter
fonctionne avec une vraie voix sur l'intégralité du dictionnaire, pas
seulement le noyau curé déjà couvert par le vocabulaire des leçons.

  python3 gen_dict_audio.py            # génère tout ce qui manque
  python3 gen_dict_audio.py --status   # progression actuelle
"""
import os, sys, json, time, argparse
sys.path.insert(0, ".")
import generate_audio_typecast as g

CFG = json.load(open("character_voices.json", encoding="utf-8"))
NARR_VOICE_ID = CFG["characters"]["narrateur"]["voice_id"]
KRDICT_PATH = "ks-krdict.json"
MANIFEST_PATH = "audio/manifest.json"
AUDIO_DIR = "audio/narrateur"
SAVE_EVERY = 100


def load_words():
    d = json.load(open(KRDICT_PATH, encoding="utf-8"))
    return list(d.keys())


def cmd_status():
    words = load_words()
    manifest = json.load(open(MANIFEST_PATH, encoding="utf-8")) if os.path.exists(MANIFEST_PATH) else {}
    existing = set(os.listdir(AUDIO_DIR)) if os.path.isdir(AUDIO_DIR) else set()
    done = sum(1 for w in words if manifest.get(w, "") in existing)
    print(f"krdict : {done} / {len(words)} mots avec audio narrateur ({done/len(words)*100:.1f}%)")


def cmd_generate(limit=None):
    words = load_words()
    key = g.get_api_key()
    os.makedirs(AUDIO_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST_PATH, encoding="utf-8")) if os.path.exists(MANIFEST_PATH) else {}
    existing = set(os.listdir(AUDIO_DIR)) if os.path.isdir(AUDIO_DIR) else set()

    made = 0
    total_chars = 0
    for i, w in enumerate(words):
        if limit and made >= limit:
            print(f"  plafond de {limit} mots atteint.")
            break
        h = g.short_hash(w) + ".mp3"
        path = os.path.join(AUDIO_DIR, h)
        manifest[w] = h
        if h in existing and os.path.getsize(path) > 0:
            continue
        try:
            data = g.tts(w, NARR_VOICE_ID, key)
            open(path, "wb").write(data)
            existing.add(h)
            made += 1
            total_chars += len(w)
            if made % SAVE_EVERY == 0:
                json.dump(manifest, open(MANIFEST_PATH, "w", encoding="utf-8"), ensure_ascii=False)
                print(f"  … {made} générés (~{total_chars} caractères), {i+1}/{len(words)} mots parcourus")
            time.sleep(0.15)
        except Exception as e:
            print(f"  ECHEC «{w}» : {e}")
            time.sleep(0.6)

    json.dump(manifest, open(MANIFEST_PATH, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"TERMINE : {made} nouveaux fichiers générés (~{total_chars} caractères).")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()
    if args.status:
        cmd_status()
    else:
        cmd_generate(limit=args.limit)
