import { useEffect } from 'react';

const BASE_URL = 'https://moinsheikh.in';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * useSEO — Central hook for per-page SEO metadata management.
 *
 * Sets document title, meta description, canonical, Open Graph,
 * and Twitter Card tags consistently across every page.
 *
 * @param {object} options
 * @param {string} options.title         - Full page title (shown in browser tab & Google)
 * @param {string} options.description   - Meta description (140–160 chars)
 * @param {string} [options.path]        - URL path e.g. "/about" (default: current pathname)
 * @param {string} [options.ogImage]     - Absolute URL to OG image (default: /og-image.png)
 * @param {string} [options.ogType]      - OG type (default: "website")
 * @param {string} [options.twitterCard] - Twitter card type (default: "summary_large_image")
 */
export function useSEO({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
}) {
  useEffect(() => {
    const url = path ? `${BASE_URL}${path}` : `${BASE_URL}${window.location.pathname}`;

    /* ── Document title ── */
    if (title) document.title = title;

    /* ── Helper: upsert a <meta> tag ── */
    const setMeta = (selector, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attr, val] = selector.replace('[', '').replace(']', '').split('=');
        el.setAttribute(attr, val.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    /* ── Helper: upsert a <link> tag ── */
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    /* ── Standard meta ── */
    if (description) setMeta('meta[name="description"]', description);

    /* ── Canonical ── */
    setLink('canonical', url);

    /* ── Open Graph ── */
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:site_name"]', 'Moin Sheikh');
    setMeta('meta[property="og:locale"]', 'en_US');

    /* ── Twitter Card ── */
    setMeta('meta[name="twitter:card"]', twitterCard);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);
    setMeta('meta[name="twitter:site"]', '@moin_sheikh');
    setMeta('meta[name="twitter:creator"]', '@moin_sheikh');
  }, [title, description, path, ogImage, ogType, twitterCard]);
}
