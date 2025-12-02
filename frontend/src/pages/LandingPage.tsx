import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, ArrowRight, Play, Star, Shield, Zap, Users,
    BarChart3, Globe, Lock, ChevronRight, Menu, X,
    LayoutDashboard, Calendar, DollarSign, Briefcase, FileText,
    Settings, LogOut, Search, Bell, Filter, Plus, Download, Building2, Smartphone, Mail, UserCheck, Quote, TrendingUp, Award, Clock
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'hr' | 'manager' | 'employee'>('hr');
    const [activePlan, setActivePlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1] as const
            }
        }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    const testimonials = [
        {
            name: "Amadou Diallo",
            role: "DRH, TechCorp Mali",
            content: "Shinobi a transformé notre gestion RH. Nous avons économisé 15h par semaine sur la paie.",
            rating: 5,
            avatar: "AD"
        },
        {
            name: "Fatoumata Keita",
            role: "CEO, InnovateSN",
            content: "Interface intuitive, support réactif. Le meilleur investissement pour notre croissance.",
            rating: 5,
            avatar: "FK"
        },
        {
            name: "Moussa Traoré",
            role: "Manager RH, BankPlus",
            content: "La conformité CNSS automatisée nous a sauvé lors des audits. Impressionnant !",
            rating: 5,
            avatar: "MT"
        }
    ];

    return (
        <div className="min-h-screen !bg-black text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">

            {/* ULTRA PREMIUM BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-black">
                {/* Animated gradient orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#6d28d9]/20 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#5b21b6]/30 rounded-full blur-[150px] mix-blend-screen"></div>
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-[#7c3aed]/15 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                {/* Animated grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

                {/* Floating particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-violet-500/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/2 w-2.5 h-2.5 bg-purple-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-violet-600/50 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#020005]/80 backdrop-blur-xl transition-all duration-300 shadow-lg shadow-purple-900/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 relative z-10 group">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Logo size="md" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        {['Fonctionnalités', 'Paie', 'Solutions', 'Tarifs'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                                className="hover:text-white transition-colors relative group py-2"
                            >
                                {item}
                                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5">
                            Connexion
                        </Link>
                        <Link to="/register">
                            <button className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-full hover:from-purple-500 hover:to-violet-500 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                                Essai Gratuit
                            </button>
                        </Link>
                    </div>

                    <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-24 pb-16 px-6 overflow-hidden z-10">
                <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">

                    {/* Left: Compelling Marketing Copy */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="text-left relative order-2 lg:order-1"
                    >


                        <motion.h1 variants={fadeInUp} className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                            Transformez votre <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#8b5cf6] drop-shadow-[0_0_35px_rgba(139,92,246,0.5)] animate-gradient">
                                Gestion RH
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-8 leading-relaxed">
                            Shinobi est la <span className="text-purple-400 font-semibold">plateforme RH tout-en-un</span> conçue pour les entreprises africaines modernes.
                            Gérez la paie, les congés, les performances et bien plus encore depuis une <span className="text-purple-300 font-semibold">interface élégante et intuitive</span>.
                        </motion.p>

                        {/* Key Benefits */}
                        <motion.div variants={fadeInUp} className="space-y-4 mb-10">
                            {[
                                { icon: Zap, text: 'Automatisation complète de la paie', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                                { icon: Shield, text: 'Conformité CNSS garantie', color: 'text-green-400', bg: 'bg-green-500/10' },
                                { icon: TrendingUp, text: 'Analytics en temps réel', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { icon: Smartphone, text: 'Accessible partout, tout le temps', color: 'text-purple-400', bg: 'bg-purple-500/10' }
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className={`p-2 rounded-lg ${benefit.bg} ${benefit.color} group-hover:scale-110 transition-transform`}>
                                        <benefit.icon size={18} />
                                    </div>
                                    <span className="text-gray-300">{benefit.text}</span>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-10">
                            <Link to="/register">
                                <button className="group px-10 py-5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:via-violet-500 hover:to-purple-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:shadow-[0_0_80px_rgba(139,92,246,0.9)] hover:scale-110 flex items-center gap-3 border border-purple-400/30 relative overflow-hidden">
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                                    <span className="relative z-10">Démarrer gratuitement</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform relative z-10" />
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex items-center gap-6 text-sm border-t border-purple-500/10 pt-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-900 to-violet-900 border-2 border-black flex items-center justify-center shadow-lg">
                                        <UserCheck size={14} className="text-purple-300" />
                                    </div>
                                ))}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 border-2 border-black flex items-center justify-center text-xs font-bold shadow-lg">
                                    +10k
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-300 font-medium">Plus de 10,000 utilisateurs</p>
                                <p className="text-gray-500 text-xs">Rejoignez les leaders RH</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Ultra Premium Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
                        className="relative order-1 lg:order-2 perspective-1000"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 via-violet-600/30 to-purple-600/20 blur-[120px] rounded-full transform scale-110 -z-10 animate-pulse-slow"></div>

                        {/* 3D Container */}
                        <motion.div
                            initial={{ rotateY: -15, rotateX: 5 }}
                            animate={{ rotateY: -5, rotateX: 2 }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                            className="relative transform-style-3d"
                        >
                            {/* Main Dashboard Card */}
                            <div className="relative bg-[#09090b]/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                                {/* Header */}
                                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                        </div>
                                        <div className="h-4 w-px bg-white/10"></div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                                            <Search size={12} />
                                            <span>Rechercher un employé...</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Bell size={16} className="text-gray-400" />
                                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#09090b]"></span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 border border-white/10 shadow-lg"></div>
                                    </div>
                                </div>

                                <div className="flex h-[400px]">
                                    {/* Sidebar */}
                                    <div className="w-20 border-r border-white/5 bg-black/20 flex flex-col items-center py-6 gap-6">
                                        {[LayoutDashboard, Users, Calendar, DollarSign, Settings].map((Icon, i) => (
                                            <div key={i} className={`p-3 rounded-xl transition-all cursor-pointer group relative ${i === 0 ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                                <Icon size={20} />
                                                {i === 0 && <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-xl -z-10"></div>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 bg-gradient-to-b from-transparent to-purple-900/5">
                                        <div className="flex justify-between items-end mb-8">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-1">Tableau de bord</h2>
                                                <p className="text-gray-500 text-xs">Vue d'ensemble RH • Mars 2025</p>
                                            </div>
                                            <button className="px-4 py-2 bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-colors">
                                                + Nouvel employé
                                            </button>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 mb-8">
                                            {[
                                                { label: 'Total Employés', val: '1,248', change: '+12%', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                                                { label: 'Masse Salariale', val: '45.2M', change: '+2.4%', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
                                                { label: 'Congés Actifs', val: '12', change: '-5%', icon: Calendar, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                                            <stat.icon size={16} />
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {stat.change}
                                                        </span>
                                                    </div>
                                                    <div className="text-xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{stat.val}</div>
                                                    <div className="text-[10px] text-gray-500">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Animated Chart */}
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-white text-sm">Performance RH</h3>
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between gap-2 h-32">
                                                {[40, 65, 50, 80, 60, 90, 75, 95, 85, 70, 60, 100].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                                        className="w-full bg-gradient-to-t from-purple-600/50 to-purple-400 rounded-t-sm relative group"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                                                            {h}% Perf.
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-12 top-20 bg-[#09090b] border border-green-500/30 p-4 rounded-xl shadow-2xl shadow-green-900/20 backdrop-blur-md w-48 z-20"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Paie Validée</div>
                                        <div className="text-[10px] text-gray-400">Mars 2025</div>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, delay: 1 }}
                                        className="h-full bg-green-500"
                                    ></motion.div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [10, -10, 10] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -left-8 bottom-20 bg-[#09090b] border border-purple-500/30 p-4 rounded-xl shadow-2xl shadow-purple-900/20 backdrop-blur-md w-52 z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white/10"></div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Nouvelle recrue</div>
                                        <div className="text-[10px] text-gray-400">Fatoumata D. a rejoint l'équipe</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* TRUST BADGES SECTION */}
            <section className="py-12 border-y border-purple-500/10 bg-black/50 backdrop-blur-sm relative z-20">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-gray-500 text-sm mb-8 font-medium tracking-widest">ILS NOUS FONT CONFIANCE</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {['TechCorp', 'GlobalIndustries', 'InnovateMali', 'SahelAgri', 'BamakoLogistics'].map((name, i) => (
                            <div key={i} className="flex items-center gap-3 text-xl font-bold text-white group cursor-default">
                                <Building2 size={24} className="text-purple-500 group-hover:text-purple-400 transition-colors" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="fonctionnalites" className="py-32 px-6 bg-black relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Tout ce dont vous avez besoin.</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Une suite complète d'outils pour gérer vos ressources humaines sans friction. Conçu pour la performance.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="col-span-1 md:col-span-2 bg-[#09090b] border border-purple-500/20 rounded-3xl p-10 hover:border-purple-500/40 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Gestion des Talents 360°</h3>
                                <p className="text-gray-400 mb-8 text-lg max-w-md">Centralisez toutes les données de vos employés. Contrats, documents, historique, compétences — tout est accessible en un clic.</p>

                                <div className="h-40 bg-[#020005]/50 rounded-xl border border-purple-500/10 p-4 flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-900 to-violet-900 border-2 border-purple-500/30"></div>
                                    <div className="space-y-3 flex-1">
                                        <div className="h-3 w-1/3 bg-purple-700/30 rounded-full"></div>
                                        <div className="h-2 w-1/2 bg-purple-800/20 rounded-full"></div>
                                        <div className="flex gap-2 mt-2">
                                            <div className="h-6 w-16 bg-purple-500/20 rounded-full border border-purple-500/30"></div>
                                            <div className="h-6 w-16 bg-violet-500/20 rounded-full border border-violet-500/30"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#09090b] border border-purple-500/20 rounded-3xl p-10 hover:border-purple-500/40 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full group-hover:bg-violet-600/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-400 mb-8 border border-violet-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-violet-900/20">
                                    <Calendar size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">Congés & Absences</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">Validation en un clic. Calendrier d'équipe synchronisé. Soldes mis à jour en temps réel.</p>
                                <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    </div>
                                    <div className="h-8 px-3 rounded-full bg-purple-500/10 flex items-center border border-purple-500/20 text-xs text-purple-300">
                                        Solde: 25 jours
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#09090b] border border-purple-500/20 rounded-3xl p-10 hover:border-purple-500/40 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20">
                                    <Shield size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">Sécurité Bancaire</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">Vos données sont cryptées de bout en bout. Sauvegardes automatiques et conformité RGPD garantie.</p>
                                <div className="flex items-center gap-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg w-fit">
                                    <Lock size={14} className="text-purple-400" />
                                    <span className="text-xs font-mono text-purple-300">AES-256 ENCRYPTED</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="col-span-1 md:col-span-2 bg-[#09090b] border border-purple-500/20 rounded-3xl p-10 hover:border-purple-500/40 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full group-hover:bg-violet-600/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-400 mb-8 border border-violet-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-violet-900/20">
                                    <Zap size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Automatisation de la Paie</h3>
                                <p className="text-gray-400 mb-6 text-lg">Générez des fiches de paie conformes en quelques secondes. Calculs automatiques des cotisations, primes et retenues.</p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">Bulletins PDF</div>
                                    <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">Déclarations Fiscales</div>
                                    <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">Virements</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PAYROLL SECTION */}
            <section id="paie" className="py-32 px-6 bg-black relative overflow-hidden border-y border-purple-500/10 z-10">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-600/5 blur-[120px]"></div>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-6">
                            CONFORMITÉ 100%
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Paie & Conformité CNSS <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Automatisées.</span></h2>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">Ne perdez plus de temps avec Excel. Notre moteur de paie est mis à jour en temps réel avec les dernières réglementations maliennes et régionales.</p>

                        <ul className="space-y-6">
                            {[
                                'Calcul automatique des cotisations (INPS, AMO)',
                                'Génération des bulletins en PDF instantanée',
                                'Déclarations fiscales prêtes à l\'envoi',
                                'Historique complet des paiements et exports'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-gray-300 text-lg">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Payroll Card Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-[#09090b] border border-purple-500/20 rounded-2xl p-8 shadow-2xl relative transform hover:rotate-0 transition-transform duration-500"
                    >
                        <div className="absolute -top-6 -right-6 bg-green-500 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-green-500/20 animate-bounce">CONFORME 2025</div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-purple-500/10 pb-6">
                                <div>
                                    <div className="text-sm text-gray-400">Bulletin de Paie</div>
                                    <div className="text-xs text-gray-600">Période: Mars 2025</div>
                                </div>
                                <div className="text-sm font-mono text-white bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20">#PAY-2025-001</div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-base">
                                    <span className="text-gray-500">Salaire de base</span>
                                    <span className="text-white font-medium">450,000 FCFA</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-gray-500">Primes & Indemnités</span>
                                    <span className="text-green-400 font-medium">+ 50,000 FCFA</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-gray-500">Cotisations Sociales</span>
                                    <span className="text-red-400 font-medium">- 35,000 FCFA</span>
                                </div>
                                <div className="h-px bg-purple-500/20 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold text-lg">Net à payer</span>
                                    <span className="text-purple-400 font-bold text-2xl">465,000 FCFA</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                                <Download size={18} /> Télécharger PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* IMPACT SECTION */}
            <section className="py-32 px-6 bg-black relative overflow-hidden z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">L'Impact Shinobi</h2>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto">Des résultats mesurables dès le premier mois d'utilisation.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { value: "50%", label: "de temps gagné sur la gestion de paie", desc: "Automatisez les tâches répétitives et concentrez-vous sur l'humain.", color: "from-purple-400 to-pink-400" },
                            { value: "0", label: "erreur de conformité", desc: "Mises à jour automatiques selon le code du travail et la fiscalité.", color: "from-blue-400 to-cyan-400" },
                            { value: "100%", label: "digitalisation RH", desc: "Dites adieu au papier. Tout est centralisé, sécurisé et accessible.", color: "from-emerald-400 to-green-400" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-[#09090b] border border-white/5 rounded-3xl p-10 text-center relative group hover:border-white/10 transition-colors"
                            >
                                <div className={`text-7xl md:text-8xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-6`}>
                                    {stat.value}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{stat.label}</h3>
                                <p className="text-gray-500 leading-relaxed">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOLUTIONS TABS */}
            <section id="solutions" className="py-32 px-6 bg-black z-10 relative">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16">Une solution pour chaque rôle.</h2>

                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {[
                            { id: 'hr', label: 'Pour les RH', icon: Briefcase },
                            { id: 'manager', label: 'Pour les Managers', icon: Building2 },
                            { id: 'employee', label: 'Pour les Employés', icon: UserCheck }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold transition-all border ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-500 shadow-lg shadow-purple-900/40 scale-105'
                                    : 'bg-[#09090b] text-gray-400 border-purple-500/20 hover:border-purple-500/40 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#09090b] border border-purple-500/20 rounded-3xl p-12 text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500"></div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid md:grid-cols-2 gap-16 items-center"
                            >
                                <div>
                                    <h3 className="text-3xl font-bold mb-6 text-white leading-tight">
                                        {activeTab === 'hr' && "Gagnez 10h par semaine sur l'admin."}
                                        {activeTab === 'manager' && "Pilotez vos équipes avec précision."}
                                        {activeTab === 'employee' && "Vos infos, accessibles partout."}
                                    </h3>
                                    <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                                        {activeTab === 'hr' && "Automatisez les tâches répétitives, gérez les contrats et assurez la conformité sans effort. Concentrez-vous sur l'humain, pas la paperasse."}
                                        {activeTab === 'manager' && "Validez les congés, suivez les performances et organisez les plannings en quelques clics. Une vue claire sur la productivité de votre équipe."}
                                        {activeTab === 'employee' && "Accédez à vos bulletins de paie, demandez des congés et mettez à jour vos infos depuis votre mobile. Simple, transparent et rapide."}
                                    </p>
                                    <ul className="space-y-4 mb-8">
                                        {(activeTab === 'hr' ? ['Paie en 1 clic', 'Gestion documentaire centralisée', 'Rapports RH détaillés'] :
                                            activeTab === 'manager' ? ['Validation congés instantanée', 'Suivi objectifs & KPIs', 'Planning équipe visuel'] :
                                                ['Bulletins PDF téléchargeables', 'Demandes congés simplifiées', 'Annuaire entreprise']).map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                        {item}
                                                    </li>
                                                ))}
                                    </ul>
                                </div>
                                <div className="bg-[#020005] rounded-2xl p-8 border border-purple-500/10 aspect-video flex items-center justify-center relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 rounded-2xl"></div>
                                    <div className="text-center relative z-10">
                                        <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400 border border-purple-500/20 shadow-xl shadow-purple-900/20 group-hover:scale-110 transition-transform duration-500">
                                            {activeTab === 'hr' ? <Briefcase size={40} /> : activeTab === 'manager' ? <Building2 size={40} /> : <UserCheck size={40} />}
                                        </div>
                                        <div className="text-base font-bold text-white mb-1">Interface {activeTab.toUpperCase()}</div>
                                        <div className="text-sm text-gray-500">Optimisée pour la productivité</div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION - ENHANCED */}
            <section id="tarifs" className="py-32 px-6 bg-black relative overflow-hidden z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Tarification simple.</h2>
                        <p className="text-gray-400 text-base">Commencez gratuitement, évoluez selon vos besoins.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
                        {/* Starter */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#0d0d10] border border-purple-500/20 rounded-2xl p-8 flex flex-col hover:border-purple-500/40 transition-all"
                        >
                            <div className="text-base font-bold text-white mb-3">Starter</div>
                            <div className="mb-1">
                                <span className="text-4xl font-bold text-white">Gratuit</span>
                                <span className="text-sm text-gray-500 ml-1">/mois</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Pour les petites équipes.</p>

                            <ul className="space-y-3 mb-6 flex-1">
                                {[
                                    'Jusqu\'à 10 employés',
                                    'Tableau de bord basique',
                                    'Gestion des congés simple',
                                    'Support email',
                                    'Stockage 1GB',
                                    'Exports CSV'
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-2 items-center text-sm text-gray-400">
                                        <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/register" className="w-full mt-auto">
                                <button className="w-full py-3 bg-[#1a1a1f] hover:bg-[#222227] border border-purple-500/20 rounded-xl text-white transition-all font-medium text-sm">
                                    Choisir Starter
                                </button>
                            </Link>
                        </motion.div>

                        {/* Pro */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#0d0d10] border border-purple-500/50 rounded-2xl p-8 relative flex flex-col transform scale-105 shadow-2xl shadow-purple-900/20"
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">POPULAIRE</div>
                            <div className="text-base font-bold text-white mb-3">Pro</div>
                            <div className="mb-1">
                                <span className="text-4xl font-bold text-white">30 000 </span>
                                <span className="text-base text-gray-500">FCFA</span>
                                <span className="text-sm text-gray-500">/mois</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Pour les entreprises en croissance.</p>

                            <ul className="space-y-3 mb-6 flex-1">
                                {[
                                    'Jusqu\'à 50 employés',
                                    'Paie automatisée complète',
                                    'Analytics et rapports avancés',
                                    'Gestion des performances',
                                    'Support prioritaire 24/7',
                                    'API access',
                                    'Stockage 10GB',
                                    'Intégrations tierces',
                                    'Exports PDF/Excel'
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-2 items-center text-sm text-gray-300">
                                        <CheckCircle2 size={16} className="text-purple-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/register" className="w-full mt-auto">
                                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-purple-900/30">
                                    Choisir Pro
                                </button>
                            </Link>
                        </motion.div>

                        {/* Enterprise */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#0d0d10] border border-purple-500/20 rounded-2xl p-8 flex flex-col hover:border-purple-500/40 transition-all"
                        >
                            <div className="text-base font-bold text-white mb-3">Enterprise</div>
                            <div className="mb-1">
                                <span className="text-4xl font-bold text-white">Sur devis</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Pour les grandes structures.</p>

                            <ul className="space-y-3 mb-6 flex-1">
                                {[
                                    'Employés illimités',
                                    'Personnalisation complète',
                                    'SLA garanti 99.9%',
                                    'Account Manager dédié',
                                    'SSO & Audit logs',
                                    'Conformité avancée',
                                    'Formation sur site',
                                    'Stockage illimité',
                                    'White-label option'
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-2 items-center text-sm text-gray-400">
                                        <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a href="mailto:shinobi_it@gmail.com" className="w-full mt-auto">
                                <button className="w-full py-3 bg-[#1a1a1f] hover:bg-[#222227] border border-purple-500/20 rounded-xl text-white transition-all font-medium text-sm">
                                    Nous contacter
                                </button>
                            </a>
                        </motion.div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-[#09090b] border border-purple-500/20 rounded-2xl p-8 overflow-x-auto">
                        <h3 className="text-2xl font-bold text-white mb-8 text-center">Comparaison détaillée</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-purple-500/20">
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Fonctionnalité</th>
                                    <th className="text-center py-4 px-4 text-white font-bold">Starter</th>
                                    <th className="text-center py-4 px-4 text-white font-bold">Pro</th>
                                    <th className="text-center py-4 px-4 text-white font-bold">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                {[
                                    { feature: 'Nombre d\'employés', starter: '10', pro: '50', enterprise: 'Illimité' },
                                    { feature: 'Paie automatisée', starter: '❌', pro: '✅', enterprise: '✅' },
                                    { feature: 'Analytics avancés', starter: '❌', pro: '✅', enterprise: '✅' },
                                    { feature: 'API Access', starter: '❌', pro: '✅', enterprise: '✅' },
                                    { feature: 'Support', starter: 'Email', pro: '24/7', enterprise: 'Dédié' },
                                    { feature: 'Stockage', starter: '1GB', pro: '10GB', enterprise: 'Illimité' },
                                    { feature: 'SSO', starter: '❌', pro: '❌', enterprise: '✅' },
                                    { feature: 'White-label', starter: '❌', pro: '❌', enterprise: '✅' }
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-purple-500/10">
                                        <td className="py-4 px-4 text-gray-400">{row.feature}</td>
                                        <td className="py-4 px-4 text-center">{row.starter}</td>
                                        <td className="py-4 px-4 text-center text-purple-400 font-medium">{row.pro}</td>
                                        <td className="py-4 px-4 text-center">{row.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>


            {/* FAQ SECTION */}
            <section className="py-32 px-6 bg-black relative z-10 border-t border-purple-500/10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Questions Fréquentes</h2>
                        <p className="text-gray-400 text-lg">Tout ce que vous devez savoir pour démarrer.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Est-ce que Shinobi est conforme à la législation malienne ?",
                                a: "Absolument. Shinobi est mis à jour en temps réel avec les dernières dispositions du Code du Travail malien, de l'INPS et de l'AMO. Vos bulletins de paie et déclarations sont garantis 100% conformes."
                            },
                            {
                                q: "Mes données sont-elles sécurisées ?",
                                a: "La sécurité est notre priorité absolue. Nous utilisons un chiffrement AES-256 de niveau bancaire pour toutes vos données. Nos serveurs sont surveillés 24/7 et nous effectuons des sauvegardes automatiques quotidiennes."
                            },
                            {
                                q: "Puis-je migrer mes données depuis Excel ?",
                                a: "Oui, nous proposons un outil d'importation simple pour vos données employés et historiques de paie. Notre équipe support peut également vous accompagner gratuitement dans cette migration."
                            },
                            {
                                q: "Y a-t-il un engagement de durée ?",
                                a: "Non, nos offres Starter et Pro sont sans engagement. Vous pouvez annuler ou changer de plan à tout moment. Pour l'offre Enterprise, nous proposons des contrats annuels avec des tarifs préférentiels."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#09090b] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">?</div>
                                    {item.q}
                                </h3>
                                <p className="text-gray-400 leading-relaxed pl-9">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-black border-t border-purple-500/10 pt-24 pb-12 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-1">
                            <Logo size="md" showText />
                            <p className="text-gray-500 text-sm mt-6 leading-relaxed max-w-xs">
                                La référence RH pour les entreprises africaines modernes. Simplifiez, automatisez, grandissez avec Shinobi.
                            </p>
                            <div className="flex gap-4 mt-8">
                                <a href="#" className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all border border-purple-500/20"><Globe size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all border border-purple-500/20"><Smartphone size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all border border-purple-500/20"><Mail size={18} /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-base tracking-wide">Produit</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><button onClick={() => scrollToSection('fonctionnalites')} className="hover:text-purple-400 transition-colors">Fonctionnalités</button></li>
                                <li><button onClick={() => scrollToSection('paie')} className="hover:text-purple-400 transition-colors">Paie & CNSS</button></li>
                                <li><button onClick={() => scrollToSection('tarifs')} className="hover:text-purple-400 transition-colors">Tarifs</button></li>
                                <li><Link to="/login" className="hover:text-purple-400 transition-colors">Connexion</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-base tracking-wide">Légal</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><Link to="/terms" className="hover:text-purple-400 transition-colors">Conditions d'utilisation</Link></li>
                                <li><Link to="/privacy" className="hover:text-purple-400 transition-colors">Politique de confidentialité</Link></li>
                                <li><Link to="/legal" className="hover:text-purple-400 transition-colors">Mentions légales</Link></li>
                                <li><Link to="/security" className="hover:text-purple-400 transition-colors">Sécurité</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-base tracking-wide">Contact</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0"><Smartphone size={14} /></div>
                                    <a href="https://wa.me/22366826207" className="hover:text-white transition-colors">+223 66 82 62 07</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0"><Mail size={14} /></div>
                                    <a href="mailto:shinobi_it@gmail.com" className="hover:text-white transition-colors">shinobi_it@gmail.com</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0"><Globe size={14} /></div>
                                    <span>Bamako, Mali</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-500/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm">© 2025 Shinobi RH. Tous droits réservés.</p>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <span>Fait avec</span>
                            <span className="text-red-500 animate-pulse">❤️</span>
                            <span>à Bamako</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.4; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
