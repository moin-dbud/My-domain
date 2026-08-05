import { useSEO } from '../hooks/useSEO';
import JsonLd from '../components/JsonLd';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Projects from '../sections/Projects';
import AIPlayground from '../sections/AI-Playground';
import Skills from '../sections/Skills';
import Glace from '../sections/Glace';
import BehindSystems from '../sections/BehindSystems';
import Footer from '../components/Footer';

/* ── Structured data for the home page ── */
const homeSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Moin Sheikh',
    url: 'https://moinsheikh.in',
    image: 'https://moinsheikh.in/cropped_circle_image.webp',
    jobTitle: 'AI Developer & Full-Stack Engineer',
    description:
      'AI developer and full-stack engineer from Nagpur, India, building intelligent web systems, SaaS products, and modern digital experiences.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nagpur',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://github.com/moin-dbud',
      'https://linkedin.com/in/moin-s-sheikh',
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Full-Stack Web Development',
      'React',
      'Node.js',
      'Python',
      'Machine Learning',
      'SaaS Development',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Moin Sheikh Portfolio',
    url: 'https://moinsheikh.in',
    description:
      'Portfolio of Moin Sheikh — AI developer and full-stack engineer from Nagpur, India.',
    author: {
      '@type': 'Person',
      name: 'Moin Sheikh',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://moinsheikh.in/blogs?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://moinsheikh.in/',
      },
    ],
  },
];

export default function Home() {
  useSEO({
    title: 'Moin Sheikh | AI & Full-Stack Developer — Nagpur, India',
    description:
      'Moin Sheikh is an AI developer and full-stack engineer from Nagpur, India. Building intelligent web systems, SaaS products, and AI-powered applications that solve real problems.',
    path: '/',
  });

  return (
    <main aria-label="Moin Sheikh — Home">
      <JsonLd schema={homeSchema} id="json-ld-home" />
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