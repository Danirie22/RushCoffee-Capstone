
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const { sendPasswordReset } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email) {
            setError('Email is required');
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }


        setIsLoading(true);
        try {
            await sendPasswordReset(email);
            setSuccessMessage('Password reset link sent to your email. Please check your inbox.');
        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                errorMessage = 'No user found with this email address.';
            }
            setError(errorMessage);
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
                                Reset Password
                            </h2>
                            <p className="mt-2 text-gray-600">Enter your email to receive a reset link.</p>
                        </div>

                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700" role="alert">
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{successMessage}</span>
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
                                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Email address"
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-full bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400"
                                >
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                        
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Back to Login
                            </Link>
                        </p>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;
