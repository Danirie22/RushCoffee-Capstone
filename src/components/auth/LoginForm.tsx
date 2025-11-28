import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import RushCoffeeLogo from '../layout/RushCoffeeLogo';

interface LoginFormProps {
    onForgotPassword: () => void;
    onRegister: () => void;
    onSuccess: (role?: string) => void;
    onVerificationNeeded: (email: string, userId: string, role?: string) => void;
}

// Google Icon SVG
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Facebook Icon SVG
const FacebookIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onRegister, onSuccess, onVerificationNeeded }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login, signInWithGoogle, signInWithFacebook } = useAuth();




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError(null);
        console.log('🔵 LoginForm submitting:', { email, password, rememberMe });
        try {
            const result = await login(email, password, rememberMe);

            // Whitelist for test accounts to bypass verification
            const whitelistedEmails = ['sa@gmail.com', 'admin@rushcoffee.com', 'test@gmail.com', 'danirie@gmail.com', 'de@gmail.com', 'admin@rushcoffee.ph'];

            if (result.needsVerification && result.userId && !whitelistedEmails.includes(email)) {
                onVerificationNeeded(email, result.userId, result.role);
            } else {
                onSuccess(result.role);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            const userProfile = await signInWithGoogle();
            onSuccess(userProfile.role);
        } catch (err: any) {
            console.error('Google Sign-In Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Pop-up blocked. Please allow pop-ups for this site.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Google Sign-In is not enabled in Firebase Console.');
            } else {
                setError(err.message || 'Failed to sign in with Google');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleFacebookSignIn = async () => {
        setIsFacebookLoading(true);
        setError(null);
        try {
            const userProfile = await signInWithFacebook();
            onSuccess(userProfile.role);
        } catch (err: any) {
            console.error('Facebook Sign-In Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Pop-up blocked. Please allow pop-ups for this site.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Facebook Sign-In is not enabled in Firebase Console.');
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.');
            } else {
                setError(err.message || 'Failed to sign in with Facebook');
            }
        } finally {
            setIsFacebookLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Logo and Header */}
            <div className="text-center mb-8">
                <RushCoffeeLogo className="mx-auto h-16 w-16 text-primary-600 mb-4" />
                <h2 className="font-display text-4xl font-bold text-gray-900">
                    Rush Coffee
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-primary-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-3.5 bg-primary-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Remember me</span>
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                        Forgot your password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Logging in...
                        </span>
                    ) : (
                        'Login'
                    )}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isFacebookLoading}
                        className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                        <span className="font-semibold text-gray-700">Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleFacebookSignIn}
                        disabled={isGoogleLoading || isFacebookLoading}
                        className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFacebookLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FacebookIcon />}
                        <span className="font-semibold text-gray-700">Facebook</span>
                    </button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onRegister}
                        className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                        Sign up
                    </button>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;
