import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  asChild?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  asChild = false,
  isLoading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  disabled,
  ...props
}, ref) => {

  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:shadow-xl focus:ring-primary-500/30 active:bg-primary-800',
    secondary: 'bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:shadow-xl focus:ring-primary-500/30 active:bg-primary-800',
    outline: 'border-2 border-primary-600 bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500/20 active:bg-primary-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20 active:bg-gray-200',
    danger: 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl focus:ring-red-500/30 active:bg-red-800',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && startIcon && <span className="inline-flex items-center flex-shrink-0">{startIcon}</span>}
      <span className="inline-flex items-center">{children}</span>
      {!isLoading && endIcon && <span className="inline-flex items-center flex-shrink-0">{endIcon}</span>}
    </>
  );

  if (asChild) {
    return <span className={combinedClasses}>{content}</span>;
  }

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;