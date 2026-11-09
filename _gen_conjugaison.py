# -*- coding: utf-8 -*-
"""Fabrique les pages publiques de conjugaison, une par verbe.

Pourquoi ces pages existent : le concurrent francophone en publie 445 et
Korean Stories n'en avait aucune. Son conjugueur est pourtant meilleur
(il traite les 7 familles d'irréguliers et explique pourquoi) et son
audio est gratuit là où le leur est derrière l'abonnement.

Rien n'est écrit à la main ici : les formes viennent de ks-conjugueur.js
exécuté dans Node, les sens du noyau curé de ks-dictionary.js, et les
phrases d'exemple du manifeste audio, donc uniquement des phrases qui
existent déjà sur le site et qu'on peut entendre.

    python3 _gen_conjugaison.py            # écrit les pages
    python3 _gen_conjugaison.py --phrases  # liste l'audio à générer
"""
import html
import json
import os
import re
import subprocess
import sys

VERBES = ['하다', '보다', '있다', '가다', '오다', '먹다', '없다', '자다', '입다', '타다',
          '읽다', '좋다', '받다', '마시다', '공부하다', '일하다', '사다', '만나다', '주다',
          '기다리다', '배우다', '가르치다', '좋아하다', '말하다',
          '모르다', '알다', '아프다', '살다', '듣다', '쓰다', '춥다', '만들다', '크다',
          '예쁘다', '어렵다', '쉽다', '덥다', '바쁘다', '부르다', '낫다']

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _romanisation import rr


def slug(mot):
    return re.sub(r'[^a-z]', '', rr(mot).lower())


def donnees():
    """Fait tourner les modules du site dans Node : une seule source de vérité."""
    js = '''
    const fs=require('fs');
    global.window={}; require('./ks-dictionary.js'); require('./ks-conjugueur.js');
    const D=global.window.KSDict.raw(), K=global.window.KSConj;
    const man=JSON.parse(fs.readFileSync('audio/manifest.json','utf8'));
    const idx=JSON.parse(fs.readFileSync('_index_phrases.json','utf8'));
    const out={};
    for (const v of %s) {
      const stem=v.slice(0,-1);
      /* Une phrase n'illustre le verbe que si elle en contient une forme
         conjuguee. Filtrer sur le radical seul ramasse n'importe quel mot
         qui le contient : 삼겹살 pour 살다, 사랑 pour 사다. */
      /* Deux garde-fous, appris a la dure :
         - une forme d'une seule syllabe (le tutoiement 사, 커) se retrouve
           dans n'importe quel mot : 사진, 커피. On les ecarte.
         - une forme doit commencer un 어절, sinon 들어 se trouve dans
           만들어 et 살 dans 삼겹살. On exige une espace avant, ou le debut. */
      const formes=K.conjuguer(v).map(f=>f[1]).concat([v]).filter(f=>f.length>=2);
      const fin=/[\s.!?,…]/;
      const porte=(p,f)=>{ let i=p.indexOf(f);
        while(i>=0){ const avant=(i===0||p[i-1]===' ');
          const apres=(i+f.length>=p.length)||fin.test(p[i+f.length]);
          if(avant&&apres) return true; i=p.indexOf(f,i+1); } return false; };
      /* On n'exige plus une ponctuation finale : une bonne partie du corpus
         vient de dialogues de BD, qui n'en portent pas (« 오늘 카페에서 책을
         읽어요 »). Neuf verbes se retrouvaient ainsi sans aucun exemple. Deux
         eojeols et dix caracteres disent aussi bien qu'il s'agit d'une phrase. */
      const phrase=p=>p.length>=10 && p.length<=44 && !/[A-Za-z_<>=]/.test(p)
                      && p.trim().split(/\s+/).length>=2;
      const ex=Object.keys(man)
        .filter(p=>phrase(p) && formes.some(f=>porte(p,f)))
        .sort((a,b)=>{ const pa=/[.!?]$/.test(a)?0:1, pb=/[.!?]$/.test(b)?0:1;
                       return pa-pb || a.length-b.length; })
        .slice(0,2);
      out[v]={fr:(D[v]||{}).fr||'', pos:(D[v]||{}).pos||'', formes:K.conjuguer(v),
              irr:K.irregulier(v), exemples:ex,
              sources:ex.map(p=>(idx[p]&&idx[p][0])||null)};
    }
    process.stdout.write(JSON.stringify(out));
    ''' % json.dumps(VERBES, ensure_ascii=False)
    r = subprocess.run(['node', '-e', js], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit('node a échoué : ' + r.stderr[:400])
    return json.loads(r.stdout)


SPK = ('<button class="cj-spk" onclick="dire(this,\'%s\')" aria-label="Écouter %s">'
       '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
       '<path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>')

CSS = """    body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--tx)}
    .cj{max-width:720px;margin:0 auto;padding:1rem 1.1rem 2.5rem}
    h1{font-size:1.55rem;line-height:1.25;margin:.2rem 0 .5rem;color:var(--t)}
    [data-theme="dark"] h1{color:#EDF2FA}
    h1 .kr{color:var(--gold-text)}
    h2{font-size:1.02rem;margin:2rem 0 .6rem;color:var(--t)}
    [data-theme="dark"] h2{color:#EDF2FA}
    .cj-chapeau{color:var(--tx-muted);font-size:.93rem;line-height:1.65;margin:0 0 .4rem}
    .cj-tags{display:flex;flex-wrap:wrap;gap:6px;margin:.7rem 0 0}
    .cj-tag{font-size:.75rem;font-weight:700;padding:.2rem .6rem;border-radius:100px;
      background:rgba(201,169,110,.14);color:var(--gold-text)}
    [data-theme="dark"] .cj-tag{color:#C9A96E}
    .cj-irr{background:rgba(219,39,119,.07);border-left:3px solid #DB2777;border-radius:0 10px 10px 0;
      padding:.8rem 1rem;margin:1.1rem 0;font-size:.9rem;line-height:1.6}
    .cj-irr strong{color:var(--pink-text)}
    [data-theme="dark"] .cj-irr strong{color:#f9a8d4}
    table.cj-t{width:100%;border-collapse:collapse;font-size:.92rem;margin:.5rem 0 0}
    .cj-t th,.cj-t td{border-bottom:1px solid var(--bd);padding:.62rem .5rem;text-align:left;vertical-align:middle}
    .cj-t th{font-size:.73rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx-muted);font-weight:700}
    .cj-t td.f{font-weight:700;font-size:1.05rem;white-space:nowrap}
    .cj-t td.l{color:var(--tx-muted);font-size:.8rem;font-style:italic}
    .cj-spk{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
      background:rgba(201,169,110,.12);border:none;border-radius:50%;cursor:pointer;vertical-align:middle}
    .cj-spk:hover{background:rgba(201,169,110,.26)}
    .cj-spk svg{width:13px;height:13px;stroke:#71582B;fill:none;stroke-width:2}
    [data-theme="dark"] .cj-spk svg{stroke:#C9A96E}
    .cj-spk.muet{opacity:.25;cursor:default}
    .cj-ex{background:var(--surf);border:1px solid var(--bd);border-radius:12px;padding:.7rem .9rem;margin:.5rem 0}
    .cj-ex .k{font-weight:700;font-size:.98rem}
    .cj-ex-src{display:inline-block;margin-top:.3rem;font-size:.73rem;color:var(--gold-text);text-decoration:none;border-bottom:1px dotted rgba(201,169,110,.5)}
    .cj-ex .f{color:var(--tx-muted);font-size:.82rem;font-style:italic;margin-top:.15rem}
    .cj-liens{display:flex;flex-wrap:wrap;gap:8px;margin-top:1rem}
    .cj-liens a{font-size:.84rem;font-weight:600;padding:.55rem .9rem;border-radius:10px;
      border:1px solid var(--bd);text-decoration:none;color:var(--tx)}
    .cj-liens a:hover{border-color:#C9A96E}
    .cj-autres{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:7px;margin-top:.7rem}
    .cj-autres a{font-size:.83rem;padding:.45rem .6rem;border-radius:9px;border:1px solid var(--bd);
      text-decoration:none;color:var(--tx);text-align:center}
    .cj-autres a:hover{border-color:#C9A96E}
    .cj-autres .kr{font-weight:700;display:block}
    .cj-autres .fr{font-size:.72rem;color:var(--tx-muted)}
    /* Texte explicatif : la prose que les tables seules ne donnent pas. */
    .cj-txt{font-size:.93rem;line-height:1.72;margin:.7rem 0;color:var(--tx)}
    .cj-txt strong{color:var(--gold-text)}
    .cj-txt .kr{font-weight:700}
    .cj-reg{margin:.7rem 0;padding-left:1.1rem}
    .cj-reg li{font-size:.92rem;line-height:1.7;margin-bottom:.6rem}
    .cj-reg .kr{font-weight:700}
    .cj-faq{margin-top:.7rem}
    .cj-faq details{background:var(--surf);border:1px solid var(--bd);border-radius:12px;
      padding:.7rem .9rem;margin-bottom:.5rem}
    .cj-faq summary{cursor:pointer;font-weight:600;font-size:.92rem;line-height:1.5}
    .cj-faq summary:hover{color:var(--gold-text)}
    .cj-faq p{margin:.6rem 0 0;font-size:.9rem;line-height:1.7;color:var(--t2)}
"""

JS = """
function dire(btn, texte){ if (typeof window.speak === 'function') window.speak(texte, btn); }
/* Un bouton qui ne joue rien est pire que pas de bouton : on grise ceux
   dont la forme n'a pas encore d'enregistrement, au lieu de laisser
   l'utilisateur cliquer dans le vide. */
fetch('audio/manifest.json').then(function(r){return r.ok?r.json():null;}).then(function(m){
  if(!m) return;
  document.querySelectorAll('.cj-spk').forEach(function(b){
    var t=(b.getAttribute('onclick')||'').match(/dire\\(this,'([^']+)'\\)/);
    if(t && !m[t[1]]){ b.classList.add('muet'); b.disabled=true; b.setAttribute('aria-hidden','true'); }
  });
});
/* Lecture à la française sous chaque forme : la romanisation officielle
   est pensée pour l'anglais et induit un francophone en erreur. */
window.addEventListener('load', function(){
  if(!window.KSLectureFR) return;
  document.querySelectorAll('[data-lire]').forEach(function(e){
    e.textContent = KSLectureFR.lire(e.getAttribute('data-lire'));
  });
});
"""


# ── Analyse du radical ────────────────────────────────────────────────
# Une syllabe hangeul se decompose arithmetiquement : son code vaut
# 0xAC00 + (initiale*21 + voyelle)*28 + finale. On en tire la voyelle et
# la presence d'une consonne finale sans jamais ecrire de coreen a la main,
# donc sans risque d'inventer une forme.
VOY_CLAIRES = (0, 8)          # ㅏ et ㅗ : les deux voyelles « claires »
NOMS_VOYELLE = {0: 'a', 8: 'o'}


def decompose(syllabe):
    """(voyelle, finale) d'une syllabe hangeul, ou None si ce n'en est pas une."""
    c = ord(syllabe) - 0xAC00
    if c < 0 or c > 11171:
        return None
    return ((c // 28) % 21, c % 28)


def radical(mot):
    return mot[:-1]


def analyse(mot):
    """Ce qu'il faut savoir du radical pour expliquer ses formes."""
    rad = radical(mot)
    d = decompose(rad[-1]) if rad else None
    if not d:
        return None
    voyelle, finale = d
    return {
        'radical': rad,
        'claire': voyelle in VOY_CLAIRES,
        'voyelle': NOMS_VOYELLE.get(voyelle),
        'batchim': finale != 0,
    }


def forme(e, libelle):
    """Retrouve une forme calculee par son libelle. Jamais de coreen ecrit ici."""
    for lib, f in e['formes']:
        if lib == libelle:
            return f
    return None


def nature_de(e):
    return 'adjectif' if e['pos'] == 'adj' else 'verbe'


def ce_nature(e):
    """« cet adjectif » / « ce verbe » : l'elision, que le premier jet ratait."""
    return 'cet adjectif' if e['pos'] == 'adj' else 'ce verbe'


def ko(texte):
    """Balise les suites de hangeul d'un texte deja echappe.

    Un lecteur d'ecran francais prononce le coreen non balise comme du
    francais : la regle du site est de marquer lang="ko" partout.
    """
    return re.sub(r'[\uac00-\ud7a3\u3130-\u318f]+',
                  lambda m: '<span lang="ko" class="kr">%s</span>' % m.group(0),
                  texte)


def sens_propre(sens):
    """Le sens sans ses precisions entre parentheses.

    Le dictionnaire ecrit « avoir froid (meteo) » : la parenthese est utile
    dans une liste, pas au milieu d'une phrase francaise.
    """
    return re.sub(r'\s*\([^)]*\)', '', sens).strip()


def bloc_fabrication(mot, e):
    """Explique, pour CE verbe, d'ou sortent ses formes.

    Tout le coreen cite vient de ks-conjugueur.js ; le francais explique
    la regle que la machine a appliquee. C'est la partie que les apprenants
    reclament et que les tables seules ne donnent pas.
    """
    a = analyse(mot)
    poli = forme(e, 'Présent (poli)')
    formel = forme(e, 'Présent (formel)')
    passe = forme(e, 'Passé')
    if not a or not poli:
        return []

    rad = a['radical']
    sens = (e['fr'] or '').split(' / ')
    h = ['  <h2>D\'où sortent ces formes</h2>']

    # Un paragraphe qui parle de CE mot et d'aucun autre : son sens, sa
    # nature, et le piege que sa nature tend aux francophones.
    if e['pos'] == 'adj':
        h.append('  <p class="cj-txt">Avant les formes, un avertissement qui vaut pour '
                 'ce mot en particulier. Il signifie « %s », et la grammaire coréenne le '
                 'classe parmi les adjectifs. Mais un adjectif coréen n\'est pas un '
                 'adjectif français : il se conjugue exactement comme un verbe, il porte '
                 'le temps, et il n\'a besoin d\'aucun équivalent du verbe « être » '
                 'devant lui. C\'est pourquoi le tableau ci-dessous est bien un tableau '
                 'de conjugaison, et pourquoi chercher où placer « être » dans la phrase '
                 'est le réflexe francophone qu\'il faut désapprendre ici.</p>'
                 % sens_propre(sens[0]))
    else:
        autres = (' Le dictionnaire lui donne aussi le sens de « %s » : la conjugaison '
                  'ne change pas d\'un sens à l\'autre, ce sont les mêmes formes, et '
                  'c\'est le contexte qui tranche.'
                  % ' » et « '.join(sens_propre(x) for x in sens[1:])) if len(sens) > 1 else ''
        h.append('  <p class="cj-txt">Ce verbe signifie « %s ». Le coréen ne distingue ni '
                 'personne ni nombre : la forme que tu liras pour « je » est exactement '
                 'celle que tu liras pour « nous » ou pour « ils », et c\'est une '
                 'difficulté de moins qu\'en français.%s</p>'
                 % (sens_propre(sens[0]), autres))

    h.append('  <p class="cj-txt">Tout part du radical : on enlève la terminaison du '
             'dictionnaire et il reste <span lang="ko" class="kr">%s</span>. '
             'Les six formes du tableau se construisent ensuite dessus, et il suffit de '
             'connaître deux critères pour les retrouver seul.</p>' % rad)

    if mot.endswith('하다'):
        # Pour 하다 lui-meme, parler de « la famille de faire » tournait en rond.
        if len(mot) == 2:
            h.append('  <p class="cj-txt"><strong>Premier critère : la terminaison.</strong> '
                     'Ce verbe est la tête d\'une famille immense. Des centaines de verbes '
                     'coréens se forment en lui accolant un nom, et tous se conjuguent '
                     'comme lui. Sa forme polie, '
                     '<span lang="ko" class="kr">%s</span>, ne suit pas l\'harmonie '
                     'vocalique ordinaire : c\'est une irrégularité, mais si fréquente '
                     'qu\'on l\'apprend comme une règle. L\'apprendre une fois, c\'est '
                     'savoir conjuguer toute la famille.</p>' % poli)
        else:
            h.append('  <p class="cj-txt"><strong>Premier critère : la terminaison.</strong> '
                     'Ce verbe est construit sur le verbe « faire », comme des centaines '
                     'd\'autres en coréen : un nom, puis cette terminaison. Toute la '
                     'famille se conjugue de la même façon, et le présent poli donne donc '
                     '<span lang="ko" class="kr">%s</span>. Tu n\'as pas à retenir ce '
                     'verbe à part : dès que tu reconnais cette terminaison, tu connais '
                     'sa conjugaison.</p>' % poli)
    else:
        if a['claire']:
            h.append('  <p class="cj-txt"><strong>Premier critère : la dernière voyelle '
                     'du radical.</strong> Ici c\'est un <i>%s</i>, une voyelle que les '
                     'grammaires appellent claire. Le coréen pratique l\'harmonie '
                     'vocalique : une voyelle claire attire une terminaison claire, et le '
                     'présent poli donne donc <span lang="ko" class="kr">%s</span>. Si la '
                     'voyelle avait été sombre, la terminaison aurait changé de timbre.</p>'
                     % (a['voyelle'] or 'a', poli))
        else:
            h.append('  <p class="cj-txt"><strong>Premier critère : la dernière voyelle '
                     'du radical.</strong> Elle n\'est ni <i>a</i> ni <i>o</i>, donc elle '
                     'compte comme sombre. Par harmonie vocalique, elle appelle la '
                     'terminaison sombre, et le présent poli donne '
                     '<span lang="ko" class="kr">%s</span>. C\'est le cas le plus '
                     'courant : la majorité des radicaux coréens tombent dans cette '
                     'catégorie.</p>' % poli)

    if formel:
        if a['batchim']:
            h.append('  <p class="cj-txt"><strong>Deuxième critère : le radical '
                     'finit-il par une consonne ?</strong> Oui. C\'est ce qui décide de '
                     'la forme formelle, celle des annonces de métro et des entretiens : '
                     'un radical fermé par une consonne prend la terminaison longue et '
                     'donne <span lang="ko" class="kr">%s</span>. C\'est aussi pour cette '
                     'raison que l\'impératif poli intercale une voyelle de liaison : '
                     'sans elle, deux consonnes se heurteraient.</p>' % formel)
        else:
            h.append('  <p class="cj-txt"><strong>Deuxième critère : le radical '
                     'finit-il par une consonne ?</strong> Non, il se termine sur une '
                     'voyelle. La forme formelle se greffe donc directement, sans voyelle '
                     'de liaison, et donne <span lang="ko" class="kr">%s</span>. Les '
                     'radicaux ouverts comme celui-ci sont les plus simples à conjuguer : '
                     'rien ne vient s\'intercaler.</p>' % formel)

    if e['irr']:
        h.append('  <p class="cj-txt"><strong>Et l\'irrégularité.</strong> '
                 'Les deux critères ci-dessus suffiraient si %s était régulier, mais il '
                 'appartient à la famille %s. %s Compare les lignes du tableau : celle qui '
                 'ne ressemble pas à ce que tu attendais est précisément celle où cette '
                 'famille se manifeste. C\'est la raison pour laquelle un tableau calculé '
                 'vaut mieux qu\'une règle apprise seule.</p>'
                 % (ce_nature(e), ko(html.escape(e['irr']['famille'])),
                    ko(html.escape(e['irr']['explication']))))

    if passe:
        h.append('  <p class="cj-txt">Le passé ne demande aucun effort '
                 'supplémentaire : il se forme sur la même base que le présent poli, à '
                 'laquelle on ajoute la marque du passé. '
                 '<span lang="ko" class="kr">%s</span> et '
                 '<span lang="ko" class="kr">%s</span> se ressemblent pour cette raison. '
                 'Retiens la forme polie et tu tiens le passé.</p>' % (poli, passe))

    return h


def bloc_registres(mot, e, nature):
    """Le choix du registre : la question que se posent tous les francophones."""
    poli = forme(e, 'Présent (poli)')
    formel = forme(e, 'Présent (formel)')
    tu = forme(e, 'Tutoiement')
    if not (poli and formel and tu):
        return [], []

    h = ['  <h2>Quelle forme employer, et devant qui</h2>']
    h.append('  <p class="cj-txt">Le coréen n\'a pas un vouvoiement et un tutoiement, '
             'mais trois niveaux, et se tromper de niveau s\'entend davantage qu\'une '
             'faute de conjugaison. Pour ce %s, voici lequel choisir.</p>' % nature)
    h.append('  <ul class="cj-reg">')
    h.append('    <li><span lang="ko" class="kr">%s</span> est la forme à employer par '
             'défaut. Elle est polie sans être guindée : un commerçant, un collègue, '
             'quelqu\'un que tu viens de rencontrer. Si tu n\'en apprends qu\'une seule, '
             'apprends celle-là, elle ne te mettra jamais en faute.</li>' % poli)
    h.append('    <li><span lang="ko" class="kr">%s</span> est la forme formelle. On '
             'l\'entend dans les journaux télévisés, les annonces publiques, l\'armée et '
             'les entretiens d\'embauche. À l\'oral entre particuliers elle crée une '
             'distance que tu ne cherches probablement pas.</li>' % formel)
    h.append('    <li><span lang="ko" class="kr">%s</span> est le langage familier. Il se '
             'mérite : entre amis proches, dans la famille, vers quelqu\'un de plus jeune '
             'qui t\'y autorise. L\'employer trop tôt est la maladresse la plus fréquente '
             'des apprenants.</li>' % tu)
    h.append('  </ul>')

    faq = [
        ('Comment dit-on « %s » poliment en coréen ?' % mot,
         'La forme polie courante est %s. C\'est celle à utiliser dans la vie de tous les '
         'jours, avec un commerçant, un collègue ou une personne que vous rencontrez pour '
         'la première fois.' % poli),
        ('Quelle est la différence entre %s et %s ?' % (poli, formel),
         '%s est poli et courant, c\'est la forme par défaut à l\'oral. %s est formel et '
         's\'entend dans les annonces publiques, les journaux télévisés et les entretiens '
         'professionnels. Les deux sont corrects : c\'est la situation qui tranche.'
         % (poli, formel)),
        ('Comment conjuguer %s au passé ?' % mot,
         'Le passé se dit %s. Il se construit sur la même base que la forme polie du '
         'présent, à laquelle on ajoute la marque du passé.' % forme(e, 'Passé')),
    ]
    return h, faq


def page(mot, e, voisins):
    s = slug(mot)
    fr = e['fr']
    titre = 'Conjuguer %s (%s) en coréen' % (mot, fr.split(' / ')[0])
    irr = e['irr']
    nature = 'adjectif' if e['pos'] == 'adj' else 'verbe'

    # Le coreen du chapeau n'etait pas balise : un lecteur d'ecran francais le
    # prononcait comme du francais.
    chapeau = ('<span lang="ko" class="kr">%s</span> se conjugue comme ceci, à tous les temps '
               'et dans les trois registres que tu entendras vraiment. Chaque forme est '
               'calculée, pas recopiée, et se prononce : touche le haut-parleur.' % mot)

    h = []
    h.append('  <h1>Conjuguer <span lang="ko" class="kr">%s</span><br>(%s) en coréen</h1>' % (mot, fr))
    h.append('  <p class="cj-chapeau">%s</p>' % chapeau)
    h.append('  <div class="cj-tags"><span class="cj-tag">%s</span>' % nature)
    h.append('    <span class="cj-tag">%s</span>'
             % ('irrégulier en %s' % ko(html.escape(irr['famille'])) if irr else 'régulier'))
    h.append('    <span class="cj-tag">%d formes</span></div>' % len(e['formes']))

    if irr:
        h.append('  <div class="cj-irr"><strong>Irrégulier, famille %s.</strong> %s</div>'
                 % (ko(html.escape(irr['famille'])), ko(html.escape(irr['explication']))))

    h.append('  <h2>Les formes</h2>')
    h.append('  <table class="cj-t">')
    h.append('    <tr><th scope="col">Quand l\'employer</th><th scope="col">Forme</th><th scope="col">Ça se lit</th></tr>')
    for libelle, forme in e['formes']:
        h.append('    <tr><td>%s</td>'
                 '<td class="f"><span lang="ko">%s</span> %s</td>'
                 '<td class="l" data-lire="%s"></td></tr>'
                 % (libelle, forme, SPK % (forme, forme), forme))
    h.append('  </table>')

    h += bloc_fabrication(mot, e)
    bloc_reg, faq = bloc_registres(mot, e, nature)
    h += bloc_reg

    if e['exemples']:
        h.append('  <h2>Dans une vraie phrase</h2>')
        for ex, src in zip(e['exemples'], e.get('sources') or [None] * len(e['exemples'])):
            lien = ''
            if src:
                lien = ('<a class="cj-ex-src" href="%s">%s</a>'
                        % (html.escape(src[0], quote=True), ko(html.escape(src[1]))))
            h.append('  <div class="cj-ex"><div class="k" lang="ko">%s %s</div>'
                     '<div class="f" data-lire="%s"></div>%s</div>'
                     % (ex, SPK % (ex, ex), ex, lien))
        # « enregistrees » laissait croire a des voix humaines : ce sont des voix
        # de synthese, et la regle est ferme la-dessus.
        h.append('  <p class="cj-chapeau" style="margin-top:.5rem;font-size:.82rem">'
                 'Ces phrases viennent des leçons et des histoires du site, elles ne sont pas '
                 'inventées pour l\'occasion, et chacune se prononce.</p>')

    if faq:
        h.append('  <h2>Questions fréquentes</h2>')
        h.append('  <div class="cj-faq">')
        for q, r in faq:
            h.append('    <details><summary>%s</summary><p>%s</p></details>'
                     % (ko(html.escape(q)), ko(html.escape(r))))
        h.append('  </div>')

    h.append('  <h2>Pour aller plus loin</h2>')
    h.append('  <div class="cj-liens">')
    h.append('    <a href="dictionnaire.html">Chercher '
             '<span lang="ko" class="kr">%s</span> dans le dictionnaire</a>' % mot)
    if irr:
        h.append('    <a href="blog-verbes-irreguliers-coreens.html">Les verbes irréguliers expliqués</a>')
    h.append('    <a href="grammaire-coreen.html">Les 53 règles de grammaire</a>')
    h.append('    <a href="conjugaison-coreen.html">Tous les verbes</a>')
    h.append('    <a href="vocabulaire-coreen.html">Le vocabulaire par thème</a>')
    h.append('  </div>')

    h.append('  <h2>D\'autres verbes</h2>')
    h.append('  <div class="cj-autres">')
    for v2, fr2 in voisins:
        h.append('    <a href="conjugaison-%s.html"><span lang="ko" class="kr">%s</span>'
                 '<span class="fr">%s</span></a>' % (slug(v2), v2, fr2.split(' / ')[0]))
    h.append('  </div>')

    corps = '\n'.join(h)

    graphe = [{
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://koreanstories.fr/"},
            {"@type": "ListItem", "position": 2, "name": "Conjugaison coréenne",
             "item": "https://koreanstories.fr/conjugaison-coreen.html"},
            {"@type": "ListItem", "position": 3, "name": titre,
             "item": "https://koreanstories.fr/conjugaison-%s.html" % s}]}]
    # La FAQ n'est declaree que si elle est reellement affichee sur la page :
    # un balisage sans contenu visible est une faute que Google sanctionne.
    if faq:
        graphe.append({
            "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": r}}
                           for q, r in faq]})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graphe},
                    ensure_ascii=False, indent=2)

    desc = ('%s (%s) : toutes les formes du présent, du passé, du futur et de l\'impératif, '
            'avec l\'audio de chacune et la lecture à la française.%s Gratuit, sans compte.'
            % (mot, fr, ' Verbe irrégulier de la famille %s, expliquée.' % irr['famille'] if irr else ''))

    return TEMPLATE.replace('__TITRE__', titre).replace('__DESC__', desc) \
                   .replace('__SLUG__', s).replace('__CORPS__', corps) \
                   .replace('__LD__', ld).replace('__CSS__', CSS).replace('__JS__', JS)


TEMPLATE = """<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
<script src="gate.js"></script>
<script src="ks-account-gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>__TITRE__ · Korean Stories</title>
  <meta name="description" content="__DESC__"/>
  <link rel="canonical" href="https://koreanstories.fr/conjugaison-__SLUG__.html"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <meta property="og:title" content="__TITRE__"/>
  <meta property="og:description" content="__DESC__"/>
  <meta property="og:type" content="article"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="Korean Stories"/>
  <meta property="og:url" content="https://koreanstories.fr/conjugaison-__SLUG__.html"/>
  <meta property="og:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="https://koreanstories.fr/Logo/Logo - KoreanStories.png"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <link rel="preload" href="fonts/ks-fonts-kr.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="fonts/ks-fonts-kr.css"></noscript>
  <style>
__CSS__  </style>
<link rel="icon" type="image/png" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<script type="application/ld+json">
__LD__
</script>
<script defer src="ks-boot-sync.js"></script>
</head>
<body>
<nav class="bar"><button class="back-btn" aria-label="Retour" onclick="history.back()">&larr;</button><span class="bar-title">Conjugaison</span><button onclick="toggleTheme()" class="theme-btn" aria-label="Changer de thème"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div class="cj">
__CORPS__
</div></main></div>
<script src="ks.js"></script>
<script src="ks-lecture-fr.js"></script>
<script>
__JS__
try{const t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
</script>
  <script src="ks-menu.js" defer></script>
</body></html>
"""


def index(d):
    lignes = []
    irr = [(v, d[v]) for v in VERBES if d[v]['irr']]
    reg = [(v, d[v]) for v in VERBES if not d[v]['irr']]
    for titre, lot, intro in [
        ('Les verbes réguliers', reg,
         'Ceux qui suivent la règle. Une fois le mécanisme compris sur l\'un, il vaut pour tous.'),
        ('Les verbes irréguliers', irr,
         'Ceux qui changent de forme devant une voyelle. Chaque fiche dit à quelle famille le verbe '
         'appartient et pourquoi la forme change, au lieu de vous laisser apprendre la liste par cœur.')]:
        lignes.append('  <h2>%s <span style="font-weight:400;color:var(--tx-muted)">· %d</span></h2>'
                      % (titre, len(lot)))
        lignes.append('  <p class="cj-chapeau">%s</p>' % intro)
        lignes.append('  <div class="cj-autres">')
        for v, e in lot:
            lignes.append('    <a href="conjugaison-%s.html"><span lang="ko" class="kr">%s</span>'
                          '<span class="fr">%s</span></a>' % (slug(v), v, e['fr'].split(' / ')[0]))
        lignes.append('  </div>')
    lignes.append('  <h2>Aller plus loin</h2>')
    lignes.append('  <div class="cj-liens">')
    lignes.append('    <a href="grammaire-coreen.html">Les 53 règles de grammaire</a>')
    lignes.append('    <a href="vocabulaire-coreen.html">Le vocabulaire par thème</a>')
    lignes.append('    <a href="dictionnaire.html">Le dictionnaire</a>')
    lignes.append('  </div>')
    corps = ('  <h1>Conjugaison coréenne :<br>%d verbes, forme par forme</h1>\n'
             '  <p class="cj-chapeau">Chaque fiche donne les six formes utiles du verbe, du tutoiement '
             'au registre formel, avec l\'audio de chacune et la lecture à la française. Les formes sont '
             'calculées par le conjugueur du site, celui-là même qui tourne dans le dictionnaire, et qui '
             'traite les sept familles d\'irréguliers.</p>\n' % len(VERBES)) + '\n'.join(lignes)
    ld = json.dumps({"@context": "https://schema.org", "@type": "CollectionPage",
                     "name": "Conjugaison coréenne", "inLanguage": "fr",
                     "url": "https://koreanstories.fr/conjugaison-coreen.html"},
                    ensure_ascii=False, indent=2)
    desc = ('Conjuguer %d verbes coréens, forme par forme : présent, passé, futur, impératif et '
            'tutoiement, avec l\'audio et la lecture à la française. Les sept familles '
            'd\'irréguliers expliquées. Gratuit, sans compte.' % len(VERBES))
    return TEMPLATE.replace('__TITRE__', 'Conjugaison coréenne : %d verbes' % len(VERBES)) \
                   .replace('__DESC__', desc).replace('__SLUG__', 'coreen') \
                   .replace('__CORPS__', corps).replace('__LD__', ld) \
                   .replace('__CSS__', CSS).replace('__JS__', JS) \
                   .replace('conjugaison-coreen.html"/>', 'conjugaison-coreen.html"/>')


def main():
    d = donnees()
    if '--phrases' in sys.argv:
        man = json.load(open('audio/manifest.json', encoding='utf-8'))
        manque = []
        for v in VERBES:
            for _, f in d[v]['formes']:
                if f not in man and f not in manque:
                    manque.append(f)
        print('\n'.join(manque))
        sys.stderr.write('%d formes sans audio\n' % len(manque))
        return
    n = 0
    for i, v in enumerate(VERBES):
        voisins = [(VERBES[(i + k) % len(VERBES)], d[VERBES[(i + k) % len(VERBES)]]['fr'])
                   for k in range(1, 9)]
        open('conjugaison-%s.html' % slug(v), 'w', encoding='utf-8').write(page(v, d[v], voisins))
        n += 1
    open('conjugaison-coreen.html', 'w', encoding='utf-8').write(index(d))
    print('%d fiches + 1 index ecrits' % n)


if __name__ == '__main__':
    main()
