import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    success?: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    containerClassName?: string;
    inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        type,
        label,
        error,
        helperText,
        success,
        startIcon,
        endIcon,
        containerClassName,
        id,
        inputSize = 'md',
        ...props
    }, ref) => {

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3.5 text-sm',
            lg: 'px-5 py-4 text-base',
        };

        return (
            <div className={`w-full ${containerClassName || ''}`}>
                {label && (
                    <label
                        htmlFor={id}
                        className="mb-1.5 block text-sm font-medium text-coffee-900"
                    >
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {startIcon && (
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-600">
                            {startIcon}
                        </div>
                    )}
                    <input
                        id={id}
                        type={type}
                        className={`
              w-full rounded-xl border bg-white text-gray-900 
              placeholder:text-gray-400 transition-all duration-200 ease-in-out
              focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${startIcon ? 'pl-10' : ''}
              ${endIcon ? 'pr-10' : ''}
              ${sizeClasses[inputSize]}
              ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : success
                                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/10'
                                    : 'border-gray-300 shadow-sm hover:border-primary-400'
                            }
              ${className || ''}
            `}
                        ref={ref}
                        {...props}
                    />
                    {endIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {endIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 animate-fade-in-up">
                        {error}
                    </p>
                )}
                {!error && success && (
                    <p className="mt-1.5 text-xs font-medium text-green-600 animate-fade-in-up">
                        {success}
                    </p>
                )}
                {!error && !success && helperText && (
                    <p className="mt-1.5 text-xs text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
