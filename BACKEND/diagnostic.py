#!/usr/bin/env python
"""
Script de diagnostic complet pour les exports d'attendance.
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import get_resolver, resolve
from django.test import RequestFactory
from django.contrib.auth import get_user_model

print("=" * 70)
print("DIAGNOSTIC COMPLET - EXPORTS ATTENDANCE")
print("=" * 70)
print()

# 1. Vérifier les URLs
print("1. VÉRIFICATION DES URLs")
print("-" * 70)
test_path = '/api/attendance/exports/daily/'
try:
    match = resolve(test_path)
    print(f"✓ URL '{test_path}' résout correctement")
    print(f"  View: {match.func}")
    print(f"  URL name: {match.url_name}")
except Exception as e:
    print(f"✗ URL '{test_path}' ne résout PAS")
    print(f"  Erreur: {e}")

print()

# 2. Tester l'import des vues
print("2. VÉRIFICATION DES IMPORTS")
print("-" * 70)
try:
    from apps.attendance.export_views import daily_export_view
    print(f"✓ Import de daily_export_view réussi")
    print(f"  Fonction: {daily_export_view}")
except Exception as e:
    print(f"✗ Import de daily_export_view échoué")
    print(f"  Erreur: {e}")

print()

# 3. Simuler une requête
print("3. SIMULATION DE REQUÊTE")
print("-" * 70)
try:
    from apps.attendance.export_views import daily_export_view
    from datetime import date
    
    factory = RequestFactory()
    request = factory.get('/api/attendance/exports/daily/', {'date': date.today().strftime('%Y-%m-%d'), 'format': 'pdf'})
    
    # Créer un utilisateur fictif
    User = get_user_model()
    try:
        user = User.objects.first()
        if user:
            request.user = user
            print(f"✓ Utilisateur de test: {user.email}")
        else:
            print("⚠ Aucun utilisateur dans la base")
    except:
        print("⚠ Impossible de récupérer un utilisateur")
    
    # Appeler la vue
    response = daily_export_view(request)
    print(f"✓ Vue appelée avec succès")
    print(f"  Status code: {response.status_code}")
    print(f"  Content-Type: {response.get('Content-Type', 'N/A')}")
    
except Exception as e:
    print(f"✗ Erreur lors de l'appel de la vue")
    print(f"  Erreur: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 70)
print("FIN DU DIAGNOSTIC")
print("=" * 70)
