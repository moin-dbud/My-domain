import { useSEO } from '../hooks/useSEO';
import JsonLd from '../components/JsonLd';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import BehindSystems from '../sections/BehindSystems';
import GitHubActivity from '../sections/GitHubActivity';
import Projects from '../sections/Projects';

const workSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://moinsheikh.in/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Projects',
      item: 'https://moinsheikh.in/work',
    },
  ],
};

export default function Work() {
  useSEO({
    title: 'Projects | Moin Sheikh — AI & Full-Stack Development Work',
    description:
      'Explore Moin Sheikh\'s portfolio of AI-powered and full-stack projects — including Buildo, Nexora Learn AI, MadeIt, LevelUp.dev, and an AI Resume Analyzer built with React, Python, and Node.js.',
    path: '/work',
  });

  return (
    <main style={{ background: '#000', minHeight: '100vh' }} aria-label="Moin Sheikh's Projects">
      <JsonLd schema={workSchema} id="json-ld-work" />
      <PageHero
        title="MY WORK"
        subtitle="Crafting digital experiences"
        highlight="with passion & code."
      />
      <Projects />
      <GitHubActivity />
      <BehindSystems />
      <Footer />
    </main>
  );
}