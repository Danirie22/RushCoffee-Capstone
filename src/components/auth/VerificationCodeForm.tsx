import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, RefreshCw, Mail, ShieldCheck } from 'lucide-react';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';

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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center">
                {/* Logo and Header */}
                <RushCoffeeLogo className="mx-auto h-16 w-16 text-primary-600 mb-4" />
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                    Verify Your Email
                </h2>

                <p className="text-gray-600 mb-2">
                    We've sent a verification code to
                </p>
                <p className="text-lg font-bold text-primary-700">{email}</p>
            </div>

            <div className="flex justify-center gap-3">
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
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-primary-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-300"
                        placeholder="•"
                    />
                ))}
            </div>

            {error && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || code.join('').length !== 6}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
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

            <div className="flex items-center justify-between text-sm pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                </button>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={timeLeft > 0}
                    className={`flex items-center gap-2 font-medium transition-colors ${timeLeft > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-primary-600 hover:text-primary-700'
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
