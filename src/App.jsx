import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense, useEffect, useState } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Keep Home eager (hero + navbar should load immediately)
import Home from './pages/Home';
// Keep Navbar and Home eager; lazy-load other pages

// Lazy-load secondary routes to reduce initial JS
const About = React.lazy(() => import('./pages/About'));
const Work = React.lazy(() => import('./pages/Work'));
const Blogs = React.lazy(() => import('./pages/Blogs'));
const BlogDetail = React.lazy(() => import('./pages/BlogDetail'));
const Links = React.lazy(() => import('./pages/Links'));
const Guestbook = React.lazy(() => import('./pages/Guestbook'));
const BookACall = React.lazy(() => import('./pages/BookACall'));
const Playground = React.lazy(() => import('./pages/Playground'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import { FloodTransitionProvider, PageTransition } from './components/PageTransition';

function App() {
  const [AnalyticsComp, setAnalyticsComp] = useState(null);
  const [SpeedComp, setSpeedComp] = useState(null);

  useEffect(() => {
    // Load analytics and SpeedInsights only after initial render to avoid blocking
    let mounted = true;
    (async () => {
      try {
        const mod = await import('@vercel/analytics/react');
        const speed = await import('@vercel/speed-insights/react');
        if (mounted) {
          setAnalyticsComp(() => mod.Analytics);
          setSpeedComp(() => speed.SpeedInsights);
        }
      } catch (e) {
        // optional analytics failure shouldn't block app
      }
    })();
    return () => { mounted = false; };
  }, []);
  const LazyAnalytics = AnalyticsComp;
  const LazySpeed = SpeedComp;
  return (
    <SmoothScroll>
      <BrowserRouter>
        <ScrollToTop />
        <FloodTransitionProvider>
          <Navbar />

          <Suspense fallback={<div aria-hidden="true" /> }>
            <Routes>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/work" element={<PageTransition><Work /></PageTransition>} />
              <Route path="/blogs" element={<PageTransition><Blogs /></PageTransition>} />
              <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
              <Route path="/links" element={<PageTransition><Links /></PageTransition>} />
              <Route path="/guestbook" element={<PageTransition><Guestbook /></PageTransition>} />
              <Route path="/playground" element={<PageTransition><Playground /></PageTransition>} />
              <Route path="/book-a-call" element={<PageTransition><BookACall /></PageTransition>} />
              <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
              <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            </Routes>
          </Suspense>
          {LazyAnalytics ? <LazyAnalytics /> : null}
          {LazySpeed ? <LazySpeed /> : null}
        </FloodTransitionProvider>
      </BrowserRouter>
    </SmoothScroll>
  );
}

export default App;
