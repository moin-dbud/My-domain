import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* ─── Local Email API Middleware Plugin ─────────────────────────
   Mounts the Vercel serverless handler directly inside Vite's
   dev server — no `vercel dev` or second process required.
   In production, Vercel picks up api/send-email.js automatically.
──────────────────────────────────────────────────────────────── */
function localApiPlugin() {
  return {
    name: 'local-email-api',

    // configResolved runs after Vite has fully read the .env files.
    // We use loadEnv with an empty prefix so ALL vars (not just VITE_*)
    // are loaded — then we patch them into process.env so that the
    // Node.js handler can read process.env.GMAIL_USER / GMAIL_APP_PASS.
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      if (env.GMAIL_USER)     process.env.GMAIL_USER     = env.GMAIL_USER;
      if (env.GMAIL_APP_PASS) process.env.GMAIL_APP_PASS = env.GMAIL_APP_PASS;
    },

    async configureServer(server) {
      // Dynamically import the handler so Vite can still start
      // even if nodemailer isn't installed yet.
      let emailHandler;
      try {
        // Use a computed URL so esbuild (which bundles vite.config.js) cannot
        // statically follow this import and attempt to analyse api/send-email.js
        // for a browser target — that is what causes "process is not defined".
        const handlerUrl = new URL('./api/send-email.js', import.meta.url).href;
        const mod = await import(/* @vite-ignore */ handlerUrl);
        emailHandler = mod.default;
      } catch (e) {
        console.warn('[local-email-api] Could not load handler:', e.message);
        return;
      }

      server.middlewares.use('/api/send-email', (req, res) => {
        // CORS pre-flight
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        // Collect body chunks
        let raw = '';
        req.on('data', chunk => { raw += chunk.toString(); });
        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(raw || '{}');

            // Shim that mirrors the Vercel req/res API used in the handler
            const mockReq = { method: req.method, body: parsedBody };
            let statusCode = 200;
            const mockRes = {
              status(code)          { statusCode = code; return this; },
              setHeader(k, v)       { res.setHeader(k, v); return this; },
              json(data) {
                res.statusCode = statusCode;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
              end()  { res.statusCode = statusCode; res.end(); },
            };

            await emailHandler(mockReq, mockRes);
          } catch (err) {
            console.error('[local-email-api] Handler error:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localApiPlugin(),   // ← inline API — works with plain `npm run dev`
  ],
  server: {
    allowedHosts: [
      'fifth-puts-sand-grants.trycloudflare.com',
    ],
    // No proxy needed — API is served by Vite itself in dev
  },
})
