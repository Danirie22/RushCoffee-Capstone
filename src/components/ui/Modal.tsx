import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Card from '../../../components/ui/Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in-up items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      style={{ animationDuration: '0.3s' }}
    >
      <div
        className={`relative w-full transform transition-all ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="rounded-xl p-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 id="modal-title" className="text-lg font-semibold text-coffee-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
          {footer && (
            <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 p-4">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Modal;