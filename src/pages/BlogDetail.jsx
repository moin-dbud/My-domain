import { useEffect, useState, useReducer, useMemo } from 'react';
import { useParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { supabase } from '../lib/supabase';
import { useFloodNavigate } from '../components/PageTransition';
import Footer from '../components/Footer';

/* ─── Configure marked ──────────────────────────────────────────── */
marked.setOptions({ breaks: true, gfm: true });

/* ─── Injected Styles ──────────────────────────────────────────── */
const blogDetailStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@900&display=swap');

  .blog-prose {
    font-family: 'Lora', Georgia, 'Times New Roman', serif;
    font-size: clamp(16px, 1.8vw, 18.5px);
    line-height: 1.85;
    color: rgba(255,255,255,0.82);
    letter-spacing: 0.01em;
  }
  .blog-prose p {
    margin: 0 0 1.6em 0;
  }
  .blog-prose h2 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(20px, 2.5vw, 26px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 2em 0 0.7em;
    line-height: 1.3;
  }
  .blog-prose h3 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(17px, 2vw, 21px);
    font-weight: 600;
    letter-spacing: -0.015em;
    color: rgba(255,255,255,0.9);
    margin: 1.6em 0 0.6em;
    line-height: 1.35;
  }
  .blog-prose h4 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(15px, 1.7vw, 18px);
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    margin: 1.4em 0 0.5em;
  }
  .blog-prose a {
    color: rgba(255,255,255,0.9);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: rgba(255,255,255,0.25);
    transition: color 0.2s, text-decoration-color 0.2s;
  }
  .blog-prose a:hover {
    color: #fff;
    text-decoration-color: rgba(255,255,255,0.6);
  }
  .blog-prose strong, .blog-prose b {
    color: #fff;
    font-weight: 700;
  }
  .blog-prose em, .blog-prose i {
    font-style: italic;
    color: rgba(255,255,255,0.75);
  }
  .blog-prose ul, .blog-prose ol {
    margin: 0 0 1.5em 0;
    padding-left: 1.6em;
  }
  .blog-prose li {
    margin-bottom: 0.5em;
    color: rgba(255,255,255,0.8);
  }
  .blog-prose blockquote {
    border-left: 3px solid rgba(255,255,255,0.18);
    margin: 2em 0;
    padding: 0.8em 1.4em;
    background: rgba(255,255,255,0.03);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: rgba(255,255,255,0.6);
  }
  .blog-prose blockquote p { margin: 0; }
  .blog-prose code {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.87em;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 5px;
    padding: 0.15em 0.42em;
    color: rgba(255,255,255,0.88);
  }
  .blog-prose pre {
    background: #111;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 1.4em 1.6em;
    overflow-x: auto;
    margin: 1.6em 0;
  }
  .blog-prose pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.9em;
    color: rgba(255,255,255,0.8);
  }
  .blog-prose img {
    max-width: 100%;
    border-radius: 12px;
    margin: 1.6em 0;
    display: block;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .blog-prose hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin: 2.5em 0;
  }
  .blog-prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.6em 0;
    font-size: 0.9em;
    font-family: 'Inter', sans-serif;
  }
  .blog-prose th {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.8);
    font-weight: 600;
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .blog-prose td {
    padding: 10px 14px;
    color: rgba(255,255,255,0.7);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  /* ── Skeleton shimmer ── */
  @keyframes shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .blog-skeleton-line {
    border-radius: 6px;
    background: linear-gradient(90deg, #111 25%, #1c1c1c 50%, #111 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  /* ── Tag colours ── */
  .blog-tag-ai       { background: rgba(74,222,128,0.1);  color: #4ade80; border: 1px solid rgba(74,222,128,0.2);  }
  .blog-tag-engineering { background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
  .blog-tag-design   { background: rgba(249,115,22,0.1);  color: #f97316; border: 1px solid rgba(249,115,22,0.2);  }
  .blog-tag-career   { background: rgba(167,139,250,0.1); color: #a78bfa; border: 1px solid rgba(167,139,250,0.2); }
  .blog-tag-startup  { background: rgba(250,204,21,0.1);  color: #facc15; border: 1px solid rgba(250,204,21,0.2);  }
  .blog-tag-default  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.1); }

  /* ── Back button ── */
  .blog-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.38);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    letter-spacing: 0.01em;
    transition: color 0.2s;
  }
  .blog-back-btn:hover { color: rgba(255,255,255,0.75); }

  /* ── Share button ── */
  .blog-share-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 999px;
    padding: 7px 16px;
    cursor: pointer;
    transition: background 0.22s, border-color 0.22s, color 0.22s;
  }
  .blog-share-btn:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.22);
    color: #fff;
  }

  /* ── Author social icons ── */
  .author-social-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s;
    background: rgba(255,255,255,0.04);
    flex-shrink: 0;
  }
  .author-social-icon:hover {
    color: rgba(255,255,255,0.9);
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.09);
    transform: scale(1.1);
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .blog-meta-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
    .blog-meta-actions { flex-wrap: wrap; }
    .blog-author-card { flex-direction: column !important; gap: 16px !important; padding: 22px 20px !important; }
    .blog-author-bio { max-width: 100% !important; }
    .blog-author-links { flex-wrap: wrap; gap: 10px; }
  }
`;

/* ─── SVG Icons ─────────────────────────────────────────────────── */
const ArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);
const TelegramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

/* ─── Tag CSS class helper ──────────────────────────────────────── */
function tagClass(tag) {
  const map = { AI: 'ai', Engineering: 'engineering', Design: 'design', Career: 'career', Startup: 'startup' };
  return `blog-tag-${map[tag] ?? 'default'}`;
}

/* ─── Skeleton Loading ──────────────────────────────────────────── */
function BlogSkeleton() {
  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 24px' }}>
      {/* Title skeleton */}
      <div className="blog-skeleton-line" style={{ height: 60, marginBottom: 16, width: '95%' }} />
      <div className="blog-skeleton-line" style={{ height: 60, marginBottom: 16, width: '82%' }} />
      <div className="blog-skeleton-line" style={{ height: 60, marginBottom: 32, width: '60%' }} />
      {/* Subtitle */}
      <div className="blog-skeleton-line" style={{ height: 22, marginBottom: 10, width: '90%' }} />
      <div className="blog-skeleton-line" style={{ height: 22, marginBottom: 40, width: '72%' }} />
      {/* Meta */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <div className="blog-skeleton-line" style={{ height: 16, width: 120, borderRadius: 4 }} />
        <div className="blog-skeleton-line" style={{ height: 16, width: 80, borderRadius: 4 }} />
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />
      {/* Body lines */}
      {[100, 94, 100, 88, 76, 100, 90, 62].map((w, i) => (
        <div key={i} className="blog-skeleton-line" style={{ height: 18, marginBottom: 14, width: `${w}%` }} />
      ))}
    </div>
  );
}

/* ─── Author Card ────────────────────────────────────────────────── */
function AuthorCard() {
  const socials = [
    { icon: <GithubIcon />, href: 'https://github.com/moin-dbud', label: 'GitHub' },
    { icon: <LinkedinIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <XIcon />, href: 'https://twitter.com', label: 'X' },
    { icon: <TelegramIcon />, href: 'https://t.me', label: 'Telegram' },
    { icon: <InstagramIcon />, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="blog-author-card"
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: '28px 32px',
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        marginTop: 64,
        marginBottom: 20,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 68,
        height: 68,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.12)',
        background: '#1a1a1a',
      }}>
        <img
          src="/cropped_circle_image.webp"
          alt="Moin Sheikh"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.style.display = 'flex';
            e.currentTarget.parentElement.style.alignItems = 'center';
            e.currentTarget.parentElement.style.justifyContent = 'center';
            e.currentTarget.parentElement.textContent = 'M';
            e.currentTarget.parentElement.style.fontSize = '24px';
            e.currentTarget.parentElement.style.fontWeight = '700';
            e.currentTarget.parentElement.style.color = 'rgba(255,255,255,0.6)';
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <p style={{
          margin: '0 0 8px 0',
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}>
          Author{' '}
          <strong style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontSize: 15 }}>
            Moin Sheikh
          </strong>
        </p>

        {/* Bio */}
        <p style={{
          margin: '0 0 16px 0',
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.65,
          fontWeight: 400,
          maxWidth: 420,
        }}>
          Full-Stack Developer, Freelancer, &amp; Founder. Obsessed with crafting
          pixel-perfect, high-performance web experiences that feel alive.
        </p>

        {/* Links row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <a
            href="/about"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: '#e879a0',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            More about me →
          </a>

          {/* Social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {socials.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="author-social-icon"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Not Found ─────────────────────────────────────────────────── */
function BlogNotFound() {
  const { floodNavigate } = useFloodNavigate();
  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      fontFamily: "'Inter', sans-serif",
    }}>
      <p style={{ fontSize: 80, margin: 0 }}>📄</p>
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
        Blog not found
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: 0 }}>
        This article may have been removed or the link is incorrect.
      </p>
      <button
        className="blog-share-btn"
        style={{ marginTop: 8 }}
        onClick={(e) => floodNavigate('/blogs', e)}
      >
        ← Back to all blogs
      </button>
    </div>
  );
}

/* ─── Main BlogDetail Component ─────────────────────────────────── */
export default function BlogDetail() {
  const { slug } = useParams();
  const { floodNavigate } = useFloodNavigate();
  const [state, dispatch] = useReducer(
    (prev, action) => {
      switch (action.type) {
        case 'LOADING': return { blog: null, loading: true, notFound: false };
        case 'SUCCESS': return { blog: action.blog, loading: false, notFound: false };
        case 'NOT_FOUND': return { blog: null, loading: false, notFound: true };
        default: return prev;
      }
    },
    { blog: null, loading: true, notFound: false }
  );
  const { blog, loading, notFound } = state;

  /* Parse markdown → HTML (re-runs only when blog object changes) */
  const parsedContent = useMemo(() => {
    if (!blog || !blog.content) return '';
    return marked.parse(blog.content);
  }, [blog]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    dispatch({ type: 'LOADING' });

    const isNumeric = /^\d+$/.test(slug);
    const query = isNumeric
      ? supabase.from('blogs').select('*').eq('id', slug).single()
      : supabase.from('blogs').select('*').eq('slug', slug).single();

    query.then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) {
        dispatch({ type: 'NOT_FOUND' });
      } else {
        document.title = `${data.title} | Moin Sheikh`;
        dispatch({ type: 'SUCCESS', blog: data });
      }
    });

    return () => { cancelled = true; };
  }, [slug]);

  /* Share handler */
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: blog?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  };

  /* ── Format date ── */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return dateStr; }
  };

  return (
    <>
      <style>{blogDetailStyles}</style>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>


        {/* ── Content ── */}
        {loading ? (
          <div style={{ paddingTop: 40, paddingBottom: 120 }}>
            <BlogSkeleton />
          </div>
        ) : notFound ? (
          <BlogNotFound />
        ) : (
          <article>
            {/* ── Hero Section ── */}
            <header style={{
              maxWidth: 900,
              margin: '0 auto',
              padding: 'clamp(48px, 8vw, 96px) 24px 0',
            }}>

              {/* Tag badge */}
              {blog.tag && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: 20 }}
                >
                  <span
                    className={tagClass(blog.tag)}
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 12px',
                      borderRadius: 999,
                    }}
                  >
                    {blog.tag}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(30px, 5vw, 58px)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: '#fff',
                  margin: '0 0 24px 0',
                }}
              >
                {blog.title}
              </motion.h1>

              {/* Description / subtitle */}
              {blog.description && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.65,
                    margin: '0 0 36px 0',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    maxWidth: 680,
                  }}
                >
                  {blog.description}
                </motion.p>
              )}

              {/* ── Divider + Meta Row ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.18 }}
              >
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 22 }} />

                <div
                  className="blog-meta-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 22,
                  }}
                >
                  {/* Left: date + views + reading time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                    {blog.date && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, color: 'rgba(255,255,255,0.38)',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        <CalendarIcon />
                        {formatDate(blog.date)}
                      </span>
                    )}
                    {blog.views != null && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, color: 'rgba(255,255,255,0.3)',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase',
                      }}>
                        <EyeIcon />
                        {blog.views.toLocaleString()} Views
                      </span>
                    )}
                    {blog.reading_time && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, color: 'rgba(255,255,255,0.3)',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase',
                      }}>
                        <ClockIcon />
                        {blog.reading_time}
                      </span>
                    )}
                  </div>

                  {/* Right: action buttons */}
                  <div className="blog-meta-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="blog-share-btn" onClick={handleShare} aria-label="Share">
                      <ShareIcon />
                      {copied ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 52 }} />
              </motion.div>
            </header>

            {/* ── Article body ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
              style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}
            >
              {parsedContent ? (
                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{ __html: parsedContent }}
                />
              ) : (
                <p className="blog-prose" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                  No content available for this blog post yet.
                </p>
              )}

              {/* ── End divider ── */}
              <div style={{
                height: 1,
                background: 'rgba(255,255,255,0.07)',
                marginTop: 64,
              }} />

              {/* ── Author Card ── */}
              <AuthorCard />

              {/* ── Back to blogs ── */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 80px' }}>
                <button
                  className="blog-back-btn"
                  onClick={(e) => floodNavigate('/blogs', e)}
                  style={{ fontSize: 14, gap: 8 }}
                >
                  <ArrowLeft />
                  Back to all blogs
                </button>
              </div>
            </motion.div>
          </article>
        )}

        <Footer />
      </main>
    </>
  );
}
