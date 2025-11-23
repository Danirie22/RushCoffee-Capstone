import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReCaptcha } from '../../context/ReCaptchaContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
    onVerificationNeeded?: (email: string, userId: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', onVerificationNeeded }) => {
    const [view, setView] = React.useState<'login' | 'register' | 'forgot-password'>(initialView);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = React.useState('');
    const [loginPassword, setLoginPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);

    // Register State
    const [registerData, setRegisterData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // Forgot Password State
    const [resetEmail, setResetEmail] = React.useState('');

    const { login, register, sendPasswordReset } = useAuth();
    const { executeRecaptcha } = useReCaptcha();
    const navigate = useNavigate();

    // Reset state when modal opens or view changes
    React.useEffect(() => {
        if (isOpen) {
            setError(null);
            setSuccessMessage(null);
            setIsLoading(false);
            setView(initialView);
        }
    }, [isOpen, initialView]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await executeRecaptcha('login');
            const result = await login(loginEmail, loginPassword, rememberMe);

            if (result.needsVerification) {
                onClose();
                if (onVerificationNeeded) {
                    onVerificationNeeded(result.email || loginEmail, result.userId!);
                }
            } else {
                onClose();
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await executeRecaptcha('register');
            await register(
                registerData.email,
                registerData.password,
                registerData.firstName,
                registerData.lastName,
                registerData.phone
            );
            // On success, switch to login view with a success message
            setView('login');
            setLoginEmail(registerData.email);
            setSuccessMessage('Account created successfully! Please log in.');
            setError(null);
        } catch (err: any) {
            console.error('Register error:', err);
            setError(err.message || 'Failed to create account.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await executeRecaptcha('forgot_password');
            await sendPasswordReset(resetEmail);
            setSuccessMessage(`Password reset link sent to ${resetEmail}`);
            setResetEmail('');
        } catch (err: any) {
            console.error('Forgot Password error:', err);
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleView = () => {
        setView(view === 'login' ? 'register' : 'login');
        setError(null);
        setSuccessMessage(null);
    };

    const getTitle = () => {
        switch (view) {
            case 'login': return 'Welcome Back';
            case 'register': return 'Create Account';
            case 'forgot-password': return 'Reset Password';
        }
    };

    const getSubtitle = () => {
        switch (view) {
            case 'login': return 'Enter your details to sign in';
            case 'register': return 'Join us for the best coffee experience';
            case 'forgot-password': return 'Enter your email to receive instructions';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader={true}
            className="max-w-md"
        >
            <div className="text-center mb-6">
                <RushCoffeeLogo className="mx-auto h-12 w-12 text-primary-600 mb-4" />
                <h2 className="text-2xl font-display font-bold text-coffee-900">
                    {getTitle()}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                    {getSubtitle()}
                </p>
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-shake">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 animate-fade-in">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{successMessage}</div>
                </div>
            )}

            {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        id="login-email"
                        type="email"
                        label="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        startIcon={<Mail className="h-5 w-5" />}
                        placeholder="name@example.com"
                    />
                    <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        startIcon={<Lock className="h-5 w-5" />}
                        endIcon={
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        }
                        placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-gray-600">Remember me</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setView('forgot-password');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-full bg-primary-600 py-3 text-white font-bold shadow-lg hover:bg-primary-700 hover:shadow-primary-600/30 transition-all disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Sign In'}
                    </button>
                </form>
            )}

            {view === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="firstName"
                            label="First Name"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                            required
                            startIcon={<User className="h-5 w-5" />}
                            placeholder="John"
                        />
                        <Input
                            id="lastName"
                            label="Last Name"
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                            required
                            startIcon={<User className="h-5 w-5" />}
                            placeholder="Doe"
                        />
                    </div>
                    <Input
                        id="reg-email"
                        type="email"
                        label="Email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        startIcon={<Mail className="h-5 w-5" />}
                        placeholder="name@example.com"
                    />
                    <Input
                        id="reg-phone"
                        type="tel"
                        label="Phone"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        required
                        startIcon={<Phone className="h-5 w-5" />}
                        placeholder="+63 900 000 0000"
                    />
                    <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        startIcon={<Lock className="h-5 w-5" />}
                        placeholder="Create a password"
                    />
                    <Input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        startIcon={<Lock className="h-5 w-5" />}
                        placeholder="Confirm password"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-full bg-primary-600 py-3 text-white font-bold shadow-lg hover:bg-primary-700 hover:shadow-primary-600/30 transition-all disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Create Account'}
                    </button>
                </form>
            )}

            {view === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <Input
                        id="reset-email"
                        type="email"
                        label="Email Address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        startIcon={<Mail className="h-5 w-5" />}
                        placeholder="name@example.com"
                        helperText="We'll send you a link to reset your password."
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-full bg-primary-600 py-3 text-white font-bold shadow-lg hover:bg-primary-700 hover:shadow-primary-600/30 transition-all disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Send Reset Link'}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setView('login');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </button>
                    </div>
                </form>
            )}

            {view !== 'forgot-password' && (
                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm">
                        {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleView}
                            className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            {view === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            )}
        </Modal>
    );
};

export default AuthModal;
