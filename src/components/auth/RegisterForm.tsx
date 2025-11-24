import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReCaptcha } from '../../context/ReCaptchaContext';

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
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                            placeholder="John"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                            placeholder="Doe"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                        placeholder="+63 900 000 0000"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onLogin}
                    className="text-coffee-600 font-semibold hover:text-coffee-700"
                >
                    Log in
                </button>
            </p>
        </form>
    );
};

export default RegisterForm;
