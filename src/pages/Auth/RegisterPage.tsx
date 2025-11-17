
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Phone, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';

type FormFields = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
};

type ValidationErrors = Partial<Record<keyof Omit<FormFields, 'terms'>, string>> & { terms?: string };

// A simple SVG for the Google icon
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++; // Special characters
    return (strength / 5) * 100;
};

const InputField = ({ name, label, type, placeholder, Icon, children, autoComplete, value, onChange, onBlur, error, touched }: { 
    name: keyof Omit<FormFields, 'terms'>,
    label: string, 
    type: string, 
    placeholder: string, 
    Icon: React.ElementType, 
    children?: React.ReactNode, 
    autoComplete: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void,
    error?: string,
    touched?: boolean
}) => {
    const hasError = touched && error;
    const isValid = touched && !error && value;
    return (
        <div className="relative">
            <label htmlFor={name} className="sr-only">{label}</label>
            <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
                id={name}
                name={name}
                type={type}
                autoComplete={autoComplete}
                required={!['phone'].includes(name)}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full rounded-lg border py-3 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${hasError ? 'border-red-500 ring-red-500' : isValid ? 'border-green-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                placeholder={placeholder}
                aria-invalid={!!hasError}
                aria-describedby={`${name}-error`}
            />
            {children}
            {hasError ? <X className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" /> : null}
            {isValid ? <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" /> : null}
            {hasError && <p id={`${name}-error`} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
        </div>
    );
};

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = React.useState<FormFields>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        terms: false,
    });
    const [errors, setErrors] = React.useState<ValidationErrors>({});
    const [touched, setTouched] = React.useState<Partial<Record<keyof FormFields, boolean>>>({});
    const [apiError, setApiError] = React.useState<React.ReactNode | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [passwordStrength, setPasswordStrength] = React.useState(0);
    const navigate = useNavigate();
    const { register, signInWithGoogle } = useAuth();

    const validate = React.useCallback(() => {
        const newErrors: ValidationErrors = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        else if (formData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';

        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        else if (formData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';

        if (formData.phone && !/^(09|\+639)\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid Philippine phone number';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) newErrors.password = 'Must contain uppercase, lowercase, and a number';
        
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        if (!formData.terms) newErrors.terms = 'You must accept the terms and conditions';

        return newErrors;
    }, [formData]);

    React.useEffect(() => {
        if (touched.password) {
            setPasswordStrength(calculatePasswordStrength(formData.password));
        }
    }, [formData.password, touched.password]);
    
    React.useEffect(() => {
        if (Object.keys(touched).length > 0) {
            setErrors(validate());
        }
    }, [formData, touched, validate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true,
            terms: true,
        });

        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);
        try {
            await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.phone);
            navigate('/');
        } catch (error: any) {
             let errorMessage = 'An unexpected error occurred. Please try again.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak.';
                    break;
            }
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setApiError(null);
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            navigate('/');
        } catch (error: any) {
            console.error("Google Sign-Up Error: ", error.code, error.message);
            setApiError('Failed to sign up with Google. Please try again.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'bg-red-500';
        if (passwordStrength < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    
    const getStrengthText = () => {
        if (passwordStrength < 40) return 'Weak';
        if (passwordStrength < 80) return 'Medium';
        return 'Strong';
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-coffee-50 to-white">
            <Header />
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl">
                    <Card className="rounded-2xl p-8 shadow-xl">
                        <div className="mb-6 text-center">
                            <RushCoffeeLogo className="mx-auto h-12 w-12 text-primary-600" />
                            <h2 className="mt-4 font-display text-3xl font-bold text-coffee-900">Join Rush Coffee</h2>
                            <p className="mt-2 text-gray-600">Start skipping the line today ☕</p>
                        </div>

                        {apiError && (
                            <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>{apiError}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <InputField name="firstName" label="First Name" type="text" placeholder="First Name" Icon={User} autoComplete="given-name" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} error={errors.firstName} touched={touched.firstName} />
                                <InputField name="lastName" label="Last Name" type="text" placeholder="Last Name" Icon={User} autoComplete="family-name" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} error={errors.lastName} touched={touched.lastName} />
                            </div>
                            
                            <InputField name="email" label="Email address" type="email" placeholder="Email address" Icon={Mail} autoComplete="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} />
                            <InputField name="phone" label="Phone Number (Optional)" type="tel" placeholder="Phone Number (e.g., 09xxxxxxxxx)" Icon={Phone} autoComplete="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} touched={touched.phone} />
                            
                            <div className="relative">
                               <InputField name="password" label="Password" type={showPassword ? 'text' : 'password'} placeholder="Password" Icon={Lock} autoComplete="new-password" value={formData.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} touched={touched.password}>
                                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                               </InputField>
                                {touched.password && (
                                  <div className="mt-2 space-y-1">
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                      <div className={`h-2 rounded-full ${getStrengthColor()}`} style={{ width: `${passwordStrength}%`, transition: 'width 0.3s, background-color 0.3s' }}></div>
                                    </div>
                                    <p className="text-xs font-medium" style={{color: getStrengthColor().replace('bg-','text-')}}>{getStrengthText()}</p>
                                  </div>
                                )}
                            </div>
                            
                            <InputField name="confirmPassword" label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" Icon={Lock} autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword} touched={touched.confirmPassword}>
                                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </InputField>

                            <div className="flex items-start">
                                <div className="flex h-6 items-center">
                                    <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange} onBlur={handleBlur} className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${touched.terms && errors.terms ? 'border-red-500' : ''}`} />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="terms" className="font-medium text-gray-900">
                                        I agree to the{' '}
                                        <Link to="/terms" className="font-semibold text-primary-600 hover:underline">Terms of Service</Link>
                                        {' and '}
                                        <Link to="/privacy" className="font-semibold text-primary-600 hover:underline">Privacy Policy</Link>.
                                    </label>
                                     {touched.terms && errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms}</p>}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || isGoogleLoading}
                                    className="flex w-full justify-center rounded-full bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400"
                                >
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Account'}
                                </button>
                            </div>
                        </form>
                        
                        <div className="my-6 flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-4 flex-shrink text-sm text-gray-500">or</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <button
                            type="button"
                            disabled={isLoading || isGoogleLoading}
                            onClick={handleGoogleSignIn}
                            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                            Sign up with Google
                        </button>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Login
                            </Link>
                        </p>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RegisterPage;
