import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';

// A simple SVG for the Google icon
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const LoginPage: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(false);
    const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email address is invalid';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        }
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        setErrors({});
        setIsLoading(true);

        try {
            await login(email, password, rememberMe);
            navigate('/');
        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed login attempts. Please try again later.';
                    break;
            }
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-coffee-50 to-white">
            <Header />
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <Card className="rounded-2xl p-8 shadow-xl">
                        <div className="mb-6 text-center">
                            <RushCoffeeLogo className="mx-auto h-12 w-12 text-primary-600" />
                            <h2 className="mt-4 font-display text-3xl font-bold text-coffee-900">
                                Rush Coffee
                            </h2>
                            <p className="mt-2 text-gray-600">Welcome back! ☕</p>
                        </div>

                        {apiError && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{apiError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            <div className="relative">
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full rounded-lg border py-3 pl-10 pr-3 text-gray-400 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                                    placeholder="Email address"
                                    aria-invalid={!!errors.email}
                                    aria-describedby="email-error"
                                />
                                {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <label htmlFor="password" className="sr-only">Password</label>
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full rounded-lg border py-3 pl-10 pr-10 text-gray-400 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                                    placeholder="Password"
                                    aria-invalid={!!errors.password}
                                    aria-describedby="password-error"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {errors.password && <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <Link to="#" className="font-medium text-primary-600 hover:text-primary-500">Forgot your password?</Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-full bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400"
                                >
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Login'}
                                </button>
                            </div>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-4 flex-shrink text-sm text-gray-500">or</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <div className="relative">
                             <button
                                type="button"
                                disabled
                                className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <GoogleIcon />
                                Continue with Google
                            </button>
                            <Badge className="absolute -top-2 right-2 bg-gray-500 text-white text-xs px-2 py-0.5">Coming Soon</Badge>
                        </div>


                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
                                Sign up
                            </Link>
                        </p>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;