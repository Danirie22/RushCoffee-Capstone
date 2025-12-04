import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReCaptcha } from '../../context/ReCaptchaContext';
import { auth } from '../../firebaseConfig';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import Button from '../ui/Button';

interface RegisterFormProps {
    onLogin: () => void;
    onSuccess: () => void;
    onVerificationNeeded: (email: string, userId: string, role?: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onLogin, onSuccess, onVerificationNeeded }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCheckingVerification, setIsCheckingVerification] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200' });
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
        phone: ''
    });

    const { register } = useAuth();
    const { executeRecaptcha } = useReCaptcha();

    React.useEffect(() => {
        (window as any).debugRegister = register;
    }, [register]);

    // Realtime Email Check
    React.useEffect(() => {
        const checkEmail = async () => {
            if (!formData.email || !formData.email.includes('@')) {
                setEmailStatus('idle');
                return;
            }

            setEmailStatus('checking');
            try {
                const methods = await fetchSignInMethodsForEmail(auth, formData.email);
                if (methods.length > 0) {
                    setEmailStatus('taken');
                    setFieldErrors(prev => ({ ...prev, email: 'This email is already in use.' }));
                } else {
                    setEmailStatus('available');
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                }
            } catch (error) {
                console.error("Error checking email:", error);
                setEmailStatus('idle');
            }
        };

        const timeoutId = setTimeout(checkEmail, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    // Password Strength Check
    const checkPasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };

        if (pass.length >= 6) score++;
        if (pass.length >= 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 4) return { score, label: 'Good', color: 'bg-yellow-500' };
        return { score, label: 'Strong', color: 'bg-green-500' };
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPass = e.target.value;
        setFormData({ ...formData, password: newPass });
        setPasswordStrength(checkPasswordStrength(newPass));
        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
    };

    // Poll for email verification after successful registration
    React.useEffect(() => {
        if (!isSuccess) return;

        let intervalId: NodeJS.Timeout;
        let timeoutId: NodeJS.Timeout;

        const checkVerification = async () => {
            if (!auth.currentUser) return;

            try {
                await auth.currentUser.reload();

                const whitelistedEmails = ['admin@rushcoffee.ph', 'sa@gmail.com'];
                if (auth.currentUser.emailVerified || whitelistedEmails.includes(auth.currentUser.email || '')) {
                    setIsCheckingVerification(true);
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);

                    // Wait a moment to show success state
                    setTimeout(() => {
                        window.location.href = '#/menu';
                    }, 1000);
                }
            } catch (error) {
                console.error('Error checking verification:', error);
            }
        };

        // Start polling every 3 seconds
        intervalId = setInterval(checkVerification, 3000);

        // Stop polling after 10 minutes
        timeoutId = setTimeout(() => {
            clearInterval(intervalId);
        }, 600000);

        // Cleanup on unmount
        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [isSuccess]);

    const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();

        try {
            setError('');
            setIsLoading(true);

            if (formData.password !== formData.confirmPassword) {
                setFieldErrors(prev => ({ ...prev, password: 'Passwords do not match' }));
                setIsLoading(false);
                return;
            }

            if (!formData.email.endsWith('@gmail.com')) {
                setFieldErrors(prev => ({ ...prev, email: 'Please use a valid @gmail.com address' }));
                setIsLoading(false);
                return;
            }

            if (emailStatus === 'taken') {
                setFieldErrors(prev => ({ ...prev, email: 'This email is already registered.' }));
                setIsLoading(false);
                return;
            }

            // PH Phone Number Validation
            if (formData.phone) {
                const phoneRegex = /^\+63 9\d{2} \d{3} \d{4}$/;
                if (!phoneRegex.test(formData.phone)) {
                    setFieldErrors(prev => ({ ...prev, phone: 'Please enter a valid PH phone number (+63 9xx xxx xxxx).' }));
                    setIsLoading(false);
                    return;
                }
            }

            const token = await executeRecaptcha();
            console.log('ReCaptcha token:', token);

            const cleanEmail = formData.email.trim();
            console.log(`Attempting registration with email: '${cleanEmail}'`);

            const user = await register(cleanEmail, formData.password, formData.firstName, formData.lastName, formData.phone);

            // Send Firebase email verification link
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
                await firebaseUser.sendEmailVerification();
                console.log('✅ Verification email sent to:', cleanEmail);
            }

            // Show success message
            setError('');
            setIsLoading(false);
            setIsSuccess(true);

            // Do NOT sign out. Keep user logged in but unverified.
            // await auth.signOut();

        } catch (err: any) {
            console.error('Registration error:', err);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to create account. Please try again.';
            let isFieldError = false;

            if (err.code === 'auth/email-already-in-use') {
                setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Please login or use a different email.' }));
                isFieldError = true;
            } else if (err.code === 'auth/invalid-email') {
                setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
                isFieldError = true;
            } else if (err.code === 'auth/weak-password') {
                setFieldErrors(prev => ({ ...prev, password: 'Password is too weak. Please use at least 6 characters.' }));
                isFieldError = true;
            } else if (err.code === 'auth/missing-password') {
                setFieldErrors(prev => ({ ...prev, password: 'Please enter a password.' }));
                isFieldError = true;
            } else if (err.message) {
                // Clean up raw Firebase error messages
                errorMessage = err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim();
            }

            if (!isFieldError) {
                setError(errorMessage);
            }
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        if (isCheckingVerification) {
            return (
                <div className="w-full max-w-md mx-auto text-center py-8">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-green-100 p-4 animate-pulse">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                    <p className="text-gray-600 mb-6">
                        Taking you to the menu...
                    </p>

                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full max-w-md mx-auto text-center py-8">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-blue-100 p-4 animate-bounce-slow">
                        <Mail className="h-12 w-12 text-blue-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600 mb-6">
                    We've sent a verification link to <span className="font-semibold text-gray-900">{formData.email}</span>
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Waiting for verification...</h4>
                    </div>
                    <p className="text-sm text-blue-800">
                        Click the link in your email and we'll automatically log you in!
                    </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                        Next Steps:
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1.5 ml-1">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the verification link</li>
                        <li>Close the verification tab and return here</li>
                        <li>You'll be automatically logged in!</li>
                    </ol>
                </div>

                <p className="text-sm text-gray-500">
                    Didn't receive the email? <button className="text-primary-600 font-medium hover:underline">Resend</button>
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Logo and Header */}
            <div className="text-center mb-6">
                <RushCoffeeLogo className="mx-auto h-16 w-16 text-primary-600 mb-4" />
                <h2 className="font-display text-4xl font-bold text-gray-900">
                    Join Rush Coffee
                </h2>
                <p className="mt-2 text-gray-600 flex items-center justify-center gap-1">
                    Start skipping the line today <span>☕</span>
                </p>
            </div>

            <div onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} className="space-y-4">
                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                className="w-full pl-12 pr-4 py-3.5 bg-primary-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
                                placeholder="Enter first name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                className="w-full pl-12 pr-4 py-3.5 bg-primary-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ ...formData, email: val });
                                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                                if (val && !val.endsWith('@gmail.com')) {
                                    // setError('Only @gmail.com addresses are allowed'); // Removed immediate error to avoid annoyance while typing
                                } else {
                                    // setError(null);
                                }
                            }}
                            className={`w-full pl-12 pr-4 py-3.5 bg-primary-50 border ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder:text-gray-400`}
                            placeholder="name@gmail.com"
                        />
                        {emailStatus === 'checking' && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>
                    {fieldErrors.email && (
                        <p className="text-xs text-red-600 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="tel"
                            name="phone"
                            autoComplete="off"
                            value={formData.phone}
                            onFocus={() => {
                                if (!formData.phone) {
                                    setFormData(prev => ({ ...prev, phone: '+63 9' }));
                                }
                            }}
                            onBlur={() => {
                                if (formData.phone === '+63 9') {
                                    setFormData(prev => ({ ...prev, phone: '' }));
                                }
                            }}
                            onChange={(e) => {
                                const val = e.target.value;

                                // Allow clearing
                                if (val === '') {
                                    setFormData({ ...formData, phone: '' });
                                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                                    return;
                                }

                                // Strip non-digits
                                let digits = val.replace(/\D/g, '');

                                // Handle leading 0 replacement
                                if (digits.startsWith('0')) {
                                    digits = '63' + digits.substring(1);
                                }

                                // Ensure starts with 63
                                if (!digits.startsWith('63')) {
                                    digits = '63' + digits;
                                }

                                // Ensure starts with 639
                                if (digits.length >= 2 && digits[2] !== '9') {
                                    digits = '639' + digits.substring(2);
                                } else if (digits.length === 2) {
                                    digits = '639';
                                }

                                // Max 12 digits (63 + 10 digits)
                                digits = digits.substring(0, 12);

                                // Format as +63 9xx xxx xxxx
                                let formatted = '+63 9';
                                if (digits.length > 2) {
                                    formatted += ' ' + digits.substring(2, 5);
                                }
                                if (digits.length > 5) {
                                    formatted += ' ' + digits.substring(5, 8);
                                }
                                if (digits.length > 8) {
                                    formatted += ' ' + digits.substring(8, 12);
                                }

                                setFormData({ ...formData, phone: formatted });
                                if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            className={`w-full pl-12 pr-4 py-3.5 bg-primary-50 border ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder:text-gray-400`}
                            placeholder="+63 9xx xxx xxxx"
                        />
                    </div>
                    {fieldErrors.phone && (
                        <p className="text-xs text-red-600 mt-1 ml-1">{fieldErrors.phone}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handlePasswordChange}
                            className={`w-full pl-12 pr-12 py-3.5 bg-primary-50 border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder:text-gray-400`}
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {fieldErrors.password && (
                        <p className="text-xs text-red-600 mt-1 ml-1">{fieldErrors.password}</p>
                    )}
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-primary-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="Confirm your password"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Creating account...
                        </span>
                    ) : (
                        'Create Account'
                    )}
                </button>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onLogin}
                        className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
