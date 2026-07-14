#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Audit audio EXHAUSTIF — 3 styles d'appel, découverte par fichier.

Style 1 : littéral            speak('안녕')  /  speakAs('안녕', ...)
Style 2 : champ de données    speak(q.ok), say(w.kr) — wrappers découverts
Style 3 : interpolation       onclick="speak('${w.kor}')" dans les render*()
+ data-say="…" ; args opaques (this.textContent, variables nues) FLAGGÉS.

Vérité runtime : ks.js → cleaned = text.trim() (± guillemets englobants),
lookup EXACT dans audio/manifest.json.

Complémentaire de check_audio.py (whitelist de champs, rapide, à lancer après
chaque ajout de contenu) : CE script suit le FLUX réel vers speak() et attrape
les champs non whitelistés (ok:, kr:, PAIRS[i].kr…) — c'est lui qui a trouvé
jeu15 et le commit orphelin d559e2af le 2026-07-14. À lancer avant chaque
grosse release. Sortie JSON : argv[1].
"""
import re, glob, json, html, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__)) or "."
os.chdir(ROOT)

manifest = json.load(open("audio/manifest.json", encoding="utf-8"))

def cleaned(t):
    t = t.strip()
    if len(t) >= 2 and t[0] == t[-1] and t[0] in "\"'":
        t = t[1:-1].strip()
    return t

def in_manifest(t):
    return cleaned(t) in manifest

HANGUL = re.compile(r"[가-힣]")
# gabarits d'affichage à exclure (mais compter) : latin/blancs/flèches
TEMPLATE_CHARS = re.compile(r"[A-Za-z_+→<>=]|___")

FILES = sorted(
    glob.glob("lecon*.html") + glob.glob("exercice*.html")
    + glob.glob("jeu*.html") + glob.glob("quiz*.html")
)

report = {}          # file -> list of dicts
opaque_report = {}   # file -> list of (line, snippet)
gabarits = {}        # file -> set of excluded-but-listed strings

for f in FILES:
    txt = open(f, encoding="utf-8").read()
    entries = []
    opaques = []
    gab = set()

    # ── 0. wrappers locaux : function say(t){ ... speak(t) ... } ──
    speak_fns = {"speak", "speakAs"}
    for m in re.finditer(r"function\s+(\w+)\s*\(\s*(\w+)[^)]*\)\s*\{", txt):
        name, param = m.group(1), m.group(2)
        body = txt[m.end(): m.end() + 400]
        if re.search(r"\bspeak(?:As)?\(\s*" + re.escape(param) + r"\b", body):
            speak_fns.add(name)
    for m in re.finditer(r"(?:const|let|var)\s+(\w+)\s*=\s*\(?\s*(\w+)\s*\)?\s*=>\s*",
                         txt):
        name, param = m.group(1), m.group(2)
        body = txt[m.end(): m.end() + 200]
        if re.search(r"\bspeak(?:As)?\(\s*" + re.escape(param) + r"\b", body):
            speak_fns.add(name)

    fn_alt = "|".join(sorted(re.escape(x) for x in speak_fns))

    # ── 1+2+3. tous les appels fn(ARG …) ──
    fields_used = set()   # (var, field) style 2/3
    for m in re.finditer(r"\b(" + fn_alt + r")\(\s*", txt):
        fn = m.group(1)
        start = m.end()
        rest = txt[start: start + 300]
        line = txt.count("\n", 0, m.start()) + 1

        # littéral simple ' " `
        lm = re.match(r"(['\"`])((?:\\.|(?!\1).)*)\1", rest)
        if lm:
            raw = lm.group(2)
            # style 3 : template '${x.f}' (une seule interpolation pure)
            tm = re.fullmatch(r"\$\{\s*(\w+)\.(\w+)\s*\}", raw)
            if tm:
                fields_used.add((tm.group(2), line, fn, "s3"))
                continue
            # style 3b : template '${x.a||x.b}' → les 2 champs
            tm2 = re.fullmatch(r"\$\{\s*(\w+)\.(\w+)\s*\|\|\s*\1\.(\w+)\s*\}", raw)
            if tm2:
                fields_used.add((tm2.group(2), line, fn, "s3"))
                fields_used.add((tm2.group(3), line, fn, "s3"))
                continue
            if "${" in raw:   # interpolation composite → opaque
                opaques.append((line, fn + "(" + raw[:60] + "…)"))
                continue
            val = html.unescape(raw.replace("\\'", "'").replace('\\"', '"'))
            if HANGUL.search(val):
                entries.append({"style": "s1", "line": line, "fn": fn,
                                "val": val, "ok": in_manifest(val)})
            continue

        # ident.field
        fm = re.match(r"(\w+)\.(\w+)\s*[,)]", rest)
        if fm and fm.group(2) not in ("textContent", "innerText", "innerHTML"):
            fields_used.add((fm.group(2), line, fn, "s2"))
            continue

        # ident.a||ident.b  (ex. step.mainAudio||step.main)
        fo = re.match(r"(\w+)\.(\w+)\s*\|\|\s*\1\.(\w+)\s*[,)]", rest)
        if fo:
            fields_used.add((fo.group(2), line, fn, "s2"))
            fields_used.add((fo.group(3), line, fn, "s2"))
            continue

        # tableau[expr].field  (ex. PAIRS[+a.dataset.id].kr)
        fa = re.match(r"\w+\[[^\]]*\]\.(\w+)\s*[,)]", rest)
        if fa and fa.group(1) not in ("textContent", "innerText", "innerHTML"):
            fields_used.add((fa.group(1), line, fn, "s2"))
            continue

        # opaque (variable nue, this.textContent, expression…)
        om = re.match(r"([^,)\n]{1,60})", rest)
        arg = om.group(1).strip() if om else "?"
        if arg and not re.match(r"^['\"`]", arg):
            opaques.append((line, fn + "(" + arg + ")"))

    # ── harvest des champs style 2/3 dans CE fichier ──
    for (field, line, fn, style) in sorted(fields_used):
        vals = []
        for vm in re.finditer(
                r"\b" + re.escape(field) + r"\s*:\s*(['\"])((?:\\.|(?!\1).)*)\1",
                txt):
            v = html.unescape(vm.group(2).replace("\\'", "'").replace('\\"', '"'))
            if HANGUL.search(v):
                vals.append((txt.count("\n", 0, vm.start()) + 1, v))
        for (vline, v) in vals:
            if TEMPLATE_CHARS.search(v):
                gab.add(v)
                continue
            entries.append({"style": style, "line": vline, "fn": fn,
                            "field": field, "val": v, "ok": in_manifest(v)})

    # ── champs imbriqués ${p.act.kor} → dernier segment ──
    for nm in re.finditer(r"\bspeak(?:As)?\(\s*(['\"`])\$\{\s*\w+(?:\.\w+)*\.(\w+)"
                          r"(?:\.replace\([^)]*\))?\s*\}\1", txt):
        fields_used_extra = nm.group(2)
        line = txt.count("\n", 0, nm.start()) + 1
        fields_used.add((fields_used_extra, line, "speak", "s3n"))

    # ── FILET : si le fichier a des args opaques, vérifier aussi la
    #    whitelist historique de check_audio.py (kor/big/main/audio/verb)
    #    + mainAudio, pour couvrir les templates paramétrés speak('${text}') ──
    if opaques:
        for wm in re.finditer(
                r"\b(kor|big|main|audio|verb|mainAudio)\s*:\s*(['\"])"
                r"((?:\\.|(?!\2).)*)\2", txt):
            v = html.unescape(wm.group(3).replace("\\'", "'").replace('\\"', '"'))
            if not HANGUL.search(v):
                continue
            if TEMPLATE_CHARS.search(v):
                gab.add(v)
                continue
            entries.append({"style": "net", "line": txt.count("\n", 0, wm.start()) + 1,
                            "fn": "filet", "field": wm.group(1), "val": v,
                            "ok": in_manifest(v)})

    # ── data-say ──
    for dm in re.finditer(r'data-say="([^"]*[가-힣][^"]*)"', txt):
        v = html.unescape(dm.group(1))
        entries.append({"style": "dsay", "line": txt.count("\n", 0, dm.start()) + 1,
                        "fn": "data-say", "val": v, "ok": in_manifest(v)})

    # dédoublonner (même valeur+style comptée une fois)
    seen = set()
    uniq = []
    for e in entries:
        k = (e["style"], e.get("field", ""), e["val"])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(e)

    if uniq or opaques:
        report[f] = uniq
    if opaques:
        opaque_report[f] = opaques
    if gab:
        gabarits[f] = gab

# ── SORTIE ──
tot_checked = sum(len(v) for v in report.values())
missing = {f: [e for e in v if not e["ok"]] for f, v in report.items()}
missing = {f: v for f, v in missing.items() if v}
tot_missing = sum(len(v) for v in missing.values())

print(f"FICHIERS SCANNÉS : {len(FILES)}")
print(f"PHRASES VÉRIFIÉES (uniques/fichier) : {tot_checked}")
print(f"MANQUANTES : {tot_missing} dans {len(missing)} fichiers")
print(f"ARGS OPAQUES : {sum(len(v) for v in opaque_report.values())} "
      f"dans {len(opaque_report)} fichiers")
print("=" * 60)
for f in sorted(missing):
    print(f"\n### {f} ({len(missing[f])} manquantes)")
    for e in missing[f]:
        tag = e.get("field", "littéral")
        print(f"  L{e['line']} [{e['style']}/{tag}] {e['val']!r}")
print("=" * 60)
print("\n### ARGS OPAQUES (revue manuelle)")
for f in sorted(opaque_report):
    for (line, snip) in opaque_report[f]:
        print(f"  {f}:L{line}  {snip}")

out = {"missing": {f: [dict(e) for e in v] for f, v in missing.items()},
       "opaque": opaque_report, "gabarits": {f: sorted(v) for f, v in gabarits.items()},
       "checked": tot_checked}
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else
                    "/tmp/audit_out.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
