import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const navLinks = [
    { label: 'Home', href: '/#hero' },
    { label: 'About', href: '/#about' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (href) => {
        setMenuOpen(false);
        if (href.startsWith('/#')) {
            const id = href.slice(2);
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-[#050a06]/90 backdrop-blur-xl border-b border-[#CCFF9C]/10 shadow-lg shadow-black/40'
                    : 'bg-transparent'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-2 group"
                >
                    <span className="font-mono text-[#CCFF9C] font-bold text-xl tracking-tight">
                        MS<span className="text-white/40">.</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <button
                                onClick={() => handleNavClick(link.href)}
                                className="text-sm font-medium text-white/60 hover:text-[#CCFF9C] transition-colors duration-300 relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#CCFF9C] group-hover:w-full transition-all duration-300" />
                            </button>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-2"
                    >
                        Resume ↗
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-white/70 hover:text-[#CCFF9C] transition-colors"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-[#050a06]/95 backdrop-blur-xl border-t border-[#CCFF9C]/10"
                    >
                        <ul className="px-6 py-6 flex flex-col gap-5">
                            {navLinks.map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => handleNavClick(link.href)}
                                        className="text-white/70 hover:text-[#CCFF9C] text-base font-medium transition-colors w-full text-left"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="/resume.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline text-sm py-2 w-full justify-center"
                                >
                                    Resume ↗
                                </a>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
