import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../auth/AuthStore';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import axiosClient from '../api/axiosClient';

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });


    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            // ÉTAPE 1 : Connexion d'abord pour savoir qui se connecte
            const user = await login(data.email, data.password);

            // ÉTAPE 2 : Vérification du rôle et de la maintenance
            if (user.role === 'owner') {
                // Le propriétaire passe toujours
                navigate('/saas');
            } else {
                // Pour les autres, on vérifie le mode maintenance
                try {
                    const configResponse = await axiosClient.get('/api/auth/platform/config/');
                    if (configResponse.data.maintenance_mode) {
                        // Mode maintenance activé - On déconnecte et on redirige
                        logout(); // Déconnexion immédiate
                        toast.error('Application en maintenance. Veuillez revenir plus tard.');
                        navigate('/maintenance');
                        return;
                    }
                } catch (configError) {
                    console.error('Erreur vérification maintenance:', configError);
                }

                // Si pas de maintenance, on accède au dashboard
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            let message = 'Erreur de connexion';
            if (error.response?.data?.detail) {
                message = error.response.data.detail;
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000212] text-white font-sans selection:bg-purple-500/30 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-800/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-800/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse-slow delay-1000"></div>
            </div>

            {/* Grid Pattern */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Compact Card */}
                <div className="relative group">
                    {/* Glowing Border Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

                    <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <Logo size="md" />
                            </div>
                            <h1 className="text-xl font-bold text-white mb-1">Bon retour</h1>
                            <p className="text-xs text-gray-400">Entrez vos identifiants pour accéder</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1">
                                <div className="relative group/input">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.email ? 'border-red-500/50' : ''}`}
                                        placeholder="votre@email.com"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <div className="relative group/input">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                    <input
                                        type="password"
                                        {...register('password')}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.password ? 'border-red-500/50' : ''}`}
                                        placeholder="Mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer group/check">
                                    <div className="relative">
                                        <input type="checkbox" className="peer sr-only" />
                                        <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all"></div>
                                        <Sparkles className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-gray-400 group-hover/check:text-gray-300 transition-colors">Se souvenir</span>
                                </label>
                                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Oublié ?</a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Se connecter <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <p className="text-xs text-gray-500">
                                Pas de compte ?{' '}
                                <Link to="/register" className="text-white hover:text-purple-400 font-medium transition-colors">
                                    Créer un compte
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
