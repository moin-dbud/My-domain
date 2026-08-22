import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const [isEntered, setIsEntered] = useState(false);

    useEffect(() => {
        setIsEntered(false);
        const timer = setTimeout(() => {
            setIsEntered(true);
        }, DURATION * 1000 + 50);
        return () => clearTimeout(timer);
    }, []);

    const base = {
        transition: `transform ${DURATION}s cubic-bezier(0.22, 1, 0.36, 1), opacity ${DURATION}s cubic-bezier(0.22, 1, 0.36, 1)`,
        background: '#000',
        minHeight: '100vh',
    };

    let style;
    if (isExiting) {
        style = { ...base, transform: 'translateY(-18px)', opacity: 0, willChange: 'transform, opacity' };
    } else if (!isEntered) {
        style = { ...base, transform: 'translateY(0)', opacity: 1, willChange: 'transform, opacity' };
    } else {
        style = { ...base, transform: 'none', opacity: 1, willChange: 'auto' };
    }

    return (
        <div style={style}>
            {children}
        </div>
    );
}
