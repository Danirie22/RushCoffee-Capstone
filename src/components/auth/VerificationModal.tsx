import React from 'react';
import Modal from '../ui/Modal';
import VerificationCodeForm from './VerificationCodeForm';
import { useAuth } from '../../context/AuthContext';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    userId?: string;
    onSuccess: () => void;
    onBackToLogin?: () => void;
    onResend?: () => Promise<void>;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
    isOpen,
    onClose,
    email,
    userId,
    onSuccess,
    onBackToLogin,
    onResend
}) => {
    const { verifyEmailCode } = useAuth();

    const handleResend = async () => {
        if (onResend) {
            await onResend();
        } else {
            // Default mock resend if not provided
            console.log("Resending code for user", userId);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const handleVerify = async (code: string) => {
        if (!userId) {
            throw new Error("User ID is missing. Cannot verify.");
        }

        const isValid = await verifyEmailCode(userId, code);
        if (isValid) {
            onSuccess();
        } else {
            throw new Error("Invalid verification code. Please check the console or try again.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} hideHeader={true} size="md">
            <VerificationCodeForm
                email={email}
                onVerify={handleVerify}
                onBack={onBackToLogin || onClose}
                onResend={handleResend}
            />
        </Modal>
    );
};

export default VerificationModal;
