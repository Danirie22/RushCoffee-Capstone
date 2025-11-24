import * as React from 'react';
import { X } from 'lucide-react';
import Card from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  hideHeader?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  hideHeader = false,
  className = ''
}) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        className={`relative w-full transform transition-all ${sizeClasses[size]} ${className} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="rounded-2xl p-0 shadow-2xl flex flex-col max-h-full overflow-hidden">
          {hideHeader ? (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center justify-between border-b border-gray-200 p-4 flex-shrink-0">
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
          )}

          <div className={`${hideHeader ? 'p-8' : 'p-6'} overflow-y-auto custom-scrollbar`}>{children}</div>

          {footer && (
            <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Modal;