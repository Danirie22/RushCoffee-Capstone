import * as React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    clickable?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    variant = 'default',
    padding = 'md',
    clickable = false,
    onClick
}) => {
    const baseClasses = 'rounded-2xl transition-all duration-300 ease-out';

    const variantClasses = {
        default: 'border border-gray-100 bg-white/80 backdrop-blur-sm shadow-lg',
        elevated: 'bg-white shadow-xl border-0',
        outlined: 'border-2 border-primary-200 bg-white',
        glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-xl',
    };

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverClasses = hover
        ? 'hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]'
        : '';

    const clickableClasses = clickable
        ? 'cursor-pointer active:scale-[0.98]'
        : '';

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`}
            onClick={clickable ? onClick : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
        >
            {children}
        </div>
    );
};

export default Card;