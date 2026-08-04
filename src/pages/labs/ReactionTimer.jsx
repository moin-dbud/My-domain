import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────
   REACTION TIMER — "Click when it turns green" game.
   Tracks personal best and charts last 8 attempts.
──────────────────────────────────────────────────────────────────────── */

const STATES = {
  IDLE:    'idle',
  WAITING: 'waiting',  // waiting for the green flash
  READY:   'ready',    // green — click now!
  RESULT:  'result',
  TOO_SOON:'too_soon',
};

/* ─── Reaction speed tier ────────────────────────────────────────────── */
function getTier(ms) {
  if (ms < 150) return { label: 'Superhuman',  color: '#818cf8' };
  if (ms < 200) return { label: 'Elite',        color: '#a855f7' };
  if (ms < 250) return { label: 'Great',        color: '#c084fc' };
  if (ms < 300) return { label: 'Good',         color: '#e879f9' };
  if (ms < 400) return { label: 'Average',      color: '#facc15' };
  return                { label: 'Keep trying', color: '#f87171' };
}

/* ─── Bar chart ──────────────────────────────────────────────────────── */
function Chart({ results }) {
  if (!results.length) return null;
  const max = Math.max(...results, 400);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
        color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Last {results.length} attempt{results.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 52 }}>
        {results.map((ms, i) => {
          const tier = getTier(ms);
          const heightPct = (ms / max) * 100;
          const isLast = i === results.length - 1;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              title={`${ms}ms`}
              style={{
                flex: 1, minWidth: 8, borderRadius: '3px 3px 0 0',
                background: tier.color,
                opacity: isLast ? 1 : 0.45,
                position: 'relative',
              }}
            />
          );
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5,
        color: 'rgba(255,255,255,0.2)',
      }}>
        <span>oldest</span>
        <span>latest</span>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function ReactionTimer() {
  const [phase, setPhase]     = useState(STATES.IDLE);
  const [ms, setMs]           = useState(null);
  const [best, setBest]       = useState(null);
  const [results, setResults] = useState([]);
  const startRef  = useRef(null);
  const timerRef  = useRef(null);

  // Clear timers on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const startRound = useCallback(() => {
    setPhase(STATES.WAITING);
    setMs(null);
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => {
      setPhase(STATES.READY);
      startRef.current = performance.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === STATES.IDLE || phase === STATES.RESULT || phase === STATES.TOO_SOON) {
      startRound();
      return;
    }

    if (phase === STATES.WAITING) {
      clearTimeout(timerRef.current);
      setPhase(STATES.TOO_SOON);
      return;
    }

    if (phase === STATES.READY) {
      const elapsed = Math.round(performance.now() - startRef.current);
      setMs(elapsed);
      setPhase(STATES.RESULT);
      setResults(prev => [...prev.slice(-7), elapsed]);
      setBest(prev => (prev === null || elapsed < prev) ? elapsed : prev);
    }
  }, [phase, startRound]);

  const tier = ms !== null ? getTier(ms) : null;

  /* ── Zone colours per phase ── */
  const zoneColors = {
    [STATES.IDLE]:     { bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.2)',  text: 'rgba(192,132,252,0.7)' },
    [STATES.WAITING]:  { bg: 'rgba(250,204,21,0.06)', border: 'rgba(250,204,21,0.2)',  text: 'rgba(250,204,21,0.5)' },
    [STATES.READY]:    { bg: 'rgba(74,222,128,0.18)', border: 'rgba(74,222,128,0.5)',  text: '#4ade80' },
    [STATES.RESULT]:   { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: 'rgba(192,132,252,0.8)' },
    [STATES.TOO_SOON]: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.35)', text: '#f87171' },
  };
  const zone = zoneColors[phase];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Reaction zone ── */}
      <motion.div
        key={phase}
        initial={{ scale: 0.98, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={handleClick}
        style={{
          height: 160, borderRadius: 14, cursor: 'pointer',
          background: zone.bg, border: `1px solid ${zone.border}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'background 0.15s, border-color 0.15s',
          userSelect: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {phase === STATES.IDLE && (
            <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: zone.text }}>
                Click to start
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
                wait for green · then click!
              </span>
            </motion.div>
          )}

          {phase === STATES.WAITING && (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 26 }}
              >
                ⏳
              </motion.span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: zone.text }}>
                Wait for it…
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                don't click yet!
              </span>
            </motion.div>
          )}

          {phase === STATES.READY && (
            <motion.div key="go" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.12 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 32 }}>🟢</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: zone.text, letterSpacing: '-0.02em' }}>
                CLICK NOW!
              </span>
            </motion.div>
          )}

          {phase === STATES.TOO_SOON && (
            <motion.div key="soon" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>❌</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: zone.text }}>
                Too soon!
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
                click to try again
              </span>
            </motion.div>
          )}

          {phase === STATES.RESULT && ms !== null && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 700,
                color: tier.color,
                letterSpacing: '-0.03em',
              }}>
                {ms}<span style={{ fontSize: '0.45em', color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>ms</span>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: tier.color }}>
                {tier.label}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
                click to go again
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Stats row ── */}
      {(best !== null || results.length > 0) && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {best !== null && (
            <div style={{
              padding: '10px 16px', borderRadius: 10, flex: 1, minWidth: 100,
              background: 'rgba(168,85,247,0.07)',
              border: '1px solid rgba(168,85,247,0.18)',
            }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: 4 }}>
                BEST
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: getTier(best).color }}>
                {best}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 3 }}>ms</span>
              </div>
            </div>
          )}
          {results.length > 1 && (
            <div style={{
              padding: '10px 16px', borderRadius: 10, flex: 1, minWidth: 100,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: 4 }}>
                AVERAGE
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                {Math.round(results.reduce((a, b) => a + b, 0) / results.length)}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 3 }}>ms</span>
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div style={{
              padding: '10px 16px', borderRadius: 10, flex: 1, minWidth: 100,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: 4 }}>
                ATTEMPTS
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                {results.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Chart ── */}
      {results.length >= 2 && <Chart results={results} />}
    </div>
  );
}
