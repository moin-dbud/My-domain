import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/* ─── Static fallback data (used if Supabase is unavailable) ──────────── */
const FALLBACK_PROJECTS = [
    {
        id: 0, title: 'MadeIt', category: 'Product Platform', color: '#f97316',
        description: 'MadeIt is a milestone-driven learning platform designed to help students finish real projects instead of passively consuming tutorials.',
        features: ['Milestone-based project execution system','Progress tracking dashboard with analytics','Automated proof-of-work portfolio generation'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'Next.js', icon: '▲' },{ label: 'Node.js', icon: '🟢' }],
        desktop: { bg: '#0f0a04', accent: '#f97316' },
        mobile: { bg: '#130c03', accent: '#f97316', label: 'My Projects' },
        images: { desktop: '/desktop-madeit.webp', mobile: '/mobile-madeit.webp' },
    },
    {
        id: 1, title: 'Nexora Learn AI', category: 'AI Education Platform', color: '#a855f7',
        description: 'Nexora Learn AI is an intelligent study planning platform designed for college students preparing for exams.',
        features: ['AI-powered personalized study planning','Rule-based scheduling algorithm','Smart task prioritization'],
        tech: [{ label: 'Python', icon: '🐍' },{ label: 'FastAPI', icon: '⚡' },{ label: 'OpenAI API', icon: '🤖' }],
        desktop: { bg: '#0d0814', accent: '#a855f7' },
        mobile: { bg: '#120a1a', accent: '#a855f7', label: 'Study Plan' },
        images: { desktop: '/desktop-nexora.webp', mobile: '/mobile-nexora.webp' },
    },
    {
        id: 2, title: 'LevelUp.dev', category: 'EdTech Platform', color: '#38bdf8',
        description: 'LevelUp.dev is a full-stack online learning platform where students can browse, enroll in, and complete structured development courses.',
        features: ['Course discovery and enrollment system','Structured learning modules','Student progress tracking'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'Node.js', icon: '🟢' },{ label: 'MongoDB', icon: '🍃' }],
        desktop: { bg: '#03111a', accent: '#38bdf8' },
        mobile: { bg: '#051520', accent: '#38bdf8', label: 'My Courses' },
        images: { desktop: '/desktop-levelup.webp', mobile: '/mobile-levelup.webp' },
    },
    {
        id: 3, title: 'AI Resume Analyzer', category: 'AI Tool', color: '#e2e8f0',
        description: 'An AI-powered tool that analyzes resumes and provides actionable insights to improve job readiness.',
        features: ['Resume analysis against job descriptions','Keyword optimization suggestions','Structure and formatting feedback'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'OpenAI API', icon: '🤖' },{ label: 'Node.js', icon: '🟢' }],
        desktop: { bg: '#0a0a0a', accent: '#94a3b8' },
        mobile: { bg: '#111', accent: '#94a3b8', label: 'Analyze Resume' },
        images: { desktop: '/desktop-resume.webp', mobile: '/mobile-resume.webp' },
    },
];

/* Map Supabase row → component's expected shape */
function mapRow(row) {
    return {
        id: row.id,
        title: row.title,
        category: row.category || '',
        color: row.color || '#a855f7',
        description: row.description || '',
        features: Array.isArray(row.features) ? row.features : [],
        tech: Array.isArray(row.tech) ? row.tech : [],
        desktop: { bg: row.desktop_bg || '#0a0a0a', accent: row.desktop_accent || row.color || '#a855f7' },
        mobile: { bg: row.mobile_bg || '#0a0a0a', accent: row.mobile_accent || row.color || '#a855f7', label: row.mobile_label || '' },
        images: { desktop: row.image_desktop || '', mobile: row.image_mobile || '' },
    };
}

/* ─── Projects hook ─────────────────────────────────────────────────────── */
function useProjects() {
    const [PROJECTS, setProjects] = useState(FALLBACK_PROJECTS);
    useEffect(() => {
        supabase
            .from('projects')
            .select('*')
            .eq('is_visible', true)
            .order('sort_order')
            .then(({ data }) => {
                if (data && data.length > 0) setProjects(data.map(mapRow));
            });
    }, []);
    return PROJECTS;
}

/* ─── Injected CSS ──────────────────────────────────────────────────────── */
const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital@1&display=swap');

  .vs-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    font-size: 11px;
    color: rgba(255,255,255,0.65);
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    cursor: default;
    transition: border-color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .vs-pill:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.22);
  }

  /* Mobile project cards */
  .mobile-project-card {
    background: #0a0a0a;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 28px 24px;
    transition: border-color 0.3s, background 0.3s;
  }
  .mobile-project-card:hover {
    border-color: rgba(255,255,255,0.15);
    background: #111;
  }

  @media (max-width: 639px) {
    .projects-sticky-section { display: none !important; }
    .projects-mobile-section { display: block !important; }
  }
  @media (min-width: 640px) {
    .projects-sticky-section { display: block !important; }
    .projects-mobile-section { display: none !important; }
  }
`;

/* ─── Desktop Mockup ────────────────────────────────────────────────────── */
/* Real image: aspect-ratio 1536:1100 ≈ 1.4:1 (landscape)                  */
/* Fallback: generated browser-chrome UI                                     */
function DesktopMockup({ project }) {
    const { bg, accent } = project.desktop;
    const imgSrc = project.images?.desktop;

    return (
        <div style={{
            width: '100%', maxWidth: 520,
            borderRadius: 14, overflow: 'hidden',
            background: bg,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: `0 40px 100px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px ${accent}28`,
            fontFamily: "'Inter',sans-serif",
        }}>
            {/* macOS-style browser chrome */}
            <div style={{
                background: '#181818',
                padding: '9px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{ display: 'flex', gap: 5 }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    ))}
                </div>
                <div style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)',
                    borderRadius: 5, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)' }}>
                        {imgSrc ? `${project.title.toLowerCase()}.in` : 'localhost:3000'}
                    </span>
                </div>
            </div>

            {/* Content */}
            {imgSrc ? (
                /* ── Real screenshot fills frame at native 1536:1100 ratio ── */
                <div style={{ aspectRatio: '1536 / 1100', width: '100%', overflow: 'hidden' }}>
                    <img
                        src={imgSrc}
                        alt={`${project.title} desktop`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        draggable={false}
                    />
                </div>
            ) : (
                /* ── Generated UI fallback ── */
                <div style={{ padding: '18px 18px 14px', minHeight: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                            {project.title}
                        </span>
                        <div style={{ display: 'flex', gap: 14 }}>
                            {['Home', 'Tools', 'Docs', 'Pricing'].map((n, i) => (
                                <span key={i} style={{
                                    fontSize: 9,
                                    color: i === 3 ? accent : 'rgba(255,255,255,0.4)',
                                    fontWeight: i === 3 ? 700 : 400,
                                }}>{n}</span>
                            ))}
                        </div>
                        <div style={{
                            width: 24, height: 24, borderRadius: 7,
                            background: accent, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 11,
                        }}>✦</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
                            Welcome aboard <span style={{ color: accent }}>Parth</span> 👋
                        </div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', maxWidth: 260, margin: '0 auto', lineHeight: 1.6 }}>
                            Unlock your potential with {project.title}. Explore powerful tools to streamline your workflow.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {['Text & Writing', 'AI Tools', 'Developer', 'PDF Tools'].map((cat, i) => (
                            <div key={i} style={{
                                padding: '4px 9px', borderRadius: 5, fontSize: 8,
                                background: i === 0 ? accent : 'rgba(255,255,255,0.05)',
                                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                                border: `1px solid ${i === 0 ? accent : 'rgba(255,255,255,0.08)'}`,
                            }}>{cat}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Mobile Mockup ─────────────────────────────────────────────────────── */
/* Real image: aspect-ratio 420:908 ≈ 0.46:1 (portrait)                    */
/* W=148 → H = 148 × (908/420) ≈ 320px                                     */
function MobileMockup({ project }) {
    const { bg, accent } = project.mobile;
    const imgSrc = project.images?.mobile;
    const W = 148;
    const H = Math.round(W * (908 / 420)); // ≈ 320

    return (
        <div style={{
            width: W, height: H, position: 'relative',
            borderRadius: 24, overflow: 'hidden',
            background: bg,
            border: '1.5px solid rgba(255,255,255,0.14)',
            boxShadow: `0 32px 72px rgba(0,0,0,0.96), 0 0 50px ${accent}38`,
            fontFamily: "'Inter',sans-serif",
            flexShrink: 0,
            display: 'flex', flexDirection: 'column',
        }}>
            {imgSrc ? (
                /* ── Real screenshot fills phone shell ── */
                <>
                    {/* Status bar gradient overlay */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 28,
                        background: 'linear-gradient(to bottom,rgba(0,0,0,0.5),transparent)',
                        zIndex: 2, pointerEvents: 'none',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '6px 12px 0',
                    }}>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>9:41</span>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>▌▌ WiFi</span>
                    </div>
                    <img
                        src={imgSrc}
                        alt={`${project.title} mobile`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        draggable={false}
                    />
                </>
            ) : (
                /* ── Generated UI fallback ── */
                <>
                    <div style={{ padding: '10px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>9:41</span>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)' }}>▌▌▌ WiFi</span>
                    </div>
                    <div style={{ padding: '4px 10px 8px', flex: 1 }}>
                        <div style={{ background: accent, borderRadius: 12, padding: '12px 10px', marginBottom: 8 }}>
                            <div style={{ fontSize: 9.5, fontWeight: 800, color: 'white', marginBottom: 3 }}>{project.title}</div>
                            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: 10 }}>
                                {project.mobile.label}<br />Get started →
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: '4px 7px', fontSize: 7, color: 'rgba(255,255,255,0.65)' }}>
                                ✦ {project.tech[0]?.label} · {project.tech[1]?.label}
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '9px 10px' }}>
                            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'white', marginBottom: 3 }}>PDF Merge</div>
                            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                                Combine PDFs in seconds.
                            </div>
                            <div style={{
                                height: 20, borderRadius: 999, background: accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 7, fontWeight: 700, color: 'white',
                            }}>Try Now →</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Spark bullet icon ─────────────────────────────────────────────────── */
function SparkIcon({ color }) {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
            <path d="M12 2L13.5 9L20 10.5L13.5 12L12 19L10.5 12L4 10.5L10.5 9L12 2Z"
                fill={color} opacity="0.9" />
        </svg>
    );
}

/* ─── Tech Pill ─────────────────────────────────────────────────────────── */
function TechPill({ icon, label }) {
    return (
        <span className="vs-pill">
            <span style={{ fontSize: 11 }}>{icon}</span>
            {label}
        </span>
    );
}

/* ─── Center Timeline ───────────────────────────────────────────────────── */
function Timeline({ activeIndex, total, scrollProgress, projects }) {
    const y = useTransform(scrollProgress, [0, 1], [0, 252]);
    const sy = useSpring(y, { stiffness: 55, damping: 22 });
    const activeColor = projects[activeIndex]?.color ?? '#a855f7';

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', position: 'relative',
            width: 48,
        }}>
            {/* Vertical track */}
            <div style={{
                position: 'relative',
                width: 2, flexGrow: 1, minHeight: 300,
                margin: '0 auto',
            }}>
                {/* Dim rail */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255,255,255,0.07)', borderRadius: 2,
                }} />

                {/* Filled progress */}
                <motion.div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: sy,
                    background: `linear-gradient(to bottom, #e84c1e, ${activeColor})`,
                    borderRadius: 2,
                    transition: 'background 0.5s ease',
                }} />

                {/* Profile image — the moving marker */}
                <motion.div style={{
                    position: 'absolute',
                    left: '50%',
                    y: sy,
                    translateX: '-50%',
                    translateY: '-50%',
                    zIndex: 10,
                }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%', padding: 2,
                        background: `conic-gradient(${activeColor}, #a855f7, #e84c1e, ${activeColor})`,
                        boxShadow: `0 0 18px 4px ${activeColor}66`,
                        transition: 'box-shadow 0.5s ease, background 0.5s ease',
                    }}>
                        <img
                            src="/cropped_circle_image.webp"
                            alt="Profile"
                            style={{
                                width: '100%', height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                                border: '2px solid #000',
                            }}
                        />
                    </div>
                </motion.div>

                {/* Project dot markers */}
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        left: '50%', transform: 'translateX(-50%)',
                        top: `${(i / (total - 1)) * 100}%`,
                        marginTop: -5,
                        width: activeIndex === i ? 10 : 7,
                        height: activeIndex === i ? 10 : 7,
                        borderRadius: '50%',
                        background: activeIndex === i ? projects[i].color : 'rgba(255,255,255,0.18)',
                        border: activeIndex === i
                            ? `2px solid ${projects[i].color}`
                            : '1.5px solid rgba(255,255,255,0.1)',
                        boxShadow: activeIndex === i ? `0 0 8px 2px ${projects[i].color}99` : 'none',
                        transition: 'all 0.35s ease',
                        zIndex: 3,
                    }} />
                ))}
            </div>
        </div>
    );
}

/* ─── Main Section ──────────────────────────────────────────────────────── */
export default function Projects() {
    const PROJECTS = useProjects();
    const wrapperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    /* Track scroll through the full wrapper — gives 0→1 across all projects */
    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    });

    useEffect(() => {
        const unsub = scrollYProgress.on('change', (v) => {
            /* Math.round(v * (N-1)) maps:
               v=0   → idx 0 (1st project)
               v=0.33 → idx 1
               v=0.67 → idx 2
               v=1.0  → idx 3 (last project) — guaranteed */
            const idx = Math.round(v * (PROJECTS.length - 1));
            setActiveIndex(Math.min(PROJECTS.length - 1, Math.max(0, idx)));
        });
        return unsub;
    }, [scrollYProgress, PROJECTS.length]);

    const project = PROJECTS[activeIndex];

    return (
        <>
            <style>{injectStyles}</style>

            {/* ───────── MOBILE: Simple vertical cards ───────── */}
            <div
                className="projects-mobile-section"
                style={{
                    display: 'none',
                    background: '#000',
                    padding: '60px 16px 80px',
                    fontFamily: "'Inter',sans-serif",
                }}
            >
                {/* Section header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p style={{
                        fontSize: 11, letterSpacing: '0.28em',
                        color: 'rgba(255,255,255,0.3)',
                        textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
                    }}>
                        Crafting Modern Experiences
                    </p>
                    <h2 style={{
                        fontSize: 'clamp(32px, 10vw, 56px)',
                        fontWeight: 900, letterSpacing: '-0.03em',
                        lineHeight: 1, margin: 0,
                    }}>
                        <span style={{ color: 'white' }}>VENTURE </span>
                        <span style={{
                            fontStyle: 'italic',
                            background: 'linear-gradient(90deg,#6366f1 0%,#a855f7 50%,#ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: "'Playfair Display',serif",
                        }}>SHOWCASE</span>
                    </h2>
                </div>

                {/* Project cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {PROJECTS.map((project, i) => (
                        <motion.div
                            key={project.id}
                            className="mobile-project-card"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Category + number */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
                                    {project.category}
                                </span>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em' }}>
                                    {String(i + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
                                </span>
                            </div>

                            {/* Color line + title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 18, height: 2.5, background: project.color, borderRadius: 2, flexShrink: 0 }} />
                                <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
                                    {project.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, marginBottom: 18 }}>
                                {project.description}
                            </p>

                            {/* Features */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                                {project.features.map((feat, fi) => (
                                    <div key={fi} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <SparkIcon color={project.color} />
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Tech pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {project.tech.map(({ label, icon }) => (
                                    <TechPill key={label} icon={icon} label={label} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ───────── DESKTOP: Sticky scroll showcase ───────── */}
            {/* Tall wrapper — each project gets 100vh of scroll travel */}
            <div
                className="projects-sticky-section"
                ref={wrapperRef}
                style={{ height: `${(PROJECTS.length + 1) * 100}vh`, position: 'relative' }}
            >
                {/* Sticky panel — pins to viewport, never scrolls */}
                <section style={{
                    position: 'sticky', top: 0,
                    height: '100vh', overflow: 'hidden',
                    background: '#000',
                    fontFamily: "'Inter',sans-serif",
                    display: 'flex', flexDirection: 'column',
                }}>
                    {/* Ambient glow — right */}
                    <div style={{
                        position: 'absolute', right: '5%', top: '25%',
                        width: 640, height: 640, borderRadius: '50%',
                        background: `radial-gradient(ellipse,${project.color}1a 0%,transparent 68%)`,
                        pointerEvents: 'none', zIndex: 0,
                        transition: 'background 0.7s ease',
                    }} />
                    {/* Ambient glow — left */}
                    <div style={{
                        position: 'absolute', left: '-5%', bottom: '10%',
                        width: 400, height: 400, borderRadius: '50%',
                        background: `radial-gradient(ellipse,${project.color}0d 0%,transparent 70%)`,
                        pointerEvents: 'none', zIndex: 0,
                        transition: 'background 0.7s ease',
                    }} />

                    {/* ── Section Header ── */}
                    <div style={{
                        textAlign: 'center',
                        paddingTop: 48, paddingBottom: 32,
                        position: 'relative', zIndex: 1, flexShrink: 0,
                    }}>
                        <p style={{
                            fontSize: 11, letterSpacing: '0.28em',
                            color: 'rgba(255,255,255,0.3)',
                            textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
                        }}>
                            Crafting Modern Experiences
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(36px, 6vw, 80px)',
                            fontWeight: 900, letterSpacing: '-0.03em',
                            lineHeight: 1, margin: 0, display: 'inline',
                        }}>
                            <span style={{ color: 'white' }}>VENTURE </span>
                            <span style={{
                                fontStyle: 'italic',
                                background: 'linear-gradient(90deg,#6366f1 0%,#a855f7 50%,#ec4899 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontFamily: "'Playfair Display',serif",
                            }}>SHOWCASE</span>
                        </h2>

                        {/* Scroll hint — fades as soon as user starts scrolling */}
                        <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}>
                            <p style={{
                                marginTop: 14, fontSize: 11,
                                color: 'rgba(255,255,255,0.22)',
                                letterSpacing: '0.2em', textTransform: 'uppercase',
                            }}>
                                Scroll to explore ↓
                            </p>
                        </motion.div>
                    </div>

                    {/* ── Main 3-column layout ── */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.1fr 80px 1.4fr',
                        maxWidth: 1300, width: '100%',
                        margin: '0 auto', padding: '0 48px',
                        position: 'relative', zIndex: 1,
                        flex: 1, minHeight: 0,
                        alignItems: 'center',
                    }}>

                        {/* ── LEFT: Project Description ── */}
                        <div style={{ paddingRight: 40, overflow: 'hidden' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -18 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    {/* Title row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                                        <motion.div
                                            layoutId="dash"
                                            style={{ width: 22, height: 2.5, background: project.color, borderRadius: 2 }}
                                        />
                                        <h3 style={{
                                            fontSize: 26, fontWeight: 800, color: 'white',
                                            letterSpacing: '-0.02em', margin: 0,
                                        }}>
                                            {project.title}
                                        </h3>
                                        <span style={{
                                            fontSize: 11, color: 'rgba(255,255,255,0.28)',
                                            letterSpacing: '0.18em', textTransform: 'uppercase',
                                            marginLeft: 6, fontWeight: 500,
                                        }}>
                                            {String(activeIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: 13, color: 'rgba(255,255,255,0.42)',
                                        lineHeight: 1.82, marginBottom: 24, maxWidth: 400,
                                    }}>
                                        {project.description}
                                    </p>

                                    {/* Features */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                                        {project.features.map((feat, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <SparkIcon color={project.color} />
                                                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.6 }}>
                                                    {feat}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tech stack pills */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                        {project.tech.map(({ label, icon }) => (
                                            <TechPill key={label} icon={icon} label={label} />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── CENTER: Timeline ── */}
                        <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                            <Timeline
                                activeIndex={activeIndex}
                                total={PROJECTS.length}
                                scrollProgress={scrollYProgress}
                                projects={PROJECTS}
                            />
                        </div>

                        {/* ── RIGHT: Mockups ── */}
                        <div style={{
                            paddingLeft: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            height: '100%',
                        }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: 32, scale: 0.97 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -24, scale: 0.97 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ position: 'relative', width: '100%', maxWidth: 560, height: 320 }}
                                >
                                    {/* Mobile — lower left, tilted */}
                                    <motion.div
                                        whileHover={{ rotateX: 3, rotateY: 3, scale: 1.03 }}
                                        style={{
                                            position: 'absolute',
                                            left: 0, bottom: -20,
                                            rotate: -12,
                                            transformOrigin: 'bottom left',
                                            zIndex: 2,
                                        }}
                                    >
                                        <MobileMockup project={project} />
                                    </motion.div>

                                    {/* Desktop — right, slight tilt */}
                                    <motion.div
                                        whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }}
                                        style={{
                                            position: 'absolute',
                                            right: 0, top: 0,
                                            rotate: 2,
                                            transformOrigin: 'top right',
                                            zIndex: 1,
                                            width: 'calc(100% - 100px)',
                                        }}
                                    >
                                        <DesktopMockup project={project} />
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>


                </section>
            </div>
        </>
    );
}
