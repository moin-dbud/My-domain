import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Links from './pages/Links';
import Guestbook from './pages/Guestbook';
import Labs from './pages/Labs';
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
          </Routes>
        </FloodTransitionProvider>
      </BrowserRouter>
    </SmoothScroll>
  );
}

export default App;
