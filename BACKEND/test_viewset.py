#!/usr/bin/env python
"""Script pour tester directement les endpoints d'attendance"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.attendance.views import AttendanceViewSet
from apps.company.models import Company

print("=" * 70)
print("TEST DES ENDPOINTS D'ATTENDANCE")
print("=" * 70)

# Créer une factory de requêtes
factory = RequestFactory()

# Vérifier les actions enregistrées
print("\n1. Actions enregistrées dans le ViewSet:")
print("-" * 70)
viewset = AttendanceViewSet()
for attr_name in dir(viewset):
    attr = getattr(viewset, attr_name)
    if hasattr(attr, 'url_path'):
        print(f"   ✓ {attr_name}: {attr.url_path}")
        print(f"     Methods: {getattr(attr, 'mapping', 'N/A')}")

# Tester si les méthodes existent
print("\n2. Vérification des méthodes d'export:")
print("-" * 70)
methods_to_check = [
    'export_daily',
    'export_monthly', 
    'export_daily_advanced',
    'export_monthly_advanced'
]

for method_name in methods_to_check:
    if hasattr(viewset, method_name):
        method = getattr(viewset, method_name)
        url_path = getattr(method, 'url_path', 'N/A')
        print(f"   ✓ {method_name}: {url_path}")
    else:
        print(f"   ✗ {method_name}: MANQUANT!")

print("\n" + "=" * 70)
print("FIN DU TEST")
print("=" * 70)
