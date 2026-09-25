(function(){
  var KEY='bmq-cookies';
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function set(v){try{localStorage.setItem(KEY,v)}catch(e){}}

  // menu mobile
  var mb=document.querySelector('.menu-btn'),nav=document.querySelector('.nav');
  if(mb&&nav){mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
    nav.addEventListener('click',function(e){if(e.target.closest('a')){nav.classList.remove('open');mb.setAttribute('aria-expanded','false')}})}

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
    var b=e.target.closest('[data-show-map]');
    if(b){loadMaps();}
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

  var y=document.querySelectorAll('[data-year]');y.forEach(function(n){n.textContent=new Date().getFullYear()});

  // navegação por hash (só na versão de revisão)
  if(document.body.hasAttribute('data-spa')){
    var pages=[].slice.call(document.querySelectorAll('[data-page]'));
    function route(){
      var id=(location.hash||'#inicio').slice(1)||'inicio';
      var hit=pages.some(function(p){return p.getAttribute('data-page')===id});
      if(!hit)id='inicio';
      pages.forEach(function(p){p.hidden=p.getAttribute('data-page')!==id});
      document.querySelectorAll('.nav a[data-link]').forEach(function(a){
        if(a.getAttribute('data-link')===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
      window.scrollTo(0,0);
    }
    window.addEventListener('hashchange',route);route();
  }
})();
