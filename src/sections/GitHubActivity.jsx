import { useRef, useState, cloneElement } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';

const GITHUB_USERNAME = 'moin-dbud';

/* ─── GitHub Activity Section ───────────────────────────────────── */
export default function GitHubActivity() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

    /* Floating tooltip state — uses fixed coords so it follows the cursor
       outside any overflow:hidden / transform stacking contexts              */
    const [tooltip, setTooltip] = useState({
        visible: false, x: 0, y: 0, count: 0, date: '',
    });

    /* Framer variants */
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: (d) => ({
            opacity: 1, y: 0,
            transition: { duration: 0.65, delay: d * 0.12, ease: [0.22, 1, 0.36, 1] },
        }),
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.97 },
        visible: {
            opacity: 1, scale: 1,
            transition: { duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] },
        },
    };

    return (
        <section
            ref={sectionRef}
            style={{
                background: '#000',
                width: '100%',
                padding: '20px 20px 90px',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* ── Subtle green section glow ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse 55% 40% at 50% 100%, rgba(39,211,83,0.05) 0%, transparent 70%)',
                }}
            />

            {/* ── Floating tooltip — rendered at root level to escape transforms ── */}
            {tooltip.visible && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        left: tooltip.x,
                        top: tooltip.y - 12,
                        transform: 'translate(-50%, -100%)',
                        background: '#1c2128',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: 8,
                        padding: '8px 13px',
                        pointerEvents: 'none',
                        zIndex: 9999,
                        boxShadow: '0 8px 28px rgba(0,0,0,0.75)',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif",
                        minWidth: 140,
                    }}
                >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 3 }}>
                        {tooltip.count === 0
                            ? 'No contributions'
                            : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(230,237,243,0.5)', fontWeight: 400 }}>
                        {tooltip.date}
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* ── Label ── */}
                <motion.p
                    custom={0} variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}
                    style={{
                        fontSize: 11, fontWeight: 500,
                        letterSpacing: '0.28em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.28)',
                        textAlign: 'center', margin: '0 0 20px 0',
                    }}
                >
                    My Code Journey
                </motion.p>

                {/* ── Headline ── */}
                <motion.h2
                    custom={1} variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}
                    style={{
                        fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                        fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
                        color: 'rgba(255,255,255,0.92)',
                        textAlign: 'center', margin: '0 0 6px 0',
                    }}
                >
                    GitHub Activity
                </motion.h2>

                {/* ── Italic gradient sub-line ── */}
                <motion.p
                    custom={2} variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}
                    style={{
                        fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
                        fontWeight: 400, fontStyle: 'italic',
                        fontFamily: "'Playfair Display', Georgia, serif",
                        textAlign: 'center', margin: '0 0 64px 0',
                        background: 'linear-gradient(90deg,#ff2f92,#c548ff,#ff7a18)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    &amp;&amp; Open Source
                </motion.p>

                {/* ── Heatmap Card ── */}
                <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    style={{
                        position: 'relative',
                        borderRadius: 20,
                        padding: 'clamp(24px, 4vw, 40px)',
                    }}
                >
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                        <span style={{ fontSize: 16 }}>🐙</span>
                        <span style={{
                            fontSize: 12, fontWeight: 500,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.28)',
                        }}>
                            Daily contributions &amp; open-source work
                        </span>

                        {/* Live pulse */}
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#39d353', boxShadow: '0 0 6px #39d353',
                                display: 'inline-block',
                                animation: 'ghPulse 2s ease-in-out infinite',
                            }} />
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>
                                LIVE
                            </span>
                        </span>
                    </div>

                    {/* ── Calendar — horizontally scrollable on mobile ── */}
                    <div style={{
                        overflowX: 'auto', overflowY: 'visible', paddingBottom: 4,
                        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent',
                    }}>
                        <GitHubCalendar
                            username={GITHUB_USERNAME}
                            year="last"
                            colorScheme="dark"
                            theme={{ dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] }}
                            blockSize={14}
                            blockMargin={4}
                            blockRadius={3}
                            fontSize={13}
                            showWeekdayLabels
                            style={{ minWidth: 620, color: 'rgba(255,255,255,0.45)' }}
                            renderBlock={(block, activity) => {
                                const dateLabel = new Date(activity.date).toLocaleDateString('en-US', {
                                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                                });
                                return cloneElement(block, {
                                    style: {
                                        ...block.props.style,
                                        cursor: 'pointer',
                                        transition: 'transform 0.14s ease, filter 0.14s ease',
                                        transformOrigin: 'center',
                                        transformBox: 'fill-box',
                                    },
                                    onMouseEnter(e) {
                                        e.currentTarget.style.transform = 'scale(1.55)';
                                        e.currentTarget.style.filter = 'brightness(1.45)';
                                        setTooltip({
                                            visible: true,
                                            x: e.clientX,
                                            y: e.clientY,
                                            count: activity.count,
                                            date: dateLabel,
                                        });
                                    },
                                    onMouseMove(e) {
                                        setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }));
                                    },
                                    onMouseLeave(e) {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.filter = 'brightness(1)';
                                        setTooltip((t) => ({ ...t, visible: false }));
                                    },
                                });
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes ghPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(1.4); }
                }
            `}</style>
        </section>
    );
}
