import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── Injected Styles ──────────────────────────────────────────── */
const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital@1&family=Montserrat:wght@900&display=swap');

  @keyframes footerRingRotate {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes footerRingPulse {
    0%, 100% { box-shadow: 0 0 40px 8px rgba(99,102,241,0.35), 0 0 80px 16px rgba(168,85,247,0.18); }
    50%       { box-shadow: 0 0 60px 14px rgba(99,102,241,0.55), 0 0 120px 28px rgba(168,85,247,0.28); }
  }
  @keyframes footerRingFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(180deg); }
  }

  .footer-ring {
    animation: footerRingFloat 6s ease-in-out infinite;
  }

  .footer-link {
    display: flex;
    align-items: center;
    gap: 0px;
    color: rgba(255,255,255,0.42);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.22s ease, gap 0.22s ease;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .footer-link:hover {
    color: rgba(255,255,255,1);
    gap: 6px;
  }
  .footer-link .arrow {
    opacity: 0;
    font-size: 12px;
    transition: opacity 0.22s ease;
    transform: translateX(-4px);
  }
  .footer-link:hover .arrow {
    opacity: 1;
    transform: translateX(0px);
  }

  .footer-social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    transition: color 0.22s, border-color 0.22s, transform 0.22s, opacity 0.22s;
    background: rgba(255,255,255,0.04);
  }
  .footer-social-btn:hover {
    color: white;
    border-color: rgba(255,255,255,0.28);
    transform: scale(1.12);
    opacity: 1;
    background: rgba(255,255,255,0.08);
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
  }

  @media (max-width: 900px) {
    .footer-grid {
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
  }

  @media (max-width: 580px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 28px;
    }
    .footer-headline {
      font-size: clamp(42px, 12vw, 72px) !important;
    }
    .footer-hero-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .footer-ring-wrap {
      display: none !important;
    }
    .footer-card-inner {
      padding: 28px 20px !important;
    }
    .footer-outer {
      padding: 48px 16px 32px !important;
    }
  }
`;

/* ─── SVG Icons ─────────────────────────────────────────────────── */
const GithubIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

const LinkedinIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
);

const EmailIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

/* ─── Glowing Ring (right-side decoration) ─────────────────────── */
function GlowingRing() {
    return (
        <div
            className="footer-ring-wrap"
            style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                className="footer-ring"
                style={{
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    border: '2.5px solid transparent',
                    backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #6366f1)',
                    backgroundOrigin: 'border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    maskComposite: 'exclude',
                    boxShadow: '0 0 48px 10px rgba(99,102,241,0.4), 0 0 90px 20px rgba(168,85,247,0.2)',
                    position: 'relative',
                }}
            >
                {/* Inner subtle glow fill */}
                <div style={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 40% 40%, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 60%, transparent 100%)',
                }} />
            </div>
        </div>
    );
}

/* ─── Footer Link ───────────────────────────────────────────────── */
function FooterLink({ href, children }) {
    return (
        <a href={href || '#'} className="footer-link">
            <span>{children}</span>
            <span className="arrow">→</span>
        </a>
    );
}

/* ─── Footer Column ─────────────────────────────────────────────── */
function FooterColumn({ title, links, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
            <p style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
                fontWeight: 600,
                marginBottom: 20,
                fontFamily: "'Inter', sans-serif",
            }}>
                {title}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(({ label, href }) => (
                    <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
            </div>
        </motion.div>
    );
}

/* ─── Main Footer Component ─────────────────────────────────────── */
export default function Footer() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const generalLinks = [
        { label: 'Home', href: '#hero' },
        { label: 'Projects', href: '#projects' },
        { label: 'Guestbook', href: '#guestbook' },
        { label: 'Uses', href: '#uses' },
    ];

    const aboutLinks = [
        { label: 'About Me', href: '#about' },
        { label: 'Skills', href: '#skills' },
        { label: 'Projects', href: '#projects' },
        { label: 'Contact', href: '#contact' },
    ];

    const projectLinks = [
        { label: 'MadeIt', href: '#' },
        { label: 'Nexora Learn AI', href: '#' },
        { label: 'LevelUp.dev', href: '#' },
        { label: 'InvoiceFlow', href: '#' },
    ];

    const socials = [
        { icon: <GithubIcon />, href: 'https://github.com/moin-dbud', label: 'GitHub' },
        { icon: <LinkedinIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: <TwitterIcon />, href: 'https://twitter.com', label: 'Twitter' },
        { icon: <EmailIcon />, href: 'mailto:moin@example.com', label: 'Email' },
    ];

    return (
        <>
            <style>{footerStyles}</style>

            <footer
                ref={ref}
                id="footer"
                style={{
                            background: '#000',
                            width: '100%',
                            padding: '80px 28px 40px',
                            fontFamily: "'Inter', sans-serif",
                            boxSizing: 'border-box',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        className="footer-outer"
            >
                {/* ── Ambient background glow ── */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '5%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '2%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* ══════════════════════════════════════════
              SECTION HEADER — CTA Headline
          ══════════════════════════════════════════ */}
                    <motion.div
                        className="footer-hero-row"
                        initial={{ opacity: 0, y: 40 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 72,
                            gap: 24,
                        }}
                    >
                        {/* Left — Avatar + Headline */}
                        <div>
                            {/* Avatar + "Let's create" row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: '50%',
                                    border: '1.5px solid rgba(255,255,255,0.18)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: '#1a1a1a',
                                }}>
                                    <img
                                        src="/cropped_circle_image.webp"
                                        alt="Moin Sheikh"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                </div>

                                {/* Line 1 */}
                                <h2
                                    className="footer-headline"
                                    style={{
                                        fontFamily: "'Montserrat', sans-serif",
                                        fontWeight: 300,
                                        fontSize: 'clamp(32px, 5vw, 60px)',
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1,
                                        color: 'white',
                                        margin: 0,
                                    }}
                                >
                                    Let&apos;s create
                                </h2>
                            </div>

                            {/* Line 2 */}
                            <p
                                className="footer-headline"
                                style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(32px, 5vw, 60px)',
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1,
                                    color: 'rgba(255,255,255,0.3)',
                                    margin: 0,
                                    paddingLeft: 'calc(42px + 14px)',   /* indent to align past avatar */
                                }}
                            >
                                something real.
                            </p>
                        </div>

                        {/* Right — Glowing Ring */}
                        <GlowingRing />
                    </motion.div>

                    {/* ══════════════════════════════════════════
              FOOTER CONTAINER CARD
          ══════════════════════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 36 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="footer-card-inner"
                        style={{
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 28,
                            padding: '48px',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* ── 4-Column Grid ── */}
                        <div className="footer-grid">

                            {/* Column 1 — Brand Intro */}
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Brand Name */}
                                <p style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(28px, 3.5vw, 44px)',
                                    letterSpacing: '-0.03em',
                                    color: 'white',
                                    margin: '0 0 18px 0',
                                    lineHeight: 1,
                                }}>
                                    MOIN
                                </p>

                                {/* Description */}
                                <p style={{
                                    fontSize: 13.5,
                                    color: 'rgba(255,255,255,0.35)',
                                    lineHeight: 1.75,
                                    margin: '0 0 28px 0',
                                    maxWidth: 280,
                                    fontWeight: 400,
                                    letterSpacing: '-0.01em',
                                }}>
                                    Building intelligent systems and modern web experiences that solve real problems.
                                    From AI-powered applications to scalable full-stack platforms,
                                    I focus on crafting software that is fast, useful, and impactful.
                                </p>

                                {/* Legal links */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <FooterLink href="#">Privacy Policy</FooterLink>
                                    <FooterLink href="#">Terms &amp; Conditions</FooterLink>
                                </div>
                            </motion.div>

                            {/* Column 2 — General */}
                            <FooterColumn title="General" links={generalLinks} index={1} />

                            {/* Column 3 — About */}
                            <FooterColumn title="About" links={aboutLinks} index={2} />

                            {/* Column 4 — Projects */}
                            <FooterColumn title="Projects" links={projectLinks} index={3} />
                        </div>

                        {/* ── Bottom Divider ── */}
                        <div style={{
                            height: 1,
                            background: 'rgba(255,255,255,0.06)',
                            margin: '40px 0 28px',
                        }} />

                        {/* ── Bottom Bar ── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 16,
                            }}
                        >
                            {/* Left — copyright */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{
                                    fontSize: 12.5,
                                    color: 'rgba(255,255,255,0.32)',
                                    fontWeight: 500,
                                    letterSpacing: '-0.01em',
                                }}>
                                    © 2026 Moin Sheikh
                                </span>
                                <span style={{
                                    fontSize: 11,
                                    color: 'rgba(255,255,255,0.2)',
                                    letterSpacing: '0em',
                                }}>
                                    Built with React, Next.js, Tailwind &amp; Framer Motion
                                </span>
                            </div>

                            {/* Right — Social Icons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {socials.map(({ icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="footer-social-btn"
                                    >
                                        {icon}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* ── Very bottom spacing ── */}
                    <div style={{ height: 24 }} />
                </div>
            </footer>
        </>
    );
}
