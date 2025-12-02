import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../auth/AuthStore';
import axiosClient from '../api/axiosClient';

/**
 * Composant qui vérifie périodiquement le mode maintenance
 * et déconnecte automatiquement les utilisateurs non-owner
 */
const MaintenanceCheck: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    useEffect(() => {
        // Ne rien faire si pas d'utilisateur ou si owner
        if (!user || user.role === 'owner') {
            return;
        }

        // Vérifier toutes les 10 secondes
        const checkMaintenance = async () => {
            try {
                const response = await axiosClient.get('/api/auth/platform/config/');

                if (response.data.maintenance_mode) {
                    // Mode maintenance activé - déconnecter l'utilisateur
                    logout();
                    navigate('/maintenance');
                }
            } catch (error) {
                console.error('Erreur vérification maintenance:', error);
            }
        };

        // Vérifier immédiatement
        checkMaintenance();

        // Puis vérifier toutes les 10 secondes
        const interval = setInterval(checkMaintenance, 10000);

        return () => clearInterval(interval);
    }, [user, logout, navigate]);

    return null; // Ce composant ne rend rien
};

export default MaintenanceCheck;
