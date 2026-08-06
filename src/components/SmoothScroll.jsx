import { useEffect, useRef } from 'react';

/**
 * SmoothScroll — wraps the whole app with Lenis for fluid, uninterrupted scrolling.
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
                duration: 1.1,
                easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1.6,
                normalizeWheel: true,
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
