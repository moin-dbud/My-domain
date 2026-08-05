import React from 'react'

// Small image wrapper that prefers AVIF/WebP where available,
// adds width/height to avoid CLS and uses lazy loading by default.
export default function OptimizedImage({ src, alt = '', width, height, className, sizes = '100vw', priority = false, style }) {
  const ext = src.split('.').pop().toLowerCase();
  const base = src.replace(/\.(png|jpe?g|webp|avif)$/i, '');
  const avif = `${base}.avif`;
  const webp = `${base}.webp`;

  const imgProps = {
    src,
    alt,
    width: width || undefined,
    height: height || undefined,
    className,
    style: { display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...style },
    loading: priority ? undefined : 'lazy',
  };

  // Use fetchpriority when supported for above-the-fold images
  if (priority) imgProps.fetchPriority = 'high';

  return (
    <picture>
      {/* AVIF */}
      <source type="image/avif" srcSet={avif} sizes={sizes} />
      {/* WebP */}
      <source type="image/webp" srcSet={webp} sizes={sizes} />
      {/* Fallback */}
      <img {...imgProps} />
    </picture>
  );
}
