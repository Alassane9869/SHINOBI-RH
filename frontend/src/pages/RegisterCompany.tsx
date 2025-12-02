import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Sparkles, Rocket, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const registerSchema = z.object({
    company_name: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    first_name: z.string().min(2, 'Prénom requis'),
    last_name: z.string().min(2, 'Nom requis'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterCompany: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        const selectedPlan = searchParams.get('plan') || 'free'; // Default to 'free' plan

        try {
            await axiosClient.post('/api/auth/register-company/', {
                ...data,
                selected_plan: selectedPlan
            });
            toast.success('Compte créé avec succès !');
            navigate('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            let message = 'Une erreur est survenue lors de l\'inscription.';

            if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (typeof error.response?.data === 'object') {
                const messages = Object.values(error.response.data).flat();
                if (messages.length > 0) message = messages[0] as string;
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
                className="w-full max-w-md relative z-10"
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
                            <h1 className="text-xl font-bold text-white mb-1">Créer un compte</h1>
                            <p className="text-xs text-gray-400">Rejoignez l'élite RH dès aujourd'hui</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Company Name */}
                            <div className="space-y-1">
                                <div className="relative group/input">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                    <input
                                        {...register('company_name')}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.company_name ? 'border-red-500/50' : ''}`}
                                        placeholder="Nom de l'entreprise"
                                    />
                                </div>
                                {errors.company_name && <p className="text-xs text-red-400 ml-1">{errors.company_name.message}</p>}
                            </div>

                            {/* Name Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="relative group/input">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                        <input
                                            {...register('first_name')}
                                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.first_name ? 'border-red-500/50' : ''}`}
                                            placeholder="Prénom"
                                        />
                                    </div>
                                    {errors.first_name && <p className="text-xs text-red-400 ml-1">{errors.first_name.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <input
                                        {...register('last_name')}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.last_name ? 'border-red-500/50' : ''}`}
                                        placeholder="Nom"
                                    />
                                    {errors.last_name && <p className="text-xs text-red-400 ml-1">{errors.last_name.message}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <div className="relative group/input">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.email ? 'border-red-500/50' : ''}`}
                                        placeholder="Email professionnel"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <div className="relative group/input">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all ${errors.password ? 'border-red-500/50' : ''}`}
                                        placeholder="Mot de passe (8+ chars)"
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Commencer l'essai <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <p className="text-xs text-gray-500">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-white hover:text-purple-400 font-medium transition-colors">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterCompany;
