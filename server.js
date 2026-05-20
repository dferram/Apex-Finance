const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Check if standalone build exists
const standaloneServerPath = path.join(__dirname, '.next/standalone/server.js');
const hasStandalone = fs.existsSync(standaloneServerPath);

if (hasStandalone) {
  // Use standalone server
  console.log('Starting Next.js standalone server...');
  process.env.HOSTNAME = hostname;
  process.env.PORT = port;
  require(standaloneServerPath);
} else {
  // Fallback to regular Next.js server
  console.log('Starting regular Next.js server...');
  const next = require('next');
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    })
      .once('error', (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  });
}
