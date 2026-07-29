import React, { useState, useEffect, useRef, useCallback, cloneElement } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue
} from "framer-motion";
import { GitHubCalendar } from 'react-github-calendar';

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
      {!isMobile && <PhonePortfolio rotate={sLeftRot} x={-148} y={sLeftY} zIndex={1} delay={0.10} scale={1} />}
      <PhoneLanding rotate={sCenterRot} x={0} y={sCenterY} zIndex={3} delay={0.20} scale={1.28} />
      {!isMobile && <PhoneDashboard rotate={sRightRot} x={152} y={sRightY} zIndex={2} delay={0.30} scale={1} />}
    </div>
  );
  // 
}
/* ─────────────────────────────────────────────────────────
   SHARED PHONE SHELL
───────────────────────────────────────────────────────── */
function PhoneShell({ rotate, x, y, zIndex, delay, scale = 1, time, children, href = "https://buildo-rouge.vercel.app/" }) {
  /* Base phone is 155 × 310 — side phones use scale=1, center uses scale=1.28 */
  const W = Math.round(155 * scale);
  const H = Math.round(310 * scale);
  const BR = Math.round(28 * scale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
      whileHover={{ y: -10, scale: scale * 1.02, transition: { duration: 0.28 } }}
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
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
        cursor: "pointer",
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
   PHONE 1 – Buildo Landing Page (Center main view)
───────────────────────────────────────────────────────── */
function PhoneLanding({ rotate, x, y, zIndex, delay, scale = 1 }) {
  return (
    <PhoneShell rotate={rotate} x={x} y={y} zIndex={zIndex} delay={delay} scale={scale} time="9:41">
      {/* Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{
            width: 13, height: 13, borderRadius: 3.5,
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7, color: 'white', fontWeight: 900,
          }}>B</div>
          <span style={{ fontSize: 8.5, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Buildo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Docs</span>
          <span style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Pricing</span>
          <div style={{
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            borderRadius: 999, padding: '2.5px 7px',
            fontSize: 5.5, fontWeight: 700, color: 'white',
            boxShadow: '0 0 10px rgba(168,85,247,0.4)',
          }}>Get started ✨</div>
        </div>
      </div>

      {/* Presence Engine pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 999, padding: '2px 6px', marginBottom: 5,
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          borderRadius: 3, padding: '1px 4px',
          fontSize: 4.8, fontWeight: 800, color: 'white', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>PRESENCE ENGINE</div>
        <span style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.65)' }}>Build websites for businesses &amp; brands</span>
        <span style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.35)' }}>→</span>
      </div>

      {/* Hero headline */}
      <div style={{ fontSize: 10.5, fontWeight: 900, color: 'white', lineHeight: 1.18, marginBottom: 4, letterSpacing: '-0.02em' }}>
        Build beautiful websites for{' '}
        <span style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          your business &amp; brand
        </span>
      </div>

      {/* Subtext */}
      <div style={{ fontSize: 5.8, color: 'rgba(255,255,255,0.42)', lineHeight: 1.45, marginBottom: 7 }}>
        Turn your idea into a production-ready website for your cafe, portfolio, local shop, or personal brand — powered by Buildo AI.
      </div>

      {/* Prompt input box (tall, structured container) */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 9, padding: '7px 8px', marginBottom: 6,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: 12 }}>
          e.g. Let's build a cafe website<span style={{ color: '#a855f7', fontWeight: 700 }}>|</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 5,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 3px' }}>Prisma + Postgres</span>
            <span style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 3px' }}>Better Auth</span>
          </div>
          <div style={{
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            borderRadius: 5, padding: '3px 7px',
            fontSize: 5.5, fontWeight: 700, color: 'white',
            boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
          }}>Synthesize Website ✨</div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
        {['🍴 Cafe', '💼 Portfolio', '🏪 Shop', '👤 Brand'].map((c, i) => (
          <span key={i} style={{
            fontSize: 5.5, padding: '2px 5px', borderRadius: 999,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.55)',
          }}>{c}</span>
        ))}
      </div>

      {/* Live Community Showcase section */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8, padding: '6px 7px', marginBottom: 6,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5,
        }}>
          <div style={{ fontSize: 5.2, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Live Community Sites ✦
          </div>
          <div style={{ fontSize: 5, color: '#a855f7', fontWeight: 600 }}>Explore all ↗</div>
        </div>

        {/* 2 mini site cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {/* Card 1 */}
          <div style={{
            background: 'linear-gradient(145deg,rgba(45,18,0,0.8),rgba(15,8,0,0.9))',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '5px',
          }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>Artisan Roasters</div>
            <div style={{ fontSize: 4.8, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>buildo.ai/@artisan</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 4.5, background: 'rgba(232,120,30,0.2)', color: '#ff7a3d', borderRadius: 3, padding: '1px 3px' }}>Cafe</span>
              <span style={{ fontSize: 4.5, color: 'rgba(255,255,255,0.35)' }}>⚡ 1.2k</span>
            </div>
          </div>
          {/* Card 2 */}
          <div style={{
            background: 'linear-gradient(145deg,rgba(20,10,40,0.8),rgba(10,5,25,0.9))',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '5px',
          }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>Karan Studio</div>
            <div style={{ fontSize: 4.8, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>buildo.ai/@karan</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 4.5, background: 'rgba(124,58,237,0.2)', color: '#a855f7', borderRadius: 3, padding: '1px 3px' }}>Portfolio</span>
              <span style={{ fontSize: 4.5, color: 'rgba(255,255,255,0.35)' }}>⚡ 850</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature / trust bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '3px 4px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 6,
      }}>
        <span style={{ fontSize: 5, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ color: '#a855f7' }}>⚡</span> Prompt to Live Site in &lt; 2 min
        </span>
        <span style={{ fontSize: 4.8, color: '#a855f7', fontWeight: 600 }}>Basic / Pro Plans</span>
      </div>
    </PhoneShell>
  );
}

/* ─────────────────────────────────────────────────────────
   PHONE 2 – Buildo Builder / AI Synthesis  (Right view)
───────────────────────────────────────────────────────── */
function PhoneDashboard({ rotate, x, y, zIndex, delay, scale = 1 }) {
  return (
    <PhoneShell rotate={rotate} x={x} y={y} zIndex={zIndex} delay={delay} scale={scale} time="9:41">
      {/* Top bar: project label + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 7, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
          Artisan Coffee Shop Website
        </div>
        <div style={{
          fontSize: 6, color: '#a855f7',
          background: 'rgba(168,85,247,0.14)', border: '1px solid rgba(168,85,247,0.35)',
          borderRadius: 999, padding: '1px 6px', fontWeight: 600,
        }}>Processing</div>
      </div>

      {/* Split-pane: left chat, right preview */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
        {/* Left — revision assistant */}
        <div style={{
          flex: '0 0 48%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '6px 7px',
        }}>
          <div style={{ fontSize: 6, fontWeight: 600, color: 'rgba(168,85,247,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
            Revision Assistant
          </div>
          <div style={{ background: 'rgba(124,58,237,0.18)', borderRadius: 5, padding: '4px 5px', marginBottom: 4 }}>
            <div style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
              Add photos of the roasting process, a sustainability story, and customer testimonials in a carousel.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, flexShrink: 0, color: 'white', fontWeight: 800,
            }}>B</div>
            <div style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
              I am now generating your website...
            </div>
          </div>
          <div style={{
            marginTop: 5, display: 'flex', alignItems: 'center', gap: 3,
            background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '3px 5px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(168,85,247,0.6)' }} />
            <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
              Synthesizing code changes...
            </div>
          </div>
        </div>

        {/* Right — live preview loading */}
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '8px 5px', minHeight: 90,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            border: '2.5px solid rgba(124,58,237,0.2)',
            borderTopColor: '#a855f7',
            marginBottom: 6,
          }} />
          <div style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.55)', textAlign: 'center', fontWeight: 600, lineHeight: 1.4 }}>
            Analyzing requirements &amp; design system...
          </div>
          <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
            Estimated time: 2–3 min
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
            {[1, 0.5, 0.25].map((o, i) => (
              <div key={i} style={{ width: 5, height: 3, borderRadius: 999, background: `rgba(168,85,247,${o})` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '5px 8px',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['📱', '[□]', '💻'].map((ic, i) => (
            <span key={i} style={{ fontSize: 9, opacity: i === 1 ? 1 : 0.35 }}>{ic}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Save', 'Preview', 'Publish'].map((lbl, i) => (
            <div key={i} style={{
              fontSize: 5.5, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
              background: i === 2 ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.07)',
              border: i === 2 ? 'none' : '1px solid rgba(255,255,255,0.1)',
              color: i === 2 ? 'white' : 'rgba(255,255,255,0.6)',
            }}>{lbl}</div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}


/* ─────────────────────────────────────────────────────────
   PHONE 3 – Buildo Published Site Preview
───────────────────────────────────────────────────────── */
function PhonePortfolio({ rotate, x, y, zIndex, delay, scale = 1 }) {
  return (
    <PhoneShell rotate={rotate} x={x} y={y} zIndex={zIndex} delay={delay} scale={scale} time="9:41">
      {/* Address bar */}
      <div style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 5, padding: '3px 7px', marginBottom: 7,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#39d353', flexShrink: 0 }} />
        <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          buildo.ai/@moin/artisan-coffee
        </div>
        <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.25)' }}>↗</div>
      </div>

      {/* Generated cafe site hero */}
      <div style={{
        background: 'linear-gradient(160deg,#1a0a00,#2d1200)',
        borderRadius: 8, padding: '10px 9px', marginBottom: 6, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -12, right: -12,
          width: 48, height: 48, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,120,30,0.25) 0%, transparent 70%)',
        }} />
        <div style={{ fontSize: 6, color: 'rgba(255,180,80,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
          Est. 2019
        </div>
        <div style={{ fontSize: 11, fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 3, letterSpacing: '-0.02em' }}>
          The Artisan<br />Coffee Co.
        </div>
        <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', marginBottom: 7, lineHeight: 1.4 }}>
          Specialty brews &amp; handcrafted pastries in the heart of the city.
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{
            flex: 1, height: 17, borderRadius: 999,
            background: 'linear-gradient(90deg,#c94c0a,#ff7a3d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 6, fontWeight: 700, color: 'white',
          }}>Visit Us</div>
          <div style={{
            flex: 1, height: 17, borderRadius: 999,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 6, color: 'rgba(255,255,255,0.65)',
          }}>Our Menu</div>
        </div>
      </div>

      {/* Buildo attribution badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: 7, padding: '4px 8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 10, height: 10, borderRadius: 2,
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 6, color: 'white', fontWeight: 900,
          }}>B</div>
          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.55)' }}>Built with <span style={{ color: '#a855f7', fontWeight: 700 }}>Buildo AI</span></div>
        </div>
        <div style={{
          fontSize: 5.5, color: '#a855f7', fontWeight: 600,
          border: '1px solid rgba(168,85,247,0.35)', borderRadius: 4, padding: '1px 5px',
        }}>Edit site ↗</div>
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
   GITHUB BENTO CARD
═══════════════════════════════════════════════════════════ */
const GH_USERNAME = 'moin-dbud';

function GitHubBentoCard({ cardBase, vignette }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calTooltip, setCalTooltip] = useState({ visible: false, x: 0, y: 0, count: 0, date: '' });

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        // Fetch user info + contribution calendar in parallel.
        // The contributions API is the same source react-github-calendar uses,
        // so it reflects the exact numbers shown on the GitHub profile page.
        const [userRes, calRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GH_USERNAME}`),
          fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USERNAME}?y=last`),
        ]);
        if (!userRes.ok) throw new Error('user API error');
        const user = await userRes.json();

        let last30 = 0;
        let totalYear = 0;
        if (calRes.ok) {
          const calData = await calRes.json();
          const contributions = calData.contributions ?? [];
          const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
          contributions.forEach(day => {
            totalYear += day.count ?? 0;
            if (new Date(day.date).getTime() >= cutoff) {
              last30 += day.count ?? 0;
            }
          });
        }

        if (!cancelled) {
          setStats({ repos: user.public_repos, followers: user.followers, last30, totalYear });
          setLoading(false);
        }
      } catch (_) {
        if (!cancelled) {
          // Graceful static fallback if APIs are unreachable
          setStats({ repos: 12, followers: 24, last30: 0, totalYear: 0 });
          setLoading(false);
        }
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const STAT_ITEMS = stats ? [
    { label: 'Repositories', sublabel: 'Public on GitHub', value: stats.repos, suffix: '' },
    { label: 'Contributions', sublabel: 'In the last year', value: stats.totalYear, suffix: '' },
    { label: 'Contributions', sublabel: 'In the last 30 days', value: stats.last30, suffix: '' },
  ] : [null, null, null];

  return (
    <div className={`${cardBase} relative overflow-hidden`} style={{ minHeight: 380 }}>
      <div className={vignette} />

      {/* Subtle green ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% 110%, rgba(39,211,83,0.06) 0%, transparent 70%)',
      }} />

      {/* Card content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '28px 28px 22px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
            <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontWeight: 500, margin: 0 }}>
              GitHub Activity
            </p>
          </div>
          {/* Live pulse */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#39d353', boxShadow: '0 0 6px #39d353',
              display: 'inline-block',
              animation: 'ghBentoPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Live
            </span>
          </span>
        </div>

        {/* Heading */}
        <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.15, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Code{' '}
          <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.42)' }}>
            fingerprint.
          </span>
        </h3>

        {/* Stats row — 3 large numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '20px 0 20px' }}>
          {STAT_ITEMS.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '14px 12px',
            }}>
              {loading || !item ? (
                <>
                  <div style={{ height: 32, width: '60%', borderRadius: 8, background: 'rgba(255,255,255,0.07)', marginBottom: 6, animation: 'ghSkeletonPulse 1.4s ease-in-out infinite' }} />
                  <div style={{ height: 9, width: '75%', borderRadius: 6, background: 'rgba(255,255,255,0.04)', marginBottom: 4, animation: 'ghSkeletonPulse 1.4s ease-in-out infinite 0.2s' }} />
                  <div style={{ height: 9, width: '55%', borderRadius: 6, background: 'rgba(255,255,255,0.03)', animation: 'ghSkeletonPulse 1.4s ease-in-out infinite 0.35s' }} />
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {item.value}{item.suffix}
                  </div>
                  {/* Primary label — what the number measures */}
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.label}
                  </div>
                  {/* Sub-label — the time scope / clarifier */}
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 2, letterSpacing: '0.04em', fontWeight: 400 }}>
                    {item.sublabel}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Contribution heatmap */}
        <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: 4, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}>
          <GitHubCalendar
            username={GH_USERNAME}
            year="last"
            colorScheme="dark"
            theme={{ dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] }}
            blockSize={11}
            blockMargin={3}
            blockRadius={2}
            fontSize={11}
            showWeekdayLabels
            style={{ minWidth: 520, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            renderBlock={(block, activity) => {
              const dateLabel = new Date(activity.date).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              });
              return cloneElement(block, {
                style: {
                  ...block.props.style,
                  cursor: 'pointer',
                  transition: 'transform 0.13s ease, filter 0.13s ease',
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                },
                onMouseEnter(e) {
                  e.currentTarget.style.transform = 'scale(1.6)';
                  e.currentTarget.style.filter = 'brightness(1.5)';
                  setCalTooltip({ visible: true, x: e.clientX, y: e.clientY, count: activity.count, date: dateLabel });
                },
                onMouseMove(e) {
                  setCalTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }));
                },
                onMouseLeave(e) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'brightness(1)';
                  setCalTooltip(t => ({ ...t, visible: false }));
                },
              });
            }}
          />
        </div>

        {/* GitHub profile link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 14 }}>
          <a
            href={`https://github.com/${GH_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none', letterSpacing: '0.08em',
              textTransform: 'uppercase', fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999, padding: '5px 14px',
              background: 'rgba(255,255,255,0.03)',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            @{GH_USERNAME} ↗
          </a>
        </div>
      </div>

      {/* Floating tooltip */}
      {calTooltip.visible && (
        <div aria-hidden="true" style={{
          position: 'fixed', left: calTooltip.x, top: calTooltip.y - 12,
          transform: 'translate(-50%, -100%)',
          background: '#1c2128', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, padding: '7px 12px',
          pointerEvents: 'none', zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>
            {calTooltip.count === 0 ? 'No contributions' : `${calTooltip.count} contribution${calTooltip.count !== 1 ? 's' : ''}`}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(230,237,243,0.5)' }}>{calTooltip.date}</div>
        </div>
      )}

      <style>{`
        @keyframes ghBentoPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.45); }
        }
        @keyframes ghSkeletonPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
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
              <a href="https://www.linkedin.com/in/moin-build/" aria-label="LinkedIn"
                className="hover:text-white transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com/moin-dbud" aria-label="GitHub"
                className="hover:text-white transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="https://x.com/Moin_Sheikh09" aria-label="Twitter"
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
            <button onClick={() => window.open('mailto:[EMAIL_ADDRESS]', '_blank')} className="relative z-10 w-full bg-white text-black py-4 rounded-full cursor-pointer
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

          {/* ── BOTTOM LEFT: GitHub Activity ── */}
          <GitHubBentoCard cardBase={cardBase} vignette={vignette} />

          {/* ── BOTTOM RIGHT: Founder of Buildo ── */}
          <div className={`${cardBase} relative overflow-hidden`}
            style={{
              minHeight: 380,
              background: "#080808",
              borderColor: "rgba(255,255,255,0.08)"
            }}>
            <div className={vignette} />

            {/* Subtle purple ambient under phones */}
            <div style={{
              position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "90%", height: 200,
              background: "radial-gradient(ellipse at center bottom, rgba(124,58,237,0.15) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 1
            }} />

            {/* Title pinned top-right */}
            <div style={{ position: "absolute", top: 28, right: 28, zIndex: 10, textAlign: "right" }}>
              <div style={{ lineHeight: 1.1, marginBottom: 5 }}>
                <span style={{
                  fontSize: 24, fontWeight: 800, color: "white",
                  fontFamily: "'Inter',sans-serif"
                }}>Founder of </span>
                <a href="https://buildo-rouge.vercel.app/" target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 24, fontWeight: 800,
                  fontFamily: "'Playfair Display',serif", fontStyle: "italic",
                  background: "linear-gradient(115deg,#7c3aed 0%,#a855f7 45%,#818cf8 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  cursor: "pointer",
                }}>Buildo</a>
              </div>
              <p style={{
                fontSize: 12, color: "rgba(255,255,255,0.32)",
                fontFamily: "'Playfair Display',serif", fontStyle: "italic"
              }}>
                {"< Describe it. Build it. Publish it. />"}
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