
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    
    // Check for admin role
    if (currentUser.role !== 'admin') {
        // Redirect non-admin users to the home page
        return <Navigate to="/" replace />;
    }

    // If authenticated and is an admin, render the child routes (which will include the layout).
    return <Outlet />;
};

export default ProtectedRoute;
