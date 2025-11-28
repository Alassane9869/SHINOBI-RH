import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './AuthStore';

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérifier les rôles si spécifiés
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;
