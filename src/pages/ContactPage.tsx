import * as React from 'react';
import { MapPin, Phone, Mail, Share2, Send, ChevronDown, User, Hash, MessageSquare, CheckCircle, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';

const faqData = [
    { question: "What are your operating hours?", answer: "We are open Monday - Sunday 12pm - 10pm." },
    { question: "How does the digital queue system work?", answer: "Simply place your order through our app or website. You'll be added to our virtual queue and receive real-time updates on your order status, including your position and estimated wait time. You'll get a notification when it's ready for pickup!" },
    { question: "Can I customize my drink?", answer: "Absolutely! Most of our drinks can be customized. You can choose your milk, sweetness level, add extra shots, and more right from the order page." },
    { question: "Do you offer catering services for events?", answer: "Yes, we do! We offer a range of catering options for meetings, parties, and events. Please use the contact form and select 'Partnership' as the subject to discuss your needs with us." },
    { question: "How do I earn and redeem rewards points?", answer: "You earn points with every purchase made through your account. You can view your points balance and redeem available rewards on the 'Rewards' page in the app." },
];

const AccordionItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void; }> = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-200">
        <button onClick={onClick} className="flex w-full items-center justify-between py-4 text-left text-lg font-medium text-gray-800 focus:outline-none">
            <span>{question}</span>
            <ChevronDown className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <p className="pb-4 text-gray-600">{answer}</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const InfoCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div>
            <h3 className="font-display text-xl font-bold text-coffee-900">{title}</h3>
            {children}
        </div>
    </div>
);


const ContactPage: React.FC = () => {
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
    const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [errors, setErrors] = React.useState<Partial<typeof formData>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const validate = () => {
        const newErrors: Partial<typeof formData> = {};
        if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters.";
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address.";
        if (!formData.subject) newErrors.subject = "Please select a subject.";
        if (formData.message.length < 10) newErrors.message = "Message must be at least 10 characters.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setIsSuccess(false);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setIsSuccess(false), 5000);
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white">
            <Header />
            <main>
                <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-coffee-900 px-6 py-20 text-center text-white">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?q=80&w=2610&auto=format&fit=crop"
                            alt="Coffee shop conversation"
                            className="h-full w-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-coffee-900/80 via-coffee-900/60 to-coffee-900/90"></div>
                    </div>

                    <div className="relative z-10 mx-auto max-w-3xl">
                        <span className="mb-4 inline-block rounded-full bg-primary-500/20 px-4 py-1.5 text-sm font-medium text-primary-300 backdrop-blur-sm">
                            We'd Love to Hear From You
                        </span>
                        <h1 className="animate-fade-in-up font-display text-5xl font-bold md:text-6xl" style={{ animationDelay: '100ms', opacity: 0 }}>
                            Get in Touch
                        </h1>
                        <p className="animate-fade-in-up mx-auto mt-4 max-w-2xl text-xl text-gray-200" style={{ animationDelay: '300ms', opacity: 0 }}>
                            Have a question, feedback, or just want to say hello? We're here to help.
                        </p>
                    </div>
                </section>

                <section className="bg-gray-50 px-6 py-24">
                    <div className="container mx-auto max-w-6xl">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid lg:grid-cols-5">
                            {/* Left: Form (3 cols) */}
                            <div className="p-8 lg:col-span-3 lg:p-12">
                                <h2 className="font-display text-3xl font-bold text-coffee-900">Send us a Message</h2>
                                {isSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 shadow-sm"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                            <CheckCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Message Sent Successfully!</p>
                                            <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                                        </div>
                                    </motion.div>
                                )}
                                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                    <Input
                                        id="name"
                                        name="name"
                                        label="Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        required
                                        error={errors.name}
                                        startIcon={<User className="h-5 w-5" />}
                                    />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        label="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        required
                                        error={errors.email}
                                        startIcon={<Mail className="h-5 w-5" />}
                                    />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number (Optional)"
                                        startIcon={<Phone className="h-5 w-5" />}
                                    />
                                    <Select
                                        id="subject"
                                        name="subject"
                                        label="Subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        error={errors.subject}
                                        startIcon={<Hash className="h-5 w-5" />}
                                    >
                                        <option value="" disabled>Select a subject...</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="support">Support</option>
                                    </Select>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        label="Message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="How can we help you today?"
                                        rows={5}
                                        required
                                        error={errors.message}
                                        startIcon={<MessageSquare className="h-5 w-5" />}
                                        showCharCount
                                        maxLength={500}
                                        helperText="Please provide as much detail as possible"
                                    />
                                    <Button
                                        type="submit"
                                        size="lg"
                                        fullWidth
                                        isLoading={isSubmitting}
                                        startIcon={!isSubmitting && <Send className="h-5 w-5" />}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </div>

                            {/* Right: Info (2 cols) - Dark Theme */}
                            <div className="bg-coffee-900 p-8 text-white lg:col-span-2 lg:p-12">
                                <h3 className="mb-8 font-display text-2xl font-bold">Contact Information</h3>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                            <MapPin className="h-6 w-6 text-primary-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Visit Us</h4>
                                            <p className="mt-1 text-gray-300">11 Visayan Ave. St. Galas, Quezon City, Philippines</p>
                                            <a
                                                href="https://www.google.com/maps/dir/?api=1&destination=11+Visayan+Ave+St.+Galas+Quezon+City"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center text-sm font-medium text-primary-300 hover:text-white"
                                            >
                                                Get Directions <ArrowRight className="ml-1 h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                            <Phone className="h-6 w-6 text-primary-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Call Us</h4>
                                            <a href="tel:09304641022" className="mt-1 block text-gray-300 hover:text-white transition-colors">
                                                0930 464 1022
                                            </a>
                                            <p className="text-sm text-gray-400">Monday - Sunday 12pm - 10pm</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                            <Mail className="h-6 w-6 text-primary-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Email Us</h4>
                                            <a href="mailto:hello@rushcoffee.ph" className="mt-1 block text-gray-300 hover:text-white transition-colors">
                                                hello@rushcoffee.ph
                                            </a>
                                            <p className="text-sm text-gray-400">Responds within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10">
                                        <h4 className="font-bold text-lg mb-4">Follow Us</h4>
                                        <div className="flex gap-4">
                                            <a href="https://www.facebook.com/profile.php?id=61551613276320" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary-600 hover:scale-110">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                            <a href="https://www.instagram.com/Rush_Coffee2023/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary-600 hover:scale-110">
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary-600 hover:scale-110">
                                                <Twitter className="h-5 w-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 px-6 py-20">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-center font-display text-3xl font-bold text-coffee-900 md:text-4xl">Frequently Asked Questions</h2>
                        <div className="mt-8">
                            {faqData.map((faq, index) => (
                                <AccordionItem key={index} {...faq} isOpen={openFaqIndex === index} onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 px-6 pb-24 pt-12">
                    <div className="container mx-auto max-w-6xl text-center">
                        <h2 className="mb-2 font-display text-3xl font-bold text-coffee-900 md:text-4xl">Find Your Way to Us</h2>
                        <p className="mb-8 text-gray-600">Come visit our cozy spot in the heart of the city.</p>

                        <div className="h-96 w-full overflow-hidden rounded-3xl shadow-xl">
                            <iframe
                                src="https://maps.google.com/maps?q=11%20Visayan%20Ave%20St.%20Galas%20Quezon%20City&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Rush Coffee Location"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
