import { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

/* ─── Injected global styles ──────────────────────────────────── */
const labStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital@1&family=Montserrat:wght@900&display=swap');
  * { box-sizing: border-box; }

  @keyframes lab-shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .lab-skeleton {
    background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
    background-size: 200% 100%;
    animation: lab-shimmer 1.4s infinite;
    border-radius: 18px;
    height: 260px;
  }

  /* Filter pills */
  .lab-filter-btn {
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
    letter-spacing: 0.02em;
    font-family: 'Inter', sans-serif;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: rgba(255,255,255,0.35);
    outline: none;
  }
  .lab-filter-btn:hover {
    color: rgba(255,255,255,0.7);
    border-color: rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.04);
  }
  .lab-filter-btn.active {
    background: rgba(255,255,255,0.07);
    color: white;
    border-color: rgba(255,255,255,0.2);
  }

  /* Card hover */
  .lab-card {
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    outline: none;
  }
  .lab-card:hover {
    transform: translateY(-6px);
    border-color: rgba(255,255,255,0.16) !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    background: #111111 !important;
  }

  /* Reaction buttons */
  .lab-react-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 12.5px;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
    font-family: 'Inter', sans-serif;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.4);
    outline: none;
  }
  .lab-react-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.16);
    color: white;
  }
  .lab-react-btn.reacted {
    background: rgba(250,204,21,0.08);
    border-color: rgba(250,204,21,0.22);
    color: #facc15;
  }

  /* Search input */
  .lab-search {
    width: 100%;
    padding: 11px 16px 11px 42px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: white;
    font-size: 13.5px;
    outline: none;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.22s, background 0.22s;
    letter-spacing: -0.01em;
  }
  .lab-search::placeholder { color: rgba(255,255,255,0.22); }
  .lab-search:focus {
    border-color: rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.06);
  }

  /* Action links */
  .lab-link {
    padding: 5px 13px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.22s;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .lab-link-primary {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.7);
  }
  .lab-link-primary:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.22);
    color: white;
  }
  .lab-link-ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.35);
  }
  .lab-link-ghost:hover {
    border-color: rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.6);
  }
  .lab-link-green {
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.22);
    color: #4ade80;
  }
  .lab-link-green:hover {
    background: rgba(74,222,128,0.14);
    border-color: rgba(74,222,128,0.35);
  }

  /* Responsive grid */
  @media (max-width: 1024px) { .lab-grid { grid-template-columns: repeat(2,1fr) !important; } }
  @media (max-width: 640px)  { .lab-grid { grid-template-columns: 1fr !important; } }
  @media (max-width: 900px)  { .lab-section { padding: 0 24px 120px !important; } }
  @media (max-width: 600px)  { .lab-section { padding: 0 16px 80px !important; } }
`;

/* ─── Type / Status colour system ─────────────────────────────── */
const TYPE_COLORS = {
  'VS Code Extension': { bg: 'rgba(0,120,212,0.10)',  border: 'rgba(0,120,212,0.28)',  text: '#60a5fa' },
  'Browser Extension': { bg: 'rgba(250,165,0,0.10)',  border: 'rgba(250,165,0,0.28)',  text: '#fbbf24' },
  'Tool':              { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)', text: '#4ade80' },
  'Experiment':        { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: '#c084fc' },
};

const STATUS_COLORS = {
  'Live':         { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  text: '#4ade80' },
  'In Progress':  { bg: 'rgba(250,200,50,0.08)',  border: 'rgba(250,200,50,0.22)',  text: '#facc15' },
  'Experimental': { bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.25)', text: '#c084fc' },
  'Archived':     { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', text: 'rgba(255,255,255,0.3)' },
};

const REACTIONS = ['🔥', '❤️', '🚀'];

/* ─── Small helpers ────────────────────────────────────────────── */
function Badge({ text, colors }) {
  if (!text || !colors) return null;
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
      padding: '2px 9px', borderRadius: 999,
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
      fontFamily: "'Inter', sans-serif",
    }}>{text}</span>
  );
}

function Tag({ text }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 999,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
      color: 'rgba(255,255,255,0.38)', fontWeight: 500, fontFamily: "'Inter', sans-serif",
    }}>{text}</span>
  );
}

/* ─── Featured Card ────────────────────────────────────────────── */
function FeaturedCard({ item, onExpand, reactions, onReact, userReactions }) {
  const tc = TYPE_COLORS[item.type]    || TYPE_COLORS['Experiment'];
  const sc = STATUS_COLORS[item.status] || STATUS_COLORS['Experimental'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onExpand(item)}
      style={{
        position: 'relative', padding: 'clamp(20px, 5vw, 40px) clamp(16px, 5vw, 40px)', borderRadius: 24, cursor: 'pointer',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.07) 0%, rgba(10,10,10,0.98) 60%)',
        border: '1px solid rgba(168,85,247,0.18)', marginBottom: 40, overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      whileHover={{ borderColor: 'rgba(168,85,247,0.35)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
    >
      {/* Ambient purple glow */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 360, height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Featured label */}
      <div style={{
        position: 'absolute', top: 22, right: 28,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#c084fc', background: 'rgba(168,85,247,0.10)',
        border: '1px solid rgba(168,85,247,0.2)', borderRadius: 999, padding: '3px 10px',
        fontFamily: "'Inter', sans-serif",
      }}>⭐ Featured</div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(14px, 4vw, 28px)', position: 'relative', flexWrap: 'wrap' }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18, flexShrink: 0,
          background: tc.bg, border: `1px solid ${tc.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{item.icon || '🧪'}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <Badge text={item.type}   colors={tc} />
            <Badge text={item.status} colors={sc} />
            {item.is_late_night && <Badge text="🌙 Built Late Night" colors={{ bg: 'rgba(30,30,60,0.5)', border: 'rgba(80,80,160,0.3)', text: '#818cf8' }} />}
          </div>

          <h2 style={{
            fontSize: 'clamp(20px, 2.4vw, 26px)', fontWeight: 700, color: 'white',
            letterSpacing: '-0.03em', lineHeight: 1.24, margin: '0 0 10px',
            fontFamily: "'Inter', sans-serif",
          }}>{item.title}</h2>

          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
            margin: '0 0 16px', maxWidth: 520, fontFamily: "'Inter', sans-serif",
          }}>{item.description}</p>

          {item.dev_note && (
            <p style={{
              fontSize: 12.5, color: 'rgba(168,85,247,0.65)', fontStyle: 'italic',
              margin: '0 0 16px', fontFamily: "'Playfair Display', serif",
            }}>💬 {item.dev_note}</p>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(item.tags || []).map(t => <Tag key={t} text={t} />)}
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 26, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap', gap: 12,
      }}>
        {/* Reactions */}
        <div style={{ display: 'flex', gap: 7 }}>
          {REACTIONS.map(r => (
            <button key={r} className={`lab-react-btn${userReactions[item.id] === r ? ' reacted' : ''}`}
              onClick={e => { e.stopPropagation(); onReact(item.id, r); }}>
              {r} <span style={{ fontSize: 11 }}>{reactions[item.id]?.[r] || 0}</span>
            </button>
          ))}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 8 }}>
          {item.link_install && (
            <a href={item.link_install} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="lab-link lab-link-green">Install →</a>
          )}
          {item.link_demo && (
            <a href={item.link_demo} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="lab-link lab-link-primary">Try it →</a>
          )}
          {item.link_github && (
            <a href={item.link_github} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="lab-link lab-link-ghost">GitHub</a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Lab Card (grid item) ─────────────────────────────────────── */
function LabCard({ item, index, onExpand, reactions, onReact, userReactions }) {
  const tc = TYPE_COLORS[item.type]    || TYPE_COLORS['Experiment'];
  const sc = STATUS_COLORS[item.status] || STATUS_COLORS['Experimental'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="lab-card"
      onClick={() => onExpand(item)}
      tabIndex={0}
      role="button"
      aria-label={`View ${item.title}`}
      onKeyDown={e => e.key === 'Enter' && onExpand(item)}
      style={{
        padding: '24px 24px 20px', borderRadius: 18,
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Type accent top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, ${tc.text}60, transparent)`,
      }} />

      {/* Header row: icon + status badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6, marginBottom: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: tc.bg, border: `1px solid ${tc.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{item.icon || '🧪'}</div>
        <Badge text={item.status} colors={sc} />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 15.5, fontWeight: 700, color: 'rgba(255,255,255,0.92)',
        letterSpacing: '-0.025em', margin: '0 0 8px', lineHeight: 1.3,
        fontFamily: "'Inter', sans-serif",
      }}>{item.title}</h3>

      {/* Description */}
      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7,
        margin: '0 0 14px', flex: 1,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}>{item.description}</p>

      {/* Dev note (Playfair italic, matches portfolio quotes style) */}
      {item.dev_note && (
        <p style={{
          fontSize: 11.5, color: 'rgba(168,85,247,0.55)', fontStyle: 'italic',
          margin: '0 0 12px', lineHeight: 1.5,
          fontFamily: "'Playfair Display', serif",
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>💬 {item.dev_note}</p>
      )}

      {/* Tags row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
        <Badge text={item.type} colors={tc} />
        {(item.tags || []).slice(0, 2).map(t => <Tag key={t} text={t} />)}
        {item.is_late_night && <Tag text="🌙 Late Night" />}
      </div>

      {/* Footer: reactions + links */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {REACTIONS.map(r => (
            <button key={r} className={`lab-react-btn${userReactions[item.id] === r ? ' reacted' : ''}`}
              style={{ padding: '3px 8px', fontSize: 12 }}
              onClick={e => { e.stopPropagation(); onReact(item.id, r); }}>
              {r} <span style={{ fontSize: 10 }}>{reactions[item.id]?.[r] || 0}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {item.link_demo && (
            <a href={item.link_demo} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="lab-link lab-link-primary" style={{ fontSize: 11.5 }}>Try it</a>
          )}
          {item.link_github && (
            <a href={item.link_github} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="lab-link lab-link-ghost" style={{ fontSize: 11.5 }}>GitHub</a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Expand Modal ─────────────────────────────────────────────── */
function ExpandModal({ item, onClose, reactions, onReact, userReactions }) {
  const tc = TYPE_COLORS[item.type]    || TYPE_COLORS['Experiment'];
  const sc = STATUS_COLORS[item.status] || STATUS_COLORS['Experimental'];

  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 'clamp(20px, 5vw, 36px) clamp(16px, 5vw, 40px)', maxWidth: 640, width: '100%',
          maxHeight: '90vh', overflowY: 'auto', position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1, borderRadius: '24px 24px 0 0',
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)',
        }} />

        {/* Close button */}
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.18s, color 0.18s', outline: 'none',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >✕</button>

        {/* Icon + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16, background: tc.bg,
            border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26, flexShrink: 0,
          }}>{item.icon || '🧪'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            <Badge text={item.type}   colors={tc} />
            <Badge text={item.status} colors={sc} />
            {item.is_late_night && <Badge text="🌙 Built Late Night" colors={{ bg: 'rgba(30,30,60,0.5)', border: 'rgba(80,80,160,0.3)', text: '#818cf8' }} />}
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 26, fontWeight: 700, color: 'white',
          letterSpacing: '-0.035em', margin: '0 0 12px', lineHeight: 1.22,
          fontFamily: "'Inter', sans-serif",
        }}>{item.title}</h2>

        {/* Description */}
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.78, margin: '0 0 22px' }}>
          {item.description}
        </p>

        {/* Problem it solves */}
        {item.problem && (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)', margin: '0 0 10px',
            }}>Problem it solves</p>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.72, margin: 0 }}>
              {item.problem}
            </p>
          </div>
        )}

        {/* Tech stack */}
        {item.tech_stack && item.tech_stack.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)', margin: '0 0 10px',
            }}>Tech Stack</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {item.tech_stack.map(t => (
                <span key={t} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace',
                }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Key features */}
        {item.features && item.features.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)', margin: '0 0 10px',
            }}>Key Features</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {item.features.map((f, i) => (
                <li key={i} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dev note — Playfair italic, matches portfolio quote style */}
        {item.dev_note && (
          <div style={{
            marginBottom: 22, padding: '14px 18px', borderRadius: 12,
            background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.13)',
          }}>
            <p style={{
              fontSize: 13.5, color: 'rgba(200,162,255,0.75)', fontStyle: 'italic',
              margin: 0, lineHeight: 1.7, fontFamily: "'Playfair Display', serif",
            }}>💬 {item.dev_note}</p>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {item.tags.map(t => <Tag key={t} text={t} />)}
          </div>
        )}

        {/* Reactions + Links footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {REACTIONS.map(r => (
              <button key={r} className={`lab-react-btn${userReactions[item.id] === r ? ' reacted' : ''}`}
                onClick={() => onReact(item.id, r)}>
                {r} <span style={{ fontSize: 11.5 }}>{reactions[item.id]?.[r] || 0}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {item.link_install && (
              <a href={item.link_install} target="_blank" rel="noopener noreferrer"
                className="lab-link lab-link-green" style={{ fontSize: 13, padding: '7px 16px', borderRadius: 10 }}>
                Install Extension
              </a>
            )}
            {item.link_demo && (
              <a href={item.link_demo} target="_blank" rel="noopener noreferrer"
                className="lab-link lab-link-primary" style={{ fontSize: 13, padding: '7px 16px', borderRadius: 10 }}>
                Try it →
              </a>
            )}
            {item.link_github && (
              <a href={item.link_github} target="_blank" rel="noopener noreferrer"
                className="lab-link lab-link-ghost" style={{ fontSize: 13, padding: '7px 16px', borderRadius: 10 }}>
                GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function Labs() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTag, setFilterTag]       = useState('All');
  const [expanded, setExpanded]         = useState(null);
  const [reactions, setReactions]       = useState({});
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => { document.title = 'Labs | Moin Sheikh'; }, []);

  /* Fetch labs + reactions */
  useEffect(() => {
    supabase.from('labs').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
    supabase.from('lab_reactions').select('lab_id, emoji, count').then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach(({ lab_id, emoji, count }) => {
        if (!map[lab_id]) map[lab_id] = {};
        map[lab_id][emoji] = count;
      });
      setReactions(map);
    });
    try {
      const stored = JSON.parse(localStorage.getItem('labs_user_reactions') || '{}');
      if (stored && typeof stored === 'object') setUserReactions(stored);
    } catch (_) { /* ignore */ }
  }, []);

  /* Derived filters */
  const allTypes    = useMemo(() => ['All', ...new Set(items.map(i => i.type).filter(Boolean))], [items]);
  const allStatuses = useMemo(() => ['All', ...new Set(items.map(i => i.status).filter(Boolean))], [items]);
  const allTags     = useMemo(() => ['All', ...new Set(items.flatMap(i => i.tags || []))], [items]);

  const featured = useMemo(() => items.find(i => i.is_featured), [items]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(item => {
      if (item.is_featured) return false;
      if (filterType !== 'All'   && item.type !== filterType)     return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterTag !== 'All'    && !(item.tags || []).includes(filterTag)) return false;
      if (q && !item.title?.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, filterType, filterStatus, filterTag]);

  /* Reaction handler */
  async function handleReact(labId, emoji) {
    const prev = userReactions[labId];
    const isSame = prev === emoji;
    setReactions(r => {
      const base = { ...(r[labId] || {}) };
      if (prev) base[prev] = Math.max(0, (base[prev] || 1) - 1);
      if (!isSame) base[emoji] = (base[emoji] || 0) + 1;
      return { ...r, [labId]: base };
    });
    const next = isSame ? null : emoji;
    setUserReactions(u => {
      const n = { ...u, [labId]: next };
      if (!next) delete n[labId];
      try { localStorage.setItem('labs_user_reactions', JSON.stringify(n)); } catch {}
      return n;
    });
    if (prev && prev !== emoji) {
      await supabase.rpc('lab_decrement_reaction', { p_lab_id: labId, p_emoji: prev }).catch(() => {});
    }
    if (!isSame) {
      await supabase.rpc('lab_increment_reaction', { p_lab_id: labId, p_emoji: emoji }).catch(() => {});
    }
  }

  /* Random */
  function goRandom() {
    if (!items.length) return;
    setExpanded(items[Math.floor(Math.random() * items.length)]);
  }

  const reactionProps = { reactions, onReact: handleReact, userReactions };

  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{labStyles}</style>

      {/* ── Hero — matches Blogs, Guestbook exactly ── */}
      <PageHero
        title="LABS"
        subtitle="Experiments & micro tools"
        highlight="The playground."
      />

      <section className="lab-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px 120px' }}>

        {/* ── Count + Random bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 36, flexWrap: 'wrap', gap: 12,
          }}
        >
          <p style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.26em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.24)', margin: 0,
          }}>
            {loading ? '—' : items.length} experiments
          </p>

          <button
            onClick={goRandom}
            style={{
              padding: '7px 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif",
              transition: 'all 0.22s', letterSpacing: '-0.01em', outline: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          >
            🎲 Random experiment
          </button>
        </motion.div>

        {/* ── Featured ── */}
        {!loading && featured && (
          <FeaturedCard item={featured} onExpand={setExpanded} {...reactionProps} />
        )}

        {/* ── Filters + Search ── */}
        <div style={{ marginBottom: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 380, width: '100%' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 13.5, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="lab-search"
              placeholder="Search experiments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search experiments"
            />
          </div>

          {/* Type filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {allTypes.map(t => (
              <button key={t} className={`lab-filter-btn${filterType === t ? ' active' : ''}`}
                onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>

          {/* Status + tag filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {allStatuses.map(s => (
              <button key={s} className={`lab-filter-btn${filterStatus === s ? ' active' : ''}`}
                onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
            {allTags.length > 1 && allTags.map(tag => (
              <button key={tag} className={`lab-filter-btn${filterTag === tag ? ' active' : ''}`}
                onClick={() => setFilterTag(tag)}
                style={{ color: filterTag === tag ? 'white' : 'rgba(255,255,255,0.28)' }}>
                #{tag !== 'All' ? tag : 'all'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="lab-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="lab-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', padding: '80px 20px',
              color: 'rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔭</div>
            <p style={{ fontSize: 14, margin: '0 0 8px', color: 'rgba(255,255,255,0.3)' }}>
              No experiments match your filter.
            </p>
            <p style={{ fontSize: 12, margin: 0 }}>
              Try clearing the search or selecting a different filter.
            </p>
          </motion.div>
        ) : (
          <div className="lab-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            <AnimatePresence>
              {filtered.map((item, i) => (
                <LabCard key={item.id} item={item} index={i} onExpand={setExpanded} {...reactionProps} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Expand Modal ── */}
      <AnimatePresence>
        {expanded && (
          <ExpandModal item={expanded} onClose={() => setExpanded(null)} {...reactionProps} />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
