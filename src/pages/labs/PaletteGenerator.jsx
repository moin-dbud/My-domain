import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────
   PALETTE GENERATOR — Derives 8 harmonious swatches from a base colour
   using pure HSL math (complementary, triadic, split, analogous, etc.)
──────────────────────────────────────────────────────────────────────── */

/* ─── HSL ↔ HEX helpers ─────────────────────────────────────────────── */
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  const toHex = n => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const lum = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(hue * 360), Math.round(sat * 100), Math.round(lum * 100)];
}

/* ─── Derive 8-swatch palette from base colour ───────────────────────── */
function derivePalette(baseHex) {
  const [h, s, l] = hexToHsl(baseHex);
  return [
    { label: 'Base',           hex: hslToHex(h,          s,          l)          },
    { label: 'Complementary',  hex: hslToHex(h + 180,    s,          l)          },
    { label: 'Triadic A',      hex: hslToHex(h + 120,    s,          l)          },
    { label: 'Triadic B',      hex: hslToHex(h - 120,    s,          l)          },
    { label: 'Split A',        hex: hslToHex(h + 150,    s,          l)          },
    { label: 'Split B',        hex: hslToHex(h - 150,    s,          l)          },
    { label: 'Analogous +',    hex: hslToHex(h + 30,     s,          l)          },
    { label: 'Shaded',         hex: hslToHex(h,          s,          Math.max(10, l - 22)) },
  ];
}

/* ─── Luminance → text colour ────────────────────────────────────────── */
function textOn(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 128
    ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)';
}

/* ─── Single swatch ──────────────────────────────────────────────────── */
function Swatch({ swatch, index }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText(swatch.hex); }
    catch {
      const el = document.createElement('textarea');
      el.value = swatch.hex;
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}
    >
      <div
        onClick={copy}
        style={{
          height: 72,
          borderRadius: '9px 9px 0 0',
          background: swatch.hex,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          position: 'relative',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${swatch.hex}55`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <AnimatePresence>
          {copied && (
            <motion.span
              key="tick"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 18, color: textOn(swatch.hex), fontWeight: 700 }}
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div style={{
        padding: '7px 9px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0 0 9px 9px',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {swatch.hex}
          </code>
          <button onClick={copy} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px',
            color: copied ? '#4ade80' : 'rgba(255,255,255,0.3)', fontSize: 12,
            transition: 'color 0.18s', lineHeight: 1,
          }}>
            {copied ? '✓' : '⎘'}
          </button>
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>
          {swatch.label}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Preset colours ─────────────────────────────────────────────────── */
const PRESETS = [
  { hex: '#a855f7', label: 'Purple' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#ef4444', label: 'Red' },
  { hex: '#ec4899', label: 'Pink' },
];

/* ─── Main component ─────────────────────────────────────────────────── */
export default function PaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#a855f7');

  const palette = useMemo(() => derivePalette(baseColor), [baseColor]);

  const copyAll = useCallback(async () => {
    const text = palette.map(s => `${s.label}: ${s.hex}`).join('\n');
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement('textarea');
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
  }, [palette]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Controls row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {/* Native colour picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Base colour
          </label>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <input
              type="color"
              value={baseColor}
              onChange={e => setBaseColor(e.target.value)}
              style={{
                width: 40, height: 40, borderRadius: 9, padding: 3,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
            />
          </div>
          <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {baseColor}
          </code>
        </div>

        {/* Preset chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.hex}
              onClick={() => setBaseColor(p.hex)}
              title={p.label}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: p.hex, border: 'none', cursor: 'pointer',
                boxShadow: baseColor === p.hex ? `0 0 0 2px white, 0 0 0 4px ${p.hex}` : 'none',
                transition: 'box-shadow 0.18s',
              }}
            />
          ))}
        </div>

        <button
          onClick={copyAll}
          style={{
            marginLeft: 'auto', padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          ⎘ Copy all
        </button>
      </div>

      {/* ── Swatch grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 10 }}>
        {palette.map((swatch, i) => (
          <Swatch key={swatch.label} swatch={swatch} index={i} />
        ))}
      </div>

      <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 1.6 }}>
        Click any swatch to copy its hex. All 8 harmonies derived with pure HSL math — no external APIs.
      </p>
    </div>
  );
}
