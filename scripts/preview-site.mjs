import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist/site');
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.zip': 'application/zip'
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === '/' ? 'index.html' : decoded.endsWith('/') ? `${decoded.slice(1)}index.html` : decoded.slice(1);
  const file = resolve(root, relative);
  return file.startsWith(`${root}${sep}`) || file === root ? file : null;
}

createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', `http://${request.headers.host}`).pathname;
  if (['/demo', '/privacy', '/terms'].includes(pathname)) {
    response.writeHead(301, { Location: `${pathname}/` });
    response.end();
    return;
  }
  let file = safePath(pathname);
  let status = 200;
  try {
    if (!file || !(await stat(file)).isFile()) throw new Error('missing');
  } catch {
    file = resolve(root, '404.html');
    status = 404;
  }
  response.writeHead(status, {
    'Content-Type': types[extname(file)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Previewing dist/site at http://127.0.0.1:${port}`));
