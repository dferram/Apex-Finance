const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';

// Verify build exists in production
if (!dev) {
  const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
  if (!fs.existsSync(buildIdPath)) {
    console.error('❌ ERROR: Production build not found!');
    console.error('The .next directory or BUILD_ID file is missing.');
    console.error('Make sure the build artifacts are uploaded correctly.');
    console.error('Current directory:', __dirname);
    console.error('Looking for:', buildIdPath);
    
    // List what's actually in .next directory
    const nextDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextDir)) {
      console.error('.next directory contents:', fs.readdirSync(nextDir));
    } else {
      console.error('.next directory does not exist!');
    }
    
    process.exit(1);
  }
  console.log('✅ Production build found');
}

const app = next({ dev, hostname, port, dir: __dirname });
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
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
    });
});
