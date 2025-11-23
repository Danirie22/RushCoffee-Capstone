import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, Shield, ArrowLeft, X } from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import Modal from '../ui/Modal';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    userId: string;
    onSuccess: () => void;
    onBackToLogin?: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, email, userId, onSuccess, onBackToLogin }) => {
    const [code, setCode] = React.useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isResending, setIsResending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setCode(['', '', '', '', '', '']);
            setError(null);
            setSuccessMessage(null);
            // Focus first input after a short delay to allow animation
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError(null);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];

        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }

        setCode(newCode);

        if (pastedData.length === 6) {
            inputRefs.current[5]?.focus();
        } else if (pastedData.length > 0) {
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            // Verify the code from Firestore
            const verificationDoc = await db.collection('emailVerifications').doc(userId).get();

            if (!verificationDoc.exists) {
                setError('Verification code expired. Please request a new one.');
                setIsVerifying(false);
                return;
            }

            const data = verificationDoc.data()!;
            const storedCode = data.code;
            const expiresAt = data.expiresAt.toDate();

            // Check if code is expired (10 minutes)
            if (new Date() > expiresAt) {
                setError('Verification code expired. Please request a new one.');
                await db.collection('emailVerifications').doc(userId).delete();
                setIsVerifying(false);
                return;
            }

            // Verify the code
            if (verificationCode !== storedCode) {
                setError('Invalid verification code. Please try again.');
                setIsVerifying(false);
                return;
            }

            // Code is valid - mark as verified and delete the verification doc
            await db.collection('emailVerifications').doc(userId).update({
                verified: true
            });

            // Delete the verification doc after a short delay
            setTimeout(async () => {
                await db.collection('emailVerifications').doc(userId).delete();
            }, 1000);

            // Clear 2FA flag
            sessionStorage.removeItem('requires2FA');

            // Trigger success callback
            onSuccess();

        } catch (error: any) {
            console.error('Verification error:', error);
            setError('An error occurred during verification. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Generate new 6-digit code
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Store in Firestore
            await db.collection('emailVerifications').doc(userId).set({
                code: newCode,
                email: email,
                createdAt: new Date(),
                expiresAt: expiresAt
            });

            console.log(`🔐 Verification code for ${email}: ${newCode}`);

            setSuccessMessage('A new verification code has been sent to your email.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            console.error('Resend error:', error);
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader={true}
            className="max-w-md"
        >
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 animate-bounce-slow">
                    <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-coffee-900">
                    Verify Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    We've sent a 6-digit code to
                </p>
                <p className="mt-1 font-semibold text-primary-600">{email}</p>
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-shake" role="alert">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-700" role="alert">
                    <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{successMessage}</div>
                </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
                <div>
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border-2 border-gray-300 text-center text-xl sm:text-2xl font-bold focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all"
                                aria-label={`Digit ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isVerifying || code.join('').length !== 6}
                        className="flex w-full justify-center rounded-full bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400 disabled:shadow-none disabled:translate-y-0"
                    >
                        {isVerifying ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            'Verify Email'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 transition-colors"
                    >
                        {isResending ? 'Sending...' : 'Resend'}
                    </button>
                </p>
            </div>

            <div className="mt-6 text-center pt-4 border-t border-gray-100">
                <button
                    onClick={onBackToLogin || onClose}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </button>
            </div>
        </Modal>
    );
};

export default VerificationModal;
