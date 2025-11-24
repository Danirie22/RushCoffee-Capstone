import React from 'react';
import { X } from 'lucide-react';
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
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{view === 'login' ? 'Login' : 'Sign Up'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {view === 'login' ? (
                    <LoginForm
                        onForgotPassword={() => { }}
                        onRegister={() => setView('register')}
                        onSuccess={onClose}
                        onVerificationNeeded={(email, userId) => onVerificationNeeded?.(email, userId)}
                    />
                ) : (
                    <RegisterForm
                        onLogin={() => setView('login')}
                        onSuccess={onClose}
                        onVerificationNeeded={(email) => onVerificationNeeded?.(email, 'new-user-id')}
                    />
                )}
            </div>
        </Modal>
    );
};

export default AuthModal;
