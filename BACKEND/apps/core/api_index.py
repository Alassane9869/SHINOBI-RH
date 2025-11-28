from django.shortcuts import render
from django.views import View


class APIIndexView(View):
    """
    Page d'accueil de l'API qui liste tous les endpoints disponibles.
    """
    def get(self, request):
        # Liste de tous les endpoints avec descriptions
        endpoints = {
            'Documentation': [
                {
                    'name': 'Swagger UI',
                    'url': '/api/docs/',
                    'description': 'Documentation interactive de l\'API - Testez tous les endpoints',
                    'method': 'GET'
                },
                {
                    'name': 'ReDoc',
                    'url': '/api/redoc/',
                    'description': 'Documentation alternative élégante',
                    'method': 'GET'
                },
                {
                    'name': 'Schema OpenAPI',
                    'url': '/api/schema/',
                    'description': 'Schéma OpenAPI JSON',
                    'method': 'GET'
                },
            ],
            'Administration': [
                {
                    'name': 'Admin Django',
                    'url': '/admin/',
                    'description': 'Interface d\'administration Django',
                    'method': 'GET'
                },
            ],
            'Entreprise': [
                {
                    'name': 'Inscription Entreprise',
                    'url': '/api/company/register/',
                    'description': 'Créer une nouvelle entreprise avec un admin',
                    'method': 'POST'
                },
            ],
            'Authentification': [
                {
                    'name': 'Login',
                    'url': '/api/auth/login/',
                    'description': 'Se connecter et obtenir les tokens JWT',
                    'method': 'POST'
                },
                {
                    'name': 'Refresh Token',
                    'url': '/api/auth/refresh/',
                    'description': 'Rafraîchir le token d\'accès',
                    'method': 'POST'
                },
                {
                    'name': 'Mon Profil',
                    'url': '/api/auth/me/',
                    'description': 'Voir mon profil utilisateur',
                    'method': 'GET'
                },
                {
                    'name': 'Utilisateurs',
                    'url': '/api/users/',
                    'description': 'Gérer les utilisateurs (CRUD)',
                    'method': 'GET, POST, PUT, DELETE'
                },
            ],
            'Employés': [
                {
                    'name': 'Liste Employés',
                    'url': '/api/employees/',
                    'description': 'Voir tous les employés de l\'entreprise',
                    'method': 'GET'
                },
                {
                    'name': 'Créer Employé',
                    'url': '/api/employees/',
                    'description': 'Ajouter un nouvel employé',
                    'method': 'POST'
                },
                {
                    'name': 'Détails Employé',
                    'url': '/api/employees/{id}/',
                    'description': 'Voir/Modifier/Supprimer un employé',
                    'method': 'GET, PUT, DELETE'
                },
                {
                    'name': 'Attestation de Travail',
                    'url': '/api/employees/{id}/work_certificate/',
                    'description': 'Générer attestation de travail PDF',
                    'method': 'GET'
                },
                {
                    'name': 'Contrat de Travail',
                    'url': '/api/employees/{id}/contract_pdf/',
                    'description': 'Générer contrat de travail PDF',
                    'method': 'GET'
                },
            ],
            'Présences': [
                {
                    'name': 'Liste Présences',
                    'url': '/api/attendance/',
                    'description': 'Voir toutes les présences',
                    'method': 'GET'
                },
                {
                    'name': 'Enregistrer Présence',
                    'url': '/api/attendance/',
                    'description': 'Enregistrer une présence',
                    'method': 'POST'
                },
                {
                    'name': 'Détails Présence',
                    'url': '/api/attendance/{id}/',
                    'description': 'Voir/Modifier/Supprimer une présence',
                    'method': 'GET, PUT, DELETE'
                },
            ],
            'Congés': [
                {
                    'name': 'Liste Congés',
                    'url': '/api/leaves/',
                    'description': 'Voir tous les congés',
                    'method': 'GET'
                },
                {
                    'name': 'Demander Congé',
                    'url': '/api/leaves/',
                    'description': 'Créer une demande de congé',
                    'method': 'POST'
                },
                {
                    'name': 'Détails Congé',
                    'url': '/api/leaves/{id}/',
                    'description': 'Voir/Modifier/Supprimer un congé',
                    'method': 'GET, PUT, DELETE'
                },
                {
                    'name': 'Approuver Congé',
                    'url': '/api/leaves/{id}/approve/',
                    'description': 'Approuver une demande de congé',
                    'method': 'POST'
                },
                {
                    'name': 'Rejeter Congé',
                    'url': '/api/leaves/{id}/reject/',
                    'description': 'Rejeter une demande de congé',
                    'method': 'POST'
                },
            ],
            'Paie': [
                {
                    'name': 'Liste Paies',
                    'url': '/api/payroll/',
                    'description': 'Voir toutes les paies',
                    'method': 'GET'
                },
                {
                    'name': 'Créer Paie',
                    'url': '/api/payroll/',
                    'description': 'Créer une paie (génère PDF automatiquement)',
                    'method': 'POST'
                },
                {
                    'name': 'Détails Paie',
                    'url': '/api/payroll/{id}/',
                    'description': 'Voir/Modifier/Supprimer une paie',
                    'method': 'GET, PUT, DELETE'
                },
                {
                    'name': 'Reçu de Paiement',
                    'url': '/api/payroll/{id}/payment_receipt/',
                    'description': 'Générer reçu de paiement PDF',
                    'method': 'GET'
                },
            ],
            'Documents': [
                {
                    'name': 'Liste Documents',
                    'url': '/api/documents/',
                    'description': 'Voir tous les documents',
                    'method': 'GET'
                },
                {
                    'name': 'Upload Document',
                    'url': '/api/documents/',
                    'description': 'Uploader un nouveau document',
                    'method': 'POST'
                },
                {
                    'name': 'Détails Document',
                    'url': '/api/documents/{id}/',
                    'description': 'Voir/Modifier/Supprimer un document',
                    'method': 'GET, PUT, DELETE'
                },
            ],
            'Dashboard': [
                {
                    'name': 'Statistiques',
                    'url': '/api/dashboard/stats/',
                    'description': 'Voir les statistiques de l\'entreprise',
                    'method': 'GET'
                },
            ],
        }
        
        context = {
            'endpoints': endpoints,
            'title': 'API GRH SaaS - Index des Endpoints'
        }
        
        return render(request, 'api_index.html', context)
