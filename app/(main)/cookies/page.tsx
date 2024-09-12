import React from "react";

const CookiesPolicyPage = () => {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Cookies Policy
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            This Cookies Policy explains how [Company Name] ("we", "us", or
            "our") uses cookies and similar technologies to recognize you when
            you visit our website and use our job matching and career
            development platform. It explains what these technologies are and
            why we use them, as well as your rights to control our use of them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. What are cookies?
          </h2>
          <p className="text-gray-700 mb-4">
            Cookies are small data files that are placed on your computer or
            mobile device when you visit a website. Cookies are widely used by
            website owners in order to make their websites work, or to work more
            efficiently, as well as to provide reporting information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Why do we use cookies?
          </h2>
          <p className="text-gray-700 mb-4">
            We use cookies for several reasons:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>To enable certain functions of the service</li>
            <li>To provide analytics</li>
            <li>To store your preferences</li>
            <li>
              To enable advertisement delivery, including behavioral advertising
            </li>
            <li>For authentication and security purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Types of cookies we use
          </h2>
          <p className="text-gray-700 mb-4">
            The types of cookies we use include:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>
              <strong>Essential cookies:</strong> These are cookies that are
              required for the operation of our website.
            </li>
            <li>
              <strong>Analytical/performance cookies:</strong> These allow us to
              recognize and count the number of visitors and to see how visitors
              move around our website when they are using it.
            </li>
            <li>
              <strong>Functionality cookies:</strong> These are used to
              recognize you when you return to our website.
            </li>
            <li>
              <strong>Targeting cookies:</strong> These cookies record your
              visit to our website, the pages you have visited and the links you
              have followed.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Third-party cookies
          </h2>
          <p className="text-gray-700 mb-4">
            In addition to our own cookies, we may also use various third-party
            cookies to report usage statistics of the service and deliver
            advertisements on and through the service.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Authentication cookies:</strong> We use Clerk, a third-party
            authentication service, which uses cookies to help us identify users
            and provide secure access to our platform. These cookies are
            essential for the proper functioning of our authentication system.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. What are your cookie options?
          </h2>
          <p className="text-gray-700 mb-4">
            If you'd like to delete cookies or instruct your web browser to
            delete or refuse cookies, please visit the help pages of your web
            browser.
          </p>
          <p className="text-gray-700 mb-4">
            Please note, however, that if you delete cookies or refuse to accept
            them, you might not be able to use all of the features we offer, you
            may not be able to store your preferences, and some of our pages
            might not display properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. Changes to our Cookies Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We may update this Cookies Policy from time to time in order to
            reflect, for example, changes to the cookies we use or for other
            operational, legal or regulatory reasons. Please therefore re-visit
            this Cookies Policy regularly to stay informed about our use of
            cookies and related technologies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about our use of cookies or other
            technologies, please contact us at:
          </p>
          <p className="text-gray-700">
            [Company Name]
            <br />
            [Address]
            <br />
            [Email]
            <br />
            [Phone Number]
          </p>
        </section>

        <p className="text-gray-600 italic">Last Updated: [Date]</p>
      </div>
    </div>
  );
};

export default CookiesPolicyPage;
