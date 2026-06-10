#!/usr/bin/env python3
"""Générateur des histoires 34-39 (A2/B1) — template histoire33."""
import json

VOICE = {'mina':'sunhi','emma':'sunhi','jiwoo':'sunhi','halmeoni':'sunhi','chef':'sunhi',
         'joon':'injoon','agent':'injoon','interviewer':'injoon'}

STORIES = [
# ═══════════════════ HISTOIRE 34 — A2 ═══════════════════
{
 'file':'histoire34.html','num':34,'level':'A2','xp':18,'key':'ks_b43',
 'title_fr':"À l'agence immobilière",'title_kr':'부동산에서',
 'color':'#0d9488','color_dark':'#115e59','color_bg':'13,148,136',
 'tag':'Dialogue immersif · Logement & comparaisons',
 'sub':"Emma cherche un studio avec Mina. Comparer (보다/더/제일), demander poliment, parler budget — la grammaire A2 en situation réelle.",
 'listen_sub':"3 voix : Emma & Mina (SunHi) · Agent (InJoon)",
 'avatars':{'emma':('EM','#f59e0b'),'mina':('MN','#ec4899'),'agent':('부','#0d9488')},
 'scenes':[
  {'h':"Scène 1 — L'accueil",
   'narr_kr':'에마와 미나가 부동산에 가요.','narr_fr':"Emma et Mina entrent dans une agence immobilière.",
   'bubbles':[
    {'sp':'agent','side':'right','name':'Agent immobilier',
     'ko':'어서 오세요. 어떤 방을 찾으세요?','rom':'Eoseo oseyo. Eotteon bang-eul chajeuseyo?',
     'fr':"Bienvenue. Quel type de logement cherchez-vous ?"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'안녕하세요. 원룸을 찾고 있어요.','rom':'Annyeonghaseyo. Wollum-eul chatgo isseoyo.',
     'fr':"Bonjour. Je cherche un studio. (-고 있어요 : action en cours)"},
    {'sp':'agent','side':'right','name':'Agent immobilier',
     'ko':'예산은 얼마예요?','rom':'Yesan-eun eolmayeyo?',
     'fr':"Quel est votre budget ?"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'한 달에 오십만 원쯤이에요.','rom':'Han dal-e osimman won-jjeum-ieyo.',
     'fr':"Environ 500 000 wons par mois."},
   ]},
  {'h':'Scène 2 — La première visite',
   'narr_kr':'세 사람이 첫 번째 방을 봐요.','narr_fr':"Tous les trois visitent un premier studio.",
   'bubbles':[
    {'sp':'agent','side':'right','name':'Agent immobilier',
     'ko':'이 방은 지하철역에서 가까워요.','rom':'I bang-eun jihacheollyeok-eseo gakkawoyo.',
     'fr':"Ce studio est proche de la station de métro."},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'방이 좀 작은 것 같아요.','rom':'Bang-i jom jageun geot gatayo.',
     'fr':"La pièce me semble un peu petite. (-것 같다 : opinion douce)"},
    {'sp':'agent','side':'right','name':'Agent immobilier',
     'ko':'그럼 두 번째 방을 보여 드릴게요.','rom':'Geureom du beonjjae bang-eul boyeo deurilgeyo.',
     'fr':"Alors je vous montre le deuxième. (보여 드리다 : montrer, honorifique)"},
   ]},
  {'h':'Scène 3 — Le coup de cœur',
   'narr_kr':'두 사람이 두 번째 방을 봐요.','narr_fr':"Elles visitent le deuxième studio.",
   'bubbles':[
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'와, 이 방이 더 커요! 창문도 커요.','rom':'Wa, i bang-i deo keoyo! Changmun-do keoyo.',
     'fr':"Wahou, celui-ci est plus grand ! La fenêtre aussi est grande."},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'맞아요. 그리고 부엌도 더 예뻐요.','rom':'Majayo. Geurigo bueok-do deo yeppeoyo.',
     'fr':"Oui. Et la cuisine est plus jolie aussi."},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'여기가 제일 마음에 들어요. 얼마예요?','rom':'Yeogi-ga jeil ma-eum-e deureoyo. Eolmayeyo?',
     'fr':"C'est celui-ci que je préfère. (제일 : le plus) C'est combien ?"},
    {'sp':'agent','side':'right','name':'Agent immobilier',
     'ko':'한 달에 사십오만 원이에요.','rom':'Han dal-e sasibo-man won-ieyo.',
     'fr':"450 000 wons par mois."},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'좋아요! 이 방으로 할게요.','rom':'Joayo! I bang-euro halgeyo.',
     'fr':"Parfait ! Je prends celui-ci. ((으)로 하다 : choisir)"},
   ]},
 ],
 'vocab':[
  ('부동산',"agence immobilière"),('원룸',"studio (one-room)"),('예산',"budget"),
  ('한 달에',"par mois"),('~쯤',"environ"),('지하철역',"station de métro"),
  ('가깝다',"être proche"),('~보다 더',"plus … que ~ (comparaison)"),
  ('제일',"le plus (superlatif)"),('마음에 들다',"plaire"),
  ('보여 드릴게요',"je vous montre (honorifique)"),('창문',"fenêtre"),
  ('(으)로 할게요',"je choisis ~, je prends ~"),
 ],
 'tip':"<strong>Culture :</strong> en Corée, on loue surtout en <em>wolse</em> (월세 : loyer mensuel + caution) ou en <em>jeonse</em> (전세 : énorme dépôt, pas de loyer). Les agences immobilières (부동산) sont partout — souvent tenues par des ajusshi très bavards qui connaissent tout le quartier.",
 'grammar_note':"Grammaire travaillée : ~보다 더 / 제일 (leçon Comparaisons) · -고 있어요 (Progressif) · -것 같다 (Opinion) · 보여 드릴게요 (Requêtes polies)."
},
# ═══════════════════ HISTOIRE 35 — A2 ═══════════════════
{
 'file':'histoire35.html','num':35,'level':'A2','xp':18,'key':'ks_b44',
 'title_fr':'Le kimbap de Joon','title_kr':'김밥 만들기',
 'color':'#dc2626','color_dark':'#991b1b','color_bg':'220,38,38',
 'tag':'Dialogue immersif · Cuisine & instructions',
 'sub':"Joon apprend à Mina à rouler le kimbap. Expérience (-아/어 봤어요), instructions (-아/어 주세요), durée (동안, 후에) — on cuisine en coréen.",
 'listen_sub':"2 voix : Mina (SunHi) · Joon (InJoon)",
 'avatars':{'mina':('MN','#ec4899'),'joon':('JN','#3b82f6')},
 'scenes':[
  {'h':'Scène 1 — Le défi',
   'narr_kr':'토요일 오후예요. 미나와 준이 부엌에 있어요.','narr_fr':"Samedi après-midi. Mina et Joon sont dans la cuisine.",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'김밥을 만들어 봤어요?','rom':'Gimbap-eul mandeureo bwasseoyo?',
     'fr':"Tu as déjà essayé de faire du kimbap ? (-아/어 봤어요 : expérience)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'아니요, 한 번도 안 만들어 봤어요.','rom':'Aniyo, han beon-do an mandeureo bwasseoyo.',
     'fr':"Non, je n'ai jamais essayé. (한 번도 + 안 : pas une seule fois)"},
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'걱정하지 마세요. 제가 도와줄게요.','rom':'Geokjeonghaji maseyo. Jega dowajulgeyo.',
     'fr':"Ne t'inquiète pas. Je vais t'aider."},
   ]},
  {'h':'Scène 2 — En cuisine',
   'narr_kr':'두 사람이 재료를 준비해요.','narr_fr':"Ils préparent les ingrédients.",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'먼저 밥에 참기름을 넣어 주세요.','rom':'Meonjeo bap-e chamgireum-eul neoeo juseyo.',
     'fr':"D'abord, ajoute l'huile de sésame au riz. (-아/어 주세요 : requête)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'이렇게요?','rom':'Ireoke-yo?',
     'fr':"Comme ça ?"},
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'네, 잘하고 있어요!','rom':'Ne, jalhago isseoyo!',
     'fr':"Oui, tu te débrouilles très bien ! (-고 있어요 : en train de)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'김밥을 만드는 동안 음악을 들어도 돼요?','rom':'Gimbap-eul mandeuneun dong-an eumak-eul deureodo dwaeyo?',
     'fr':"On peut écouter de la musique pendant qu'on cuisine ? (동안 + -아도 돼요)"},
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'네, 좋아요!','rom':'Ne, joayo!',
     'fr':"Oui, bonne idée !"},
   ]},
  {'h':'Scène 3 — La dégustation',
   'narr_kr':'삼십 분 후에 김밥이 완성돼요.','narr_fr':"Trente minutes plus tard, le kimbap est prêt.",
   'bubbles':[
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'와! 김밥이 정말 예뻐요!','rom':'Wa! Gimbap-i jeongmal yeppeoyo!',
     'fr':"Wahou ! Il est magnifique ce kimbap !"},
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'한번 먹어 보세요.','rom':'Hanbeon meogeo boseyo.',
     'fr':"Goûte-le. (-아/어 보세요 : essaie de)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'음… 진짜 맛있어요! 식당 김밥보다 더 맛있어요!','rom':'Eum… jinjja masisseoyo! Sikdang gimbap-boda deo masisseoyo!',
     'fr':"Mmm… vraiment délicieux ! Meilleur que celui du restaurant ! (~보다 더)"},
    {'sp':'joon','side':'right','name':'Joon',
     'ko':'다음에는 떡볶이도 같이 만들어요!','rom':'Da-eum-eneun tteokbokki-do gachi mandeureoyo!',
     'fr':"La prochaine fois, on fait aussi des tteokbokki ensemble !"},
   ]},
 ],
 'vocab':[
  ('김밥',"kimbap (rouleau de riz)"),('만들다',"faire, fabriquer"),
  ('-아/어 봤어요',"avoir déjà essayé (expérience)"),('한 번도',"pas une seule fois"),
  ('도와주다',"aider"),('먼저',"d'abord"),('재료',"ingrédients"),
  ('참기름',"huile de sésame"),('넣다',"mettre, ajouter"),
  ('-는 동안',"pendant que"),('-아/어도 돼요?',"est-ce qu'on peut ~ ?"),
  ('~후에',"après ~"),('완성되다',"être terminé"),('~보다 더',"plus … que ~"),
 ],
 'tip':"<strong>Culture :</strong> le kimbap est LE plat des pique-niques (소풍) et des sorties scolaires. Chaque famille a sa recette, et débattre de ce qu'on met dedans (thon-mayo ? bulgogi ? fromage ?) est un sport national.",
 'grammar_note':"Grammaire travaillée : -아/어 봤어요 (Expérience) · -아/어 주세요 (Requêtes) · -는 동안 / 후에 (Temps & Durée) · -아/어도 돼요 (Permission)."
},
# ═══════════════════ HISTOIRE 36 — A2 ═══════════════════
{
 'file':'histoire36.html','num':36,'level':'A2','xp':18,'key':'ks_b45',
 'title_fr':"L'anniversaire de Jiwoo",'title_kr':'지우의 생일',
 'color':'#db2777','color_dark':'#9d174d','color_bg':'219,39,119',
 'tag':'Dialogue immersif · Fête & nuances -잖아요/-거든요',
 'sub':"Mina et Emma fêtent l'anniversaire de Jiwoo : cadeau, miyeokguk et chanson. Les nuances -잖아요 / -거든요 et l'expérience -본 적이 없어요 en contexte.",
 'listen_sub':"3 voix féminines : Jiwoo, Mina & Emma (SunHi)",
 'avatars':{'jiwoo':('JW','#8b5cf6'),'mina':('MN','#ec4899'),'emma':('EM','#f59e0b')},
 'scenes':[
  {'h':'Scène 1 — Les vœux',
   'narr_kr':'오늘은 지우의 생일이에요. 미나와 에마가 선물을 준비했어요.','narr_fr':"Aujourd'hui, c'est l'anniversaire de Jiwoo. Mina et Emma ont préparé un cadeau.",
   'bubbles':[
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'지우 씨, 생일 축하해요!','rom':'Jiwoo ssi, saeng-il chukhahaeyo!',
     'fr':"Jiwoo, joyeux anniversaire !"},
    {'sp':'jiwoo','side':'right','name':'Jiwoo',
     'ko':'와 줘서 정말 고마워요!','rom':'Wa jwoseo jeongmal gomawoyo!',
     'fr':"Merci beaucoup d'être venues ! (와 주다 + -아서)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'이거 선물이에요. 받아 주세요.','rom':'Igeo seonmul-ieyo. Bada juseyo.',
     'fr':"Voici un cadeau. Accepte-le, s'il te plaît."},
   ]},
  {'h':'Scène 2 — Le cadeau',
   'narr_kr':'지우가 선물을 열어 봐요.','narr_fr':"Jiwoo ouvre le cadeau.",
   'bubbles':[
    {'sp':'jiwoo','side':'right','name':'Jiwoo',
     'ko':'우와, 컵이 정말 예뻐요! 잘 쓸게요.','rom':'Uwa, keop-i jeongmal yeppeoyo! Jal sseulgeyo.',
     'fr':"Wahou, la tasse est superbe ! Je m'en servirai bien."},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'지우 씨는 커피를 좋아하잖아요.','rom':'Jiwoo ssi-neun keopi-reul joahajanayo.',
     'fr':"Tu adores le café, on le sait bien. (-잖아요 : rappel d'une évidence)"},
    {'sp':'jiwoo','side':'right','name':'Jiwoo',
     'ko':'맞아요. 매일 아침에 커피를 마시거든요.','rom':'Majayo. Maeil achim-e keopi-reul masigeodeunyo.',
     'fr':"C'est vrai. Figure-toi que j'en bois chaque matin. (-거든요 : info que l'autre ignore)"},
   ]},
  {'h':'Scène 3 — La soupe et la chanson',
   'narr_kr':'친구들이 미역국을 먹어요.','narr_fr':"Les amies mangent la soupe d'algues.",
   'bubbles':[
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'생일에 미역국을 먹어 본 적이 없어요. 왜 먹어요?','rom':'Saeng-il-e miyeokguk-eul meogeo bon jeogi eopseoyo. Wae meogeoyo?',
     'fr':"Je n'ai jamais mangé de soupe d'algues à un anniversaire. Pourquoi on en mange ? (-본 적이 없다)"},
    {'sp':'jiwoo','side':'right','name':'Jiwoo',
     'ko':'한국 전통이에요. 건강에 좋거든요.','rom':'Hanguk jeontong-ieyo. Geongang-e joke-deunyo.',
     'fr':"C'est une tradition coréenne. C'est bon pour la santé, tu sais. (-거든요)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'자, 케이크 먹기 전에 노래를 불러요!','rom':'Ja, keikeu meokgi jeon-e norae-reul bulleoyo!',
     'fr':"Allez, avant de manger le gâteau, on chante ! (~기 전에 : avant de)"},
    {'sp':'jiwoo','side':'right','name':'Jiwoo',
     'ko':'고마워요. 오늘 정말 행복해요!','rom':'Gomawoyo. Oneul jeongmal haengbokhaeyo!',
     'fr':"Merci. Je suis vraiment heureuse aujourd'hui !"},
   ]},
 ],
 'vocab':[
  ('생일',"anniversaire"),('축하해요',"félicitations !"),('선물',"cadeau"),
  ('받다',"recevoir, accepter"),('열어 보다',"ouvrir (pour voir)"),
  ('컵',"tasse, gobelet"),('쓰다',"utiliser"),
  ('-잖아요',"tu sais bien que… (rappel)"),('-거든요',"figure-toi que… (info nouvelle)"),
  ('미역국',"soupe d'algues"),('-본 적이 없다',"ne jamais avoir fait"),
  ('전통',"tradition"),('건강',"santé"),('~기 전에',"avant de ~"),('행복하다',"être heureux·se"),
 ],
 'tip':"<strong>Culture :</strong> la soupe d'algues (미역국) se mange le jour de son anniversaire en hommage à sa mère — c'est le plat que mangent les Coréennes après l'accouchement. Attention : ne JAMAIS en manger le jour d'un examen, ça « fait glisser » la réussite !",
 'grammar_note':"Grammaire travaillée : -잖아요 / -거든요 (Exprimer la raison) · -본 적이 없다 (Expérience) · ~기 전에 (Temps & Durée)."
},
# ═══════════════════ HISTOIRE 37 — B1 ═══════════════════
{
 'file':'histoire37.html','num':37,'level':'B1','xp':20,'key':'ks_c36',
 'title_fr':"L'entretien d'embauche",'title_kr':'에마의 면접',
 'color':'#2563eb','color_dark':'#1e40af','color_bg':'37,99,235',
 'tag':'Dialogue immersif · Registre formel 합쇼체',
 'sub':"Emma passe un entretien dans une entreprise coréenne. Tout en -습니다 : se présenter, répondre aux questions, remercier — le coréen formel en immersion.",
 'listen_sub':"2 voix : Emma (SunHi) · Recruteur (InJoon)",
 'avatars':{'emma':('EM','#f59e0b'),'interviewer':('면','#2563eb')},
 'scenes':[
  {'h':'Scène 1 — La présentation',
   'narr_kr':'에마가 회사 면접을 보러 갑니다. 많이 긴장했습니다.','narr_fr':"Emma se rend à un entretien d'embauche. Elle est très nerveuse. (narration en style formel -ㅂ니다)",
   'bubbles':[
    {'sp':'interviewer','side':'right','name':'Recruteur',
     'ko':'안녕하십니까. 자기소개를 해 주시겠습니까?','rom':'Annyeonghasimnikka. Jagisogae-reul hae jusigesseumnikka?',
     'fr':"Bonjour. Pourriez-vous vous présenter ? (-아/어 주시겠습니까 : requête très formelle)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'안녕하십니까. 저는 에마라고 합니다. 프랑스에서 왔습니다.','rom':'Annyeonghasimnikka. Jeoneun Emma-rago hamnida. Peurangseu-eseo wasseumnida.',
     'fr':"Bonjour. Je m'appelle Emma. (-라고 합니다) Je viens de France."},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'한국 회사에서 일하고 싶어서 한국어를 열심히 공부했습니다.','rom':'Hanguk hoesa-eseo ilhago sipeoseo hangugeo-reul yeolsimhi gongbuhaesseumnida.',
     'fr':"Comme je veux travailler dans une entreprise coréenne, j'ai étudié le coréen assidûment."},
   ]},
  {'h':'Scène 2 — Les questions',
   'narr_kr':'면접관이 질문을 합니다.','narr_fr':"Le recruteur pose ses questions.",
   'bubbles':[
    {'sp':'interviewer','side':'right','name':'Recruteur',
     'ko':'왜 우리 회사에서 일하고 싶습니까?','rom':'Wae uri hoesa-eseo ilhago sipseumnikka?',
     'fr':"Pourquoi voulez-vous travailler chez nous ?"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'이 회사가 만든 게임을 정말 좋아하기 때문입니다.','rom':'I hoesa-ga mandeun geim-eul jeongmal joahagi ttaemun-imnida.',
     'fr':"Parce que j'adore les jeux que crée cette entreprise. (relative 만든 + -기 때문입니다)"},
    {'sp':'interviewer','side':'right','name':'Recruteur',
     'ko':'한국어를 정말 잘하시네요.','rom':'Hangugeo-reul jeongmal jalhasineyo.',
     'fr':"Vous parlez vraiment bien coréen. (-시- honorifique + -네요 surprise)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'감사합니다. 아직 배울 것이 많습니다.','rom':'Gamsahamnida. Ajik baeul geosi manseumnida.',
     'fr':"Merci. J'ai encore beaucoup à apprendre. (배울 것 : relative au futur)"},
   ]},
  {'h':'Scène 3 — Le résultat',
   'narr_kr':'면접이 끝났습니다.','narr_fr':"L'entretien se termine.",
   'bubbles':[
    {'sp':'interviewer','side':'right','name':'Recruteur',
     'ko':'결과는 다음 주에 알려 드리겠습니다.','rom':'Gyeolgwa-neun da-eum ju-e allyeo deurigesseumnida.',
     'fr':"Nous vous communiquerons le résultat la semaine prochaine. (-겠습니다 : engagement formel)"},
    {'sp':'emma','side':'left','name':'Emma',
     'ko':'네, 감사합니다. 좋은 하루 보내십시오.','rom':'Ne, gamsahamnida. Jo-eun haru bonaesipsio.',
     'fr':"Merci. Passez une bonne journée. (-(으)십시오 : impératif formel)"},
   ],
   'narr2_kr':'일주일 후, 에마는 합격했다는 연락을 받았습니다!','narr2_fr':"Une semaine plus tard, Emma reçoit un message : elle est prise ! (-다는 : discours rapporté)"},
 ],
 'vocab':[
  ('면접',"entretien d'embauche"),('회사',"entreprise"),('긴장하다',"être nerveux·se"),
  ('자기소개',"présentation de soi"),('-라고 합니다',"je m'appelle ~ (formel)"),
  ('열심히',"assidûment, avec ardeur"),('질문',"question"),
  ('-기 때문입니다',"c'est parce que ~ (formel)"),('배울 것',"choses à apprendre"),
  ('결과',"résultat"),('알려 드리다',"informer (honorifique)"),
  ('-겠습니다',"je ferai ~ (engagement formel)"),('합격하다',"être reçu·e, réussir"),
  ('연락',"contact, message"),
 ],
 'tip':"<strong>Culture :</strong> l'entretien coréen est ultra-codifié : costume sombre, photo sur le CV, légère inclinaison du buste en entrant, et le fameux 안녕하십니까 d'ouverture. Les questions sur l'âge ou la situation familiale, choquantes en France, y restent courantes.",
 'grammar_note':"Grammaire travaillée : -습니다/-습니까 (Formes formelles) · -라고 합니다 (Discours indirect) · -기 때문에 (Cause avancée) · 만든/배울 (Propositions relatives)."
},
# ═══════════════════ HISTOIRE 38 — B1 ═══════════════════
{
 'file':'histoire38.html','num':38,'level':'B1','xp':20,'key':'ks_c37',
 'title_fr':'Soirée au bord du Han','title_kr':'한강 캠핑',
 'color':'#16a34a','color_dark':'#166534','color_bg':'22,163,74',
 'tag':'Dialogue immersif · 반말 entre amis vs 존댓말',
 'sub':"Mina, Joon et Emma passent la soirée au parc du Han. Mina et Joon se parlent en banmal, Emma reste en jondaemal — entends la différence des deux registres.",
 'listen_sub':"3 voix : Mina & Emma (SunHi) · Joon (InJoon)",
 'avatars':{'mina':('MN','#ec4899'),'joon':('JN','#3b82f6'),'emma':('EM','#f59e0b')},
 'scenes':[
  {'h':'Scène 1 — Le plan',
   'narr_kr':'금요일 저녁, 세 친구가 한강 공원에 가기로 했어요.','narr_fr':"Vendredi soir, les trois amis ont décidé d'aller au parc du Han. (-기로 하다 : décision)",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon (반말)',
     'ko':'미나야, 우리 텐트 가져갈까?','rom':'Mina-ya, uri tenteu gajyeogalkka?',
     'fr':"Mina, on prend la tente ? (banmal entre amis proches)"},
    {'sp':'mina','side':'left','name':'Mina (반말)',
     'ko':'좋아! 비가 오면 텐트가 필요하잖아.','rom':'Joa! Bi-ga omyeon tenteu-ga piryohajana.',
     'fr':"Oui ! S'il pleut, on aura besoin de la tente. (-(으)면 conditionnel + -잖아 banmal)"},
    {'sp':'emma','side':'left','name':'Emma (존댓말)',
     'ko':'저는 라면을 준비할게요. 한강 라면을 먹어 보고 싶었거든요!','rom':'Jeoneun ramyeon-eul junbihalgeyo. Hangang ramyeon-eul meogeo bogo sipeotgeodeunyo!',
     'fr':"Moi, je m'occupe des ramyeon. Je rêvais de goûter les ramyeon du Han ! (Emma reste polie)"},
   ]},
  {'h':'Scène 2 — Au parc',
   'narr_kr':'세 사람이 한강 공원에 도착했어요. 자전거를 타는 사람들이 많아요.','narr_fr':"Ils arrivent au parc du Han. Il y a beaucoup de gens qui font du vélo. (relative 타는)",
   'bubbles':[
    {'sp':'joon','side':'right','name':'Joon (반말)',
     'ko':'와, 야경이 진짜 멋있다!','rom':'Wa, yagyeong-i jinjja meositta!',
     'fr':"Wahou, la vue de nuit est splendide ! (exclamation banmal -다)"},
    {'sp':'emma','side':'left','name':'Emma (존댓말)',
     'ko':'사진을 찍어도 돼요?','rom':'Sajin-eul jjigeodo dwaeyo?',
     'fr':"Je peux prendre des photos ?"},
    {'sp':'mina','side':'left','name':'Mina (반말)',
     'ko':'당연하지! 여기서 찍으면 잘 나와.','rom':'Dangyeonhaji! Yeogiseo jjigeumyeon jal nawa.',
     'fr':"Évidemment ! D'ici, elles seront super réussies. (잘 나오다 : être réussi, photo)"},
   ]},
  {'h':'Scène 3 — Les ramyeon de minuit',
   'narr_kr':'밤이 되면서 날씨가 추워졌어요.','narr_fr':"La nuit tombe et il commence à faire froid. (-(으)면서 + -아/어지다 : changement)",
   'bubbles':[
    {'sp':'emma','side':'left','name':'Emma (존댓말)',
     'ko':'라면이 다 됐어요! 뜨거우니까 조심하세요.','rom':'Ramyeon-i da dwaesseoyo! Tteugeounikka josimhaseyo.',
     'fr':"Les ramyeon sont prêts ! C'est brûlant, faites attention. (-(으)니까 : cause)"},
    {'sp':'joon','side':'right','name':'Joon (반말)',
     'ko':'밖에서 먹을수록 더 맛있는 것 같아.','rom':'Bakk-eseo meogeulsurok deo masinneun geot gata.',
     'fr':"Plus on mange dehors, plus c'est bon, je trouve. (-(으)ㄹ수록 : plus… plus…)"},
    {'sp':'mina','side':'left','name':'Mina (반말)',
     'ko':'다음에는 부산으로 캠핑 가자!','rom':'Da-eum-eneun Busan-euro kaemping gaja!',
     'fr':"La prochaine fois, allons camper à Busan ! (-자 : propositif banmal)"},
   ]},
 ],
 'vocab':[
  ('-기로 하다',"décider de ~"),('텐트',"tente"),('가져가다',"emporter"),
  ('-(으)면',"si ~ (conditionnel)"),('필요하다',"avoir besoin"),
  ('도착하다',"arriver"),('야경',"vue de nuit"),('사진을 찍다',"prendre une photo"),
  ('잘 나오다',"être réussi (photo)"),('-(으)면서',"tout en ~"),
  ('-아/어지다',"devenir ~ (changement)"),('-(으)니까',"parce que, puisque"),
  ('조심하다',"faire attention"),('-(으)ㄹ수록',"plus… plus…"),('-자',"allons ~ ! (banmal)"),
 ],
 'tip':"<strong>Culture :</strong> les berges du Han (한강공원) sont le salon d'été de Séoul : tentes pop-up, livraison de poulet frit directement sur l'herbe, et les fameux distributeurs de ramyeon instantanés des supérettes — un rite de passage absolu.",
 'grammar_note':"Grammaire travaillée : 반말 vs 존댓말 (Niveaux de langue) · -(으)면 (Conditionnel) · -기로 하다 (Décision) · -(으)ㄹ수록 · -(으)면서 · 타는 (Relatives)."
},
# ═══════════════════ HISTOIRE 39 — B1 ═══════════════════
{
 'file':'histoire39.html','num':39,'level':'B1','xp':20,'key':'ks_c38',
 'title_fr':'Le kimchi de grand-mère','title_kr':'할머니의 김치',
 'color':'#7c3aed','color_dark':'#5b21b6','color_bg':'124,58,237',
 'tag':'Dialogue immersif · Souvenirs & discours rapporté',
 'sub':"Mina aide sa grand-mère à préparer le kimchi. Souvenirs (-곤 했어요), paroles rapportées (-다고 했어요) et regrets (-(으)ㄹ걸 그랬어요) — l'émotion en B1.",
 'listen_sub':"2 voix féminines : Mina & Halmeoni (SunHi)",
 'avatars':{'mina':('MN','#ec4899'),'halmeoni':('할','#7c3aed')},
 'scenes':[
  {'h':'Scène 1 — Chez halmeoni',
   'narr_kr':'주말에 미나가 할머니 댁에 갔어요.','narr_fr':"Ce week-end, Mina rend visite à sa grand-mère. (댁 : maison, honorifique)",
   'bubbles':[
    {'sp':'halmeoni','side':'right','name':'Halmeoni',
     'ko':'우리 미나 왔구나! 밥은 먹었니?','rom':'Uri Mina watguna! Bap-eun meogeonni?',
     'fr':"Ma petite Mina est là ! Tu as mangé ? (-구나/-니 : parler affectueux des aînés)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'네, 할머니. 그런데 할머니 김치가 너무 먹고 싶었어요.','rom':'Ne, halmeoni. Geureonde halmeoni gimchi-ga neomu meokgo sipeosseoyo.',
     'fr':"Oui, grand-mère. Mais ton kimchi me manquait trop."},
    {'sp':'halmeoni','side':'right','name':'Halmeoni',
     'ko':'마침 잘 왔다. 오늘 김치를 담그는 날이거든.','rom':'Machim jal watda. Oneul gimchi-reul damgeuneun nal-igeodeun.',
     'fr':"Tu tombes à pic. C'est justement le jour du kimchi. (relative 담그는 + -거든)"},
   ]},
  {'h':'Scène 2 — Les souvenirs',
   'narr_kr':'미나가 할머니를 도와요.','narr_fr':"Mina aide sa grand-mère.",
   'bubbles':[
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'할머니는 언제부터 김치를 만드셨어요?','rom':'Halmeoni-neun eonjebuteo gimchi-reul mandeusyeosseoyo?',
     'fr':"Depuis quand fais-tu du kimchi ? (-(으)시- honorifique)"},
    {'sp':'halmeoni','side':'right','name':'Halmeoni',
     'ko':'어렸을 때 배웠지. 옛날에는 온 가족이 같이 담그곤 했어.','rom':'Eoryeosseul ttae baewotji. Yennal-eneun on gajok-i gachi damgeugon haesseo.',
     'fr':"Je l'ai appris toute petite. Avant, toute la famille s'y mettait ensemble. (-곤 했어 : habitude passée)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'엄마가 할머니 김치가 제일 맛있다고 했어요.','rom':'Eomma-ga halmeoni gimchi-ga jeil masitdago haesseoyo.',
     'fr':"Maman a dit que ton kimchi est le meilleur. (-다고 했어요 : discours rapporté)"},
    {'sp':'halmeoni','side':'right','name':'Halmeoni',
     'ko':'하하, 비결은 좋은 재료야.','rom':'Haha, bigyeol-eun jo-eun jaeryo-ya.',
     'fr':"Haha, le secret, ce sont de bons ingrédients."},
   ]},
  {'h':'Scène 3 — La promesse',
   'narr_kr':'두 사람이 김치를 다 담갔어요.','narr_fr':"Elles ont terminé le kimchi.",
   'bubbles':[
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'작년에도 도와 드릴걸 그랬어요.','rom':'Jangnyeon-edo dowa deurilgeol geuraesseoyo.',
     'fr':"J'aurais dû t'aider l'an dernier aussi. (-(으)ㄹ걸 그랬어요 : regret)"},
    {'sp':'halmeoni','side':'right','name':'Halmeoni',
     'ko':'괜찮아. 내년에 또 오면 되지.','rom':'Gwaenchana. Naenyeon-e tto omyeon doeji.',
     'fr':"Ce n'est rien. Tu n'as qu'à revenir l'an prochain. (-(으)면 되다)"},
    {'sp':'mina','side':'left','name':'Mina',
     'ko':'네! 김치 가져가서 친구들한테 자랑할 거예요.','rom':'Ne! Gimchi gajyeogaseo chingudeul-hante jaranghal geoyeyo.',
     'fr':"Oui ! Je vais en rapporter et me vanter auprès de mes amis. (자랑하다 : se vanter)"},
   ]},
 ],
 'vocab':[
  ('댁',"maison (honorifique)"),('김치를 담그다',"préparer le kimchi"),
  ('마침',"justement, à point nommé"),('-곤 했어요',"avait l'habitude de ~"),
  ('어렸을 때',"quand j'étais petit·e"),('-다고 했어요',"a dit que ~"),
  ('비결',"secret, astuce"),('재료',"ingrédients"),
  ('-(으)ㄹ걸 그랬어요',"j'aurais dû ~ (regret)"),('-(으)면 되다',"il suffit de ~"),
  ('내년',"l'année prochaine"),('자랑하다',"se vanter, être fier de montrer"),
 ],
 'tip':"<strong>Culture :</strong> le kimjang (김장) — la grande préparation collective du kimchi d'hiver — est inscrit au patrimoine immatériel de l'UNESCO. Les familles préparent des dizaines de choux d'un coup, et repartir avec les boîtes de kimchi de sa grand-mère est un trésor national officieux.",
 'grammar_note':"Grammaire travaillée : -다고 했어요 (Discours indirect) · -곤 했어요 (Temps avancé) · -(으)ㄹ걸 그랬어요 (Regret) · 담그는 (Relatives)."
},
]

SVG_SPK = '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'

def esc_attr(t):
    return t.replace('&','&amp;').replace('"','&quot;')

def page(s):
    c, cd, cbg = s['color'], s['color_dark'], s['color_bg']
    av_css = []
    for sp,(ini,col) in s['avatars'].items():
        av_css.append(f'.av-{sp}{{background:{col}}}')
    bubbles_html = []
    for sc in s['scenes']:
        bubbles_html.append(f'  <h3>{sc["h"]}</h3>\n  <div class="panel">\n    <div class="panel-num">SCÈNE {s["scenes"].index(sc)+1:02d}</div>')
        bubbles_html.append(f'    <div class="narration">\n      <div class="narration-kr">{sc["narr_kr"]}</div>\n      {sc["narr_fr"]}\n    </div>')
        for b in sc['bubbles']:
            side = ' right' if b['side']=='right' else ''
            ini = s['avatars'][b['sp']][0]
            voice = VOICE[b['sp']]
            onclick = f"speakAs('{b['ko']}','{voice}',this)"
            bubbles_html.append(f'''    <div class="bubble-row{side}" data-speaker="{b['sp']}">
      <div class="avatar-circle av-{b['sp']}">{ini}</div>
      <div class="bubble">
        <span class="speaker-name">{b['name']}</span>
        <div class="ko">{b['ko']}</div>
        <div class="bubble-rom">{b['rom']}</div>
        <div class="bubble-fr">{b['fr']}</div>
        <button class="bubble-audio" onclick="{esc_attr(onclick)}" aria-label="Écouter">{SVG_SPK}</button>
      </div>
    </div>''')
        if 'narr2_kr' in sc:
            bubbles_html.append(f'    <div class="narration">\n      <div class="narration-kr">{sc["narr2_kr"]}</div>\n      {sc["narr2_fr"]}\n    </div>')
        bubbles_html.append('  </div>')
    vocab_rows = '\n'.join(f'    <tr><td><span class="ko">{k}</span></td><td>{v}</td></tr>' for k,v in s['vocab'])
    voice_map_js = json.dumps(VOICE, ensure_ascii=False)
    return f'''<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<script>try{{if(localStorage.getItem('ks_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}}catch(e){{}}</script>
<script src="gate.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{s['title_fr']} — Korean Stories</title>
  <link rel="canonical" href="https://koreanstories.fr/{s['file']}"/>
  <meta name="theme-color" content="#0F1B2D"/>
  <link rel="stylesheet" href="design.css">
  <style>
    body{{font-family:'Segoe UI',system-ui,sans-serif;margin:0;background:var(--bg);color:var(--tx)}}
    h2{{color:var(--navy);margin:0 0 .4rem}}
    [data-theme="dark"] h2{{color:#EDF2FA}}
    h3{{color:{c};margin:1.2rem 0 .4rem;font-size:.95rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}}
    .pill{{display:inline-block;background:rgba({cbg},.14);color:{cd};border-radius:20px;padding:.2rem .7rem;font-size:.82rem;font-weight:600}}
    [data-theme="dark"] .pill{{color:#EDF2FA}}
    .xp-badge{{background:rgba({cbg},.14);color:{cd};padding:.15rem .5rem;border-radius:8px;font-size:.8rem;font-weight:700}}
    [data-theme="dark"] .xp-badge{{color:#EDF2FA}}
    .story-hero{{background:linear-gradient(135deg,{cd},{c});border-radius:16px;padding:1.4rem;color:#fff;margin:.8rem 0;text-align:center}}
    .story-tag{{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.75);margin-bottom:.4rem}}
    .story-title{{font-size:1.2rem;font-weight:800;margin-bottom:.3rem}}
    .story-sub{{font-size:.85rem;opacity:.85}}
    .listen-bar{{background:linear-gradient(135deg,rgba({cbg},.10),rgba({cbg},.04));border:1.5px solid rgba({cbg},.3);border-radius:14px;padding:.9rem 1rem;margin:1rem 0;display:flex;align-items:center;gap:.8rem}}
    .listen-btn{{background:{c};color:#fff;border:none;border-radius:50%;width:42px;height:42px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}}
    .listen-btn:hover{{transform:scale(1.06)}}
    .listen-btn.playing{{background:#dc2626}}
    .listen-btn svg{{width:18px;height:18px;fill:#fff}}
    .listen-meta{{flex:1;min-width:0}}
    .listen-title{{font-weight:700;color:var(--navy);font-size:.93rem;margin-bottom:.15rem}}
    [data-theme="dark"] .listen-title{{color:#EDF2FA}}
    .listen-sub{{font-size:.78rem;color:var(--tx-muted)}}
    .panel{{background:var(--surf);border:1px solid var(--bd);border-radius:14px;padding:1rem;margin:.7rem 0;position:relative}}
    .panel-num{{position:absolute;top:-10px;left:14px;background:{c};color:#fff;border-radius:100px;padding:2px 10px;font-size:.7rem;font-weight:800;letter-spacing:.06em}}
    .narration{{background:rgba({cbg},.06);border-left:3px solid {c};border-radius:0 8px 8px 0;padding:.7rem 1rem;margin:.4rem 0;font-style:italic;font-size:.88rem;color:var(--tx-muted);line-height:1.55}}
    .narration-kr{{font-weight:600;color:var(--navy);font-style:normal;margin-bottom:.3rem;font-size:.95rem}}
    [data-theme="dark"] .narration-kr{{color:#EDF2FA}}
    .bubble-row{{display:flex;gap:.5rem;margin:.5rem 0;align-items:flex-start}}
    .bubble-row.right{{flex-direction:row-reverse}}
    .avatar-circle{{flex-shrink:0;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:800}}
    {''.join(av_css)}
    .speaker-name{{font-size:.7rem;font-weight:700;text-transform:uppercase;color:var(--tx-muted);letter-spacing:.05em;display:block;margin-bottom:.2rem}}
    .bubble{{background:var(--surf);border:1.5px solid var(--bd);padding:.7rem .9rem;border-radius:18px 18px 18px 4px;flex:1;min-width:0;max-width:88%;transition:background .25s, box-shadow .25s}}
    .bubble-row.right .bubble{{border-radius:18px 18px 4px 18px;background:rgba({cbg},.06);border-color:rgba({cbg},.25)}}
    .bubble.listening{{box-shadow:0 0 0 2px rgba({cbg},.5)}}
    .ko{{font-weight:600;color:var(--navy);font-size:.98rem;line-height:1.5}}
    [data-theme="dark"] .ko{{color:#EDF2FA}}
    .bubble-rom{{font-size:.74rem;color:var(--tx-muted);font-style:italic;margin-top:.15rem}}
    .bubble-fr{{font-size:.82rem;color:var(--tx-muted);margin-top:.3rem;padding-top:.3rem;border-top:1px dashed rgba(0,0,0,.08)}}
    .bubble-audio{{background:rgba({cbg},.10);border:1.5px solid rgba({cbg},.3);border-radius:50%;width:28px;height:28px;cursor:pointer;color:{cd};display:inline-flex;align-items:center;justify-content:center;margin-top:.4rem}}
    [data-theme="dark"] .bubble-audio{{color:#EDF2FA}}
    .bubble-audio svg{{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}}
    .grammar-note{{background:rgba({cbg},.07);border:1px dashed rgba({cbg},.4);border-radius:12px;padding:.7rem 1rem;font-size:.82rem;margin:.8rem 0;line-height:1.6;color:var(--tx-muted)}}
    .vocab{{background:var(--surf);border:1px solid var(--bd);border-radius:14px;padding:1rem;margin:.8rem 0}}
    .vocab table{{width:100%;border-collapse:collapse;font-size:.88rem}}
    .vocab th{{background:rgba({cbg},.1);color:{cd};padding:.4rem .6rem;text-align:left;font-size:.75rem;font-weight:700;text-transform:uppercase}}
    [data-theme="dark"] .vocab th{{color:#EDF2FA}}
    .vocab td{{padding:.45rem .6rem;border-bottom:1px solid var(--bd)}}
    .vocab td .ko{{color:{cd};font-weight:700;font-size:.95rem}}
    [data-theme="dark"] .vocab td .ko{{color:#EDF2FA}}
    .tip{{background:rgba(184,146,78,.08);border-left:3px solid #B8924E;border-radius:0 8px 8px 0;padding:.6rem .9rem;font-size:.85rem;margin:.6rem 0;line-height:1.55}}
    .btn-done{{display:block;width:100%;padding:.9rem;background:{c};color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;margin-top:1.2rem}}
  </style>
<style>.bnav{{padding-left:2px;padding-right:2px}}.bni{{padding:6px 4px;min-width:0}}.bni span{{font-size:8px;letter-spacing:.02em}}</style>
<link rel="icon" type="image/png" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<link rel="apple-touch-icon" href="Logo/Logo - KoreanStories_logo_4x4_bleu.png"/>
<script defer src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
<script defer src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
<script defer src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
<script defer src="ks-sync.js"></script>
</head>
<body>
  <nav class="bar"><button class="back-btn" onclick="ksSmartBack&&ksSmartBack()||history.back()">←</button><span class="bar-title">{s['title_fr']}</span><button onclick="toggleTheme()" class="theme-btn"><svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button></nav>
<div class="shell"><main class="main"><div style="padding:1rem">
  <h2>{s['title_fr']}</h2>
  <span class="pill">{s['level']} · Histoire</span> <span class="xp-badge">+{s['xp']} XP</span>
  <div class="story-hero">
    <div class="story-tag">{s['tag']}</div>
    <div class="story-title">{s['title_kr']} — {s['title_fr']}</div>
    <div class="story-sub">{s['sub']}</div>
  </div>

  <div class="listen-bar">
    <button class="listen-btn" id="listenBtn" onclick="toggleListen()" aria-label="Écouter">
      <svg id="listenIcon" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>
    </button>
    <div class="listen-meta">
      <div class="listen-title">🎧 Écouter l'histoire</div>
      <div class="listen-sub" id="listenSub">{s['listen_sub']}</div>
    </div>
  </div>

  <div id="storyContent">

{chr(10).join(bubbles_html)}

  </div><!-- /storyContent -->

  <div class="grammar-note">📐 {s['grammar_note']}</div>

  <h3>Vocabulaire</h3>
  <div class="vocab"><table>
    <tr><th>Coréen</th><th>Sens</th></tr>
{vocab_rows}
  </table></div>

  <div class="tip">{s['tip']}</div>

  <button class="btn-done" id="doneBtn" onclick="completeLesson()">Terminer — +{s['xp']} XP</button>
</div></main></div>
<nav class="bnav">
  <a href="app.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Accueil</span></a>
  <a href="cours.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><span>Cours</span></a>
  <a href="histoires.html" class="bni act"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg><span>Histoires</span></a>
  <a href="challenge.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Défi</span></a>
  <a href="classement.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span>Records</span></a>
  <a href="profil.html" class="bni"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profil</span></a>
</nav>
<script src="ks.js"></script>
<script>
const KS_VOICE_MAP = {voice_map_js};
let _listenSession = null;
function toggleListen(){{
  const btn = document.getElementById('listenBtn');
  const icon = document.getElementById('listenIcon');
  const sub = document.getElementById('listenSub');
  if (_listenSession){{ _listenSession.stop(); _listenSession = null; btn.classList.remove('playing'); icon.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"/>'; sub.textContent = '{s['listen_sub']}'; return; }}
  if (typeof window.speakAs !== 'function') return;
  btn.classList.add('playing'); icon.innerHTML = '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
  const items = [];
  document.getElementById('storyContent').querySelectorAll('.bubble-row[data-speaker], .narration-kr').forEach(node => {{
    if (node.classList.contains('narration-kr')){{ items.push({{ el: node, text: node.textContent.trim(), voice: 'injoon' }}); }}
    else {{
      const voice = KS_VOICE_MAP[node.dataset.speaker] || 'injoon';
      node.querySelectorAll('.ko').forEach(koEl => items.push({{ el: koEl, text: koEl.textContent.trim(), voice }}));
    }}
  }});
  let i = 0, stopped = false;
  function next(){{
    if (stopped || i >= items.length){{ btn.classList.remove('playing'); icon.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"/>'; sub.textContent = 'Terminé — relance pour réécouter'; _listenSession = null; document.querySelectorAll('.listening').forEach(el => el.classList.remove('listening')); return; }}
    const item = items[i]; const bubble = item.el.closest('.bubble'); if (bubble) bubble.classList.add('listening');
    sub.textContent = `Lecture ${{i+1}} / ${{items.length}} · voix ${{item.voice}}`;
    window.speakAs(item.text, item.voice, null, {{
      onended(){{ if (bubble) bubble.classList.remove('listening'); const last = item.text.charAt(item.text.length-1); const pause = (last==='?'||last==='!') ? 700 : (last==='.'||last==='。') ? 500 : 350; i++; setTimeout(next, pause); }},
      onerror(){{ if (bubble) bubble.classList.remove('listening'); i++; setTimeout(next, 250); }}
    }});
  }}
  _listenSession = {{ stop(){{ stopped = true; try{{window.speechSynthesis.cancel();}}catch(e){{}} document.querySelectorAll('.listening').forEach(el => el.classList.remove('listening')); }} }};
  next();
}}
function completeLesson(){{ if(typeof ksFinish==='function')ksFinish({{key:'{s['key']}',xp:{s['xp']}}}); else{{if(typeof ksAddXP==='function')ksAddXP({s['xp']});if(typeof ksMarkDone==='function')ksMarkDone('{s['key']}');location.href='histoires.html';}} }}
try{{const t=localStorage.getItem('ks_theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}
</script>
</body></html>
'''

for s in STORIES:
    html = page(s)
    open(s['file'],'w',encoding='utf-8').write(html)
    nb = sum(len(sc['bubbles']) for sc in s['scenes'])
    print(f"✓ {s['file']} — {s['level']} · {nb} bulles · {len(s['vocab'])} mots · {s['key']}")
print('Done.')
