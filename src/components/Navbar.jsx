import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import CommandPalette from './CommandPalette';
import { useFloodNavigate } from './PageTransition';

/* ─── Mobile nav styles ──────────────────────────────────────── */
const mobileNavStyles = `
  .mobile-nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 200;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow-y: auto;
  }
  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 28px;
    color: rgba(255,255,255,0.75);
    font-size: 18px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    width: 100%;
    transition: color 0.2s, background 0.2s;
  }
  .mobile-nav-link:hover, .mobile-nav-link.active {
    color: white;
    background: rgba(255,255,255,0.04);
  }
  .mobile-nav-link.active {
    color: white;
    font-weight: 700;
  }
  .mobile-nav-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
`;

/* ─── Injected global styles ─────────────────────────────── */
const navbarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=Inter:wght@300;400;500;600&display=swap');

  .nav-anim { animation: fadeUpSoft 0.7s ease-out 0s both; }

  @keyframes fadeUpSoft {
    0%   { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .green-dot {
    width: 2px; height: 2px;
    background: #4ade80;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── NavLink roll-down effect ── */
  .nav-link-wrap {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    padding: 6px 16px;
    border-radius: 9999px;
    font-size: 0.875rem;
    color: white;
    background: transparent;
    border: none;
    line-height: 1;
    user-select: none;
  }

  .nav-link-text {
    display: block;
    transition: transform 0.32s cubic-bezier(0.22,1,0.36,1),
                opacity   0.32s cubic-bezier(0.22,1,0.36,1);
    will-change: transform, opacity;
  }
  .nav-link-hover {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(-120%);
    opacity: 0;
    transition: transform 0.32s cubic-bezier(0.22,1,0.36,1),
                opacity   0.32s cubic-bezier(0.22,1,0.36,1);
    will-change: transform, opacity;
    white-space: nowrap;
  }

  .nav-link-wrap:hover .nav-link-text {
    transform: translateY(120%);
    opacity: 0;
  }
  .nav-link-wrap:hover .nav-link-hover {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
  }

  .nav-link-wrap:active .nav-link-text {
    transform: translateY(6px);
    opacity: 1;
    transition: transform 0.08s ease, opacity 0.08s ease;
  }
  .nav-link-wrap:active .nav-link-hover {
    transform: translateX(-50%) translateY(-140%);
    opacity: 0;
    transition: transform 0.08s ease, opacity 0.08s ease;
  }
`;

/* ─── More dropdown items ─────────────────────────────────── */
const MORE_ITEMS = [
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
            </svg>
        ),
        title: 'Labs',
        sub: 'Experiments & tools',
        route: '/labs',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
        title: 'Links',
        sub: 'Socials & Profiles',
        route: '/links',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M9 7h6M9 11h6M9 15h4" />
            </svg>
        ),
        title: 'Guestbook',
        sub: 'Sign my wall',
        route: '/guestbook',
    },
];

/* ─── Animated nav link ───────────────────────────────────── */
function NavLink({ label, active = false, onClick }) {
    if (active) {
        return (
            <button
                onClick={onClick}
                className="bg-white text-black font-medium rounded-full px-5 py-1.5 text-sm"
            >
                {label}
            </button>
        );
    }
    return (
        <button className="nav-link-wrap" onClick={onClick}>
            <span className="nav-link-text">{label}</span>
            <span className="nav-link-hover">{label}</span>
        </button>
    );
}

/* ─── More button with dropdown ──────────────────────────── */
function MoreButton() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { floodNavigate } = useFloodNavigate();

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                className="nav-link-wrap"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <span className="nav-link-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    More
                    <svg
                        width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
                <span className="nav-link-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    More
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 15px)',
                            right: 0,
                            display: 'grid',
                            gridTemplateColumns: '220px 260px',
                            borderRadius: '18px',
                            overflow: 'hidden',
                            background: '#111',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                            zIndex: 100,
                            minWidth: '480px',
                        }}
                    >
                        {/* Left — Labs promo */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                padding: '28px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                minHeight: '220px',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.25 }}>
                                <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 3h6M9 3v6L4 18a2 2 0 0 0 1.8 2.9h12.4A2 2 0 0 0 20 18l-5-9V3" />
                                    <path d="M6.1 14h11.8" />
                                </svg>
                            </div>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                                Labs
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.45 }}>
                                Experimental playground &amp; fun micro-tools
                            </span>
                        </div>

                        {/* Right — menu items */}
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {MORE_ITEMS.map(({ icon, title, sub, route }) => (
                                <button
                                    key={title}
                                    onClick={(e) => {
                                        setOpen(false);
                                        if (route) floodNavigate(route, e);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.18s',
                                        width: '100%',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'rgba(255,255,255,0.7)',
                                        flexShrink: 0,
                                    }}>
                                        {icon}
                                    </div>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                                            {title}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                            {sub}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main Navbar ─────────────────────────────────────────── */
export default function Navbar() {
    const [cmdOpen, setCmdOpen] = useState(false);
    const { scrollY } = useScroll();
    const pillRef = useRef(null);
    const { floodNavigate } = useFloodNavigate();
    const { pathname } = useLocation();

    /* Global Cmd+K / Ctrl+K shortcut */
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(v => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    /* Text slides left and disappears into the divider over first 120px of scroll */
    const textX = useTransform(scrollY, [0, 120], [0, -62]);
    const textOpacity = useTransform(scrollY, [0, 100], [1, 0]);

    /* After text gone, divider line + dot shrink away */
    const lineOpacity = useTransform(scrollY, [90, 160], [1, 0]);
    const lineWidth = useTransform(scrollY, [90, 160], [1, 0]);
    const dotOpacity = useTransform(scrollY, [90, 155], [1, 0]);
    const dotScale = useTransform(scrollY, [90, 155], [1, 0]);

    /* Spring-smooth logo elements */
    const sTextX = useSpring(textX, { stiffness: 80, damping: 20 });
    const sTextOpacity = useSpring(textOpacity, { stiffness: 80, damping: 20 });
    const sLineOpacity = useSpring(lineOpacity, { stiffness: 60, damping: 18 });
    const sLineWidth = useSpring(lineWidth, { stiffness: 60, damping: 18 });
    const sDotOpacity = useSpring(dotOpacity, { stiffness: 60, damping: 18 });
    const sDotScale = useSpring(dotScale, { stiffness: 60, damping: 18 });

    /* Pill x: starts at 0 (right-aligned by margin-left:auto).
       On scroll we push it LEFT by exactly the distance needed to reach nav center.
       We measure at runtime so it works at every screen size.                     */
    const rawPillX = useMotionValue(0);
    const sPillX = useSpring(rawPillX, { stiffness: 55, damping: 22 });

    useEffect(() => {
        /* How far left must the pill move from its natural right position
           to land exactly at the nav's horizontal center?
           pill center (right-aligned) = navW - paddingRight - pillW/2
           nav center                  = navW / 2
           delta (negative = move left) = navW/2 - (navW - paddingRight - pillW/2)
                                        = -navW/2 + paddingRight + pillW/2           */
        const PAD = 24; // matches px-6 (1.5rem = 24px)

        const computeOffset = () => {
            if (!pillRef.current) return 0;
            const pillW = pillRef.current.offsetWidth;
            const navW = document.documentElement.clientWidth;
            return -navW / 2 + PAD + pillW / 2;
        };

        let centerOffset = computeOffset();

        const unsub = scrollY.on('change', (y) => {
            const progress = Math.min(Math.max(y / 160, 0), 1);
            rawPillX.set(centerOffset * progress);
        });

        const onResize = () => { centerOffset = computeOffset(); };
        window.addEventListener('resize', onResize);

        return () => {
            unsub();
            window.removeEventListener('resize', onResize);
        };
    }, [scrollY, rawPillX]);

    return (
        <>
            <style>{navbarStyles}</style>
            <style>{mobileNavStyles}</style>

            {/* ── MOBILE NAV ── */}
            <MobileNav />

            <nav
                className="nav-anim w-full hidden sm:flex items-center px-6 py-5"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    fontFamily: "'Inter', sans-serif",
                    background: 'transparent',
                }}
            >
                {/* Left — Logo */}
                <div className="flex items-center gap-2">
                    <span
                        className="text-white font-semibold text-base"
                        style={{ letterSpacing: '-0.01em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
                    >
                        MS
                    </span>

                    {/* Divider line — fades out after text has gone */}
                    <motion.div style={{
                        width: sLineWidth, height: '28px',
                        backgroundColor: '#4B5563',
                        opacity: sLineOpacity,
                        flexShrink: 0,
                    }} />

                    {/* Green dot — fades + shrinks after divider */}
                    <motion.div className="green-dot" style={{
                        opacity: sDotOpacity,
                        scale: sDotScale,
                    }} />

                    {/* Status text — slides LEFT behind the divider line, then gone */}
                    <div style={{ overflow: 'hidden', display: 'flex' }}>
                        <motion.div
                            className="flex flex-col"
                            style={{ x: sTextX, opacity: sTextOpacity }}
                        >
                            <span className="text-gray-400 uppercase" style={{ fontSize: '8px', letterSpacing: '0.30em', fontWeight: 400 }}>
                                Creative Engineer
                            </span>
                            <span className="text-green-400 uppercase font-medium" style={{ fontSize: '8px', letterSpacing: '0.30em' }}>
                                Building The Future
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* ── Right-aligned pill ─────────────────────────────────────────
                     margin-left:auto pushes it flush to the right edge.
                     On scroll, sPillX shifts it left by the exact measured amount
                     needed to land at true nav center. Reverses on scroll-up.   */}
                <motion.div
                    ref={pillRef}
                    style={{ marginLeft: 'auto', x: sPillX }}
                >
                    <div
                        className="flex items-center gap-0.5 rounded-full p-1.5"
                        style={{ border: '1px solid #1f1f1f', background: 'rgba(10,10,10,0.8)' }}
                    >
                        {/* Nav links — active pill follows current route */}
                        <NavLink label="Home" active={pathname === '/'} onClick={(e) => floodNavigate('/', e)} />
                        <NavLink label="About" active={pathname === '/about'} onClick={(e) => floodNavigate('/about', e)} />
                        <NavLink label="Work" active={pathname === '/work'} onClick={(e) => floodNavigate('/work', e)} />
                        <NavLink label="Blogs" active={pathname === '/blogs'} onClick={(e) => floodNavigate('/blogs', e)} />
                        <MoreButton />

                        {/* Separator */}
                        <div style={{ width: '1px', height: '22px', backgroundColor: '#2a2c2e', margin: '0 4px', flexShrink: 0 }} />

                        {/* ⌘ Command Palette button */}
                        <button
                            onClick={() => setCmdOpen(true)}
                            title="Command Palette (⌘K)"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '34px', height: '34px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.55)',
                                cursor: 'pointer',
                                fontSize: 16,
                                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                            aria-label="Open command palette"
                        >
                            ⌘
                        </button>

                        {/* Theme toggle */}
                        <button
                            className="flex items-center justify-center rounded-full bg-[#121212] text-white transition-colors"
                            style={{ width: '34px', height: '34px', flexShrink: 0 }}
                            aria-label="Toggle theme"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        </button>

                        {/* Book a Call */}
                        <button className="text-white text-sm font-medium rounded-full bg-[#121212] px-5 py-1.5" style={{ flexShrink: 0 }}>
                            Book a Call
                        </button>
                    </div>
                </motion.div>
            </nav>
            <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        </>
    );
}

/* ─── Mobile Navigation Component ───────────────────────────── */
function MobileNav() {
    const [open, setOpen] = useState(false);
    const { floodNavigate } = useFloodNavigate();
    const { pathname } = useLocation();

    const NAV_LINKS = [
        { label: 'Home', route: '/', icon: '○' },
        { label: 'About', route: '/about', icon: '◎' },
        { label: 'Work', route: '/work', icon: '▣' },
        { label: 'Blogs', route: '/blogs', icon: '✦' },
        { label: 'Labs', route: '/labs', icon: '⬡' },
        { label: 'Links', route: '/links', icon: '⬢' },
        { label: 'Guestbook', route: '/guestbook', icon: '✎' },
    ];

    // Close on route change
    useEffect(() => { setOpen(false); }, [pathname]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Mobile top bar */}
            <div
                className="sm:hidden flex items-center justify-between"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    zIndex: 210,
                    padding: '12px 20px',
                    background: open ? 'transparent' : 'rgba(0,0,0,0.0)',
                    transition: 'background 0.3s',
                }}
            >
                {/* Logo */}
                <span
                    style={{
                        fontSize: '18px',
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: 'italic',
                        fontWeight: 600,
                        color: 'white',
                        letterSpacing: '-0.01em',
                    }}
                >
                    MS
                </span>

                {/* Hamburger toggle */}
                <button
                    onClick={() => setOpen(v => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        background: open ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,10,0.85)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        flexDirection: 'column',
                        gap: open ? 0 : 5,
                        padding: '10px',
                        transition: 'background 0.2s, gap 0.25s',
                        outline: 'none',
                    }}
                >
                    <motion.span
                        animate={open
                            ? { rotate: 45, y: 4, width: 20 }
                            : { rotate: 0,  y: 0, width: 18 }
                        }
                        transition={{ duration: 0.25 }}
                        style={{ display: 'block', height: 1.5, background: 'white', borderRadius: 2, transformOrigin: 'center' }}
                    />
                    <motion.span
                        animate={open
                            ? { opacity: 0, scaleX: 0 }
                            : { opacity: 1, scaleX: 1 }
                        }
                        transition={{ duration: 0.18 }}
                        style={{ display: 'block', height: 1.5, background: 'white', borderRadius: 2, width: 20 }}
                    />
                    <motion.span
                        animate={open
                            ? { rotate: -45, y: -4, width: 20 }
                            : { rotate: 0,  y: 0,  width: 14 }
                        }
                        transition={{ duration: 0.25 }}
                        style={{ display: 'block', height: 1.5, background: 'white', borderRadius: 2, transformOrigin: 'center' }}
                    />
                </button>
            </div>

            {/* Full-screen drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="mobile-nav-overlay sm:hidden"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Top spacer - logo area */}
                        <div style={{ height: 72, flexShrink: 0 }} />

                        {/* Main links */}
                        <nav style={{ flex: 1 }}>
                            {NAV_LINKS.map(({ label, route, icon }, i) => (
                                <motion.button
                                    key={label}
                                    className={`mobile-nav-link${pathname === route ? ' active' : ''}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                    onClick={(e) => floodNavigate(route, e)}
                                >
                                    <span style={{
                                        fontSize: 13,
                                        color: pathname === route ? 'white' : 'rgba(255,255,255,0.3)',
                                        width: 20, textAlign: 'center', flexShrink: 0,
                                    }}>
                                        {icon}
                                    </span>
                                    <span>{label}</span>
                                    {pathname === route && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            fontSize: 10, padding: '2px 8px',
                                            borderRadius: 999,
                                            background: 'rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.5)',
                                        }}>
                                            Current
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                        </nav>

                        {/* Bottom - status */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                padding: '24px 28px 44px',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}
                        >
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.7)', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
                                Available for work
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
