import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SmoothScroll from './components/SmoothScroll';
import About from './pages/About';

function App() {
  return (
    <SmoothScroll>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>  
    </SmoothScroll>
  );
}

export default App;
