
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import RushCoffeeLogo from './RushCoffeeLogo';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-coffee-900 text-coffee-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            <div className="container relative z-10 mx-auto grid grid-cols-2 gap-8 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
                {/* Column 1: About */}
                <div className="col-span-2 space-y-4 md:col-span-1 lg:col-span-1">
                    <Link to="/" className="flex items-center gap-2">
                        <RushCoffeeLogo className="h-8 w-8 text-primary-500" />
                        <span className="font-display text-2xl font-bold text-white">
                            Rush Coffee
                        </span>
                    </Link>
                    <p className="font-medium text-white">Premium coffee, no waiting.</p>
                    <p className="text-sm leading-relaxed text-coffee-200/80">
                        Join the digital queue and get your coffee fix faster than ever. Experience the future of coffee ordering.
                    </p>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h3 className="mb-6 font-display text-lg font-bold text-white">Quick Links</h3>
                    <ul className="space-y-3">
                        <li><Link to="/" className="transition-colors hover:text-primary-400 hover:underline">Home</Link></li>
                        <li><Link to="/about" className="transition-colors hover:text-primary-400 hover:underline">About Us</Link></li>
                        <li><Link to="/menu" className="transition-colors hover:text-primary-400 hover:underline">Menu</Link></li>
                        <li><Link to="/faq" className="transition-colors hover:text-primary-400 hover:underline">FAQ</Link></li>
                        <li><Link to="/contact" className="transition-colors hover:text-primary-400 hover:underline">Contact</Link></li>
                    </ul>
                </div>

                {/* Column 3: Legal */}
                <div>
                    <h3 className="mb-6 font-display text-lg font-bold text-white">Legal</h3>
                    <ul className="space-y-3">
                        <li><Link to="/terms" className="transition-colors hover:text-primary-400 hover:underline">Terms of Service</Link></li>
                        <li><Link to="/privacy" className="transition-colors hover:text-primary-400 hover:underline">Privacy Policy</Link></li>
                        <li><Link to="/cookies" className="transition-colors hover:text-primary-400 hover:underline">Cookie Policy</Link></li>
                    </ul>
                </div>

                {/* Column 4: Contact & Connect */}
                <div className="col-span-2 md:col-span-1 lg:col-span-1">
                    <h3 className="mb-6 font-display text-lg font-bold text-white">Contact & Connect</h3>
                    <address className="not-italic">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
                                <span>123 Coffee Street, Manila</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 flex-shrink-0 text-primary-500" />
                                <a href="tel:+639171234567" className="transition-colors hover:text-white">+63 917 123 4567</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 flex-shrink-0 text-primary-500" />
                                <a href="mailto:hello@rushcoffee.ph" className="transition-colors hover:text-white">hello@rushcoffee.ph</a>
                            </li>
                        </ul>
                    </address>
                    <div className="mt-8 flex gap-4">
                        <a href="#" aria-label="Facebook" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-primary-600 hover:text-white">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" aria-label="Instagram" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-primary-600 hover:text-white">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href="#" aria-label="Twitter" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-primary-600 hover:text-white">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-white/10 bg-black/20">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-6 text-center text-sm text-coffee-300 sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} Rush Coffee. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-red-500">❤️</span> and <span className="text-amber-500">☕</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;