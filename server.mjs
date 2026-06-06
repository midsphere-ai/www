// Production entry: wraps the @astrojs/node standalone handler with gzip/brotli
// compression and bfcache-friendly Cache-Control on HTML. The standalone build
// skips compression and sends no Cache-Control on HTML, which costs FCP/LCP and
// blocks back/forward cache restoration. We disable the adapter's autostart and
// drive the handler from our own http server so we can negotiate encoding.

process.env.ASTRO_NODE_AUTOSTART = 'disabled';

import http from 'node:http';
import compression from 'compression';

const { handler } = await import('./dist/server/entry.mjs');

const PORT = Number(process.env.PORT) || 4321;
const HOST = process.env.HOST || '0.0.0.0';

const compress = compression({ threshold: 1024 });

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];

  // Hashed assets and self-hosted fonts: long, immutable. Fonts live at /fonts/
  // (referenced by preload + @font-face) and never change without a filename
  // change in this codebase, so they're safe to mark immutable.
  if (url.startsWith('/_astro/') || url.startsWith('/fonts/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (
    url === '/favicon.ico' ||
    url === '/favicon.svg' ||
    url.startsWith('/brand/')
  ) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  } else {
    // HTML and everything else: revalidate each visit but stay bfcache-friendly
    // (no `no-store`, no `must-revalidate`).
    res.setHeader('Cache-Control', 'public, max-age=0');
  }

  compress(req, res, () => {
    handler(req, res, () => {
      res.statusCode = 404;
      res.end('Not Found');
    });
  });
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
