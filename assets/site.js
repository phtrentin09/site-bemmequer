(function(){
  var KEY='bmq-cookies';
  var root=document.documentElement;
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function set(v){try{localStorage.setItem(KEY,v)}catch(e){}}

  // menu no celular
  var mb=document.querySelector('.menu-btn'),nav=document.getElementById('menu');
  function setMenu(open){
    if(!mb||!nav)return;
    nav.classList.toggle('open',open);
    root.classList.toggle('menu-open',open);
    mb.setAttribute('aria-expanded',open);
    var l=mb.querySelector('.menu-label');if(l)l.textContent=open?'Fechar':'Menu';
  }
  if(mb&&nav){
    mb.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
    nav.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){setMenu(false);mb.focus()}});
    window.addEventListener('resize',function(){if(window.innerWidth>900&&nav.classList.contains('open'))setMenu(false)});
  }

  // linha sob o cabeçalho depois de rolar
  var hdr=document.querySelector('.site-header');
  if(hdr){
    var onScroll=function(){hdr.classList.toggle('is-scrolled',window.scrollY>8)};
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  }

  // mapas: só carregam com consentimento
  function loadMaps(){
    document.querySelectorAll('.map[data-src]').forEach(function(m){
      if(m.querySelector('iframe'))return;
      var f=document.createElement('iframe');
      f.src=m.getAttribute('data-src');f.loading='lazy';f.title='Mapa da Bem Me Quer';
      f.referrerPolicy='no-referrer-when-downgrade';
      m.innerHTML='';m.appendChild(f);
    });
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-show-map]'))loadMaps();
  });

  // aviso de cookies
  var box=document.getElementById('cookie');
  function show(){if(box)box.hidden=false}
  function hide(){if(box)box.hidden=true}
  if(box){
    var c=get();
    if(!c)show(); else if(c==='all')loadMaps();
    box.querySelector('[data-accept]').addEventListener('click',function(){set('all');hide();loadMaps()});
    box.querySelector('[data-essential]').addEventListener('click',function(){set('essential');hide()});
  }
  document.querySelectorAll('[data-cookie-prefs]').forEach(function(b){b.addEventListener('click',show)});

  document.querySelectorAll('[data-year]').forEach(function(n){n.textContent=new Date().getFullYear()});

  // entrada suave de fotos e blocos marcados com data-reveal
  var items=document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window&&items.length){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target)}});
    },{rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(el){io.observe(el)});
  }else{items.forEach(function(el){el.classList.add('is-in')})}
})();
