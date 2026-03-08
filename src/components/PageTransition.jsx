import { createContext, useContext, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   Context
───────────────────────────────────────────────────────────────── */
const TransitionContext = createContext({
    floodNavigate: () => { },
    isExiting: false,
});
export const useFloodNavigate = () => useContext(TransitionContext);

/* ─────────────────────────────────────────────────────────────────
   Easing — soft spring-like curve used throughout the portfolio
───────────────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];
const DURATION = 0.52;

/* ─────────────────────────────────────────────────────────────────
   FloodTransitionProvider
   Sets isExiting = true → PageTransition slides/fades OUT
   After exit completes → navigates → new PageTransition slides IN
───────────────────────────────────────────────────────────────── */
export function FloodTransitionProvider({ children }) {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);
    const busy = useRef(false);

    const floodNavigate = useCallback((to, _event) => {
        if (busy.current) return;
        busy.current = true;

        setIsExiting(true);

        /* Wait for exit animation, then swap route */
        setTimeout(() => {
            navigate(to);
            setIsExiting(false);
            setTimeout(() => { busy.current = false; }, 80);
        }, DURATION * 1000 + 20);
    }, [navigate]);

    return (
        <TransitionContext.Provider value={{ floodNavigate, isExiting }}>
            {children}
        </TransitionContext.Provider>
    );
}

/* ─────────────────────────────────────────────────────────────────
   PageTransition
   
   ENTER  (new page mounts):   y: 18px → 0,    opacity: 0 → 1
   EXIT   (isExiting = true):  y: 0    → -18px, opacity: 1 → 0

   No scale = no edge gaps = no white flash.
   Y-translate is GPU-only (no layout shift).
   position:fixed Navbar is unaffected by parent transform.
───────────────────────────────────────────────────────────────── */
export function PageTransition({ children }) {
    const { isExiting } = useFloodNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={
                isExiting
                    ? { opacity: 0, y: -18 }   // slide up & fade out
                    : { opacity: 1, y: 0 }     // settle into place
            }
            transition={{ duration: DURATION, ease: EASE }}
            style={{
                willChange: 'transform, opacity',
                /* Ensure no white ever bleeds through */
                background: '#000',
                minHeight: '100vh',
            }}
        >
            {children}
        </motion.div>
    );
}
