import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles?: Array<'customer' | 'employee' | 'admin'>;
    redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and user roles.
 * 
 * @param allowedRoles - Array of roles that can access this route. If not specified, any authenticated user can access.
 * @param redirectTo - Where to redirect unauthorized users. Defaults to '/auth/login' for unauthenticated, '/' for wrong role.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    redirectTo
}) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!currentUser) {
        return <Navigate to={redirectTo || "/auth/login"} state={{ from: location }} replace />;
    }

    // If no specific roles are required, just check if user is authenticated
    if (!allowedRoles || allowedRoles.length === 0) {
        return <Outlet />;
    }

    // Check if user has required role
    const hasAccess = currentUser.role && allowedRoles.includes(currentUser.role);

    if (!hasAccess) {
        // Show unauthorized page for wrong role
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="mb-3 font-display text-4xl font-bold text-gray-900">
                        Access Denied
                    </h1>
                    <p className="mb-6 text-lg text-gray-600">
                        You don't have permission to access this page.
                    </p>
                    <p className="mb-8 text-sm text-gray-500">
                        Your role: <span className="font-semibold capitalize">{currentUser.role || 'customer'}</span>
                        <br />
                        Required role: <span className="font-semibold capitalize">{allowedRoles.join(' or ')}</span>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // User has access, render child routes
    return <Outlet />;
};

export default ProtectedRoute;
