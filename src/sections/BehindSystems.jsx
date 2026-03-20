import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LifeSnapshotCard from '../components/LifeSnapshotCard';

/* ─── Helpers ─────────────────────────────────────────────────── */
function timeAgo(dateStr) {
    const sec = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
}

/* ─── SVG Icons ───────────────────────────────────────────────── */
const GitHubIcon = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

const LinkedInIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
);

const SpotifyIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.786-2.131-9.965-1.166a.78.78 0 0 1-.973-.519.781.781 0 0 1 .52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 0 1 .257 1.072zm.105-2.835c-3.222-1.914-8.54-2.09-11.618-1.156a.936.936 0 1 1-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 0 1-1.007 1.587l.053.021z" />
    </svg>
);

/* ─── Card 1 — GitHub Activity ───────────────────────────────── */
/* GitHub's public events API omits payload.commits for privacy.  */
/* We do a 2-step fetch: events → head SHA → commit message.      */
function GitHubCard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                /* Step 1 — latest public events */
                const evRes = await fetch('https://api.github.com/users/moin-dbud/events/public');
                const events = await evRes.json();
                if (!Array.isArray(events)) throw new Error('bad response');

                /* Step 2 — find first PushEvent */
                const push = events.find(e => e.type === 'PushEvent');
                if (!push) throw new Error('no push');

                const repoFullName = push.repo.name;                          // "moin-dbud/Site"
                const headSha = push.payload.head;                        // latest commit SHA
                const branch = push.payload.ref?.replace('refs/heads/', '') ?? 'main';
                const commitCount = push.payload.size ?? push.payload.distinct_size ?? 1;

                /* Step 3 — fetch full commit to get the message */
                const commitRes = await fetch(
                    `https://api.github.com/repos/${repoFullName}/commits/${headSha}`
                );
                const commit = await commitRes.json();
                const message = commit?.commit?.message ?? 'No message';

                setData({
                    repo: repoFullName.split('/')[1],
                    message: message.split('\n')[0],   // first line only
                    branch,
                    commitCount,
                    createdAt: push.created_at,
                    sha: headSha.slice(0, 7),
                });
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const ago = data?.createdAt ? timeAgo(data.createdAt) : '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <GitHubIcon size={20} color="white" />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.02em' }}>
                    Moin's{' '}
                    <span style={{
                        fontStyle: 'italic',
                        fontFamily: "'Playfair Display',serif",
                        background: 'linear-gradient(90deg,#ff2f92,#ff7a18)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>Github</span>
                </span>
            </div>

            {/* Body */}
            <div style={{ flex: 1 }}>
                {loading ? (
                    /* Shimmer placeholders */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[90, 100, 65].map((w, i) => (
                            <div key={i} style={{
                                height: 11, borderRadius: 6,
                                background: 'rgba(255,255,255,0.07)',
                                width: `${w}%`,
                            }} />
                        ))}
                    </div>
                ) : error || !data ? (
                    <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1.6 }}>
                        Could not load commits.<br />
                        <span style={{ fontSize: 11, opacity: 0.7 }}>GitHub may be rate-limiting this IP.</span>
                    </p>
                ) : (
                    <>
                        {/* Badge row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: 9.5, fontWeight: 700,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.38)',
                            }}>Latest Push</span>
                            <span style={{
                                fontSize: 10, fontWeight: 600, color: '#4ade80',
                                background: '#4ade8014', border: '1px solid #4ade8026',
                                padding: '2px 8px', borderRadius: 999,
                            }}>
                                {ago}
                            </span>
                            {data.commitCount > 1 && (
                                <span style={{
                                    fontSize: 10, color: 'rgba(255,255,255,0.3)',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    padding: '2px 7px', borderRadius: 999,
                                }}>
                                    {data.commitCount} commits
                                </span>
                            )}
                        </div>

                        {/* Commit message */}
                        <p style={{
                            fontSize: 13.5, color: 'rgba(255,255,255,0.82)',
                            fontWeight: 500, lineHeight: 1.65,
                            marginBottom: 14, letterSpacing: '-0.01em',
                        }}>
                            "{data.message.length > 85 ? data.message.slice(0, 85) + '…' : data.message}"
                        </p>

                        {/* Repo · Branch · SHA pills */}
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                            {[
                                { label: `📁 ${data.repo}`, color: 'rgba(255,255,255,0.28)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)' },
                                { label: `⎇ ${data.branch}`, color: 'rgba(255,255,255,0.28)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)' },
                                { label: data.sha, color: '#9d8fff', bg: '#7c6aff14', border: '#7c6aff26', mono: true },
                            ].map(({ label, color, bg, border, mono }) => (
                                <span key={label} style={{
                                    fontSize: 11, color,
                                    background: bg, border: `1px solid ${border}`,
                                    padding: '3px 9px', borderRadius: 999,
                                    fontFamily: mono ? 'monospace' : 'inherit',
                                }}>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Social icons */}
            <div style={{
                display: 'flex', gap: 10, marginTop: 24,
                paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
                {[
                    { icon: <GitHubIcon size={15} color="currentColor" />, href: 'https://github.com/moin-dbud', label: 'GitHub' },
                    { icon: <LinkedInIcon size={15} />, href: 'https://linkedin.com', label: 'LinkedIn' },
                    { icon: <TwitterIcon size={15} />, href: 'https://twitter.com', label: 'Twitter' },
                ].map(({ icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                        style={{
                            color: 'rgba(255,255,255,0.32)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.08)',
                            textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.32)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        {icon}
                    </a>
                ))}
            </div>
        </div>
    );
}
/* ─── Card 2 — Visitors / Guestbook ─────────────────────────── */

const DUMMY_AVATARS = [
    { color: '#6366f1', initials: 'AR' },
    { color: '#f97316', initials: 'MS' },
    { color: '#10b981', initials: 'KP' },
    { color: '#a855f7', initials: 'JD' },
];

function VisitorsCard() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Label */}
            <p style={{
                fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                marginBottom: 24,
            }}>
                Visitors
            </p>

            {/* Main text */}
            <div style={{ flex: 1 }}>
                <h3 style={{
                    fontSize: 'clamp(28px, 3.5vw, 42px)',
                    fontWeight: 900, letterSpacing: '-0.03em',
                    color: 'white', lineHeight: 1.15,
                    margin: '0 0 4px 0',
                }}>
                    Leave your
                </h3>
                <h3 style={{
                    fontSize: 'clamp(28px, 3.5vw, 42px)',
                    fontWeight: 900, letterSpacing: '-0.03em',
                    lineHeight: 1.15, fontStyle: 'italic',
                    fontFamily: "'Playfair Display', serif",
                    background: 'linear-gradient(90deg,#ff2f92,#ff7a18)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 20px 0',
                }}>
                    signature
                </h3>

                <p style={{
                    fontSize: 13.5, color: 'rgba(255,255,255,0.38)',
                    lineHeight: 1.7, marginBottom: 28,
                }}>
                    Let me know you were here.
                </p>

                {/* Stacked avatars + join text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {DUMMY_AVATARS.map((av, i) => (
                            <div key={i} style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: av.color,
                                border: '2px solid #0a0a0a',
                                marginLeft: i === 0 ? 0 : -10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, fontWeight: 800, color: 'white',
                                zIndex: DUMMY_AVATARS.length - i,
                                position: 'relative',
                            }}>
                                {av.initials}
                            </div>
                        ))}
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                        Join others
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            <motion.button
                whileHover={{ x: 3 }}
                style={{
                    alignSelf: 'flex-start',
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: "'Inter',sans-serif",
                    transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
            >
                Sign Guestbook <span style={{ fontSize: 15 }}>→</span>
            </motion.button>
        </div>
    );
}

/* ─── Card 3 — Spotify Last Played (live) ───────────────────── */
/* Calls /api/spotify (Vercel serverless) which exchanges the      */
/* refresh token for an access token and fetches now-playing or   */
/* recently-played.  See api/spotify.js for setup instructions.   */
const FALLBACK_GRADIENT = 'linear-gradient(135deg,#0d001a 0%,#2d004a 40%,#5c0020 75%,#1a000a 100%)';

function WaveformBars({ playing }) {
    const HEIGHTS = [10, 16, 7, 14, 9, 20, 6, 13, 10, 18, 8];
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20 }}>
            {HEIGHTS.map((h, i) => (
                <motion.div
                    key={i}
                    animate={playing
                        ? { height: [h, h * 0.35, h, h * 0.65, h] }
                        : { height: 3 }}
                    transition={playing
                        ? { duration: 1.1 + i * 0.09, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }
                        : { duration: 0.4 }}
                    style={{ width: 3, borderRadius: 2, background: '#1DB954', opacity: 0.85 }}
                />
            ))}
        </div>
    );
}

function SpotifyCard() {
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/spotify')
            .then(r => r.json())
            .then(d => {
                if (d.error) setError(true);
                else setTrack(d);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const bg = track?.albumArt
        ? `url(${track.albumArt}) center/cover no-repeat`
        : FALLBACK_GRADIENT;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Album art background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: bg,
                opacity: track?.albumArt ? 0.5 : 0.7,
                zIndex: 0, borderRadius: 'inherit',
                transition: 'background 0.8s ease, opacity 0.6s ease',
            }} />
            {/* Dark vignette overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.82) 100%)',
                zIndex: 1, borderRadius: 'inherit',
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <SpotifyIcon size={20} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
                            {!loading && track?.isPlaying ? 'Now Playing' : 'Last Played'}
                        </span>
                    </div>
                    {/* Live indicator */}
                    {!loading && track?.isPlaying && (
                        <span style={{
                            fontSize: 9.5, fontWeight: 700,
                            color: '#1DB954',
                            background: '#1DB95420',
                            border: '1px solid #1DB95440',
                            padding: '2px 8px', borderRadius: 999,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                            LIVE
                        </span>
                    )}
                </div>

                {/* Track info — pushed to bottom */}
                <div style={{ marginTop: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[70, 50, 80].map((w, i) => (
                                <div key={i} style={{
                                    height: 11, borderRadius: 6,
                                    background: 'rgba(255,255,255,0.1)',
                                    width: `${w}%`,
                                }} />
                            ))}
                        </div>
                    ) : error || !track ? (
                        <div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                                Connect Spotify in your Vercel env to show live data.
                            </p>
                            <WaveformBars playing={false} />
                        </div>
                    ) : (
                        <div>
                            <p style={{
                                fontSize: 10.5, color: 'rgba(255,255,255,0.45)',
                                letterSpacing: '0.08em', marginBottom: 8,
                                textTransform: 'uppercase', fontWeight: 600,
                            }}>
                                {track.isPlaying ? 'Currently vibing to' : 'I recently listened to'}
                            </p>

                            {/* Song name — links to Spotify */}
                            <a
                                href={track.spotifyUrl ?? '#'}
                                target="_blank" rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <p style={{
                                    fontSize: 17, fontWeight: 800, color: 'white',
                                    letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 5,
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#1DB954'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'white'}
                                >
                                    {track.name}
                                </p>
                            </a>
                            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 14 }}>
                                by{' '}
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{track.artist}</span>
                                {' · '}
                                <span style={{ fontStyle: 'italic', opacity: 0.75 }}>{track.album}</span>
                            </p>

                            <WaveformBars playing={!!track.isPlaying} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


/* ─── Card Wrapper ────────────────────────────────────────────── */
function Card({ children, index }) {
    return (
        <motion.div
            className="bs-card"
        initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: 28,
                display: 'flex', flexDirection: 'column',
                cursor: 'default',
                transition: 'border-color 0.25s',
                height: 420,
                overflow: 'hidden',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
            {children}
        </motion.div>
    );
}

/* ─── Main Section ────────────────────────────────────────────── */
export default function BehindSystems() {
    return (
        <section style={{
            background: '#000',
            width: '100%',
            padding: '50px 28px 60px',
            fontFamily: "'Inter',sans-serif",
            boxSizing: 'border-box',
            margin: 0,
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital@1&display=swap');
                .bs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                @media (max-width: 960px) {
                    .bs-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 600px) {
                    .bs-grid { grid-template-columns: 1fr; }
                    .bs-section { padding: 64px 20px 80px !important; }
                    .bs-card { height: auto !important; min-height: 320px !important; }
                }
            `}</style>

            {/* ── Section Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{
                        fontSize: 11, letterSpacing: '0.26em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.3)',
                        fontWeight: 500, marginBottom: 16,
                    }}
                >
                    Behind the Systems
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                    style={{
                        fontSize: 'clamp(40px, 6vw, 82px)',
                        fontWeight: 900, letterSpacing: '-0.03em',
                        lineHeight: 1.05, margin: 0,
                    }}
                >
                    <span style={{ color: 'white', display: 'block' }}>Decoding logic</span>
                    <span style={{
                        fontStyle: 'italic',
                        fontFamily: "'Playfair Display', serif",
                        background: 'linear-gradient(90deg,#ff2f92,#ff7a18)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        &amp;&amp; the signals
                    </span>
                </motion.h2>
            </div>

            {/* ── Card Grid ── */}
            <div
                className="bs-grid"
                style={{ maxWidth: 1200, margin: '0 auto' }}
            >
                <Card index={0}><GitHubCard /></Card>
                <Card index={1}><VisitorsCard /></Card>
                <Card index={2}><LifeSnapshotCard /></Card>
            </div>
        </section>
    );
}
