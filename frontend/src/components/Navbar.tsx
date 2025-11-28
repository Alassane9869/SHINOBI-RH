import React, { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, Settings, Zap } from 'lucide-react';
import useAuthStore from '../auth/AuthStore';

const Navbar: React.FC = () => {
    const { user } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <nav className="relative h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 flex items-center justify-between shadow-sm z-10">
            {/* Effet de fond animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50/20 via-transparent to-accent-50/20 dark:from-primary-950/20 dark:via-transparent dark:to-accent-950/20 pointer-events-none"></div>

            {/* Search */}
            <div className="relative flex-1 max-w-md z-10">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity"></div>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="Rechercher... (Ctrl+K)"
                        className="relative w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-700"
                    />
                    <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 z-10">
                {/* Quick Action */}
                <button className="relative p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 transition-all hover:scale-110 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 group">
                    <Zap className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-950 dark:hover:to-accent-950 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:scale-110 group">
                    <Bell className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="relative p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-blue-900 dark:to-indigo-900 hover:from-amber-200 hover:to-orange-200 dark:hover:from-blue-800 dark:hover:to-indigo-800 transition-all hover:scale-110 shadow-sm"
                >
                    {darkMode ? (
                        <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                    ) : (
                        <Moon className="w-5 h-5 text-blue-600 animate-pulse-slow" />
                    )}
                </button>

                {/* Settings */}
                <button className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-950 dark:hover:to-accent-950 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:scale-110 group">
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* User Badge */}
                <div className="ml-2 flex items-center gap-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs font-medium bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent capitalize">
                            {user?.role}
                        </p>
                    </div>
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                            {user?.first_name?.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
