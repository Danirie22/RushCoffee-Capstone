
import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <section className="bg-gradient-to-br from-primary-50 to-coffee-50 px-6 py-20 text-center">
          <h1 className="font-display text-5xl font-bold text-coffee-900 md:text-6xl">Privacy Policy</h1>
          <p className="mt-4 text-xl text-gray-700">Your privacy is important to us.</p>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </section>

        <section className="px-6 py-16">
          <div className="prose prose-lg mx-auto max-w-4xl text-gray-700 prose-headings:font-display prose-headings:text-coffee-900 prose-a:text-primary-600 hover:prose-a:text-primary-700">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, place an order, or communicate with us. This information may include your name, email address, phone number, and order details.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
                <li>Process your transactions and fulfill your orders.</li>
                <li>Communicate with you about your orders, account, and our services.</li>
                <li>Operate and improve our Services, including our rewards program.</li>
                <li>Personalize your experience.</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except as necessary to provide our Services (e.g., with payment processors) or as required by law. We do not sell your personal data.
            </p>
            
            <h2>4. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no internet-based service is 100% secure, so we cannot guarantee absolute security.
            </p>
            
            <h2>5. Your Choices</h2>
            <p>
              You may review and update your account information at any time by logging into your account and visiting your profile page. You can also unsubscribe from our marketing emails by following the instructions in those emails.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@rushcoffee.ph">hello@rushcoffee.ph</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
