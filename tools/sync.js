#!/usr/bin/env node
/*
  Atualiza as partes repetidas de todas as páginas a partir de site.config.json.
  Uso:  node tools/sync.js

  O que ele faz em cada arquivo .html da raiz:
  1. Substitui o conteúdo entre os marcadores
       <!-- @head --> ... <!-- /@head -->       (fontes, CSS, ícone, dados estruturados)
       <!-- @header --> ... <!-- /@header -->   (cabeçalho e menu)
       <!-- @footer --> ... <!-- /@footer -->   (rodapé, botão de WhatsApp, aviso de cookies, script)
  2. Reescreve links e textos marcados no conteúdo da página:
       data-wa="padrao" | data-wa="visita"      -> link de WhatsApp com a mensagem do config
       data-wa-msg="texto livre"                -> link de WhatsApp com essa mensagem
       data-tel                                 -> link tel: do telefone fixo
       data-maps                                -> link do Google Maps para o endereço
       data-insta                               -> link do Instagram
       (o mapa incorporado da página de contato também é atualizado)
       data-cfg="whatsappExibicao" (etc.)       -> texto do elemento vira o valor do config
       <svg data-icon="wa"></svg>               -> ícone do WhatsApp

  Não há dependências: só Node.js.
*/
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const c = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const e = c.endereco;

const wa = (msg) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`;
const tel = `tel:${c.telefone}`;
const enderecoLinha = `${e.rua}, ${e.bairro}, ${e.cidade}, ${e.uf}, ${e.cep}`;
const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoLinha)}`;
const insta = `https://www.instagram.com/${c.instagram}/`;
const ext = 'target="_blank" rel="noopener"';

const WA_ICON = '<svg data-icon="wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.15-1.5A9.94 9.94 0 1 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.05.9.9-2.97-.2-.31a8.2 8.2 0 1 1 6.85 3.71Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43l-.75-1.8c-.2-.47-.4-.4-.55-.41h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04 4.76 4.76 0 0 0 1 2.53 10.9 10.9 0 0 0 4.18 3.69c1.55.67 2.16.73 2.94.61.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>';

const NAV = [
  ['a-casa', '/a-casa', 'A casa'],
  ['quartos', '/quartos', 'Quartos'],
  ['cuidados', '/cuidados', 'Cuidados'],
  ['contato', '/contato', 'Contato'],
];

const ld = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: c.nomeCompleto,
  description: c.resumo,
  telephone: '+' + c.whatsapp,
  address: { '@type': 'PostalAddress', streetAddress: e.rua, addressLocality: e.cidade, addressRegion: e.uf, postalCode: e.cep, addressCountry: 'BR' },
  sameAs: [insta],
};

const head = () => `
<meta name="theme-color" content="#F6F2EA">
<link rel="icon" type="image/png" href="/img/flor.png">
<link rel="preload" href="/assets/fonts/newsreader-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/libre-franklin-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
`;

const header = (page) => `
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header">
 <div class="wrap hdr">
  <a class="brand" href="/" aria-label="${c.nome}, página inicial"${page === 'inicio' ? ' aria-current="page"' : ''}><span class="flor" aria-hidden="true"></span><span class="brand-name"><b>${c.nome}</b><small>${c.subtitulo}</small></span></a>
  <nav class="nav" id="menu" aria-label="Principal">
   ${NAV.map(([id, href, label]) => `<a href="${href}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`).join('\n   ')}
   <a class="nav-cta" href="${wa(c.mensagens.visita)}" ${ext}>Agendar visita</a>
   <div class="nav-extra">
    <a href="${wa(c.mensagens.padrao)}" ${ext}>WhatsApp ${c.whatsappExibicao}</a>
    <a href="${tel}">Telefone ${c.telefoneExibicao}</a>
    <span>${e.rua}, ${e.bairro}, ${e.cidade}</span>
   </div>
  </nav>
  <a class="hdr-cta" href="${wa(c.mensagens.visita)}" ${ext}>Agendar visita</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-lines" aria-hidden="true"></span><span class="menu-label">Menu</span></button>
 </div>
</header>
`;

const footer = () => `
<footer class="site-footer">
 <div class="wrap">
  <div class="ft-top">
   <p class="ft-kicker">Visitas com hora marcada</p>
   <a class="ft-address" href="${maps}" ${ext}>${e.rua}<span>${e.bairro}, ${e.cidade}</span></a>
   <div class="ft-actions">
    <span>WhatsApp</span><a href="${wa(c.mensagens.visita)}" ${ext}>${c.whatsappExibicao}</a>
    <span>Telefone</span><a href="${tel}">${c.telefoneExibicao}</a>
   </div>
  </div>
  <div class="ft-grid">
   <div class="ft-brand">
    <a class="brand" href="/"><span class="flor" aria-hidden="true"></span><span class="brand-name"><b>${c.nome}</b><small>${c.subtitulo}</small></span></a>
    <p>${c.resumo}</p>
   </div>
   <div>
    <h2 class="ft-h">Contato</h2>
    <ul>
     <li><a href="${wa(c.mensagens.padrao)}" ${ext}>WhatsApp ${c.whatsappExibicao}</a></li>
     <li><a href="${tel}">Telefone ${c.telefoneExibicao}</a></li>
     <li><a href="${insta}" ${ext}>Instagram @${c.instagram}</a></li>
     <li><a href="${maps}" ${ext}>${e.rua}<br>${e.bairro}, ${e.cidade}, ${e.uf}, ${e.cep}</a></li>
    </ul>
   </div>
   <div>
    <h2 class="ft-h">Páginas</h2>
    <ul>
     <li><a href="/">Início</a></li>
     ${NAV.map(([, href, label]) => `<li><a href="${href}">${label === 'Contato' ? 'Contato e visitas' : label}</a></li>`).join('\n     ')}
    </ul>
   </div>
   <div>
    <h2 class="ft-h">Documentos</h2>
    <ul>
     <li><a href="/privacidade">Política de Privacidade</a></li>
     <li><a href="/termos">Termos de Uso</a></li>
     <li><button class="linkbtn" type="button" data-cookie-prefs>Preferências de cookies</button></li>
    </ul>
   </div>
  </div>
  <div class="ft-bottom">
   <span>© <span data-year>2026</span> ${c.razaoSocial}, CNPJ ${c.cnpj}. Todos os direitos reservados.</span>
   <span>Site desenvolvido por <a href="${c.credito.url}" ${ext}>${c.credito.nome}</a></span>
  </div>
 </div>
</footer>
<a class="wa-float" href="${wa(c.mensagens.padrao)}" ${ext} aria-label="Conversar no WhatsApp">${WA_ICON}</a>
<div class="cookie" id="cookie" role="dialog" aria-label="Aviso de cookies" hidden>
 <p class="cookie-t">Cookies</p>
 <p>Usamos só o essencial para o site funcionar. O mapa do Google grava cookies dele e só carrega se você aceitar. Veja a <a href="/privacidade">Política de Privacidade</a>.</p>
 <div class="btn-row"><button class="btn btn-solid" type="button" data-accept>Aceitar</button><button class="btn btn-line" type="button" data-essential>Só o essencial</button></div>
</div>
<script src="/assets/site.js" defer></script>
`;

function block(html, name, content) {
  const re = new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- /@${name} -->)`);
  if (!re.test(html)) return html;
  return html.replace(re, `$1${content}$2`);
}

function get(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setHref(tag, href) {
  return /\shref="[^"]*"/.test(tag) ? tag.replace(/\shref="[^"]*"/, ` href="${href}"`) : tag.replace(/^<a\b/, `<a href="${href}"`);
}

const files = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
for (const f of files) {
  const file = path.join(root, f);
  let html = fs.readFileSync(file, 'utf8');
  const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1] || '';

  html = block(html, 'head', head());
  html = block(html, 'header', header(page));
  html = block(html, 'footer', footer());

  html = html.replace(/<svg data-icon="wa"[^>]*>[\s\S]*?<\/svg>/g, WA_ICON);
  html = html.replace(/<a\b[^>]*\sdata-wa="([^"]+)"[^>]*>/g, (tag, key) => setHref(tag, wa(c.mensagens[key] || c.mensagens.padrao)));
  html = html.replace(/<a\b[^>]*\sdata-wa-msg="([^"]+)"[^>]*>/g, (tag, msg) => setHref(tag, wa(msg)));
  html = html.replace(/<a\b[^>]*\sdata-tel\b[^>]*>/g, (tag) => setHref(tag, tel));
  html = html.replace(/<a\b[^>]*\sdata-maps\b[^>]*>/g, (tag) => setHref(tag, maps));
  html = html.replace(/<a\b[^>]*\sdata-insta\b[^>]*>/g, (tag) => setHref(tag, insta));
  html = html.replace(/data-src="https:\/\/www\.google\.com\/maps\?q=[^"]*"/g, `data-src="https://www.google.com/maps?q=${encodeURIComponent(enderecoLinha)}&amp;output=embed"`);
  html = html.replace(/(<[a-z]+\b[^>]*\sdata-cfg="([^"]+)"[^>]*>)([^<]*)(<)/g, (m, open, key, _old, close) => {
    const v = get(c, key);
    return v == null ? m : open + v + close;
  });

  fs.writeFileSync(file, html);
  console.log('ok', f, page ? `(${page})` : '');
}
