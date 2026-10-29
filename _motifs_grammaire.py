# -*- coding: utf-8 -*-
"""Motifs de recherche d'une regle de grammaire dans le corpus du site.

Les motifs sortent du TITRE de la fiche, jamais d'une saisie manuelle :
« -(으)ㄹ 거예요 » donne « 을 거예요 » et « 거예요 ». Un motif d'une seule
syllabe (particule : 은, 는, 이, 가…) n'est retenu qu'en fin de mot, sinon
만 remonterait 만들다 et 만나다.
"""
import re

JAMO = re.compile(r'[㄰-㆏]')
# La syllabe de l'infinitif (celle qui termine une forme de dictionnaire),
# obtenue par calcul Unicode et non par frappe : initiale n 3, voyelle n 0,
# pas de finale. Tronquer « ... 하다 » en « ... 하 » fait remonter toutes les
# formes conjuguees, qui sont ce qu'on rencontre vraiment dans les phrases.
INFINITIF = chr(0xAC00 + 3 * 588)
KR = re.compile(r'[가-힣]')
FIN_MOT = ' \n\t.,!?…"\'»)'


def motifs(titre):
    t = titre.split(':')[0]
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('·', '|').replace('/', '|').replace('&', '|')
    t = re.sub(r'\bvs\b|\bet\b', '|', t)
    out = []
    for part in t.split('|'):
        p = part.strip().lstrip('-').strip()
        if not p or not KR.search(p):
            continue
        # « (으) » et « (이) » : prefixe optionnel -> deux variantes
        avec = re.sub(r'[()]', '', p)
        sans = re.sub(r'\([^)]*\)', '', p).strip()
        for v in (avec, sans):
            v = v.strip().lstrip('-').strip()
            if not v:
                continue
            # un jamo isole en tete (ㄹ, ㄴ) s'agglutine au radical : on le retire
            v2 = JAMO.sub('', v).strip()
            for cand in (v, v2):
                cand = cand.strip()
                if not cand or not KR.search(cand) or JAMO.search(cand):
                    continue
                if cand not in out:
                    out.append(cand)
                # forme de dictionnaire -> radical, pour attraper les conjugaisons
                if cand.endswith(INFINITIF) and len(cand.rstrip()) > 1:
                    tronc = cand[:-1].strip()
                    if tronc and KR.search(tronc) and tronc not in out:
                        out.append(tronc)
    return out


def fiables(titre, cat):
    """Motifs assez distinctifs pour citer des phrases du corpus.

    Un motif d'une seule syllabe n'est garde que pour une particule : la
    chercher en fin de mot est alors juste, et elle est partout par nature.
    Ailleurs (passif -이/히/리/기, nominalisation -기/-음, registre -(ㄴ)다),
    une syllabe isolee remonterait n'importe quoi : la page se passe alors
    de cette section plutot que de montrer des exemples hors sujet.
    """
    gardes = []
    for m in motifs(titre):
        # Une syllabe seule ne suffit jamais : 은 remonte autant le determinant
        # de 좋은 que la particule de theme, et rien ne les distingue sans
        # analyse morphologique. Ces regles gardent les exemples ecrits a la
        # main dans leur fiche, qui sont justes.
        if len(KR.findall(m)) >= 2:
            gardes.append(m)
    # on prefere les motifs longs : ils sont plus surs
    gardes.sort(key=lambda m: -len(m))
    return gardes


def cherche(motif, phrases):
    """Phrases contenant le motif. Un motif d'une syllabe doit finir un mot."""
    court = len(motif.replace(' ', '')) <= 1
    res = []
    for ph in phrases:
        i = ph.find(motif)
        while i >= 0:
            if not court:
                res.append(ph); break
            apres = ph[i + len(motif):i + len(motif) + 1]
            if apres == '' or apres in FIN_MOT:
                res.append(ph); break
            i = ph.find(motif, i + 1)
    return res


NOTATION = re.compile(r'-\(|\)[㄰-㆏]|^\s*-|·')


def _eojeols(phrase):
    return phrase.split(' ')


def exemples(titre, cat, phrases, maxi=4):
    """Phrases du corpus qui illustrent vraiment la regle.

    Trois filtres, tous necessaires, chacun pour un faux positif constate :
      - les notations grammaticales (« -(으)ㄹ 것 같다 » recopie d'un sommaire)
        ne sont pas des phrases ;
      - un suffixe n'ouvre jamais un mot : « 어서 오세요 » (bienvenue) contient
        « 어서 » mais pas le connecteur -아/어서 ;
      - on prefere les emplois ou le motif termine son mot : « 입으면 » est
        bien « si », « 웃으면서 » est « tout en », une autre regle.
    Sous trois resultats, on rend une liste vide : une section d'exemples
    a moitie juste est pire que pas de section.
    """
    suffixe = titre.split(':')[0].strip().lstrip().startswith('-') or '(' in titre.split(':')[0]
    vus, notes = [], {}
    for m in fiables(titre, cat):
        for ph in cherche(m, phrases):
            if ph in notes or NOTATION.search(ph):
                continue
            ok, exact = False, False
            for e in _eojeols(ph):
                i = e.find(m.split(' ')[0])
                if i < 0:
                    continue
                if suffixe and i == 0:
                    continue          # un suffixe n'ouvre pas un mot, ni n'en est un
                ok = True
                if e.endswith(m.split(' ')[-1]):
                    exact = True
            if not ok:
                continue
            # score : emploi net d'abord, puis longueur de phrase raisonnable
            notes[ph] = (0 if exact else 1, abs(len(ph) - 22))
            vus.append(ph)
    vus.sort(key=lambda p: notes[p])
    vus = [p for p in vus if 10 <= len(p) <= 44]
    return vus[:maxi] if len(vus) >= 3 else []
