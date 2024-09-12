import React from 'react';

const TermsOfServicePage = () => {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using the [Company Name] platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            [Company Name] provides a job matching and career development platform that connects job seekers with employers and offers tools for professional growth. Our services include, but are not limited to, resume optimization, job recommendations, and employer-candidate matching.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            To use our services, you must create an account. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Obligations</h2>
          <p className="text-gray-700 mb-4">
            As a user of our platform, you agree to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Provide accurate and complete information in your profile</li>
            <li>Use the service for lawful purposes only</li>
            <li>Not impersonate any person or entity</li>
            <li>Not upload or transmit viruses or any other malicious code</li>
            <li>Not interfere with or disrupt the service or servers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The platform and its original content, features, and functionality are owned by [Company Name] and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Content</h2>
          <p className="text-gray-700 mb-4">
            By posting content on our platform, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the service. You retain any and all of your rights to any content you submit, post, or display on or through the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            [Company Name] shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700">
            [Company Name]<br />
            [Address]<br />
            [Email]<br />
            [Phone Number]
          </p>
        </section>

        <p className="text-gray-600 italic">
          Last Updated: [Date]
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;