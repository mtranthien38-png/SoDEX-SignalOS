import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadDotEnv, config } from './src/core/env.js';
import { json } from './src/core/http.js';

loadDotEnv();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const apiDir = path.join(__dirname, 'api');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

async function routeApi(req, res) {
  const name = req.url.split('?')[0].replace('/api/', '').replace(/[^a-z0-9_-]/gi, '');
  const file = path.join(apiDir, `${name}.js`);
  if (!fs.existsSync(file)) return json(res, 404, { ok: false, error: 'API route not found' });
  const mod = await import(`${pathToFileURL(file).href}?v=${Date.now()}`);
  const payload = await mod.default(req, res);
  if (!res.writableEnded) json(res, payload?.ok === false ? 400 : 200, payload ?? { ok: true });
}

function routeStatic(req, res) {
  const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
  const safe = cleanUrl === '/' ? '/index.html' : cleanUrl;
  const file = path.normalize(path.join(publicDir, safe));
  if (!file.startsWith(publicDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) return routeApi(req, res);
    return routeStatic(req, res);
  } catch (error) {
    return json(res, error.status || 500, { ok: false, error: error.message || String(error), details: error.details || null });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(config().port, () => console.log(`SoDEX SignalOS running at http://localhost:${config().port}`));
}

export default server;
