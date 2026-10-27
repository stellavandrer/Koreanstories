# -*- coding: utf-8 -*-
"""Romanisation revisee (RR) pour les champs .ex-rom de grammaire.html.

Syllabe par syllabe, avec deux regles qui evitent les romanisations fausses :
  - liaison devant un ㅇ muet   : 재미있어요 -> jae-mi-i-sseo-yo (et non ...-it-eo-yo)
  - finales doubles             : 없어요     -> eop-seo-yo       (et non eo-bseo-yo)
La finale ㅇ ne liaise jamais : 학생이에요 -> hak-saeng-i-e-yo.

    python3 _romanisation.py "밥을 먹고 나서 약을 드세요."
    from _romanisation import rr
"""
INI = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
VOW = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
FIN = ['','k','k','k','n','n','n','t','l','k','m','p','t','t','p','l','m','p','p','t','t','ng','t','t','k','t','p','h']
BASE, LAST = 0xAC00, 0xD7A3

def syll(c):
    n = ord(c)
    if not (BASE <= n <= LAST):
        return None
    i = n - BASE
    return INI[i // 588] + VOW[(i % 588) // 28] + FIN[i % 28]

CLUSTER = {3: ('k', 's'), 5: ('n', 'j'), 6: ('n', ''), 9: ('l', 'g'), 10: ('l', 'm'),
           11: ('l', 'b'), 12: ('l', 's'), 13: ('l', 't'), 14: ('l', 'p'), 15: ('l', ''),
           18: ('p', 's')}

FIN_LIAISON = ['', 'g', 'kk', 'ks', 'n', 'nj', 'nh', 'd', 'r', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'rh',
               'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h']

def decomp(c):
    n = ord(c) - BASE
    return n // 588, (n % 588) // 28, n % 28

def mot(m):
    """Chaque syllabe separement, SAUF quand la suivante commence par un ㅇ muet :
    la finale passe alors en attaque, comme le veut la romanisation revisee
    (재미있어요 -> jae-mi-i-sseo-yo, et non jae-mi-it-eo-yo)."""
    cars = list(m)
    out, buf, porte = [], '', ''
    for i, c in enumerate(cars):
        if not (BASE <= ord(c) <= LAST):
            if buf:
                out.append(buf); buf = ''
            if porte:
                out.append(porte); porte = ''
            out.append(c)
            continue
        ini, voy, fin = decomp(c)
        suiv = cars[i + 1] if i + 1 < len(cars) else None
        liaison = (fin not in (0, 21) and suiv is not None and BASE <= ord(suiv) <= LAST
                   and decomp(suiv)[0] == 11)          # 11 = ㅇ muet (fin 21 = ㅇ final : pas de liaison)
        tete = porte + (INI[ini] if ini != 11 or not porte else '')
        if ini != 11:
            tete = porte + INI[ini]
        elif not porte:
            tete = ''
        syl = tete + VOW[voy]
        if liaison:
            if fin in CLUSTER:          # finale double : la 1re reste, la 2e passe devant
                garde, porte = CLUSTER[fin]
                syl += garde
            else:
                porte = FIN_LIAISON[fin]
                if fin == 27:           # ㅎ devant une voyelle : il tombe
                    porte = ''
        else:
            syl += FIN[fin]
            porte = ''
        if buf:
            out.append(buf)
        buf = syl
    if buf:
        out.append(buf)
    if porte:
        out.append(porte)
    # les signes de ponctuation se collent, les syllabes se lient par un tiret
    res = ''
    for i, p in enumerate(out):
        if i == 0:
            res = p
        elif p in '.,!?;:…' or res[-1:] in '([':
            res += p
        else:
            res += '-' + p
    return res

def rr(texte):
    s = ' '.join(mot(m) for m in str(texte).split(' '))
    return (s[:1].upper() + s[1:]) if s else s

if __name__ == '__main__':
    import sys
    for t in sys.argv[1:]:
        print(t, '->', rr(t))
