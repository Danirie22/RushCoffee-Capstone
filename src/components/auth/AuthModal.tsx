import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerificationCodeForm from './VerificationCodeForm';

export type AuthModalMode = 'login' | 'register' | 'forgot-password' | 'verification';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthModalMode | 'verify'; // Allow 'verify' for backward compatibility if needed
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = React.useState<AuthModalMode>(initialMode === 'verify' ? 'forgot-password' : initialMode);
    const [verificationEmail, setVerificationEmail] = React.useState('');
    const [sourceMode, setSourceMode] = React.useState<AuthModalMode>('register');
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isOpen) {
            setMode(initialMode === 'verify' ? 'forgot-password' : initialMode);
        }
    }, [isOpen, initialMode]);

    const getTitle = () => {
        switch (mode) {
            case 'login': return 'Welcome Back';
            case 'register': return 'Create Account';
            case 'forgot-password': return 'Reset Password';
            case 'verification': return 'Verify Email';
            default: return '';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'login': return 'Welcome back! ☕';
            case 'register': return 'Join us today! 🎉';
            case 'forgot-password': return 'Reset your password 🔒';
            case 'verification': return 'Check your inbox 📧';
            default: return '';
        }
    };

    const handleVerificationSuccess = () => {
        onClose();
        navigate('/menu');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            size="md"
        >
            <div className="flex flex-col items-center mb-6">
                <RushCoffeeLogo className="h-12 w-auto mb-4" />
                <p className="text-center text-gray-600">
                    {getSubtitle()}
                </p>
            </div>

            {mode === 'login' && (
                <LoginForm
                    onForgotPassword={() => setMode('forgot-password')}
                    onRegister={() => setMode('register')}
                    onSuccess={onClose}
                    onVerificationNeeded={(email) => {
                        setVerificationEmail(email);
                        setSourceMode('login');
                        setMode('verification');
                    }}
                />
            )}

            {mode === 'register' && (
                <RegisterForm
                    onLogin={() => setMode('login')}
                    onSuccess={onClose}
                    onVerificationNeeded={(email) => {
                        setVerificationEmail(email);
                        setSourceMode('register');
                        setMode('verification');
                    }}
                />
            )}

            {mode === 'forgot-password' && (
                <ForgotPasswordForm
                    onBack={() => setMode('login')}
                />
            )}

            {mode === 'verification' && (
                <VerificationCodeForm
                    email={verificationEmail}
                    onVerify={handleVerificationSuccess}
                    onBack={() => setMode(sourceMode)}
                    onResend={async () => {
                        // Mock resend
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }}
                />
            )}
        </Modal>
    );
};

export default AuthModal;
