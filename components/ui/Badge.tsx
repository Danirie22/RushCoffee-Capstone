
import * as React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
    const baseClasses = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
    
    // Default style if no color classes are provided via className
    const defaultClasses = !className.includes('bg-') ? 'bg-primary-100 text-primary-800' : '';

    return (
        <span className={`${baseClasses} ${defaultClasses} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;