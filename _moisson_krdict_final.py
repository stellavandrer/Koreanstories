# -*- coding: utf-8 -*-
"""Passe finale : mots-vedettes releves a la main sur krdict.

Deux causes restantes :
  - krdict numerote les homographes (« 이 3 », « -다고 1 »). Mon test
    d'egalite echouait dessus : il faut comparer sans le numero.
  - certaines tournures ne SONT pas des mots-vedettes (« -기 때문에 »,
    « -을 거예요 »). Pour celles-la il n'y a pas de source officielle, et
    on n'inventera pas : la fiche gardera simplement sa forme actuelle.
"""
# La cle « _licence » du JSON porte les conditions de redistribution :
# ce n'est pas une fiche, on la saute partout.
import html as H, json, os, re, subprocess, time
from urllib.parse import quote
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
BASE=('https://krdict.korean.go.kr/eng/dicMarinerSearch/search'
      '?nation=eng&nationCode=6&ParaWordNo=&mainSearchWord=')

# Releve a la main : fiche -> (requete, POS attendue). La POS evite de
# ramasser le mauvais homographe (« 이 » le nom, la dent, au lieu de la particule).
CIBLES = {
 'g02': [('이','조사'), ('가','조사')],
 'g04': [('이다','조사')],
 'g06': [('안','부사')],
 'g07': [('-았-','어미'), ('-었-','어미')],
 'g20': [('-어 보다',''), ('-아 보다','')],
 'g26': [('-다고','어미'), ('-ㄴ다고','어미')],
 'g29': [('-기','어미'), ('-음','어미')],
 'g40': [('-을까 보다',''), ('-ㄹ까 보다','')],
 'g45': [('-었더니',''), ('-았더니','')],
 'g50': [('-고자','어미')],
 'g53': [('-ㄴ다','어미'), ('-는다','어미')],
}
def net(x): return re.sub(r'\s+',' ',H.unescape(re.sub(r'<[^>]+>',' ',x))).strip()
def sansnum(t): return re.sub(r'\s*\d+$','',t).strip()

def entrees(page, mot, pos_attendue):
    res=[]
    for dl in re.findall(r'<dl>(.*?)</dl>', page, re.S):
        m=re.search(r'class="word_type1_17"[^>]*>(.*?)</span>',dl,re.S)
        if not m or sansnum(net(m.group(1))) != mot:
            continue
        pos=''
        mp=re.search(r'class="word_att_type1"[^>]*>(.*?)</span>\s*</span>',dl,re.S)
        if mp: pos=net(mp.group(1))
        if pos_attendue and pos_attendue not in pos:
            continue
        sens=[net(dd) for dd in re.findall(r'<dd[^>]*>(.*?)</dd>', dl, re.S)]
        sens=[x for x in sens if len(x)>=12]
        if sens: res.append({'tete':net(m.group(1)),'pos':pos,'sens':sens})
    return res

base=os.path.dirname(os.path.abspath(__file__))
d=json.load(open(os.path.join(base,'krdict_grammaire.json'),encoding='utf-8'))
for i,(reqs) in CIBLES.items():
    tot=0
    for q,pos in reqs:
        r=subprocess.run(['curl','-s','--max-time','25','-A',UA,BASE+quote(q)],
                         capture_output=True,text=True)
        ent=entrees(r.stdout,q,pos)
        if ent:
            d[i]['formes'][q]=ent
            tot+=sum(len(e['sens']) for e in ent)
        time.sleep(1.1)
    print('%-5s %-34s %d sens' % (i, d[i]['titre'][:34], tot), flush=True)
json.dump(d,open(os.path.join(base,'krdict_grammaire.json'),'w',encoding='utf-8'),
          ensure_ascii=False,indent=1)
vides=[i for i,b in d.items() if i!='_licence' and sum(len(e['sens']) for fs in b['formes'].values() for e in fs)==0]
print()
print('fiches AVEC source officielle :', len(d)-len(vides), '/', len(d))
print('sans source (pas de mot-vedette) :', [ (i, d[i]['titre'][:30]) for i in vides])
