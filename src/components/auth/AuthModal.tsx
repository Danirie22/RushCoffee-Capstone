import React from 'react';
import Modal from '../ui/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
    onVerificationNeeded?: (email: string, userId: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', onVerificationNeeded }) => {
    const [view, setView] = React.useState(initialView);

    React.useEffect(() => {
        if (isOpen) setView(initialView);
    }, [isOpen, initialView]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader={true} // We hide the default header to use our custom logo header
            size={view === 'register' ? 'xl' : 'md'} // Dynamic sizing: wider for register form
        >
            {view === 'login' ? (
                <LoginForm
                    key="login"
                    onForgotPassword={() => { }}
                    onRegister={() => setView('register')}
                    onSuccess={onClose}
                    onVerificationNeeded={(email, userId) => onVerificationNeeded?.(email, userId)}
                />
            ) : (
                <RegisterForm
                    key="register"
                    onLogin={() => setView('login')}
                    onSuccess={onClose}
                    onVerificationNeeded={(email) => onVerificationNeeded?.(email, 'new-user-id')}
                />
            )}
        </Modal>
    );
};

export default AuthModal;
