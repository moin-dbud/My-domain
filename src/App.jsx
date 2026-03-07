import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <SmoothScroll>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </SmoothScroll>
  );
}

export default App;
