import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — wraps the whole app with Lenis for premium inertia scrolling.
 * Lenis intercepts native scroll events and replaces them with silky, eased motion.
 * It also stays in sync with Framer Motion's useScroll so scroll-linked animations
 * (like the Navbar pill) continue to work perfectly.
 */
export default function SmoothScroll({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.4,          // how long each scroll impulse takes (seconds)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
            smooth: true,
            mouseMultiplier: 1.0,   // mouse wheel sensitivity
            touchMultiplier: 1.8,   // touch sensitivity
            infinite: false,
        });

        lenisRef.current = lenis;

        // Lenis needs to be ticked inside rAF
        let raf;
        const loop = (time) => {
            lenis.raf(time);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
