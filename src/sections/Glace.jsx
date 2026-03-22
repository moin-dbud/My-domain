import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloodNavigate } from '../components/PageTransition';

/* ─── Images ──────────────────────────────────────────────────── */
const IMAGES = ['/image2.webp', '/image3.webp', '/image10.webp'];

/* Card position configs: index 0 = front, 1 = back-left, 2 = back-right */
function getPositions(xOffset) {
    return [
        { x: 0,        rotate: 0,   scale: 1.0,  zIndex: 3, opacity: 1    },
        { x: -xOffset, rotate: -11, scale: 0.87, zIndex: 2, opacity: 0.82 },
        { x:  xOffset, rotate:  11, scale: 0.87, zIndex: 1, opacity: 0.68 },
    ];
}

/* ─── Stacked Image Card Rotator ──────────────────────────────── */
function ImageStack({ cardWidth = 260, cardHeight = 360, xOffset = 72 }) {
    /* frontIndex tells us which image is currently at position 0 (front) */
    const [frontIdx, setFrontIdx] = useState(0);
    const [hovered, setHovered] = useState(false);
    const positions = useMemo(() => getPositions(xOffset), [xOffset]);

    useEffect(() => {
        const id = setInterval(() => setFrontIdx(f => (f + 1) % 3), 3000);
        return () => clearInterval(id);
    }, []);

    return (
        /* Outer container — sized to the front card */
        <div
            style={{
                position: 'relative',
                width: cardWidth, height: cardHeight,
                flexShrink: 0,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {IMAGES.map((src, imgIdx) => {
                /* Which position slot does this image occupy? */
                const posIdx = (imgIdx - frontIdx + 3) % 3;
                const pos = positions[posIdx];
                const isFront = posIdx === 0;

                return (
                    <motion.div
                        key={imgIdx}
                        animate={{
                            x: pos.x,
                            rotate: pos.rotate,
                            scale: isFront && hovered ? pos.scale * 1.04 : pos.scale,
                            zIndex: pos.zIndex,
                            opacity: pos.opacity,
                        }}
                        transition={{
                            duration: 0.75,
                            ease: [0.22, 1, 0.36, 1],
                            /* zIndex snaps instantly */
                            zIndex: { duration: 0 },
                        }}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: cardWidth, height: cardHeight,
                            borderRadius: 16,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: isFront
                                ? `0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)`
                                : `0 16px 40px rgba(0,0,0,0.6)`,
                            willChange: 'transform, opacity',
                        }}
                    >
                        <img
                            src={src}
                            alt={`profile ${imgIdx + 1}`}
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                userSelect: 'none',
                                pointerEvents: 'none',
                            }}
                            draggable={false}
                        />
                        {/* Subtle inner border shine */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            borderRadius: 16,
                            border: '1px solid rgba(255,255,255,0.10)',
                            pointerEvents: 'none',
                        }} />
                    </motion.div>
                );
            })}
        </div>
    );
}

/* ─── Social Icons ────────────────────────────────────────────── */
function SocialLinks() {
    const links = [
        {
            label: 'GitHub',
            href: 'https://github.com/moin-dbud',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
            ),
        },
        {
            label: 'LinkedIn',
            href: 'https://linkedin.com/moin-build',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            ),
        },
        {
            label: 'Twitter',
            href: 'https://twitter.com/moin_s_sheikh',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {links.map(({ label, href, icon }) => (
                <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ y: -2, color: 'rgba(255,255,255,0.95)' }}
                    style={{
                        color: 'rgba(255,255,255,0.38)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36,
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'color 0.2s, border-color 0.2s',
                        textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                    {icon}
                </motion.a>
            ))}
        </div>
    );
}

/* ─── Main Glace Section ──────────────────────────────────────── */
export default function Glace({ label, headline, highlight, description, final }) {
    const { floodNavigate } = useFloodNavigate();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return (
        <section style={{
            background: '#000',
            width: '100%',
            padding: '90px 20px 130px',
            fontFamily: "'Inter',sans-serif",
            borderTop: 'none',
            margin: 0,
            boxSizing: 'border-box',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital@1&display=swap');
                @media (max-width: 768px) {
                    .glace-grid { flex-direction: column !important; }
                    .glace-image-col { margin-top: 64px !important; align-items: center !important; }
                }
            `}</style>

            <div
                className="glace-grid"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: isMobile ? 48 : 80,
                    maxWidth: 1200,
                    margin: '0 auto',
                }}
            >
                {/* ── LEFT: Text Content ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Label */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        style={{
                            fontSize: 11, letterSpacing: '0.26em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.3)',
                            fontWeight: 500, marginBottom: 22,
                            margin: '0 0 22px 0',
                        }}
                    >
                        {label}
                    </motion.p>

                    {/* Headline */}
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        style={{
                            fontSize: 'clamp(32px,4.5vw,58px)',
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                            color: 'white',
                            margin: '0 0 32px 0',
                        }}
                    >
                        {headline}{' '}
                        <span style={{
                            fontStyle: 'italic',
                            fontFamily: "'Playfair Display', serif",
                            background: 'linear-gradient(90deg,#ff2f92,#ff7a18)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {highlight}
                        </span>
                    </motion.h2>

                    {/* Description paragraphs */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.16 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}
                    >
                        {[
                            description,
                        ].map((para, i) => (
                            <p key={i} style={{
                                fontSize: 14.5, lineHeight: 1.78,
                                color: 'rgba(255,255,255,0.42)',
                                margin: 0,
                                maxWidth: 520,
                            }}>
                                {para}
                            </p>
                        ))}

                        {/* Final italic line */}
                        <p style={{
                            fontSize: 14, fontStyle: 'italic',
                            color: 'rgba(255,255,255,0.28)',
                            margin: '4px 0 0 0',
                            fontFamily: "'Playfair Display', serif",
                        }}>
                            {final}
                        </p>
                    </motion.div>

                    {/* Social icons + CTA row */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.24 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}
                    >
                        <SocialLinks />

                        {/* Divider dot */}
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />

                        {/* CTA */}
                        <motion.button
                            onClick={(e) => floodNavigate('/about', e)}
                            whileHover={{ x: 4 }}
                            style={{
                                color: 'rgba(255,255,255,0.55)',
                                fontSize: 13.5, fontWeight: 500,
                                textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                letterSpacing: '-0.01em',
                                transition: 'color 0.2s',
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: 0,
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                        >
                            Dive in deeper
                            <span style={{ fontSize: 15 }}>→</span>
                        </motion.button>
                    </motion.div>
                </div>

                {/* ── RIGHT: Rotating Image Stack ── */}
                <motion.div
                    className="glace-image-col"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        /* Padding gives room for rotated back-cards; reduced on mobile */
                        paddingLeft:  isMobile ? 36 : 80,
                        paddingRight: isMobile ? 36 : 80,
                    }}
                >
                    <ImageStack
                        cardWidth={isMobile ? 170 : 260}
                        cardHeight={isMobile ? 240 : 360}
                        xOffset={isMobile ? 44 : 72}
                    />
                </motion.div>
            </div>
        </section>
    );
}
