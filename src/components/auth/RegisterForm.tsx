import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReCaptcha } from '../../context/ReCaptchaContext';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';

interface RegisterFormProps {
    onLogin: () => void;
    onSuccess: () => void;
    onVerificationNeeded: (email: string) => void;
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

    const { register } = useAuth();
    const { executeRecaptcha } = useReCaptcha();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setIsLoading(true);
        try {
            await executeRecaptcha();
            await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.phone);
            onVerificationNeeded(formData.email);
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Logo and Header */}
            <div className="text-center mb-6">
                <RushCoffeeLogo className="mx-auto h-16 w-16 text-coffee-600 mb-4" />
                <h2 className="font-display text-4xl font-bold text-gray-900">
                    Join Rush Coffee
                </h2>
                <p className="mt-2 text-gray-600 flex items-center justify-center gap-1">
                    Start skipping the line today <span>☕</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full pl-12 pr-4 py-3.5 bg-coffee-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 focus:bg-white transition-all placeholder:text-gray-400"
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
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full pl-12 pr-4 py-3.5 bg-coffee-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 focus:bg-white transition-all placeholder:text-gray-400"
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
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-coffee-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-coffee-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="09xxxxxxxxx"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-12 pr-12 py-3.5 bg-coffee-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 focus:bg-white transition-all placeholder:text-gray-400"
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
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-coffee-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 focus:bg-white transition-all placeholder:text-gray-400"
                            placeholder="Confirm your password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
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
                        className="text-coffee-600 font-semibold hover:text-coffee-700 transition-colors"
                    >
                        Login
                    </button>
                </p>
            </form>
        </div>
    );
};

export default RegisterForm;
