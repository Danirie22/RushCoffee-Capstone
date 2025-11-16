
import * as React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
    const hoverClasses = hover ? 'hover:shadow-xl transition-all duration-300' : '';
    return (
        <div className={`rounded-lg border border-gray-100 bg-white p-6 shadow-sm ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
};

export default Card;