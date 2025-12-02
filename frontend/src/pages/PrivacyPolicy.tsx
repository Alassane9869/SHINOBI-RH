import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Politique de Confidentialité</h1>
                    <p className="text-xl text-gray-400">Dernière mise à jour : 1er décembre 2025</p>
                    <p className="text-gray-500 mt-4">Votre vie privée est notre priorité</p>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-8 px-6 border-b border-white/10 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <p className="text-sm text-gray-400 mb-4">Accès rapide :</p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            'Données collectées',
                            'Utilisation des données',
                            'Sécurité',
                            'Vos droits',
                            'Cookies',
                            'Contact'
                        ].map((item, i) => (
                            <a
                                key={i}
                                href={`#section-${i + 1}`}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Introduction */}
                    <div>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Chez Shinobi RH, nous prenons la protection de vos données personnelles très au sérieux.
                            Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et
                            protégeons vos informations personnelles conformément au Règlement Général sur la Protection
                            des Données (RGPD) et aux lois locales applicables.
                        </p>
                    </div>

                    {/* Section 1 */}
                    <div id="section-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Database className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">1. Données que nous collectons</h2>
                        </div>

                        <div className="space-y-6 text-gray-300 leading-relaxed">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">1.1 Données d'identification</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Nom et prénom</li>
                                    <li>Adresse email professionnelle</li>
                                    <li>Numéro de téléphone</li>
                                    <li>Fonction et département</li>
                                    <li>Photo de profil (facultatif)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">1.2 Données de l'entreprise</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Raison sociale et numéro SIRET/RCCM</li>
                                    <li>Adresse du siège social</li>
                                    <li>Secteur d'activité</li>
                                    <li>Nombre d'employés</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">1.3 Données RH</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Informations de paie (salaire, primes, déductions)</li>
                                    <li>Historique des congés et absences</li>
                                    <li>Données de pointage et présence</li>
                                    <li>Documents administratifs (contrats, attestations)</li>
                                    <li>Évaluations de performance</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">1.4 Données techniques</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Adresse IP et données de connexion</li>
                                    <li>Type de navigateur et système d'exploitation</li>
                                    <li>Pages visitées et temps passé</li>
                                    <li>Cookies et technologies similaires</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div id="section-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">2. Comment nous utilisons vos données</h2>
                        </div>

                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>Nous utilisons vos données personnelles pour :</p>
                            <ul className="list-disc list-inside space-y-3 ml-4">
                                <li><strong className="text-white">Fournir le service :</strong> Gestion de la paie, des congés, des présences, etc.</li>
                                <li><strong className="text-white">Améliorer l'expérience :</strong> Personnalisation de l'interface et des fonctionnalités</li>
                                <li><strong className="text-white">Communication :</strong> Envoi de notifications importantes, mises à jour du service</li>
                                <li><strong className="text-white">Support client :</strong> Répondre à vos questions et résoudre les problèmes</li>
                                <li><strong className="text-white">Sécurité :</strong> Prévenir la fraude et protéger contre les accès non autorisés</li>
                                <li><strong className="text-white">Conformité légale :</strong> Respecter nos obligations légales et réglementaires</li>
                                <li><strong className="text-white">Analyse :</strong> Comprendre l'utilisation du service pour l'améliorer</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div id="section-3">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <Lock className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">3. Sécurité de vos données</h2>
                        </div>

                        <div className="space-y-6">
                            <p className="text-gray-300 leading-relaxed">
                                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles robustes pour
                                protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        icon: Lock,
                                        title: 'Cryptage AES-256',
                                        desc: 'Toutes les données sont cryptées au repos et en transit'
                                    },
                                    {
                                        icon: Shield,
                                        title: 'Sauvegardes quotidiennes',
                                        desc: 'Triple redondance sur 3 datacenters géographiquement distincts'
                                    },
                                    {
                                        icon: UserCheck,
                                        title: 'Authentification forte',
                                        desc: 'Authentification à deux facteurs (2FA) disponible'
                                    },
                                    {
                                        icon: FileText,
                                        title: 'Audit logs',
                                        desc: 'Traçabilité complète de tous les accès et modifications'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <item.icon className="w-8 h-8 text-purple-400 mb-3" />
                                        <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                                        <p className="text-sm text-gray-400">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                                <h4 className="font-semibold text-white mb-2">🔒 Certifications</h4>
                                <p className="text-gray-300 text-sm">
                                    Nos infrastructures sont conformes aux normes ISO 27001 et SOC 2. Nous sommes régulièrement
                                    audités par des organismes indépendants.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div id="section-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-pink-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">4. Vos droits (RGPD)</h2>
                        </div>

                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>Conformément au RGPD, vous disposez des droits suivants :</p>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: 'Droit d\'accès',
                                        desc: 'Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.'
                                    },
                                    {
                                        title: 'Droit de rectification',
                                        desc: 'Vous pouvez demander la correction de données inexactes ou incomplètes.'
                                    },
                                    {
                                        title: 'Droit à l\'effacement',
                                        desc: 'Vous pouvez demander la suppression de vos données personnelles (« droit à l\'oubli »).'
                                    },
                                    {
                                        title: 'Droit à la portabilité',
                                        desc: 'Vous pouvez récupérer vos données dans un format structuré et couramment utilisé.'
                                    },
                                    {
                                        title: 'Droit d\'opposition',
                                        desc: 'Vous pouvez vous opposer au traitement de vos données pour des raisons légitimes.'
                                    },
                                    {
                                        title: 'Droit à la limitation',
                                        desc: 'Vous pouvez demander la limitation du traitement de vos données dans certains cas.'
                                    }
                                ].map((right, i) => (
                                    <div key={i} className="bg-white/5 border-l-4 border-purple-500 rounded-r-xl p-4">
                                        <h4 className="font-semibold text-white mb-2">✓ {right.title}</h4>
                                        <p className="text-sm text-gray-400">{right.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mt-6">
                                <p className="text-sm">
                                    <strong className="text-white">Comment exercer vos droits ?</strong><br />
                                    Contactez-nous par WhatsApp au +223 66 82 62 07 ou depuis votre espace client.
                                    Nous traiterons votre demande dans un délai maximum de 30 jours.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div id="section-5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">5. Cookies et technologies similaires</h2>
                        </div>

                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience,
                                analyser l'utilisation du service et personnaliser le contenu.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-white mb-2">Cookies essentiels</h4>
                                    <p className="text-sm">
                                        Nécessaires au fonctionnement du service (authentification, sécurité).
                                        Ils ne peuvent pas être désactivés.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-white mb-2">Cookies de performance</h4>
                                    <p className="text-sm">
                                        Nous aident à comprendre comment vous utilisez le service pour l'améliorer.
                                        Vous pouvez les désactiver.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-white mb-2">Cookies de préférences</h4>
                                    <p className="text-sm">
                                        Mémorisent vos choix (langue, thème, etc.) pour personnaliser votre expérience.
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm">
                                Vous pouvez gérer vos préférences de cookies à tout moment depuis les paramètres de votre navigateur
                                ou depuis votre espace client.
                            </p>
                        </div>
                    </div>

                    {/* Section 6 */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-white">6. Partage des données</h2>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Nous ne vendons jamais vos données personnelles à des tiers. Nous ne partageons vos données
                                qu'avec :
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-white">Prestataires de services :</strong> Hébergement, paiement, support (sous contrat strict de confidentialité)</li>
                                <li><strong className="text-white">Autorités légales :</strong> Si requis par la loi ou pour protéger nos droits</li>
                                <li><strong className="text-white">Avec votre consentement :</strong> Dans tout autre cas, uniquement avec votre accord explicite</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-white">7. Conservation des données</h2>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités
                                pour lesquelles elles ont été collectées :
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Données de compte : Pendant toute la durée de votre abonnement + 30 jours après résiliation</li>
                                <li>Données RH : Conformément aux obligations légales (généralement 5 ans)</li>
                                <li>Données de facturation : 10 ans (obligation légale)</li>
                                <li>Logs de sécurité : 12 mois</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 8 */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-white">8. Transferts internationaux</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Vos données sont hébergées sur des serveurs situés en Europe. En cas de transfert hors de l'Union
                            Européenne, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles
                            types approuvées par la Commission Européenne).
                        </p>
                    </div>

                    {/* Section 9 */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-white">9. Modifications de cette politique</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Nous pouvons modifier cette politique de confidentialité pour refléter les changements dans nos
                            pratiques ou pour des raisons légales. Nous vous informerons de toute modification importante par
                            email au moins 15 jours avant leur entrée en vigueur.
                        </p>
                    </div>

                    {/* Contact */}
                    <div id="section-6">
                        <h2 className="text-3xl font-bold mb-6 text-white">10. Nous contacter</h2>
                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8">
                            <p className="text-gray-300 mb-6">
                                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                            </p>
                            <div className="space-y-3 text-gray-300">
                                <p><strong className="text-white">Délégué à la Protection des Données (DPO)</strong></p>
                                <p>WhatsApp : <a href="https://wa.me/22366826207" className="text-purple-400 hover:text-purple-300">+223 66 82 62 07</a></p>
                                <p>Adresse : Bamako, Mali</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 px-6 border-t border-white/10">
                <div className="max-w-4xl mx-auto text-center">
                    <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Vos données en sécurité maximale</h2>
                    <p className="text-gray-400 mb-8">Essayez Shinobi RH en toute confiance</p>
                    <Link to="/register">
                        <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold transition-all">
                            Démarrer l'essai gratuit
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
