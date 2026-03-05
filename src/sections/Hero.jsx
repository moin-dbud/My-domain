import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ─── Injected global styles ─────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Playfair+Display:ital@1&family=Inter:wght@300;400;500;600&display=swap');

  @keyframes parthFadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes glassUp {
    0%   { opacity: 0; transform: translateY(48px); filter: blur(12px); }
    60%  { filter: blur(2px); }
    100% { opacity: 1; transform: translateY(0px); filter: blur(0px); }
  }
  @keyframes fadeUpSoft {
    0%   { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .parth-anim        { animation: parthFadeIn  1.4s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
  .tagline-caps-anim { animation: glassUp      1.0s cubic-bezier(0.22,1,0.36,1) 0.7s  both; }
  .tagline-serif-anim{ animation: glassUp      1.0s cubic-bezier(0.22,1,0.36,1) 1.0s  both; }
  .nav-anim          { animation: fadeUpSoft   0.7s ease-out                    0s    both; }
  .bottom-anim       { animation: fadeUpSoft   0.8s ease-out                    1.4s  both; }

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

  /* The two text layers (visible + hover clone) */
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

  /* Hover: bring clone down, push original down & out */
  .nav-link-wrap:hover .nav-link-text {
    transform: translateY(120%);
    opacity: 0;
  }
  .nav-link-wrap:hover .nav-link-hover {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
  }

  /* Click: snap original back to top then fall into place */
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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
        title: 'Links',
        sub: 'Socials & Profiles',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
            </svg>
        ),
        title: 'Uses',
        sub: 'My gear & software',
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
    },
];

/* ─── Animated nav link component ────────────────────────── */
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

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Trigger */}
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

            {/* Dropdown panel */}
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
                            left: '50%',
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
                            {/* Decorative flask icon */}
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
                            {MORE_ITEMS.map(({ icon, title, sub }) => (
                                <button
                                    key={title}
                                    onClick={() => setOpen(false)}
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
                                    {/* Icon box */}
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

/* ─── Hero page ───────────────────────────────────────────── */
export default function Hero() {
    return (
        <>
            <style>{globalStyles}</style>

            <div
                id="hero"
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="w-full h-screen bg-black flex flex-col overflow-hidden"
            >

                {/* ── NAVBAR ── */}
                <nav className="nav-anim w-full flex items-center justify-between px-6 py-5 shrink-0" style={{ position: 'relative', zIndex: 50 }}>

                    {/* Left — Logo */}
                    <div className="flex items-center gap-2">
                        <span
                            className="text-white font-semibold text-base"
                            style={{ letterSpacing: '-0.01em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
                        >
                            MS
                        </span>
                        <div style={{ width: '1px', height: '28px', backgroundColor: '#4B5563' }} />
                        <div className="green-dot" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 uppercase" style={{ fontSize: '8px', letterSpacing: '0.30em', fontWeight: 400 }}>
                                Creative Engineer
                            </span>
                            <span className="text-green-400 uppercase font-medium" style={{ fontSize: '8px', letterSpacing: '0.30em' }}>
                                Building The Future
                            </span>
                        </div>
                    </div>

                    {/* Center — Nav Links pill */}
                    <div
                        className="flex items-center gap-0.5 rounded-full p-1.5"
                        style={{ border: '1px solid #1f1f1f', background: 'rgba(10,10,10,0.8)' }}
                    >
                        <NavLink label="Home" active />
                        <NavLink label="About" />
                        <NavLink label="Work" />
                        <NavLink label="Blogs" />
                        <MoreButton />                    

                        {/* Right — Controls */}
                        <div className="flex items-center gap-2">
                        <div style={{ width: '1px', height: '28px', backgroundColor: '#2a2c2e' }} />

                        {/* Theme toggle */}
                        <button
                            className="flex items-center justify-center rounded-full bg-[#121212] text-white transition-colors"
                            style={{ width: '34px', height: '34px' }}
                            aria-label="Toggle theme"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        </button>

                        {/* Book a Call */}
                        <button className="text-white text-sm font-medium rounded-full bg-[#121212] px-5 py-1.5">
                            Book a Call
                        </button>
                    </div>
                    </div>
                </nav>

                {/* ── HERO CONTENT ── */}
                <div className="flex-1 flex flex-col items-center justify-center" style={{ marginTop: '-3rem' }}>

                    <h1
                        className="parth-anim text-white select-none leading-none"
                        style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(80px, 15vw, 280px)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        MOIN
                    </h1>

                    <div className="flex flex-col items-center mt-2 gap-2">
                        <p
                            className="tagline-caps-anim text-gray-400 uppercase text-center"
                            style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(6px, 2vw, 17px)', letterSpacing: '0.38em', fontWeight: 300 }}
                        >
                            I DESIGN AND BUILD PRODUCTS THAT
                        </p>
                        <p
                            className="tagline-serif-anim text-white text-center"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(30px, 4.2vw, 62px)', letterSpacing: '-0.01em', fontWeight: 400 }}
                        >
                            deliver real impact.
                        </p>
                    </div>
                </div>

                {/* ── BOTTOM CORNERS ── */}
                <div className="bottom-anim w-full flex items-end justify-between px-8 pb-12 shrink-0 z-10">

                    {/* Left: location */}
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(48,205,17,1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-white font-bold uppercase" style={{ fontSize: '11px', letterSpacing: '0.18em' }}>Based In Nagpur,</span>
                        <span className="text-gray-500 uppercase" style={{ fontSize: '10px', letterSpacing: '0.18em' }}>India</span>
                    </div>

                    {/* Right: stack */}
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                        <span className="text-white font-bold uppercase" style={{ fontSize: '11px', letterSpacing: '0.18em' }}>Full Stack Dev,</span>
                        <span className="text-gray-500 uppercase" style={{ fontSize: '10px', letterSpacing: '0.18em' }}>&amp; Designer</span>
                    </div>
                </div>

            </div>
        </>
    );
}
