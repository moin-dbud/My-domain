import { useRef } from 'react';
import { motion } from 'framer-motion';

/* ─── Injected styles ─────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes aiCursor {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .ai-blink { animation: aiCursor 1.1s step-end infinite; }

  @keyframes aiBobble {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-8px);  }
  }
  .ai-bobble { animation: aiBobble 5s ease-in-out infinite; }

  .ai-feat-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.055);
    transition: padding-left 0.2s;
    cursor: default;
  }
  .ai-feat-row:last-child { border-bottom: none; }
  .ai-feat-row:hover { padding-left: 6px; }

  .ai-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 13px 28px;
    border-radius: 999px;
    background: white;
    color: #000;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .ai-cta-btn:hover {
    background: #e8e8e8;
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(255,255,255,0.12);
  }

  @media (max-width: 900px) {
    .ai-grid { grid-template-columns: 1fr !important; }
    .ai-preview { display: none; }
  }
`;

/* ─── Features list ───────────────────────────────────────────── */
const FEATURES = [
    {
        num: '01',
        title: 'AI Project Assistant',
        desc: 'Ask questions about my projects and see how AI explains the systems behind them.',
    },
    {
        num: '02',
        title: 'Startup Idea Generator',
        desc: 'Generate AI-powered startup ideas using the same prompt engineering techniques I use.',
    },
    {
        num: '03',
        title: 'Code Improver',
        desc: 'Paste code snippets and see how AI suggests improvements and optimizations.',
    },
];

/* ─── Static AI Chat Preview ─────────────────────────────────── */
function ChatPreview() {
    return (
        <div
            className="ai-bobble"
            style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20,
                overflow: 'hidden',
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
        >
            {/* Window chrome */}
            <div style={{
                background: '#111',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{ display: 'flex', gap: 5 }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    ))}
                </div>
                <div style={{
                    flex: 1,
                    height: 18,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 4,
                }}>
                    <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
                        moin.dev/playground
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}
                    />
                    <span style={{ fontSize: 9, color: '#4ade80', letterSpacing: '0.12em', fontWeight: 600 }}>LIVE</span>
                </div>
            </div>

            {/* Chat body */}
            <div style={{ padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Session label */}
                <div style={{
                    fontSize: 9.5,
                    color: 'rgba(255,255,255,0.18)',
                    textAlign: 'center',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    paddingBottom: 12,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                    Session active · GPT-4o
                </div>

                {/* User message */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px 14px 4px 14px',
                        padding: '9px 14px',
                        maxWidth: '78%',
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.82)',
                        lineHeight: 1.5,
                    }}>
                        Explain the MadeIt platform
                    </div>
                </div>

                {/* AI response */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {/* AI avatar */}
                    <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, flexShrink: 0, marginTop: 1,
                        boxShadow: '0 0 14px rgba(99,102,241,0.45)',
                    }}>
                        <span style={{ color: 'white' }}>✦</span>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '4px 14px 14px 14px',
                        padding: '10px 14px',
                        flex: 1,
                    }}>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, margin: '0 0 10px 0' }}>
                            MadeIt is a milestone-driven learning platform that helps students finish real projects and automatically builds proof-of-work portfolios.
                        </p>
                        {/* Typing dots */}
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
                                    style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(99,102,241,0.8)' }}
                                />
                            ))}
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', marginLeft: 4 }}>
                                generating...
                            </span>
                        </div>
                    </div>
                </div>

                {/* Input bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    marginTop: 2,
                }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', flex: 1 }}>
                        Ask about any project...
                    </span>
                    <span
                        className="ai-blink"
                        style={{ width: 1.5, height: 13, background: '#6366f1', display: 'inline-block', borderRadius: 1 }}
                    />
                    <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: '#1a1a2e',
                        border: '1px solid rgba(99,102,241,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="rgba(99,102,241,0.4)" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Section ────────────────────────────────────────────── */
export default function AIPlayground() {
    const ref = useRef(null);

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    });

    return (
        <>
            <style>{styles}</style>

            <section
                ref={ref}
                id="ai-playground"
                style={{
                    background: '#000',
                    width: '100%',
                    padding: '100px 28px',
                    boxSizing: 'border-box',
                    fontFamily: "'Inter', sans-serif",
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Subtle background radial */}
                <div style={{
                    position: 'absolute',
                    top: '-20%', right: '-10%',
                    width: 700, height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)',
                    pointerEvents: 'none',
                }} />

                <div
                    className="ai-grid"
                    style={{
                        maxWidth: 1160,
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: '1fr 400px',
                        gap: 80,
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* ══════════════
              LEFT COLUMN
          ══════════════ */}
                    <div>
                        {/* Label */}
                        <motion.p
                            {...fadeUp(0)}
                            style={{
                                fontSize: 11,
                                letterSpacing: '0.26em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.3)',
                                fontWeight: 600,
                                margin: '0 0 20px 0',
                            }}
                        >
                            AI Playground
                        </motion.p>

                        {/* Headline */}
                        <motion.h2
                            {...fadeUp(0.08)}
                            style={{
                                fontSize: 'clamp(36px, 5.5vw, 70px)',
                                fontWeight: 900,
                                letterSpacing: '-0.03em',
                                lineHeight: 1.05,
                                color: 'white',
                                margin: '0 0 6px 0',
                            }}
                        >
                            Experiment with
                        </motion.h2>
                        <motion.h2
                            {...fadeUp(0.14)}
                            style={{
                                fontSize: 'clamp(36px, 5.5vw, 70px)',
                                fontWeight: 900,
                                letterSpacing: '-0.03em',
                                lineHeight: 1.05,
                                margin: '0 0 32px 0',
                                fontStyle: 'italic',
                                fontFamily: "'Playfair Display', serif",
                                background: 'linear-gradient(90deg,#ff2f92,#ff7a18)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            intelligent systems.
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            {...fadeUp(0.22)}
                            style={{
                                fontSize: 15,
                                color: 'rgba(255,255,255,0.4)',
                                lineHeight: 1.85,
                                maxWidth: 500,
                                margin: '0 0 10px 0',
                            }}
                        >
                            Moin's AI Playground is a space where visitors can interact with the systems behind my projects.
                            Instead of just reading about AI applications, you can test them directly — from idea generation
                            to intelligent assistants built using modern AI models.
                        </motion.p>
                        <motion.p
                            {...fadeUp(0.28)}
                            style={{
                                fontSize: 15,
                                color: 'rgba(255,255,255,0.55)',
                                lineHeight: 1.85,
                                maxWidth: 500,
                                margin: '0 0 44px 0',
                                fontStyle: 'italic',
                            }}
                        >
                            This section exists because I believe the best way to understand AI is to experience it.
                        </motion.p>

                        {/* Feature list */}
                        <motion.div {...fadeUp(0.34)} style={{ marginBottom: 44 }}>
                            {FEATURES.map((f) => (
                                <div key={f.num} className="ai-feat-row">
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.2)',
                                        letterSpacing: '0.1em',
                                        marginTop: 3,
                                        flexShrink: 0,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        {f.num}
                                    </span>
                                    <div>
                                        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'white', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
                                            {f.title}
                                        </p>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.33)', margin: 0, lineHeight: 1.6 }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* CTA row */}
                        <motion.div
                            {...fadeUp(0.44)}
                            style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
                        >
                            <a href="/playground" className="ai-cta-btn">
                                Open AI Playground
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>

                            <span style={{
                                fontSize: 12,
                                color: 'rgba(255,255,255,0.22)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                            }}>
                                <span style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: '#4ade80',
                                    display: 'inline-block',
                                    boxShadow: '0 0 6px #4ade80',
                                }} />
                                No login required
                            </span>
                        </motion.div>
                    </div>

                    {/* ══════════════
              RIGHT COLUMN
          ══════════════ */}
                    <motion.div
                        className="ai-preview"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <ChatPreview />
                        <p style={{
                            textAlign: 'center',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.15)',
                            marginTop: 12,
                            letterSpacing: '0.04em',
                        }}>
                            Static preview · Try the real thing →
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
