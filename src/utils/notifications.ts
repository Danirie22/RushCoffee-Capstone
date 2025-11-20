// Notification utilities for cross-browser support
// Works on both desktop and mobile browsers

export interface NotificationData {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
}

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker for notifications
 * This must be called early in the app lifecycle
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    console.log('[Notifications] 🔍 Checking Service Worker support...');
    console.log('[Notifications] Browser:', navigator.userAgent);

    if (!('serviceWorker' in navigator)) {
        console.warn('[Notifications] ❌ Service Workers are not supported in this browser');
        return null;
    }

    console.log('[Notifications] ✅ Service Worker API available');

    try {
        console.log('[Notifications] 📝 Registering Service Worker at /sw.js...');
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('[Notifications] ✅ Service Worker registered successfully!');
        console.log('[Notifications] Registration:', registration);
        console.log('[Notifications] SW State:', registration.active?.state);
        console.log('[Notifications] SW Scope:', registration.scope);
        serviceWorkerRegistration = registration;

        // Wait for the service worker to be ready
        console.log('[Notifications] ⏳ Waiting for Service Worker to be ready...');
        await navigator.serviceWorker.ready;
        console.log('[Notifications] ✅ Service Worker is ready and active!');

        return registration;
    } catch (error) {
        console.error('[Notifications] ❌ Service Worker registration failed:', error);
        return null;
    }
};

/**
 * Request notification permission from the user
 * Returns the permission status: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    console.log('[Notifications] 🔍 Checking notification support...');

    if (!('Notification' in window)) {
        console.warn('[Notifications] ❌ Notifications are not supported in this browser');
        return 'denied';
    }

    console.log('[Notifications] ✅ Notification API available');
    console.log('[Notifications] Current permission:', Notification.permission);

    try {
        console.log('[Notifications] 📝 Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('[Notifications] Permission result:', permission);
        return permission;
    } catch (error) {
        console.error('[Notifications] ❌ Error requesting notification permission:', error);
        return 'denied';
    }
};

/**
 * Show a notification using the best available method
 * On mobile browsers, this uses Service Worker notifications
 * On desktop browsers, this may use the direct Notification API
 */
export const showNotification = async (data: NotificationData): Promise<boolean> => {
    console.log('[Notifications] 🔔 Attempting to show notification:', data.title);

    if (!('Notification' in window)) {
        console.warn('[Notifications] ❌ Notifications are not supported');
        return false;
    }

    console.log('[Notifications] Current permission:', Notification.permission);

    if (Notification.permission !== 'granted') {
        console.warn('[Notifications] ❌ Notification permission not granted. Current:', Notification.permission);
        return false;
    }

    const options: NotificationOptions & { vibrate?: number[] } = {
        body: data.body,
        icon: data.icon,
        tag: data.tag,
        badge: data.icon,
        vibrate: [200, 100, 200], // Vibration pattern for mobile
        requireInteraction: false,
        data: data.data,
    };

    console.log('[Notifications] Notification options:', options);

    try {
        // Try to use Service Worker notifications (preferred for mobile)
        if (serviceWorkerRegistration && 'showNotification' in serviceWorkerRegistration) {
            console.log('[Notifications] 📱 Using Service Worker notification method');
            console.log('[Notifications] SW Registration:', serviceWorkerRegistration);
            await serviceWorkerRegistration.showNotification(data.title, options);
            console.log('[Notifications] ✅ Service Worker notification shown successfully!');
            return true;
        }

        // Fallback to direct notification API (for desktop browsers)
        if ('Notification' in window && typeof Notification === 'function') {
            console.log('[Notifications] 💻 Using direct Notification API (fallback)');
            const notification = new Notification(data.title, options);

            notification.onclick = () => {
                console.log('[Notifications] 👆 Notification clicked');
                window.focus();
                notification.close();
            };

            console.log('[Notifications] ✅ Direct notification shown successfully!');
            return true;
        }

        console.warn('[Notifications] ❌ No notification method available');
        return false;
    } catch (error) {
        console.error('[Notifications] ❌ Error showing notification:', error);
        return false;
    }
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
    if (!('Notification' in window)) {
        return 'denied';
    }
    const permission = Notification.permission;
    console.log('[Notifications] Current permission status:', permission);
    return permission;
};

/**
 * Check if notifications are supported in this browser
 */
export const isNotificationSupported = (): boolean => {
    const supported = 'Notification' in window;
    console.log('[Notifications] Notifications supported:', supported);
    return supported;
};

/**
 * Check if the app is running in standalone mode (PWA)
 */
export const isStandalone = (): boolean => {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
};
