import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

/* ─── Global Styles ──────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Playfair+Display:ital@1&display=swap');
  * { box-sizing: border-box; }

  :root {
    --green: #4ade80;
    --green-dim: rgba(74,222,128,0.12);
    --green-border: rgba(74,222,128,0.25);
    --yellow: #facc15;
    --yellow-dim: rgba(250,204,21,0.10);
    --yellow-border: rgba(250,204,21,0.22);
    --purple: #c084fc;
    --purple-dim: rgba(168,85,247,0.08);
    --surface: #0c0c0c;
    --surface2: #111;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.14);
    --mono: 'JetBrains Mono', 'Fira Code', monospace;
    --sans: 'Inter', sans-serif;
  }

  /* Boot sequence */
  @keyframes boot-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .cursor-blink { animation: boot-blink 1s step-start infinite; }

  /* Progress bar fill */
  @keyframes progress-fill {
    from { width: 0%; }
    to   { width: var(--target, 100%); }
  }

  /* Pulse for building status */
  @keyframes building-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .building-pulse { animation: building-pulse 1.8s ease-in-out infinite; }

  /* Scan line shimmer */
  @keyframes scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }

  /* Tool row hover */
  .tool-row {
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
    position: relative;
    outline: none;
  }
  .tool-row:hover { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.12) !important; }
  .tool-row:focus-visible { box-shadow: 0 0 0 2px rgba(74,222,128,0.4); }

  /* Command input */
  .cmd-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--green);
    font-family: var(--mono);
    font-size: 13px;
    flex: 1;
    caret-color: var(--green);
  }
  .cmd-input::placeholder { color: rgba(74,222,128,0.3); }

  /* Drawer */
  .drawer-overlay {
    position: fixed; inset: 0; z-index: 900;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .drawer-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 901;
    width: min(520px, 100vw);
    background: #090909;
    border-left: 1px solid rgba(255,255,255,0.09);
    overflow-y: auto;
    display: flex; flex-direction: column;
  }

  /* Scrollbar */
  .drawer-panel::-webkit-scrollbar { width: 4px; }
  .drawer-panel::-webkit-scrollbar-track { background: transparent; }
  .drawer-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  /* Action button */
  .action-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; font-size: 12.5px;
    font-weight: 500; cursor: pointer; text-decoration: none;
    font-family: var(--sans);
    transition: all 0.18s ease;
    letter-spacing: -0.01em;
  }
  .action-btn-primary {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.75);
  }
  .action-btn-primary:hover {
    background: rgba(255,255,255,0.11);
    border-color: rgba(255,255,255,0.22);
    color: white;
  }
  .action-btn-green {
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.25);
    color: #4ade80;
  }
  .action-btn-green:hover {
    background: rgba(74,222,128,0.15);
    border-color: rgba(74,222,128,0.4);
  }
  .action-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.35);
  }
  .action-btn-ghost:hover {
    border-color: rgba(255,255,255,0.16);
    color: rgba(255,255,255,0.65);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .labs-main-content { padding: 0 16px 80px !important; }
    .tool-row-inner { flex-wrap: wrap; gap: 10px !important; }
    .tool-row-progress { display: none; }
    .drawer-panel { width: 100vw; border-left: none; border-top: 1px solid rgba(255,255,255,0.09); top: auto; height: 85vh; border-radius: 16px 16px 0 0; }
  }
`;

/* ─── Status system ─────────────────────────────────────────────── */
const STATUS_MAP = {
  'Live':         { label: 'READY',    color: '#4ade80', dimColor: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)',  progress: 100, group: 'ready' },
  'In Progress':  { label: 'BUILDING', color: '#facc15', dimColor: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.22)',  progress: 55,  group: 'building' },
  'Experimental': { label: 'BUILDING', color: '#fb923c', dimColor: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.22)',  progress: 30,  group: 'building' },
  'Archived':     { label: 'QUEUED',   color: 'rgba(255,255,255,0.25)', dimColor: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', progress: 0, group: 'queued' },
};

const PLATFORM_ICONS = {
  'VS Code Extension': { icon: '⬡', label: 'VS Code Extension' },
  'Browser Extension': { icon: '⬢', label: 'Browser Extension' },
  'Tool':              { icon: '◈', label: 'Web Tool' },
  'Experiment':        { icon: '◎', label: 'Experiment' },
};

/* ─── Progress bar [████░░░] ────────────────────────────────────── */
function BlockProgress({ pct, color, animate: doAni = true }) {
  const total = 12;
  const filled = Math.round((pct / 100) * total);
  return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 2, color }}>
      [
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          opacity: i < filled ? 1 : 0.15,
          color: i < filled ? color : 'rgba(255,255,255,0.2)',
        }}>
          {i < filled ? '█' : '░'}
        </span>
      ))}
      ]
    </span>
  );
}

/* ─── Boot Sequence ─────────────────────────────────────────────── */
const BOOT_LINES = [
  { text: 'Initializing runtime env…',        delay: 0 },
  { text: 'Loading module registry…',          delay: 320 },
  { text: 'Mounting idea pipeline…',           delay: 620 },
  { text: 'Compiling tools…',                  delay: 920 },
  { text: '✓ System ready. All modules loaded', delay: 1200, success: true },
];

function BootSequence({ onDone }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timers = [];
    BOOT_LINES.forEach(({ text, delay, success }) => {
      timers.push(setTimeout(() => {
        setLines(l => [...l, { text, success }]);
        if (success) {
          setTimeout(() => { setDone(true); setTimeout(onDone, 320); }, 400);
        }
      }, delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 800,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 13,
        maxWidth: 480, width: '100%', padding: '0 24px',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 20, fontSize: 11, letterSpacing: '0.2em' }}>
          MOIN.DEV / LABS v2.0.0
        </div>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              color: line.success ? '#4ade80' : 'rgba(255,255,255,0.45)',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ color: line.success ? '#4ade80' : 'rgba(255,255,255,0.18)' }}>
              {line.success ? '✓' : '$'}
            </span>
            {line.text}
            {i === lines.length - 1 && !line.success && (
              <span className="cursor-blink" style={{ color: '#4ade80' }}>▋</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Stats Bar ─────────────────────────────────────────────────── */
function StatsBar({ items, booted }) {
  const ready    = items.filter(i => STATUS_MAP[i.status]?.group === 'ready').length;
  const building = items.filter(i => STATUS_MAP[i.status]?.group === 'building').length;
  const queued   = items.filter(i => STATUS_MAP[i.status]?.group === 'queued').length;

  const stats = [
    { label: 'READY',    count: ready,    color: '#4ade80', dim: 'rgba(74,222,128,0.10)' },
    { label: 'BUILDING', count: building, color: '#facc15', dim: 'rgba(250,204,21,0.10)' },
    { label: 'QUEUED',   count: queued,   color: 'rgba(255,255,255,0.3)', dim: 'rgba(255,255,255,0.04)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: booted ? 1 : 0, y: booted ? 0 : 10 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}
    >
      {stats.map(({ label, count, color, dim }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          background: dim, border: `1px solid ${color}30`,
          fontFamily: 'var(--mono)', fontSize: 11,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: color,
            boxShadow: label === 'BUILDING' ? `0 0 6px ${color}` : 'none',
          }} className={label === 'BUILDING' ? 'building-pulse' : ''} />
          <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>{label}</span>
          <span style={{ color, fontWeight: 600 }}>{count}</span>
        </div>
      ))}
      <div style={{
        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.08em',
      }}>
        <span style={{ color: '#4ade80' }}>●</span> pipeline.active
      </div>
    </motion.div>
  );
}

/* ─── Command Input ─────────────────────────────────────────────── */
const CMD_HINTS = ['show ready', 'show building', 'show queued', 'surprise me', 'clear'];

function CommandInput({ onCommand, booted }) {
  const [val, setVal] = useState('');
  const [hint, setHint] = useState('');
  const inputRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (hint) setVal(hint);
    }
    if (e.key === 'Enter') {
      const cmd = val.trim().toLowerCase();
      onCommand(cmd);
      setVal('');
      setHint('');
    }
    if (e.key === 'Escape') {
      setVal('');
      setHint('');
    }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setVal(v);
    if (v) {
      const match = CMD_HINTS.find(c => c.startsWith(v.toLowerCase()) && c !== v.toLowerCase());
      setHint(match || '');
    } else {
      setHint('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: booted ? 1 : 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: 'rgba(74,222,128,0.03)',
        border: '1px solid rgba(74,222,128,0.12)',
        borderRadius: 10,
        marginBottom: 28,
        position: 'relative',
      }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'rgba(74,222,128,0.5)', flexShrink: 0 }}>›</span>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
        {hint && val && (
          <span style={{
            position: 'absolute', left: 0, top: 0,
            fontFamily: 'var(--mono)', fontSize: 13,
            color: 'rgba(74,222,128,0.2)',
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            {hint}
          </span>
        )}
        <input
          ref={inputRef}
          className="cmd-input"
          placeholder="run a command… (try 'show ready')"
          value={val}
          onChange={handleChange}
          onKeyDown={handleKey}
          spellCheck={false}
          autoComplete="off"
          aria-label="Command input"
        />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
        ↵ enter
      </span>
    </motion.div>
  );
}

/* ─── Tagline map ────────────────────────────────────────────────── */
const TAGLINES = {
  'Live':         'Built. Shipped. Ready for you.',
  'In Progress':  'Still cooking — but close.',
  'Experimental': 'A hypothesis turned half-real.',
  'Archived':     'The idea that won\'t stop returning.',
};

/* ─── Tool Row ───────────────────────────────────────────────────── */
function ToolRow({ item, index, onClick, booted, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const s = STATUS_MAP[item.status] || STATUS_MAP['Archived'];
  const plat = PLATFORM_ICONS[item.type] || PLATFORM_ICONS['Experiment'];
  const isBuilding = s.group === 'building';
  const isQueued   = s.group === 'queued';
  const tagline = TAGLINES[item.status] || '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: booted ? 1 : 0, x: booted ? 0 : -16 }}
      transition={{ duration: 0.35, delay: booted ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
      className="tool-row"
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title}`}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 18px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.06)',
        background: hovered ? 'rgba(255,255,255,0.025)' : 'transparent',
        opacity: isQueued ? 0.6 : 1,
      }}
    >
      {/* Main row */}
      <div className="tool-row-inner" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Index / signal */}
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.14)',
          width: 28, flexShrink: 0, textAlign: 'right',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Platform icon */}
        <span style={{
          fontSize: 16, flexShrink: 0,
          opacity: isQueued ? 0.4 : 0.8,
        }}>
          {item.icon || plat.icon}
        </span>

        {/* Tool name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600,
              color: isQueued ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.88)',
              letterSpacing: '-0.01em',
            }}>
              {item.title}
            </span>
            {item.is_featured && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
                color: '#c084fc', background: 'rgba(168,85,247,0.10)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: 4, padding: '1px 6px',
                fontFamily: 'var(--mono)',
              }}>★ FEAT</span>
            )}
          </div>
          {/* Tagline on hover */}
          <AnimatePresence>
            {hovered && tagline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: 'var(--sans)', fontSize: 11.5,
                  color: 'rgba(255,255,255,0.3)',
                  fontStyle: 'italic', marginTop: 3,
                  overflow: 'hidden',
                }}
              >
                {tagline}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress block [████░░] */}
        <div className="tool-row-progress" style={{ flexShrink: 0 }}>
          <span className={isBuilding ? 'building-pulse' : ''}>
            <BlockProgress pct={s.progress} color={s.color} animate={isBuilding} />
          </span>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.1em',
          color: s.color,
          background: s.dimColor,
          border: `1px solid ${s.border}`,
          borderRadius: 6, padding: '3px 8px',
        }}>
          <span className={isBuilding ? 'building-pulse' : ''} style={{
            width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0,
          }} />
          {s.label}
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ x: hovered ? 3 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14, flexShrink: 0 }}
        >
          ›
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ─── Section Header ────────────────────────────────────────────── */
function SectionHeader({ group, count, booted, delay }) {
  const cfg = {
    ready:    { label: '✅ READY',    color: '#4ade80', desc: 'Compiled and deployed' },
    building: { label: '⚙  BUILDING', color: '#facc15', desc: 'Active development' },
    queued:   { label: '⏳ QUEUED',   color: 'rgba(255,255,255,0.28)', desc: 'Ideas in the pipeline' },
  }[group] || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: booted ? 1 : 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginTop: 40, marginBottom: 12,
        paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.15em', color: cfg.color,
      }}>
        {cfg.label}
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>
        — {cfg.desc}
      </span>
      <span style={{
        marginLeft: 'auto',
        fontFamily: 'var(--mono)', fontSize: 10,
        color: 'rgba(255,255,255,0.18)',
      }}>
        [{count} module{count !== 1 ? 's' : ''}]
      </span>
    </motion.div>
  );
}

/* ─── Drawer Panel ───────────────────────────────────────────────── */
function DrawerPanel({ item, onClose }) {
  const s = STATUS_MAP[item.status] || STATUS_MAP['Archived'];
  const plat = PLATFORM_ICONS[item.type] || PLATFORM_ICONS['Experiment'];

  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <>
        {/* Overlay */}
        <motion.div
          className="drawer-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="drawer-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Panel top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#0a0a0a',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.12em',
              }}>
                MODULE INSPECTOR
              </span>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: s.color,
                boxShadow: `0 0 6px ${s.color}`,
              }} className={s.group === 'building' ? 'building-pulse' : ''} />
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', outline: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >✕</button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 24px 40px', flex: 1 }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: s.dimColor, border: `1px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {item.icon || plat.icon}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700,
                    color: 'white', letterSpacing: '-0.02em', margin: '0 0 8px',
                  }}>
                    {item.title}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {/* Status */}
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.12em', color: s.color,
                      background: s.dimColor, border: `1px solid ${s.border}`,
                      borderRadius: 5, padding: '2px 8px',
                    }}>
                      {s.label}
                    </span>
                    {/* Platform */}
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 10,
                      color: 'rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 5, padding: '2px 8px',
                    }}>
                      {plat.label}
                    </span>
                    {item.is_late_night && (
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 10,
                        color: '#818cf8',
                        background: 'rgba(30,30,80,0.4)',
                        border: '1px solid rgba(80,80,160,0.25)',
                        borderRadius: 5, padding: '2px 8px',
                      }}>
                        🌙 Built Late Night
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress row */}
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                  build progress
                </span>
                <BlockProgress pct={s.progress} color={s.color} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: s.color, marginLeft: 'auto' }}>
                  {s.progress}%
                </span>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p style={{
                fontFamily: 'var(--sans)', fontSize: 13.5, color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.75, margin: '0 0 22px',
              }}>
                {item.description}
              </p>
            )}

            {/* Problem block */}
            {item.problem && (
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8,
                }}>
                  // problem.statement
                </div>
                <p style={{
                  fontFamily: 'var(--sans)', fontSize: 13, color: 'rgba(255,255,255,0.48)',
                  lineHeight: 1.7, margin: 0,
                  padding: '12px 14px',
                  background: 'rgba(250,204,21,0.04)',
                  border: '1px solid rgba(250,204,21,0.1)',
                  borderLeft: '2px solid rgba(250,204,21,0.35)',
                  borderRadius: '0 8px 8px 0',
                }}>
                  {item.problem}
                </p>
              </div>
            )}

            {/* Features */}
            {item.features && item.features.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10,
                }}>
                  // key.features[]
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {item.features.map((f, i) => (
                    <li key={i} style={{
                      fontFamily: 'var(--sans)', fontSize: 13,
                      color: 'rgba(255,255,255,0.5)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <span style={{ color: '#4ade80', flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 12 }}>→</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech stack */}
            {item.tech_stack && item.tech_stack.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8,
                }}>
                  // tech.stack
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tech_stack.map(t => (
                    <span key={t} style={{
                      fontFamily: 'var(--mono)', fontSize: 11.5, padding: '3px 9px',
                      borderRadius: 5, background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                {item.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 8px',
                    borderRadius: 4, background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.28)',
                  }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Dev note */}
            {item.dev_note && (
              <div style={{
                marginBottom: 24, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)',
                borderLeft: '2px solid rgba(168,85,247,0.3)',
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 13,
                  color: 'rgba(192,132,252,0.7)', fontStyle: 'italic',
                  margin: 0, lineHeight: 1.7,
                }}>
                  💬 {item.dev_note}
                </p>
              </div>
            )}

            {/* Action buttons */}
            {(item.link_demo || item.link_github || item.link_install) && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                {item.link_install && (
                  <a href={item.link_install} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-green">
                    <span>↓</span> Install
                  </a>
                )}
                {item.link_demo && (
                  <a href={item.link_demo} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-primary">
                    Live Demo →
                  </a>
                )}
                {item.link_github && (
                  <a href={item.link_github} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-ghost">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

/* ─── Console Log Output ─────────────────────────────────────────── */
function ConsoleOutput({ lines }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  if (!lines.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      ref={ref}
      style={{
        fontFamily: 'var(--mono)', fontSize: 12,
        padding: '10px 14px', marginBottom: 16,
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8, maxHeight: 120, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ color: line.isErr ? '#f87171' : 'rgba(255,255,255,0.3)', display: 'flex', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
          <span>{line.text}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Labs() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [booted, setBooted]       = useState(false);
  const [showBoot, setShowBoot]   = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState('all');   // all | ready | building | queued
  const [consoleLogs, setConsoleLogs] = useState([]);

  useEffect(() => { document.title = 'Labs | Moin Sheikh'; }, []);

  useEffect(() => {
    supabase.from('labs').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  const handleBootDone = useCallback(() => {
    setShowBoot(false);
    setBooted(true);
  }, []);

  /* Group items */
  const grouped = useMemo(() => {
    const groups = { ready: [], building: [], queued: [] };
    items.forEach(item => {
      const g = STATUS_MAP[item.status]?.group || 'queued';
      if (!filter || filter === 'all' || filter === g) {
        groups[g].push(item);
      }
    });
    return groups;
  }, [items, filter]);

  /* Command handler */
  const handleCommand = useCallback((cmd) => {
    const log = (text, isErr = false) => setConsoleLogs(l => [...l.slice(-8), { text, isErr }]);

    if (cmd === 'show ready')    { setFilter('ready');    log('› Filtering: READY modules only'); }
    else if (cmd === 'show building') { setFilter('building'); log('› Filtering: BUILDING modules'); }
    else if (cmd === 'show queued')   { setFilter('queued');   log('› Filtering: QUEUED modules'); }
    else if (cmd === 'clear')    { setFilter('all'); setConsoleLogs([]); }
    else if (cmd === 'surprise me') {
      if (items.length) {
        const pick = items[Math.floor(Math.random() * items.length)];
        setSelected(pick);
        log(`› Opening: ${pick.title}`);
      }
    }
    else if (cmd.startsWith('run ')) {
      const name = cmd.slice(4).trim();
      const found = items.find(i => i.title?.toLowerCase().includes(name));
      if (found) { setSelected(found); log(`› Executing: ${found.title}`); }
      else log(`› Module not found: "${name}"`, true);
    }
    else {
      log(`› Unknown command: "${cmd}". Try 'show ready', 'surprise me'`, true);
    }
  }, [items]);

  const allCount     = items.length;
  const readyCount   = grouped.ready.length;
  const buildingCount = grouped.building.length;
  const queuedCount  = grouped.queued.length;

  /* Row delay offset */
  let rowIdx = 0;

  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      <style>{STYLES}</style>

      {/* Boot sequence overlay */}
      {showBoot && !loading && <BootSequence onDone={handleBootDone} />}

      {/* Hero — unchanged */}
      <PageHero
        title="LABS"
        subtitle="Experiments & micro tools"
        highlight="The playground."
      />

      <section className="labs-main-content" style={{ maxWidth: 860, margin: '0 auto', padding: '0 28px 120px' }}>

        {/* Stats bar */}
        <StatsBar items={items} booted={booted} />

        {/* Command input */}
        <CommandInput onCommand={handleCommand} booted={booted} />

        {/* Console output */}
        <AnimatePresence>
          {consoleLogs.length > 0 && <ConsoleOutput lines={consoleLogs} />}
        </AnimatePresence>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: booted ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}
        >
          {[
            { id: 'all',      label: `ALL [${allCount}]` },
            { id: 'ready',    label: `READY [${readyCount}]`, color: '#4ade80' },
            { id: 'building', label: `BUILDING [${buildingCount}]`, color: '#facc15' },
            { id: 'queued',   label: `QUEUED [${queuedCount}]`, color: 'rgba(255,255,255,0.3)' },
          ].map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.12em',
                padding: '5px 12px', borderRadius: 6, cursor: 'pointer', outline: 'none',
                background: filter === id ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: filter === id
                  ? `1px solid rgba(255,255,255,0.14)`
                  : '1px solid rgba(255,255,255,0.05)',
                color: filter === id ? (color || 'white') : 'rgba(255,255,255,0.22)',
                transition: 'all 0.18s',
              }}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── READY ── */}
        {(filter === 'all' || filter === 'ready') && grouped.ready.length > 0 && (
          <>
            <SectionHeader group="ready" count={grouped.ready.length} booted={booted} delay={0.15} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {grouped.ready.map((item) => {
                const d = 0.18 + (rowIdx++) * 0.055;
                return (
                  <ToolRow key={item.id} item={item} index={rowIdx - 1}
                    onClick={() => setSelected(item)} booted={booted} delay={d} />
                );
              })}
            </div>
          </>
        )}

        {/* ── BUILDING ── */}
        {(filter === 'all' || filter === 'building') && grouped.building.length > 0 && (
          <>
            <SectionHeader group="building" count={grouped.building.length} booted={booted} delay={0.2} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {grouped.building.map((item) => {
                const d = 0.22 + (rowIdx++) * 0.055;
                return (
                  <ToolRow key={item.id} item={item} index={rowIdx - 1}
                    onClick={() => setSelected(item)} booted={booted} delay={d} />
                );
              })}
            </div>
          </>
        )}

        {/* ── QUEUED ── */}
        {(filter === 'all' || filter === 'queued') && grouped.queued.length > 0 && (
          <>
            <SectionHeader group="queued" count={grouped.queued.length} booted={booted} delay={0.25} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {grouped.queued.map((item) => {
                const d = 0.26 + (rowIdx++) * 0.055;
                return (
                  <ToolRow key={item.id} item={item} index={rowIdx - 1}
                    onClick={() => setSelected(item)} booted={booted} delay={d} />
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {booted && !loading && allCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '80px 20px',
              fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.18)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>{'>'}</div>
            <p style={{ fontSize: 13, margin: 0 }}>No modules loaded. Pipeline empty.</p>
          </motion.div>
        )}

        {/* Terminal footer signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: booted ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          style={{
            marginTop: 56, paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.14)',
          }}
        >
          <span style={{ color: '#4ade80' }}>✓</span>
          <span>moin.dev/labs — {allCount} module{allCount !== 1 ? 's' : ''} indexed —</span>
          <span className="cursor-blink" style={{ color: '#4ade80' }}>▋</span>
        </motion.div>
      </section>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <DrawerPanel item={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
