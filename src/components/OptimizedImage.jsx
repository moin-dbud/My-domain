import React from 'react'

// Small image wrapper that keeps the original asset as the reliable fallback.
// This avoids broken rendering when AVIF/WebP variants are missing or were renamed.
export default function OptimizedImage({ src, alt = '', width, height, className, sizes = '100vw', priority = false, style }) {
  const imgProps = {
    src,
    alt,
    width: width || undefined,
    height: height || undefined,
    className,
    style: { display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...style },
    loading: priority ? undefined : 'lazy',
    decoding: 'async',
  };

  if (priority) imgProps.fetchPriority = 'high';

  if (typeof src === 'string' && /\.(webp|avif)$/i.test(src)) {
    imgProps.srcSet = src;
  }

  return <img {...imgProps} />;
}
