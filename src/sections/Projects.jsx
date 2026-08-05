import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/* ─── Static fallback data (used if Supabase is unavailable) ──────────── */
const FALLBACK_PROJECTS = [
    {
        id: 0, title: 'Buildo', category: 'AI SaaS Platform', color: '#a855f7',
        description: 'An AI-powered website builder that generates production-ready marketing sites for small businesses, cafes, portfolios, and personal brands from a single text prompt — with a curated design-system engine that keeps every generated site visually distinct instead of defaulting to generic AI-template layouts.',
        features: ['AI-generated websites from a single prompt','Curated design-system engine for visual variety (not generic AI templates)','Public profiles & shareable project URLs (@username/project-slug)','Credit-based generation with Cashfree payment integration','Custom admin panel for full platform control'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'TypeScript', icon: '🧠' },{ label: 'Node.js', icon: '🟢' },{ label: 'PostgreSQL (Neon)', icon: '🐘' }, { label: 'Prisma', icon: '🧩' }, { label: 'Tailwind CSS', icon: '🎨'}],
        labels: [],
        desktop: { bg: '#0a0a0a', accent: '#a855f7' },
        mobile: { bg: '#0a0a0a', accent: '#a855f7', label: 'Build a Website' },
        images: { desktop: '/buildo-laptop.png', mobile: '/mobile-buildo.png' },
        live_url: '', github_url: '',
        contributors: [],
    },
    {
        id: 0, title: 'MadeIt', category: 'Product Platform', color: '#f97316',
        description: 'MadeIt is a milestone-driven learning platform designed to help students finish real projects instead of passively consuming tutorials.',
        features: ['Milestone-based project execution system','Progress tracking dashboard with analytics','Automated proof-of-work portfolio generation'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'Next.js', icon: '▲' },{ label: 'Node.js', icon: '🟢' }],
        labels: [],
        desktop: { bg: '#0f0a04', accent: '#f97316' },
        mobile: { bg: '#130c03', accent: '#f97316', label: 'My Projects' },
        images: { desktop: '/desktop-madeit.webp', mobile: '/mobile-madeit.webp' },
        live_url: '', github_url: '',
        contributors: [],
    },
    {
        id: 1, title: 'Nexora Learn AI', category: 'AI Education Platform', color: '#a855f7',
        description: 'Nexora Learn AI is an intelligent study planning platform designed for college students preparing for exams.',
        features: ['AI-powered personalized study planning','Rule-based scheduling algorithm','Smart task prioritization'],
        tech: [{ label: 'Python', icon: '🐍' },{ label: 'FastAPI', icon: '⚡' },{ label: 'OpenAI API', icon: '🤖' }],
        labels: [],
        desktop: { bg: '#0d0814', accent: '#a855f7' },
        mobile: { bg: '#120a1a', accent: '#a855f7', label: 'Study Plan' },
        images: { desktop: '/desktop-nexora.webp', mobile: '/mobile-nexora.webp' },
        live_url: '', github_url: '',
        contributors: [],
    },
    {
        id: 2, title: 'LevelUp.dev', category: 'EdTech Platform', color: '#38bdf8',
        description: 'LevelUp.dev is a full-stack online learning platform where students can browse, enroll in, and complete structured development courses.',
        features: ['Course discovery and enrollment system','Structured learning modules','Student progress tracking'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'Node.js', icon: '🟢' },{ label: 'MongoDB', icon: '🍃' }],
        labels: [],
        desktop: { bg: '#03111a', accent: '#38bdf8' },
        mobile: { bg: '#051520', accent: '#38bdf8', label: 'My Courses' },
        images: { desktop: '/desktop-levelup.webp', mobile: '/mobile-levelup.webp' },
        live_url: '', github_url: '',
        contributors: [],
    },
    {
        id: 3, title: 'AI Resume Analyzer', category: 'AI Tool', color: '#e2e8f0',
        description: 'An AI-powered tool that analyzes resumes and provides actionable insights to improve job readiness.',
        features: ['Resume analysis against job descriptions','Keyword optimization suggestions','Structure and formatting feedback'],
        tech: [{ label: 'React', icon: '⚛' },{ label: 'OpenAI API', icon: '🤖' },{ label: 'Node.js', icon: '🟢' }],
        labels: [],
        desktop: { bg: '#0a0a0a', accent: '#94a3b8' },
        mobile: { bg: '#111', accent: '#94a3b8', label: 'Analyze Resume' },
        images: { desktop: '/desktop-resume.webp', mobile: '/mobile-resume.webp' },
        live_url: '', github_url: '',
        contributors: [],
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
        labels: Array.isArray(row.labels) ? row.labels : [],
        desktop: { bg: row.desktop_bg || '#0a0a0a', accent: row.desktop_accent || row.color || '#a855f7' },
        mobile: { bg: row.mobile_bg || '#0a0a0a', accent: row.mobile_accent || row.color || '#a855f7', label: row.mobile_label || '' },
        images: { desktop: row.image_desktop || '', mobile: row.image_mobile || '' },
        live_url: row.live_url || '',
        github_url: row.github_url || '',
        contributors: Array.isArray(row.contributors) ? row.contributors : [],
    };
}

/* ─── Projects hook ─────────────────────────────────────────────────────── */
function useProjects() {
    const [PROJECTS, setProjects] = useState(FALLBACK_PROJECTS);
    useEffect(() => {
        // Try to fetch with contributors join; fall back to simple fetch if table doesn't exist
        supabase
            .from('projects')
            .select('*, contributors(*)')
            .eq('is_visible', true)
            .order('sort_order')
            .then(({ data, error }) => {
                if (error) {
                    // contributors table may not exist yet — fetch without join
                    supabase
                        .from('projects')
                        .select('*')
                        .eq('is_visible', true)
                        .order('sort_order')
                        .then(({ data: d2 }) => {
                            if (d2 && d2.length > 0) setProjects(d2.map(mapRow));
                        });
                } else if (data && data.length > 0) {
                    setProjects(data.map(mapRow));
                }
            });
    }, []);
    return PROJECTS;
}

/* ─── Injected CSS ──────────────────────────────────────────────────────── */
const injectStyles = `
  

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

  /* Action buttons */
  .proj-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    outline: none;
    white-space: nowrap;
  }
  .proj-btn-live {
    background: white;
    color: #000;
  }
  .proj-btn-live:hover {
    background: rgba(255,255,255,0.88);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,255,255,0.15);
  }
  .proj-btn-github {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.14);
  }
  .proj-btn-github:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.28);
    transform: translateY(-1px);
  }

  /* Contributor avatar */
  .contrib-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.6);
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
    background: #1a1a1a;
  }
  .contrib-avatar:hover {
    transform: scale(1.15) translateY(-3px);
    border-color: rgba(255,255,255,0.4);
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    z-index: 10;
  }
  .contrib-avatar-fallback {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.6);
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #6366f1, #a855f7);
  }
  .contrib-avatar-fallback:hover {
    transform: scale(1.15) translateY(-3px);
    border-color: rgba(255,255,255,0.4);
  }

  /* Contributor popup */
  .contrib-popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .contrib-popup-card {
    background: #111;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
    padding: 32px;
    max-width: 380px;
    width: 100%;
    position: relative;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
  }
  .contrib-popup-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: background 0.2s, color 0.2s;
  }
  .contrib-popup-close:hover {
    background: rgba(255,255,255,0.12);
    color: white;
  }
  .contrib-social-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
  }
  .contrib-social-link:hover {
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.22);
    color: white;
    transform: translateY(-1px);
  }

  /* Mobile project cards */
  .mobile-project-card {
    background: #0a0a0a;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    overflow: hidden;
    transition: border-color 0.3s, background 0.3s;
  }
  .mobile-project-card:hover {
    border-color: rgba(255,255,255,0.15);
    background: #111;
  }

  /* Mobile expand button */
  .mobile-expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 11px;
    background: rgba(255,255,255,0.04);
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.45);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .mobile-expand-btn:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.75);
  }
  .mobile-expand-btn svg {
    transition: transform 0.3s ease;
  }
  .mobile-expand-btn.expanded svg {
    transform: rotate(180deg);
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
                <div style={{ aspectRatio: '1536 / 1100', width: '100%', overflow: 'hidden' }}>
                    <img
                        src={imgSrc}
                        alt={`${project.title} desktop`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        draggable={false}
                    />
                </div>
            ) : (
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
                <>
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

/* ─── Label Pill ─────────────────────────────────────────────────────────── */
function LabelPill({ label, color }) {
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 999,
            background: `${color}18`,
            border: `1px solid ${color}35`,
            color: color,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "'Inter',sans-serif",
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
        }}>
            {label}
        </span>
    );
}

/* ─── Action Buttons ────────────────────────────────────────────────────── */
function ActionButtons({ project }) {
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {project.live_url && (
                <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="proj-btn proj-btn-live"
                    aria-label={`Preview ${project.title} live`}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Preview Live
                </a>
            )}
            {project.github_url && (
                <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="proj-btn proj-btn-github"
                    aria-label={`View ${project.title} on GitHub`}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    GitHub
                </a>
            )}
        </div>
    );
}

/* ─── Contributor Popup ─────────────────────────────────────────────────── */
const SOCIAL_ICONS = {
    github: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    ),
    linkedin: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
    portfolio: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    twitter: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    instagram: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    ),
};

function ContributorPopup({ contributor, color, onClose }) {
    const socials = contributor.social_links || {};
    const socialEntries = Object.entries(socials).filter(([, url]) => url);

    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                className="contrib-popup-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="contrib-popup-card"
                    initial={{ opacity: 0, scale: 0.88, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 20 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ borderTop: `3px solid ${color}` }}
                >
                    <button className="contrib-popup-close" onClick={onClose} aria-label="Close">✕</button>

                    {/* Profile */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                        {contributor.image_url ? (
                            <img
                                src={contributor.image_url}
                                alt={contributor.name}
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: `3px solid ${color}`,
                                    boxShadow: `0 0 0 4px ${color}28, 0 12px 40px rgba(0,0,0,0.6)`,
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${color}, ${color}88)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 28, fontWeight: 700, color: 'white',
                                border: `3px solid ${color}`,
                                boxShadow: `0 0 0 4px ${color}28, 0 12px 40px rgba(0,0,0,0.6)`,
                            }}>
                                {contributor.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>
                                {contributor.name}
                            </div>
                            {contributor.role && (
                                <div style={{
                                    display: 'inline-block',
                                    fontSize: 11, fontWeight: 600,
                                    padding: '3px 10px', borderRadius: 999,
                                    background: `${color}18`, color: color,
                                    border: `1px solid ${color}30`,
                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                }}>
                                    {contributor.role}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {contributor.bio && (
                        <p style={{
                            fontSize: 13, color: 'rgba(255,255,255,0.52)',
                            lineHeight: 1.72, textAlign: 'center',
                            marginBottom: 24, padding: '0 4px',
                        }}>
                            {contributor.bio}
                        </p>
                    )}

                    {/* Social links */}
                    {socialEntries.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                            {socialEntries.map(([platform, url]) => (
                                <a
                                    key={platform}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contrib-social-link"
                                >
                                    {SOCIAL_ICONS[platform] || '🔗'}
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </a>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/* ─── Contributors Row ──────────────────────────────────────────────────── */
function ContributorsRow({ contributors, color }) {
    const [activeContributor, setActiveContributor] = useState(null);

    if (!contributors || contributors.length === 0) return null;

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {contributors.map((c, i) => (
                        <div
                            key={c.id || i}
                            style={{ marginLeft: i > 0 ? -10 : 0, zIndex: contributors.length - i, position: 'relative' }}
                            title={c.name}
                            onClick={() => setActiveContributor(c)}
                        >
                            {c.image_url ? (
                                <img
                                    src={c.image_url}
                                    alt={c.name}
                                    className="contrib-avatar"
                                    style={{ boxShadow: `0 0 0 2px ${color}60` }}
                                />
                            ) : (
                                <div
                                    className="contrib-avatar-fallback"
                                    style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 0 0 2px ${color}60` }}
                                >
                                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    {contributors.length === 1
                        ? '1 contributor'
                        : `${contributors.length} contributors`}
                </span>
            </div>

            {activeContributor && (
                <ContributorPopup
                    contributor={activeContributor}
                    color={color}
                    onClose={() => setActiveContributor(null)}
                />
            )}
        </>
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

/* ─── Mobile Card ───────────────────────────────────────────────────────── */
function MobileProjectCard({ project, index, total }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            className="mobile-project-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Color accent top bar */}
            <div style={{ height: 3, background: project.color, width: '100%' }} />

            <div style={{ padding: '24px 20px 0' }}>
                {/* Category + number */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
                        {project.category}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em' }}>
                        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </span>
                </div>

                {/* Color line + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 2.5, background: project.color, borderRadius: 2, flexShrink: 0 }} />
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
                        {project.title}
                    </h3>
                </div>

                {/* Desktop image */}
                {project.images?.desktop && (
                    <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img
                            src={project.images.desktop}
                            alt={`${project.title} preview`}
                            style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
                        />
                    </div>
                )}

                {/* Description */}
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, marginBottom: 16 }}>
                    {project.description}
                </p>

                {/* Labels */}
                {project.labels && project.labels.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {project.labels.map((lbl, li) => (
                            <LabelPill key={li} label={typeof lbl === 'string' ? lbl : lbl.label} color={project.color} />
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ marginBottom: 16 }}>
                    <ActionButtons project={project} />
                </div>

                {/* Contributors */}
                {project.contributors && project.contributors.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <ContributorsRow contributors={project.contributors} color={project.color} />
                    </div>
                )}
            </div>

            {/* Expand toggle */}
            <button
                className={`mobile-expand-btn ${expanded ? 'expanded' : ''}`}
                onClick={() => setExpanded(p => !p)}
                aria-expanded={expanded}
            >
                {expanded ? 'Show less' : 'Show details'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '20px 20px 24px' }}>
                            {/* Features */}
                            {project.features && project.features.length > 0 && (
                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', fontWeight: 600, marginBottom: 10 }}>
                                        Features
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {project.features.map((feat, fi) => (
                                            <div key={fi} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                <SparkIcon color={project.color} />
                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tech stack */}
                            {project.tech && project.tech.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', fontWeight: 600, marginBottom: 10 }}>
                                        Tech Stack
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {project.tech.map(({ label, icon }) => (
                                            <TechPill key={label} icon={icon} label={label} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
                    {PROJECTS.map((proj, i) => (
                        <MobileProjectCard
                            key={proj.id}
                            project={proj}
                            index={i}
                            total={PROJECTS.length}
                        />
                    ))}
                </div>
            </div>

            {/* ───────── DESKTOP: Sticky scroll showcase ───────── */}
            <div
                className="projects-sticky-section"
                ref={wrapperRef}
                style={{ height: `${(PROJECTS.length + 1) * 100}vh`, position: 'relative' }}
            >
                {/* Sticky panel */}
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

                        {/* Scroll hint */}
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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

                                    {/* Labels */}
                                    {project.labels && project.labels.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                            {project.labels.map((lbl, li) => (
                                                <LabelPill key={li} label={typeof lbl === 'string' ? lbl : lbl.label} color={project.color} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <p style={{
                                        fontSize: 13, color: 'rgba(255,255,255,0.42)',
                                        lineHeight: 1.82, marginBottom: 20, maxWidth: 400,
                                    }}>
                                        {project.description}
                                    </p>

                                    {/* Features */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
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
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
                                        {project.tech.map(({ label, icon }) => (
                                            <TechPill key={label} icon={icon} label={label} />
                                        ))}
                                    </div>

                                    {/* Action buttons */}
                                    <div style={{ marginBottom: 20 }}>
                                        <ActionButtons project={project} />
                                    </div>

                                    {/* Contributors */}
                                    <ContributorsRow contributors={project.contributors} color={project.color} />
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
