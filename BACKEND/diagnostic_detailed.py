#!/usr/bin/env python
"""
Script de diagnostic avec capture d'exception détaillée.
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from datetime import date

print("=" * 70)
print("DIAGNOSTIC DÉTAILLÉ - CAPTURE D'EXCEPTION")
print("=" * 70)
print()

try:
    from apps.attendance.export_views import daily_export_view
    
    factory = RequestFactory()
    request = factory.get('/api/attendance/exports/daily/', {
        'date': date.today().strftime('%Y-%m-%d'),
        'format': 'pdf'
    })
    
    # Créer un utilisateur fictif
    User = get_user_model()
    user = User.objects.first()
    if user:
        request.user = user
        print(f"✓ Utilisateur: {user.email}")
        print(f"✓ Company: {user.company}")
        print()
    
    # Appeler la vue avec capture d'exception
    print("Appel de la vue...")
    response = daily_export_view(request)
    
    print(f"✓ Status: {response.status_code}")
    print(f"✓ Content-Type: {response.get('Content-Type', 'N/A')}")
    
    if response.status_code == 404:
        print()
        print("⚠ RÉPONSE 404 DÉTECTÉE")
        print(f"Content (premiers 500 chars): {response.content[:500]}")
    elif response.status_code == 200:
        print()
        print("✓ SUCCÈS - PDF généré")
        print(f"Taille: {len(response.content)} bytes")
    
except Exception as e:
    print(f"✗ EXCEPTION CAPTURÉE:")
    print(f"  Type: {type(e).__name__}")
    print(f"  Message: {e}")
    print()
    import traceback
    print("Traceback complet:")
    traceback.print_exc()

print()
print("=" * 70)
