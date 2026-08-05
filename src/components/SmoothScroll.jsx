import { useEffect, useRef } from 'react';

/**
 * SmoothScroll — wraps the whole app with Lenis for premium inertia scrolling.
 * Lenis intercepts native scroll events and replaces them with silky, eased motion.
 * It also stays in sync with Framer Motion's useScroll so scroll-linked animations
 * (like the Navbar pill) continue to work perfectly.
 */
export default function SmoothScroll({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        let lenis;
        let raf;
        (async () => {
            const mod = await import('lenis');
            const Lenis = mod && mod.default ? mod.default : mod;
            lenis = new Lenis({
                duration: 1.4,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: true,
                mouseMultiplier: 1.0,
                touchMultiplier: 1.8,
                infinite: false,
            });

            lenisRef.current = lenis;

            const loop = (time) => {
                lenis.raf(time);
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
        })();

        return () => {
            if (raf) cancelAnimationFrame(raf);
            if (lenis && typeof lenis.destroy === 'function') lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
