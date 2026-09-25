#!/usr/bin/env node
/* Servidor local para ver o site com as mesmas URLs limpas da Vercel (/a-casa -> a-casa.html).
   Uso: node tools/serve.js   (porta 8080, ou PORT=3000 node tools/serve.js) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const port = process.env.PORT || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/') && p !== '/') p = p.slice(0, -1);
  let file = path.join(root, p === '/' ? 'index.html' : p);
  if (!path.extname(file)) file += '.html';
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`http://localhost:${port}`));
