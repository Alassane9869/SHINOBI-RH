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
} from 'lucide-react';
import useAuthStore from '../auth/AuthStore';

interface MenuItem {
    path: string;
    icon: LucideIcon;
    label: string;
    roles: string[];
    color: string;
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const menuItems: MenuItem[] = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'rh', 'manager', 'employe'], color: 'from-blue-500 to-cyan-500' },
        { path: '/users', icon: Users, label: 'Utilisateurs', roles: ['admin', 'rh'], color: 'from-purple-500 to-pink-500' },
        { path: '/employees', icon: Users, label: 'Employés', roles: ['admin', 'rh'], color: 'from-indigo-500 to-purple-500' },
        { path: '/attendance', icon: Calendar, label: 'Présences', roles: ['admin', 'rh', 'manager'], color: 'from-green-500 to-emerald-500' },
        { path: '/leaves', icon: Briefcase, label: 'Congés', roles: ['admin', 'rh', 'manager', 'employe'], color: 'from-amber-500 to-orange-500' },
        { path: '/payroll', icon: DollarSign, label: 'Paie', roles: ['admin', 'rh'], color: 'from-rose-500 to-pink-500' },
        { path: '/documents', icon: FileText, label: 'Documents', roles: ['admin', 'rh', 'manager'], color: 'from-teal-500 to-cyan-500' },
        { path: '/settings', icon: Settings, label: 'Paramètres', roles: ['admin'], color: 'from-gray-500 to-slate-500' },
    ];

    const filteredMenuItems = menuItems.filter((item) =>
        user?.role ? item.roles.includes(user.role) : false
    );

    return (
        <aside className="w-72 h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl flex flex-col shadow-2xl relative overflow-hidden">
            {/* Effet de fond animé */}
            <div className="absolute inset-0 bg-mesh-gradient opacity-50 pointer-events-none"></div>

            {/* Logo */}
            <div className="relative z-10 h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 group-hover:scale-110">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-lg bg-gradient-to-r from-gray-900 to-primary-600 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
                            SHINOBI RH
                        </span>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Premium Edition</p>
                    </div>
                </Link>
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
    );
};

export default Sidebar;
