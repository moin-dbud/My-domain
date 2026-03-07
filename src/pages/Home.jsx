import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Projects from '../sections/Projects';
import Skills from '../sections/Skills';
import Glace from '../sections/Glace';
import BehindSystems from '../sections/BehindSystems';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Glace />
      <BehindSystems />
      <Footer />
    </main>
  );
}