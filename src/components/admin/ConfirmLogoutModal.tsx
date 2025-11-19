
import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ConfirmLogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout">
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Are you sure?</h3>
                <p className="mt-2 text-sm text-gray-500">
                    You will be returned to the login page.
                </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="ghost" onClick={onClose} className="w-full">
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmLogoutModal;
