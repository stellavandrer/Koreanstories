#!/usr/bin/env python3
"""
Korean Stories — Génération audio via Typecast (voix coréennes naturelles)
==========================================================================

Typecast (société coréenne Neosapience) : voix TTS coréennes neuronales,
très naturelles, avec contrôle d'émotion. API REST officielle.

Ce script NE stocke jamais ta clé en dur : il la lit depuis la variable
d'environnement TYPECAST_API_KEY, ou depuis un fichier local `.typecast_key`
(ignoré par git). Tu crées la clé ici : https://typecast.ai/developers

Modes (commence par les petits, sûrs, avant la génération complète) :

  # 1) Lister les voix coréennes disponibles (id + nom + genre)
  python3 generate_audio_typecast.py --list-voices

  # 2) Générer UN échantillon par voix coréenne (pour le casting)
  #    -> audio/_samples_typecast/{voice_id}.mp3
  python3 generate_audio_typecast.py --samples

  # 3) Génération complète à partir de character_voices.json
  #    (mapping personnage -> voix), pour tous les textes de audio_strings.txt
  python3 generate_audio_typecast.py --generate

Le hash MD5 du texte est IDENTIQUE au pipeline existant, donc le manifest
audio/manifest.json reste partagé : on ajoute juste des dossiers de voix.
"""

import os
import sys
import json
import time
import hashlib
import argparse
import urllib.request
import urllib.error

API_BASE = "https://api.typecast.ai"
MODEL = "ssfm-v30"                 # modèle voix Typecast (le plus récent)
AUDIO_DIR = "audio"
MANIFEST_PATH = os.path.join(AUDIO_DIR, "manifest.json")
INPUT = "audio_strings.txt"
SAMPLE_DIR = os.path.join(AUDIO_DIR, "_samples_typecast")
SAMPLE_TEXT = "안녕하세요, 만나서 반가워요."   # même phrase pour comparer les voix
AUDIO_TEMPO = 0.92                 # léger ralenti pédagogique (0.5–2.0)
TIMEOUT = 30


# ── Clé API : env > fichier local .typecast_key (jamais committé) ──
def get_api_key():
    key = os.environ.get("TYPECAST_API_KEY", "").strip()
    if not key and os.path.exists(".typecast_key"):
        key = open(".typecast_key", encoding="utf-8").read().strip()
    if not key:
        sys.exit("❌ Clé manquante. Fais :  export TYPECAST_API_KEY=ta_cle\n"
                 "   (ou colle-la dans un fichier .typecast_key)\n"
                 "   Génère ta clé sur https://typecast.ai/developers")
    return key


def api_get(path, key):
    req = urllib.request.Request(API_BASE + path, headers={"X-API-KEY": key})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8"))


def tts(text, voice_id, key):
    """Renvoie les octets MP3 pour `text` dans la voix `voice_id`."""
    body = json.dumps({
        "text": text,
        "model": MODEL,
        "voice_id": voice_id,
        "language": "kor",          # prononciation coréenne explicite
        "seed": 42,                 # régénération reproductible à l'identique
        "output": {"audio_format": "mp3", "audio_tempo": AUDIO_TEMPO},
    }).encode("utf-8")
    req = urllib.request.Request(
        API_BASE + "/v1/text-to-speech", data=body,
        headers={"X-API-KEY": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read()


def short_hash(text):
    return hashlib.md5(text.encode("utf-8")).hexdigest()[:12]


def clean_text(s):
    s = s.strip()
    if len(s) >= 2 and s[0] in "\"'" and s[-1] in "\"'":
        s = s[1:-1].strip()
    return s


def load_strings():
    seen, out = set(), []
    for line in open(INPUT, encoding="utf-8"):
        t = clean_text(line)
        if t and t not in seen:
            seen.add(t); out.append(t)
    return out


def korean_voices(key):
    """Liste les voix dont la langue inclut le coréen (ko/ko-KR)."""
    data = api_get("/v2/voices", key)
    voices = data.get("voices", data) if isinstance(data, dict) else data
    ko = []
    for v in voices:
        langs = v.get("languages") or v.get("language") or v.get("locale") or ""
        s = json.dumps(langs, ensure_ascii=False).lower() + json.dumps(v, ensure_ascii=False).lower()
        if "ko-kr" in s or '"ko"' in s or "korean" in s or "한국" in s:
            ko.append(v)
    return ko


def cmd_list_voices(key):
    ko = korean_voices(key)
    print(f"\n🎙  {len(ko)} voix coréennes Typecast :\n")
    for v in ko:
        vid = v.get("voice_id") or v.get("id") or "?"
        name = v.get("voice_name") or v.get("name") or "?"
        gender = v.get("gender") or v.get("sex") or ""
        print(f"  {vid}   {name:<24} {gender}")
    print("\n→ Choisis tes voix par personnage dans character_voices.json")


def cmd_samples(key):
    os.makedirs(SAMPLE_DIR, exist_ok=True)
    ko = korean_voices(key)
    print(f"\n🎧  Échantillon « {SAMPLE_TEXT} » × {len(ko)} voix\n")
    for v in ko:
        vid = v.get("voice_id") or v.get("id")
        name = v.get("voice_name") or v.get("name") or vid
        path = os.path.join(SAMPLE_DIR, f"{vid}.mp3")
        if os.path.exists(path) and os.path.getsize(path) > 0:
            print(f"  ✓ (cache) {name}"); continue
        try:
            open(path, "wb").write(tts(SAMPLE_TEXT, vid, key))
            print(f"  ✓ {name}  -> {path}")
        except urllib.error.HTTPError as e:
            print(f"  ✗ {name} : HTTP {e.code} {e.read()[:120]}")
        time.sleep(0.3)
    print(f"\n→ Écoute les MP3 dans {SAMPLE_DIR}/ (ou via la page de casting)")


def cmd_generate(key):
    if not os.path.exists("character_voices.json"):
        sys.exit("❌ character_voices.json manquant (mapping personnage -> voix).")
    cfg = json.load(open("character_voices.json", encoding="utf-8"))
    # voice_keys : { cle_dossier : voice_id_typecast }
    voice_keys = cfg.get("voices", {})
    if not voice_keys:
        sys.exit("❌ Aucune voix dans character_voices.json > 'voices'.")
    strings = load_strings()
    manifest = {}
    if os.path.exists(MANIFEST_PATH):
        manifest = json.load(open(MANIFEST_PATH, encoding="utf-8"))
    total = len(strings) * len(voice_keys)
    print(f"\n🎙  Génération : {len(strings)} textes × {len(voice_keys)} voix = {total} MP3\n")
    done = 0
    for vkey, vid in voice_keys.items():
        vdir = os.path.join(AUDIO_DIR, vkey)
        os.makedirs(vdir, exist_ok=True)
        for text in strings:
            h = short_hash(text)
            manifest[text] = h + ".mp3"
            path = os.path.join(vdir, h + ".mp3")
            if os.path.exists(path) and os.path.getsize(path) > 0:
                done += 1; continue
            try:
                open(path, "wb").write(tts(text, vid, key))
            except urllib.error.HTTPError as e:
                print(f"  ✗ {vkey} «{text}» : HTTP {e.code} {e.read()[:100]}")
                time.sleep(1); continue
            done += 1
            if done % 50 == 0:
                print(f"  … {done}/{total}")
            time.sleep(0.15)
    json.dump(manifest, open(MANIFEST_PATH, "w", encoding="utf-8"),
              ensure_ascii=False, indent=0)
    print(f"\n✅ Terminé : {done}/{total}. Manifest mis à jour.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list-voices", action="store_true")
    ap.add_argument("--samples", action="store_true")
    ap.add_argument("--generate", action="store_true")
    a = ap.parse_args()
    key = get_api_key()
    if a.list_voices:  cmd_list_voices(key)
    elif a.samples:    cmd_samples(key)
    elif a.generate:   cmd_generate(key)
    else:              ap.print_help()


if __name__ == "__main__":
    main()
