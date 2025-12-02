import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
                    <p className="text-xl text-gray-400">Dernière mise à jour : 1er décembre 2025</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto prose prose-invert prose-purple">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-12">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Important</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    En utilisant Shinobi RH, vous acceptez les présentes conditions générales d'utilisation.
                                    Veuillez les lire attentivement avant d'utiliser nos services.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Section 1 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">1. Définitions</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-white">« Service »</strong> désigne la plateforme Shinobi RH, accessible via le site web et les applications mobiles,
                                    permettant la gestion des ressources humaines.
                                </p>
                                <p>
                                    <strong className="text-white">« Utilisateur »</strong> désigne toute personne physique ou morale utilisant le Service,
                                    qu'elle soit administrateur, manager ou employé.
                                </p>
                                <p>
                                    <strong className="text-white">« Client »</strong> désigne l'entreprise ou l'organisation ayant souscrit à un abonnement payant.
                                </p>
                                <p>
                                    <strong className="text-white">« Données »</strong> désigne l'ensemble des informations saisies, téléchargées ou générées
                                    par l'Utilisateur dans le cadre de l'utilisation du Service.
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">2. Objet</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions
                                d'utilisation du Service Shinobi RH, ainsi que les droits et obligations des parties dans ce cadre.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">3. Accès au Service</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <h3 className="text-xl font-semibold text-white">3.1 Inscription</h3>
                                <p>
                                    L'accès au Service nécessite la création d'un compte. L'Utilisateur s'engage à fournir des informations
                                    exactes, complètes et à jour. Toute fausse information peut entraîner la suspension ou la résiliation du compte.
                                </p>

                                <h3 className="text-xl font-semibold text-white">3.2 Identifiants</h3>
                                <p>
                                    L'Utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation
                                    du Service effectuée à partir de son compte est présumée avoir été effectuée par lui-même.
                                </p>

                                <h3 className="text-xl font-semibold text-white">3.3 Disponibilité</h3>
                                <p>
                                    Nous nous efforçons de maintenir le Service accessible 24h/24 et 7j/7. Toutefois, nous ne pouvons garantir
                                    une disponibilité absolue et nous réservons le droit d'interrompre temporairement le Service pour maintenance.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">4. Abonnements et Paiements</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <h3 className="text-xl font-semibold text-white">4.1 Formules d'abonnement</h3>
                                <p>
                                    Shinobi RH propose différentes formules d'abonnement (Starter, Pro, Enterprise). Les fonctionnalités
                                    disponibles varient selon la formule choisie.
                                </p>

                                <h3 className="text-xl font-semibold text-white">4.2 Tarification</h3>
                                <p>
                                    Les tarifs sont indiqués en Francs CFA (FCFA) et sont susceptibles de modification. Toute modification
                                    de tarif sera communiquée au Client au moins 30 jours avant son application.
                                </p>

                                <h3 className="text-xl font-semibold text-white">4.3 Paiement</h3>
                                <p>
                                    Le paiement s'effectue mensuellement ou annuellement selon la formule choisie. En cas de non-paiement,
                                    nous nous réservons le droit de suspendre l'accès au Service après un délai de grâce de 7 jours.
                                </p>

                                <h3 className="text-xl font-semibold text-white">4.4 Essai gratuit</h3>
                                <p>
                                    Un essai gratuit de 14 jours est proposé sans engagement. Aucune carte bancaire n'est requise pour
                                    démarrer l'essai. À l'issue de la période d'essai, le compte sera automatiquement désactivé sauf
                                    souscription à un abonnement payant.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">5. Propriété Intellectuelle</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <p>
                                    Le Service, son contenu (textes, images, graphismes, logo, icônes, etc.) et sa structure sont la
                                    propriété exclusive de Shinobi RH et sont protégés par les lois relatives à la propriété intellectuelle.
                                </p>
                                <p>
                                    Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie du Service,
                                    quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
                                </p>
                                <p>
                                    Les Données saisies par l'Utilisateur restent sa propriété exclusive. Shinobi RH ne revendique aucun
                                    droit de propriété sur ces Données.
                                </p>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">6. Protection des Données</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <p>
                                    Shinobi RH s'engage à protéger les données personnelles conformément au Règlement Général sur la
                                    Protection des Données (RGPD) et aux lois locales applicables.
                                </p>
                                <p>
                                    Pour plus d'informations sur la collecte, l'utilisation et la protection de vos données, veuillez
                                    consulter notre <Link to="/privacy-policy" className="text-purple-400 hover:text-purple-300 underline">Politique de Confidentialité</Link>.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">7. Responsabilités</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <h3 className="text-xl font-semibold text-white">7.1 Responsabilité de Shinobi RH</h3>
                                <p>
                                    Shinobi RH met tout en œuvre pour assurer la sécurité et la disponibilité du Service. Toutefois,
                                    notre responsabilité ne saurait être engagée en cas de :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Force majeure ou événements indépendants de notre volonté</li>
                                    <li>Mauvaise utilisation du Service par l'Utilisateur</li>
                                    <li>Défaillance du réseau Internet</li>
                                    <li>Intrusion malveillante ou virus informatique</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white">7.2 Responsabilité de l'Utilisateur</h3>
                                <p>
                                    L'Utilisateur est seul responsable de l'utilisation qu'il fait du Service et des Données qu'il y saisit.
                                    Il s'engage à :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Utiliser le Service de manière conforme à sa destination</li>
                                    <li>Ne pas porter atteinte aux droits de tiers</li>
                                    <li>Respecter les lois et réglementations en vigueur</li>
                                    <li>Sauvegarder régulièrement ses Données</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 8 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">8. Résiliation</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                <h3 className="text-xl font-semibold text-white">8.1 Résiliation par le Client</h3>
                                <p>
                                    Le Client peut résilier son abonnement à tout moment depuis son espace client. La résiliation prendra
                                    effet à la fin de la période d'abonnement en cours. Aucun remboursement ne sera effectué pour la période déjà payée.
                                </p>

                                <h3 className="text-xl font-semibold text-white">8.2 Résiliation par Shinobi RH</h3>
                                <p>
                                    Nous nous réservons le droit de suspendre ou résilier l'accès au Service en cas de :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Non-paiement des sommes dues</li>
                                    <li>Violation des présentes CGU</li>
                                    <li>Utilisation frauduleuse ou abusive du Service</li>
                                    <li>Atteinte à la sécurité ou à l'intégrité du Service</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white">8.3 Conséquences de la résiliation</h3>
                                <p>
                                    En cas de résiliation, l'Utilisateur dispose d'un délai de 30 jours pour exporter ses Données.
                                    Passé ce délai, les Données seront définitivement supprimées de nos serveurs.
                                </p>
                            </div>
                        </div>

                        {/* Section 9 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">9. Modifications des CGU</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Shinobi RH se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront
                                informés de toute modification par email au moins 15 jours avant leur entrée en vigueur. La poursuite
                                de l'utilisation du Service après l'entrée en vigueur des nouvelles CGU vaut acceptation de celles-ci.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">10. Droit Applicable et Juridiction</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Les présentes CGU sont régies par le droit malien. En cas de litige, et à défaut d'accord amiable,
                                les tribunaux de Bamako seront seuls compétents.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-white">11. Contact</h2>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Pour toute question concernant les présentes CGU, vous pouvez nous contacter :
                                </p>
                                <ul className="space-y-2 text-gray-300">
                                    <li><strong className="text-white">Par WhatsApp :</strong> +223 66 82 62 07</li>
                                    <li><strong className="text-white">Adresse :</strong> Bamako, Mali</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 px-6 border-t border-white/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
                    <p className="text-gray-400 mb-8">Essayez Shinobi RH gratuitement pendant 14 jours</p>
                    <Link to="/register">
                        <button className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-semibold transition-all">
                            Démarrer l'essai gratuit
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default TermsOfService;
