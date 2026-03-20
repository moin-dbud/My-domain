import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

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

/* ─── Fallback skills (used before Supabase loads) ──────────── */
const SKILLS_FALLBACK = [
    { id: 0, name: 'React', color: '#61DAFB', sym: '⚛' },
    { id: 1, name: 'Next.js', color: '#e5e5e5', sym: '▲' },
    { id: 2, name: 'TypeScript', color: '#3178C6', sym: 'TS' },
    { id: 3, name: 'JavaScript', color: '#F7DF1E', sym: 'JS' },
    { id: 4, name: 'Python', color: '#3776AB', sym: '🐍' },
    { id: 5, name: 'Node.js', color: '#339933', sym: '⬡' },
    { id: 6, name: 'OpenAI API', color: '#10a37f', sym: '◎' },
    { id: 7, name: 'MongoDB', color: '#47A248', sym: '🍃' },
];

/* ─── Main Skills Section ────────────────────────────────────── */
export default function Skills() {
    const sectionRef = useRef(null);
    const [SKILLS, setSkills] = useState(SKILLS_FALLBACK);

    useEffect(() => {
        supabase
            .from('skills')
            .select('*')
            .eq('is_visible', true)
            .order('sort_order')
            .then(({ data }) => {
                if (data && data.length > 0) setSkills(data);
            });
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                background: '#000',
                width: '100%',
                padding: 'clamp(48px, 8vw, 80px) 24px 60px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Inter',sans-serif",
                borderTop: 'none',
                margin: 0,
            }}
        >
            {/* ── Section heading ── */}
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
