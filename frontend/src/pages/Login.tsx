import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../auth/AuthStore';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const user = await login(data.email, data.password);
            // Redirection conditionnelle selon le rôle
            if (user.role === 'owner') {
                navigate('/saas');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            let message = 'Erreur de connexion';

            if (error.response) {
                const data = error.response.data;
                if (typeof data === 'string') {
                    if (error.response.status === 404) {
                        message = 'Service de connexion indisponible (404).';
                    } else if (error.response.status === 500) {
                        message = 'Erreur serveur interne (500).';
                    } else {
                        message = 'Erreur serveur: ' + error.response.status;
                    }
                } else if (data.detail) {
                    message = data.detail;
                }
            } else if (error.request) {
                message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            }

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Animated Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[120px]"
            ></motion.div>
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75"
                            ></motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative w-12 h-12 bg-gradient-to-br from-primary-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                            >
                                <Sparkles className="w-6 h-6 text-white" />
                            </motion.div>
                        </div>
                        <span className="font-bold text-3xl bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
                            SHINOBI RH
                        </span>
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2"
                    >
                        Bon retour !
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-400"
                    >
                        Connectez-vous pour continuer
                    </motion.p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 relative overflow-hidden"
                >
                    {/* Card Glow Effect */}
                    <motion.div
                        animate={{
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-cyan-500/10 to-pink-500/10 pointer-events-none"
                    ></motion.div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="label text-gray-300">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="email"
                                    {...register('email')}
                                    className={`input pl-12 bg-white/5 border-white/10 text-white placeholder-gray-500 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="votre@email.com"
                                />
                            </div>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm mt-1.5"
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="label text-gray-300">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className={`input pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder-gray-500 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </motion.button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm mt-1.5"
                                >
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Submit */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full group"
                                loading={isLoading}
                            >
                                <LogIn className="w-5 h-5" />
                                Se connecter
                                <motion.div whileHover={{ x: 3 }}>
                                    <ArrowRight className="w-5 h-5" />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-sm text-gray-400">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 hover:underline font-semibold transition-colors">
                                S'inscrire gratuitement
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mt-6"
                >
                    <Link to="/" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                        ← Retour à l'accueil
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
