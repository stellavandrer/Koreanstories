#!/usr/bin/env python3
"""fix_missing_audio.py — Répare les chaînes audio manquantes signalées
par check_audio.py : génère chaque phrase dans la voix narrateur Typecast
(Seohyeon) + les 3 voix Edge (sunhi/injoon/hyunsu), puis inscrit
l'entrée dans audio/manifest.json ET audio/manifest-extra.json (sidecar
durable). Réplique exactement le pipeline utilisé pour le contenu
existant — les lignes de personnages BD jouent via la chaîne de repli
narrateur/neural comme leurs voisines déjà en prod.

  python3 fix_missing_audio.py            # répare tout ce qui manque
"""
import asyncio
import hashlib
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def short_hash(text):
    return hashlib.md5(text.encode("utf-8")).hexdigest()[:12]


def missing_strings():
    """Réutilise check_audio.py pour lister les chaînes jouables absentes
    du manifeste local."""
    import subprocess
    r = subprocess.run([sys.executable, "check_audio.py"], capture_output=True, text=True)
    out = r.stdout
    lines = []
    in_missing = False
    for line in out.splitlines():
        if "MANQUANTE" in line:
            in_missing = True
            continue
        if in_missing:
            if not line.startswith("  "):
                break
            # format "  page.html : texte"
            part = line.strip()
            if " : " in part:
                lines.append(part.split(" : ", 1)[1])
    return sorted(set(lines))


EDGE_VOICES = {
    "sunhi": "ko-KR-SunHiNeural",
    "injoon": "ko-KR-InJoonNeural",
    "hyunsu": "ko-KR-HyunsuMultilingualNeural",
}
EDGE_RATE = "-10%"


async def gen_edge(text, h):
    import edge_tts
    for vkey, evoice in EDGE_VOICES.items():
        path = os.path.join("audio", vkey, h + ".mp3")
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            continue
        comm = edge_tts.Communicate(text, evoice, rate=EDGE_RATE)
        await comm.save(path)
        assert os.path.getsize(path) > 0, f"fichier vide: {path}"
        print(f"    edge/{vkey} ok ({os.path.getsize(path)} o)")


def main():
    tc = load_module("gat", "generate_audio_typecast.py")
    key = tc.get_api_key()
    voices = json.load(open("character_voices.json"))
    narr_id = voices["characters"]["narrateur"]["voice_id"]

    texts = missing_strings()
    print(f"{len(texts)} chaînes à générer\n")
    if not texts:
        print("Rien à faire.")
        return

    manifest = json.load(open("audio/manifest.json"))
    sidecar = json.load(open("audio/manifest-extra.json"))

    done, fails = 0, 0
    for i, text in enumerate(texts, 1):
        h = short_hash(text)
        print(f"[{i}/{len(texts)}] «{text[:50]}…» → {h}")
        tc_path = os.path.join("audio", "narrateur", h + ".mp3")
        try:
            if not (os.path.isfile(tc_path) and os.path.getsize(tc_path) > 0):
                data = tc.tts(text, narr_id, key)
                open(tc_path, "wb").write(data)
                assert os.path.getsize(tc_path) > 0
                print(f"    typecast/narrateur ok ({len(data)} o)")
                time.sleep(0.4)  # politesse API
            asyncio.run(gen_edge(text, h))
            manifest[text] = h + ".mp3"
            sidecar[text] = h + ".mp3"
            done += 1
        except Exception as e:
            fails += 1
            print(f"    ÉCHEC : {e}")

    json.dump(manifest, open("audio/manifest.json", "w"), ensure_ascii=False)
    json.dump(sidecar, open("audio/manifest-extra.json", "w"), ensure_ascii=False)
    print(f"\nTERMINÉ : {done} générées, {fails} échecs. Manifest: {len(manifest)} entrées, sidecar: {len(sidecar)}.")


if __name__ == "__main__":
    main()
