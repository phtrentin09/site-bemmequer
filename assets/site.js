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

// trabalhe conosco: monta a mensagem de WhatsApp com os campos do formulário
(function(){
  var f=document.getElementById('job-form'),a=document.getElementById('job-send');
  if(!f||!a)return;
  var base=a.getAttribute('href').split('?')[0];
  function upd(){
    var v=function(n){var el=f.elements[n];return el?el.value.trim():''};
    var l=['Olá! Tenho interesse em trabalhar na Bem Me Quer.'];
    if(v('nome'))l.push('Nome: '+v('nome'));
    if(v('telefone'))l.push('Telefone: '+v('telefone'));
    l.push('Área: '+v('area'));
    if(v('bairro'))l.push('Bairro: '+v('bairro'));
    if(v('experiencia'))l.push('Experiência: '+v('experiencia'));
    l.push('Vou anexar meu currículo aqui na conversa.');
    a.setAttribute('href',base+'?text='+encodeURIComponent(l.join('\n')));
  }
  f.addEventListener('input',upd);f.addEventListener('change',upd);
  f.addEventListener('submit',function(e){e.preventDefault()});
  upd();
})();

// galeria: abre as fotos em tela cheia (a casa, detalhes dos quartos, atividades, página inicial)
(function(){
  var SEL='.mosaic,.details,.gallery,.conv';
  var box,img,cap,count,list=[],idx=0,lastFocus;
  function build(){
    box=document.createElement('div');box.className='lb';box.hidden=true;
    box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Foto ampliada');
    box.innerHTML='<button class="lb-close" type="button" aria-label="Fechar">×</button>'+
      '<button class="lb-nav lb-prev" type="button" aria-label="Foto anterior">‹</button>'+
      '<figure class="lb-fig"><img alt=""><figcaption><span class="lb-cap"></span><span class="lb-count"></span></figcaption></figure>'+
      '<button class="lb-nav lb-next" type="button" aria-label="Próxima foto">›</button>';
    document.body.appendChild(box);
    img=box.querySelector('img');cap=box.querySelector('.lb-cap');count=box.querySelector('.lb-count');
    box.querySelector('.lb-close').onclick=close;
    box.querySelector('.lb-prev').onclick=function(e){e.stopPropagation();go(-1)};
    box.querySelector('.lb-next').onclick=function(e){e.stopPropagation();go(1)};
    box.addEventListener('click',function(e){if(e.target===box||e.target.classList.contains('lb-fig'))close()});
    var x0=null;
    box.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    box.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)go(dx<0?1:-1);x0=null});
  }
  function show(){
    var el=list[idx];img.src=el.currentSrc||el.src;img.alt=el.alt||'';
    var fc=el.closest('figure')&&el.closest('figure').querySelector('figcaption');
    cap.textContent=fc?fc.textContent.trim():'';
    count.textContent=list.length>1?(idx+1)+' de '+list.length:'';
    box.querySelector('.lb-prev').hidden=box.querySelector('.lb-next').hidden=list.length<2;
  }
  function open(el){
    if(!box)build();
    var g=el.closest(SEL);
    list=[].slice.call(g.querySelectorAll('img'));idx=list.indexOf(el);
    lastFocus=document.activeElement;show();box.hidden=false;document.documentElement.classList.add('lb-open');
    box.querySelector('.lb-close').focus();
  }
  function close(){box.hidden=true;document.documentElement.classList.remove('lb-open');if(lastFocus)lastFocus.focus()}
  function go(d){idx=(idx+d+list.length)%list.length;show()}
  document.addEventListener('keydown',function(e){
    if(box&&!box.hidden){if(e.key==='Escape')close();else if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1);return}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.zoomable')){e.preventDefault();open(e.target)}
  });
  document.addEventListener('click',function(e){
    var IMGSEL=SEL.split(',').map(function(x){return x+' img'}).join(',');
    var el=e.target.closest&&e.target.closest(IMGSEL);
    if(!el)return;
    var g=el.closest(SEL);if(g.closest('a'))return;
    e.preventDefault();open(el);
  });
  document.querySelectorAll(SEL).forEach(function(g){
    g.querySelectorAll('img').forEach(function(i){i.classList.add('zoomable');i.tabIndex=0;i.setAttribute('role','button');i.setAttribute('aria-label','Ampliar foto'+(i.alt?': '+i.alt:''))});
  });
})();
