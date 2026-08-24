import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* ─── Local API Middleware Plugin (Email & Playground API) ─────────────
   Mounts Vercel serverless handlers directly inside Vite's dev server.
──────────────────────────────────────────────────────────────────────── */
function localApiPlugin() {
  return {
    name: 'local-api-middleware',

    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      if (env.GMAIL_USER)                process.env.GMAIL_USER                = env.GMAIL_USER;
      if (env.GMAIL_APP_PASS)            process.env.GMAIL_APP_PASS            = env.GMAIL_APP_PASS;
      if (env.OPENROUTER_API_KEY)        process.env.OPENROUTER_API_KEY        = env.OPENROUTER_API_KEY;
      if (env.GEMINI_API_KEY)            process.env.GEMINI_API_KEY            = env.GEMINI_API_KEY;
      if (env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
      if (env.VITE_SUPABASE_URL)         process.env.VITE_SUPABASE_URL         = env.VITE_SUPABASE_URL;
      if (env.VITE_SUPABASE_ANON_KEY)    process.env.VITE_SUPABASE_ANON_KEY    = env.VITE_SUPABASE_ANON_KEY;
    },

    async configureServer(server) {
      // 1. Email API Handler
      try {
        const handlerUrl = new URL('./api/send-email.js', import.meta.url).href;
        const mod = await import(/* @vite-ignore */ handlerUrl);
        const emailHandler = mod.default;

        server.middlewares.use('/api/send-email', (req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

          let raw = '';
          req.on('data', chunk => { raw += chunk.toString(); });
          req.on('end', async () => {
            try {
              const mockReq = { method: req.method, body: JSON.parse(raw || '{}') };
              let statusCode = 200;
              const mockRes = {
                status(code)    { statusCode = code; return this; },
                setHeader(k, v) { res.setHeader(k, v); return this; },
                json(data)      { res.statusCode = statusCode; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); },
                end()           { res.statusCode = statusCode; res.end(); }
              };
              await emailHandler(mockReq, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      } catch (e) {
        console.warn('[local-api-middleware] Could not load send-email handler:', e.message);
      }

      // 2. RAG Playground API Handler
      try {
        const playgroundUrl = new URL('./api/playground.js', import.meta.url).href;
        const mod = await import(/* @vite-ignore */ playgroundUrl);
        const playgroundHandler = mod.default;

        server.middlewares.use('/api/playground', (req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

          // Extract query params for GET
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const queryParams = Object.fromEntries(urlObj.searchParams.entries());

          let raw = '';
          req.on('data', chunk => { raw += chunk.toString(); });
          req.on('end', async () => {
            try {
              const body = raw ? JSON.parse(raw) : {};
              const mockReq = { method: req.method, body, query: queryParams };
              let statusCode = 200;
              const mockRes = {
                status(code)    { statusCode = code; return this; },
                setHeader(k, v) { res.setHeader(k, v); return this; },
                json(data)      { res.statusCode = statusCode; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); },
                end()           { res.statusCode = statusCode; res.end(); }
              };
              await playgroundHandler(mockReq, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      } catch (e) {
        console.warn('[local-api-middleware] Could not load playground handler:', e.message);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localApiPlugin(),
  ],
  server: {
    allowedHosts: [
      'fifth-puts-sand-grants.trycloudflare.com',
    ],
  },
  build: {
    sourcemap: false,
  },
})
