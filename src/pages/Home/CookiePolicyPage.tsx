import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Settings, Info, Zap, BarChart3, Wrench, Globe, AlertCircle, Mail } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';

const CookiePolicyPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('what-are-cookies');

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
            let currentSection = 'what-are-cookies';

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
            id: 'what-are-cookies',
            icon: Info,
            title: '1. What Are Cookies?',
            content: `Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.`,
            additional: `Cookies help us understand how you use our website, remember your preferences, and provide you with a better, more personalized experience.`
        },
        {
            id: 'types',
            icon: Cookie,
            title: '2. Types of Cookies We Use',
            content: `We use different types of cookies to enhance your experience on our website. Each type serves a specific purpose:`,
            subsections: [
                {
                    icon: Zap,
                    subtitle: '2.1 Essential Cookies',
                    description: 'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
                    items: [
                        'Authentication cookies: Keep you logged in as you navigate through our site',
                        'Security cookies: Help detect and prevent security risks',
                        'Session cookies: Maintain your shopping cart and order information'
                    ]
                },
                {
                    icon: BarChart3,
                    subtitle: '2.2 Performance Cookies',
                    description: 'These cookies collect information about how visitors use our website, such as which pages are visited most often.',
                    items: [
                        'Page load times and response times',
                        'Error messages and debugging information',
                        'Navigation patterns and user flow'
                    ]
                },
                {
                    icon: Wrench,
                    subtitle: '2.3 Functionality Cookies',
                    description: 'These cookies allow our website to remember choices you make and provide enhanced, more personalized features.',
                    items: [
                        'Remember your login details',
                        'Store your preferences (e.g., favorite drinks, customization options)',
                        'Maintain your rewards program status',
                        'Remember items in your shopping cart'
                    ]
                },
                {
                    icon: BarChart3,
                    subtitle: '2.4 Analytics Cookies',
                    description: 'We use analytics cookies to understand how visitors interact with our website.',
                    items: [
                        'Number of visitors and page views',
                        'Time spent on pages',
                        'Popular menu items and features',
                        'Traffic sources and referral information'
                    ]
                }
            ]
        },
        {
            id: 'third-party',
            icon: Globe,
            title: '3. Third-Party Cookies',
            content: `In addition to our own cookies, we may also use various third-party cookies to report usage statistics of our services.`,
            subsections: [
                {
                    subtitle: '3.1 Payment Processing',
                    description: 'When you make a payment through GCash or other payment providers, these services may set their own cookies to process your transaction securely.'
                },
                {
                    subtitle: '3.2 Analytics Services',
                    description: 'We use third-party analytics services (such as Google Analytics) to help us understand how our website is being used.'
                }
            ]
        },
        {
            id: 'duration',
            icon: Settings,
            title: '4. How Long Do Cookies Last?',
            content: `The length of time a cookie will stay on your device depends on its type:`,
            bullets: [
                'Session Cookies: These are temporary cookies that expire when you close your browser.',
                'Persistent Cookies: These remain on your device for a set period or until you delete them.'
            ]
        },
        {
            id: 'managing',
            icon: Settings,
            title: '5. Managing Cookies',
            content: `You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by adjusting your browser settings.`,
            subsections: [
                {
                    subtitle: '5.1 Browser Settings',
                    description: 'Most web browsers allow you to control cookies through their settings. You can set your browser to:',
                    items: [
                        'Block all cookies',
                        'Block third-party cookies only',
                        'Delete cookies when you close your browser',
                        'Accept cookies from specific websites only'
                    ]
                },
                {
                    subtitle: '5.2 Browser-Specific Instructions',
                    description: 'For detailed instructions on how to manage cookies in your specific browser, please visit:',
                    links: [
                        { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                        { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop' },
                        { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
                        { name: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' }
                    ]
                },
                {
                    subtitle: '5.3 Impact of Disabling Cookies',
                    description: 'Please note that if you choose to block or delete cookies, some features of our website may not function properly. For example:',
                    items: [
                        'You may not be able to stay logged in',
                        'Your shopping cart may not work correctly',
                        'Your preferences and customizations may not be saved',
                        'Some pages may not display properly'
                    ]
                }
            ]
        },
        {
            id: 'personal-data',
            icon: Shield,
            title: '6. Cookies and Personal Data',
            content: `Some cookies may collect personal data. Any personal data collected through cookies is handled in accordance with our Privacy Policy. We are committed to protecting your privacy and ensuring your data is secure.`
        },
        {
            id: 'updates',
            icon: AlertCircle,
            title: '7. Updates to This Cookie Policy',
            content: `We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically to stay informed about how we use cookies.`,
            additional: `The "Last updated" date at the top of this page indicates when this policy was last revised. Any changes will become effective when we post the revised Cookie Policy on our website.`
        },
        {
            id: 'contact',
            icon: Mail,
            title: '8. Contact Us',
            content: `If you have any questions about our use of cookies or this Cookie Policy, please contact us:`,
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
                            <Cookie className="h-10 w-10" />
                        </div>
                        <h1 className="font-display text-5xl font-bold md:text-6xl">Cookie Policy</h1>
                        <p className="mt-4 text-xl text-primary-100">Understanding how we use cookies</p>
                        <p className="mt-2 text-sm text-white/80">Last updated: November 22, 2023</p>
                    </div>
                </section>

                {/* Cookie Overview */}
                <section className="border-b border-gray-200 bg-gray-50 px-6 py-12 pb-20">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                                    <Info className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="mb-2 font-display text-lg font-semibold text-primary-900">What Are Cookies?</h3>
                                <p className="text-sm text-gray-600">Small text files stored on your device to enhance your browsing experience</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                    <Shield className="h-7 w-7 text-green-600" />
                                </div>
                                <h3 className="mb-2 font-display text-lg font-semibold text-primary-900">Your Privacy</h3>
                                <p className="text-sm text-gray-600">We respect your privacy and only use cookies to improve your experience</p>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                                    <Settings className="h-7 w-7 text-primary-600" />
                                </div>
                                <h3 className="mb-2 font-display text-lg font-semibold text-primary-900">Your Control</h3>
                                <p className="text-sm text-gray-600">You can manage or disable cookies through your browser settings at any time</p>
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

                                            {section.additional && (
                                                <p className="mb-4 text-gray-700 leading-relaxed">{section.additional}</p>
                                            )}

                                            {section.subsections && (
                                                <div className="space-y-6 mt-6">
                                                    {section.subsections.map((subsection, idx) => (
                                                        <div key={idx} className="rounded-lg bg-gray-50 p-4">
                                                            {subsection.icon && (
                                                                <div className="mb-3 flex items-center gap-2">
                                                                    <subsection.icon className="h-5 w-5 text-primary-600" />
                                                                    <h3 className="font-semibold text-primary-900">{subsection.subtitle}</h3>
                                                                </div>
                                                            )}
                                                            {!subsection.icon && (
                                                                <h3 className="mb-3 font-semibold text-primary-900">{subsection.subtitle}</h3>
                                                            )}
                                                            {subsection.description && (
                                                                <p className="mb-3 text-gray-700 text-sm">{subsection.description}</p>
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

                        {/* Your Consent */}
                        <Card className="border-l-4 border-primary-500 bg-primary-50">
                            <div className="flex items-start gap-4">
                                <Cookie className="h-6 w-6 flex-shrink-0 text-primary-600" />
                                <div>
                                    <h3 className="mb-2 font-display text-lg font-bold text-primary-900">Your Consent</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        By continuing to use our website, you consent to our use of cookies as described in this Cookie Policy. If you do not agree with our use of cookies, you should adjust your browser settings accordingly or refrain from using our website.
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

export default CookiePolicyPage;
