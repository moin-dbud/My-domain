import { useEffect } from 'react';

/**
 * JsonLd — Injects a JSON-LD structured data script into <head>.
 *
 * Renders a <script type="application/ld+json"> tag and removes
 * it on unmount, so structured data is always in sync with the
 * current page.
 *
 * @param {object} props
 * @param {object|object[]} props.schema - The JSON-LD schema object(s)
 * @param {string} [props.id]           - Unique DOM id to avoid duplicates
 */
export default function JsonLd({ schema, id = 'json-ld-default' }) {
  useEffect(() => {
    /* Remove any existing script with this id */
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [schema, id]);

  return null;
}
