/**
 * Vercel Serverless Function – /api/spotify
 *
 * Required environment variables (set in Vercel Dashboard → Settings → Env):
 *   SPOTIFY_CLIENT_ID      – from developer.spotify.com
 *   SPOTIFY_CLIENT_SECRET  – from developer.spotify.com
 *   SPOTIFY_REFRESH_TOKEN  – one-time setup (run scripts/get-spotify-token.mjs)
 *
 * For LOCAL dev: install vercel CLI → run `vercel dev` instead of `vite`.
 * Alternatively set a .env.local and run the getSpotifyToken helper once.
 */

export default async function handler(req, res) {
    /* ── CORS – allow same origin portfolio ─────────────────── */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        return res.status(500).json({ error: 'Spotify env vars not configured' });
    }

    try {
        /* ── Step 1: exchange refresh token for a fresh access token ── */
        const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: SPOTIFY_REFRESH_TOKEN,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            return res.status(401).json({ error: 'Could not refresh Spotify token', detail: tokenData });
        }

        /* ── Step 2: fetch currently playing track ─────────────── */
        const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        let track = null;
        let isPlaying = false;

        /* 204 = nothing playing */
        if (nowPlayingRes.status !== 204) {
            const nowPlaying = await nowPlayingRes.json();
            if (nowPlaying?.item) {
                track = nowPlaying.item;
                isPlaying = nowPlaying.is_playing;
            }
        }

        /* ── Step 3: fall back to recently played if nothing live ── */
        if (!track) {
            const recentRes = await fetch(
                'https://api.spotify.com/v1/me/player/recently-played?limit=1',
                { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
            );
            const recent = await recentRes.json();
            track = recent?.items?.[0]?.track ?? null;
        }

        if (!track) return res.status(200).json({ error: 'No track found' });

        return res.status(200).json({
            isPlaying,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images?.[0]?.url ?? null,
            spotifyUrl: track.external_urls?.spotify ?? null,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
