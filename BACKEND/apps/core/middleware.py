"""
Middleware pour le multi-tenant.
Assure que chaque requête est isolée par entreprise.
"""
from django.http import JsonResponse
from apps.accounts.models import CustomUser


class TenantMiddleware:
    """
    Middleware qui vérifie que l'utilisateur appartient à une entreprise
    et ajoute l'entreprise au contexte de la requête.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Ajouter l'entreprise de l'utilisateur au contexte de la requête
        if request.user.is_authenticated and hasattr(request.user, 'company'):
            request.tenant = request.user.company
        else:
            request.tenant = None

        response = self.get_response(request)
        return response


class CompanyIsolationMiddleware:
    """
    Middleware de sécurité supplémentaire pour l'isolation des données.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(f"DEBUG MIDDLEWARE: Path={request.path}, Method={request.method}, User={request.user}, Authenticated={request.user.is_authenticated}")
        
        # Liste des URLs publiques qui ne nécessitent pas d'entreprise
        public_urls = [
            '/api/auth/login/',
            '/api/auth/refresh/',
            '/api/company/register/',
            '/api/docs/',
            '/api/redoc/',
            '/api/schema/',
            '/admin/',
            '/static/',
            '/media/',
            '/',  # Page d'accueil
        ]
        
        # Vérifier que l'utilisateur a une entreprise pour les endpoints protégés
        if request.user.is_authenticated:
            # Vérifier si l'URL est publique
            is_public = any(request.path.startswith(url) for url in public_urls)
            
            print(f"DEBUG MIDDLEWARE: is_public={is_public}, has_company={hasattr(request.user, 'company')}, company={getattr(request.user, 'company', None)}")
            
            if not is_public and request.path.startswith('/api/'):
                if not hasattr(request.user, 'company') or request.user.company is None:
                    print("DEBUG MIDDLEWARE: Returning 403 - No company")
                    return JsonResponse({
                        'error': 'Utilisateur non associé à une entreprise'
                    }, status=403)

        response = self.get_response(request)
        print(f"DEBUG MIDDLEWARE: Response status={response.status_code}")
        return response
