import { useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageHero from '../components/PageHero';
import Footer from '../components/Footer';
import GradientArt from './labs/GradientArt';
import PaletteGenerator from './labs/PaletteGenerator';
import ReactionTimer from './labs/ReactionTimer';

/* ─── Injected global styles ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Playfair+Display:ital@1&display=swap');

  * { box-sizing: border-box; }

  :root {
    --purple:      #c084fc;
    --purple-mid:  #a855f7;
    --purple-dim:  rgba(168,85,247,0.08);
    --purple-dim2: rgba(168,85,247,0.14);
    --purple-bdr:  rgba(168,85,247,0.22);
    --surface:     #0a0a0a;
    --surface2:    #111;
    --border:      rgba(255,255,255,0.07);
    --border-h:    rgba(255,255,255,0.15);
    --mono:        'JetBrains Mono', 'Fira Code', monospace;
    --sans:        'Inter', sans-serif;
  }

  /* ── Tool card ── */
  .lab-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    transition:
      border-color 0.28s ease,
      background   0.28s ease,
      box-shadow   0.28s ease,
      transform    0.28s cubic-bezier(0.22,1,0.36,1);
    position: relative;
    outline: none;
  }
  .lab-card:hover:not(.lab-card--open) {
    border-color: var(--border-h);
    background: var(--surface2);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    transform: translateY(-5px);
  }
  .lab-card--open {
    border-color: var(--purple-bdr);
    background: #0d0a14;
    box-shadow: 0 0 0 1px rgba(168,85,247,0.1), 0 24px 64px rgba(0,0,0,0.6);
    cursor: default;
  }
  .lab-card:focus-visible {
    box-shadow: 0 0 0 2px rgba(168,85,247,0.5);
  }

  /* Top glint — purple when open, white when closed */
  .lab-card__glint {
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px; pointer-events: none;
    transition: background 0.28s ease;
  }
  .lab-card--open .lab-card__glint {
    background: linear-gradient(90deg, transparent, rgba(168,85,247,0.45), transparent);
  }
  .lab-card:not(.lab-card--open) .lab-card__glint {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent);
  }

  /* ── Launch button ── */
  .lab-launch-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 9px;
    font-family: var(--sans); font-size: 13px; font-weight: 600;
    letter-spacing: -0.01em; cursor: pointer;
    transition: all 0.18s ease;
    border: 1px solid var(--purple-bdr);
    background: var(--purple-dim);
    color: var(--purple);
  }
  .lab-launch-btn:hover {
    background: var(--purple-dim2);
    border-color: rgba(168,85,247,0.38);
  }
  .lab-close-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 0.06em; cursor: pointer;
    transition: all 0.18s ease;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: rgba(255,255,255,0.3);
  }
  .lab-close-btn:hover {
    border-color: rgba(255,255,255,0.16);
    color: rgba(255,255,255,0.6);
  }

  /* ── Section label ── */
  .labs-section-label {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(168,85,247,0.55);
  }

  /* ── Tag badge ── */
  .lab-tag {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* ── Responsive grid ── */
  .labs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 900px) {
    .labs-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .labs-main { padding: 0 16px 80px !important; }
  }
`;

/* ─── Tool definitions ───────────────────────────────────────────────── */
const TOOLS = [
  {
    id: 'gradient',
    emoji: '🎨',
    title: 'Generative Art',
    tag: 'canvas · flow-field',
    tagStyle: { background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.22)' },
    description: 'A deterministic flow-field rendered with Canvas 2D. Every seed is a unique purple nebula — click inside or hit "Regenerate" to spawn a new one.',
    component: GradientArt,
    accentColor: 'rgba(168,85,247,0.18)',
    iconBg: 'rgba(168,85,247,0.1)',
    iconBorder: 'rgba(168,85,247,0.22)',
  },
  {
    id: 'palette',
    emoji: '🎭',
    title: 'Palette Generator',
    tag: 'hsl · color math',
    tagStyle: { background: 'rgba(232,121,249,0.08)', color: '#e879f9', border: '1px solid rgba(232,121,249,0.2)' },
    description: 'Pick any base colour and instantly derive 8 harmonious swatches — complementary, triadic, analogous and more — using pure HSL math.',
    component: PaletteGenerator,
    accentColor: 'rgba(232,121,249,0.12)',
    iconBg: 'rgba(232,121,249,0.08)',
    iconBorder: 'rgba(232,121,249,0.2)',
  },
  {
    id: 'reaction',
    emoji: '⚡',
    title: 'Reaction Timer',
    tag: 'game · local state',
    tagStyle: { background: 'rgba(129,140,248,0.08)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' },
    description: 'When it flashes purple, click as fast as you can. Tracks your personal best and charts your last 8 attempts. How sharp are your reflexes?',
    component: ReactionTimer,
    accentColor: 'rgba(129,140,248,0.12)',
    iconBg: 'rgba(129,140,248,0.08)',
    iconBorder: 'rgba(129,140,248,0.2)',
  },
];

/* ─── Entrance animation variants ───────────────────────────────────── */
const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── ToolCard ───────────────────────────────────────────────────────── */
function ToolCard({ tool, index, isOpen, onToggle }) {
  const ToolComponent = tool.component;
  const cardRef = useRef(null);

  /* Scroll card into view when it opens */
  useEffect(() => {
    if (isOpen && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    }
  }, [isOpen]);

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className={`lab-card${isOpen ? ' lab-card--open' : ''}`}
      role={isOpen ? 'region' : 'button'}
      tabIndex={isOpen ? -1 : 0}
      aria-label={isOpen ? `${tool.title} tool` : `Open ${tool.title}`}
      onKeyDown={e => !isOpen && e.key === 'Enter' && onToggle()}
      onClick={!isOpen ? onToggle : undefined}
      /* On open, the card spans full grid width */
      style={isOpen ? {
        gridColumn: '1 / -1',
      } : {}}
    >
      {/* Top glint */}
      <div className="lab-card__glint" />

      {/* ── Card header (always visible) ── */}
      <div style={{
        padding: '24px 24px 20px',
        ...(isOpen ? {
          borderBottom: '1px solid rgba(168,85,247,0.1)',
          background: 'rgba(168,85,247,0.03)',
        } : {}),
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 13, flexShrink: 0,
            background: tool.iconBg,
            border: `1px solid ${tool.iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: isOpen ? `0 0 16px ${tool.accentColor}` : 'none',
            transition: 'box-shadow 0.3s ease',
          }}>
            {tool.emoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: 16, fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '-0.02em',
              }}>
                {tool.title}
              </span>
              <span className="lab-tag" style={tool.tagStyle}>
                {tool.tag}
              </span>
            </div>

            {/* Description */}
            <p style={{
              margin: 0,
              fontFamily: 'var(--sans)',
              fontSize: 13, lineHeight: 1.65,
              color: 'rgba(255,255,255,0.38)',
            }}>
              {tool.description}
            </p>
          </div>

          {/* Action button — right side, aligned top */}
          <div style={{ flexShrink: 0 }}>
            {isOpen ? (
              <button
                className="lab-close-btn"
                onClick={onToggle}
                aria-label="Close tool"
              >
                ✕ close
              </button>
            ) : (
              <button
                className="lab-launch-btn"
                onClick={onToggle}
                aria-label={`Launch ${tool.title}`}
              >
                Launch ›
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Expandable tool body ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: '24px 24px 28px' }}
            >
              <ToolComponent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Labs Page ──────────────────────────────────────────────────────── */
export default function Labs() {
  const [openTool, setOpenTool] = useState(null);

  useEffect(() => { document.title = 'Labs | Moin Sheikh'; }, []);

  const handleToggle = (toolId) => {
    setOpenTool(prev => prev === toolId ? null : toolId);
  };

  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      <style>{STYLES}</style>

      {/* ── Hero ── */}
      <PageHero
        title="LABS"
        subtitle="Experiments & micro tools"
        highlight="The playground."
      />

      {/* ── Playground section ── */}
      <section
        className="labs-main"
        style={{ maxWidth: 1040, margin: '0 auto', padding: '0 28px 140px' }}
      >
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="labs-section-label">// playground</span>
            <h2 style={{
              margin: 0,
              fontFamily: 'var(--sans)',
              fontSize: 'clamp(20px, 2.8vw, 28px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'rgba(255,255,255,0.88)',
            }}>
              Three interactive micro-tools
            </h2>
          </div>

          {/* Decorative line */}
          <div style={{
            flex: 1, height: 1,
            background: 'linear-gradient(90deg, rgba(168,85,247,0.3), transparent)',
            display: 'none',
          }} />

          {/* Right meta */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.08em',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#c084fc',
              boxShadow: '0 0 8px rgba(192,132,252,0.7)',
              display: 'inline-block',
            }} />
            {TOOLS.length} tools · client-side only
          </div>
        </motion.div>

        {/* ── Tool grid ── */}
        <div className="labs-grid">
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={i}
              isOpen={openTool === tool.id}
              onToggle={() => handleToggle(tool.id)}
            />
          ))}
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
          style={{
            marginTop: 56, paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'rgba(255,255,255,0.14)',
          }}
        >
          <span style={{ color: '#c084fc' }}>◎</span>
          <span>moin.dev/labs — all tools run entirely in your browser, zero external APIs</span>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
