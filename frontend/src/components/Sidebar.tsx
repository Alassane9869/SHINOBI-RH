import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    DollarSign,
    FileText,
    Settings,
    LucideIcon,
    LogOut,
    Sparkles,
    Shield,
    Building2,
    Activity,
    CreditCard,
} from 'lucide-react';
import useAuthStore from '../auth/AuthStore';
import { useSidebar } from '../context/SidebarContext';
import Logo from './Logo';

interface MenuItem {
    path: string;
    icon: LucideIcon;
    label: string;
    roles: string[];
    color: string;
    submenu?: { path: string; label: string }[];
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { isOpen, toggleSidebar } = useSidebar();

    const menuItems: MenuItem[] = [
        // Menu spécifique Owner
        { path: '/saas', icon: Shield, label: 'SaaS Admin', roles: ['owner'], color: 'from-purple-600 to-indigo-600' },
        { path: '/saas/companies', icon: Building2, label: 'Entreprises', roles: ['owner'], color: 'from-blue-600 to-cyan-600' },
        { path: '/saas/subscriptions-manager', icon: Users, label: 'Gestion Abonnements', roles: ['owner'], color: 'from-indigo-600 to-purple-600' },
        { path: '/saas/analytics', icon: Activity, label: 'Analytics', roles: ['owner'], color: 'from-green-600 to-emerald-600' },

        // Billing Section
        { path: '/saas/billing', icon: CreditCard, label: '💰 Billing Dashboard', roles: ['owner'], color: 'from-emerald-600 to-teal-600' },
        { path: '/saas/billing/subscriptions', icon: Users, label: '📋 Abonnements', roles: ['owner'], color: 'from-blue-600 to-indigo-600' },
        { path: '/saas/billing/transactions', icon: DollarSign, label: '💳 Transactions', roles: ['owner'], color: 'from-orange-600 to-red-600' },
        { path: '/saas/billing/invoices', icon: FileText, label: '📄 Factures', roles: ['owner'], color: 'from-teal-600 to-cyan-600' },
        { path: '/saas/billing/plans', icon: FileText, label: '📦 Gestion Plans', roles: ['owner'], color: 'from-indigo-600 to-blue-600' },
        { path: '/saas/billing/promo-codes', icon: Sparkles, label: '🎟️ Codes Promo', roles: ['owner'], color: 'from-pink-600 to-rose-600' },
        { path: '/saas/billing/config', icon: Settings, label: '⚙️ Config Paiements', roles: ['owner'], color: 'from-purple-600 to-pink-600' },

        { path: '/users', icon: Users, label: 'Tous les Utilisateurs', roles: ['owner'], color: 'from-purple-500 to-pink-500' },
        { path: '/saas/monitoring', icon: Activity, label: 'Monitoring', roles: ['owner'], color: 'from-orange-600 to-red-600' },
        { path: '/saas/logs', icon: FileText, label: 'Logs Système', roles: ['owner'], color: 'from-slate-600 to-gray-600' },
        { path: '/saas/config', icon: Settings, label: 'Config Plateforme', roles: ['owner'], color: 'from-gray-500 to-slate-500' },

        // Menu standard pour les autres rôles
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'rh', 'manager', 'employe'], color: 'from-blue-500 to-cyan-500' },
        { path: '/users', icon: Users, label: 'Utilisateurs', roles: ['admin', 'rh'], color: 'from-purple-500 to-pink-500' },
        { path: '/employees', icon: Users, label: 'Employés', roles: ['admin', 'rh'], color: 'from-indigo-500 to-purple-500' },
        { path: '/attendance', icon: Calendar, label: 'Présences', roles: ['admin', 'rh', 'manager', 'employe'], color: 'from-green-500 to-emerald-500' },
        { path: '/leaves', icon: Briefcase, label: 'Congés', roles: ['admin', 'rh', 'manager', 'employe'], color: 'from-amber-500 to-orange-500' },
        { path: '/payroll', icon: DollarSign, label: 'Paie', roles: ['admin', 'rh'], color: 'from-rose-500 to-pink-500' },
        { path: '/documents', icon: FileText, label: 'Documents', roles: ['admin', 'rh', 'manager'], color: 'from-teal-500 to-cyan-500' },
        { path: '/settings', icon: Settings, label: 'Paramètres', roles: ['admin'], color: 'from-gray-500 to-slate-500' },
    ];

    const filteredMenuItems = menuItems.filter((item) =>
        user?.role ? item.roles.includes(user.role) : false
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 h-screen 
                bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl 
                flex flex-col shadow-2xl transition-all duration-300 ease-in-out
                md:relative overflow-hidden
                ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-0 w-72'}
            `}>
                {/* Effet de fond animé */}
                <div className="absolute inset-0 bg-mesh-gradient opacity-50 pointer-events-none"></div>

                {/* Logo */}
                <div className="relative z-10 h-20 flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                    <Link to={user?.role === 'owner' ? '/saas' : '/dashboard'} className="flex items-center gap-3 group">
                        <Logo size="md" />
                        <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Premium Edition</p>
                        </div>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                        <LogOut className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="relative z-10 flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {filteredMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                className={`relative group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 animate-fade-in ${isActive
                                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg transform scale-105'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-102'
                                    }`}
                                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                            >
                                {isActive && (
                                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl blur-xl opacity-40`}></div>
                                )}
                                <div className="relative z-10 flex items-center gap-3 w-full">
                                    <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-slow' : 'group-hover:scale-110 transition-transform'}`} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-white animate-ping"></div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="relative z-10 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md">
                    <div className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 p-[2px]">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-md opacity-50"></div>
                                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {user?.first_name?.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                    {user?.role}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110"
                                title="Déconnexion"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
