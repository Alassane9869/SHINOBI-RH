import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';

const LegalMentions: React.FC = () => {
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
            <section className="py-20 px-6 border-b border-white/10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Scale className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Mentions Légales</h1>
                    <p className="text-xl text-gray-400">Informations juridiques sur Shinobi RH</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Editeur */}
                    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Building2 className="text-blue-500" />
                            Éditeur du Service
                        </h2>
                        <div className="space-y-4 text-gray-300">
                            <p>Le service Shinobi RH est édité par la société <strong>Shinobi Technologies SARL</strong>.</p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                                    <span>Siège social : Bamako, Mali</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-500" />
                                    <span>Capital social : 1 000 000 FCFA</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <span>R.C.C.M : MA.BKO.2025.B.12345</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <span>NINA : 123456789012345</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Phone className="text-blue-500" />
                            Contact
                        </h2>
                        <div className="space-y-4 text-gray-300">
                            <p>Vous pouvez nous contacter aux coordonnées suivantes :</p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <a href="https://wa.me/22366826207" className="hover:text-white transition-colors">+223 66 82 62 07</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <a href="mailto:shinobi_it@gmail.com" className="hover:text-white transition-colors">shinobi_it@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Hébergement */}
                    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Database className="text-blue-500" />
                            Hébergement
                        </h2>
                        <div className="space-y-4 text-gray-300">
                            <p>Le Service est hébergé par :</p>
                            <p className="font-semibold text-white">Vercel Inc.</p>
                            <p>
                                340 S Lemon Ave #4133<br />
                                Walnut, CA 91789<br />
                                États-Unis
                            </p>
                            <p className="text-sm text-gray-500 mt-4">
                                Les données sont stockées sur des serveurs situés en Europe (AWS Frankfurt / Paris) conformément au RGPD.
                            </p>
                        </div>
                    </div>

                    {/* Propriété Intellectuelle */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-white">Propriété Intellectuelle</h2>
                        <p className="text-gray-300 leading-relaxed">
                            L'ensemble de ce site relève de la législation malienne et internationale sur le droit d'auteur et la propriété intellectuelle.
                            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                        </p>
                    </div>

                </div>
            </section>
        </div>
    );
};

// Helper icons needed for this file
import { Database, FileText } from 'lucide-react';

export default LegalMentions;
