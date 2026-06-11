#!/usr/bin/env python3
"""Génère les fiches pdf/clavier-coreen.html et pdf/exister-avoir.html
(template identique aux 29 fiches existantes), puis les .pdf via
Chrome headless."""
import subprocess, os

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

def tpl(ac, title, sub, badge, meta, body):
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet"/>
<title>{title} · Korean Stories</title>
<style>:root{{--ac:{ac}}}
  .pfoot{{display:none}}
  @media print{{
    .pfoot{{display:block;position:fixed;bottom:4mm;left:0;right:0;text-align:center;
      font-size:9pt;color:#888;font-family:'Inter',sans-serif;letter-spacing:.08em}}
  }}
  </style>
<style>
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
:root{{--ac:{ac};--navy:#0F1B2D;--bg:#F8F9FC;--t:#0D1823;--t2:#475E78;--t3:#8FA5BE;--bd:#DAE3F2}}
body{{font-family:'Inter',sans-serif;background:var(--bg);color:var(--t);padding-bottom:60px}}
.kr{{font-family:'Noto Sans KR',sans-serif;font-weight:700;color:var(--ac)}}
.tbar{{background:var(--navy);padding:0 20px;height:54px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}}
.logo{{font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:#fff}}.logo em{{color:var(--ac)}}
.tbr{{display:flex;gap:8px}}
.bk{{display:flex;align-items:center;gap:5px;padding:6px 13px;border-radius:100px;border:1.5px solid rgba(255,255,255,.2);background:none;color:rgba(255,255,255,.6);font-size:11px;font-weight:700;text-decoration:none;transition:all .2s}}
.bk:hover{{border-color:var(--ac);color:var(--ac)}}
.pb{{display:flex;align-items:center;gap:5px;padding:7px 15px;border-radius:100px;background:var(--ac);color:#fff;font-size:11px;font-weight:700;cursor:pointer;border:none}}
.hero{{background:var(--navy);padding:32px 20px 40px;text-align:center}}
.hbadge{{display:inline-block;padding:4px 13px;border-radius:100px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:14px}}
.htitle{{font-family:'Playfair Display',serif;font-size:25px;color:#fff;margin-bottom:9px;line-height:1.3}}
.hsub{{font-size:13px;color:rgba(237,242,250,.5);max-width:520px;margin:0 auto;line-height:1.6}}
.hmeta{{display:flex;justify-content:center;gap:18px;margin-top:15px}}
.hmeta span{{font-size:11px;font-weight:600;color:rgba(237,242,250,.35)}}
.wrap{{max-width:840px;margin:0 auto;padding:24px 16px}}
.sec{{background:#fff;border-radius:14px;border:1px solid var(--bd);box-shadow:0 2px 12px rgba(15,27,80,.05);margin-bottom:18px;overflow:hidden}}
.sh{{background:linear-gradient(135deg,var(--navy),rgba(15,27,45,.94));padding:13px 18px;display:flex;align-items:center;gap:10px}}
.si{{width:30px;height:30px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}}
.st{{font-size:13px;font-weight:700;color:#fff}}
.sb{{padding:18px}}
table{{width:100%;border-collapse:collapse;font-size:13px}}
thead th{{background:var(--ac);color:#fff;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:9px 13px;text-align:left}}
tbody tr:nth-child(even){{background:#F5F8FF}}
td{{padding:9px 13px;border-bottom:1px solid var(--bd);line-height:1.5;vertical-align:middle}}
td:first-child{{font-family:'Noto Sans KR',sans-serif;font-size:16px;font-weight:700;color:var(--ac)}}
.rule{{background:linear-gradient(135deg,rgba(15,27,45,.04),rgba(15,27,45,.02));border:1.5px solid var(--bd);border-radius:11px;padding:14px 16px;margin:11px 0}}
.rule-t{{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ac);margin-bottom:7px}}
.rule-b{{font-size:13px;color:var(--t2);line-height:1.7}}
.rule-kr{{font-family:'Noto Sans KR',sans-serif;font-size:17px;font-weight:700;color:var(--t);margin-top:8px}}
.rule-fr{{font-size:12px;color:var(--t3);margin-top:3px}}
.tip{{background:#FBF2E3;border:1px solid #E0CBA0;border-radius:11px;padding:13px 15px;margin:11px 0;font-size:13px;line-height:1.65}}
.tip b{{color:#92610E}}
.p{{font-size:13.5px;color:var(--t2);line-height:1.75;margin-bottom:9px}}
/* Clavier visuel */
.kb{{background:#EEF2FB;border:1.5px solid var(--bd);border-radius:14px;padding:12px;margin:10px 0}}
.kb-row{{display:flex;gap:5px;margin-bottom:6px;justify-content:center}}
.kb-row:last-child{{margin-bottom:0}}
.kb-k{{flex:1;max-width:64px;height:44px;background:#fff;border:1px solid var(--bd);border-bottom-width:3px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Noto Sans KR',sans-serif;font-size:17px;font-weight:700;color:var(--t)}}
.kb-k small{{font-size:8.5px;color:var(--ac);font-weight:800;line-height:1;margin-top:1px;font-family:'Inter',sans-serif}}
.kb-k.fn{{background:#E2E8F4;font-size:10px;font-weight:800;color:var(--t2);font-family:'Inter',sans-serif}}
.compose{{display:flex;align-items:center;justify-content:center;gap:10px;font-family:'Noto Sans KR',sans-serif;font-size:24px;font-weight:800;padding:10px;background:#F5F8FF;border-radius:10px;margin:8px 0}}
.compose .op{{color:var(--t3);font-size:16px;font-family:'Inter',sans-serif}}
.compose .res{{color:var(--ac);font-size:30px}}
.foot{{border-top:1px solid var(--bd);padding:14px 18px;display:flex;justify-content:space-between;font-size:11px;color:var(--t3)}}
.foot strong{{color:var(--ac)}}
@page{{size:A4;margin:12mm 10mm 18mm}}
  @media print{{
    *,*::before,*::after{{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}}
    .tbar,.ptip,.bk,#dlbtn,.pb{{display:none!important}}
    body{{padding:0;margin:0;background:#fff}}
    .hero{{background:var(--navy,#0F1B2D)!important}}
    .sh{{background:var(--navy,#0F1B2D)!important}}
    thead th{{background:var(--ac)!important;color:#fff!important}}
    .sec{{break-inside:avoid;page-break-inside:avoid}}
    .wrap{{padding:0 8mm}}
    a{{text-decoration:none;color:inherit}}
  }}
</style>
</head>
<body>
<div class="tbar">
  <div class="logo">Korean <em>Stories</em></div>
  <div class="tbr">
    <a href="../ressources.html" class="bk">← Ressources</a>
    <button id="dlbtn" class="pb" onclick="window.print()">🖨️ Imprimer / PDF</button>
  </div>
</div>
<div class="hero">
  <div class="hbadge">{badge}</div>
  <div class="htitle">{title}</div>
  <div class="hsub">{sub}</div>
  <div class="hmeta">{meta}</div>
</div>
<div class="wrap">
{body}
<div class="sec"><div class="foot"><span>© Korean Stories — usage personnel libre</span><strong>koreanstories.fr</strong></div></div>
</div>
<div class="pfoot">koreanstories.fr</div>
</body></html>'''

def sec(icon, t, inner):
    return f'<div class="sec"><div class="sh"><div class="si">{icon}</div><div class="st">{t}</div></div><div class="sb">{inner}</div></div>'

# ═══════════════ FICHE 1 — CLAVIER CORÉEN ═══════════════
kb_rows = ''
rows = [
    [('ㅂ','ㅃ'),('ㅈ','ㅉ'),('ㄷ','ㄸ'),('ㄱ','ㄲ'),('ㅅ','ㅆ'),('ㅛ',''),('ㅕ',''),('ㅑ',''),('ㅐ','ㅒ'),('ㅔ','ㅖ')],
    [('ㅁ',''),('ㄴ',''),('ㅇ',''),('ㄹ',''),('ㅎ',''),('ㅗ',''),('ㅓ',''),('ㅏ',''),('ㅣ','')],
    [('⇧','fn'),('ㅋ',''),('ㅌ',''),('ㅊ',''),('ㅍ',''),('ㅠ',''),('ㅜ',''),('ㅡ',''),('⌫','fn')],
]
for r in rows:
    kb_rows += '<div class="kb-row">'
    for k, shift in r:
        if shift == 'fn':
            kb_rows += f'<div class="kb-k fn">{k}</div>'
        else:
            kb_rows += f'<div class="kb-k">{k}{f"<small>⇧{shift}</small>" if shift else ""}</div>'
    kb_rows += '</div>'

body1 = sec('⌨️', 'Le layout 2-beolsik (두벌식) — le standard coréen', f'''
<p class="p"><strong>Consonnes à gauche, voyelles à droite.</strong> C'est le clavier de 99 % des Coréens. La touche ⇧ (Maj) donne les doubles consonnes ㄲ ㄸ ㅃ ㅆ ㅉ et les voyelles ㅒ ㅖ.</p>
{kb_rows}
''') + sec('🧩', 'La composition automatique des syllabes', '''
<p class="p">On ne tape jamais une syllabe « entière » : on tape les jamo dans l'ordre <strong>consonne → voyelle → (consonne finale)</strong> et le système compose le bloc tout seul :</p>
<div class="compose">ㅎ <span class="op">+</span> ㅏ <span class="op">+</span> ㄴ <span class="op">=</span> <span class="res">한</span></div>
<div class="compose">ㄱ <span class="op">+</span> ㅣ <span class="op">+</span> ㅁ <span class="op">+</span> ㅊ <span class="op">+</span> ㅣ <span class="op">=</span> <span class="res">김치</span></div>
<div class="rule"><div class="rule-t">La magie du batchim</div><div class="rule-b">Si tu tapes une voyelle après une consonne finale, elle « migre » vers la syllabe suivante : 한 + ㅏ devient automatiquement <span class="kr">하나</span>. C'est déroutant 10 minutes, puis ça devient un réflexe.</div></div>
<div class="rule"><div class="rule-t">Voyelles composées</div><div class="rule-b">Elles se tapent en deux touches : ㅗ+ㅏ=<span class="kr">ㅘ</span> · ㅜ+ㅓ=<span class="kr">ㅝ</span> · ㅗ+ㅣ=<span class="kr">ㅚ</span> · ㅡ+ㅣ=<span class="kr">ㅢ</span></div></div>
''') + sec('📱', 'Activer le clavier coréen sur tes appareils', '''
<table><thead><tr><th>Appareil</th><th>Chemin</th><th>Bascule FR ↔ KR</th></tr></thead><tbody>
<tr><td style="font-family:Inter;font-size:13px">iPhone / iPad</td><td>Réglages → Général → Clavier → Claviers → Coréen (standard)</td><td>Touche globe 🌐</td></tr>
<tr><td style="font-family:Inter;font-size:13px">Android</td><td>Gboard → Langues → Ajouter → Coréen → layout 2-Bulsik</td><td>Touche globe / espace long</td></tr>
<tr><td style="font-family:Inter;font-size:13px">Windows</td><td>Paramètres → Langue → Ajouter le coréen (Microsoft IME)</td><td>Alt droite (한/영)</td></tr>
<tr><td style="font-family:Inter;font-size:13px">Mac</td><td>Réglages → Clavier → Sources de saisie → 2-Set Korean</td><td>Ctrl + Espace ou fn</td></tr>
</tbody></table>
<div class="tip"><b>Entraîne-toi sans rien installer :</b> l'Atelier d'écriture de Korean Stories (koreanstories.fr/ecriture.html) intègre ce clavier directement dans la page, avec dictée audio en voix natives. Copie → Dictée → Traduction, du Hangeul au B1.</div>
''') + sec('🎯', '3 exercices pour mémoriser les positions', '''
<div class="rule"><div class="rule-t">Jour 1-3 · Les 6 voyelles simples</div><div class="rule-b">ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ sont tout à droite. Tape lentement : 아 어 오 우 으 이, puis 가 거 고 구 그 기.</div></div>
<div class="rule"><div class="rule-t">Jour 4-7 · Tes 10 premiers mots</div><div class="rule-b">나라 · 나무 · 바다 · 하나 · 지도 · 기차 · 노래 · 아이 · 오이 · 우유 — uniquement des syllabes simples, sans batchim.</div></div>
<div class="rule"><div class="rule-t">Semaine 2 · Le batchim</div><div class="rule-b">물 · 집 · 밥 · 책 · 한국 · 김치. Quand 한 + ㅏ → 하나 ne te surprend plus, c'est gagné.</div></div>
''')

# ═══════════════ FICHE 2 — 있어요 / 없어요 ═══════════════
body2 = sec('⭐', 'Le verbe à tout faire du coréen', '''
<p class="p">Un seul verbe pour trois idées françaises : <strong>« il y a »</strong>, <strong>« avoir »</strong> et <strong>« être quelque part »</strong>. Sa forme négative est un mot différent — pas un « ne pas » ajouté :</p>
<table><thead><tr><th>Coréen</th><th>Prononciation</th><th>Sens</th></tr></thead><tbody>
<tr><td>있어요</td><td>i-sseo-yo</td><td>il y a · j'ai · être (quelque part)</td></tr>
<tr><td>없어요</td><td>eop-seo-yo</td><td>il n'y a pas · je n'ai pas</td></tr>
</tbody></table>
''') + sec('🧱', 'Les 3 structures à connaître', '''
<div class="rule"><div class="rule-t">1 · Il y a — chose + 이/가 + 있어요</div>
<div class="rule-kr">고양이가 있어요</div><div class="rule-fr">Il y a un chat.</div>
<div class="rule-kr">시간이 없어요</div><div class="rule-fr">Je n'ai pas le temps. (litt. « le temps n'existe pas »)</div></div>
<div class="rule"><div class="rule-t">2 · Situer — lieu + 에 + chose + 이/가 + 있어요</div>
<div class="rule-kr">거실에 텔레비전이 있어요</div><div class="rule-fr">Il y a une télé dans le salon.</div>
<div class="rule-kr">친구가 집에 있어요</div><div class="rule-fr">Mon ami est à la maison.</div></div>
<div class="rule"><div class="rule-t">3 · Avoir — 저는 + chose + 이/가 + 있어요</div>
<div class="rule-kr">저는 우산이 있어요</div><div class="rule-fr">J'ai un parapluie. (litt. « quant à moi, un parapluie existe »)</div>
<div class="rule-kr">돈이 없어요</div><div class="rule-fr">Je n'ai pas d'argent.</div></div>
''') + sec('🧭', 'Les particules de position', '''
<p class="p">Pour préciser OÙ : <strong>nom de lieu + mot de position + 에</strong>.</p>
<table><thead><tr><th>Position</th><th>Sens</th><th>Exemple</th></tr></thead><tbody>
<tr><td>위</td><td>sur, au-dessus</td><td><span class="kr">책상 위에 책이 있어요</span> — un livre sur le bureau</td></tr>
<tr><td>밑 / 아래</td><td>sous</td><td><span class="kr">의자 밑에 가방이 있어요</span> — un sac sous la chaise</td></tr>
<tr><td>옆</td><td>à côté</td><td><span class="kr">소파 옆에 시계가 있어요</span> — une horloge à côté du canapé</td></tr>
<tr><td>안</td><td>dans</td><td><span class="kr">방 안에 침대가 있어요</span> — un lit dans la chambre</td></tr>
<tr><td>앞</td><td>devant</td><td><span class="kr">집 앞에 정원이 있어요</span> — un jardin devant la maison</td></tr>
<tr><td>뒤</td><td>derrière</td><td><span class="kr">집 뒤에 차고가 있어요</span> — un garage derrière la maison</td></tr>
</tbody></table>
''') + sec('💬', 'Questions, réponses & phrase de survie', '''
<div class="rule"><div class="rule-t">Question = même phrase, ton montant</div>
<div class="rule-kr">우산이 있어요? — 네, 있어요 / 아니요, 없어요</div>
<div class="rule-fr">Tu as un parapluie ? — Oui, j'en ai un / Non, je n'en ai pas</div></div>
<div class="rule"><div class="rule-t">🆘 LA phrase de ton premier jour en Corée</div>
<div class="rule-kr">화장실이 어디에 있어요?</div><div class="rule-fr">Où sont les toilettes ? — 어디 (où) + 에 + 있어요. Remplace 화장실 par n'importe quoi : 지하철역 (métro), 카페, 은행 (banque)…</div></div>
<div class="tip"><b>Honorifique :</b> pour une personne respectée, 있다 devient <b>계세요</b> : 할머니가 집에 계세요 (grand-mère est à la maison). À reconnaître dès maintenant, à produire plus tard.</div>
''')

os.makedirs('pdf', exist_ok=True)
pages = [
    ('pdf/clavier-coreen.html', tpl('#B8924E', 'Le clavier coréen', 'Layout 2-beolsik, composition des syllabes, activation sur tous tes appareils — tout pour taper en coréen comme à Séoul.', 'Fiche pratique · Tous niveaux', '<span>⌨️ Layout standard</span><span>🧩 Composition</span><span>📱 iOS · Android · PC · Mac</span>', body1)),
    ('pdf/exister-avoir.html', tpl('#16A34A', '있어요 / 없어요 — Exister & Avoir', "Il y a · J'ai · Être quelque part — le verbe le plus rentable du coréen, ses 3 structures et les particules de position.", 'Fiche grammaire · A1', '<span>⭐ Verbe essentiel</span><span>🧭 6 positions</span><span>🆘 Phrases de survie</span>', body2)),
]
for path, html in pages:
    open(path, 'w', encoding='utf-8').write(html)
    pdf_path = path.replace('.html', '.pdf')
    r = subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-pdf-header-footer',
                        '--print-to-pdf=' + os.path.abspath(pdf_path),
                        'file://' + os.path.abspath(path)],
                       capture_output=True, text=True, timeout=60)
    size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0
    print(f'{path} → {pdf_path} ({size//1024} Ko)' if size else f'ÉCHEC {pdf_path}: {r.stderr[-200:]}')
