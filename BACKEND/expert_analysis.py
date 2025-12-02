#!/usr/bin/env python
"""
Analyse experte du fichier urls.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

print("=" * 80)
print("ANALYSE EXPERTE DJANGO - backend/urls.py")
print("=" * 80)
print()

# 1. Vérification des imports
print("1. VÉRIFICATION DES IMPORTS")
print("-" * 80)

imports_to_check = [
    ('apps.core.api_index', 'APIIndexView'),
    ('apps.attendance.export_views', 'daily_export_view'),
    ('apps.attendance.export_views', 'monthly_export_view'),
    ('apps.attendance.export_views', 'weekly_export_view'),
    ('apps.attendance.export_views', 'semester_export_view'),
    ('apps.attendance.export_views', 'annual_export_view'),
    ('apps.attendance.export_views', 'individual_export_view'),
]

for module_path, item_name in imports_to_check:
    try:
        module = __import__(module_path, fromlist=[item_name])
        item = getattr(module, item_name)
        print(f"✓ {module_path}.{item_name}")
    except Exception as e:
        print(f"✗ {module_path}.{item_name} - ERROR: {e}")

print()

# 2. Vérification des URLs includes
print("2. VÉRIFICATION DES INCLUDES")
print("-" * 80)

includes_to_check = [
    'apps.accounts.urls',
    'apps.company.urls',
    'apps.employees.urls',
    'apps.attendance.urls',
    'apps.leaves.urls',
    'apps.payroll.urls',
    'apps.documents.urls',
    'apps.dashboard.urls',
    'apps.core.urls',
    'apps.notifications.urls',
    'apps.pdf_templates.urls',
]

for module_path in includes_to_check:
    try:
        module = __import__(module_path, fromlist=['urlpatterns'])
        urlpatterns = getattr(module, 'urlpatterns')
        print(f"✓ {module_path} ({len(urlpatterns)} patterns)")
    except Exception as e:
        print(f"✗ {module_path} - ERROR: {e}")

print()

# 3. Test de résolution des URLs d'export
print("3. TEST DE RÉSOLUTION DES URLs D'EXPORT")
print("-" * 80)

from django.urls import resolve, reverse

export_urls = [
    '/api/attendance/exports/daily/',
    '/api/attendance/exports/monthly/',
    '/api/attendance/exports/weekly/',
    '/api/attendance/exports/semester/',
    '/api/attendance/exports/annual/',
    '/api/attendance/exports/individual/',
]

for url in export_urls:
    try:
        match = resolve(url)
        print(f"✓ {url} -> {match.func.__name__}")
    except Exception as e:
        print(f"✗ {url} - ERROR: {e}")

print()

# 4. Vérification des conflits d'URL
print("4. ANALYSE DES CONFLITS POTENTIELS")
print("-" * 80)

# Vérifier si /api/attendance/ pourrait capturer /api/attendance/exports/
from django.urls import get_resolver
resolver = get_resolver()

test_path = '/api/attendance/exports/daily/'
try:
    match = resolve(test_path)
    print(f"✓ Pas de conflit: {test_path} résout vers {match.url_name}")
except Exception as e:
    print(f"✗ CONFLIT DÉTECTÉ: {test_path} - {e}")

print()
print("=" * 80)
print("FIN DE L'ANALYSE")
print("=" * 80)
