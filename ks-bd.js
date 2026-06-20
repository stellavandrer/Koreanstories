/* ks-bd.js — Améliorations des planches BD (histoireN-bd.html).
   Chargé par ks.js. Ne touche PAS au HTML des planches :
   - retire la romanisation,
   - met la narration / les libellés de scène en coréen (FR en option, caché par défaut),
   - réutilise la pastille du haut en bouton « FR »,
   - rend les bulles plus compactes sur mobile (n'écrasent plus les visages),
   - marque la planche comme lue (carte du hub) + valide l'étape du parcours. */
(function () {
  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  var mm = file.match(/^histoire(\d+)-bd\.html$/);
  if (!mm) return;
  var N = mm[1];
  var NARR = {"Après les cours, direction le noraebang !": "수업이 끝나고, 노래방으로!", "Au cœur de Séoul, le palais Gyeongbokgung. En hanbok, l'entrée est gratuite — et les cerisiers sont en fleurs.": "서울 한복판, 경복궁. 한복을 입으면 입장은 무료 — 게다가 벚꽃이 활짝 폈다.", "Au restaurant, l'aîné lui propose d'abord un plat. Emma le reçoit à deux mains. Il sourit.": "식당에서 선배가 먼저 음식을 권한다. 에마는 두 손으로 받는다. 선배가 미소 짓는다.", "Aujourd'hui, Emma commence son premier jour de travail — une entreprise IT dans le quartier de Gangnam, à Séoul.": "오늘은 에마의 첫 출근 날 — 서울 강남에 있는 IT 회사다.", "Aujourd'hui, c'est l'anniversaire de Jiwoo. Mina et Emma ont préparé un cadeau.": "오늘은 지우의 생일. 미나와 에마는 선물을 준비했다.", "Aéroport d'Incheon, jour du départ.": "인천공항, 출국 날.", "C'est jour de soldes au centre commercial !": "쇼핑몰은 세일 중!", "Chuseok, la fête des récoltes. Emma est invitée chez la famille de Ji-woo. La maison sent bon les bonnes choses…": "추석, 한가위. 에마는 지우네 집에 초대받았다. 집 안엔 맛있는 냄새가 가득하다…", "Depuis quand la pluie était-elle devenue une corvée ? La faute au tourbillon du quotidien… ou à autre chose ?": "언제부터 비가 귀찮아진 걸까? 바쁜 일상 탓일까… 아니면 다른 이유일까?", "Deux jours plus tard, elle le recroise dans l'ascenseur du même immeuble. Il était trempé. Encore.": "이틀 뒤, 같은 건물 엘리베이터에서 그를 다시 만난다. 그는 흠뻑 젖어 있었다. 또.", "Deuxième visite : plus grand, plus lumineux…": "두 번째 집: 더 넓고, 더 밝다…", "Direction le concert — mais le métro n'attend pas…": "콘서트로 출발 — 그런데 지하철은 기다려 주지 않는다…", "Elle croyait saisir ce que cela voulait dire — et, en même temps, ne pas le saisir du tout.": "그 말의 뜻을 알 것도 같았고, 동시에 전혀 모를 것도 같았다.", "Emma est rentrée en France. Sa mère l'attendait à l'aéroport.": "에마는 프랑스로 돌아왔다. 공항에는 어머니가 기다리고 있었다.", "Emma ne se sent pas bien. Direction la clinique du quartier.": "에마는 몸이 좋지 않다. 동네 병원으로 향한다.", "Emma se rend à son entretien d'embauche. Elle est très nerveuse.": "에마는 면접을 보러 간다. 무척 긴장된다.", "En ouvrant la porte, elle dit doucement « 실례합니다 » — excusez-moi.": "문을 열며 그녀는 조용히 말한다 — \"실례합니다.\"", "Et ils repartent, le ventre plein et le cœur léger.": "그렇게 둘은 배부르고 가벼운 마음으로 길을 나선다.", "Grand-mère annonce que le dîner est prêt.": "할머니가 저녁이 다 됐다고 하신다.", "Grand-père explique les proverbes.": "할아버지가 속담을 설명해 주신다.", "Hana pend la crémaillère de son nouvel appartement.": "하나가 새 집에서 집들이를 한다.", "Jiwoo ouvre le cadeau…": "지우가 선물을 연다…", "Jiyeong se tenait devant la fenêtre. La pluie frappait la vitre. Sa tasse de café à la main, elle regardait la rue, en bas.": "지영은 창가에 서 있었다. 비가 창문을 두드렸다. 커피잔을 든 채, 그녀는 아래 거리를 내려다보았다.", "Korean Stories 뉴스 · Éducation & Société — « Le nombre d'apprenants de coréen explose dans le monde : quadruplé en dix ans. »": "Korean Stories 뉴스 · 교육과 사회 — \"전 세계 한국어 학습자 폭증, 10년 만에 네 배로.\"", "L'entretien se termine.": "면접이 끝난다.", "La nuit tombe. Il commence à faire froid.": "밤이 찾아온다. 날이 추워지기 시작한다.", "La nuit était profonde. Là où même les lumières de la ville avaient disparu, un jeune homme s'avançait lentement.": "밤이 깊었다. 도시의 불빛마저 사라진 곳을, 한 청년이 천천히 걸어갔다.", "La veille de l'examen TOPIK, Emma révise seule dans sa chambre. L'angoisse l'empêche de dormir.": "토픽 시험 전날, 에마는 방에서 홀로 공부한다. 불안해서 잠이 오지 않는다.", "Le chef d'équipe présente Emma aux membres de l'équipe. Elle se lève et salue.": "팀장이 팀원들에게 에마를 소개한다. 에마는 일어나 인사한다.", "Le débat s'enflamme.": "토론이 뜨거워진다.", "Le débat se termine. Sans vraie conclusion !": "토론이 끝난다. 뚜렷한 결론도 없이!", "Le dîner se termine.": "저녁 식사가 끝난다.", "Le jjimjilbang : le sauna coréen, ouvert 24h/24, où l'on se détend, on mange et même on dort. Première fois pour Emma…": "찜질방: 24시간 문을 여는 한국식 사우나. 쉬고, 먹고, 심지어 잠도 잔다. 에마는 처음이다…", "Le kimchi est terminé !": "김치가 다 완성됐다!", "Le lendemain matin, Emma se promène sur la plage de Haeundae. En écoutant le bruit des vagues, elle murmure des mots de coréen.": "다음 날 아침, 에마는 해운대 바닷가를 거닌다. 파도 소리를 들으며 한국어 단어를 가만히 되뇐다.", "Le lundi suivant, il pleut de nouveau. Jiyeong a pris un parapluie — mais elle ne l'ouvre pas.": "다음 주 월요일, 또 비가 내린다. 지영은 우산을 챙겼지만 — 펴지 않는다.", "Le matin de l'examen, Emma avale son petit-déjeuner et file au centre. Le métro a failli la mettre en retard, mais elle arrive juste à temps.": "시험 날 아침, 에마는 아침을 급히 먹고 고사장으로 향한다. 지하철 때문에 늦을 뻔했지만, 가까스로 시간에 맞춰 도착한다.", "Le recruteur pose ses questions.": "면접관이 질문을 던진다.", "Le rendez-vous était à 19 h. À 20 h, Ji-woo attendait toujours, seule, de plus en plus agacée…": "약속은 저녁 7시였다. 8시가 되도록 지우는 혼자 기다리며 점점 화가 났다…", "Le soir, devant une supérette ouverte 24h/24…": "밤, 24시간 편의점 앞에서…", "Le soir, dîner avec les collègues dans un restaurant de poisson cru. Hélas, Emma doit rentrer à Séoul le lendemain.": "저녁, 동료들과 횟집에서 회식. 아쉽게도 에마는 다음 날 서울로 돌아가야 한다.", "Le week-end. Mina rend visite à sa grand-mère.": "주말. 미나가 할머니 댁을 찾는다.", "Les amis mangent du miyeokguk, la soupe d'algues.": "친구들이 미역국을 먹는다.", "Les plats arrivent. L'ambiance est chaleureuse.": "음식이 나온다. 분위기가 훈훈하다.", "Les trois amis arrivent au parc du Han. Il y a beaucoup de monde.": "세 친구가 한강 공원에 도착한다. 사람이 정말 많다.", "Mina a invité Emma chez elle. Petit tour du propriétaire…": "미나가 에마를 집에 초대했다. 집 구경을 시작한다…", "Mina aide sa grand-mère à préparer le kimchi.": "미나가 할머니를 도와 김치를 담근다.", "Mina file à la cuisine. Maman a déjà préparé le petit-déjeuner.": "미나가 부엌으로 간다. 엄마가 벌써 아침을 차려 놓았다.", "Mina ne se sent pas bien. Direction la clinique…": "미나는 몸이 좋지 않다. 병원으로 향한다…", "Mina regarde l'horloge. Il est déjà 8 h 30 !": "미나가 시계를 본다. 벌써 8시 30분!", "Mina rend visite à son grand-père. Il est en train de lire.": "미나가 할아버지를 찾아뵙는다. 할아버지는 책을 읽고 계신다.", "Première visite : un studio près du métro.": "첫 번째 집: 지하철역 근처 원룸.", "Quelques minutes plus tard…": "몇 분 뒤…", "Samedi après-midi. Mina et Joon sont dans la cuisine, prêts à cuisiner.": "토요일 오후. 미나와 준이 부엌에서 요리할 준비를 한다.", "Sept heures du matin. L'alarme sonne.": "아침 7시. 알람이 울린다.", "Sitôt rentrée chez elle, Emma a repris ses cours de coréen. La Corée lui manquait déjà — mais penser à son prochain voyage la faisait vibrer.": "집에 돌아오자마자 에마는 한국어 공부를 다시 시작했다. 벌써 한국이 그리웠다 — 그래도 다음 여행 생각에 마음이 들떴다.", "Séoul s'illumine. Emma découvre la ville avec ses amis coréens…": "서울의 밤이 빛난다. 에마는 한국 친구들과 도시를 둘러본다…", "TOPIK 3급 합격 — reçue au niveau 3 !": "토픽 3급 합격 — 3급에 붙었다!", "Tous deux ont ri. Dehors, la pluie continuait, paisible. Quelque chose semblait commencer.": "둘은 함께 웃었다. 밖에는 비가 잔잔히 내리고 있었다. 무언가 시작되는 것 같았다.", "Trente minutes plus tard, le kimbap est prêt.": "30분 뒤, 김밥이 완성됐다.", "Trois amis, un café, un débat : ville ou campagne ?": "세 친구, 카페 하나, 그리고 토론: 도시냐 시골이냐?", "Trois semaines plus tard, les résultats tombent. Les mains tremblantes, Emma se connecte au site. À l'instant où l'écran s'affiche, les larmes montent.": "3주 뒤, 결과가 나온다. 떨리는 손으로 에마는 사이트에 접속한다. 화면이 뜨는 순간, 눈물이 차오른다.", "Un après-midi dans un café tendance de Séoul…": "서울의 어느 핫한 카페, 오후…", "Un matin au marché de Séoul…": "서울의 어느 시장, 아침…", "Un matin ensoleillé à Séoul…": "화창한 아침, 서울…", "Un samedi, direction Hongdae !": "어느 토요일, 홍대로!", "Un soir d'automne, à Séoul…": "서울의 어느 가을 저녁…", "Un soir tranquille, chez Joon…": "준의 집, 고요한 저녁…", "Un soir, au bord de la rivière…": "어느 저녁, 강가에서…", "Une dispute, des excuses sincères, une promesse — et l'amitié repart, plus solide qu'avant.": "다툼, 진심 어린 사과, 그리고 약속 — 우정은 전보다 더 단단해져 다시 시작된다.", "Une semaine plus tard, Emma reçoit un message : elle est prise !": "일주일 뒤, 에마에게 문자가 온다: 합격이다!", "Vendredi soir : toute l'équipe part pour Busan. À peine montés dans le KTX, les collègues sortent des bières.": "금요일 저녁: 팀 전체가 부산으로 떠난다. KTX에 타자마자 동료들이 맥주를 꺼낸다.", "Vendredi soir. C'est le premier hoesik d'Emma.": "금요일 저녁. 에마의 첫 회식이다.", "Vendredi soir. Les trois amis décident d'aller au parc du Han.": "금요일 저녁. 세 친구는 한강 공원에 가기로 한다.", "« 오늘의 한국 » · épisode 14 — « Sommes-nous vraiment coréens ? » Une réflexion au micro sur l'identité coréenne post-Hallyu.": "\"오늘의 한국\" · 14화 — \"우리는 정말 한국 사람일까?\" 한류 이후의 한국인 정체성을 마이크 앞에서 이야기한다.", "À l'heure du déjeuner, un aîné s'approche. Emma est un peu stressée, mais la conversation se fait naturellement.": "점심시간, 한 선배가 다가온다. 에마는 조금 긴장되지만, 대화는 자연스럽게 이어진다.", "À la clinique, un matin.": "어느 아침, 병원에서.", "À midi, direction le marché Jagalchi. Une ajumma tend un morceau de poisson à Emma.": "점심 무렵, 자갈치 시장으로. 한 아주머니가 에마에게 생선 한 점을 건넨다.", "계속됩니다 — À suivre…": "계속됩니다 — 다음 편에…", "Au marché !": "시장에서!", "Des pastèques bien mûres ~": "잘 익은 수박 ~", "Des portants pleins de bonnes affaires ~": "옷걸이 가득한 할인 상품 ~", "Des rayons remplis de snacks ~": "과자가 가득한 진열대 ~", "Et des concerts de rue !": "그리고 거리 공연까지!", "Et plein de petits plats (banchan).": "그리고 푸짐한 반찬.", "Hongdae vibre jusqu'à l'aube ~": "홍대는 새벽까지 들썩인다 ~", "L'avion attend.": "비행기가 기다린다.", "La ligne 2, le grand cercle de Séoul.": "2호선, 서울을 도는 순환선.", "La ruelle des fresques.": "벽화가 그려진 골목.", "La soupe fume encore.": "국이 아직 김을 낸다.", "Le thermomètre confirme la fièvre.": "체온계가 열을 확인해 준다.", "Les paroles défilent à l'écran ~": "화면에 가사가 흘러간다 ~", "On mélange bien le bibimbap…": "비빔밥을 쓱쓱 비빈다…", "On vérifie le prix sur l'étiquette.": "가격표로 가격을 확인한다.", "Parfait pour Instagram !": "인스타그램에 딱!", "Passeport, billet… tout est prêt.": "여권, 항공권… 모두 준비 완료.", "Un verre d'eau bien fraîche.": "시원한 물 한 잔.", "Une grande table de plats coréens ~": "한 상 가득한 한국 음식 ~", "« J'adore ça ! »": "\"이거 정말 좋아!\"", "교통카드 — on bipe et c'est parti !": "교통카드 — 찍고 출발!", "남산타워 — la N Seoul Tower veille sur la ville.": "남산타워 — 서울을 내려다본다.", "라면 — qui mijote sur le feu ~": "라면 — 보글보글 끓는다 ~", "마이크 — à toi de jouer !": "마이크 — 이제 네 차례!", "선물 — le cadeau de crémaillère.": "선물 — 집들이 선물.", "신발 벗어요 — on se déchausse à l'entrée.": "신발 벗어요 — 입구에서 신발을 벗는다.", "아이스 아메리카노 — bien glacé !": "아이스 아메리카노 — 시원하게!", "약 — le médicament contre le rhume.": "약 — 감기약.", "컵라면 — l'icône de la supérette !": "컵라면 — 편의점의 아이콘!"};
  var CUR = {"1": ["ks_a03", 12], "2": ["ks_a15", 12], "3": ["ks_a27", 15], "12": ["ks_b09", 12], "13": ["ks_b12", 12], "14": ["ks_b17", 12], "15": ["ks_b31", 12], "16": ["ks_c13", 12], "17": ["ks_c16", 12], "18": ["ks_c21", 12], "19": ["ks_c23", 15], "20": ["ks_d06", 12], "21": ["ks_d09", 12], "22": ["ks_d22", 12], "23": ["ks_d23", 12], "24": ["ks_d24", 15], "25": ["ks_c30", 12], "26": ["ks_c31", 12], "27": ["ks_b37", 12], "28": ["ks_b38", 12], "29": ["ks_a41", 12], "30": ["ks_a42", 10], "31": ["ks_a43", 15], "32": ["ks_a35", 15], "33": ["ks_a37", 15], "34": ["ks_b43", 18], "35": ["ks_b44", 18], "36": ["ks_b45", 18], "37": ["ks_c36", 20], "38": ["ks_c37", 20], "39": ["ks_c38", 20], "40": ["ks_d35", 22], "41": ["ks_d36", 22], "42": ["ks_d37", 22]};

  var css = "\n  body.no-rom .caption .rom, body.no-rom .tl .rom{display:none}\n  #vpRom{display:none!important}\n  .narr{font-style:normal}\n  .narr .nkr{display:block;font-family:\"Noto Sans KR\",sans-serif;font-style:normal;font-weight:700;line-height:1.45}\n  .narr .nfr{display:block;font-style:italic;font-size:12.5px;color:#8a7a55;margin-top:5px;font-family:\"Spectral\",serif;line-height:1.35}\n  .tl .nkr{display:block;font-family:\"Noto Sans KR\",sans-serif;font-weight:600}\n  .tl .nfr{display:block;font-style:italic;font-size:12px;color:var(--ink-soft);margin-top:2px}\n  body:not(.bd-fr) .caption{display:none}\n  body:not(.bd-fr) .narr .nfr{display:none}\n  body:not(.bd-fr) .tl .nfr{display:none}\n  #frBtn[aria-pressed=\"true\"]{background:var(--ink);color:var(--paper)}\n  @media(max-width:559px){\n    .balloon{max-width:64%;padding:6px 10px 7px;border-radius:15px;top:9px}\n    .case.m .balloon{left:9px} .case.j .balloon{right:9px}\n    .balloon .kr{font-size:15.5px;line-height:1.4}\n    .balloon .speaker{font-size:9.5px;padding:2px 6px;margin-bottom:3px}\n    .cell:not(.full) .balloon{max-width:88%}\n  }\n";
  var st = document.createElement('style'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  document.body.classList.add('no-rom');

  function esc(s){ var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* Narration -> coréen (FR conservé pour l'option) */
  document.querySelectorAll('.narr').forEach(function (el) {
    var key = el.innerHTML.trim(), frTxt = el.textContent.trim(), kr = NARR[key];
    el.innerHTML = '<span class="nkr">' + esc(kr || frTxt) + '</span>' +
                   (kr ? '<span class="nfr">' + esc(frTxt) + '</span>' : '');
  });
  /* Libellés d'ambiance (.tl .fr) -> coréen + FR optionnel */
  document.querySelectorAll('.tl .fr').forEach(function (fr) {
    var key = fr.innerHTML.trim(), frTxt = fr.textContent.trim(), kr = NARR[key];
    if (kr) fr.outerHTML = '<span class="nkr">' + esc(kr) + '</span><span class="nfr">' + esc(frTxt) + '</span>';
  });

  /* Pastille « FR » (réutilise #romBtn sans son ancien comportement) */
  var romBtn = document.getElementById('romBtn');
  if (romBtn) {
    var b = romBtn.cloneNode(false);
    b.id = 'frBtn'; b.textContent = 'FR'; b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Afficher la traduction française');
    romBtn.parentNode.replaceChild(b, romBtn);
    b.addEventListener('click', function () {
      var on = document.body.classList.toggle('bd-fr');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      try { localStorage.setItem('ks_pref_bdfr', on ? '1' : '0'); } catch (e) {}
    });
    try { if (localStorage.getItem('ks_pref_bdfr') === '1') { document.body.classList.add('bd-fr'); b.setAttribute('aria-pressed', 'true'); } } catch (e) {}
  }

  /* « Déjà lu » (carte du hub) + validation de l'étape de parcours, en fin de scroll */
  var cur = CUR[N];
  var progKey = 'ks_bd_h' + N + '_prog';
  var marked = false;
  function markRead() {
    if (marked) return;
    try {
      localStorage.setItem(progKey, '100');
      if (cur && localStorage.getItem(cur[0]) !== 'done') {
        localStorage.setItem(cur[0], 'done');
        localStorage.setItem('ks_xp', String((parseInt(localStorage.getItem('ks_xp') || '0', 10) || 0) + cur[1]));
        var today = new Date().toISOString().slice(0, 10);
        var l = localStorage.getItem('ks_lastplay'), s = parseInt(localStorage.getItem('ks_streak') || '0', 10) || 0;
        if (l !== today) {
          localStorage.setItem('ks_streak', String(l && (new Date(today) - new Date(l)) / 86400000 === 1 ? s + 1 : 1));
          localStorage.setItem('ks_lastplay', today);
        }
      }
      marked = true; window.removeEventListener('scroll', check);
    } catch (e) {}
  }
  function check() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var y = window.scrollY || h.scrollTop || 0;
    if (max <= 40 || y >= max - 90) markRead();
  }
  window.addEventListener('scroll', check, { passive: true });
  if (document.readyState !== 'loading') setTimeout(check, 600);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(check, 600); });
})();
