import { FC } from 'react';

const TermsOfService: FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="text-lg mb-4">
        Welcome to <i>Please Forget Me</i>. These Terms of Service govern your use of our website and services. By accessing or using this tool, you agree to comply with these terms. Please read them carefully.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Use of the Service</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You may only use our services for lawful purposes and in accordance with these terms.</li>
          <li>You agree not to misuse or interfere with the proper functioning of our platform.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You are responsible for ensuring the accuracy of the information you submit.</li>
          <li>You must not use the platform to impersonate others or submit fraudulent requests.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>All content and materials on our website, including text, graphics, and logos, are the property of Please Forget Me.</li>
          <li>You may not reproduce, distribute, or create derivative works without explicit permission.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
        <p>
          Please Forget Me is not responsible for any damages or losses resulting from the use of our service, including but not limited to errors in data submission or third-party actions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Modifications</h2>
        <p>
          We reserve the right to update or modify these Terms of Service at any time. Continued use of our platform after changes are made constitutes your acceptance of the revised terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
        <p>
          These terms are governed by the laws of South Africa. Any disputes arising from the use of our platform shall be resolved under South African jurisdiction.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at <a href="mailto:hello@pleaseforget.me" className="text-blue-500 underline">hello@pleaseforget.me</a>.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
