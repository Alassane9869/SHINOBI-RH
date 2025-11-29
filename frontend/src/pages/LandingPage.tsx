import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    DollarSign,
    FileText,
    Shield,
    Zap,
    CheckCircle,
    ArrowRight,
    Star,
    TrendingUp,
    Clock,
    Award,
    Sparkles,
    Rocket,
    Target,
    Mail,
} from 'lucide-react';
import { Button } from '../components/ui';

const LandingPage: React.FC = () => {
    const features = [
        {
            icon: Users,
            title: 'Gestion Intelligente',
            description: 'Centralisez vos talents avec une interface intuitive et puissante.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Calendar,
            title: 'Présences & Congés',
            description: 'Suivi en temps réel et validation des demandes en un clic.',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: DollarSign,
            title: 'Paie Automatisée',
            description: 'Générez des bulletins de paie conformes en quelques secondes.',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: FileText,
            title: 'Documents Sécurisés',
            description: 'Stockage cloud crypté pour tous vos documents RH.',
            color: 'from-amber-500 to-orange-500',
        },
        {
            icon: Shield,
            title: 'Sécurité Maximale',
            description: 'Isolation multi-tenant et conformité RGPD garantie.',
            color: 'from-red-500 to-pink-500',
        },
        {
            icon: Zap,
            title: 'Performance Éclair',
            description: 'Interface ultra-rapide pour une productivité maximale.',
            color: 'from-indigo-500 to-purple-500',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Employés gérés', icon: Users },
        { value: '99.9%', label: 'Disponibilité', icon: TrendingUp },
        { value: '<2s', label: 'Temps de réponse', icon: Clock },
        { value: '4.9/5', label: 'Satisfaction', icon: Award },
    ];

    return (
        <div className="min-h-screen bg-gray-950 relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Animated Gradient Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-1/2 left-1/2 w-[550px] h-[550px] bg-pink-500/20 rounded-full blur-[120px]"
                ></motion.div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 group"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75"
                                ></motion.div>
                                <div className="relative w-10 h-10 bg-gradient-to-br from-primary-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
                                SHINOBI RH
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                        >
                            <Link to="/login" className="hidden sm:block">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="px-6 py-2.5 text-white hover:bg-white/10 rounded-lg font-medium transition-all"
                                >
                                    Se connecter
                                </motion.button>
                            </Link>
                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-primary-600 to-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all flex items-center gap-2 text-sm sm:text-base"
                                >
                                    <Rocket className="w-4 h-4" />
                                    <span className="hidden sm:inline">Essai Gratuit</span>
                                    <span className="sm:hidden">Essayer</span>
                                </motion.button>
                            </Link>
                            <Link to="/login" className="sm:hidden flex items-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="p-2.5 text-white hover:bg-white/10 rounded-lg font-medium transition-all"
                                >
                                    <Users className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm text-primary-400 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/10"
                        >
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                                <Star className="w-4 h-4 fill-current" />
                            </motion.div>
                            La révolution RH est arrivée
                            <Sparkles className="w-4 h-4" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
                        >
                            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                                Gérez vos talents
                            </span>
                            <br />
                            <span className="text-gradient-animate inline-block">
                                comme un Maître
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
                        >
                            Une plateforme tout-en-un qui transforme la complexité administrative en{' '}
                            <span className="font-bold text-shimmer-effect">
                                simplicité opérationnelle
                            </span>
                            .
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
                        >
                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/50 hover:shadow-primary-500/70 transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
                                >
                                    <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                    Commencer maintenant
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:border-white/40 hover:bg-white/20 transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
                                >
                                    <Target className="w-5 h-5" />
                                    Voir la démo
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="text-center group"
                                >
                                    <div className="flex justify-center mb-3">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                            className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                                        >
                                            <stat.icon className="w-6 h-6 text-primary-400" />
                                        </motion.div>
                                    </div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary-400" />
                                <span>RGPD Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-primary-400" />
                                <span>SSL Sécurisé</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-primary-400 fill-current" />
                                <span>Support 24/7</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Fonctionnalités Puissantes
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Tout ce dont vous avez besoin pour propulser votre gestion RH vers le futur.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="group relative"
                            >
                                <motion.div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                                    style={{ background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')}, ${feature.color.split(' ')[1].replace('to-', '')})` }}
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                ></motion.div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                                    >
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl p-12 text-center"
                    >
                        <motion.div
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-primary-600 via-cyan-500 to-pink-600"
                            style={{ backgroundSize: '200% 200%' }}
                        ></motion.div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Prêt à passer au niveau supérieur ?
                            </h2>
                            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                                Rejoignez les entreprises innovantes qui ont choisi SHINOBI RH pour leur gestion.
                            </p>
                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center gap-3 mx-auto"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Créer un compte gratuit
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <div className="flex flex-wrap justify-center gap-8 mt-10 text-white/90 text-sm">
                                {['Pas de carte requise', 'Setup en 2 min', 'Support prioritaire'].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 + i * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {item}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
                                    SHINOBI RH
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                La solution de gestion RH conçue pour l'ère moderne. Transformez votre administration en efficacité.
                            </p>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary-400" />
                                Contact
                            </h3>
                            <div className="space-y-3 text-sm">
                                <a href="mailto:shinobi_it@gmail.com" className="text-gray-400 hover:text-primary-400 transition-colors flex items-start gap-2 group">
                                    <Mail className="w-4 h-4 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <span>shinobi_it@gmail.com</span>
                                </a>
                                <a href="tel:+22366826207" className="text-gray-400 hover:text-primary-400 transition-colors flex items-start gap-2 group">
                                    <svg className="w-4 h-4 mt-0.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+223 66 82 62 07</span>
                                </a>
                                <div className="text-gray-400 flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Bamako, Mali</span>
                                </div>
                            </div>
                        </div>

                        {/* Liens Rapides */}
                        <div>
                            <h3 className="font-bold text-white mb-4">Liens Rapides</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link to="/register" className="text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">
                                        Créer un compte
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">
                                        Se connecter
                                    </Link>
                                </li>
                                <li>
                                    <a href="#features" className="text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">
                                        Fonctionnalités
                                    </a>
                                </li>
                                <li>
                                    <a href="#pricing" className="text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">
                                        Tarifs
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Informations */}
                        <div>
                            <h3 className="font-bold text-white mb-4">Informations</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="text-gray-400 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary-400" />
                                    RGPD Compliant
                                </li>
                                <li className="text-gray-400 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-primary-400" />
                                    SSL Sécurisé
                                </li>
                                <li className="text-gray-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary-400" />
                                    Support 24/7
                                </li>
                                <li className="text-gray-400 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-primary-400" />
                                    99.9% Uptime
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-500 text-center md:text-left">
                                © 2025 SHINOBI RH. Tous droits réservés. Fait avec ❤️ pour les équipes modernes.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                                    Confidentialité
                                </a>
                                <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                                    CGU
                                </a>
                                <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                                    Mentions légales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
