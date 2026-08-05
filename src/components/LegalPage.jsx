import { useSEO } from '../hooks/useSEO';
import PageHero from './PageHero';
import Footer from './Footer';

const muted = 'rgba(255,255,255,0.72)';
const subtle = 'rgba(255,255,255,0.56)';

export default function LegalPage({
  title,
  heroTitle,
  heroSubtitle,
  heroHighlight,
  lastUpdated,
  body,
  metaTitle,
  metaDescription,
  metaPath,
}) {
  useSEO({
    title: metaTitle,
    description: metaDescription,
    path: metaPath,
  });

  return (
    <main style={{ background: '#000', color: '#f5f5f5', minHeight: '100vh' }}>
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        highlight={heroHighlight}
      />

      <section style={{ padding: '0 24px 96px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(28px, 4.2vw, 40px)',
                lineHeight: 1.15,
                margin: '0 0 10px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>

            <p
              style={{
                margin: '0 0 24px',
                color: subtle,
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Last updated: {lastUpdated}
            </p>

            <div
              style={{
                color: muted,
                lineHeight: 1.8,
                fontSize: '1rem',
              }}
            >
              {body}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
