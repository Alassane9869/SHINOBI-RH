import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

interface RefreshTokenResponse {
    access: string;
}

const axiosClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Ajouter le token JWT
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Gérer le refresh token
axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Gestion des erreurs réseau (serveur éteint, pas d'internet)
        if (!error.response) {
            toast.error('Erreur de connexion au serveur. Vérifiez que le backend est lancé.');
            return Promise.reject(error);
        }

        // Gestion des erreurs serveur (500)
        if (error.response.status >= 500) {
            toast.error('Erreur serveur interne. Veuillez réessayer plus tard.');
        }

        // Si erreur 401 et pas déjà tenté de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Tenter de rafraîchir le token
                const response = await axios.post<RefreshTokenResponse>('/api/auth/refresh/', {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                // Réessayer la requête originale avec le nouveau token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                }
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Si le refresh échoue, déconnecter l'utilisateur
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
