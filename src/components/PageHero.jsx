import { motion } from 'framer-motion';

/* ─── Animation Variants ───────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.85,
            delay,
            ease: [0.22, 1, 0.36, 1],
        },
    },
});

const heroStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Playfair+Display:ital@1&family=Inter:wght@300;400;500;600&display=swap');

  @keyframes moinFadeIn {
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

  .moin-anim        { animation: moinFadeIn  1.4s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
  .tagline-caps-anim { animation: glassUp      1.0s cubic-bezier(0.22,1,0.36,1) 0.7s  both; }
  .tagline-serif-anim{ animation: glassUp      1.0s cubic-bezier(0.22,1,0.36,1) 1.0s  both; }
  .bottom-anim       { animation: fadeUpSoft   0.8s ease-out                    1.4s  both; }
`

/* ─── PageHero Component ───────────────────────────────────────── */
export default function PageHero({ title, subtitle, highlight }) {
    return (

        <>
        <style>{heroStyles}</style>
        <section
            style={{
                position: 'relative',
                width: '100%',
                minHeight: '75vh',
                display: 'flex',
                paddingTop: 'clamp(80px, 14vw, 10vw)',
                paddingBottom: '8vw',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* ── Dark neutral studio spotlight — matches reference exactly ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    /* Warm-gray center pool fading to pure black — no color tint */
                    background:
                        'radial-gradient(ellipse 70% 65% at 50% 48%, rgba(68,68,68,0.55) 0%, rgba(30,30,30,0.38) 38%, rgba(0,0,0,0) 72%)',
                    pointerEvents: 'none',
                }}
            />

            {/* ── Hard vignette — crushes edges to pure black ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.72) 68%, rgba(0,0,0,0.97) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* ── Content ── */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 24px',
                    width: '100%',
                }}
            >
                {/* Giant Title */}
                <h1
                    className="moin-anim text-white select-none leading-none"
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 900,
                        fontSize: 'clamp(62px, 13vw, 280px)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {title}
                </h1>

                {/* Divider spacer */}
                <div style={{ height: 'clamp(28px, 4vw, 48px)' }} />

                <div className="flex flex-col items-center mt-2 gap-2">
                    <p
                        className="tagline-caps-anim text-gray-400 uppercase text-center"
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(11px, 2vw, 17px)', letterSpacing: '0.38em', fontWeight: 300 }}
                    >
                        {subtitle}
                    </p>
                    <p
                        className="tagline-serif-anim text-white text-center"
                        style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(26px, 4.2vw, 62px)', letterSpacing: '-0.01em', fontWeight: 400 }}
                    >
                        {highlight}
                    </p>
                </div>
            </div>

            {/* ── Google Fonts (idempotent if already loaded) ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Playfair+Display:ital@1&display=swap');
                @media (max-width: 480px) {
                    .page-hero-title { letter-spacing: -0.02em !important; }
                }
            `}</style>
        </section>
        </>
    );
}
