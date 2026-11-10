# -*- coding: utf-8 -*-
"""Deuxieme passe : les fiches que la premiere requete n'a pas trouvees.

Deux causes identifiees :
  - « -(으)ㄹ 거예요 » devenait « -으ㄹ 거예요 » en otant les parentheses.
    Un jamo isole ne forme pas une syllabe : (으)ㄹ doit redevenir 을.
  - krdict range les expressions sous leur forme de dictionnaire :
    « -고 싶어요 » n'est pas un mot-vedette, « -고 싶다 » l'est.
"""
import json, os, re, sys, time
sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('m', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'moissonne.py'))

import html as H, subprocess
from urllib.parse import quote
import _extraire_grammaire as E

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
BASE = ('https://krdict.korean.go.kr/eng/dicMarinerSearch/search'
        '?nation=eng&nationCode=6&ParaWordNo=&mainSearchWord=')
KR = re.compile(r'[가-힣㄰-㆏]')
# (으)+jamo -> la syllabe reelle, calculee et non tapee
JAMO_SYL = {'ㄹ': chr(0xAC00 + (18*21 + 18)*28 + 8),   # 을
            'ㄴ': chr(0xAC00 + (11*21 + 18)*28 + 4),   # 은
            'ㅁ': chr(0xAC00 + (11*21 + 18)*28 + 16)}  # 음

def nettoie(x):
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', x))).strip()

def candidats(titre):
    t = re.sub(r'<[^>]+>', '', titre).split(':')[0]
    t = t.replace('·', '|').replace('/', '|').replace('&', '|')
    t = re.sub(r'\bvs\b|\bet\b', '|', t)
    out = []
    def add(v):
        v = v.strip()
        if v and KR.search(v) and v not in out:
            out.append(v)
    for part in t.split('|'):
        p = part.strip()
        if not p or not KR.search(p):
            continue
        # (으)ㄹ -> 을 ; (으)ㄴ -> 은 ; (으)ㅁ -> 음
        fusion = re.sub(r'\(으\)([ㄹㄴㅁ])', lambda m: JAMO_SYL[m.group(1)], p)
        add(fusion)
        add(re.sub(r'\(으\)([ㄹㄴㅁ])', r'\1', p))      # garde le jamo seul
        add(p.replace('(', '').replace(')', ''))
        add(re.sub(r'\([^)]*\)', '', p).strip())
        for v in list(out):
            # forme de dictionnaire : ...어요/아요/예요/이다 -> ...다
            d = re.sub(r'(어요|아요|예요|해요)$', '다', v)
            if d != v: add(d)
            d2 = re.sub(r'(습니다|ㅂ니다)$', '다', v)
            if d2 != v: add(d2)
            add(v.lstrip('-'))                          # particules : sans tiret
    return out

def entrees(page, mot):
    res = []
    for dl in re.findall(r'<dl>(.*?)</dl>', page, re.S):
        m = re.search(r'class="word_type1_17"[^>]*>(.*?)</span>', dl, re.S)
        if not m or nettoie(m.group(1)) != mot:
            continue
        pos = ''
        mp = re.search(r'class="word_att_type1"[^>]*>(.*?)</span>\s*</span>', dl, re.S)
        if mp: pos = nettoie(mp.group(1))
        sens = [nettoie(dd) for dd in re.findall(r'<dd[^>]*>(.*?)</dd>', dl, re.S)]
        sens = [s for s in sens if len(s) >= 12]
        if sens: res.append({'tete': mot, 'pos': pos, 'sens': sens})
    return res

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    d = json.load(open(os.path.join(base, 'krdict_grammaire.json'), encoding='utf-8'))
    vides = [i for i, b in d.items()
             if sum(len(e['sens']) for fs in b['formes'].values() for e in fs) == 0]
    print('fiches a rattraper :', len(vides), flush=True)
    fiches = {f['id']: f for f in E.fiches()}
    for n, i in enumerate(vides, 1):
        f = fiches[i]
        trouve = 0
        for c in candidats(f['titre'])[:9]:
            if c in d[i]['formes'] and d[i]['formes'][c]:
                continue
            r = subprocess.run(['curl','-s','--max-time','25','-A',UA,BASE+quote(c)],
                               capture_output=True, text=True)
            ent = entrees(r.stdout, c)
            if ent:
                d[i]['formes'][c] = ent
                trouve += sum(len(e['sens']) for e in ent)
            time.sleep(1.1)
        print('%2d/%d  %-5s %-32s %d sens' % (n, len(vides), i,
              re.sub(r'<[^>]+>','',f['titre'])[:32], trouve), flush=True)
    json.dump(d, open(os.path.join(base,'krdict_grammaire.json'),'w',encoding='utf-8'),
              ensure_ascii=False, indent=1)
    reste = [i for i,b in d.items()
             if sum(len(e['sens']) for fs in b['formes'].values() for e in fs)==0]
    print('encore vides :', len(reste), reste)

main()
