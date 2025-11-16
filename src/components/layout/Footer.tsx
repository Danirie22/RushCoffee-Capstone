
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import RushCoffeeLogo from './RushCoffeeLogo';

const Footer: React.FC = () => {
    return (
        <footer className="bg-coffee-900 text-coffee-100">
            <div className="container mx-auto grid grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
                {/* Column 1: About */}
                <div className="space-y-4">
                    <Link to="/" className="flex items-center gap-2">
                        <RushCoffeeLogo className="h-8 w-8 text-primary-400" />
                        <span className="text-2xl font-bold text-primary-400">
                            Rush Coffee
                        </span>
                    </Link>
                    <p className="font-semibold">Premium coffee, no waiting.</p>
                    <p className="text-sm text-coffee-100/80">
                        Join the digital queue and get your coffee fix faster than ever.
                    </p>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h3 className="mb-4 font-semibold text-primary-400">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link to="/" className="transition hover:text-primary-400">Home</Link></li>
                        <li><Link to="/about" className="transition hover:text-primary-400">About Us</Link></li>
                        <li><Link to="/menu" className="transition hover:text-primary-400">Menu</Link></li>
                        <li><Link to="/faq" className="transition hover:text-primary-400">FAQ</Link></li>
                        <li><Link to="/contact" className="transition hover:text-primary-400">Contact</Link></li>
                    </ul>
                </div>

                {/* Column 3: Legal */}
                <div>
                    <h3 className="mb-4 font-semibold text-primary-400">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link to="/terms" className="transition hover:text-primary-400">Terms of Service</Link></li>
                        <li><Link to="/privacy" className="transition hover:text-primary-400">Privacy Policy</Link></li>
                        <li><Link to="/cookies" className="transition hover:text-primary-400">Cookie Policy</Link></li>
                    </ul>
                </div>

                {/* Column 4: Contact & Connect */}
                <div>
                    <h3 className="mb-4 font-semibold text-primary-400">Contact & Connect</h3>
                    <address className="not-italic">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-1 h-5 w-5 flex-shrink-0" />
                                <span>123 Coffee Street, Manila</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 flex-shrink-0" />
                                <a href="tel:+639171234567" className="transition hover:text-primary-400">+63 917 123 4567</a>
                            </li>
                             <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 flex-shrink-0" />
                                <a href="mailto:hello@rushcoffee.ph" className="transition hover:text-primary-400">hello@rushcoffee.ph</a>
                            </li>
                        </ul>
                    </address>
                     <div className="mt-6 flex gap-4">
                        <a href="#" aria-label="Facebook" className="transition hover:text-primary-400">
                            <Facebook className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="Instagram" className="transition hover:text-primary-400">
                            <Instagram className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="Twitter" className="transition hover:text-primary-400">
                            <Twitter className="h-6 w-6" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-coffee-800 bg-coffee-900/50">
                <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-6 py-4 text-center text-sm sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} Rush Coffee. All rights reserved.</p>
                    <p>Made with ☕ and ❤️</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;