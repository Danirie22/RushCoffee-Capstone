import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Coffee, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import QueuePositionCard from '../../components/queue/QueuePositionCard';
import OrderSummary from '../../components/queue/OrderSummary';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';

const QueuePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { activeOrder } = useOrder();
    const location = useLocation();
    const navigate = useNavigate();

    if (!currentUser) {
         // Guest view or logged out user
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div>
                        <Coffee className="mx-auto h-24 w-24 text-gray-300" />
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
                        <Coffee className="mx-auto h-24 w-24 text-gray-300" />
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
                <div className="flex w-full max-w-lg flex-col items-center gap-8">
                    {location.state?.fromCheckout && (
                         <div className="w-full rounded-lg bg-green-100 p-4 text-center text-green-800 animate-fade-in-up">
                            <h2 className="font-bold">Order Placed Successfully!</h2>
                            <p className="text-sm">You are now in the queue. We'll start preparing your order shortly.</p>
                        </div>
                    )}
                    <QueuePositionCard
                        position={activeOrder.position}
                        status={activeOrder.status}
                        estimatedTime={activeOrder.estimatedTime}
                    />
                    <OrderSummary
                        orderNumber={activeOrder.orderNumber}
                        orderItems={activeOrder.orderItems}
                        totalAmount={activeOrder.totalAmount}
                        paymentMethod={activeOrder.paymentMethod}
                        paymentStatus={activeOrder.paymentStatus}
                        timestamp={activeOrder.timestamp}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default QueuePage;