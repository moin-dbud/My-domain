import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

/* ─── Skills Data ───────────────────────────────────────────── */
const SKILLS = [
    // Frontend
    { name: 'React', color: '#61DAFB', sym: '⚛' },
    { name: 'Next.js', color: '#e5e5e5', sym: '▲' },
    { name: 'TypeScript', color: '#3178C6', sym: 'TS' },
    { name: 'JavaScript', color: '#F7DF1E', sym: 'JS' },
    { name: 'Tailwind CSS', color: '#38BDF8', sym: '⌁' },
    { name: 'Framer Motion', color: '#BB4DE8', sym: '◈' },
    { name: 'GSAP', color: '#88CE02', sym: 'GS' },
    { name: 'Redux', color: '#764ABC', sym: '⊙' },
    { name: 'Context API', color: '#61DAFB', sym: 'Ctx' },
    // Backend
    { name: 'Node.js', color: '#339933', sym: '⬡' },
    { name: 'Express.js', color: '#e5e5e5', sym: 'Ex' },
    { name: 'FastAPI', color: '#009688', sym: '⚡' },
    { name: 'Spring Boot', color: '#6DB33F', sym: '🌱' },
    // AI / Data
    { name: 'Python', color: '#3776AB', sym: '🐍' },
    { name: 'OpenAI API', color: '#10a37f', sym: '◎' },
    { name: 'Machine Learning', color: '#FF6F61', sym: '🧠' },
    { name: 'Prompt Eng.', color: '#a855f7', sym: '✦' },
    // Databases
    { name: 'MongoDB', color: '#47A248', sym: '🍃' },
    { name: 'MySQL', color: '#4479A1', sym: '⬟' },
    { name: 'Firebase', color: '#FFCA28', sym: '🔥' },
    // Auth & Security
    { name: 'JWT', color: '#d63aff', sym: '🔐' },
    { name: 'OAuth', color: '#EB5424', sym: '○' },
    { name: 'Firebase Auth', color: '#FFCA28', sym: '🔑' },
    // Tools
    { name: 'Git', color: '#F05032', sym: '⑂' },
    { name: 'GitHub', color: '#e5e5e5', sym: '' },
    { name: 'Postman', color: '#FF6C37', sym: '◎' },
    { name: 'VS Code', color: '#007ACC', sym: '⌨' },
    // DevOps
    { name: 'Vercel', color: '#e5e5e5', sym: '▲' },
    { name: 'Netlify', color: '#00C7B7', sym: '⬡' },
    { name: 'Render', color: '#46E3B7', sym: '◐' },
    { name: 'Railway', color: '#B44FEE', sym: '🚂' },
    { name: 'Docker', color: '#2496ED', sym: '🐋' },
];

/* ─── Canvas Glossy Blob ─────────────────────────────────────── */
/* Draws a multi-petal organic sculpture with realistic          */
/* lighting — specular highlights, depth shading, rim light.    */
function drawBlob(ctx, W, H, t) {
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2 + 10;
    const PETALS = 6;
    const PR = 78;  // petal tip radius from center
    const PW = 58;  // petal half-width
    const PH = 155; // petal height (tip to base)

    /* ── Soft drop shadow under blob ── */
    const shadowGrad = ctx.createRadialGradient(cx, cy + 95, 0, cx, cy + 95, 110);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 95, 110, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    /* ── Draw petals back-to-front ── */
    // Sort by depth (sin of angle) to paint back petals first
    const petalAngles = Array.from({ length: PETALS }, (_, i) =>
        ((i / PETALS) * Math.PI * 2) + t
    );
    const sorted = petalAngles
        .map((angle, i) => ({ angle, i, depth: Math.sin(angle) }))
        .sort((a, b) => a.depth - b.depth);

    for (const { angle, depth } of sorted) {
        const tipX = cx + Math.cos(angle) * PR;
        const tipY = cy + Math.sin(angle) * PR * 0.52; // squash Y = 3D perspective

        /* Lightness varies with depth — front petals are slightly lighter */
        const base = 14 + Math.max(0, depth) * 18;
        const hiBase = 28 + Math.max(0, depth) * 28;

        /* Direction for gradient along petal axis */
        const gx1 = cx + Math.cos(angle) * PR * 0.1;
        const gy1 = cy + Math.sin(angle) * PR * 0.05;
        const grad = ctx.createLinearGradient(cx, cy, tipX, tipY);
        grad.addColorStop(0, `rgb(${hiBase},${hiBase},${hiBase + 4})`);
        grad.addColorStop(0.45, `rgb(${base},${base},${base + 3})`);
        grad.addColorStop(1, `rgb(5,5,7)`);

        /* Petal shape — two bezier curves */
        const perp = angle + Math.PI / 2;
        const cpW = PW * 0.85;

        /* Control points spread around petal center */
        const c1x = cx + Math.cos(perp) * cpW + Math.cos(angle) * PR * 0.25;
        const c1y = cy + Math.sin(perp) * cpW * 0.5 + Math.sin(angle) * PR * 0.12;
        const c2x = tipX + Math.cos(perp) * cpW * 0.4;
        const c2y = tipY + Math.sin(perp) * cpW * 0.2;
        const c3x = tipX - Math.cos(perp) * cpW * 0.4;
        const c3y = tipY - Math.sin(perp) * cpW * 0.2;
        const c4x = cx - Math.cos(perp) * cpW + Math.cos(angle) * PR * 0.25;
        const c4y = cy - Math.sin(perp) * cpW * 0.5 + Math.sin(angle) * PR * 0.12;

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, tipX, tipY);
        ctx.bezierCurveTo(c3x, c3y, c4x, c4y, cx, cy);
        ctx.fill();

        /* Subtle rim highlight on petal edge */
        if (depth < -0.3) {
            const rimGrad = ctx.createLinearGradient(cx, cy, tipX, tipY);
            rimGrad.addColorStop(0, 'rgba(120,120,140,0)');
            rimGrad.addColorStop(0.6, `rgba(70,70,90,${(-depth) * 0.18})`);
            rimGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = rimGrad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.bezierCurveTo(c1x, c1y, c2x, c2y, tipX, tipY);
            ctx.stroke();
        }
    }

    /* ── Center sphere ── */
    const cSphGrad = ctx.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, 46);
    cSphGrad.addColorStop(0, 'rgba(100,100,115,0.85)');
    cSphGrad.addColorStop(0.5, 'rgba(25,25,30,0.9)');
    cSphGrad.addColorStop(1, 'rgba(6,6,8,0.95)');
    ctx.fillStyle = cSphGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();

    /* ── Primary specular highlight (top-left catch light) ── */
    const spec1 = ctx.createRadialGradient(cx - 14, cy - 18, 0, cx - 8, cy - 12, 38);
    spec1.addColorStop(0, 'rgba(255,255,255,0.42)');
    spec1.addColorStop(0.35, 'rgba(255,255,255,0.10)');
    spec1.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec1;
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 12, 38, 0, Math.PI * 2);
    ctx.fill();

    /* ── Secondary small spec (bottom-right rim) ── */
    const spec2 = ctx.createRadialGradient(cx + 22, cy + 22, 0, cx + 22, cy + 22, 16);
    spec2.addColorStop(0, 'rgba(255,255,255,0.12)');
    spec2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spec2;
    ctx.beginPath();
    ctx.arc(cx + 22, cy + 22, 16, 0, Math.PI * 2);
    ctx.fill();
}

/* ─── Blob Component ─────────────────────────────────────────── */
function GlossyBlob({ scrollYProgress }) {
    const canvasRef = useRef(null);
    const rotRef = useRef(0); // scroll-driven rotation offset

    /* Spring-smooth scroll rotation */
    const rawRot = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 1.6]);
    const springRot = useSpring(rawRot, { stiffness: 40, damping: 20 });

    /* Feed spring value into rotRef so canvas loop can read it */
    useEffect(() => {
        return springRot.on('change', (v) => { rotRef.current = v; });
    }, [springRot]);

    /* Canvas render loop */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        let animId;
        let idleT = 0; // slow idle auto-rotation

        function frame() {
            idleT += 0.006;
            drawBlob(ctx, W, H, idleT + rotRef.current);
            animId = requestAnimationFrame(frame);
        }
        frame();
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={380}
            height={360}
            style={{
                display: 'block',
                margin: '0 auto',
                maxWidth: '100%',
                filter: 'drop-shadow(0 0 60px rgba(255,255,255,0.04))',
            }}
        />
    );
}

/* ─── Skill Pill ─────────────────────────────────────────────── */
function SkillPill({ skill, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, scale: 1.05 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 999,
                background: '#0f0f10',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'default',
                fontFamily: "'Inter',sans-serif",
                userSelect: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 0 0 0 transparent',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                e.currentTarget.style.boxShadow = `0 0 14px 2px ${skill.color}22`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
            }}
        >
            {/* Icon badge */}
            <span style={{
                width: 22, height: 22,
                borderRadius: 5,
                background: skill.color + '1a',
                border: `1px solid ${skill.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                color: skill.color,
                flexShrink: 0,
                lineHeight: 1,
                letterSpacing: '-0.02em',
            }}>
                {skill.sym}
            </span>

            {/* Name */}
            <span style={{
                fontSize: 13.5, fontWeight: 500,
                color: 'rgba(255,255,255,0.8)',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
            }}>
                {skill.name}
            </span>
        </motion.div>
    );
}

/* ─── Main Skills Section ────────────────────────────────────── */
export default function Skills() {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    return (
        <section
            ref={sectionRef}
            style={{
                background: '#000',
                width: '100%',
                padding: '80px 24px 60px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Inter',sans-serif",
                borderTop: 'none',
                margin: 0,
            }}
        >
            {/* Background radial glow behind blob */}
            <div style={{
                position: 'absolute',
                top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 600, height: 500,
                background: 'radial-gradient(ellipse at center top, rgba(80,80,90,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* ── 1. Floating blob wrapper ── */}
            <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'relative', zIndex: 1, marginBottom: -20 }}
            >
                <GlossyBlob scrollYProgress={scrollYProgress} />
            </motion.div>

            {/* ── 2. Section heading ── */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: 56 }}>
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{
                        fontSize: 11, letterSpacing: '0.26em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.3)',
                        fontWeight: 500, marginBottom: 14,
                    }}
                >
                    My Skillset
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.08 }}
                    style={{
                        fontSize: 'clamp(38px, 6vw, 76px)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        margin: 0,
                    }}
                >
                    <span style={{ color: 'white' }}>The Magic </span>
                    <span style={{
                        fontStyle: 'italic',
                        fontFamily: "'Playfair Display', serif",
                        background: 'linear-gradient(90deg, #ff3ea5 0%, #ff7a18 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Behind
                    </span>
                </motion.h2>
            </div>

            {/* ── 3. Skills pill grid ── */}
            <motion.div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px 10px',
                    justifyContent: 'center',
                    maxWidth: 900,
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {SKILLS.map((skill, i) => (
                    <SkillPill key={skill.name} skill={skill} index={i} />
                ))}
            </motion.div>
        </section>
    );
}
