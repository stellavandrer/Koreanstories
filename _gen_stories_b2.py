#!/usr/bin/env python3
"""Histoires 40-42 (B2) — réutilise le template de _gen_stories.py.
Grammaire strictement issue des leçons B2 du site (lecon36-40d, pro4)."""
import _gen_stories as G

G.VOICE.update({'bujang':'injoon','sujin':'sunhi','harabeoji':'injoon'})

B2 = [
# ═══════════ HISTOIRE 40 — 회식 ═══════════
{
 'file':'histoire40.html','num':40,'level':'B2','xp':22,'key':'ks_d35',
 'title_fr':"Le premier hoesik d'Emma",'title_kr':'에마의 첫 회식',
 'color':'#1d4ed8','color_dark':'#1e3a8a','color_bg':'29,78,216',
 'tag':'Dialogue immersif · Honorifiques & culture d\'entreprise',
 'sub':"Premier dîner d'entreprise : servir à deux mains, 드리다, 뵙겠습니다, le 2차 — les honorifiques de la leçon B2 vécus en situation réelle.",
 'listen_sub':"3 voix : Emma & Sujin (SunHi) · Directeur (InJoon)",
 'avatars':{'emma':('EM','#f59e0b'),'bujang':('부','#1d4ed8'),'sujin':('수','#ec4899')},
 'scenes':[
  {'h':'Scène 1 — Le premier verre',
   'narr_kr':'금요일 저녁, 에마의 첫 회식이 있습니다.','narr_fr':"Vendredi soir : le premier hoesik (dîner d'entreprise) d'Emma.",
   'bubbles':[
    {'sp':'bujang','side':'right','name':'Directeur (부장님)',
     'ko':'에마 씨, 한 잔 받으세요.','rom':'Emma ssi, han jan badeuseyo.',
     'fr':"Emma, acceptez un verre."},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'감사합니다, 부장님. 제가 한 잔 드리겠습니다.','rom':'Gamsahamnida, bujangnim. Jega han jan deurigesseumnida.',
     'fr':"Merci, Monsieur. Laissez-moi vous servir à mon tour. (드리다 : donner, honorifique)"},
    {'sp':'sujin','side':'left','name':'Sujin (collègue)',
     'ko':'에마 씨, 두 손으로 드려야 해요.','rom':'Emma ssi, du son-euro deuryeoya haeyo.',
     'fr':"Emma, il faut servir à deux mains. (la règle d'or du hoesik)"},
   ]},
  {'h':'Scène 2 — La conversation',
   'narr_kr':'음식이 나왔습니다. 분위기가 좋습니다.','narr_fr':"Les plats arrivent. L'ambiance est bonne.",
   'bubbles':[
    {'sp':'bujang','side':'right','name':'Directeur (부장님)',
     'ko':'에마 씨는 한국 생활이 어떻습니까?','rom':'Emma ssi-neun hanguk saenghwal-i eotteoseumnikka?',
     'fr':"Comment se passe votre vie en Corée ? (question formelle -습니까)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'처음에는 힘들었지만 지금은 정말 좋습니다. 좋은 동료들이 있기 때문입니다.','rom':'Cheoeum-eneun himdeureotjiman jigeum-eun jeongmal josseumnida. Joeun dongryodeul-i itgi ttaemun-imnida.',
     'fr':"Au début c'était dur, mais maintenant c'est génial. Parce que j'ai de bons collègues. (-기 때문입니다)"},
    {'sp':'sujin','side':'left','name':'Sujin (collègue)',
     'ko':'부장님, 에마 씨가 한국어를 정말 잘하지요?','rom':'Bujangnim, Emma ssi-ga hangugeo-reul jeongmal jalhajiyo?',
     'fr':"N'est-ce pas qu'Emma parle très bien coréen ? (-지요 : n'est-ce pas)"},
    {'sp':'bujang','side':'right','name':'Directeur (부장님)',
     'ko':'맞아요. 열심히 공부했을 텐데, 대단합니다.','rom':'Majayo. Yeolsimhi gongbuhaesseul tende, daedanhamnida.',
     'fr':"Oui. Elle a dû étudier très dur, c'est admirable. (-았을 텐데 : supposition)"},
   ]},
  {'h':'Scène 3 — La sortie',
   'narr_kr':'회식이 끝났습니다.','narr_fr':"Le hoesik se termine.",
   'bubbles':[
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'부장님, 먼저 들어가 보겠습니다. 내일 뵙겠습니다.','rom':'Bujangnim, meonjeo deureoga bogesseumnida. Naeil boepgesseumnida.',
     'fr':"Monsieur, je vais y aller. À demain. (뵙겠습니다 : voir, ultra-honorifique — LA formule de départ pro)"},
    {'sp':'bujang','side':'right','name':'Directeur (부장님)',
     'ko':'네, 조심히 가세요. 수고했어요.','rom':'Ne, josimhi gaseyo. Sugohaesseoyo.',
     'fr':"Rentrez bien. Bon travail aujourd'hui. (수고했어요 : le remerciement pro par excellence)"},
    {'sp':'sujin','side':'left','name':'Sujin (collègue)',
     'ko':'에마 씨, 같이 가요! 우리 2차는 카페로 가요!','rom':'Emma ssi, gachi gayo! Uri i-cha-neun kape-ro gayo!',
     'fr':"Emma, on y va ensemble ! Pour le 2ᵉ round, on va au café ! (2차 : la 2ᵉ étape de la soirée)"},
   ]},
 ],
 'vocab':[
  ('회식',"dîner d'entreprise"),('한 잔 받으세요',"acceptez un verre"),
  ('드리다',"donner (honorifique)"),('두 손으로',"à deux mains"),
  ('-기 때문입니다',"c'est parce que ~ (formel)"),('-았을 텐데',"a dû ~ (supposition)"),
  ('-지요?',"n'est-ce pas ?"),('뵙겠습니다',"au revoir (très honorifique)"),
  ('수고했어요',"bon travail, merci pour l'effort"),('2차',"deuxième round (de soirée)"),
  ('동료',"collègue"),('분위기',"ambiance"),
 ],
 'tip':"<strong>Culture :</strong> au hoesik, on ne se sert JAMAIS soi-même : chacun remplit le verre des autres, à deux mains pour un supérieur, et on tourne la tête en buvant devant un aîné. Le 2차 (café ou noraebang) est presque obligatoire — refuser poliment s'apprend… au niveau C1.",
 'grammar_note':"Grammaire travaillée : 드리다/뵙다 (Honorifiques approfondis) · -기 때문입니다 (Cause) · -았을 텐데 (Formes complexes B2) · -습니까 (Formel)."
},
# ═══════════ HISTOIRE 41 — 토론 ═══════════
{
 'file':'histoire41.html','num':41,'level':'B2','xp':22,'key':'ks_d36',
 'title_fr':'Le grand débat : ville ou campagne ?','title_kr':'도시 대 시골',
 'color':'#0f766e','color_dark':'#134e4a','color_bg':'15,118,110',
 'tag':'Dialogue immersif · Argumenter en coréen',
 'sub':"Trois amis, un débat : 게다가, 반면에, 따라서, -기 마련이다, -(으)ㄹ 리가 없다 — toutes les armes rhétoriques B2 dans une vraie discussion.",
 'listen_sub':"3 voix : Mina & Emma (SunHi) · Joon (InJoon)",
 'avatars':{'joon':('JN','#3b82f6'),'mina':('MN','#ec4899'),'emma':('EM','#f59e0b')},
 'scenes':[
  {'h':'Scène 1 — Les positions',
   'narr_kr':'세 친구가 카페에서 이야기합니다. 주제는 「도시와 시골」입니다.','narr_fr':"Trois amis discutent au café. Le sujet : « ville ou campagne ».",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'저는 도시가 더 좋아요. 편리하기 때문이에요. 게다가 일자리도 많아요.','rom':'Jeoneun dosi-ga deo joayo. Pyeollihagi ttaemun-ieyo. Gedaga iljari-do manayo.',
     'fr':"Moi je préfère la ville. Parce que c'est pratique. En plus, il y a plein d'emplois. (게다가 : de surcroît)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'글쎄요. 도시 생활은 스트레스가 쌓이기 마련이에요.','rom':'Geulsseyo. Dosi saenghwal-eun seuteureseu-ga ssahigi maryeon-ieyo.',
     'fr':"Mouais. En ville, le stress s'accumule inévitablement. (-기 마련이다 : c'est inévitable)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'맞아요. 반면에 시골은 공기가 좋고 조용해요.','rom':'Majayo. Banmyeon-e sigol-eun gonggi-ga joko joyonghaeyo.',
     'fr':"Exact. En revanche, à la campagne l'air est pur et c'est calme. (반면에 : en revanche)"},
   ]},
  {'h':'Scène 2 — Le débat s\'échauffe',
   'narr_kr':'토론이 뜨거워집니다.','narr_fr':"Le débat s'échauffe.",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'하지만 시골 생활이 쉬울 리가 없어요. 병원도 멀고 가게도 적어요.','rom':'Hajiman sigol saenghwal-i swiul li-ga eopseoyo. Byeongwon-do meolgo gage-do jeogeoyo.',
     'fr':"Mais la vie à la campagne ne peut PAS être facile. L'hôpital est loin, peu de commerces. (-(으)ㄹ 리가 없다 : impossible que)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'그래도 자연과 가까울수록 마음이 편해져요.','rom':'Geuraedo jayeon-gwa gakkaulsurok ma-eum-i pyeonhaejyeoyo.',
     'fr':"Quand même, plus on est proche de la nature, plus on se sent apaisé. (-(으)ㄹ수록 + -아/어지다)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'따라서 저는 둘 다 경험해 보고 싶어요. 도시에서 일하고, 주말에는 시골에 가는 거예요.','rom':'Ttaraseo jeoneun dul da gyeongheomhae bogo sipeoyo. Dosi-eseo ilhago, jumal-eneun sigol-e ganeun geoyeyo.',
     'fr':"Par conséquent, je veux vivre les deux : travailler en ville, et filer à la campagne le week-end. (따라서 : par conséquent)"},
   ]},
  {'h':'Scène 3 — La conclusion',
   'narr_kr':'토론이 끝났습니다. 결론이 났을까요?','narr_fr':"Fin du débat. Y a-t-il un verdict ?",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'결국 정답은 없는 것 같아요. 사람마다 다르기 마련이에요.','rom':'Gyeolguk jeongdap-eun eomneun geot gatayo. Saram-mada dareugi maryeon-ieyo.',
     'fr':"Au final, il n'y a pas de bonne réponse. Ça dépend forcément de chacun. (마다 : chaque)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'맞아요. 그래도 오늘 토론은 재미있었어요!','rom':'Majayo. Geuraedo oneul toron-eun jaemiisseosseoyo!',
     'fr':"Oui. En tout cas, c'était un super débat !"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'다음 주제는 「집밥과 외식」 어때요?','rom':'Da-eum juje-neun "jipbap-gwa oesik" eottaeyo?',
     'fr':"Prochain sujet : « cuisine maison ou restaurant » ? (외식 : manger dehors)"},
   ]},
 ],
 'vocab':[
  ('토론',"débat"),('주제',"sujet, thème"),('편리하다',"être pratique"),
  ('게다가',"de surcroît, en plus"),('-기 마련이다',"c'est inévitable que ~"),
  ('반면에',"en revanche"),('-(으)ㄹ 리가 없다',"impossible que ~"),
  ('-(으)ㄹ수록',"plus… plus…"),('따라서',"par conséquent"),
  ('결국',"au final"),('정답',"bonne réponse"),('~마다',"chaque ~"),('외식',"repas au restaurant"),
 ],
 'tip':"<strong>Culture :</strong> le désaccord à la coréenne est feutré : on ouvre par 글쎄요 (« mouais… »), 그래도 (« quand même ») ou 하지만, rarement par un « non » frontal. Ces connecteurs de débat sont exactement ceux attendus dans la rédaction du TOPIK II.",
 'grammar_note':"Grammaire travaillée : -기 마련이다 · -(으)ㄹ 리가 없다 (Formes rhétoriques) · 게다가 / 반면에 / 따라서 (Connecteurs formels) · -(으)ㄹ수록."
},
# ═══════════ HISTOIRE 42 — 속담 ═══════════
{
 'file':'histoire42.html','num':42,'level':'B2','xp':22,'key':'ks_d37',
 'title_fr':'Les proverbes de grand-père','title_kr':'할아버지의 속담',
 'color':'#92400e','color_dark':'#713f12','color_bg':'146,64,14',
 'tag':'Dialogue immersif · 속담 & sagesse populaire',
 'sub':"Mina apprend les proverbes avec son grand-père : 가는 말이 고와야…, 금강산도 식후경, 발 없는 말이… — les 속담 de la leçon B2 transmis comme en vraie famille coréenne.",
 'listen_sub':"2 voix : Mina (SunHi) · Harabeoji (InJoon)",
 'avatars':{'mina':('MN','#ec4899'),'harabeoji':('할','#92400e')},
 'scenes':[
  {'h':'Scène 1 — La demande',
   'narr_kr':'미나가 할아버지 댁에 갔습니다. 할아버지는 책을 읽고 계십니다.','narr_fr':"Mina rend visite à son grand-père, plongé dans un livre. (계시다 : honorifique de 있다)",
   'bubbles':[
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'할아버지, 속담을 배우고 있는데 너무 어려워요.','rom':'Harabeoji, sokdam-eul baeugo inneunde neomu eoryeowoyo.',
     'fr':"Grand-père, j'apprends les proverbes mais c'est trop dur."},
    {'sp':'harabeoji','side':'right','name':'Harabeoji',
     'ko':'하하, 속담은 삶의 지혜야. 예를 들어 볼까?','rom':'Haha, sokdam-eun salm-ui jihye-ya. Yereul deureo bolkka?',
     'fr':"Haha, les proverbes, c'est la sagesse de la vie. Je te donne un exemple ? (지혜 : sagesse)"},
   ]},
  {'h':'Scène 2 — La leçon de sagesse',
   'narr_kr':'할아버지가 속담을 설명해 주십니다.','narr_fr':"Grand-père explique les proverbes. (-아/어 주시다 : honorifique)",
   'bubbles':[
    {'sp':'harabeoji','side':'right','name':'Harabeoji',
     'ko':'「가는 말이 고와야 오는 말이 곱다」— 남에게 잘해야 남도 나에게 잘하는 법이야.','rom':'"Ganeun mal-i gowaya oneun mal-i gopda" — nam-ege jalhaeya nam-do na-ege jalhaneun beob-iya.',
     'fr':"« Si les mots qui partent sont beaux, ceux qui reviennent le sont aussi » — sois bon avec les autres, et ils le seront avec toi. (-는 법이다 : c'est la règle)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'아, 프랑스에도 비슷한 말이 있어요!','rom':'A, Peurangseu-edo biseuthan mal-i isseoyo!',
     'fr':"Ah, on a un proverbe semblable en France !"},
    {'sp':'harabeoji','side':'right','name':'Harabeoji',
     'ko':'「발 없는 말이 천 리 간다」— 말은 조심해야 한다는 뜻이지.','rom':'"Bal eomneun mal-i cheon li ganda" — mal-eun josimhaeya handaneun tteus-iji.',
     'fr':"« La parole sans pieds parcourt mille lieues » — ça veut dire qu'il faut faire attention à ce qu'on dit. (-다는 뜻 : ça signifie que)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'그럼 「금강산도 식후경」은요? 배가 고프면 아무것도 못 한다는 뜻이라고 들었어요.','rom':'Geureom "Geumgangsan-do sikhugyeong"-eun-yo? Bae-ga gopeumyeon amugeotdo mot handaneun tteus-irago deureosseoyo.',
     'fr':"Et « Même le mont Geumgang, après le repas » ? J'ai entendu dire que ça signifie qu'on ne peut rien faire le ventre vide. (-다고 들었어요 : discours rapporté)"},
   ]},
  {'h':'Scène 3 — La preuve par l\'exemple',
   'narr_kr':'할머니가 저녁을 준비하셨습니다.','narr_fr':"Grand-mère a préparé le dîner.",
   'bubbles':[
    {'sp':'harabeoji','side':'right','name':'Harabeoji',
     'ko':'자, 금강산도 식후경! 먼저 먹고 계속하자.','rom':'Ja, Geumgangsan-do sikhugyeong! Meonjeo meokgo gyesokhaja.',
     'fr':"Allez : même le mont Geumgang attend la fin du repas ! On mange d'abord, on continue après."},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'하하, 네! 할아버지 덕분에 속담이 재미있어졌어요.','rom':'Haha, ne! Harabeoji deokbun-e sokdam-i jaemiisseojyeosseoyo.',
     'fr':"Haha, oui ! Grâce à toi, les proverbes sont devenus amusants. (덕분에 : grâce à)"},
   ]},
 ],
 'vocab':[
  ('속담',"proverbe"),('지혜',"sagesse"),('예를 들다',"donner un exemple"),
  ('-는 법이다',"c'est la règle que ~"),('가는 말이 고와야 오는 말이 곱다',"la politesse appelle la politesse"),
  ('발 없는 말이 천 리 간다',"les rumeurs voyagent vite"),('금강산도 식후경',"le ventre d'abord, le reste après"),
  ('-다는 뜻',"ça signifie que ~"),('-다고 들었어요',"j'ai entendu dire que ~"),
  ('덕분에',"grâce à"),('계시다',"être (honorifique)"),
 ],
 'tip':"<strong>Culture :</strong> les 속담 sont partout — pubs, dramas, discours politiques. En placer un au bon moment impressionne instantanément les Coréens. Ces trois-là sont exactement ceux de ta leçon « Proverbes coréens essentiels » : tu viens de les voir vivre.",
 'grammar_note':"Grammaire travaillée : 속담 (Proverbes essentiels) · -는 법이다 (Formes rhétoriques) · -다는 뜻 / -다고 들었어요 (Discours indirect avancé) · 계시다 (Honorifiques)."
},
]

for s in B2:
    html = G.page(s)
    open(s['file'], 'w', encoding='utf-8').write(html)
    nb = sum(len(sc['bubbles']) for sc in s['scenes'])
    print(f"✓ {s['file']} — {s['level']} · {nb} bulles · {len(s['vocab'])} mots · {s['key']}")
print('B2 done.')
