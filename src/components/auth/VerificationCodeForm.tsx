import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

interface VerificationCodeFormProps {
    email: string;
    onVerify: (code: string) => Promise<void>;
    onBack: () => void;
    onResend: () => Promise<void>;
}

const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({ email, onVerify, onBack, onResend }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return; // Prevent multiple chars
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        const newCode = [...code];
        pastedData.forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);
        if (pastedData.length === 6) {
            inputs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onVerify(fullCode);
        } catch (err: any) {
            setError(err.message || 'Verification failed');
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        await onResend();
        setTimeLeft(30);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                    We've sent a verification code to
                </p>
                <p className="font-medium text-gray-900">{email}</p>
            </div>

            <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
            )}

            <button
                type="submit"
                disabled={isLoading || code.join('').length !== 6}
                className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                    </span>
                ) : (
                    'Verify Account'
                )}
            </button>

            <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={timeLeft > 0}
                    className={`flex items-center gap-1 ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-coffee-600 hover:text-coffee-700'
                        }`}
                >
                    <RefreshCw className={`h-4 w-4 ${timeLeft > 0 ? 'animate-spin' : ''}`} />
                    {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
                </button>
            </div>
        </form>
    );
};

export default VerificationCodeForm;
