import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface Notification {
    message: string;
    type: NotificationType;
    isVisible: boolean;
}

interface NotificationContextType {
    notification: Notification;
    showNotification: (message: string, type?: NotificationType) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<Notification>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        setNotification({ message, type, isVisible: true });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setNotification(prev => ({ ...prev, isVisible: false }));
        }, 5000);
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    }, []);

    const value = {
        notification,
        showNotification,
        hideNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
