import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   WORLD LANDMASS BOUNDING BOXES  [latMin, latMax, lngMin, lngMax]
   Enough detail to produce recognisable continent shapes
═══════════════════════════════════════════════════════════ */
const LAND_BOXES = [
  // ── Greenland & Iceland ──────────────────────────────
  [61, 84, -73, -18], [63, 67, -25, -13],
  // ── North America ────────────────────────────────────
  [54, 72, -168, -140],   // Alaska
  [46, 72, -140, -52],   // Canada (main)
  [42, 50, -80, -52],   // Canada (eastern)
  [25, 50, -125, -66],   // USA continental
  [25, 31, -82, -80],   // Florida
  [14, 32, -118, -86],   // Mexico
  [7, 18, -92, -75],   // Central America
  [20, 23, -85, -74],   // Cuba
  [18, 21, -77, -75],   // Jamaica/Hispaniola
  // ── South America ────────────────────────────────────
  [0, 12, -80, -58],   // N coast (Colombia/Venezuela)
  [-5, 5, -74, -34],   // Northern Brazil
  [-25, 0, -73, -34],   // Central Brazil
  [-56, -25, -73, -53],   // Southern Brazil/Argentina
  [-56, -17, -75, -66],   // Chile (narrow strip)
  // ── Europe ───────────────────────────────────────────
  [51, 55, -10, -6],    // Ireland
  [50, 59, -6, 2],    // Great Britain
  [55, 59, -3, 0],    // Scotland edge
  [59, 72, 4, 16],    // Norway
  [55, 70, 16, 32],    // Sweden/Finland
  [63, 70, 24, 32],    // N Finland
  [35, 56, -10, 20],    // W/C Europe
  [36, 44, -10, 3],    // Iberian Peninsula
  [37, 47, 7, 18],    // Italy
  [36, 42, 20, 27],    // Greece
  [44, 56, 20, 42],    // E Europe / Romania / Balkans
  [36, 42, 26, 45],    // Turkey
  // ── Africa ───────────────────────────────────────────
  [18, 38, -18, 38],    // N Africa (Algeria → Egypt)
  [-5, 20, -18, 15],    // W Africa
  [-10, 5, 10, 30],    // Central Africa
  [-12, 15, 28, 52],    // E Africa
  [0, 12, 40, 52],    // Horn of Africa / Somalia
  [-36, -10, 12, 40],    // S Africa / Zimbabwe
  [-26, -12, 43, 51],    // Madagascar
  // ── Russia / C Asia ──────────────────────────────────
  [50, 72, 28, 60],    // Russia W
  [50, 72, 58, 110],    // Siberia W/Central
  [50, 72, 105, 145],    // Siberia E
  [50, 68, 140, 168],    // Russian Far East
  [51, 61, 156, 165],    // Kamchatka
  [38, 56, 50, 90],    // Kazakhstan / C Asia
  // ── Middle East ──────────────────────────────────────
  [12, 38, 27, 60],    // Arabia / Iraq / Syria
  [24, 38, 60, 75],    // Afghanistan / Pakistan
  // ── South & SE Asia ──────────────────────────────────
  [8, 35, 68, 88],    // India (main)
  [6, 10, 79, 82],    // Sri Lanka
  [28, 40, 78, 105],    // Tibet / Qinghai plateau
  [35, 55, 73, 110],    // China W / Mongolia
  [20, 42, 105, 123],    // China E / Korea
  [34, 42, 125, 131],    // Korean Peninsula
  [30, 41, 129, 142],    // Japan (Honshu/Kyushu/Shikoku)
  [41, 45, 140, 146],    // Japan (Hokkaido)
  [10, 30, 92, 108],    // Myanmar / Thailand / Vietnam
  [0, 15, 98, 104],    // Malay Peninsula
  [-6, 6, 95, 110],    // Sumatra
  [-4, 7, 108, 120],    // Borneo
  [-9, -5, 105, 115],    // Java
  [-5, 2, 119, 127],    // Sulawesi
  [5, 20, 117, 127],    // Philippines
  [-10, 0, 131, 151],    // New Guinea / Papua
  // ── Australia & Pacific ──────────────────────────────
  [-38, -12, 113, 155],   // Australia (main)
  [-44, -40, 144, 148],   // Tasmania
  [-41, -34, 172, 178],   // New Zealand (N Island)
  [-47, -41, 166, 174],   // New Zealand (S Island)
  // ── Antarctica ───────────────────────────────────────
  [-90, -67, -180, 180],
];

function isLand(lat, lng) {
  // normalise to [-180,180]
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  for (let i = 0; i < LAND_BOXES.length; i++) {
    const [la, lb, ln, lx] = LAND_BOXES[i];
    if (lat >= la && lat <= lb && lng >= ln && lng <= lx) return true;
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════
   COUNTRY CONFIG  – where to rotate the globe for each chip
   rotY = π/2 − lng_rad  (brings that longitude to center)
   rotX = −lat_rad × 0.55  (tilts to that latitude, clamped)
═══════════════════════════════════════════════════════════ */
const COUNTRY_CONFIG = {
  IN: { lat: 20, lng: 78, dot: true },
  GB: { lat: 54, lng: -2, dot: true },
  US: { lat: 39, lng: -97, dot: true },
};

function countryTarget(lat, lng) {
  const toRad = d => d * Math.PI / 180;
  return {
    rotY: Math.PI / 2 - toRad(lng),
    rotX: -toRad(lat) * 0.55,
  };
}

/* ═══════════════════════════════════════════════════════════
   DRAGGABLE WORLD-MAP GLOBE
═══════════════════════════════════════════════════════════ */
function DraggableGlobe({ size = 240, activeCountry = "IN" }) {
  const canvasRef = useRef(null);

  /* All mutable state in a single ref – no re-renders during RAF */
  const S = useRef({
    rotY: 0.210,    // India facing (rotY = π/2 − 78°)
    rotX: -0.19,
    dragging: false,
    lastX: 0, lastY: 0,
    velX: 0, velY: 0,
    targetRotY: null,
    targetRotX: null,
  });

  /* When chip changes, set a new target */
  useEffect(() => {
    const cfg = COUNTRY_CONFIG[activeCountry];
    if (!cfg) return;
    const t = countryTarget(cfg.lat, cfg.lng);
    const s = S.current;

    /* Shortest-path for rotY */
    let dY = t.rotY - s.rotY;
    while (dY > Math.PI) dY -= 2 * Math.PI;
    while (dY < -Math.PI) dY += 2 * Math.PI;

    s.targetRotY = s.rotY + dY;
    s.targetRotX = t.rotX;
  }, [activeCountry]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = W * 0.45;  /* slightly bigger fill */
    const PI = Math.PI;
    let raf;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      const s = S.current;

      /* ── Animate toward target ── */
      if (s.targetRotY !== null) {
        s.rotY += (s.targetRotY - s.rotY) * 0.055;
        s.rotX += (s.targetRotX - s.rotX) * 0.055;
        if (Math.abs(s.targetRotY - s.rotY) < 0.0008 &&
          Math.abs(s.targetRotX - s.rotX) < 0.0008) {
          s.rotY = s.targetRotY;
          s.rotX = s.targetRotX;
          s.targetRotY = null;
          s.targetRotX = null;
        }
      }

      /* ── Auto-rotate only when truly idle ── */
      if (!s.dragging && s.targetRotY === null) {
        s.rotY += 0.0018 + s.velX;
        s.rotX += s.velY;
        s.rotX = Math.max(-0.55, Math.min(0.55, s.rotX));
        s.velX *= 0.97;
        s.velY *= 0.97;
      }

      const cosY = Math.cos(s.rotY), sinY = Math.sin(s.rotY);
      const cosX = Math.cos(s.rotX), sinX = Math.sin(s.rotX);

      /* ── Atmosphere limb glow (right-side bright as in ref) ── */
      const atm = ctx.createRadialGradient(cx + R * 0.1, cy - R * 0.1, R * 0.6, cx, cy, R * 1.18);
      atm.addColorStop(0, "rgba(255,255,255,0.00)");
      atm.addColorStop(0.65, "rgba(255,255,255,0.03)");
      atm.addColorStop(0.88, "rgba(255,255,255,0.12)");
      atm.addColorStop(1, "rgba(255,255,255,0.22)");
      ctx.fillStyle = atm;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, PI * 2); ctx.fill();

      /* ── Ocean sphere ── */
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, PI * 2);
      ctx.fillStyle = "rgba(8,8,10,0.97)";
      ctx.fill();

      /* ── Land dots — fine 2.5° grid, tiny dots ── */
      const STEP = 2.5;
      for (let lat = -85; lat <= 85; lat += STEP) {
        const φ = lat * PI / 180;
        const cosφ = Math.cos(φ);
        /* Longitude step widens near poles to keep dots evenly spaced */
        const lngStep = STEP / Math.max(cosφ, 0.15);
        for (let lng = -180; lng < 180; lng += lngStep) {
          if (!isLand(lat, lng)) continue;

          const λ = lng * PI / 180;
          const x0 = R * cosφ * Math.cos(λ);
          const y0 = R * Math.sin(φ);
          const z0 = R * cosφ * Math.sin(λ);

          /* Y-rotation (longitude spin) */
          const x1 = x0 * cosY - z0 * sinY;
          const z1 = x0 * sinY + z0 * cosY;
          /* X-rotation (tilt) */
          const y1 = y0 * cosX - z1 * sinX;
          const z2 = y0 * sinX + z1 * cosX;

          if (z2 < 0) continue; /* back-face cull */

          /* Brightness: bright at front, fade at limb */
          const t = z2 / R;  /* 0..1 */
          const bright = t * 0.72 + 0.10;
          /* Dot radius: smaller at limb for depth */
          const dotR = Math.max(0.5, 1.1 * (t + 0.3));

          ctx.beginPath();
          ctx.arc(cx + x1, cy - y1, dotR, 0, PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${bright.toFixed(3)})`;
          ctx.fill();
        }
      }

      /* ── Country marker (active only) ── */
      const cfg = COUNTRY_CONFIG[activeCountry];
      if (cfg) {
        const φ = cfg.lat * PI / 180;
        const λ = cfg.lng * PI / 180;
        const x0 = R * Math.cos(φ) * Math.cos(λ);
        const y0 = R * Math.sin(φ);
        const z0 = R * Math.cos(φ) * Math.sin(λ);
        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;
        const y1 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        if (z2 > 0) {
          const px = cx + x1, py = cy - y1;

          /* Large soft glow ring */
          const g2 = ctx.createRadialGradient(px, py, 0, px, py, 22);
          g2.addColorStop(0, "rgba(255,255,255,0.55)");
          g2.addColorStop(0.35, "rgba(255,255,255,0.18)");
          g2.addColorStop(0.7, "rgba(255,255,255,0.05)");
          g2.addColorStop(1, "transparent");
          ctx.fillStyle = g2;
          ctx.beginPath(); ctx.arc(px, py, 22, 0, PI * 2); ctx.fill();

          /* Solid bright white center dot */
          ctx.beginPath(); ctx.arc(px, py, 6, 0, PI * 2);
          ctx.fillStyle = "white"; ctx.fill();

          /* Inner dark ring for contrast */
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, PI * 2);
          ctx.fillStyle = "white"; ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    frame();

    /* ── Pointer events ── */
    const start = (x, y) => {
      S.current.dragging = true;
      S.current.targetRotY = null; // cancel animation
      S.current.targetRotX = null;
      S.current.lastX = x; S.current.lastY = y;
      canvas.style.cursor = "grabbing";
    };
    const move = (x, y) => {
      if (!S.current.dragging) return;
      const dx = x - S.current.lastX;
      const dy = y - S.current.lastY;
      S.current.velX = dx * 0.006;
      S.current.velY = dy * 0.006;
      S.current.rotY += dx * 0.011;
      S.current.rotX += dy * 0.011;
      S.current.rotX = Math.max(-0.6, Math.min(0.6, S.current.rotX));
      S.current.lastX = x; S.current.lastY = y;
    };
    const end = () => { S.current.dragging = false; canvas.style.cursor = "grab"; };

    const onMD = e => start(e.clientX, e.clientY);
    const onMM = e => move(e.clientX, e.clientY);
    const onMU = () => end();
    const onTS = e => { e.preventDefault(); start(e.touches[0].clientX, e.touches[0].clientY); };
    const onTM = e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };

    canvas.addEventListener("mousedown", onMD);
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);
    canvas.addEventListener("touchstart", onTS, { passive: false });
    canvas.addEventListener("touchmove", onTM, { passive: false });
    canvas.addEventListener("touchend", end);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousedown", onMD);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchmove", onTM);
      canvas.removeEventListener("touchend", end);
    };
  }, [activeCountry]); // re-bind so activeCountry closure is fresh for markers

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ cursor: "grab", display: "block", userSelect: "none" }}
    />
  );
}
/* ═══════════════════════════════════════════════════════════
   PHOTO ARC WHEEL  (unchanged)
═══════════════════════════════════════════════════════════ */
function SceneContent({ scene }) {
  const images = {
    image1: "/image1.webp", image2: "/image2.webp", image3: "/image3.webp",
    image4: "/image4.webp", image5: "/image5.webp", image6: "/image6.webp",
    image7: "/image7.webp", image8: "/image8.webp", image9: "/image9.webp",
    image10: "/image10.webp",
  };
  return (
    <img src={images[scene]} alt="" draggable="false"
      className="w-full h-full object-cover object-[center_30%]"
      onError={e => { e.currentTarget.style.display = "none"; }}
    />
  );
}

const ARC_R = 420, PIVOT_FROM_TOP = 520, CARD_W = 140, CARD_H = 210, AREA_H = 260;
const ARC_R_M = 260, PIVOT_FROM_TOP_M = 320, CARD_W_M = 90, CARD_H_M = 135, AREA_H_M = 160;
const IMAGE_LIST = ["image1", "image2", "image3", "image4", "image5", "image6", "image7", "image8", "image9", "image10"];
const ARC_CARDS_DATA = [...IMAGE_LIST, ...IMAGE_LIST, ...IMAGE_LIST].map(
  (scene, i) => ({ baseAngle: (i - IMAGE_LIST.length) * 28, scene })
);

function ArcPhotoCard({ baseAngle, scene, rotation, mobile = false }) {
  const R = mobile ? ARC_R_M : ARC_R;
  const PIVOT = mobile ? PIVOT_FROM_TOP_M : PIVOT_FROM_TOP;
  const CW = mobile ? CARD_W_M : CARD_W;
  const CH = mobile ? CARD_H_M : CARD_H;
  const x = useTransform(rotation, o => R * Math.sin(((baseAngle + o) * Math.PI) / 180));
  const y = useTransform(rotation, o => PIVOT - R * Math.cos(((baseAngle + o) * Math.PI) / 180) - CH / 2);
  const rotate = useTransform(rotation, o => baseAngle + o);
  const opacity = useTransform(rotation, o => {
    const a = Math.abs(baseAngle + o);
    return a <= 30 ? 1 : a >= 90 ? 0 : 1 - (a - 30) / 60;
  });
  const scale = useTransform(rotation, o => Math.max(0.75, 1 - Math.abs(baseAngle + o) * 0.002));
  const zIndex = useTransform(rotation, o => Math.max(1, Math.round(20 - Math.abs(baseAngle + o) / 5)));
  return (
    <motion.div style={{
      position: "absolute", left: "50%", top: 0, marginLeft: -CW / 2,
      x, y, rotate, opacity, scale, zIndex,
      width: CW, height: CH, borderRadius: 18, overflow: "hidden",
      boxShadow: "0 14px 44px rgba(0,0,0,0.88), 0 4px 12px rgba(0,0,0,0.7)",
      border: "1px solid rgba(255,255,255,0.11)",
    }}>
      <SceneContent scene={scene} />
    </motion.div>
  );
}

function PhotoCardsGroup({ mobile = false }) {
  const { scrollY } = useScroll();
  const scrollRot = useTransform(scrollY, [0, 2000], [0, -120]);
  const smooth = useSpring(scrollRot, { stiffness: 60, damping: 20 });
  const drag = useMotionValue(0);
  const dragSpring = useSpring(drag, { stiffness: 120, damping: 18 });
  const rotation = useTransform([smooth, dragSpring], ([s, d]) => s + d);
  const areaH = mobile ? AREA_H_M : AREA_H;
  return (
    <motion.div drag="x" dragMomentum dragElastic={0.25}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={(_, info) => drag.set(drag.get() + info.delta.x * 0.25)}
      style={{ position: "relative", height: areaH, overflow: "visible", cursor: "grab" }}>
      {ARC_CARDS_DATA.map((c, i) => (
        <ArcPhotoCard key={i} baseAngle={c.baseAngle} scene={c.scene} rotation={rotation} mobile={mobile} />
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANALOG CLOCK  (Tailwind div-based)
═══════════════════════════════════════════════════════════ */
function AnalogClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sec = time.getSeconds();
  const min = time.getMinutes();
  const hr = time.getHours();
  const secDeg = sec * 6;
  const minDeg = min * 6 + sec * 0.1;
  const hrDeg = (hr % 12) * 30 + min * 0.5;

  return (
    <div className="relative w-[390px] h-[390px]">
      <div className="absolute inset-0 rounded-full border border-white/10
        bg-[radial-gradient(circle_at_40%_35%,#282828_0%,#111_55%,#050505_100%)]" />
      <div className="absolute inset-[35px] rounded-full border border-white/[0.08]" />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)` }}>
          <div className="absolute top-[48px] left-1/2 -translate-x-1/2
            w-[4px] h-[18px] bg-white/80 rounded" />
        </div>
      ))}
      {Array.from({ length: 60 }).map((_, i) => i % 5 !== 0 && (
        <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 6}deg)` }}>
          <div className="absolute top-[54px] left-1/2 -translate-x-1/2
            w-[1.5px] h-[8px] bg-white/20 rounded" />
        </div>
      ))}
      <div className="absolute left-1/2 bottom-1/2 w-[6px] h-[90px] bg-white rounded-full origin-bottom"
        style={{ transform: `translateX(-50%) rotate(${hrDeg}deg)`, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />
      <div className="absolute left-1/2 bottom-1/2 w-[4px] h-[130px] bg-white rounded-full origin-bottom"
        style={{ transform: `translateX(-50%) rotate(${minDeg}deg)`, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))" }} />
      <div className="absolute left-1/2 bottom-1/2 w-[2px] h-[150px] bg-red-400 origin-bottom"
        style={{ transform: `translateX(-50%) rotate(${secDeg}deg)` }} />
      <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
      <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-20" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHONE MOCKUP
═══════════════════════════════════════════════════════════ */
/* ─────────────────────────────────────────────────────────
   PHONE MOCKUPS GROUP — scroll-driven parallax
───────────────────────────────────────────────────────── */
function PhoneMockupsGroup() {
  const { scrollY } = useScroll();

  /* Center phone: slowly floats upward as user scrolls */
  const centerY = useTransform(scrollY, [0, 1800], [0, -38]);
  const centerRot = useTransform(scrollY, [0, 1800], [0, 3]);

  /* Left phone: drifts up faster + tips slightly */
  const leftY = useTransform(scrollY, [0, 1800], [60, 18]);
  const leftRot = useTransform(scrollY, [0, 1800], [-13, -8]);

  /* Right phone: drifts down a bit + counter-tips */
  const rightY = useTransform(scrollY, [0, 1800], [65, 95]);
  const rightRot = useTransform(scrollY, [0, 1800], [13, 8]);

  /* Smooth springs so motion feels organic */
  const sCenterY = useSpring(centerY, { stiffness: 40, damping: 18 });
  const sCenterRot = useSpring(centerRot, { stiffness: 40, damping: 18 });
  const sLeftY = useSpring(leftY, { stiffness: 35, damping: 16 });
  const sLeftRot = useSpring(leftRot, { stiffness: 35, damping: 16 });
  const sRightY = useSpring(rightY, { stiffness: 45, damping: 20 });
  const sRightRot = useSpring(rightRot, { stiffness: 45, damping: 20 });

  /* Detect mobile for phone layout */
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 640);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{
      position: "absolute", bottom: -30, left: "50%",
      transform: "translateX(-50%)", width: "100%",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 5
    }}>
      {/* On mobile: only center phone. On desktop: all three */}
      {!isMobile && <PhoneLanding rotate={sLeftRot} x={-148} y={sLeftY} zIndex={1} delay={0.10} />}
      <PhoneDashboard rotate={sCenterRot} x={isMobile ? 0 : 0} y={sCenterY} zIndex={3} delay={0.20} />
      {!isMobile && <PhonePortfolio rotate={sRightRot} x={152} y={sRightY} zIndex={2} delay={0.30} />}
    </div>
  );
}
/* ─────────────────────────────────────────────────────────
   SHARED PHONE SHELL
───────────────────────────────────────────────────────── */
function PhoneShell({ rotate, x, y, zIndex, delay, scale = 1, time, children }) {
  /* Base phone is 155 × 310 — side phones use scale=1, center uses scale=1.28 */
  const W = Math.round(155 * scale);
  const H = Math.round(310 * scale);
  const BR = Math.round(28 * scale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
      whileHover={{ y: -10, transition: { duration: 0.28 } }}
      style={{
        position: "absolute",
        rotate, x, y, zIndex,
        width: W, height: H, borderRadius: BR,
        background: "#0c0c0c",
        border: `${scale > 1 ? 2 : 1.5}px solid rgba(255,255,255,${scale > 1 ? 0.15 : 0.10})`,
        boxShadow: scale > 1
          ? "0 36px 80px rgba(0,0,0,0.97), 0 10px 28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 24px 60px rgba(0,0,0,0.92), 0 6px 20px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      {/* Dynamic island */}
      <div style={{
        position: "absolute", top: Math.round(10 * scale), left: "50%",
        transform: "translateX(-50%)",
        width: Math.round(52 * scale), height: Math.round(7 * scale),
        background: "#050505", borderRadius: 999, zIndex: 20
      }} />

      {/* Status bar */}
      <div style={{
        padding: `${Math.round(20 * scale)}px ${Math.round(13 * scale)}px ${Math.round(3 * scale)}px`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: Math.round(8 * scale), color: "rgba(255,255,255,0.55)", fontWeight: 600
      }}>
        <span>{time}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {/* Signal bars */}
          <svg width={Math.round(11 * scale)} height={Math.round(8 * scale)} viewBox="0 0 11 8" fill="none">
            <rect x="0" y="4" width="2" height="4" rx="0.5" fill="rgba(255,255,255,0.55)" />
            <rect x="3" y="2.5" width="2" height="5.5" rx="0.5" fill="rgba(255,255,255,0.55)" />
            <rect x="6" y="1" width="2" height="7" rx="0.5" fill="rgba(255,255,255,0.55)" />
            <rect x="9" y="0" width="2" height="8" rx="0.5" fill="rgba(255,255,255,0.3)" />
          </svg>
          {/* WiFi */}
          <svg width={Math.round(11 * scale)} height={Math.round(8 * scale)} viewBox="0 0 12 9" fill="none">
            <path d="M6 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="rgba(255,255,255,0.55)" />
            <path d="M3.2 5C4 4.2 5 3.8 6 3.8s2 .4 2.8 1.2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M1 2.8C2.5 1.3 4.1.5 6 .5s3.5.8 5 2.3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          {/* Battery */}
          <svg width={Math.round(18 * scale)} height={Math.round(9 * scale)} viewBox="0 0 20 10" fill="none">
            <rect x="0.5" y="0.5" width="17" height="9" rx="2.5" stroke="rgba(255,255,255,0.4)" />
            <rect x="2" y="2" width="12" height="6" rx="1.5" fill="rgba(255,255,255,0.85)" />
            <path d="M18.5 3.5v3" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{
        padding: `3px ${Math.round(12 * scale)}px ${Math.round(10 * scale)}px`,
        height: `calc(100% - ${Math.round(38 * scale)}px)`, overflow: "hidden"
      }}>
        {children}
      </div>

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: Math.round(48 * scale),
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 8
      }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PHONE 1 – MadeIt Landing Page
───────────────────────────────────────────────────────── */
function PhoneLanding({ rotate, x, y, zIndex, delay }) {
  return (
    <PhoneShell rotate={rotate} x={x} y={y} zIndex={zIndex} delay={delay} time="9:41">
      {/* Mini navbar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 7, flexWrap: "wrap" }}>
        {["Works", "Port.", "Docs", "About"].map((n, i) => (
          <span key={i} style={{
            fontSize: 6, color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.05)", borderRadius: 3, padding: "1px 4px"
          }}>{n}</span>
        ))}
      </div>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 5,
          background: "linear-gradient(135deg,#e84c1e,#ff7a3d)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11
        }}>↑</div>
        <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>MadeIt</span>
      </div>

      {/* Tagline pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px", borderRadius: 999, marginBottom: 7,
        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)"
      }}>
        <span style={{ fontSize: 7 }}>🚀</span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.65)" }}>
          Productivity • Progress • Proof
        </span>
      </div>

      {/* Headline */}
      <div style={{
        fontSize: 12, fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 5,
        letterSpacing: "-0.02em"
      }}>
        Finish real<br />projects.<br />
        <span style={{ fontSize: 11 }}>Build proof of work.</span>
      </div>

      {/* Subtext */}
      <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, marginBottom: 9 }}>
        MadeIt helps students complete real projects using milestone‑based execution.
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{
          flex: 1, height: 20, borderRadius: 999, background: "#e84c1e",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 7, fontWeight: 700, color: "white"
        }}>
          Start Building
        </div>
        <div style={{
          flex: 1, height: 20, borderRadius: 999,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 7, color: "rgba(255,255,255,0.7)"
        }}>
          See How It Works
        </div>
      </div>
    </PhoneShell>
  );
}

/* ─────────────────────────────────────────────────────────
   PHONE 2 – Dashboard  (center, slightly larger)
───────────────────────────────────────────────────────── */
function PhoneDashboard({ rotate, x, y, zIndex, delay }) {
  return (
    <PhoneShell rotate={rotate} x={x} y={y} zIndex={zIndex} delay={delay} scale={1.28} time="9:41">
      {/* Greeting */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>Hi, Moin</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
          <span style={{
            fontSize: 7, fontWeight: 600, color: "#e84c1e",
            background: "rgba(232,76,30,0.12)", border: "1px solid rgba(232,76,30,0.35)",
            borderRadius: 999, padding: "1px 7px"
          }}>Web Development</span>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.42)" }}>Project in progress</span>
        </div>
      </div>

      {/* Current project card */}
      <div style={{
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "8px 9px", marginBottom: 6
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
          <div>
            <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.38)", marginBottom: 2 }}>Current Project</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "white", lineHeight: 1.2 }}>
              Personal Portfolio<br />Website
            </div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>
              Next: Review requirements
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e84c1e", lineHeight: 1 }}>17%</div>
            <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.4)" }}>Complete</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.1)", marginBottom: 6, overflow: "hidden" }}>
          <div style={{
            width: "17%", height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg,#e84c1e,#ff7a3d)"
          }} />
        </div>
        {/* Continue btn */}
        <div style={{
          height: 22, borderRadius: 7,
          background: "linear-gradient(90deg,#e84c1e,#ff7a3d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 700, color: "white", gap: 4
        }}>
          Continue Project →
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
        {[["✓", "Projects", "0"], ["✓", "Tasks", "6"], ["📅", "Active Days", "2"]].map(([ic, label, val], i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 7, padding: "5px 5px" }}>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginBottom: 2 }}>{ic} {label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Portfolio banner */}
      <div style={{
        background: "rgba(255,255,255,0.05)", borderRadius: 7,
        padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, color: "white", marginBottom: 1 }}>
            Your portfolio updates as you build.
          </div>
          <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)" }}>Share your proof of work.</div>
        </div>
        <div style={{
          fontSize: 7, fontWeight: 600, color: "white",
          border: "1px solid rgba(255,255,255,0.2)", borderRadius: 5,
          padding: "3px 6px", whiteSpace: "nowrap"
        }}>View ↗</div>
      </div>
    </PhoneShell>
  );
}

/* ─────────────────────────────────────────────────────────
   PHONE 3 – Portfolio Profile
───────────────────────────────────────────────────────── */
function PhonePortfolio({ rotate, x, y, zIndex, delay }) {
  return (
    <PhoneShell rotate={rotate} x={x} y={y} zIndex={zIndex} delay={delay} time="9:41">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "linear-gradient(135deg,#e84c1e,#ff7a3d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, flexShrink: 0
        }}>M</div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "white", lineHeight: 1.1 }}>Moin Sheikh</div>
          <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.4)" }}>AI Developer &amp; Web Innovator</div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, marginBottom: 7 }}>
        Passionate AI &amp; Data Science student building intelligent systems and modern web applications.
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
        {["GitHub", "LinkedIn", "Download PDF", "Share"].map((btn, i) => (
          <div key={i} style={{
            height: 18, borderRadius: 5, fontSize: 6.5, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: i < 2 ? "rgba(255,255,255,0.08)" : i === 2 ? "rgba(232,76,30,0.2)" : "rgba(255,255,255,0.05)",
            border: i === 2 ? "1px solid rgba(232,76,30,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: i === 2 ? "#ff7a3d" : "rgba(255,255,255,0.7)",
          }}>{btn}</div>
        ))}
      </div>

      {/* Skills section */}
      <div style={{ fontSize: 7, fontWeight: 700, color: "white", marginBottom: 5 }}>
        Skills Proven Through Work
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {["HTML5", "CSS3", "JavaScript", "Responsive", "Git", "Deploy"].map((skill, i) => (
          <span key={i} style={{
            fontSize: 6, padding: "2px 6px", borderRadius: 999,
            background: "rgba(232,76,30,0.12)",
            border: "1px solid rgba(232,76,30,0.3)",
            color: "rgba(255,180,140,0.9)",
          }}>{skill}</span>
        ))}
      </div>
    </PhoneShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB DATA
═══════════════════════════════════════════════════════════ */
const TAB_CONTENT = {
  AI: { title: "AI-powered experiences", text: "I integrate intelligent models into products so software doesn't just respond — it understands." },
  Systems: { title: "Scalable systems", text: "From APIs to databases, I design reliable architectures built for real-world usage." },
  UX: { title: "Human-first interfaces", text: "Complex technology should feel simple. Every interaction is designed for clarity and speed." },
  Impact: { title: "Real-world impact", text: "I build tools that solve meaningful problems — not just experiments." },
};

/* ═══════════════════════════════════════════════════════════
   TIMEZONE CHIP
═══════════════════════════════════════════════════════════ */
const TZ_CHIPS = [
  { code: "GB", name: "UK", active: false },
  { code: "IN", name: "India", active: true },
  { code: "US", name: "USA", active: false },
];

function TzChip({ code, name, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "9px 22px", borderRadius: 999,
        width: 160,
        background: isActive ? "rgba(135,82,8,0.48)" : "rgba(255,255,255,0.06)",
        border: isActive
          ? "1px solid rgba(196,130,28,0.6)"
          : "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer", transition: "all 0.25s ease",
      }}
    >
      <span style={{
        fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em",
        color: isActive ? "rgba(245,185,55,0.95)" : "rgba(255,255,255,0.38)"
      }}>
        {code}
      </span>
      <span style={{
        fontSize: 15, fontWeight: isActive ? 600 : 400,
        color: isActive ? "white" : "rgba(255,255,255,0.65)"
      }}>
        {name}
      </span>
    </button>
  );
}
/* ═══════════════════════════════════════════════════════════
   MAIN ABOUT
═══════════════════════════════════════════════════════════ */
const About = () => {
  const tabs = Object.keys(TAB_CONTENT);
  const [activeTab, setActiveTab] = useState("AI");
  const [spot, setSpot] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(new Date());
  const [activeCountry, setActiveCountry] = useState("IN");
  const email = "hello@moinsheikh.in";

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(email); } catch (_) { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handle = e => {
      const idx = tabs.indexOf(activeTab);
      if (e.key === "ArrowRight") setActiveTab(tabs[(idx + 1) % tabs.length]);
      if (e.key === "ArrowLeft") setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [activeTab]);

  const cardBase = `rounded-3xl border border-white/[0.1]
    bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.08),transparent_100%)]
    backdrop-blur-xl`;
  const vignette = `absolute inset-0 rounded-3xl pointer-events-none
    bg-[radial-gradient(circle_at_center,transparent_45%,rgba(100, 97, 97, 0.65)_100%)]`;

  return (
    <section className="w-full bg-black text-white px-4 sm:px-12 py-10 sm:py-15"
      style={{ fontFamily: "'Inter',sans-serif" }}>
      <div className="max-w-8xl mx-auto">

        {/* ════════════ TOP ROW — desktop: 3-col grid | mobile: single col stack ════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2.2fr_1fr] gap-6 sm:gap-9 relative" style={{ zIndex: 10 }}>

          {/* LEFT: Intro card */}
          <div className={`${cardBase} relative p-6 h-[440px] sm:h-[500px] flex flex-col justify-between overflow-hidden`}>
            <div className={vignette} />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Moin{" "}
                <span className="italic font-light text-[#686868]"
                  style={{ letterSpacing: "-0.01em", fontFamily: "'Playfair Display',serif" }}>
                  Sheikh
                </span>
              </h2>
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-1 ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(102, 102, 102, 1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Nagpur, IN • {timeStr}</p>
            </div>
            {/* Smaller arc wheel on mobile */}
            <div className="hidden sm:block"><PhotoCardsGroup /></div>
            <div className="sm:hidden"><PhotoCardsGroup mobile={true} /></div>
            <div className="flex justify-center gap-6 text-gray-400 relative z-10">
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn"
                className="hover:text-white transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" aria-label="GitHub"
                className="hover:text-white transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" aria-label="Twitter"
                className="hover:text-white transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* CENTER: AI-Driven card — z:30 so clock floats above bottom cards (desktop only) */}
          <div className={`${cardBase} relative overflow-hidden sm:overflow-visible`}
            style={{ zIndex: 30, height: undefined }}
          >
            <div className={vignette} />
            <div className="relative z-10 p-6 sm:p-10 h-full" style={{ minHeight: 320 }}>
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div className="flex items-center gap-3 text-xs tracking-widest text-gray-400">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                    🤖
                  </div>
                  AI-DRIVEN DEVELOPMENT
                </div>
                <div className="text-xs tracking-widest text-gray-500">PHILOSOPHY ✦</div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Intelligent<br />
                <span className="italic font-light text-gray-400"
                  style={{ letterSpacing: "-0.01em", fontFamily: "'Playfair Display',serif" }}>
                  systems that scale.
                </span>
              </h1>
              <p className="text-gray-400 text-[12px] mt-2 max-w-[280px]">
                I build AI-powered applications and scalable web systems that transform ideas into real-world products.
              </p>
              {/* Tabs — inline on mobile, absolute on desktop */}
              <div className="mt-6 sm:absolute sm:top-24 sm:right-10 sm:text-right">
                <div className="flex gap-2 sm:justify-end mb-4 sm:mb-5 flex-wrap">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`relative px-3 py-1 text-[10px] rounded-full border transition-all duration-300
                        ${activeTab === tab
                          ? "border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                          : "border-white/10 text-gray-400 hover:text-white"}`}>
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute inset-0 rounded-full blur-md bg-purple-500/30 -z-10" />
                      )}
                    </button>
                  ))}
                </div>
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}>
                  <p className="text-white text-[14px] sm:text-[15px] font-medium">{TAB_CONTENT[activeTab].title}</p>
                  <p className="text-gray-500 text-[12px] sm:max-w-[220px] sm:ml-auto mt-1">
                    {TAB_CONTENT[activeTab].text}
                  </p>
                </motion.div>
              </div>
            </div>
            {/* Black cutout disc + Clock — DESKTOP ONLY */}
            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-[-255px]
              w-[450px] h-[450px] rounded-full bg-black z-20" />
            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-[-225px] z-30">
              <AnalogClock />
            </div>
          </div>

          {/* RIGHT: Contact card */}
          <div
            onMouseMove={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setSpot({ x: e.clientX - r.left, y: e.clientY - r.top });
            }}
            className="relative rounded-3xl border border-white/[0.1]
              bg-[#0a0a0a] backdrop-blur-xl p-6 sm:p-8 flex flex-col
              justify-between overflow-hidden group transition-all duration-300"
            style={{ minHeight: 320 }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
              style={{ background: `radial-gradient(300px circle at ${spot.x}px ${spot.y}px,rgba(255,255,255,0.12),transparent 60%)` }} />
            <div className={vignette.replace("0.65", "0.7")} />
            <div className="flex justify-between items-center relative z-10">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white/80" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 bg-black border border-white/10 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                Available for work
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                LET'S BUILD<br />SOMETHING<br />
                <span className="italic font-light text-gray-400"
                  style={{ letterSpacing: "-0.01em", fontFamily: "'Playfair Display',serif" }}>
                  that actually works.
                </span>
              </h2>
              <div className="mt-6 sm:mt-8">
                <button onClick={copyEmail}
                  className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity w-full">
                  <span className="text-white/70 flex-shrink-0">⬢</span>
                  <span className="italic text-base sm:text-xl truncate" style={{ fontFamily: "'Playfair Display',serif" }}>
                    {email}
                  </span>
                </button>
                <p className="mt-3 text-[11px] tracking-[0.25em] text-gray-500 uppercase">
                  {copied ? "Copied to clipboard ✓" : "Tap to copy email"}
                </p>
              </div>
            </div>
            <button className="relative z-10 w-full bg-white text-black py-4 rounded-full
              font-medium tracking-wide hover:scale-[1.02] transition-all">
              CONNECT NOW ↗
            </button>
          </div>
        </div>
        {/* END TOP ROW */}


        {/* ════════════ BOTTOM ROW ════════════
            Two equal cards. Clock (z:30 from top row) floats
            perfectly over the gap at center 50%.
            z:5 keeps bottom cards behind the clock.
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-9 relative"
          style={{ zIndex: 5, marginTop: 24 }}>

          {/* ── BOTTOM LEFT: Available Globally ── */}
          <div className={`${cardBase} relative overflow-hidden`}
            style={{ minHeight: 380 }}>
            <div className={vignette} />

            {/* Globe fills entire card — smaller on mobile */}
            <div className="hidden sm:block" style={{
              position: "absolute",
              bottom: -80, left: -80,
              zIndex: 3,
            }}>
              <DraggableGlobe size={480} activeCountry={activeCountry} />
            </div>
            <div className="sm:hidden" style={{
              position: "absolute",
              bottom: -40, left: -40,
              zIndex: 3,
            }}>
              <DraggableGlobe size={300} activeCountry={activeCountry} />
            </div>

            {/* Text — top-left */}
            <div className="absolute top-7 left-7 z-10">
              <p className="text-[10px] tracking-[0.18em] text-gray-500 uppercase font-medium mb-3">
                Available Globally
              </p>
              <h3 className="text-[22px] font-bold leading-snug text-white">
                Adaptable across<br />time zones
              </h3>
            </div>

            {/* Chips — right side, below text on mobile */}
            <div className="hidden sm:flex" style={{
              position: "absolute", right: 7, top: 180, zIndex: 10,
              flexDirection: 'column', gap: 3,
            }}>
              {TZ_CHIPS.map(({ code, name }) => (
                <TzChip
                  key={code}
                  code={code}
                  name={name}
                  isActive={activeCountry === code}
                  onClick={() => setActiveCountry(code)}
                />
              ))}
            </div>

            {/* Mobile TZ chips — simple row below text */}
            <div className="flex sm:hidden" style={{
              position: "absolute", top: 90, left: 16, right: 16,
              zIndex: 10, gap: 6, flexWrap: 'wrap',
            }}>
              {TZ_CHIPS.map(({ code, name }) => (
                <button
                  key={code}
                  onClick={() => setActiveCountry(code)}
                  style={{
                    padding: '6px 12px', borderRadius: 999, fontSize: 12,
                    background: activeCountry === code ? 'rgba(135,82,8,0.48)' : 'rgba(255,255,255,0.06)',
                    border: activeCountry === code ? '1px solid rgba(196,130,28,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    color: activeCountry === code ? 'rgba(245,185,55,0.95)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                  }}
                >
                  {code} {name}
                </button>
              ))}
            </div>

            {/* Remote label — bottom-right */}
            <div className="absolute bottom-6 right-7 z-10 text-right">
              <div className="flex items-center justify-end gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-[10px] text-gray-500 tracking-[0.18em] uppercase">Remote</p>
              </div>
              <p className="text-white font-bold text-[18px] leading-tight">
                {TZ_CHIPS.find(c => c.code === activeCountry)?.name}
              </p>
            </div>
          </div>

          {/* ── BOTTOM RIGHT: Founder of MadeIt ── */}
          <div className={`${cardBase} relative overflow-hidden`}
            style={{
              minHeight: 380,
              background: "#080808",
              borderColor: "rgba(255,255,255,0.08)"
            }}>
            <div className={vignette} />

            {/* Subtle orange ambient under phones */}
            <div style={{
              position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "90%", height: 200,
              background: "radial-gradient(ellipse at center bottom, rgba(232,76,30,0.12) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 1
            }} />

            {/* Title pinned top-right (mirrors Rune card in reference) */}
            <div style={{ position: "absolute", top: 28, right: 28, zIndex: 10, textAlign: "right" }}>
              <div style={{ lineHeight: 1.1, marginBottom: 5 }}>
                <span style={{
                  fontSize: 24, fontWeight: 800, color: "white",
                  fontFamily: "'Inter',sans-serif"
                }}>Founder of </span>
                <span style={{
                  fontSize: 24, fontWeight: 800,
                  fontFamily: "'Playfair Display',serif", fontStyle: "italic",
                  background: "linear-gradient(115deg,#e84c1e 0%,#ff7a3d 42%,#ff5fa0 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>MadeIt</span>
              </div>
              <p style={{
                fontSize: 12, color: "rgba(255,255,255,0.32)",
                fontFamily: "'Playfair Display',serif", fontStyle: "italic"
              }}>
                {"< Turning real projects into proof-of-work portfolios />"}
              </p>
            </div>

            {/* Phones — absolute bottom, overflow clipped by card's overflow:hidden */}
            <PhoneMockupsGroup />
          </div>
        </div>
        {/* END BOTTOM ROW */}

      </div>
    </section>
  );
};

export default About;