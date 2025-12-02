import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Server, UserCheck, Activity, CheckCircle2 } from 'lucide-react';

const Security: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#000212] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#000212]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="py-20 px-6 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[100px]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Sécurité & Conformité</h1>
                    <p className="text-xl text-gray-400">Vos données sont notre responsabilité la plus précieuse.</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Overview */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Lock, title: "Chiffrement de bout en bout", desc: "AES-256 pour les données au repos et TLS 1.3 pour les transferts." },
                            { icon: Server, title: "Infrastructure ISO 27001", desc: "Hébergé sur des serveurs certifiés avec redondance géographique." },
                            { icon: Activity, title: "Surveillance 24/7", desc: "Monitoring continu des menaces et détection d'intrusions." }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#09090b] border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
                                <item.icon className="w-8 h-8 text-emerald-500 mb-4" />
                                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">Protection des Données</h2>
                            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-8 space-y-6">
                                <p className="text-gray-300 leading-relaxed">
                                    Nous appliquons le principe de "Security by Design". Chaque fonctionnalité est conçue avec la sécurité comme priorité absolue.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Isolation stricte des données entre les clients (Multi-tenancy)",
                                        "Sauvegardes automatiques toutes les heures avec rétention de 30 jours",
                                        "Tests d'intrusion réguliers par des cabinets indépendants",
                                        "Politique de mots de passe forts et 2FA disponible"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">Conformité RGPD & Locale</h2>
                            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-8">
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    Shinobi RH est conforme aux exigences du Règlement Général sur la Protection des Données (RGPD) ainsi qu'aux lois maliennes sur la protection des données à caractère personnel.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <h4 className="font-bold text-white mb-2">Droit d'accès et de rectification</h4>
                                        <p className="text-sm text-gray-400">Vous gardez le contrôle total sur vos données. Exportez ou supprimez vos informations à tout moment.</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <h4 className="font-bold text-white mb-2">Registre des traitements</h4>
                                        <p className="text-sm text-gray-400">Nous tenons un registre précis de toutes les opérations effectuées sur vos données.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">Signaler une faille</h2>
                            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-8 text-center">
                                <p className="text-gray-300 mb-6">
                                    Si vous pensez avoir découvert une vulnérabilité de sécurité sur Shinobi RH, nous vous encourageons à nous le signaler immédiatement.
                                </p>
                                <a href="mailto:security@shinobi-rh.com" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold transition-colors">
                                    <Shield className="w-4 h-4" />
                                    Contacter l'équipe sécurité
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Security;
