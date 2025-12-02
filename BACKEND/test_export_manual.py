#!/usr/bin/env python
"""Test manuel de l'endpoint export_daily_advanced"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from apps.attendance.views import AttendanceViewSet
from django.contrib.auth import get_user_model
from apps.company.models import Company

print("=" * 70)
print("TEST MANUEL DE L'ENDPOINT export_daily_advanced")
print("=" * 70)

# Créer un utilisateur de test
User = get_user_model()
try:
    user = User.objects.filter(role__in=['admin', 'rh', 'manager']).first()
    if not user:
        print("✗ Aucun utilisateur admin/rh/manager trouvé!")
        exit(1)
    
    print(f"✓ Utilisateur: {user.email} (role: {user.role})")
    print(f"✓ Entreprise: {user.company.name if user.company else 'N/A'}")
except Exception as e:
    print(f"✗ Erreur lors de la récupération de l'utilisateur: {e}")
    exit(1)

# Créer une requête de test
factory = RequestFactory()
request = factory.get('/api/attendance/export/daily-advanced/', {
    'date': '2025-11-30',
    'format': 'pdf'
})
request.user = user
request.query_params = request.GET

print("\n" + "=" * 70)
print("EXÉCUTION DE LA VUE")
print("=" * 70)

# Créer le viewset
viewset = AttendanceViewSet()
viewset.request = request
viewset.format_kwarg = None

try:
    print("Appel de export_daily_advanced...")
    response = viewset.export_daily_advanced(request)
    print(f"✓ Succès! Status code: {response.status_code}")
    print(f"✓ Content-Type: {response.get('Content-Type', 'N/A')}")
    print(f"✓ Content-Disposition: {response.get('Content-Disposition', 'N/A')}")
except Exception as e:
    print(f"✗ ERREUR: {type(e).__name__}: {e}")
    print("\n" + "=" * 70)
    print("TRACEBACK COMPLET")
    print("=" * 70)
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("FIN DU TEST")
print("=" * 70)
