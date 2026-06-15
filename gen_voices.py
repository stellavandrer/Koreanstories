#!/usr/bin/env python3
"""
Génération des voix Typecast par personnage, dans le respect du budget
(60 min de téléchargement / mois sur l'offre Basic).

  python3 gen_voices.py --status                 # minutes générées par voix
  python3 gen_voices.py --plan                   # répartition narrateur/persos
  python3 gen_voices.py --narrator --limit 20    # narrateur, 20 chaînes (test)
  python3 gen_voices.py --narrator --minutes 50  # narrateur, jusqu'à ~50 min
  python3 gen_voices.py --dialogues              # dialogues -> voix des persos

Chaque chaîne est générée UNE fois, dans la voix de son locuteur :
- dialogues (dans une .bubble avec .speaker-name) -> voix du personnage,
- tout le reste (vocab, grammaire, narration) -> voix « narrateur » (Seohyeon).
Compression 320->64 kbps = étape locale séparée (compress_audio.py), sans crédits.
"""
import os, sys, re, json, glob, time, argparse
sys.path.insert(0, ".")
import generate_audio_typecast as g

CFG = json.load(open("character_voices.json", encoding="utf-8"))
CHARS = CFG["characters"]
SMAP = CFG["speaker_map"]
NARR = CFG.get("narrator", "narrateur")
MIN_PER_BYTE = 1.0 / 40000 / 60   # 320 kbps CBR -> minutes


def norm_speaker(s):
    s = s.lower().split("(")[0].strip().rstrip(":").strip()
    return s


def dialogue_attribution():
    """Renvoie { texte_coréen : clé_perso } pour toutes les répliques en bulle."""
    out = {}
    sp_rx = re.compile(r'class="speaker-name"[^>]*>([^<]+)<')
    ava_rx = re.compile(r'ava-([a-z]+)')
    call_rx = re.compile(r"speak(?:As)?\(\s*'([^']+)'")
    for f in glob.glob("*.html"):
        t = open(f, encoding="utf-8").read()
        # marqueurs de locuteur (position, clé_perso) : .speaker-name (histoires
        # récentes) + avatars ava-joon/ava-mina (histoires plus anciennes).
        marks = []
        for m in sp_rx.finditer(t):
            c = SMAP.get(norm_speaker(m.group(1)))
            if c:
                marks.append((m.start(), c))
        for m in ava_rx.finditer(t):
            k = m.group(1)
            if k == "init":
                continue
            c = k if k in CHARS else SMAP.get(k)
            if c:
                marks.append((m.start(), c))
        marks.sort()
        for m in call_rx.finditer(t):
            txt = g.clean_text(m.group(1))
            if not txt:
                continue
            # locuteur le plus proche AVANT l'appel (fenêtre 1500c)
            spk = None
            for pos, c in marks:
                if pos < m.start() and m.start() - pos < 1500:
                    spk = c
                elif pos >= m.start():
                    break
            if spk and spk != NARR:
                out[txt] = spk          # le perso prime sur le narrateur
    return out


def voice_minutes(vkey):
    d = os.path.join(g.AUDIO_DIR, vkey)
    if not os.path.isdir(d):
        return 0.0
    return sum(os.path.getsize(os.path.join(d, x)) for x in os.listdir(d)) * MIN_PER_BYTE


def cmd_status():
    print("=== minutes générées (≈, 320 kbps) ===")
    tot = 0.0
    for vk in CHARS:
        m = voice_minutes(vk)
        tot += m
        if m:
            print(f"  {vk:11s} {m:6.2f} min")
    print(f"  TOTAL Typecast : {tot:.2f} min")


def cmd_plan():
    strings = g.load_strings()
    dia = dialogue_attribution()
    by = {}
    for c in dia.values():
        by[c] = by.get(c, 0) + 1
    narr = len(strings)  # narrateur couvre tout (fallback universel)
    print(f"Chaînes uniques totales : {len(strings)}  (~{len(strings)*2.01/60:.0f} min en 1 voix)")
    print(f"Répliques de dialogue attribuées à un perso : {len(dia)}")
    for c, n in sorted(by.items(), key=lambda x: -x[1]):
        print(f"  {c:11s} {n:4d} répliques  (~{n*2.01/60:.1f} min)")


def generate(vkey, texts, minutes_cap=None, count_cap=None):
    key = g.get_api_key()
    vid = CHARS[vkey]["voice_id"]
    vdir = os.path.join(g.AUDIO_DIR, vkey)
    os.makedirs(vdir, exist_ok=True)
    manifest = json.load(open(g.MANIFEST_PATH, encoding="utf-8")) if os.path.exists(g.MANIFEST_PATH) else {}
    used = voice_minutes(vkey)
    made = 0
    for txt in texts:
        if count_cap and made >= count_cap:
            print(f"  ⏹ plafond de {count_cap} chaînes atteint."); break
        if minutes_cap and used >= minutes_cap:
            print(f"  ⏹ budget ~{minutes_cap} min atteint."); break
        h = g.short_hash(txt)
        manifest[txt] = h + ".mp3"
        path = os.path.join(vdir, h + ".mp3")
        if os.path.exists(path) and os.path.getsize(path) > 0:
            continue
        try:
            data = g.tts(txt, vid, key)
            open(path, "wb").write(data)
            used += len(data) * MIN_PER_BYTE
            made += 1
            if made % 25 == 0:
                print(f"  … {made} générées, ~{used:.1f} min cumulées")
            time.sleep(0.15)
        except Exception as e:
            print(f"  ✗ «{txt[:20]}» : {e}"); time.sleep(0.6)
    json.dump(manifest, open(g.MANIFEST_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"✅ {vkey} : {made} nouvelles, ~{used:.2f} min au total dans cette voix.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--plan", action="store_true")
    ap.add_argument("--narrator", action="store_true")
    ap.add_argument("--dialogues", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--minutes", type=float, default=None)
    a = ap.parse_args()
    if a.status:  cmd_status(); return
    if a.plan:    cmd_plan(); return
    if a.narrator:
        generate(NARR, g.load_strings(), minutes_cap=a.minutes, count_cap=a.limit)
        return
    if a.dialogues:
        dia = dialogue_attribution()
        bychar = {}
        for txt, c in dia.items():
            bychar.setdefault(c, []).append(txt)
        for c, texts in sorted(bychar.items(), key=lambda x: -len(x[1])):
            print(f"\n— {c} ({len(texts)} répliques) —")
            generate(c, texts, minutes_cap=a.minutes)
        return
    ap.print_help()


if __name__ == "__main__":
    main()
