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

    // Vérifier l'abonnement pour les propriétaires
    if (user?.role === 'owner' || user?.role === 'admin') {
        const subscriptionStatus = user.company?.subscription_status;
        const isBillingPage = ['/pricing', '/checkout', '/subscription'].some(path => location.pathname.startsWith(path));

        // Si pas d'abonnement actif et pas sur une page de facturation
        if ((!subscriptionStatus || !['active', 'trial'].includes(subscriptionStatus)) && !isBillingPage) {
            // Autoriser l'accès aux pages SaaS pour le Super Admin (Owner SaaS)
            if (user.is_saas_owner) {
                return <>{children}</>;
            }
            return <Navigate to="/pricing" replace />;
        }
    }

    return <>{children}</>;
};

export default RequireAuth;
