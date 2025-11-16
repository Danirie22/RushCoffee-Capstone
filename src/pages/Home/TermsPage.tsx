
import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <section className="bg-gradient-to-br from-primary-50 to-coffee-50 px-6 py-20 text-center">
          <h1 className="font-display text-5xl font-bold text-coffee-900 md:text-6xl">Terms of Service</h1>
          <p className="mt-4 text-xl text-gray-700">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </section>

        <section className="px-6 py-16">
          <div className="prose prose-lg mx-auto max-w-4xl text-gray-700 prose-headings:font-display prose-headings:text-coffee-900 prose-a:text-primary-600 hover:prose-a:text-primary-700">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Rush Coffee ("we," "our," or "us"). These Terms of Service govern your use of our website, mobile application, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these terms.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              To use certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
            </p>

            <h2>3. Orders and Payments</h2>
            <p>
              When you place an order through our Services, you are making an offer to purchase the products you have selected. All orders are subject to our acceptance. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information.
            </p>
            <p>
              Payment for all orders must be made at the time of placing the order, unless you select "Cash on Pickup." We accept payment through GCash and other methods as may be made available from time to time.
            </p>
            
            <h2>4. Rewards Program</h2>
            <p>
              Our rewards program allows you to earn points for purchases and redeem them for rewards. Points are non-transferable and have no cash value. We reserve the right to modify, suspend, or terminate the rewards program at any time without notice.
            </p>
            
            <h2>5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Rush Coffee shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the services; (b) any conduct or content of any third party on the services; or (c) unauthorized access, use, or alteration of your transmissions or content.
            </p>

            <h2>6. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service from time to time. We will provide notice of any changes by posting the new Terms of Service on this page. You are advised to review these Terms of Service periodically for any changes.
            </p>
            
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at <a href="mailto:hello@rushcoffee.ph">hello@rushcoffee.ph</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
