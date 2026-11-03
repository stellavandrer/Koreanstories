# -*- coding: utf-8 -*-
"""Constitue, pour chaque theme de vocabulaire.html, une liste de mots validee.

Les mots viennent de deux sources, toutes deux relues : le tableau WORDS de
vocabulaire.html (qui porte en plus la decomposition syllabique) et
ks-dictionary.js. Le rattachement a un theme se fait par le champ lexical
FRANCAIS, jamais par le coreen.

Trois filtres, chacun pour un faux positif constate :
  - mot entier : « mal » ne doit pas attraper « maladroit » ni « malheur » ;
  - pas de proverbe : « cerise sur le gateau » n'est pas du vocabulaire du cafe ;
  - noyau, pour les listes fermees : « radis blanc » n'est pas une couleur.
Ce qui passe ces trois filtres est ensuite relu a la main (voir ECARTES).
"""
import re

GUILL = re.compile(r'[«»"]')

# listes fermees : le mot-cle doit etre le noyau de la traduction
FERMES = {'col', 'num'}

# Mots-cles ecartes car polysemiques, avec le faux positif qu'ils causaient :
#   ligne (ligne droite, commentaire)   micro (micro-ondes)
#   plat (etre plat)                    addition (addition mathematique)
#   prix (a tout prix)                  taille (dimension)
#   salle (salle de classe, cinema)     poisson (arete, odeur de)
#   frais (rafraichissant)              sac (sac d'argent)
#   glace (glacon)
# Un mot-cle qui designe autre chose dans un autre contexte ramene ce contexte.
CHAMPS = {
 'h2':  ['marché','fruit','légume','kilo','viande'],
 'h3':  ['restaurant','menu','serveur','repas','riz','soupe','commander'],
 'h4':  ['café','thé','boisson','gâteau','sucre','lait','tasse'],
 'h5':  ['supérette','bouteille','sachet','caisse','monnaie','payer','ticket'],
 'h6':  ['métro','station','train','bus','sortie','correspondance','billet','arrêt'],
 'h7':  ['maison','chambre','cuisine','porte','fenêtre','lit','chaise','meuble','appartement'],
 'h8':  ['chanson','chanter','musique','karaoké','danser','écran'],
 'h9':  ['médecin','hôpital','douleur','fièvre','médicament','malade','pharmacie','santé','mal'],
 'h10': ['vêtement','magasin','robe','pantalon','chaussure','réduction','boutique','essayer'],
 'h11': ['fête','cadeau','inviter','anniversaire','invitation','félicitations','soirée'],
 'fam': ['famille','père','mère','frère','sœur','parent','grand-père','grand-mère','fils','fille','oncle','tante','cousin'],
 'col': ['couleur','couleurs','rouge','bleu','vert','jaune','noir','blanc','rose','gris','orange','violet','marron'],
 'tps': ['heure','minute','jour','semaine','mois','année','hier','demain','matin','soir','midi','temps'],
 'num': ['nombre','chiffre','zéro','cent','mille','million'],
}

# Ecartes a la relecture : le filtre automatique les laisse passer, mais ils
# n'appartiennent pas au theme. On les nomme, pour que la raison reste lisible.
ECARTES = {
 'col': ['무', '녹차', '황사', '멍'],          # radis blanc, the vert, vent de sable, ecchymose
 'h4':  ['카페에', '냉면'],                    # forme flechie ; nouilles froides
 'h9':  ['어색하다', '불행', '새옹지마'],      # gene ; malheur ; proverbe
 'h7':  ['화장실에'],                          # forme flechie
}


def dictionnaire():
    d = open('ks-dictionary.js', encoding='utf-8').read()
    vus, out = set(), []
    for kr, fr, rom, pos in re.findall(
            r"'([^']+)':\{fr:'((?:[^'\\]|\\.)*)',rom:'([^']*)'(?:,pos:'([^']*)')?", d):
        if kr in vus:
            continue
        vus.add(kr)
        out.append({'kr': kr, 'fr': fr, 'rom': rom, 'pos': pos or ''})
    return out


def base_vocabulaire():
    s = open('vocabulaire.html', encoding='utf-8').read()
    i, j = s.index('WORDS'), s.index('THEME_LABELS')
    bloc = s[i:j]
    labels = dict(re.findall(r"'([a-z0-9]+)'\s*:\s*'((?:[^'\\]|\\.)*)'",
                             re.search(r'THEME_LABELS\s*=\s*\{(.*?)\}', s, re.S).group(1)))
    mots = {}
    for m in re.finditer(r"\{([^{}]*)\}", bloc):
        # Une traduction qui contient une apostrophe est ecrite entre guillemets
        # DOUBLES (fr:"C'est cher") : ne chercher que les simples laissait ces
        # mots-la sans traduction, c'est-a-dire inutilisables.
        champ = {}
        for cle, v1, v2 in re.findall(
                r"""(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")""",
                m.group(1)):
            champ[cle] = (v1 or v2).replace("\\'", "'")
        lec = re.search(r"lec\s*:\s*'?([a-z0-9]+)'?", m.group(1))
        if not champ.get('kr') or not lec:
            continue
        mots.setdefault(lec.group(1), []).append(
            {'kr': champ['kr'], 'fr': champ.get('fr', ''), 'rom': champ.get('rom', ''),
             'decoupe': champ.get('break', '')})
    return mots, labels


def noyau(fr, mc):
    """Le mot-cle est-il le noyau de la traduction, pas un qualificatif ?"""
    t = re.sub(r'\([^)]*\)', '', fr).strip().lower()
    t = re.split(r'[/,;]', t)[0].strip()
    return t == mc or t.startswith(mc + ' ') or t == mc + 's'


def theme(code, dico, base):
    mcs = CHAMPS.get(code, [])
    ecartes = set(ECARTES.get(code, []))
    out = {w['kr']: dict(w, source='vocabulaire') for w in base.get(code, [])
           if w['kr'] not in ecartes}
    for e in dico:
        if e['kr'] in out or e['kr'] in ecartes or GUILL.search(e['fr']):
            continue
        fr = e['fr'].lower()
        for mc in mcs:
            if not re.search(r'\b' + re.escape(mc) + r'\b', fr):
                continue
            if code in FERMES and not noyau(e['fr'], mc):
                continue
            out[e['kr']] = dict(e, decoupe='', source='dictionnaire')
            break
    return list(out.values())


if __name__ == '__main__':
    import json
    dico = dictionnaire()
    base, labels = base_vocabulaire()
    res = {}
    print('%-22s %5s %5s %6s' % ('theme', 'voc', 'dico', 'total'))
        # « Nombres » est deja couvert par pdf/nombres-coreens.html : pas de page
    for code in ['h2','h3','h4','h5','h6','h7','h8','h9','h10','h11','fam','col','tps']:
        mots = theme(code, dico, base)
        res[code] = {'label': labels.get(code, code), 'mots': mots}
        nv = sum(1 for m in mots if m['source'] == 'vocabulaire')
        print('  %-20s %5d %5d %6d' % (labels.get(code, code), nv, len(mots) - nv, len(mots)))
    json.dump(res, open('_vocab_themes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('\n%d themes ecrits dans _vocab_themes.json' % len(res))
