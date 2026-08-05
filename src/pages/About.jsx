import { useSEO } from '../hooks/useSEO';
import JsonLd from '../components/JsonLd';
import PageHero from '../components/PageHero';
import Glace from '../sections/Glace';
import GitHubActivity from '../sections/GitHubActivity';
import BehindSystems from '../sections/BehindSystems';
import Footer from '../components/Footer';

const aboutSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Moin Sheikh',
    url: 'https://moinsheikh.in/about',
    image: 'https://moinsheikh.in/cropped_circle_image.webp',
    jobTitle: 'AI Developer & Full-Stack Engineer',
    description:
      'AI developer and full-stack engineer from Nagpur, India. Specializes in building intelligent web products, SaaS platforms, and full-stack applications using React, Node.js, Python, and modern AI tools.',
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
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Nagpur University',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nagpur',
        addressCountry: 'IN',
      },
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Full-Stack Web Development',
      'React',
      'Next.js',
      'Node.js',
      'Python',
      'FastAPI',
      'Machine Learning',
      'Product Design',
      'SaaS Development',
    ],
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://moinsheikh.in/about',
      },
    ],
  },
];

export default function About() {
  useSEO({
    title: 'About Moin Sheikh | AI Developer & Full-Stack Engineer — Nagpur',
    description:
      'Learn about Moin Sheikh — an AI developer and full-stack engineer from Nagpur, India. Specializing in React, Node.js, Python, and building intelligent web products.',
    path: '/about',
  });

  return (
    <main style={{ background: '#000', minHeight: '100vh' }} aria-label="About Moin Sheikh">
      <JsonLd schema={aboutSchema} id="json-ld-about" />
      <PageHero
        title="ABOUT ME"
        subtitle="Get to know more about"
        highlight="who i am."
      />
      <Glace
        label="A LITTLE ABOUT ME"
        headline="Nice to meet you. I'm"
        highlight="Moin"
        description={
          <>
            <p>
              I transform ambitious ideas into intelligent, scalable digital products. As an AI developer and full-stack engineer, I focus on building systems that combine thoughtful architecture, smooth user experiences, and real-world practicality.
            </p>
            <p>
              My work sits at the intersection of artificial intelligence and modern web development. From platforms like MadeIt that turn learning progress into proof-of-work portfolios, to Nexora Learn AI that generates personalized study plans, I design products that solve meaningful problems using technology.
            </p>
            <p>
              Beyond writing code, I think deeply about how products are built, shipped, and scaled. I enjoy turning complex ideas into simple, usable tools — whether it's an AI system, a developer platform, or a productivity application.
            </p>
          </>
        }
        final="My philosophy is simple: build systems that think, scale, and create impact."
      />

      <GitHubActivity />

      <BehindSystems />

      <Footer />

      {/* Rest of About page content goes below */}
    </main>
  );
}
