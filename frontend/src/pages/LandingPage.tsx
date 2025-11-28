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
                            <span className="font-bold text-2xl bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
                                SHINOBI RH
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                        >
                            <Link to="/login">
                                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                                    Se connecter
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" icon={Rocket}>
                                    Essai Gratuit
                                </Button>
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
                                <Button variant="primary" size="lg" className="group">
                                    <motion.div whileHover={{ y: -2 }}>
                                        <Rocket className="w-5 h-5" />
                                    </motion.div>
                                    Commencer maintenant
                                    <motion.div whileHover={{ x: 3 }}>
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg" icon={Target} className="border-white/30 text-white hover:bg-white/10">
                                    Voir la démo
                                </Button>
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
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-gray-50 border-white">
                                        <Sparkles className="w-5 h-5" />
                                        Créer un compte gratuit
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </motion.div>
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
            <footer className="relative border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
                            SHINOBI RH
                        </span>
                    </div>
                    <p className="text-gray-400 mb-4">
                        La solution de gestion RH conçue pour l'ère moderne.
                    </p>
                    <p className="text-sm text-gray-600">© 2025 SHINOBI RH. Fait avec ❤️ pour les équipes modernes.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
