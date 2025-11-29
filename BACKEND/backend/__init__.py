"""
Initialisation du package backend.

Charge automatiquement l'application Celery pour que Django
puisse utiliser le décorateur @shared_task.
"""
from .celery import app as celery_app

__all__ = ('celery_app',)
