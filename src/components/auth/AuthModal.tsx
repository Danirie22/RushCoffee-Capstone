import React from 'react';
import Modal from '../ui/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
    onVerificationNeeded?: (email: string, userId: string, role?: string) => void;
    onAuthSuccess: (role?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', onVerificationNeeded, onAuthSuccess }) => {
    const [view, setView] = React.useState<'login' | 'register' | 'forgot-password'>(initialView);
    const [prefilledEmail, setPrefilledEmail] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setPrefilledEmail(''); // Reset on open
        }
    }, [isOpen, initialView]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader={true} // We hide the default header to use our custom logo header
            size={view === 'register' ? 'xl' : 'md'} // Dynamic sizing: wider for register form
        >
            {view === 'login' && (
                <LoginForm
                    key="login"
                    onForgotPassword={(email) => {
                        setPrefilledEmail(email);
                        setView('forgot-password');
                    }}
                    onRegister={() => setView('register')}
                    onSuccess={(role) => onAuthSuccess(role)}
                    onVerificationNeeded={(email, userId, role) => onVerificationNeeded?.(email, userId, role)}
                />
            )}

            {view === 'register' && (
                <RegisterForm
                    key="register"
                    onLogin={() => setView('login')}
                    onSuccess={() => onAuthSuccess()}
                    onVerificationNeeded={(email, userId, role) => onVerificationNeeded?.(email, userId, role)}
                />
            )}

            {view === 'forgot-password' && (
                <ForgotPasswordForm
                    key="forgot-password"
                    initialEmail={prefilledEmail}
                    onBack={() => setView('login')}
                />
            )}
        </Modal>
    );
};

export default AuthModal;
