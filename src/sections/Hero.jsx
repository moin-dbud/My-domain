import { useState } from 'react';
import { motion } from 'framer-motion';

/* ─── Injected styles (hero-only animations) ─────────────── */
const heroStyles = `
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
  .bottom-anim       { animation: fadeUpSoft   0.8s ease-out                    1.4s  both; }
`;

/* ─── Hero section ────────────────────────────────────────── */
export default function Hero() {
    const [dark, setDark] = useState(true);

    return (
        <>
            <style>{heroStyles}</style>

            <div
                id="hero"
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="w-full h-screen bg-black flex flex-col"
            >
                {/* ── MOBILE NAVBAR PILL (visible only on mobile, sm:hidden) ── */}
                <div className="flex sm:hidden justify-center pt-4 px-4 shrink-0 z-50">
                    <div
                        className="flex items-center gap-0 rounded-full px-1 py-1"
                        style={{
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(12,12,12,0.85)',
                            backdropFilter: 'blur(18px)',
                            WebkitBackdropFilter: 'blur(18px)',
                        }}
                    >
                        {/* Initials */}
                        <span
                            className="text-white font-semibold px-3"
                            style={{
                                fontSize: '15px',
                                fontFamily: "'Playfair Display', serif",
                                fontStyle: 'italic',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            MS
                        </span>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />

                        {/* Full name */}
                        <span
                            className="text-white px-3"
                            style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.01em' }}
                        >
                            Moin Sheikh
                        </span>

                        {/* Theme toggle */}
                        <button
                            onClick={() => setDark(d => !d)}
                            className="flex items-center justify-center rounded-full text-white"
                            style={{
                                width: '34px', height: '34px', flexShrink: 0,
                                background: 'rgba(255,255,255,0.08)',
                            }}
                            aria-label="Toggle theme"
                        >
                            {dark ? (
                                /* Moon icon */
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                /* Sun icon */
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── HERO CONTENT ── */}
                <div className="flex-1 flex flex-col items-center justify-center" style={{ marginTop: '-3rem' }}>

                    <h1
                        className="parth-anim text-white select-none leading-none"
                        style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(72px, 15vw, 280px)',
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
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(26px, 4.2vw, 62px)', letterSpacing: '-0.01em', fontWeight: 400 }}
                        >
                            deliver real impact.
                        </p>
                    </div>
                </div>

                {/* ── BOTTOM CORNERS ── */}
                <div className="bottom-anim w-full flex items-end justify-between px-6 sm:px-8 pb-10 sm:pb-12 shrink-0 z-10">

                    {/* Left: location */}
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(48,205,17,1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-white font-bold uppercase" style={{ fontSize: 'clamp(8px,2.5vw,11px)', letterSpacing: '0.18em' }}>Based In Nagpur,</span>
                        <span className="text-gray-500 uppercase" style={{ fontSize: 'clamp(7px,2vw,10px)', letterSpacing: '0.18em' }}>India</span>
                    </div>

                    {/* Right: stack */}
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                        <span className="text-white font-bold uppercase" style={{ fontSize: 'clamp(8px,2.5vw,11px)', letterSpacing: '0.18em' }}>AI Innovator,</span>
                        <span className="text-gray-500 uppercase" style={{ fontSize: 'clamp(7px,2vw,10px)', letterSpacing: '0.18em' }}>&amp; Web Developer</span>
                    </div>
                </div>

            </div>
        </>
    );
}

