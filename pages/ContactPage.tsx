import * as React from 'react';
import { MapPin, Phone, Mail, Share2, Send, ChevronDown, User, Hash, MessageSquare, CheckCircle, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import Textarea from '../src/components/ui/Textarea';
import Select from '../src/components/ui/Select';

const faqData = [
    { question: "What are your operating hours?", answer: "We are open Monday to Friday from 7:00 AM to 8:00 PM, and Saturday to Sunday from 8:00 AM to 6:00 PM." },
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
                <section className="bg-gradient-to-br from-primary-50 to-coffee-50 px-6 py-20 text-center">
                    <h1 className="font-display text-5xl font-bold text-coffee-900 md:text-6xl">Get in Touch</h1>
                    <p className="mt-4 text-xl text-gray-700">We're here to help and answer any question you might have.</p>
                </section>

                <section className="px-6 py-20">
                    <div className="container mx-auto grid max-w-7xl gap-12 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <Card className="p-8">
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
                                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
                            </Card>
                        </div>
                        <div className="space-y-8 lg:col-span-2">
                            <InfoCard icon={MapPin} title="Visit Us"><p className="mt-1 text-gray-600">123 Coffee Street, Malate, Manila</p><Button variant="secondary" size="sm" className="mt-2">Get Directions</Button></InfoCard>
                            <InfoCard icon={Phone} title="Call Us"><a href="tel:+639171234567" className="mt-1 text-primary-600 transition hover:text-primary-700">+63 917 123 4567</a><p className="text-sm text-gray-500">Mon-Sun: 7AM - 8PM</p></InfoCard>
                            <InfoCard icon={Mail} title="Email Us"><a href="mailto:hello@rushcoffee.ph" className="mt-1 text-primary-600 transition hover:text-primary-700">hello@rushcoffee.ph</a><p className="text-sm text-gray-500">Responds within 24 hours</p></InfoCard>
                            <InfoCard icon={Share2} title="Follow Us">
                                <div className="mt-2 flex gap-4">
                                    <a href="#" aria-label="Facebook" className="text-gray-500 transition hover:text-primary-600"><Facebook /></a>
                                    <a href="#" aria-label="Instagram" className="text-gray-500 transition hover:text-primary-600"><Instagram /></a>
                                    <a href="#" aria-label="Twitter" className="text-gray-500 transition hover:text-primary-600"><Twitter /></a>
                                </div>
                            </InfoCard>
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

                <section>
                    <div className="h-96 w-full bg-gray-300 flex items-center justify-center">
                        <p className="text-gray-600 font-semibold">[Google Maps Embed Placeholder]</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;