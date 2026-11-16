import { createServer } from 'node:http';
// tiny static server
import { readFileSync, createReadStream, statSync } from 'node:fs';
import { resolve, normalize, join, sep } from 'node:path';

// Simple static file server for the 'app' directory.

// Parse optional --port argument
const args = process.argv.slice(2);
let port = 8080;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && i + 1 < args.length) {
    const p = Number(args[i + 1]);
    if (!isNaN(p) && p > 0 && p < 65536) port = p;
    i++;
  }
}

const appDir = resolve(process.cwd(), 'app');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function getMime(path: string): string {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  // Decode URL and prevent query strings
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  // Resolve path within app directory
  const safePath = normalize(join(appDir, urlPath));
  if (!safePath.startsWith(appDir + sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  let filePath = safePath;
  // If directory, serve index.html
  try {
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
  } catch (_) {
    // ignore, will handle as missing file later
  }
  try {
    const stat = statSync(filePath);
    if (stat.isFile()) {
      const mime = getMime(filePath);
      res.writeHead(200, { 'Content-Type': mime });
      const stream = createReadStream(filePath);
      stream.pipe(res);
    } else {
      throw new Error('Not a file');
    }
  } catch (_) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

