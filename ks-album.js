/* ks-album.js — « Album des histoires » : collection de cartes à débloquer.
   Une carte par histoire (42). Une carte se débloque quand l'histoire a été
   vécue : article lu (clé de complétion de l'histoire) OU planche BD lue
   (ks_bd_h{N}_prog === '100'). Aucune image générée : la carte reprend
   l'esthétique du hub (couleur + titre coréen), donc 100 % assets maison.

   ⚠️ Le jeu de données CARDS ci-dessous est extrait du tableau STORIES de
   histoires.html (source de vérité). Si les histoires changent, régénérer via
   le script d'extraction (voir la session du 2026-07-04). Rareté = niveau.

   API : window.KSAlbum = { render(sel), stats(), newCount(), markSeen() }. */
(function () {
  var CARDS = [
  {n:1,lvl:'debutant',lv:'Débutant',kr:'안녕하세요 !',fr:'Bonjour !',loc:'Rue · Séoul',color:'#C9A96E',key:'ks_h1',href:'histoire1.html',desc:'Mina croise Joon dans la rue. Premiers mots, premiers sourires. Le coréen commence ici.',words:['해','나도','저기','수박','빨리','하루','또']},
  {n:2,lvl:'debutant',lv:'Débutant',kr:'시장에서',fr:'Au marché',loc:'Marché · Namdaemun',color:'#16a34a',key:'ks_h2',href:'histoire2.html',desc:'Mina emmène Joon faire les courses. Fruits, légumes, et un vendeur qui parle vite vite vite.',words:['여기','시장','좋아해요','얼마','비싸요','맛있어요','같이']},
  {n:3,lvl:'a1',lv:'A1',kr:'식당에서',fr:'Au restaurant',loc:'Restaurant · Hongdae',color:'#dc2626',key:'ks_h3',href:'histoire3.html',desc:'Bibimbap, kimchi, piment. Joon découvre la cuisine coréenne… et sa bouche est en feu.',words:['배고파요','식당','메뉴','주문','매워요','조금','물']},
  {n:4,lvl:'a1',lv:'A1',kr:'카페에서',fr:'Au café',loc:'Café · Sinchon',color:'#d97706',key:'ks_h4',href:'histoire4.html',desc:'Rendez-vous au café pour parler de tout et de rien. Mina veut un latte, Joon hésite.',words:['카페','커피','아이스','주세요','뜨거워요','달아요','기다려요']},
  {n:5,lvl:'a1',lv:'A1',kr:'편의점에서',fr:'À l\'épicerie coréenne',loc:'Épicerie · Mapo-gu',color:'#0891b2',key:'ks_h5',href:'histoire5.html',desc:'11h du soir, une faim de loup. Mina et Joon à la convenience store pour du ramyeon.',words:['편의점','컵라면','있어요','얼마예요','원','지갑','없어요']},
  {n:6,lvl:'a1plus',lv:'A1+',kr:'지하철에서',fr:'Dans le métro',loc:'Métro · Ligne 2',color:'#2563eb',key:'ks_h6',href:'histoire6.html',desc:'Ça se bouscule dans le métro de Séoul. Joon rate la porte et Mina court pour l\'attraper.',words:['지하철','빨리','늦었어요','교통카드','역','앉아요','괜찮아요']},
  {n:7,lvl:'a1plus',lv:'A1+',kr:'친구 집에서',fr:'Chez un ami',loc:'Appart · Hongdae',color:'#7c3aed',key:'ks_h7',href:'histoire7.html',desc:'Mina invite tout le monde chez elle. On enlève les chaussures, on prépare le ramyeon.',words:['집','어서 오세요','신발','벗어요','라면','같이','재미있어요']},
  {n:8,lvl:'a1plus',lv:'A1+',kr:'노래방에서',fr:'Au norebang',loc:'Norebang · Itaewon',color:'#db2777',key:'ks_h8',href:'histoire8.html',desc:'Le karaoké coréen, ça se prend au sérieux ! Joon découvre qu\'il a (un peu) de talent.',words:['노래방','노래','신나요','불러요','마이크','잘해요','점수']},
  {n:9,lvl:'a2',lv:'A2',kr:'병원에서',fr:'À l\'hôpital',loc:'Clinique · Mapo-gu',color:'#0369a1',key:'ks_h9',href:'histoire9.html',desc:'Joon est malade. Visite chez le médecin avec Mina qui traduit. Vocabulaire médical de base.',words:['병원','아파요','기침','열','감기','약','드릴게요']},
  {n:10,lvl:'a2',lv:'A2',kr:'쇼핑몰에서',fr:'Au centre commercial',loc:'Shopping · Myeongdong',color:'#ca8a04',key:'ks_h10',href:'histoire10.html',desc:'Myeongdong, les soldes, et Mina qui ne sait pas quoi choisir. Joon joue les stylistes.',words:['쇼핑몰','세일','옷','사이즈','어울려요','살게요','계산']},
  {n:11,lvl:'a2',lv:'A2',kr:'집들이에서',fr:'Pendaison de crémaillère',loc:'Appart · Séoul',color:'#b45309',key:'ks_h11',href:'histoire11.html',desc:'Joon a un nouvel appartement ! Tout le monde apporte des cadeaux et on fête ça ensemble.',words:['집들이','새집','선물','감사해요','넓어요','마음에 들어요','축하해요']},
  {n:12,lvl:'a2',lv:'A2',kr:'사랑해요',fr:'K-Drama : romance',loc:'K-Drama · Hongdae',color:'#ec4899',key:'ks_b09',href:'histoire12.html',desc:'Dialogues romantiques type K-drama. Vocabulaire émotionnel et phrases passées au bain de mille séries coréennes.',words:['사랑해요','좋아해요','마음','데이트','첫 만남','떨려요','로맨틱']},
  {n:13,lvl:'a2',lv:'A2',kr:'홍대 주말',fr:'Un week-end à Hongdae',loc:'Week-end · Hongdae',color:'#7c3aed',key:'ks_b12',href:'histoire13.html',desc:'Hongdae le week-end : art de rue, K-pop dans la rue, shopping, énergie nocturne. 20 expressions du quotidien jeune.',words:['주말','거리 공연','street art','노래방','클럽','분위기','즐거워요']},
  {n:14,lvl:'a2',lv:'A2',kr:'인천공항에서',fr:'À l\'aéroport d\'Incheon',loc:'Aéroport · Incheon',color:'#0ea5e9',key:'ks_b17',href:'histoire14.html',desc:'Check-in, contrôles, embarquement à Incheon. Vocabulaire voyage essentiel pour la première arrivée en Corée.',words:['공항','체크인','수하물','탑승','면세점','출국','입국']},
  {n:15,lvl:'a2',lv:'A2',kr:'서울의 병원',fr:'Emma chez le médecin à Séoul',loc:'Médecin · Séoul',color:'#16a34a',key:'ks_b31',href:'histoire15.html',desc:'Symptômes, dialogue avec médecin et infirmière, prescription. 15 mots médicaux à connaître.',words:['열','콧물','증상','처방','약국','진료','쉬세요']},
  {n:16,lvl:'b1',lv:'B1',kr:'첫 출근',fr:'Premier jour au bureau',loc:'Bureau · Gangnam',color:'#F59E0B',key:'ks_c13',href:'histoire16.html',desc:'Emma en stage. 존댓말 obligatoire, hiérarchie, déjeuner avec le 선배. Codes du milieu professionnel coréen.',words:['출근','팀장','선배','회의','잘 부탁드립니다','존댓말','명함']},
  {n:17,lvl:'b1',lv:'B1',kr:'부산 여행',fr:'Week-end à Busan',loc:'Voyage · Busan',color:'#D97706',key:'ks_c16',href:'histoire17.html',desc:'Sortie avec les collègues. KTX, Haeundae, fruits de mer au marché Jagalchi. Structures -곤 했어요 (habitude passée).',words:['KTX','해운대','자갈치 시장','해산물','곤하다','그리워요','-곤 했어요']},
  {n:18,lvl:'b1',lv:'B1',kr:'여행 후기',fr:'Retour de voyage — Emma raconte',loc:'Récit · Bureau',color:'#ea580c',key:'ks_c21',href:'histoire18.html',desc:'Emma raconte son week-end. Discours indirect (-다고/-라고), conséquences inattendues (-는 바람에), enchaînement (-자마자).',words:['후기','얘기하다','다고 했어요','-라고 했어요','-는 바람에','-자마자','설레다']},
  {n:19,lvl:'b1',lv:'B1',kr:'토픽 시험',fr:'L\'examen TOPIK d\'Emma',loc:'Histoire longue · TOPIK',color:'#c2410c',key:'ks_c23',href:'histoire19.html',desc:'Long récit en 5 chapitres : la préparation, la veille, le jour J, l\'attente, les résultats. Toutes les structures B1 en contexte.',words:['토픽','시험','준비','긴장','합격','노력','결과']},
  {n:20,lvl:'b2',lv:'B2',kr:'그날의 만남',fr:'Récit littéraire — La rencontre',loc:'Littérature · Récit',color:'#7C3AED',key:'ks_d06',href:'histoire20.html',desc:'4 chapitres en prose littéraire. Analyse linguistique des structures B2 et de la temporalité narrative.',words:['-ㄴ 채로','-기도 하고','-(으)며','순간','기억하다','마음','회상하다']},
  {n:21,lvl:'b2',lv:'B2',kr:'한국어가 세계로',fr:'Article de presse — guidé',loc:'Presse · Analyse',color:'#6b21a8',key:'ks_d09',href:'histoire21.html',desc:'Article sur la diffusion du coréen dans le monde. Connecteurs formels, structures journalistiques, vocabulaire académique.',words:['따라서','한편','즉','반면에','확산','영향','연구']},
  {n:29,lvl:'a1',lv:'A1',kr:'경복궁에서',fr:'Au palais Gyeongbokgung',loc:'Palais · Séoul',color:'#2563eb',key:'ks_a41',href:'histoire29.html',desc:'Emma visite le palais royal avec Ji-woo. Cerisiers en fleurs, hanbok loué pour entrer gratuit, déjeuner bibimbap.',words:['경복궁','광화문','한복','무료','벚꽃','사진','아름다워요']},
  {n:30,lvl:'a1',lv:'A1',kr:'병원에서',fr:'Chez le médecin',loc:'Clinique · Séoul',color:'#3b82f6',key:'ks_a42',href:'histoire30.html',desc:'Emma ne se sent pas bien depuis hier. Première visite à la clinique de quartier : symptômes, diagnostic, ordonnance.',words:['병원','의사','아파요','머리','목','열','감기']},
  {n:31,lvl:'a1',lv:'A1',kr:'우리 집에 오세요',fr:'Bienvenue chez moi',loc:'Maison · Séoul',color:'#d97706',key:'ks_a43',href:'histoire31.html',desc:'Mina invite Emma chez elle pour la première fois. Visite du salon, de la cuisine — tout le vocabulaire de la maison en situation.',words:['어서 오세요','우리 집','거실','소파','앉으세요','텔레비전','부엌']},
  {n:32,lvl:'a1',lv:'A1',kr:'카페에서',fr:'Au café avec Mina',loc:'Café · Séoul',color:'#0d9488',key:'ks_a35',href:'histoire32.html',desc:'Mina retrouve Jiwoo au café. Commander une boisson, payer, parler du week-end — la conversation café type, à trois voix.',words:['기다리다','뭘 드릴까요','한 잔','주세요','따뜻하게','팔천 원','날씨']},
  {n:33,lvl:'a1',lv:'A1',kr:'미나의 아침',fr:'Le matin de Mina',loc:'Matin · Séoul',color:'#db2777',key:'ks_a37',href:'histoire33.html',desc:'7h du matin chez Mina : le réveil sonne, le kimchi-jjigae fume, il pleut dehors. Toute la routine du matin en coréen naturel.',words:['아침','일곱 시','알람','일어나다','김치찌개','맛있다','잘 먹겠습니다']},
  {n:34,lvl:'a2',lv:'A2',kr:'부동산에서',fr:'À l\'agence immobilière',loc:'Immobilier · Séoul',color:'#0d9488',key:'ks_b43',href:'histoire34.html',desc:'Emma cherche un studio avec Mina : budget, visites, comparaisons. Les structures 보다/더/제일 et -것 같다 en situation réelle.',words:['부동산','원룸','예산','지하철역','가깝다','보다 더','제일']},
  {n:35,lvl:'a2',lv:'A2',kr:'김밥 만들기',fr:'Le kimbap de Joon',loc:'Cuisine · Séoul',color:'#dc2626',key:'ks_b44',href:'histoire35.html',desc:'Joon apprend à Mina à rouler le kimbap : expérience (-아/어 봤어요), instructions (-아/어 주세요) et dégustation comparée (~보다 더).',words:['김밥','만들다','한 번도','도와주다','먼저','재료','참기름']},
  {n:36,lvl:'a2',lv:'A2',kr:'지우의 생일',fr:'L\'anniversaire de Jiwoo',loc:'Fête · Séoul',color:'#db2777',key:'ks_b45',href:'histoire36.html',desc:'Cadeau, miyeokguk et chanson : l\'anniversaire coréen de Jiwoo fait travailler les nuances -잖아요 / -거든요 et -본 적이 없어요.',words:['생일','축하해요','선물','받다','미역국','전통','건강']},
  {n:37,lvl:'b1',lv:'B1',kr:'에마의 면접',fr:'L\'entretien d\'embauche',loc:'Bureau · Séoul',color:'#2563eb',key:'ks_c36',href:'histoire37.html',desc:'Emma passe un entretien tout en -습니다 : se présenter (-라고 합니다), argumenter (-기 때문입니다), remercier. Le registre formel en immersion.',words:['면접','회사','긴장하다','자기소개','열심히','질문','결과']},
  {n:38,lvl:'b1',lv:'B1',kr:'한강 캠핑',fr:'Soirée au bord du Han',loc:'Han · Séoul',color:'#16a34a',key:'ks_c37',href:'histoire38.html',desc:'Tente, photos et ramyeon de minuit au Han. Mina et Joon parlent en banmal, Emma reste en jondaemal — entends la différence des registres.',words:['텐트','가져가다','필요하다','도착하다','야경','조심하다','-기로 하다']},
  {n:39,lvl:'b1',lv:'B1',kr:'할머니의 김치',fr:'Le kimchi de grand-mère',loc:'Kimjang · Campagne',color:'#7c3aed',key:'ks_c38',href:'histoire39.html',desc:'Mina aide sa grand-mère au kimjang : souvenirs (-곤 했어요), paroles rapportées (-다고 했어요) et regrets (-(으)ㄹ걸 그랬어요). L\'émotion en B1.',words:['댁','김치를 담그다','마침','비결','재료','내년','자랑하다']},
  {n:40,lvl:'b2',lv:'B2',kr:'에마의 첫 회식',fr:'Le premier hoesik d\'Emma',loc:'Hoesik · Séoul',color:'#1d4ed8',key:'ks_d35',href:'histoire40.html',desc:'Premier dîner d\'entreprise d\'Emma : servir à deux mains, 드리다, 뵙겠습니다 et le rituel du 2차 — les honorifiques vécus en situation.',words:['회식','드리다','두 손으로','뵙겠습니다','수고했어요','2차','동료']},
  {n:41,lvl:'b2',lv:'B2',kr:'도시 대 시골',fr:'Le grand débat : ville ou campagne ?',loc:'Débat · Café',color:'#0f766e',key:'ks_d36',href:'histoire41.html',desc:'Trois amis, un débat : -기 마련이다, -(으)ㄹ 리가 없다 et les connecteurs formels du TOPIK II dans une vraie discussion animée.',words:['토론','주제','게다가','반면에','따라서','결국','정답']},
  {n:42,lvl:'b2',lv:'B2',kr:'할아버지의 속담',fr:'Les proverbes de grand-père',loc:'Sokdam · Campagne',color:'#92400e',key:'ks_d37',href:'histoire42.html',desc:'Mina apprend les 속담 avec son grand-père : trois proverbes de la leçon B2 transmis autour d\'un dîner — la sagesse coréenne en famille.',words:['속담','지혜','금강산도 식후경','-는 법이다','덕분에','계시다']},
  {n:27,lvl:'a2',lv:'A2',kr:'추석에',fr:'Chuseok en famille',loc:'Famille · Daegu',color:'#16a34a',key:'ks_b37',href:'histoire27.html',desc:'Ji-woo invite Emma chez ses parents à Daegu pour Chuseok. Préparation des songpyeon avec la grand-mère, dîner familial, pleine lune.',words:['추석','송편','보름달','소원','참깨','꿀','어서 와요']},
  {n:28,lvl:'a2',lv:'A2',kr:'찜질방에서',fr:'Au jimjilbang',loc:'Sauna · Séoul',color:'#0ea5e9',key:'ks_b38',href:'histoire28.html',desc:'Première fois au sauna coréen pour Emma. Ji-woo lui explique le rituel : se changer, salle commune chauffée, sikhye et œufs.',words:['찜질방','사우나','옷을 갈아입다','신발을 벗다','따뜻하다','계란','식혜']},
  {n:25,lvl:'b1',lv:'B1',kr:'서울의 밤',fr:'Séoul by night',loc:'Vie nocturne · Séoul',color:'#F59E0B',key:'ks_c30',href:'histoire25.html',desc:'Vendredi soir avec amis internationaux. Rooftop à Itaewon, taxi vers Hongdae, art de rue et musique. Mix 반말/존댓말.',words:['야경','분위기','새벽','거리 예술','공연','유명하다','매번']},
  {n:26,lvl:'b1',lv:'B1',kr:'싸우고 화해하기',fr:'La dispute et la réconciliation',loc:'Conflit · Café',color:'#dc2626',key:'ks_c31',href:'histoire26.html',desc:'Min-ji a une heure de retard. Ji-woo est fâché. Escalade puis apaisement. Structures -아/어서, -니까 en contexte émotionnel.',words:['싸우다','화해하다','화가 나다','화를 풀다','일부러','미리','연락하다']},
  {n:22,lvl:'b2',lv:'B2',kr:'달의 수호자',fr:'Webtoon — Le Gardien de la Lune',loc:'Webtoon · Fiction',color:'#7C3AED',key:'ks_d22',href:'histoire22.html',desc:'4 panels de webtoon original (fiction). Argot, onomatopées, particules -구나, structure narrative. Coréen jeune authentique.',words:['수호자','결계','기운','어둠','달빛','깨뜨리다','폭발하다']},
  {n:23,lvl:'b2',lv:'B2',kr:'우리, 한국 사람일까?',fr:'Podcast — Coréen naturel',loc:'Podcast · Réflexion',color:'#a855f7',key:'ks_d23',href:'histoire23.html',desc:'Podcast fictif sur l\'identité coréenne post-Hallyu. 4 segments, fillers (어…), particules -잖아요/-거든요/-더라고요. Débit naturel.',words:['덕분에','막상','솔직히','어색하다','자랑스럽다','부담스럽다','그치지 않다']},
  {n:24,lvl:'b2',lv:'B2',kr:'새벽의 부엌',fr:'Essai littéraire — Prose contemplative',loc:'Littérature',color:'#581c87',key:'ks_d24',href:'histoire24.html',desc:'Court récit original dans la tradition minimaliste coréenne. Une fille revient au village de sa mère après douze ans. Analyse stylistique paragraphe par paragraphe.',words:['스며들다','그림자','새벽','감나무','손바닥','평범하다','소리 없이']}
];

  // Rareté par niveau CECR.
  var RARITY = {
    debutant: 'commune', a1: 'commune',
    a1plus: 'peu', a2: 'peu',
    b1: 'rare', b2: 'legend'
  };
  var RMETA = {
    commune:  { label: 'Commune',     c: '#8B94A6' },
    peu:      { label: 'Peu commune', c: '#16a34a' },
    rare:     { label: 'Rare',        c: '#2563eb' },
    legend:   { label: 'Légendaire',  c: '#7C3AED' }
  };
  var ORDER = ['commune', 'peu', 'rare', 'legend'];

  function ls(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }

  function isUnlocked(card){
    if (ls(card.key)) return true;                       // article lu
    if (ls('ks_bd_h' + card.n + '_prog') === '100') return true; // planche BD lue
    return false;
  }
  function rarityOf(card){ return RARITY[card.lvl] || 'commune'; }

  function seenSet(){
    try { return JSON.parse(ls('ks_album_seen') || '[]') || []; } catch(e){ return []; }
  }
  function unlockedCards(){ return CARDS.filter(isUnlocked); }

  function stats(){
    var u = unlockedCards().length;
    return { unlocked: u, total: CARDS.length, pct: Math.round(u / CARDS.length * 100) };
  }
  // Cartes débloquées mais pas encore vues par l'utilisateur (pour un badge « ! »).
  function newCount(){
    var seen = seenSet();
    return unlockedCards().filter(function(c){ return seen.indexOf(c.n) === -1; }).length;
  }
  function markSeen(){
    try { localStorage.setItem('ks_album_seen', JSON.stringify(unlockedCards().map(function(c){ return c.n; }))); } catch(e){}
  }

  function esc(s){ var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  function cardHTML(card, isNew){
    var r = rarityOf(card), rm = RMETA[r], on = isUnlocked(card);
    if (!on){
      return '<button class="al-card locked" data-n="' + card.n + '" aria-label="Carte verrouillée — ' + esc(card.lv) + '">' +
        '<span class="al-rar" style="color:' + rm.c + ';border-color:' + rm.c + '">' + rm.label + '</span>' +
        '<span class="al-lock" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>' +
        '<span class="al-q">?</span>' +
        '<span class="al-lvl">' + esc(card.lv) + '</span>' +
      '</button>';
    }
    return '<button class="al-card" data-n="' + card.n + '" style="--ac:' + card.color + '" aria-label="' + esc(card.fr) + '">' +
      (isNew ? '<span class="al-new">Nouveau</span>' : '') +
      '<span class="al-rar" style="color:' + rm.c + ';border-color:' + rm.c + '">' + rm.label + '</span>' +
      '<span class="al-kr">' + esc(card.kr) + '</span>' +
      '<span class="al-fr">' + esc(card.fr) + '</span>' +
      '<span class="al-loc">' + esc(card.loc) + '</span>' +
      '<span class="al-lvl">' + esc(card.lv) + '</span>' +
    '</button>';
  }

  function render(sel){
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!host) return;
    var seen = seenSet();
    var groups = {};
    ORDER.forEach(function(r){ groups[r] = []; });
    CARDS.forEach(function(c){ groups[rarityOf(c)].push(c); });

    var html = '';
    ORDER.forEach(function(r){
      var list = groups[r]; if (!list.length) return;
      var rm = RMETA[r];
      var nbOn = list.filter(isUnlocked).length;
      html += '<div class="al-cat"><span class="al-dot" style="background:' + rm.c + '"></span>' +
              rm.label + '<span class="al-cat-n">' + nbOn + '/' + list.length + '</span></div>';
      html += '<div class="al-grid">';
      list.forEach(function(c){
        var isNew = isUnlocked(c) && seen.indexOf(c.n) === -1;
        html += cardHTML(c, isNew);
      });
      html += '</div>';
    });
    host.innerHTML = html;

    // stats en-tête
    var s = stats();
    var setTxt = function(id, v){ var e = document.getElementById(id); if (e) e.textContent = v; };
    setTxt('alUnlocked', s.unlocked); setTxt('alTotal', s.total); setTxt('alPercent', s.pct + '%');

    // clics → modale
    host.querySelectorAll('.al-card').forEach(function(btn){
      btn.addEventListener('click', function(){ openModal(+btn.getAttribute('data-n')); });
    });
  }

  function openModal(n){
    var card = CARDS.filter(function(c){ return c.n === n; })[0]; if (!card) return;
    var on = isUnlocked(card), r = rarityOf(card), rm = RMETA[r];
    var ov = document.getElementById('alOvr'); if (!ov) return;
    var body = document.getElementById('alModalBody');
    if (on){
      var words = (card.words || []).map(function(w){ return '<span class="al-chip">' + esc(w) + '</span>'; }).join('');
      body.innerHTML =
        '<span class="al-rar" style="color:' + rm.c + ';border-color:' + rm.c + '">' + rm.label + ' · ' + esc(card.lv) + '</span>' +
        '<div class="al-m-kr" style="color:' + card.color + '">' + esc(card.kr) + '</div>' +
        '<div class="al-m-fr">' + esc(card.fr) + '</div>' +
        '<div class="al-m-loc">' + esc(card.loc) + '</div>' +
        '<p class="al-m-desc">' + esc(card.desc) + '</p>' +
        (words ? '<div class="al-chips">' + words + '</div>' : '') +
        '<a class="al-m-btn" href="' + card.href + '">Relire l\'histoire</a>';
    } else {
      body.innerHTML =
        '<span class="al-rar" style="color:' + rm.c + ';border-color:' + rm.c + '">' + rm.label + ' · ' + esc(card.lv) + '</span>' +
        '<div class="al-m-kr" style="color:var(--tx-muted,#8B94A6)">? ? ?</div>' +
        '<div class="al-m-fr">Carte verrouillée</div>' +
        '<p class="al-m-desc">Lis cette histoire (article ou planche BD) pour débloquer sa carte et l\'ajouter à ta collection.</p>' +
        '<a class="al-m-btn" href="' + card.href + '">Découvrir l\'histoire</a>';
    }
    ov.classList.add('open');
  }
  function closeModal(){ var ov = document.getElementById('alOvr'); if (ov) ov.classList.remove('open'); }

  window.KSAlbum = { render: render, stats: stats, newCount: newCount, markSeen: markSeen, close: closeModal, cards: CARDS };
})();
