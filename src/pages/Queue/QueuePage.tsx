
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Bell, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ModernQueueCard from '../../components/queue/ModernQueueCard';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';
import { rushCoffeeLogoBase64 } from '../../assets/rush-coffee-logo-base64';

const QueuePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { activeOrder } = useOrder();
    const location = useLocation();
    const navigate = useNavigate();

    const [notificationPermission, setNotificationPermission] = useState('default');
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);
    const notificationSentForOrder = useRef<string | null>(null);

    // Check notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            if (Notification.permission === 'default') {
                setShowPermissionBanner(true);
            }
        }
    }, []);

    // Effect to trigger notification when order is ready
    useEffect(() => {
        if (
            activeOrder &&
            activeOrder.status === 'ready' &&
            notificationPermission === 'granted' &&
            notificationSentForOrder.current !== activeOrder.id
        ) {
            const title = "Your Order is Ready! ☕";
            const options = {
                body: `Your Rush Coffee order (${activeOrder.orderNumber}) is now ready for pickup.`,
                icon: rushCoffeeLogoBase64,
                tag: activeOrder.id, // Prevents duplicate notifications for the same order
            };
            
            const notification = new Notification(title, options);

            // Focus the window when notification is clicked
            notification.onclick = () => {
                window.focus();
            };

            notificationSentForOrder.current = activeOrder.id;
        }

        // Reset sent flag if there's no active order or it's completed
        if (!activeOrder || activeOrder.status === 'completed') {
            notificationSentForOrder.current = null;
        }
    }, [activeOrder, notificationPermission]);

    const handleRequestPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted' || permission === 'denied') {
            setShowPermissionBanner(false);
        }
    };

    if (!currentUser) {
         // Guest view or logged out user
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div>
                        <RushCoffeeLogo className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-4 font-display text-2xl font-bold text-coffee-900">
                            You're not in the queue
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Please log in and place an order to see your queue status.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/auth/login" className="rounded-full bg-primary-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105">
                                Login
                            </Link>
                             <Link to="/menu" className="rounded-full border-2 border-primary-600 px-8 py-3 font-semibold text-primary-600 transition-transform hover:scale-105 hover:bg-primary-50">
                                View Menu
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    // Logged-in user with no active order
    if (!activeOrder) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div>
                        <RushCoffeeLogo className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-4 font-display text-2xl font-bold text-coffee-900">
                            Your queue is empty
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Ready for your next coffee fix?
                        </p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
                        >
                            Start a New Order
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Main view for user with an active order
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex w-full max-w-md flex-col items-center gap-6">
                    {location.state?.fromCheckout && (
                         <div className="w-full rounded-lg bg-green-100 p-4 text-center text-green-800 animate-fade-in-up">
                            <h2 className="font-bold">Order Placed Successfully!</h2>
                            <p className="text-sm">You are now in the queue. We'll start preparing your order shortly.</p>
                        </div>
                    )}

                    {showPermissionBanner && notificationPermission === 'default' && activeOrder.status !== 'completed' && (
                        <div className="relative w-full animate-fade-in-up rounded-lg border border-primary-200 bg-white p-4 shadow-sm">
                            <button
                                onClick={() => setShowPermissionBanner(false)}
                                className="absolute top-2 right-2 rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600"
                                aria-label="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                                    <Bell className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Get Order Updates</h3>
                                    <p className="text-sm text-gray-600">Know the moment your coffee is ready!</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRequestPermission}
                                className="mt-3 w-full rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                            >
                                Enable Notifications
                            </button>
                        </div>
                    )}
                    
                    <ModernQueueCard order={activeOrder} />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default QueuePage;
