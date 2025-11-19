import React, { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: ReactNode;
    containerClassName?: string;
    options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({
        className,
        label,
        error,
        helperText,
        startIcon,
        containerClassName,
        id,
        options,
        children,
        ...props
    }, ref) => {
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
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-600 z-10">
                            {startIcon}
                        </div>
                    )}
                    <select
                        id={id}
                        className={`
              w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-900 
              cursor-pointer transition-all duration-200 ease-in-out
              focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${startIcon ? 'pl-10' : ''}
              pr-10
              ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : 'border-gray-300 shadow-sm hover:border-primary-400'
                            }
              ${className || ''}
            `}
                        ref={ref}
                        {...props}
                    >
                        {options ? (
                            options.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.label}
                                </option>
                            ))
                        ) : (
                            children
                        )}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
                {error && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 animate-fade-in-up">
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p className="mt-1.5 text-xs text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
