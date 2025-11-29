import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../auth/AuthStore';
import { Building2, Mail, Phone, Globe, User, Shield, AtSign } from 'lucide-react';
import { Company } from '../types';
import { Input } from '../components/ui';
import ExportMenu from '../components/ExportMenu';

const Settings: React.FC = () => {
    const { user } = useAuthStore();

    const { data: company, isLoading } = useQuery<Company>({
        queryKey: ['company'],
        queryFn: async () => {
            const response = await axiosClient.get<Company>(`/api/company/${user?.company}/`);
            return response.data;
        },
        enabled: !!user?.company,
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="page-title">Paramètres</h1>
                    <p className="page-subtitle">Gérez les informations de votre entreprise et votre profil</p>
                </div>
                <ExportMenu module="company" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Information Card */}
                <div className="card space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Entreprise</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Informations générales</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Nom de l'entreprise"
                            value={company?.name || ''}
                            readOnly
                            icon={<Building2 className="w-5 h-5" />}
                            className="bg-gray-50 dark:bg-gray-900/50"
                        />
                        <Input
                            label="Email"
                            value={company?.email || ''}
                            readOnly
                            icon={<Mail className="w-5 h-5" />}
                            className="bg-gray-50 dark:bg-gray-900/50"
                        />
                        <Input
                            label="Téléphone"
                            value={company?.phone || ''}
                            readOnly
                            icon={<Phone className="w-5 h-5" />}
                            className="bg-gray-50 dark:bg-gray-900/50"
                        />
                        <Input
                            label="Site web"
                            value={company?.website || 'Non renseigné'}
                            readOnly
                            icon={<Globe className="w-5 h-5" />}
                            className="bg-gray-50 dark:bg-gray-900/50"
                        />
                        <Input
                            label="Adresse"
                            value={company?.address || ''}
                            readOnly
                            icon={<Building2 className="w-5 h-5" />}
                            className="bg-gray-50 dark:bg-gray-900/50"
                        />
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="card space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mon Profil</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vos informations personnelles</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Prénom"
                                value={user?.first_name || ''}
                                readOnly
                                icon={<User className="w-5 h-5" />}
                                className="bg-gray-50 dark:bg-gray-900/50"
                            />
                            <Input
                                label="Nom"
                                value={user?.last_name || ''}
                                readOnly
                                icon={<User className="w-5 h-5" />}
                                className="bg-gray-50 dark:bg-gray-900/50"
                            />
                        </div>
                        <Input
                            label="Email"
                            value={user?.email || ''}
                            readOnly
                            icon={<AtSign className="w-5 h-5" />}
                            className="bg-gray-50 dark:bg-gray-900/50"
                        />
                        <div>
                            <label className="label">Rôle</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="input pl-12 flex items-center bg-gray-50 dark:bg-gray-900/50">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                        user?.role === 'rh' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                            user?.role === 'manager' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                        {user?.role === 'admin' ? 'Administrateur' :
                                            user?.role === 'rh' ? 'RH' :
                                                user?.role === 'manager' ? 'Manager' :
                                                    user?.role === 'employe' ? 'Employé' :
                                                        user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
