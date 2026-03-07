import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ─── Command Data ───────────────────────────────────────────── */
const COMMANDS = [
    /* Pages */
    {
        group: 'Pages',
        items: [
            {
                id: 'home', label: 'Home', sub: 'Go to homepage', href: '/',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                ),
            },
            {
                id: 'about', label: 'About', sub: 'Learn more about me', href: '#about',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                ),
            },
            {
                id: 'projects', label: 'Projects', sub: 'View my work', href: '#projects',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                    </svg>
                ),
            },
            {
                id: 'blog', label: 'Blog', sub: 'Read my thoughts', href: '#blog',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                ),
            },
            {
                id: 'guestbook', label: 'Guestbook', sub: 'Leave your mark', href: '#guestbook',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                ),
            },
            {
                id: 'uses', label: 'Uses', sub: 'My gear & software', href: '#uses',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                    </svg>
                ),
            },
        ],
    },
    /* Links */
    {
        group: 'Links',
        items: [
            {
                id: 'github', label: 'GitHub', sub: 'View my repositories', href: 'https://github.com/moin-dbud', external: true,
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                ),
            },
            {
                id: 'linkedin', label: 'LinkedIn', sub: 'Connect with me', href: 'https://linkedin.com', external: true,
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                    </svg>
                ),
            },
            {
                id: 'twitter', label: 'Twitter', sub: 'Follow my thoughts', href: 'https://twitter.com', external: true,
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                ),
            },
            {
                id: 'contact', label: 'Contact', sub: 'Send me a message', href: 'mailto:moin@example.com', external: true,
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                ),
            },
        ],
    },
    /* Actions */
    {
        group: 'Actions',
        items: [
            {
                id: 'playground', label: 'Open AI Playground', sub: 'Interact with AI systems', href: '/playground',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L13.5 9L20 10.5L13.5 12L12 19L10.5 12L4 10.5L10.5 9L12 2Z" fill="#a855f7" stroke="none" />
                    </svg>
                ),
                accent: '#a855f7',
            },
            {
                id: 'view-projects', label: 'View Projects', sub: "See what I've built", href: '#projects',
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                    </svg>
                ),
                accent: '#6366f1',
            },
            {
                id: 'resume', label: 'Download Resume', sub: 'Get my CV as PDF', href: '/resume.pdf', external: true,
                icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                ),
                accent: '#10b981',
            },
        ],
    },
];

/* ─── Injected CSS ──────────────────────────────────────────── */
const cmdStyles = `
  .cmd-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.14s;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    color: inherit;
  }
  .cmd-item.active,
  .cmd-item:hover {
    background: rgba(255,255,255,0.07);
  }
`;

/* ─── Command Palette ────────────────────────────────────────── */
export default function CommandPalette({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    /* Flatten all items + filter */
    const allItems = COMMANDS.flatMap(g => g.items);
    const filtered = query.trim()
        ? allItems.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.sub.toLowerCase().includes(query.toLowerCase())
        )
        : null; /* null = show grouped */

    /* Groups to render */
    const groups = filtered
        ? [{ group: 'Results', items: filtered }]
        : COMMANDS;

    /* All flat items for keyboard indexing */
    const flatItems = groups.flatMap(g => g.items);

    /* Reset on open */
    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIdx(0);
            setTimeout(() => inputRef.current?.focus(), 30);
        }
    }, [open]);

    /* Lock body scroll while palette is open */
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [open]);

    /* Clamp activeIdx */
    useEffect(() => {
        setActiveIdx(v => Math.min(v, Math.max(flatItems.length - 1, 0)));
    }, [flatItems.length]);

    const navigate = useCallback((item) => {
        if (!item) return;
        if (item.external) {
            window.open(item.href, '_blank', 'noopener noreferrer');
        } else {
            window.location.href = item.href;
        }
        onClose();
    }, [onClose]);

    /* Keyboard handler */
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx(i => Math.min(i + 1, flatItems.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx(i => Math.max(i - 1, 0));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                navigate(flatItems[activeIdx]);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, flatItems, activeIdx, navigate, onClose]);

    /* Scroll active item into view */
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    let globalIdx = 0;

    return (
        <>
            <style>{cmdStyles}</style>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            onClick={onClose}
                            style={{
                                position: 'fixed', inset: 0,
                                background: 'rgba(0,0,0,0.75)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                zIndex: 999,
                            }}
                        />

                        {/* Palette card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -12 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'fixed',
                                top: '18%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '100%',
                                maxWidth: 580,
                                background: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 18,
                                boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
                                zIndex: 1000,
                                overflow: 'hidden',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            {/* Search input */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '14px 18px',
                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                            }}>
                                {/* Search icon */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>

                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
                                    placeholder="Type a command or search..."
                                    style={{
                                        flex: 1,
                                        background: 'none',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'white',
                                        fontSize: 15,
                                        fontFamily: "'Inter', sans-serif",
                                        letterSpacing: '-0.01em',
                                    }}
                                />

                                {/* Esc hint */}
                                <kbd style={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.25)',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 5,
                                    padding: '2px 7px',
                                    fontFamily: 'inherit',
                                    flexShrink: 0,
                                }}>
                                    ESC
                                </kbd>
                            </div>

                            {/* Command list */}
                            <div
                                ref={listRef}
                                style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 10px 10px' }}
                            >
                                {groups.map(({ group, items }) => (
                                    <div key={group} style={{ marginBottom: 6 }}>
                                        {/* Group label */}
                                        <p style={{
                                            fontSize: 10,
                                            letterSpacing: '0.18em',
                                            textTransform: 'uppercase',
                                            color: 'rgba(255,255,255,0.22)',
                                            fontWeight: 600,
                                            padding: '6px 12px 4px',
                                            margin: 0,
                                        }}>
                                            {group}
                                        </p>

                                        {items.map(item => {
                                            const idx = globalIdx++;
                                            const isActive = idx === activeIdx;
                                            return (
                                                <button
                                                    key={item.id}
                                                    data-idx={idx}
                                                    className={`cmd-item${isActive ? ' active' : ''}`}
                                                    onClick={() => navigate(item)}
                                                    onMouseEnter={() => setActiveIdx(idx)}
                                                >
                                                    {/* Icon box */}
                                                    <div style={{
                                                        width: 32, height: 32,
                                                        borderRadius: 8,
                                                        background: item.accent
                                                            ? `${item.accent}18`
                                                            : 'rgba(255,255,255,0.06)',
                                                        border: item.accent
                                                            ? `1px solid ${item.accent}28`
                                                            : '1px solid rgba(255,255,255,0.08)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: item.accent || 'rgba(255,255,255,0.5)',
                                                        flexShrink: 0,
                                                    }}>
                                                        {item.icon}
                                                    </div>

                                                    {/* Text */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: 13.5,
                                                            fontWeight: 500,
                                                            color: 'rgba(255,255,255,0.88)',
                                                            letterSpacing: '-0.01em',
                                                        }}>
                                                            {item.label}
                                                        </div>
                                                        <div style={{
                                                            fontSize: 11.5,
                                                            color: 'rgba(255,255,255,0.28)',
                                                            marginTop: 1,
                                                        }}>
                                                            {item.sub}
                                                        </div>
                                                    </div>

                                                    {/* Enter hint when active */}
                                                    {isActive && (
                                                        <kbd style={{
                                                            fontSize: 10,
                                                            color: 'rgba(255,255,255,0.28)',
                                                            background: 'rgba(255,255,255,0.06)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: 5,
                                                            padding: '2px 7px',
                                                            fontFamily: 'inherit',
                                                            flexShrink: 0,
                                                        }}>
                                                            ↵
                                                        </kbd>
                                                    )}

                                                    {/* External icon */}
                                                    {item.external && !isActive && (
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                                        </svg>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Empty state */}
                                {flatItems.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                                        No results for "{query}"
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '8px 18px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                            }}>
                                {[
                                    { key: '↑↓', label: 'navigate' },
                                    { key: '↵', label: 'open' },
                                    { key: 'esc', label: 'close' },
                                ].map(({ key, label }) => (
                                    <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <kbd style={{
                                            fontSize: 10,
                                            color: 'rgba(255,255,255,0.3)',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 4,
                                            padding: '1px 6px',
                                            fontFamily: 'inherit',
                                        }}>{key}</kbd>
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{label}</span>
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
