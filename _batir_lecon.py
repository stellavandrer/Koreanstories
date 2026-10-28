# -*- coding: utf-8 -*-
"""Fabrique une page de lecon Korean Stories au gabarit B2 (rose #DB2777)."""

SPK = ('<button class="speak-btn" onclick="window.speak(\'%s\',this)" aria-label="Écouter">'
       '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
       '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>')

def spk(ko):
    return SPK % ko

def ex(ko, fr):
    return ('    <div class="ex-block">\n      <div class="ko">%s %s</div>\n'
            '      <div class="fr">%s</div>\n    </div>\n' % (ko, spk(ko), fr))

def para(t):
    return '    <p style="margin:.3rem 0 .8rem;font-size:.92rem">%s</p>\n' % t

def formula(t):
    return '    <div class="formula">%s</div>\n' % t

def card(*parts):
    return '  <div class="card">\n' + ''.join(parts) + '  </div>\n'

def h3(t):
    return '  <h3>%s</h3>\n' % t

def tip(t):
    return '  <div class="tip">%s</div>\n' % t

def contrast(ta, ka, fa, tb, kb, fb):
    return ('    <div class="contrast">\n'
            '      <div class="side-a">\n        <h4>%s</h4>\n        <div class="ko">%s %s</div>\n'
            '        <div style="font-size:.8rem;color:var(--tx-muted);margin-top:.2rem">%s</div>\n      </div>\n'
            '      <div class="side-b">\n        <h4>%s</h4>\n        <div class="ko">%s %s</div>\n'
            '        <div style="font-size:.8rem;color:var(--tx-muted);margin-top:.2rem">%s</div>\n      </div>\n'
            '    </div>\n' % (ta, ka, spk(ka), fa, tb, kb, spk(kb), fb))

def table(entetes, lignes):
    h = '    <table class="tbl">\n      <tr>' + ''.join('<th>%s</th>' % e for e in entetes) + '</tr>\n'
    for l in lignes:
        cells = ''.join('<td%s>%s</td>' % (' class="ko"' if i == 0 and l[0].strip().startswith('-') or (i == 0 and any(ord(c) > 0x3000 for c in l[0])) else '', c)
                        for i, c in enumerate(l))
        h += '      <tr>' + cells + '</tr>\n'
    return h + '    </table>\n'

def faux_vrai(faux, pourquoi, vrai):
    return ('    <div class="fv"><span class="fv-x">&#10007;</span> <span class="fv-ko">%s</span>'
            '<div class="fv-why">%s</div>'
            '<div><span class="fv-v">&#10003;</span> <span class="fv-ko ok">%s</span> %s</div></div>\n'
            % (faux, pourquoi, vrai, spk(vrai)))

def survie(ko, fr):
    return ('  <div class="survival">\n    <span class="ko">%s %s</span>\n'
            '    <span class="fr">%s</span>\n  </div>\n' % (ko, spk(ko), fr))

def quiz(qid, question, options):
    h = '  <div class="card mq" id="%s">\n    <p style="font-weight:600">%s</p>\n' % (qid, question)
    for txt, r in options:
        h += ('    <div class="opt" onclick="a(this,\'%s\')" tabindex="0" role="button" '
              'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();a(this,\'%s\')}">%s</div>\n'
              % (r, r, txt))
    return h + '  </div>\n'

STYLE_SUP = """    .tbl{width:100%;border-collapse:collapse;font-size:.85rem;margin:.6rem 0}
    .tbl th,.tbl td{border:1px solid var(--bd);padding:.45rem .55rem;text-align:left;vertical-align:top}
    .tbl th{background:rgba(219,39,119,.08);color:#DB2777;font-size:.78rem;text-transform:uppercase;letter-spacing:.03em}
    [data-theme="dark"] .tbl th{color:#f9a8d4}
    .tbl td.ko{color:#DB2777;font-weight:700;white-space:nowrap}
    [data-theme="dark"] .tbl td.ko{color:#f9a8d4}
    .formula{background:var(--bg);border:1px dashed rgba(219,39,119,.4);border-radius:10px;padding:.55rem .8rem;font-weight:700;font-size:.95rem;color:#DB2777;text-align:center;margin:.2rem 0 .7rem}
    [data-theme="dark"] .formula{color:#f9a8d4}
    .fv{background:rgba(239,68,68,.06);border-left:3px solid #ef4444;border-radius:0 8px 8px 0;padding:.6rem .85rem;margin:.5rem 0;font-size:.88rem;line-height:1.55}
    .fv-x{color:#ef4444;font-weight:800}
    .fv-v{color:#16A34A;font-weight:800}
    .fv-ko{font-weight:700;color:#ef4444}
    .fv-ko.ok{color:#16A34A}
    .fv-why{color:var(--tx-muted);font-size:.82rem;margin:.25rem 0 .4rem}
"""

def page(nom_fichier, titre, titre_barre, titre_onglet, description, pill, xp, cle, chapeau, corps):
    head = """<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
<script src="gate.js"></script>
<script src="ks-account-gate.js"></script>
  <meta charset="UTF-8">
<meta name="robots" content="noindex,follow"><!-- page derriere la porte compte : indexer un mur d'inscription creerait des centaines de pages quasi identiques dans Google. Retirer cette ligne si la page redevient publique. -->
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>__ONGLET__ · Korean Stories</title>
<meta name="description" content="__DESC__"/>
  <link rel="canonical" href="https://koreanstories.fr/__FICHIER__"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <style>
    body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--tx)}
    h1{color:var(--navy);margin:0 0 .4rem}
    [data-theme="dark"] h1{color:#EDF2FA}
    h3{color:#DB2777;margin:1.4rem 0 .5rem;font-size:.95rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
    [data-theme="dark"] h3{color:#f9a8d4}
    .card{background:var(--surf);border:1px solid var(--bd);border-radius:14px;padding:1rem 1.2rem;margin:.8rem 0}
    .pill{display:inline-block;background:rgba(219,39,119,.12);color:#DB2777;border-radius:20px;padding:.2rem .7rem;font-size:.82rem;font-weight:600}
    [data-theme="dark"] .pill{color:#f9a8d4}
    .xp-badge{background:rgba(219,39,119,.12);color:#DB2777;padding:.15rem .5rem;border-radius:8px;font-size:.8rem;font-weight:700}
    [data-theme="dark"] .xp-badge{color:#f9a8d4}
    .btn-done{display:block;width:100%;padding:.9rem;background:#DB2777;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;margin-top:1.2rem}
    .ex-block{background:rgba(219,39,119,.07);border-radius:10px;padding:.6rem .9rem;margin:.4rem 0;font-size:.9rem}
    .ex-block .ko{color:#DB2777;font-weight:700;font-size:.95rem}
    [data-theme="dark"] .ex-block .ko{color:#f9a8d4}
    .ex-block .fr{color:var(--tx-muted);font-style:italic;font-size:.8rem;margin-top:.2rem}
    .tip{background:rgba(184,146,78,.08);border-left:3px solid #B8924E;border-radius:0 8px 8px 0;padding:.5rem .85rem;font-size:.85rem;margin:.5rem 0;line-height:1.5}
    .survival{background:linear-gradient(135deg,#DB2777,#9D174D);color:#fff;border-radius:14px;padding:1rem 1.2rem;margin:.8rem 0}
    .survival .ko{font-size:1.2rem;font-weight:800;display:block}
    .survival .fr{font-size:.82rem;opacity:.85;margin-top:.25rem}
    .speak-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:rgba(219,39,119,.1);border:none;border-radius:50%;cursor:pointer;margin-left:.3rem;vertical-align:middle}
    .speak-btn:hover{background:rgba(219,39,119,.2)}
    .speak-btn.playing{background:#DB2777}
    .speak-btn.playing svg{stroke:#fff}
    .speak-btn svg{width:13px;height:13px;stroke:#DB2777;fill:none;stroke-width:2}
    .survival .speak-btn{background:rgba(255,255,255,.18)}
    .survival .speak-btn svg{stroke:#fff}
    .contrast{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin:.7rem 0}
    .side-a{background:rgba(37,99,235,.07);border-radius:10px;padding:.7rem;border:1px solid rgba(37,99,235,.2)}
    .side-b{background:rgba(219,39,119,.07);border-radius:10px;padding:.7rem;border:1px solid rgba(219,39,119,.2)}
    .side-a h4,.side-b h4{margin:0 0 .4rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.03em}
    .side-a h4{color:#2563EB}
    .side-b h4{color:#DB2777}
    .side-a .ko{color:#2563EB;font-weight:700}
    [data-theme="dark"] .side-a .ko{color:#93c5fd}
    .side-b .ko{color:#DB2777;font-weight:700}
    [data-theme="dark"] .side-b .ko{color:#f9a8d4}
    @media (max-width:480px){.contrast{grid-template-columns:1fr}}
__STYLE_SUP__    .mq .opt{padding:.55rem .8rem;border:1.5px solid var(--bd);border-radius:8px;cursor:pointer;margin:.3rem 0;font-size:.9rem;background:var(--bg)}
    .mq .opt:hover{border-color:#DB2777}
    .mq .opt.ok{border-color:#16A34A;background:rgba(22,163,74,.1);color:#16A34A;font-weight:600}
    .mq .opt.ko{border-color:#ef4444;background:rgba(239,68,68,.08);color:#ef4444}
  </style>
<style>.bnav{padding-left:2px;padding-right:2px}.bni{padding:6px 4px;min-width:0}.bni span{font-size:8px;letter-spacing:.02em}</style>
<link rel="icon" type="image/png" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<link rel="apple-touch-icon" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<script defer src="ks-boot-sync.js"></script>
</head>
<body>
<nav class="bar"><button class="back-btn" aria-label="Retour" onclick="history.back()">&larr;</button><span class="bar-title">__BARRE__</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div style="padding:1rem">
  <h1>__TITRE__</h1>
  <span class="pill">__PILL__</span> <span class="xp-badge">+__XP__ XP</span>
  <p style="color:var(--tx-muted);font-size:.92rem;margin:.5rem 0 1rem">__CHAPEAU__</p>
"""
    head = (head.replace('__ONGLET__', titre_onglet).replace('__DESC__', description)
                .replace('__FICHIER__', nom_fichier).replace('__BARRE__', titre_barre)
                .replace('__TITRE__', titre).replace('__PILL__', pill)
                .replace('__XP__', str(xp)).replace('__CHAPEAU__', chapeau)
                .replace('__STYLE_SUP__', STYLE_SUP))
    tail = """
  <button class="btn-done" id="doneBtn" onclick="completeLesson()">Terminer, +%d XP</button>
</div></main></div>
<script src="ks.js"></script>
<script>
function completeLesson(){if(typeof ksFinish==='function')ksFinish({key:'%s',xp:%d});else{if(typeof ksAddXP==='function')ksAddXP(%d);if(typeof ksMarkDone==='function')ksMarkDone('%s');location.href='cours.html';}}
function a(btn,r){const p=btn.closest('.mq');if(p.querySelector('.opt.ok,.opt.ko'))return;btn.classList.add(r);if(r==='ko'&&window.KSLives)KSLives.lose();}
try{const t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
</script>
  <script src="ks-menu.js" defer></script>
</body></html>
""" % (xp, cle, xp, xp, cle)
    return head + corps + tail
