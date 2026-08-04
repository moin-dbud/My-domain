import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react"
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Links from './pages/Links';
import Guestbook from './pages/Guestbook';
import Labs from './pages/Labs';
import BookACall from './pages/BookACall';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import { FloodTransitionProvider, PageTransition } from './components/PageTransition';

function App() {
  return (
    <SmoothScroll>
      <BrowserRouter>
        <FloodTransitionProvider>
          <Navbar />

          <Routes>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/work" element={<PageTransition><Work /></PageTransition>} />
            <Route path="/blogs" element={<PageTransition><Blogs /></PageTransition>} />
            <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
            <Route path="/links" element={<PageTransition><Links /></PageTransition>} />
            <Route path="/guestbook" element={<PageTransition><Guestbook /></PageTransition>} />
            <Route path="/labs" element={<PageTransition><Labs /></PageTransition>} />
            <Route path="/book-a-call" element={<PageTransition><BookACall /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          </Routes>
        </FloodTransitionProvider>
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </SmoothScroll>
  );
}

export default App;
