import React, { useState, useEffect } from 'react';
import { FileText, Shield, Users, CreditCard, Award, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';

const TermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 200; // Account for sticky header and navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id]');
      let currentSection = 'introduction';

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 200 && sectionTop >= -section.clientHeight + 200) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      id: 'introduction',
      icon: FileText,
      title: '1. Introduction',
      content: `Welcome to Rush Coffee ("we," "our," or "us"). These Terms of Service govern your use of our website, mobile application, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these terms.`
    },
    {
      id: 'accounts',
      icon: Users,
      title: '2. User Accounts',
      content: `To use certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.`,
      bullets: [
        'You must be at least 13 years old to create an account',
        'You are responsible for maintaining the confidentiality of your account credentials',
        'You must notify us immediately of any unauthorized use of your account',
        'We reserve the right to suspend or terminate accounts that violate these terms'
      ]
    },
    {
      id: 'orders',
      icon: CreditCard,
      title: '3. Orders and Payments',
      content: `When you place an order through our Services, you are making an offer to purchase the products you have selected. All orders are subject to our acceptance. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information.`,
      additional: `Payment for all orders must be made at the time of placing the order, unless you select "Cash on Pickup." We accept payment through GCash and other methods as may be made available from time to time.`,
      bullets: [
        'All prices are in Philippine Peso (₱) and are subject to change without notice',
        'You will receive an order confirmation via email or SMS',
        'Orders cannot be cancelled once they are being prepared',
        'Refunds are processed within 5-7 business days for eligible cancellations'
      ]
    },
    {
      id: 'rewards',
      icon: Award,
      title: '4. Rewards Program',
      content: `Our rewards program allows you to earn points for purchases and redeem them for rewards. Points are non-transferable and have no cash value. We reserve the right to modify, suspend, or terminate the rewards program at any time without notice.`,
      bullets: [
        'Points are earned based on purchase amount (1 point per ₱10 spent)',
        'Points expire after 12 months of inactivity',
        'Rewards can only be redeemed through your account',
        'Fraudulent activity may result in forfeiture of all points and account termination'
      ]
    },
    {
      id: 'liability',
      icon: Shield,
      title: '5. Limitation of Liability',
      content: `To the fullest extent permitted by applicable law, Rush Coffee shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:`,
      bullets: [
        'Your access to or use of or inability to access or use the Services',
        'Any conduct or content of any third party on the Services',
        'Unauthorized access, use, or alteration of your transmissions or content',
        'Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content'
      ]
    },
    {
      id: 'changes',
      icon: RefreshCw,
      title: '6. Changes to Terms',
      content: `We may modify these Terms of Service from time to time. We will provide notice of any changes by posting the new Terms of Service on this page and updating the "Last updated" date. You are advised to review these Terms of Service periodically for any changes. Your continued use of the Services after any modifications indicates your acceptance of the updated terms.`
    },
    {
      id: 'contact',
      icon: Mail,
      title: '7. Contact Us',
      content: `If you have any questions about these Terms of Service, please contact us:`,
      contact: {
        email: 'hello@rushcoffee.ph',
        phone: '+63 930 464 1022',
        address: '11 Visayan Ave. St. Galas, Quezon City, Philippines'
      }
    }
  ];

  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 px-6 py-16 text-center text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-4xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="font-display text-5xl font-bold md:text-6xl">Terms of Service</h1>
            <p className="mt-4 text-xl text-primary-100">Please read these terms carefully before using our services</p>
            <p className="mt-2 text-sm text-white/80">Last updated: November 22, 2023</p>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="sticky top-20 z-30 border-b border-gray-200 bg-white/95 py-4 backdrop-blur-sm -mt-12">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="flex overflow-x-auto pb-2">
              <div className="flex gap-2 px-4 m-auto">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => handleScrollTo(e, section.id)}
                    className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${activeSection === section.id
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'
                      }`}
                  >
                    {section.title.split('. ')[1]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="px-6 py-16">
          <div className="container mx-auto max-w-4xl space-y-8">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-[200px]">
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-100">
                        <section.icon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-4 font-display text-2xl font-bold text-primary-900">
                        {section.title}
                      </h2>
                      <p className="mb-4 text-gray-700 leading-relaxed">{section.content}</p>

                      {section.additional && (
                        <p className="mb-4 text-gray-700 leading-relaxed">{section.additional}</p>
                      )}

                      {section.bullets && (
                        <ul className="space-y-2 ml-4">
                          {section.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-600"></span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.contact && (
                        <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
                          <p className="flex items-center gap-2 text-gray-700">
                            <Mail className="h-4 w-4 text-primary-600" />
                            <a href={`mailto:${section.contact.email}`} className="text-primary-600 hover:underline">
                              {section.contact.email}
                            </a>
                          </p>
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="h-4 w-4 text-primary-600">📞</span>
                            <a href={`tel:${section.contact.phone}`} className="text-primary-600 hover:underline">
                              {section.contact.phone}
                            </a>
                          </p>
                          <p className="flex items-start gap-2 text-gray-700">
                            <span className="mt-0.5 h-4 w-4 text-primary-600">📍</span>
                            <span>{section.contact.address}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}

            {/* Important Notice */}
            <Card className="border-l-4 border-amber-500 bg-amber-50">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                <div>
                  <h3 className="mb-2 font-display text-lg font-bold text-primary-900">Important Notice</h3>
                  <p className="text-gray-700 leading-relaxed">
                    By using Rush Coffee's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
