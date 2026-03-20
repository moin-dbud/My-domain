import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

/* ─── Social platform data ───────────────────────────────────── */
const LINKS = [
    {
        id: 'github',
        name: 'GitHub',
        description: 'View my code, open-source projects, and contribution history.',
        url: 'https://github.com/moin-dbud',
        accent: '#e6edf3',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
            </svg>
        ),
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Connect professionally and explore my career journey.',
        url: 'https://linkedin.com/in/moin-s-sheikh',
        accent: '#60a5fa',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        id: 'x',
        name: 'X  (Twitter)',
        description: 'Follow my thoughts on AI, building in public, and tech.',
        url: 'https://x.com/',
        accent: '#e2e8f0',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        id: 'email',
        name: 'Email',
        description: 'Reach out directly for collaborations, projects, or just a hello.',
        url: 'mailto:hello@moinsheikh.in',
        accent: '#fb923c',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        ),
    },
    {
        id: 'instagram',
        name: 'Instagram',
        description: 'Behind the scenes of building, creating, and everyday life.',
        url: 'https://instagram.com/moin__sheikh_18',
        accent: '#f472b6',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
        ),
    },
];

/* ─── Framer Motion variants ─────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (d = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.65, delay: d * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
};

/* Cinematic per-line reveal: blur + scale + y + opacity */
const WORD_META = [
    { word: 'MY', delay: 0, color: 'rgba(255,255,255,0.95)' },
    { word: 'DIGITAL', delay: 0.15, color: 'rgba(255,255,255,0.60)' },
    { word: 'PRESENCE', delay: 0.30, color: 'rgba(255,255,255,0.25)' },
];

const heroWord = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.96,
        filter: 'blur(10px)',
    },
    visible: (delay) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            delay,
            ease: 'easeOut',
        },
    }),
};

const cardVariant = {
    hidden: { opacity: 0, y: 22 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
};

/* ─── SocialCard ─────────────────────────────────────────────── */
function SocialCard({ link, index }) {
    return (
        <motion.a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${link.name}`}
            custom={index}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 18,
                padding: '24px 28px',
                textDecoration: 'none',
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, box-shadow 0.3s ease, background 0.25s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.boxShadow = `0 20px 55px rgba(0,0,0,0.55)`;
                e.currentTarget.style.background = '#111';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = '#0a0a0a';
            }}
        >
            {/* Subtle top-edge glint */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)',
                pointerEvents: 'none',
            }} />

            {/* Left — icon + text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
                {/* Icon container */}
                <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: link.accent,
                }}>
                    {link.icon}
                </div>

                {/* Text */}
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: 16, fontWeight: 700,
                        color: 'rgba(255,255,255,0.92)',
                        letterSpacing: '-0.02em',
                        marginBottom: 4,
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        {link.name}
                    </div>
                    <div style={{
                        fontSize: 13, lineHeight: 1.55,
                        color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        {link.description}
                    </div>
                </div>
            </div>

            {/* Right — arrow */}
            <div style={{
                flexShrink: 0,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.35)',
                fontSize: 16,
            }}>
                ↗
            </div>
        </motion.a>
    );
}

/* ─── Links Page ─────────────────────────────────────────────── */
export default function Links() {
    useEffect(() => {
        document.title = 'Links | Moin Sheikh';
    }, []);

    return (
        <main style={{
            background: '#000', minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
        }}>

            {/* ────────────────────────────────────────────────────
                HERO — Two-column: typography left, portrait right
            ──────────────────────────────────────────────────── */}
            <section style={{
                position: 'relative',
                minHeight: '82vh',
                display: 'flex',
                alignItems: 'center',
                padding: 'clamp(100px,14vh,160px) clamp(24px,6vw,100px) clamp(60px,8vh,100px)',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}>

                {/* Background radial glow */}
                <div aria-hidden="true" style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: [
                        'radial-gradient(ellipse 70% 55% at 30% 50%, rgba(255,255,255,0.025) 0%, transparent 65%)',
                        'radial-gradient(ellipse 40% 60% at 70% 40%, rgba(255,255,255,0.012) 0%, transparent 70%)',
                    ].join(','),
                }} />

                {/* Hard vignette */}
                <div aria-hidden="true" style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, #000 100%)',
                }} />

                <div style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', maxWidth: 1200, margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'clamp(40px, 6vw, 100px)',
                    flexWrap: 'wrap',
                }}>

                    {/* LEFT — Text */}
                    <div style={{ flex: '1 1 340px', minWidth: 0 }}>

                        {/* Small label */}
                        <motion.p
                            custom={0} variants={fadeUp} initial="hidden" animate="visible"
                            style={{
                                fontSize: 11, fontWeight: 500,
                                letterSpacing: '0.28em', textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.28)',
                                margin: '0 0 28px 0',
                            }}
                        >
                            Connect · Follow · Chat
                        </motion.p>

                        {/* Big stacked title — cinematic line-by-line reveal */}
                        <div>
                            {WORD_META.map(({ word, delay, color }) => (
                                <motion.div
                                    key={word}
                                    custom={delay}
                                    variants={heroWord}
                                    initial="hidden"
                                    animate="visible"
                                    style={{
                                        display: 'block',
                                        fontSize: 'clamp(4.5rem, 10vw, 10rem)',
                                        fontWeight: 900,
                                        lineHeight: 0.95,
                                        letterSpacing: '-0.04em',
                                        color,
                                        userSelect: 'none',
                                        /* Subtle glow once fully visible */
                                        textShadow: '0 0 40px rgba(255,255,255,0.08)',
                                        willChange: 'transform, opacity, filter',
                                    }}
                                >
                                    {word}
                                </motion.div>
                            ))}
                        </div>

                        <motion.p
                            custom={4} variants={fadeUp} initial="hidden" animate="visible"
                            style={{
                                marginTop: 36,
                                fontSize: 14, lineHeight: 1.75,
                                color: 'rgba(255,255,255,0.3)',
                                maxWidth: 380,
                            }}
                        >
                            All the places you can find me across the internet — code, conversations, and everything in between.
                        </motion.p>
                    </div>

                    {/* RIGHT — Profile image */}
                    <motion.div
                        custom={2} variants={fadeUp} initial="hidden" animate="visible"
                        style={{ flex: '0 0 auto' }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                width: 'clamp(200px, 22vw, 320px)',
                                height: 'clamp(200px, 22vw, 320px)',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                cursor: 'default',
                                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow =
                                    '0 0 0 2px rgba(255,255,255,0.14), 0 32px 80px rgba(0,0,0,0.7)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow =
                                    '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <img
                                src="/cropped_circle_image.webp"
                                alt="Moin Sheikh"
                                style={{
                                    width: '100%', height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                            />
                        </motion.div>
                    </motion.div>

                </div>
            </section>

            {/* ────────────────────────────────────────────────────
                LINKS GRID
            ──────────────────────────────────────────────────── */}
            <section style={{
                maxWidth: 1000,
                margin: '0 auto',
                padding: '0 clamp(24px,6vw,60px) 120px',
            }}>

                {/* Section label */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        fontSize: 11, fontWeight: 500,
                        letterSpacing: '0.26em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.22)',
                        margin: '0 0 28px 0',
                    }}
                >
                    {LINKS.length} platforms
                </motion.p>

                {/* Responsive 2-column grid */}
                <style>{`
                    .links-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 14px;
                    }
                    @media (max-width: 640px) {
                        .links-grid { grid-template-columns: 1fr; }
                    }
                    @media (max-width: 480px) {
                        .links-card { padding: 18px 20px !important; }
                    }
                `}</style>

                <div className="links-grid">
                    {LINKS.map((link, i) => (
                        <SocialCard key={link.id} link={link} index={i} />
                    ))}
                </div>

            </section>

            <Footer />
        </main>
    );
}
