import React, { TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: ReactNode;
    containerClassName?: string;
    showCharCount?: boolean;
    maxLength?: number;
    autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        className,
        label,
        error,
        helperText,
        startIcon,
        containerClassName,
        id,
        showCharCount = false,
        maxLength,
        autoResize = false,
        value,
        onChange,
        ...props
    }, ref) => {
        const [charCount, setCharCount] = React.useState(0);
        const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

        // Handle character count
        React.useEffect(() => {
            if (value !== undefined) {
                setCharCount(String(value).length);
            }
        }, [value]);

        // Handle auto-resize
        React.useEffect(() => {
            if (autoResize && textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        }, [value, autoResize]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            if (onChange) {
                onChange(e);
            }
        };

        const setRefs = (element: HTMLTextAreaElement | null) => {
            textareaRef.current = element;
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
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
                        <div className="pointer-events-none absolute left-3 top-3 text-gray-400 transition-colors group-focus-within:text-primary-600">
                            {startIcon}
                        </div>
                    )}
                    <textarea
                        id={id}
                        className={`
              w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-900 
              placeholder:text-gray-400 transition-all duration-200 ease-in-out resize-none
              focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${startIcon ? 'pl-10' : ''}
              ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : 'border-gray-300 shadow-sm hover:border-primary-400'
                            }
              ${autoResize ? 'overflow-hidden' : ''}
              ${className || ''}
            `}
                        ref={setRefs}
                        value={value}
                        onChange={handleChange}
                        maxLength={maxLength}
                        {...props}
                    />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex-1">
                        {error && (
                            <p className="text-xs font-medium text-red-600 animate-fade-in-up">
                                {error}
                            </p>
                        )}
                        {!error && helperText && (
                            <p className="text-xs text-gray-500">
                                {helperText}
                            </p>
                        )}
                    </div>
                    {showCharCount && maxLength && (
                        <p className={`text-xs ml-2 flex-shrink-0 transition-colors ${charCount > maxLength * 0.9 ? 'text-amber-600 font-medium' : 'text-gray-400'
                            }`}>
                            {charCount}/{maxLength}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
