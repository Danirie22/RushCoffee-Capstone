import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Zap, Users, Lightbulb, MapPin, Phone, Clock, ArrowRight, Star, Watch } from 'lucide-react';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';

// Custom hook for counting up numbers when they enter the viewport
const useCountUp = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const decimals = end % 1 !== 0 ? 1 : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const endValue = end;
          if (start === endValue) {
            setCount(endValue);
            return;
          }

          const totalFrames = Math.round(duration / (1000 / 60));
          const increment = (endValue - start) / totalFrames;
          
          const counter = () => {
            start += increment;
            if (start < endValue) {
              setCount(start);
              requestAnimationFrame(counter);
            } else {
              setCount(endValue);
            }
          };
          requestAnimationFrame(counter);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if(currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [end, duration]);

  return { count: count.toFixed(decimals), ref };
};

const StatCard: React.FC<{ icon: React.ElementType; value: number; label: string; suffix?: string }> = ({ icon: Icon, value, label, suffix = '' }) => {
    const { count, ref } = useCountUp(value);
    const hasDecimals = count.includes('.');
    
    return (
        <div className="flex flex-col items-center text-center">
            <Icon className="mb-2 h-10 w-10 text-primary-600" />
            <span ref={ref} className="font-display text-4xl font-bold text-coffee-900">
                {Number(count).toLocaleString(undefined, {
                    minimumFractionDigits: hasDecimals ? 1 : 0,
                    maximumFractionDigits: hasDecimals ? 1 : 0,
                })}{suffix}
            </span>
            <p className="mt-1 text-gray-600">{label}</p>
        </div>
    );
};

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-coffee-100 to-white px-6 py-24 text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-30"></div>
          <div className="relative z-10 mx-auto max-w-4xl">
            <h1 className="animate-fade-in-up font-display text-5xl font-bold text-coffee-900 md:text-6xl" style={{ animationDelay: '100ms', opacity: 0 }}>
              About Rush Coffee
            </h1>
            <p className="animate-fade-in-up mt-4 text-xl text-gray-700 md:text-2xl" style={{ animationDelay: '300ms', opacity: 0 }}>
              More than just coffee, it's a revolution in your daily ritual.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="px-6 py-20">
          <div className="container mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
            <div className="animate-fade-in-up">
              <h2 className="font-display text-3xl font-bold text-coffee-900 md:text-4xl">Our Story</h2>
              <p className="mt-4 text-lg text-gray-600">
                Founded in 2023 by a group of passionate coffee aficionados and tech enthusiasts, Rush Coffee was born from a simple yet powerful idea: your coffee break should be a moment of joy, not a test of patience.
              </p>
              <p className="mt-4 text-gray-600">
                We saw the long lines, the rushed orders, and the precious minutes slipping away from people's days. Our mission became clear: to blend the rich tradition of artisanal coffee with the seamless efficiency of modern technology. We're not just serving coffee; we're giving you back your time, one perfectly brewed cup at a time.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
              <img 
                src="/Menu/free-pastry-item.jpg" 
                alt="Inside Rush Coffee shop"
                className="h-80 w-full rounded-lg object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gray-50 px-6 py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-coffee-900 md:text-4xl">What We Stand For</h2>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Our core values guide every bean we roast and every line of code we write.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card hover className="text-center"><Coffee className="mx-auto mb-4 h-12 w-12 text-primary-600" /><h3 className="font-display text-xl font-semibold text-coffee-900">Quality</h3><p className="mt-2 text-gray-600">From ethically sourced, premium beans to the perfect extraction, excellence is in every cup.</p></Card>
              <Card hover className="text-center"><Zap className="mx-auto mb-4 h-12 w-12 text-primary-600" /><h3 className="font-display text-xl font-semibold text-coffee-900">Speed</h3><p className="mt-2 text-gray-600">Our digital queue system ensures your order is ready when you are. Fast, efficient, and always fresh.</p></Card>
              <Card hover className="text-center"><Users className="mx-auto mb-4 h-12 w-12 text-primary-600" /><h3 className="font-display text-xl font-semibold text-coffee-900">Community</h3><p className="mt-2 text-gray-600">We're more than a coffee shop; we're a hub for connection, creativity, and caffeine lovers.</p></Card>
              <Card hover className="text-center"><Lightbulb className="mx-auto mb-4 h-12 w-12 text-primary-600" /><h3 className="font-display text-xl font-semibold text-coffee-900">Innovation</h3><p className="mt-2 text-gray-600">Continuously improving your experience by thoughtfully integrating technology with tradition.</p></Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white px-6 py-20">
            <div className="container mx-auto max-w-7xl">
                 <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Users} value={10000} label="Happy Customers" suffix="+" />
                    <StatCard icon={Coffee} value={50000} label="Coffees Served" suffix="+" />
                    <StatCard icon={Star} value={4.9} label="Average Rating" />
                    <StatCard icon={Watch} value={5} label="Minutes Average Wait" />
                </div>
            </div>
        </section>

        {/* Location Section */}
        <section className="bg-gray-50 px-6 py-20">
          <div className="container mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-coffee-900 md:text-4xl">Visit Us</h2>
              <p className="mt-4 text-gray-600">Experience the Rush Coffee difference in person. We're ready to serve you.</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-4"><MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-primary-600" /><div><h4 className="font-semibold text-coffee-900">Address</h4><p className="text-gray-600">123 Coffee Street, Malate, Manila, 1004 Metro Manila</p></div></li>
                <li className="flex items-start gap-4"><Clock className="mt-1 h-6 w-6 flex-shrink-0 text-primary-600" /><div><h4 className="font-semibold text-coffee-900">Operating Hours</h4><p className="text-gray-600">Monday - Friday: 7:00 AM - 8:00 PM</p><p className="text-gray-600">Saturday - Sunday: 8:00 AM - 6:00 PM</p></div></li>
                <li className="flex items-start gap-4"><Phone className="mt-1 h-6 w-6 flex-shrink-0 text-primary-600" /><div><h4 className="font-semibold text-coffee-900">Contact</h4><a href="tel:+639171234567" className="text-primary-600 transition hover:text-primary-700">+63 917 123 4567</a></div></li>
              </ul>
              <Button size="lg" className="mt-8">Get Directions</Button>
            </div>
            <div className="h-96 overflow-hidden rounded-lg shadow-xl"><div className="flex h-full w-full items-center justify-center bg-gray-300 bg-cover bg-center" style={{backgroundImage: "url('/Coffee Based/coffee-jelly.jpg')"}}><span className="rounded bg-white/80 px-4 py-2 font-semibold text-gray-700 backdrop-blur-sm">[Google Maps Placeholder]</span></div></div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-primary-600 via-coffee-600 to-primary-700 px-6 py-20">
            <div className="absolute -left-1/4 -top-1/4 opacity-10"><RushCoffeeLogo className="h-64 w-64 animate-float text-white" /></div>
            <div className="absolute -bottom-1/4 -right-1/4 opacity-10"><RushCoffeeLogo className="h-80 w-80 animate-float-delay text-white" /></div>
            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <h2 className="font-display text-4xl font-bold text-white md:text-5xl">Ready to Experience the Rush?</h2>
                <p className="mb-8 mt-4 text-xl text-primary-100">Join thousands of customers who've already skipped the line.</p>
                <Link to="/menu">
                    <Button size="lg" className="bg-white text-primary-600 transition-transform hover:scale-105 hover:bg-primary-50">
                        Order Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
