import Hero from '../sections/Hero';
import About from '../sections/About';
import Projects from '../sections/Projects';
import AIPlayground from '../sections/AI-Playground';
import Skills from '../sections/Skills';
import Glace from '../sections/Glace';
import BehindSystems from '../sections/BehindSystems';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Projects />
      <AIPlayground />
      <Skills />
      <Glace
        label="A Quick Glance"
        headline="Building the bridge between"
        highlight="intelligent systems"
        description="I'm Moin Sheikh, an AI developer and web innovator focused on turning ambitious ideas into intelligent digital products. I specialize in building full-stack applications powered by modern AI tools, combining thoughtful design with scalable engineering. My work sits at the intersection of AI and software systems. From intelligent learning platforms to productivity tools, I build products that solve real problems and deliver practical value. I'm passionate about shipping real systems — not just prototypes — and continuously exploring how AI can make software more useful, adaptive, and human-centric."
        final="My goal is simple: build systems that think, scale, and create impact."
      />
      <BehindSystems />
      <Footer />
    </main>
  );
}