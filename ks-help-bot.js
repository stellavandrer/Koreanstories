/* ═══════════════════════════════════════════════════════════════════
   ks-help-bot.js — Assistant d'aide par questions pré-écrites (pas d'IA
   générative, pas d'appel réseau) : un bouton flottant ouvre un panneau
   façon chat où l'utilisateur clique une question, et la réponse
   pré-rédigée s'affiche comme si le "bot" répondait. Couvre app/
   apprentissage + compte/Premium. Pour tout le reste : renvoi vers
   contact@koreanstories.fr.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(document.getElementById('ksHelpBot')) return;

  var CATS = [
    {
      id: 'app',
      label: "Utiliser l'app",
      icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',
      qas: [
        {q: "Par où commencer si je suis débutant·e ?", a: "Le test de niveau à l'inscription te place automatiquement au bon endroit. Si tu n'as jamais fait de coréen, tu démarres par le module Hangeul (l'alphabet) — compte 2-3 semaines pour le maîtriser, puis le parcours t'amène de A1 à B2."},
        {q: "Combien de temps par jour ?", a: "15-20 minutes suffisent. L'objectif quotidien par défaut est 50 XP (1-2 activités). La régularité compte plus que l'intensité."},
        {q: "Comment fonctionnent les XP et le streak ?", a: "Chaque activité donne 5 à 50 XP selon la difficulté. Le streak compte tes jours consécutifs de pratique — tu as 2 « gels » automatiques par mois qui le sauvent si tu rates un jour."},
        {q: "Qu'est-ce que la révision SRS ?", a: "C'est la répétition espacée : chaque mot appris revient juste avant que tu risques de l'oublier (1 jour, puis 3, 7, 14, 30...). Pratique-la dans le menu Révisions."},
        {q: "Je ne trouve pas un mot dans le dictionnaire", a: "Le dictionnaire couvre environ 45 000 mots (français ⇄ coréen), avec conjugaison et romanisation automatiques. Essaie une autre orthographe, ou consulte le <a href=\"dictionnaire.html\">dictionnaire</a> directement."},
        {q: "Qui parle dans les leçons et histoires ?", a: "Chaque personnage a sa propre voix coréenne naturelle générée par IA — jamais de synthèse robotique. Si un mot du dictionnaire n'a pas encore d'audio, le bouton le signale simplement, sans jouer de son de substitution."},
        {q: "Comment installer l'app sur mon téléphone ?", a: "Sur iPhone : Safari → bouton Partager → « Sur l'écran d'accueil ». Sur Android : Chrome → menu → « Installer l'app »."}
      ]
    },
    {
      id: 'compte',
      label: 'Compte & Premium',
      icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0114 0v1"/>',
      qas: [
        {q: "Dois-je créer un compte ?", a: "Non, l'app fonctionne sans compte (données stockées localement). Un compte gratuit permet en plus de sauvegarder ta progression dans le cloud et de synchroniser entre appareils."},
        {q: "Comment obtenir Premium ?", a: "Sur la <a href=\"premium.html\">page Premium</a>, choisis un plan (5€/mois ou 79€ à vie) et paie via Stripe. Ta clé de licence arrive par email et se remplit automatiquement si tu es connecté·e."},
        {q: "Comment annuler mon abonnement ?", a: "Réglages → Premium → « Gérer mon abonnement » ouvre le portail client Stripe. Ton accès reste actif jusqu'à la fin de la période déjà payée, sans nouveau prélèvement ensuite."},
        {q: "Puis-je être remboursé·e ?", a: "Le service étant à accès immédiat, le droit de rétractation légal ne s'applique pas une fois la clé envoyée — mais on étudie toute demande de bonne foi sous 14 jours à contact@koreanstories.fr."},
        {q: "Où voir mes factures ?", a: "Réglages → Premium → « Voir / télécharger mes factures » ouvre le portail client Stripe."},
        {q: "J'ai oublié mon mot de passe", a: "Utilise le lien « Mot de passe oublié » sur la page de connexion, ou change-le directement dans Réglages → Compte si tu es déjà connecté·e."},
        {q: "Comment supprimer mon compte ?", a: "Écris à contact@koreanstories.fr avec l'objet « Suppression compte » (droit à l'effacement RGPD, sous 30 jours). Pense à exporter tes données avant si tu veux les garder."},
        {q: "Mes données sont-elles privées ?", a: "Oui, seule toi peux voir tes XP/streaks/leçons par défaut. Si tu actives le classement communautaire, seuls prénom/XP/streak/avatar deviennent visibles — désactivable à tout moment."}
      ]
    }
  ];

  var CSS = ''
    +'#ksHelpBot{position:fixed;right:16px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:1200;font-family:inherit}'
    +'#ksHelpBotBtn{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#e0c48a,var(--gold,#C9A96E));border:none;box-shadow:0 10px 28px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1a1208}'
    +'#ksHelpBotBtn svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    +'#ksHelpBotPanel{position:fixed;right:16px;bottom:calc(140px + env(safe-area-inset-bottom));left:16px;max-width:380px;margin-left:auto;height:min(520px,70vh);background:var(--surf,#fff);border:1px solid var(--bd,#DAE3F2);border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.3);display:none;flex-direction:column;overflow:hidden;z-index:1201}'
    +'#ksHelpBotPanel.on{display:flex}'
    +'.khb-hd{background:linear-gradient(135deg,#0F1B2D,#16263d);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:8px}'
    +'.khb-hd b{font-size:14px;flex:1}'
    +'.khb-hd button{background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;padding:4px}'
    +'.khb-hd button svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}'
    +'.khb-body{flex:1;overflow-y:auto;padding:14px;background:var(--bg,#F5F8FC)}'
    +'.khb-msg{max-width:88%;margin:6px 0;padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.5}'
    +'.khb-msg.bot{background:var(--surf,#fff);border:1px solid var(--bd,#DAE3F2);color:var(--tx,#0D1823);border-bottom-left-radius:4px}'
    +'.khb-msg.user{background:var(--gold,#C9A96E);color:#1a1208;margin-left:auto;border-bottom-right-radius:4px;font-weight:600}'
    +'.khb-msg a{color:inherit;text-decoration:underline}'
    +'.khb-choices{display:flex;flex-direction:column;gap:6px;margin-top:8px}'
    +'.khb-chip{text-align:left;background:var(--surf,#fff);border:1.5px solid var(--bd,#DAE3F2);border-radius:12px;padding:9px 12px;font-size:12.5px;font-weight:600;color:var(--tx,#0D1823);cursor:pointer;font-family:inherit}'
    +'.khb-chip:hover{border-color:var(--gold,#C9A96E)}'
    +'.khb-back{display:inline-flex;align-items:center;gap:4px;background:none;border:none;color:var(--t2,#475E78);font-size:12px;font-weight:700;cursor:pointer;padding:4px 0;margin-bottom:8px;font-family:inherit}'
    +'.khb-cat-icon{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}'
    +'.khb-chip-row{display:flex;align-items:center;gap:8px}'
    +'.khb-contact{margin-top:10px;text-align:center;font-size:11.5px;color:var(--t3,#8FA5BE)}'
    +'.khb-contact a{color:var(--gold-text,#8B6B3D);font-weight:700}'
    +'@media (max-width:420px){#ksHelpBotPanel{right:10px;left:10px;bottom:calc(132px + env(safe-area-inset-bottom));height:min(500px,72vh);max-width:none;width:auto;margin-left:0}}';

  function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d.firstElementChild; }

  function inject(){
    var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    var root=el('<div id="ksHelpBot">'
      +'<button id="ksHelpBotBtn" type="button" aria-label="Aide" aria-haspopup="dialog" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M12 18h.01"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 2-3 5"/><circle cx="12" cy="12" r="10"/></svg></button>'
      +'</div>');
    var panel=el('<div id="ksHelpBotPanel" role="dialog" aria-modal="false" aria-label="Assistant d\'aide">'
      +'<div class="khb-hd"><b>Assistant Korean Stories</b><button type="button" id="khbClose" aria-label="Fermer"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
      +'<div class="khb-body" id="khbBody"></div>'
      +'</div>');
    document.body.appendChild(root);
    document.body.appendChild(panel);

    var btn=document.getElementById('ksHelpBotBtn');
    var body=document.getElementById('khbBody');
    var closeBtn=document.getElementById('khbClose');
    var opened=false;

    function scrollBottom(){ body.scrollTop=body.scrollHeight; }

    function renderMenu(){
      var html='<div class="khb-msg bot">Salut ! Choisis une catégorie ou une question ci-dessous 👇</div><div class="khb-choices">';
      CATS.forEach(function(c){
        html+='<button type="button" class="khb-chip khb-chip-row" data-cat="'+c.id+'"><svg class="khb-cat-icon" viewBox="0 0 24 24">'+c.icon+'</svg>'+c.label+'</button>';
      });
      html+='</div><div class="khb-contact">Rien trouvé ? <a href="mailto:contact@koreanstories.fr">Écris-nous</a>, on répond personnellement.</div>';
      body.innerHTML=html;
      body.querySelectorAll('[data-cat]').forEach(function(b){
        b.addEventListener('click', function(){ renderCategory(b.getAttribute('data-cat')); });
      });
    }

    function renderCategory(catId){
      var cat=CATS.filter(function(c){return c.id===catId;})[0];
      if(!cat) return;
      var html='<button type="button" class="khb-back" data-back="1"><svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.4" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Retour</button>';
      html+='<div class="khb-msg bot">'+cat.label+' — choisis une question :</div><div class="khb-choices">';
      cat.qas.forEach(function(item,i){
        html+='<button type="button" class="khb-chip" data-cat="'+cat.id+'" data-idx="'+i+'">'+item.q+'</button>';
      });
      html+='</div>';
      body.innerHTML=html;
      body.querySelector('[data-back]').addEventListener('click', renderMenu);
      body.querySelectorAll('[data-idx]').forEach(function(b){
        b.addEventListener('click', function(){
          answerQuestion(cat, parseInt(b.getAttribute('data-idx'),10));
        });
      });
    }

    function answerQuestion(cat, idx){
      var item=cat.qas[idx];
      var html='<button type="button" class="khb-back" data-back-cat="'+cat.id+'"><svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.4" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Retour</button>';
      html+='<div class="khb-msg user">'+item.q+'</div>';
      html+='<div class="khb-msg bot">'+item.a+'</div>';
      html+='<div class="khb-choices" style="margin-top:12px">';
      cat.qas.forEach(function(other,i){
        if(i===idx) return;
        html+='<button type="button" class="khb-chip" data-idx="'+i+'">'+other.q+'</button>';
      });
      html+='</div>';
      html+='<button type="button" class="khb-back" data-menu="1" style="margin-top:8px">↺ Toutes les catégories</button>';
      body.innerHTML=html;
      body.querySelector('[data-back-cat]').addEventListener('click', function(){ renderCategory(cat.id); });
      var menuBtn=body.querySelector('[data-menu]');
      if(menuBtn) menuBtn.addEventListener('click', renderMenu);
      body.querySelectorAll('[data-idx]').forEach(function(b){
        b.addEventListener('click', function(){ answerQuestion(cat, parseInt(b.getAttribute('data-idx'),10)); });
      });
      scrollBottom();
    }

    function open(){
      opened=true;
      panel.classList.add('on');
      btn.setAttribute('aria-expanded','true');
      if(!body.innerHTML) renderMenu();
    }
    function close(){
      opened=false;
      panel.classList.remove('on');
      btn.setAttribute('aria-expanded','false');
      btn.focus();
    }
    btn.addEventListener('click', function(){ opened?close():open(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && opened) close(); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
