"""
Configuration Celery pour l'application GRH.

Ce module configure Celery pour gérer les tâches asynchrones,
notamment les exports de documents volumineux.
"""
import os
from celery import Celery
from django.conf import settings

# Définir le module de settings Django par défaut pour Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Créer l'instance Celery
app = Celery('grh_backend')

# Charger la configuration depuis les settings Django
# Le namespace 'CELERY' signifie que toutes les configs Celery
# doivent avoir le préfixe CELERY_ dans settings.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# Découvrir automatiquement les tâches dans tous les modules tasks.py
# des applications installées
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Tâche de debug pour tester la configuration Celery."""
    print(f'Request: {self.request!r}')
