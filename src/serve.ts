import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const types: Record<string, string> = { '.html': 'text/html', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT ?? 4173);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url!, 'http://x').pathname).slice(1) || 'preview.html');
  if (path.startsWith('..')) return res.writeHead(403).end();
  try {
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, () => console.log(`preview on http://localhost:${port}`));
