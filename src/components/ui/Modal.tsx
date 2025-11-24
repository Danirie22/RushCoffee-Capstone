import * as React from 'react';
import { X } from 'lucide-react';
import Card from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  const [showScrollbar, setShowScrollbar] = React.useState(false);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Effect 1: Lock Body Scroll (Only changes when isOpen changes)
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Effect 2: Flash Scrollbar (Runs on open AND when content/size changes)
  React.useEffect(() => {
    if (isOpen) {
      setShowScrollbar(true);
      const timer = setTimeout(() => {
        setShowScrollbar(false);
      }, 1000); // Visible for 1 second
      return () => clearTimeout(timer);
    }
  }, [isOpen, size, children]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={onClose}
    >
      <div
        className={`relative w-full transform transition-all ${sizeClasses[size]} ${className} max-h-[90vh] flex flex-col animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="elevated" className="rounded-3xl p-0 shadow-2xl flex flex-col max-h-full overflow-hidden bg-white">
          {/* Single Close Button - Top Right */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-10 rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Optional Title */}
          {!hideHeader && title && (
            <div className="px-8 pt-8 pb-2 flex-shrink-0">
              <h3 id="modal-title" className="text-2xl font-bold text-gray-900">
                {title}
              </h3>
            </div>
          )}

          {/* Content */}
          <div className={`${hideHeader && !title ? 'p-8 pb-10' : 'px-8 py-6 pb-10'} overflow-y-auto custom-scrollbar ${showScrollbar ? 'scrollbar-flash' : ''} flex-1`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-8 py-5 flex-shrink-0 rounded-b-3xl">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Modal;