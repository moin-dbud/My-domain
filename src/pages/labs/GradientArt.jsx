import { useEffect, useRef, useState, useCallback } from 'react';


/* ─── Seeded PRNG (mulberry32) ───────────────────────────────────────── */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Flow-field renderer ────────────────────────────────────────────── */
function drawFlowField(canvas, seed) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const rand = mulberry32(seed);

  ctx.fillStyle = '#050010';
  ctx.fillRect(0, 0, W, H);

  const COLS = 40;
  const ROWS = 30;
  const CELL_W = W / COLS;
  const CELL_H = H / ROWS;

  // Build angle field
  const field = [];
  const scale = 0.008 + rand() * 0.012;
  const octaves = 3;
  for (let r = 0; r <= ROWS; r++) {
    field[r] = [];
    for (let c = 0; c <= COLS; c++) {
      // Simple smooth noise via sum of sines
      let angle = 0;
      for (let o = 1; o <= octaves; o++) {
        const freq = o * scale * (1 + rand() * 0.5);
        angle += Math.sin(c * freq * 53.7 + seed * 0.01)
               * Math.cos(r * freq * 47.3 + seed * 0.02)
               / o;
      }
      field[r][c] = angle * Math.PI * 4;
    }
  }

  // Draw particles
  const PALETTES = [
    ['#c084fc', '#a855f7', '#7c3aed', '#e879f9', '#818cf8'],
    ['#d946ef', '#c026d3', '#a21caf', '#c084fc', '#7c3aed'],
    ['#818cf8', '#6366f1', '#4f46e5', '#c084fc', '#a855f7'],
  ];
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)];

  const NUM_PARTICLES = 1800;
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < NUM_PARTICLES; i++) {
    let x = rand() * W;
    let y = rand() * H;
    const color = palette[Math.floor(rand() * palette.length)];
    const alpha = 0.04 + rand() * 0.12;
    const speed = 1.5 + rand() * 3;
    const steps = 30 + Math.floor(rand() * 50);
    const strokeW = 0.4 + rand() * 1.2;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = strokeW;

    for (let s = 0; s < steps; s++) {
      const col = Math.min(COLS, Math.max(0, Math.floor(x / CELL_W)));
      const row = Math.min(ROWS, Math.max(0, Math.floor(y / CELL_H)));
      const angle = field[row][col];
      x += Math.cos(angle) * speed;
      y += Math.sin(angle) * speed;
      if (x < 0 || x > W || y < 0 || y > H) break;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Vignette
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.9);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,16,0.72)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

/* ─── Seed counter ───────────────────────────────────────────────────── */
let _seedCounter = Date.now() % 999983;

export default function GradientArt() {
  const canvasRef = useRef(null);
  const [seed, setSeed] = useState(() => _seedCounter);
  const [rendering, setRendering] = useState(false);

  const render = useCallback((s) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRendering(true);
    requestAnimationFrame(() => {
      drawFlowField(canvas, s);
      setRendering(false);
    });
  }, []);

  useEffect(() => { render(seed); }, [seed, render]);

  const regenerate = () => {
    _seedCounter = (_seedCounter + 1337) % 999983;
    setSeed(_seedCounter);
  };

  const savePng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `flow-field-${seed}.png`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Canvas */}
      <div style={{
        position: 'relative', borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(168,85,247,0.18)',
        cursor: 'pointer',
      }}
        onClick={regenerate}
        title="Click to regenerate"
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        {rendering && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(5,0,16,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
            color: 'rgba(192,132,252,0.6)', letterSpacing: '0.1em',
          }}>
            rendering…
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 10, left: 12,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5,
          color: 'rgba(192,132,252,0.4)', letterSpacing: '0.1em',
          pointerEvents: 'none',
        }}>
          seed #{seed} · click to regenerate
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={regenerate}
          style={{
            padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
            background: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.3)',
            color: '#c084fc',
            fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.1)'}
        >
          ↺ Regenerate
        </button>
        <button
          onClick={savePng}
          style={{
            padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.45)',
            fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          ↓ Save PNG
        </button>
        <span style={{
          marginLeft: 'auto', alignSelf: 'center',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
          color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em',
        }}>
          canvas 2d · flow-field · {800}×{300}
        </span>
      </div>
    </div>
  );
}
