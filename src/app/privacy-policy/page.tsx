import { FC } from 'react';

const PrivacyPolicy: FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-lg mb-4">
        At <strong>Please Forget Me</strong>, we provide a tool that empowers individuals to request the removal of their personal data from other companies' systems. Protecting your privacy and ensuring the security of your data is not just a legal obligation—it is central to the purpose of this tool. This Privacy Policy outlines how we collect, use, and protect your information.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Organisation Information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Name:</strong> Please Forget Me</li>
          <li><strong>Website URL:</strong> <a href="https://www.pleaseforget.me" className="text-blue-500 underline">https://www.pleaseforget.me</a></li>
          <li><strong>Contact Information:</strong> <a href="mailto:hello@pleaseforget.me" className="text-blue-500 underline">hello@pleaseforget.me</a></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Data Collection</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Data Types:</strong> Name, email, country</li>
          <li><strong>Collection Methods:</strong> Secure online form</li>
          <li><strong>Age Restrictions:</strong> No restrictions on website use</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Purpose of Data Use</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Primary Use:</strong> Application tracking</li>
          <li><strong>Third-Party Sharing:</strong> Absolutely none</li>
          <li><strong>Automated Processing:</strong> None</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Cookies Policy:</strong> None</li>
          <li><strong>Analytics Tools:</strong> None</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Storage Locations:</strong> Secure cloud database</li>
          <li>
            <strong>Security Measures:</strong> Our database uses industry-standard security protocols, including encryption for data in transit and at rest, secure authentication mechanisms, and access controls to protect your data from unauthorized access.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. User Rights</h2>
        <p className="mb-4">
          You have the right to request the deletion of your submission data at any time. To do so, please contact us at <a href="mailto:hello@pleaseforget.me" className="text-blue-500 underline">hello@pleaseforget.me</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Legal and Compliance</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Jurisdiction:</strong> We are registered in South Africa and comply with applicable privacy laws, including South Africa's Protection of Personal Information Act (POPIA) and global standards such as the General Data Protection Regulation (GDPR).</li>
          <li><strong>Policy Updates:</strong> Any updates to this Privacy Policy will be communicated to you via email.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
        <p>Our website does not include any third-party links.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or how your data is handled, please reach out to us at <a href="mailto:hello@pleaseforget.me" className="text-blue-500 underline">hello@pleaseforget.me</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
