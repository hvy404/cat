import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            At [Your Company Name], we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our job matching and career development platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Personal information (e.g., name, email address, phone number)</li>
            <li>Professional information (e.g., resume, work history, skills)</li>
            <li>Account credentials</li>
            <li>Communication preferences</li>
          </ul>
          <p className="text-gray-700 mb-4">
            We may also collect information automatically when you use our platform, such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Usage data and interactions with our platform</li>
            <li>Device and browser information</li>
            <li>IP address and location data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Provide and improve our job matching and career development services</li>
            <li>Personalize your experience and job recommendations</li>
            <li>Communicate with you about opportunities and platform updates</li>
            <li>Analyze and enhance our platform's performance and functionality</li>
            <li>Ensure the security and integrity of our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
          <p className="text-gray-700 mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Employers and recruiters, as necessary for job matching purposes</li>
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law or to protect our rights</li>
          </ul>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Access, correct, or delete your personal information</li>
            <li>Object to or restrict certain processing of your data</li>
            <li>Receive a copy of your data in a portable format</li>
            <li>Opt-out of certain communications or data uses</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700">
            [Your Company Name]<br />
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

export default PrivacyPolicyPage;