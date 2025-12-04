import { User, TrendingUp, Gift, Info, Phone } from 'lucide-react';

export const loggedOutNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    { href: '/contact', label: 'Contact' },
];

export const loggedInNavLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/queue', label: 'Queue' },
    { href: '/rewards', label: 'Rewards' },
];

export const userDropdownLinks = [
    { href: '/profile', label: 'My Profile', Icon: User },
    { href: '/flavor-profile', label: 'My Flavor Profile', Icon: TrendingUp },
    { href: '/rewards', label: 'My Rewards', Icon: Gift },
    { href: '/about', label: 'About', Icon: Info },
    { href: '/contact', label: 'Contact', Icon: Phone },
];
