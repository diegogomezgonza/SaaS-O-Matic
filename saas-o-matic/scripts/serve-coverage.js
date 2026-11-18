import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../coverage-report', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (
      !file.startsWith(root + sep) ||
      !types[extname(file)] ||
      !['GET', 'HEAD'].includes(req.method)
    ) {
      res.writeHead(404);
      res.end();
      return;
    }
    const data = await readFile(file);
    res.setHeader('Content-Type', types[extname(file)]);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404);
    res.end('Informe no encontrado. Ejecuta npm run test:coverage.');
  }
}).listen(4174, '127.0.0.1', () => console.log('Informe: http://127.0.0.1:4174'));
