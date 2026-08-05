import LegalPage from '../components/LegalPage';

const privacyBody = (
  <div>
    <p>
      This Privacy Policy describes how Moin Sheikh (&quot;I&quot;, &quot;me&quot;, &quot;my&quot;) collects, uses, and protects information when you visit https://www.moinsheikh.in/. By using the Site, you consent to the practices described in this Privacy Policy.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>1. Who I Am</h2>
    <p>
      This Site is a personal portfolio operated by Moin Sheikh. For any privacy-related questions, you can contact me at <a href="mailto:hello@moinsheikh.in">hello@moinsheikh.in</a>.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>2. Information I Collect</h2>

    <h3 style={{ color: '#ffffff', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>a) Information you provide directly</h3>
    <p>
      If the Site includes a contact form, I collect the information you voluntarily submit through it, which may include:
    </p>
    <ul>
      <li>Your name</li>
      <li>Your email address</li>
      <li>The content of your message</li>
    </ul>
    <p>
      This information is used solely to respond to your inquiry and is not sold or shared with third parties for marketing purposes.
    </p>

    <h3 style={{ color: '#ffffff', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>b) Information collected automatically</h3>
    <p>
      When you visit the Site, certain information may be collected automatically through cookies and similar technologies, including:
    </p>
    <ul>
      <li>IP address (typically anonymized or truncated where the analytics tool supports it)</li>
      <li>Browser type and version</li>
      <li>Device type and operating system</li>
      <li>Pages visited, time spent on pages, and referring URLs</li>
      <li>General geographic location (city/country level, derived from IP)</li>
    </ul>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>3. Cookies</h2>
    <p>
      The Site may use cookies and similar tracking technologies to understand how visitors use the Site and to improve its content and performance. You can control or disable cookies through your browser settings; note that some parts of the Site may not function as intended if cookies are disabled.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>4. How I Use Your Information</h2>
    <p>
      Information collected is used to:
    </p>
    <ul>
      <li>Respond to messages sent via the contact form</li>
      <li>Understand and improve how visitors use the Site (via aggregated analytics)</li>
      <li>Maintain the security and proper functioning of the Site</li>
      <li>Comply with legal obligations, where applicable</li>
    </ul>
    <p>
      I do not sell your personal information.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>5. Third-Party Services</h2>
    <p>
      The Site may use the following third-party services, each of which may process data according to their own privacy policies:
    </p>
    <ul>
      <li><strong>Hosting (Vercel):</strong> The Site is hosted on Vercel, which may log standard server/request data as part of providing hosting infrastructure.</li>
      <li><strong>Analytics (e.g. Google Analytics / Vercel Analytics):</strong> Used to understand aggregate visitor behavior. This data is generally aggregated and not used to personally identify you.</li>
      <li><strong>Contact form processing (e.g. Formspree / EmailJS / a similar service, if used):</strong> If the contact form is powered by a third-party form service, your submission may pass through that provider&apos;s infrastructure before reaching my inbox.</li>
    </ul>
    <p>
      I recommend reviewing the privacy policies of these providers for more detail:
    </p>
    <ul>
      <li>Google Analytics: https://policies.google.com/privacy</li>
      <li>Vercel: https://vercel.com/legal/privacy-policy</li>
    </ul>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>6. Data Storage and Retention</h2>
    <p>
      Contact form submissions are retained only as long as necessary to respond to and resolve your inquiry, after which they may be deleted. Analytics data is retained according to the retention settings of the analytics provider used.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>7. Your Rights</h2>
    <p>
      Depending on your location, you may have rights under applicable data protection laws, including but not limited to the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). These rights may include the right to:
    </p>
    <ul>
      <li>Access the personal information I hold about you</li>
      <li>Request correction or deletion of your personal information</li>
      <li>Object to or restrict certain processing of your information</li>
      <li>Request a copy of your information in a portable format</li>
      <li>Withdraw consent at any time, where processing is based on consent</li>
      <li>Lodge a complaint with a relevant supervisory authority</li>
    </ul>
    <p>
      To exercise any of these rights, contact me at <a href="mailto:hello@moinsheikh.in">hello@moinsheikh.in</a>. I will respond within a reasonable timeframe and in accordance with applicable law.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>8. Children&apos;s Privacy</h2>
    <p>
      This Site is not directed at children under 13 (or the relevant age of digital consent in your jurisdiction), and I do not knowingly collect personal information from children.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>9. Changes to This Policy</h2>
    <p>
      I may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>10. Contact</h2>
    <p>
      Questions about this Privacy Policy can be sent to:
    </p>
    <p style={{ marginTop: '0.75rem' }}>
      <strong>Moin Sheikh</strong>
      <br />
      <a href="mailto:hello@moinsheikh.in">hello@moinsheikh.in</a>
    </p>
  </div>
);

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      heroTitle="PRIVACY"
      heroSubtitle="Legal"
      heroHighlight="policy"
      lastUpdated="August 4, 2026"
      body={privacyBody}
      metaTitle="Privacy Policy | Moin Sheikh — moinsheikh.in"
      metaDescription="Read Moin Sheikh's privacy policy. Understand how your data is collected, stored, and protected when you visit moinsheikh.in — a personal portfolio by an AI developer."
      metaPath="/privacy"
    />
  );
}
