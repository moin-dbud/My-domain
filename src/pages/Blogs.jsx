import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFloodNavigate } from '../components/PageTransition';
import PageHero from '../components/PageHero';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import JsonLd from '../components/JsonLd';

/* ─── Tag colour map ─────────────────────────────────────────── */
const TAG_COLORS = {
    AI:          { bg: 'rgba(74,222,128,0.08)',  color: '#4ade80', border: 'rgba(74,222,128,0.2)'  },
    Engineering: { bg: 'rgba(96,165,250,0.08)',  color: '#60a5fa', border: 'rgba(96,165,250,0.2)'  },
    Design:      { bg: 'rgba(249,115,22,0.08)',  color: '#f97316', border: 'rgba(249,115,22,0.2)'  },
    Career:      { bg: 'rgba(167,139,250,0.08)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
    Startup:     { bg: 'rgba(250,204,21,0.08)',  color: '#facc15', border: 'rgba(250,204,21,0.2)'  },
};
const defaultTag = { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.08)' };

/* ─── Single Blog Card ───────────────────────────────────────── */
function BlogCard({ blog, index }) {
    const { floodNavigate } = useFloodNavigate();
    const tag = TAG_COLORS[blog.tag] ?? defaultTag;

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => floodNavigate(`/blog/${blog.slug}`, e)}
            onKeyDown={(e) => e.key === 'Enter' && floodNavigate(`/blog/${blog.slug}`, e)}
            role="button"
            tabIndex={0}
            aria-label={`Read: ${blog.title}`}
            style={{
                background: '#0a0a0a',
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '28px 28px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
                e.currentTarget.style.background = '#111111';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = '#0a0a0a';
                e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
            }}
            onBlur={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Subtle top gradient line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
            }} />

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em', fontWeight: 400 }}>
                    {blog.date}&nbsp;·&nbsp;{blog.reading_time}
                </span>
                <span style={{
                    fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: 999,
                    background: tag.bg, color: tag.color,
                    border: `1px solid ${tag.border}`,
                }}>
                    {blog.tag}
                </span>
            </div>

            {/* Title */}
            <h2 style={{
                margin: 0,
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                fontWeight: 700,
                lineHeight: 1.38,
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '-0.02em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
            }}>
                {blog.title}
            </h2>

            {/* Description */}
            <p style={{
                margin: 0,
                fontSize: 13.5,
                lineHeight: 1.72,
                color: 'rgba(255,255,255,0.38)',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flex: 1,
            }}>
                {blog.description}
            </p>

            {/* Read arrow */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 4,
                fontSize: 12, fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
            }}>
                Read article
                <span style={{ fontSize: 14 }}>→</span>
            </div>
        </motion.article>
    );
}

/* ─── Pagination Bar ─────────────────────────────────────────── */
function Pagination({ current, total, onChange }) {
    if (total <= 1) return null;

    /* Build page list with ellipsis */
    const pages = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            pages.push(i);
        } else if (
            (i === current - 2 && current > 3) ||
            (i === current + 2 && current < total - 2)
        ) {
            pages.push('…');
        }
    }

    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 38, height: 38, borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
        transition: 'background 0.18s, border-color 0.18s, color 0.18s',
        padding: '0 14px',
        userSelect: 'none',
        letterSpacing: '-0.01em',
    };
    const active = { ...base, background: 'rgba(255,255,255,0.9)', borderColor: 'transparent', color: '#000', fontWeight: 700, cursor: 'default' };
    const disabled = { ...base, opacity: 0.22, cursor: 'not-allowed', pointerEvents: 'none' };

    const hover = (e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.88)';
    };
    const unhover = (e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 64, flexWrap: 'wrap' }}
        >
            {/* Prev */}
            <button
                id="blogs-prev-btn"
                style={current === 1 ? disabled : base}
                onClick={() => onChange(current - 1)}
                onMouseEnter={hover} onMouseLeave={unhover}
                aria-label="Previous page"
            >
                ← Prev
            </button>

            {/* Page numbers */}
            {pages.map((p, i) =>
                p === '…'
                    ? <span key={`ellipsis-${i}`} style={{ ...base, cursor: 'default', pointerEvents: 'none', border: 'none', background: 'none', color: 'rgba(255,255,255,0.18)' }}>…</span>
                    : <button
                        key={p}
                        id={`blogs-page-${p}`}
                        style={p === current ? active : base}
                        onClick={() => p !== current && onChange(p)}
                        onMouseEnter={p !== current ? hover : undefined}
                        onMouseLeave={p !== current ? unhover : undefined}
                        aria-current={p === current ? 'page' : undefined}
                    >
                        {p}
                    </button>
            )}

            {/* Next */}
            <button
                id="blogs-next-btn"
                style={current === total ? disabled : base}
                onClick={() => onChange(current + 1)}
                onMouseEnter={hover} onMouseLeave={unhover}
                aria-label="Next page"
            >
                Next →
            </button>
        </motion.div>
    );
}

/* ─── Blogs Page ─────────────────────────────────────────────── */
const PER_PAGE = 6;

const blogsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moinsheikh.in/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://moinsheikh.in/blogs' },
    ],
};

export default function Blogs() {
    const [blogs, setBlogs]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage]     = useState(1);
    const sectionRef          = useRef(null);

    useSEO({
        title: 'Blog | Moin Sheikh — AI, Engineering & Product Writing',
        description: 'Read articles by Moin Sheikh on AI development, full-stack engineering, product design, and building software that ships. Practical insights from real projects.',
        path: '/blogs',
    });

    useEffect(() => {
        supabase
            .from('blogs')
            .select('*')
            .eq('is_published', true)
            .order('sort_order')
            .then(({ data }) => {
                if (data) setBlogs(data);
                setLoading(false);
                setPage(1);
            });
    }, []);

    const totalPages = Math.ceil(blogs.length / PER_PAGE);
    const visible    = blogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} aria-label="Blog articles by Moin Sheikh">
            <JsonLd schema={blogsSchema} id="json-ld-blogs" />
            <PageHero
                title="BLOGS"
                subtitle="Thoughts on building"
                highlight="AI systems &amp; products."
            />

            <section ref={sectionRef} style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px 120px' }}>

                {/* Count row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, margin: '0 0 36px 0' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.24)', margin: 0 }}
                    >
                        {loading ? '—' : blogs.length} articles
                    </motion.p>

                    {!loading && totalPages > 1 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', margin: 0 }}
                        >
                            Page {page} of {totalPages}
                        </motion.p>
                    )}
                </div>

                <style>{`
                    @media (max-width: 1024px) { .blogs-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                    @media (max-width: 640px)  { .blogs-grid { grid-template-columns: 1fr !important; } }
                    @keyframes shimmer { from { background-position:-200% 0; } to { background-position:200% 0; } }
                    .blog-skeleton { height:260px; border-radius:18px; background:linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
                `}</style>

                {/* Grid */}
                <div className="blogs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {loading
                        ? [1,2,3,4,5,6].map(i => <div key={i} className="blog-skeleton" />)
                        : visible.map((blog, i) => <BlogCard key={blog.slug || blog.id} blog={blog} index={i} />)
                    }
                </div>

                {/* Pagination */}
                {!loading && (
                    <Pagination
                        current={page}
                        total={totalPages}
                        onChange={handlePageChange}
                    />
                )}
            </section>

            <Footer />
        </main>
    );
}
