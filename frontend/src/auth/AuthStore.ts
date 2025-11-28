import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { User, RegisterCompanyFormData } from '../types';

interface LoginResponse {
    access: string;
    refresh: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    registerCompany: (companyData: RegisterCompanyFormData) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            // Login
            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await axiosClient.post<LoginResponse>('/api/auth/login/', {
                        email,
                        password,
                    });

                    const { access, refresh } = response.data;

                    // Stocker les tokens
                    localStorage.setItem('access_token', access);
                    localStorage.setItem('refresh_token', refresh);

                    // Récupérer les infos utilisateur
                    const userResponse = await axiosClient.get<User>('/api/auth/me/');
                    const user = userResponse.data;

                    set({ user, isAuthenticated: true, isLoading: false });
                    toast.success('Connexion réussie !');
                    return user;
                } catch (error: any) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.detail || 'Erreur de connexion');
                    throw error;
                }
            },

            // Register Company
            registerCompany: async (companyData: RegisterCompanyFormData) => {
                set({ isLoading: true });
                try {
                    await axiosClient.post('/api/company/register/', companyData);
                    set({ isLoading: false });
                    toast.success('Entreprise créée avec succès ! Vous pouvez vous connecter.');
                } catch (error: any) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.detail || 'Erreur lors de l\'inscription');
                    throw error;
                }
            },

            // Logout
            logout: () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                set({ user: null, isAuthenticated: false });
                toast.success('Déconnexion réussie');
                window.location.href = '/login'; // ✅ Force redirect
            },

            // Load user from token
            loadUser: async () => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                try {
                    const response = await axiosClient.get<User>('/api/auth/me/');
                    set({ user: response.data, isAuthenticated: true });
                } catch (error) {
                    set({ isAuthenticated: false, user: null });
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export default useAuthStore;
