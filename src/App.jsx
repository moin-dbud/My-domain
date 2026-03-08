import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
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
          </Routes>
        </FloodTransitionProvider>
      </BrowserRouter>
    </SmoothScroll>
  );
}

export default App;
