import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Sun, Settings, Zap, X, User, Building2, FileText, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import useAuthStore from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

const Navbar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isQuickOpen, setIsQuickOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Mock Notifications (will be replaced by backend data later)
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Bienvenue !', message: 'Configuration de votre espace terminée.', time: '2 min', read: false },
        { id: 2, title: 'Mise à jour', message: 'Nouvelles fonctionnalités disponibles.', time: '1h', read: false },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Fetch Users for Search
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users-search'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/auth/users/');
            const data = response.data.results || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: isSearchOpen, // Only fetch when search is open
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Fetch Companies for Search (Owner only)
    const { data: companiesData, isLoading: companiesLoading } = useQuery({
        queryKey: ['companies-search'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/company/');
            const data = response.data.results || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: isSearchOpen && user?.role === 'owner',
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsNotifOpen(false);
                setIsQuickOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    const handleLogout = () => {
        if (confirm('Déconnexion ?')) {
            logout();
            navigate('/login');
        }
    };

    const navigationItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Zap, role: 'all' },
        { name: 'Utilisateurs', path: '/users', icon: User, role: 'all' },
        { name: 'Entreprises', path: '/saas/companies', icon: Building2, role: 'owner' },
        { name: 'Configuration', path: '/saas/config', icon: Settings, role: 'owner' },
        { name: 'Facturation', path: '/saas/billing', icon: FileText, role: 'owner' },
    ];

    // Filter Logic
    const filteredNavItems = navigationItems.filter(item =>
        (item.role === 'all' || item.role === user?.role) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = (usersData || []).filter((u: any) =>
    (u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5); // Limit to 5 results

    const filteredCompanies = (companiesData || []).filter((c: any) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const hasResults = filteredNavItems.length > 0 || filteredUsers.length > 0 || filteredCompanies.length > 0;
    const isLoading = usersLoading || companiesLoading;

    return (
        <>
            <nav className="relative h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 flex items-center justify-between shadow-sm z-20">
                {/* Effet de fond animé */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50/20 via-transparent to-accent-50/20 dark:from-primary-950/20 dark:via-transparent dark:to-accent-950/20 pointer-events-none"></div>

                {/* Search Trigger */}
                <div className="relative flex-1 max-w-md z-10">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors z-10" />
                        <div className="relative w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                            <span>Rechercher...</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
                                Ctrl+K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 z-10">
                    {/* Quick Action */}
                    <div className="relative">
                        <button
                            onClick={() => setIsQuickOpen(!isQuickOpen)}
                            className="relative p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 transition-all hover:scale-105 shadow-lg shadow-primary-500/30"
                        >
                            <Zap className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {isQuickOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="p-2 space-y-1">
                                        <button onClick={() => { setIsQuickOpen(false); navigate('/users'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                            <User size={16} className="text-primary-500" /> Nouvel Utilisateur
                                        </button>
                                        {user?.role === 'owner' && (
                                            <button onClick={() => { setIsQuickOpen(false); navigate('/saas/companies'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                                <Building2 size={16} className="text-accent-500" /> Nouvelle Entreprise
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                                Tout marquer comme lu
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">Aucune notification</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-sm font-medium ${!notif.read ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                            {notif.title}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="relative p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-blue-900 dark:to-indigo-900 hover:from-amber-200 hover:to-orange-200 dark:hover:from-blue-800 dark:hover:to-indigo-800 transition-all shadow-sm"
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-blue-600" />
                        )}
                    </button>

                    {/* Settings */}
                    <button
                        onClick={() => user?.role === 'owner' ? navigate('/saas/config') : alert('Paramètres profil bientôt disponibles')}
                        className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* User Badge & Logout */}
                    <div className="ml-2 flex items-center gap-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs font-medium bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent capitalize">
                                {user?.role}
                            </p>
                        </div>
                        <div
                            onClick={handleLogout}
                            className="relative group cursor-pointer"
                            title="Déconnexion"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                                {user?.first_name?.charAt(0)}
                                <div className="absolute inset-0 flex items-center justify-center bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <LogOut size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Command Palette Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Rechercher une page, un utilisateur, une entreprise..."
                                    className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isLoading && <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />}
                                <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-2 max-h-[60vh] overflow-y-auto">
                                {!hasResults && !isLoading && searchQuery && (
                                    <div className="p-8 text-center text-gray-500">
                                        Aucun résultat pour "{searchQuery}"
                                    </div>
                                )}

                                {filteredNavItems.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</div>
                                        {filteredNavItems.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => { navigate(item.path); setIsSearchOpen(false); }}
                                                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 rounded-lg transition-colors">
                                                        <item.icon className="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                                                    </div>
                                                    <span className="text-gray-700 dark:text-gray-200 font-medium">{item.name}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {filteredUsers.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateurs</div>
                                        {filteredUsers.map((u: any) => (
                                            <button
                                                key={u.id}
                                                onClick={() => { navigate('/users'); setIsSearchOpen(false); }}
                                                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {u.first_name?.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{u.role}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {filteredCompanies.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entreprises</div>
                                        {filteredCompanies.map((c: any) => (
                                            <button
                                                key={c.id}
                                                onClick={() => { navigate('/saas/companies'); setIsSearchOpen(false); }}
                                                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                        <Building2 className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                                                        <p className="text-xs text-gray-500">{c.plan} • {c.user_count || 0} utilisateurs</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex gap-4">
                                    <span><kbd className="font-sans bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">↵</kbd> Sélectionner</span>
                                    <span><kbd className="font-sans bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">↑↓</kbd> Naviguer</span>
                                    <span><kbd className="font-sans bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">Esc</kbd> Fermer</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
