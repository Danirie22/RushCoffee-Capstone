import * as React from 'react';

type BadgeVariant = 'solid' | 'outline' | 'dot';
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: BadgeVariant;
    color?: BadgeColor;
    size?: BadgeSize;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    className = '',
    variant = 'solid',
    color = 'primary',
    size = 'md'
}) => {
    const baseClasses = "inline-flex items-center gap-1.5 rounded-full font-medium";

    const sizeClasses = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const solidColorClasses: Record<BadgeColor, string> = {
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    const outlineColorClasses: Record<BadgeColor, string> = {
        primary: 'border-2 border-primary-300 text-primary-700 bg-transparent',
        success: 'border-2 border-green-300 text-green-700 bg-transparent',
        warning: 'border-2 border-amber-300 text-amber-700 bg-transparent',
        error: 'border-2 border-red-300 text-red-700 bg-transparent',
        info: 'border-2 border-blue-300 text-blue-700 bg-transparent',
        gray: 'border-2 border-gray-300 text-gray-700 bg-transparent',
    };

    const dotColorClasses: Record<BadgeColor, string> = {
        primary: 'bg-primary-500',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        gray: 'bg-gray-500',
    };

    const variantClasses = variant === 'outline' ? outlineColorClasses[color] : solidColorClasses[color];

    return (
        <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}>
            {variant === 'dot' && (
                <span className={`h-2 w-2 rounded-full ${dotColorClasses[color]} animate-pulse`}></span>
            )}
            {children}
        </span>
    );
};

export default Badge;