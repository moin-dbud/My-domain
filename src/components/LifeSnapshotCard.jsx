import { useState, useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

/* ── Default fallback data (shown while loading / on error) ─── */
const DEFAULT_SNAPSHOT = {
  location: 'Nagpur, India',
  role:     'AI & Data Science Student',
  vibe:     'Coffee + late-night builds',
  mood:     'Focused with music',
  status:   'Always building something',
};

const DEFAULT_FACTS = [
  "I get my best ideas at night 🌙",
  "I prefer dark mode always 😌",
  "I love building micro tools that solve tiny problems",
  "Debugging feels like solving a mystery 🕵️",
  "I enjoy turning random ideas into real, shipped apps",
  "I read commit history like it's a story 📖",
  "My tab count is proportional to my curiosity 🤔",
];

const SNAPSHOT_ITEMS = [
  { key: 'location', emoji: '📍', label: 'Based in' },
  { key: 'role',     emoji: '🎓', label: 'Role' },
  { key: 'vibe',     emoji: '☕', label: 'Current vibe' },
  { key: 'mood',     emoji: '🎧', label: 'Mood' },
  { key: 'status',   emoji: '🚀', label: 'Status' },
];

/* ── Typing animation hook ─────────────────────────────────── */
function useTyping(text, speed = 28) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return { displayed, done };
}

/* ── Click sound (tiny silent-safe Audio) ──────────────────── */
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch { /* silent fallback */ }
}

/* ── LifeSnapshotCard component ────────────────────────────── */
export default function LifeSnapshotCard() {
  const [snapshot, setSnapshot] = useState(DEFAULT_SNAPSHOT);
  const [facts, setFacts]       = useState(DEFAULT_FACTS);
  const [currentFact, setCurrentFact] = useState(null);
  const [copied, setCopied]     = useState(false);
  const lastIdx = useRef(-1);

  const { displayed, done } = useTyping(currentFact, 26);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['life_snapshot', 'life_facts'])
      .then(({ data }) => {
        if (!data) return;
        data.forEach(({ key, value }) => {
          if (key === 'life_snapshot' && value) setSnapshot({ ...DEFAULT_SNAPSHOT, ...value });
          if (key === 'life_facts'    && Array.isArray(value) && value.length) setFacts(value);
        });
      });
  }, []);

  function revealFact() {
    playClick();
    let idx;
    do { idx = Math.floor(Math.random() * facts.length); }
    while (facts.length > 1 && idx === lastIdx.current);
    lastIdx.current = idx;
    setCurrentFact(facts[idx]);
    setCopied(false);
  }

  async function copyFact() {
    if (!currentFact) return;
    await navigator.clipboard.writeText(currentFact).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🧬</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.02em' }}>
            Life{' '}
            <span style={{
              fontStyle: 'italic',
              fontFamily: "'Playfair Display', serif",
              background: 'linear-gradient(90deg,#a855f7,#3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Snapshot</span>
          </span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(168,85,247,0.8)',
          background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
          padding: '2px 7px', borderRadius: 999,
        }}>Beyond the code</span>
      </div>

      {/* ── Snapshot items — compact inline rows ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {SNAPSHOT_ITEMS.map(({ key, emoji, label }) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 10px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>{emoji}</span>
            <span style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)', fontWeight: 600, flexShrink: 0, minWidth: 72,
            }}>{label}</span>
            <span style={{
              fontSize: 12.5, color: 'rgba(255,255,255,0.78)', fontWeight: 500,
              letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{snapshot[key]}</span>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{ margin: '12px 0 10px', height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Fact display ── */}
      {currentFact && (
        <Motion.div
          key={currentFact}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative', marginBottom: 10,
            padding: '10px 34px 10px 12px',
            background: 'rgba(168,85,247,0.06)',
            border: '1px solid rgba(168,85,247,0.14)',
            borderRadius: 10,
            fontSize: 12.5, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.55, letterSpacing: '-0.01em',
            minHeight: 42,
          }}
        >
          {displayed}
          {done && (
            <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: 'rgba(168,85,247,0.5)', marginLeft: 2,
              verticalAlign: 'middle', borderRadius: 1,
            }} />
          )}
          {!done && (
            <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: 'rgba(168,85,247,0.8)', marginLeft: 2,
              verticalAlign: 'middle', borderRadius: 1,
              animation: 'ls-blink 0.7s steps(1) infinite',
            }} />
          )}

          {/* Copy button */}
          {done && (
            <Motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={copyFact}
              title="Copy fact"
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 24, height: 24, borderRadius: 6,
                background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 11, transition: 'all 0.2s',
              }}
            >
              {copied ? '✓' : '⧉'}
            </Motion.button>
          )}
        </Motion.div>
      )}

      {/* ── Reveal button ── */}
      <style>{`
        @keyframes ls-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .ls-btn:hover { background: rgba(168,85,247,0.16) !important; border-color: rgba(168,85,247,0.35) !important; transform: translateY(-1px); }
        .ls-btn:active { transform: scale(0.97) !important; }
      `}</style>

      <Motion.button
        className="ls-btn"
        whileTap={{ scale: 0.96 }}
        onClick={revealFact}
        style={{
          width: '100%', padding: '9px 16px', borderRadius: 10,
          background: currentFact ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.22)',
          color: 'rgba(255,255,255,0.72)', fontSize: 12.5, fontWeight: 600,
          fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em',
          cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}
      >
        <span style={{ fontSize: 15 }}>🎲</span>
        {currentFact ? 'Reveal another random fact' : 'Reveal something random about me'}
      </Motion.button>
    </div>
  );
}
