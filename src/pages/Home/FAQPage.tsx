import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const faqData = [
  // Ordering & Queue
  { category: 'Ordering & Queue', question: "How do I join the virtual queue?", answer: "Simply place an order through our website or app. You'll automatically join the queue and receive your position number." },
  { category: 'Ordering & Queue', question: "Can I see my queue position in real-time?", answer: "Yes! Your queue page updates in real-time showing your current position and estimated wait time." },
  { category: 'Ordering & Queue', question: "What happens if I miss my turn?", answer: "Don't worry! You have a 10-minute grace period to pick up your order once it's ready. After that, your order will be held for you, but you may need to wait briefly if we are busy." },
  { category: 'Ordering & Queue', question: "Can I cancel my order?", answer: "Yes, you can cancel an order directly from your order history as long as its status is still 'waiting'. Once it moves to 'preparing', it can no longer be canceled. Refunds for successful cancellations are processed within 3-5 business days." },
  // Payments
  { category: 'Payments', question: "What payment methods do you accept?", answer: "We currently accept GCash for pre-payment and cash on pickup. We are working on adding more digital payment options soon!" },
  { category: 'Payments', question: "Is it safe to pay via GCash?", answer: "Absolutely! We use a secure payment process, and your payment information is encrypted and handled safely." },
  { category: 'Payments', question: "Do I need to pay upfront?", answer: "For GCash payments, yes, payment is required upon placing the order. For cash payments, you can pay at the counter when you pick up your order." },
  // Rewards
  { category: 'Rewards', question: "How do I earn rewards points?", answer: "You earn points with every purchase made through your Rush Coffee account! The current rate is 1 point for every ₱10 spent. Keep an eye out for special promotions to earn bonus points." },
  { category: 'Rewards', question: "When do my points expire?", answer: "Good news - your points never expire! You can save them up for as long as you like and redeem them for rewards whenever you're ready." },
  { category: 'Rewards', question: "What are the tier benefits?", answer: "We have three tiers! Bronze (0-299pts): Earn 1x points. Silver (300-999pts): Earn 1.5x points and get access to exclusive silver rewards. Gold (1000+pts): Earn 2x points, get VIP perks, and early access to new items." },
  // Account
  { category: 'Account', question: "Do I need an account to order?", answer: "Yes, creating an account is necessary. It allows us to manage your orders in the queue, track your rewards points, and save your preferences for a faster checkout next time." },
  { category: 'Account', question: "How do I reset my password?", answer: "On the login page, click the 'Forgot your password?' link. We'll send a password reset link to the email address associated with your account." },
  { category: 'Account', question: "Can I change my email address?", answer: "To update the email address on your account, please contact our support team at hello@rushcoffee.ph, and we'll be happy to assist you." },
  // Technical
  { category: 'Technical', question: "The website isn't working correctly. What should I do?", answer: "First, try refreshing the page. If that doesn't work, clearing your browser's cache and cookies often resolves the issue. If you're still experiencing problems, please contact our support team with details about the issue." },
  { category: 'Technical', question: "Do you have a mobile app?", answer: "A dedicated mobile app for iOS and Android is currently in development and will be launching soon! For now, our website is fully responsive and works great on all mobile browsers." },
  // General
  { category: 'General', question: "What are your operating hours?", answer: "We're open Monday to Sunday, from 7:00 AM to 10:00 PM. Hours may vary on public holidays." },
  { category: 'General', question: "Do you offer WiFi in your store?", answer: "Yes, we offer complimentary high-speed WiFi for all our customers. Just ask our staff for the network details." },
  { category: 'General', question: "Can I customize my drink?", answer: "Absolutely! You can customize aspects like milk type, sweetness level, add extra espresso shots, and choose from various syrups and toppings directly on the product page before adding an item to your cart." },
];

const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

const AccordionItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void; highlight: string; }> = ({ question, answer, isOpen, onClick, highlight }) => {
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? <mark key={index} className="bg-primary-100 text-primary-700 rounded-sm">{part}</mark> : part
    );
  };
    
  return (
    <div className="border-b border-gray-200">
      <button onClick={onClick} className="flex w-full items-center justify-between py-5 text-left text-lg font-medium text-gray-800 focus:outline-none focus:bg-gray-50 rounded-md">
        <span className="flex-1 pr-4">{highlightText(question, highlight)}</span>
        <ChevronDown className={`h-6 w-6 transform text-primary-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-6 text-gray-600 leading-relaxed">{highlightText(answer, highlight)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' || 
                            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="bg-white">
      <Header />
      <main>
        <section className="bg-gradient-to-br from-primary-50 to-coffee-50 px-6 py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="font-display text-5xl font-bold text-coffee-900 md:text-6xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-xl text-gray-700">Everything you need to know about Rush Coffee</p>
            <div className="relative mx-auto mt-8 max-w-2xl">
              <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
              <input 
                type="search"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-4 pl-16 pr-6 text-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>
        
        <div className="sticky top-20 z-30 border-b border-gray-200 bg-white/95 py-3 backdrop-blur-sm">
            <div className="container mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                            activeCategory === category
                                ? 'bg-primary-600 text-white shadow'
                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        <section className="px-6 py-16">
          <div className="container mx-auto max-w-4xl">
            {filteredFaqs.length > 0 ? (
                <div>
                    <p className="mb-4 text-sm text-gray-500">{filteredFaqs.length} question(s) found</p>
                    {filteredFaqs.map((faq, index) => (
                        <AccordionItem 
                            key={`${faq.category}-${index}`}
                            question={faq.question} 
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            highlight={searchQuery}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <Search className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No Results Found</h3>
                    <p className="mt-2 text-gray-500">We couldn't find any answers for "{searchQuery}". Try a different search term or category.</p>
                </div>
            )}
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-20">
            <div className="container mx-auto max-w-4xl">
                <Card className="text-center">
                    <HelpCircle className="mx-auto h-12 w-12 text-primary-600"/>
                    <h2 className="mt-4 font-display text-3xl font-bold text-coffee-900">Still have questions?</h2>
                    <p className="mt-2 text-gray-600">If you can't find the answer you're looking for, please get in touch with our support team.</p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link to="/contact">
                            <Button size="lg"><MessageCircle className="mr-2 h-5 w-5"/>Contact Support</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;