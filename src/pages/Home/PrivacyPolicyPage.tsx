import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Users, Database, Bell, RefreshCw, Mail, CheckCircle2, UserCheck, Share2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';

const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('collection');

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
      let currentSection = 'collection';

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
      id: 'collection',
      icon: Database,
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us when you create an account, place an order, or communicate with us. This information helps us provide you with a better, more personalized experience.`,
      subsections: [
        {
          subtitle: 'Personal Information',
          items: [
            'Name and contact information (email address, phone number)',
            'Account credentials (username and password)',
            'Payment information (processed securely through our payment partners)',
            'Delivery address and preferences'
          ]
        },
        {
          subtitle: 'Usage Information',
          items: [
            'Order history and preferences',
            'Rewards program activity',
            'Device information and IP address',
            'Browsing behavior and interaction with our Services'
          ]
        }
      ]
    },
    {
      id: 'usage',
      icon: Eye,
      title: '2. How We Use Your Information',
      content: `We use the information we collect to provide, maintain, and improve our Services, and to create a seamless coffee ordering experience for you.`,
      bullets: [
        'Process your transactions and fulfill your orders',
        'Communicate with you about your orders, account, and our services',
        'Operate and improve our Services, including our rewards program',
        'Personalize your experience and provide customized recommendations',
        'Send you promotional communications (with your consent)',
        'Detect, prevent, and address technical issues and fraud',
        'Comply with legal obligations and enforce our terms'
      ]
    },
    {
      id: 'sharing',
      icon: Share2,
      title: '3. Information Sharing',
      content: `We respect your privacy and do not sell your personal information. We only share your information in the following limited circumstances:`,
      bullets: [
        'With service providers who help us operate our business (e.g., payment processors, delivery services)',
        'When required by law or to respond to legal process',
        'To protect the rights, property, or safety of Rush Coffee, our users, or others',
        'With your consent or at your direction',
        'In connection with a merger, acquisition, or sale of assets (with notice to you)'
      ]
    },
    {
      id: 'security',
      icon: Lock,
      title: '4. Data Security',
      content: `We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no internet-based service is 100% secure, so we cannot guarantee absolute security.`,
      bullets: [
        'Encryption of sensitive data in transit and at rest',
        'Regular security audits and vulnerability assessments',
        'Strict access controls and authentication requirements',
        'Employee training on data protection and privacy',
        'Incident response procedures for potential data breaches'
      ]
    },
    {
      id: 'rights',
      icon: UserCheck,
      title: '5. Your Rights and Choices',
      content: `You have certain rights regarding your personal information. We are committed to helping you exercise these rights.`,
      bullets: [
        'Access and review your account information at any time',
        'Update or correct your personal information',
        'Request deletion of your account and associated data',
        'Opt-out of marketing communications',
        'Disable cookies through your browser settings',
        'Request a copy of your data in a portable format'
      ]
    },
    {
      id: 'retention',
      icon: Database,
      title: '6. Data Retention',
      content: `We retain your personal information for as long as necessary to provide our Services and fulfill the purposes outlined in this Privacy Policy.`,
      bullets: [
        'Active account data is retained while your account is active',
        'Order history is retained for 7 years for accounting and legal purposes',
        'Marketing preferences are retained until you opt-out',
        'Deleted account data is removed within 30 days, except where required by law'
      ]
    },
    {
      id: 'notifications',
      icon: Bell,
      title: '7. Push Notifications',
      content: `With your permission, we may send you push notifications about your orders, rewards, and special offers. You can manage your notification preferences at any time through your device settings or account preferences.`
    },
    {
      id: 'contact',
      icon: Mail,
      title: '8. Contact Us',
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:`,
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
        <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 px-6 py-16 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="font-display text-5xl font-bold md:text-6xl">Privacy Policy</h1>
            <p className="mt-4 text-xl text-primary-100">Your privacy is important to us</p>
            <p className="mt-2 text-sm text-white/80">Last updated: November 22, 2023</p>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="border-b border-gray-200 bg-gray-50 px-6 py-12 pb-20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                  <Lock className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-primary-900">Secure & Encrypted</h3>
                <p className="text-sm text-gray-600">Your data is protected with industry-standard encryption</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <UserCheck className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-primary-900">You're in Control</h3>
                <p className="text-sm text-gray-600">Manage your data and privacy settings anytime</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-primary-900">Never Sold</h3>
                <p className="text-sm text-gray-600">We never sell your personal information to third parties</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="sticky top-20 z-30 border-b border-gray-200 bg-white/95 py-4 backdrop-blur-sm">
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

                      {section.subsections && (
                        <div className="space-y-4 mt-4">
                          {section.subsections.map((subsection, idx) => (
                            <div key={idx} className="rounded-lg bg-gray-50 p-4">
                              <h3 className="mb-3 font-semibold text-primary-900">{subsection.subtitle}</h3>
                              {subsection.items && (
                                <ul className="space-y-2 ml-4">
                                  {subsection.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="flex items-start gap-2 text-gray-700 text-sm">
                                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-600"></span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
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

            {/* Privacy Commitment */}
            <Card className="border-l-4 border-primary-500 bg-primary-50">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="mb-2 font-display text-lg font-bold text-primary-900">Our Privacy Commitment</h3>
                  <p className="text-gray-700 leading-relaxed">
                    At Rush Coffee, we are committed to protecting your privacy and handling your personal information with care. If you have any questions or concerns about how we handle your data, please don't hesitate to contact us.
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

export default PrivacyPolicyPage;
