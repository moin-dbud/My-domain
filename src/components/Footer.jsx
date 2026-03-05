import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

const socialLinks = [
    { icon: FiGithub, href: 'https://github.com/MoinSheikh', label: 'GitHub' },
    { icon: FiLinkedin, href: 'https://linkedin.com/in/MoinSheikh', label: 'LinkedIn' },
    { icon: FiTwitter, href: 'https://twitter.com/MoinSheikh', label: 'Twitter' },
    { icon: FiMail, href: 'mailto:hello@moinsheikh.dev', label: 'Email' },
];

export default function Footer() {
    return (
        <footer className="border-t border-[#CCFF9C]/10 bg-[#050a06]">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Brand */}
                <div className="flex flex-col items-center md:items-start gap-1">
                    <span className="font-mono text-[#CCFF9C] font-bold text-lg tracking-tight">MS.</span>
                    <p className="text-white/30 text-xs">Building intelligent web systems.</p>
                </div>

                {/* Social */}
                <div className="flex items-center gap-5">
                    {socialLinks.map(({ icon: Icon, href, label }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="text-white/40 hover:text-[#CCFF9C] transition-colors duration-300"
                        >
                            <Icon size={18} />
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-white/20 text-xs font-mono">
                    © {new Date().getFullYear()} Moin Sheikh. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
