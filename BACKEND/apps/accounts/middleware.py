from django.http import JsonResponse
from .models import PlatformConfig

class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Toujours laisser passer les fichiers statiques, media et l'admin
        if request.path.startswith('/admin/') or \
           request.path.startswith('/static/') or \
           request.path.startswith('/media/'):
            return self.get_response(request)

        # 2. Toujours laisser passer les endpoints d'authentification et de config
        # Cela permet de se connecter et de vérifier l'état de la maintenance
        allowed_paths = [
            '/api/auth/login/',
            '/api/auth/refresh/',
            '/api/auth/platform/config/',
        ]
        
        if request.path in allowed_paths:
            return self.get_response(request)

        try:
            # 3. Vérifier le mode maintenance
            config = PlatformConfig.get_config()
            
            if config.maintenance_mode:
                # 4. Si l'utilisateur est connecté et est owner, on laisse passer
                if request.user.is_authenticated and getattr(request.user, 'is_saas_owner', False):
                    return self.get_response(request)

                # 5. Sinon, on bloque avec une 503
                return JsonResponse({
                    'maintenance': True,
                    'message': config.maintenance_message
                }, status=503)
                
        except Exception:
            # En cas d'erreur (ex: DB pas prête), on laisse passer par sécurité
            pass

        return self.get_response(request)
