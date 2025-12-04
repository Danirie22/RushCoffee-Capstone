import * as React from 'react';
import { NavLink } from 'react-router-dom';

interface HeaderNavProps {
    links: { href: string; label: string }[];
}

const HeaderNav: React.FC<HeaderNavProps> = ({ links }) => {
    return (
        <nav className="hidden items-center justify-center space-x-8 md:flex md:justify-self-center">
            {links.map((link) => (
                <NavLink
                    key={link.label}
                    to={link.href}
                    className={({ isActive }) =>
                        `relative text-sm font-normal uppercase transition-colors hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-700'
                        } after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-center after:transform after:bg-primary-600 after:transition-transform after:duration-300 ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'
                        } hover:after:scale-x-100`
                    }
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
};

export default HeaderNav;
