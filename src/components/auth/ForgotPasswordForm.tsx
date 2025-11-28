import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordFormProps {
    onBack: () => void;
    initialEmail?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { sendPasswordReset } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        console.log('Attempting to send password reset email to:', email);
        try {
            await sendPasswordReset(email);
            console.log('Password reset email sent successfully');
            setSuccessMessage('Password reset link sent! Please check your email.');
        } catch (err: any) {
            console.error('Password reset error:', err);
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError(err.message || 'Failed to send reset link');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="admin@rushcoffee.ph"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending Link...
                    </span>
                ) : successMessage ? (
                    'Link Sent'
                ) : (
                    'Send Reset Link'
                )}
            </button>

            <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
            </button>
        </form>
    );
};

export default ForgotPasswordForm;
