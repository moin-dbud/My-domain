import LegalPage from '../components/LegalPage';

const termsBody = (
  <div>
    <p>
      Welcome to https://www.moinsheikh.in/, operated by Moin Sheikh (&quot;I&quot;, &quot;me&quot;, &quot;my&quot;). By accessing or using this Site, you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree, please do not use the Site.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>1. Purpose of the Site</h2>
    <p>
      This Site is a personal portfolio showcasing my projects, skills, and blog content as an AI/web developer. Content is provided for informational and demonstrative purposes only.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>2. Intellectual Property</h2>
    <p>
      Unless otherwise stated, all content on this Site — including but not limited to code, design, graphics, text, project write-ups, screenshots, logos, and the overall look and feel — is the intellectual property of Moin Sheikh and is protected by applicable copyright and intellectual property laws.
    </p>
    <ul>
      <li>You may view, and share links to, this Site for personal, non-commercial purposes.</li>
      <li>You may <strong>not</strong> copy, reproduce, redistribute, or reuse project code, designs, written content, or other materials from this Site for commercial purposes without my prior written permission.</li>
      <li>Open-source projects linked from this Site may carry their own separate license terms; those terms govern that specific project&apos;s code, not this Site as a whole.</li>
      <li>Third-party trademarks, logos, or brand names referenced on this Site belong to their respective owners.</li>
    </ul>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>3. No Professional Advice / Display Purposes Only</h2>
    <p>
      The projects, tools, demos, and blog content on this Site are shared for portfolio and demonstration purposes only. Nothing on this Site constitutes professional, legal, financial, medical, or technical advice, and nothing should be relied upon as such. Any tools, demos, or code samples are provided &quot;as is,&quot; may be experimental or unfinished, and are not guaranteed to be suitable for production or real-world use.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>4. Limitation of Liability</h2>
    <p>
      To the fullest extent permitted by applicable law:
    </p>
    <ul>
      <li>The Site and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis, without warranties of any kind, express or implied, including but not limited to warranties of accuracy, reliability, or fitness for a particular purpose.</li>
      <li>I make no guarantee that the Site will be uninterrupted, error-free, or secure.</li>
      <li>I shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your use of, or inability to use, this Site, its content, or any linked third-party site or tool, even if advised of the possibility of such damages.</li>
      <li>You use this Site, and any demos, tools, or code shared on it, entirely at your own risk.</li>
    </ul>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>5. Acceptable Use Policy</h2>
    <p>
      By using this Site, you agree not to:
    </p>
    <ul>
      <li>Use the Site in any way that violates applicable local, national, or international law</li>
      <li>Attempt to gain unauthorized access to the Site, its underlying code, servers, or related systems</li>
      <li>Introduce malware, viruses, or other harmful code through the Site (e.g. via the contact form)</li>
      <li>Scrape, harvest, or misuse data submitted by other users of the Site</li>
      <li>Use automated means (bots, scrapers) to access the Site in a manner that sends more requests than a human could reasonably produce, or that disrupts normal operation</li>
      <li>Misrepresent your identity when submitting the contact form or interacting with the Site</li>
      <li>Reproduce, resell, or commercially exploit any portion of the Site without permission</li>
    </ul>
    <p>
      I reserve the right to restrict or block access to the Site for anyone who violates this policy.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>6. Third-Party Links</h2>
    <p>
      This Site may contain links to third-party websites, tools, or repositories. I am not responsible for the content, privacy practices, or availability of any linked third-party sites.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>7. Changes to These Terms</h2>
    <p>
      I may revise these Terms at any time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>8. Governing Law</h2>
    <p>
      These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
    </p>

    <h2 style={{ color: '#a855f7', marginTop: '1.75rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>9. Contact</h2>
    <p>
      Questions about these Terms can be sent to:
    </p>
    <p style={{ marginTop: '0.75rem' }}>
      <strong>Moin Sheikh</strong>
      <br />
        <a href="mailto:hello@moinsheikh.in">hello@moinsheikh.in</a>
    </p>
  </div>
);

export default function Terms() {
  return (
    <LegalPage
      title="Terms and Conditions"
      heroTitle="TERMS"
      heroSubtitle="Legal"
      heroHighlight="conditions"
      lastUpdated="August 4, 2026"
      body={termsBody}
      metaTitle="Terms and Conditions | Moin Sheikh — moinsheikh.in"
      metaDescription="Read the terms and conditions for using Moin Sheikh's portfolio website. Covers intellectual property, acceptable use, limitations of liability, and governing law."
      metaPath="/terms"
    />
  );
}
