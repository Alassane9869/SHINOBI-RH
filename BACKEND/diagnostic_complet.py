"""
Script de diagnostic complet pour identifier le problème 404
Teste point par point tous les aspects de la configuration
"""
import os
import django
import requests
from datetime import date

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import resolve, reverse, get_resolver
from django.conf import settings
from apps.accounts.models import CustomUser

print("=" * 80)
print("DIAGNOSTIC COMPLET - EXPORTS ATTENDANCE")
print("=" * 80)

# ============================================================================
# PARTIE 1: CONFIGURATION DJANGO
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 1: CONFIGURATION DJANGO")
print("=" * 80)

print(f"\n1.1 DEBUG MODE: {settings.DEBUG}")
print(f"1.2 APPEND_SLASH: {getattr(settings, 'APPEND_SLASH', True)}")
print(f"1.3 ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")

print("\n1.4 MIDDLEWARE:")
for i, middleware in enumerate(settings.MIDDLEWARE, 1):
    print(f"    {i}. {middleware}")

print("\n1.5 REST_FRAMEWORK AUTH:")
for auth_class in settings.REST_FRAMEWORK.get('DEFAULT_AUTHENTICATION_CLASSES', []):
    print(f"    - {auth_class}")

# ============================================================================
# PARTIE 2: RÉSOLUTION D'URL
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 2: RÉSOLUTION D'URL")
print("=" * 80)

test_urls = [
    '/api/attendance/exports/daily',
    '/api/attendance/exports/daily/',
    '/api/attendance/exports/monthly',
    '/api/attendance/records/',
    '/api/attendance/records/1/',
]

for url in test_urls:
    try:
        match = resolve(url)
        print(f"\n✓ {url}")
        print(f"  View: {match.func.__name__ if hasattr(match.func, '__name__') else match.func}")
        print(f"  URL Name: {match.url_name}")
        print(f"  Namespace: {match.namespace}")
    except Exception as e:
        print(f"\n✗ {url}")
        print(f"  Error: {str(e)}")

# ============================================================================
# PARTIE 3: UTILISATEUR DE TEST
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 3: UTILISATEUR DE TEST")
print("=" * 80)

try:
    user = CustomUser.objects.get(email="test_export@example.com")
    print(f"\n3.1 User: {user.email}")
    print(f"3.2 Is Active: {user.is_active}")
    print(f"3.3 Is Staff: {user.is_staff}")
    print(f"3.4 Has Company: {hasattr(user, 'company')}")
    print(f"3.5 Company: {user.company if hasattr(user, 'company') else 'N/A'}")
    print(f"3.6 Role: {user.role}")
except CustomUser.DoesNotExist:
    print("\n✗ Utilisateur test_export@example.com n'existe pas!")

# ============================================================================
# PARTIE 4: TESTS HTTP SANS AUTHENTIFICATION
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 4: TESTS HTTP SANS AUTHENTIFICATION")
print("=" * 80)

BASE_URL = "http://localhost:8000"

test_cases = [
    ("GET /api/attendance/records/", {}),
    ("GET /api/attendance/exports/daily", {}),
    ("GET /api/attendance/exports/daily/", {}),
    ("GET /api/attendance/exports/daily (avec params)", {"date": "2025-11-30", "format": "pdf"}),
    ("GET /api/attendance/exports/daily/ (avec params)", {"date": "2025-11-30", "format": "pdf"}),
]

for test_name, params in test_cases:
    url = test_name.split()[1].split(" ")[0]
    full_url = f"{BASE_URL}{url}"
    
    try:
        response = requests.get(full_url, params=params, timeout=5)
        print(f"\n{test_name}")
        print(f"  Status: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('content-type', 'N/A')}")
        if response.status_code >= 400:
            print(f"  Response: {response.text[:150]}")
    except Exception as e:
        print(f"\n{test_name}")
        print(f"  Error: {str(e)}")

# ============================================================================
# PARTIE 5: TESTS HTTP AVEC AUTHENTIFICATION
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 5: TESTS HTTP AVEC AUTHENTIFICATION")
print("=" * 80)

# Login
login_data = {"email": "test_export@example.com", "password": "testpassword123"}
try:
    login_response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data, timeout=5)
    print(f"\n5.1 Login Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token = login_response.json().get('access')
        print(f"5.2 Token: {token[:50]}...")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Tests avec token
        auth_test_cases = [
            ("GET /api/attendance/records/", {}),
            ("GET /api/attendance/exports/daily", {}),
            ("GET /api/attendance/exports/daily/", {}),
            ("GET /api/attendance/exports/daily (avec params)", {"date": "2025-11-30", "format": "pdf"}),
            ("GET /api/attendance/exports/daily/ (avec params)", {"date": "2025-11-30", "format": "pdf"}),
        ]
        
        for test_name, params in auth_test_cases:
            url = test_name.split()[1].split(" ")[0]
            full_url = f"{BASE_URL}{url}"
            
            try:
                response = requests.get(full_url, headers=headers, params=params, timeout=5)
                print(f"\n{test_name}")
                print(f"  Status: {response.status_code}")
                print(f"  Content-Type: {response.headers.get('content-type', 'N/A')}")
                if response.status_code >= 400:
                    print(f"  Response: {response.text[:150]}")
                elif response.status_code == 200:
                    print(f"  ✓ SUCCESS! Content-Length: {len(response.content)} bytes")
            except Exception as e:
                print(f"\n{test_name}")
                print(f"  Error: {str(e)}")
    else:
        print(f"5.2 Login failed: {login_response.text[:200]}")
        
except Exception as e:
    print(f"\n5.1 Login Error: {str(e)}")

# ============================================================================
# PARTIE 6: VÉRIFICATION DES FICHIERS
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 6: VÉRIFICATION DES FICHIERS")
print("=" * 80)

import inspect
from apps.attendance.export_views import daily_export_view

print(f"\n6.1 daily_export_view location: {inspect.getfile(daily_export_view)}")
print(f"6.2 daily_export_view decorators:")
if hasattr(daily_export_view, '__wrapped__'):
    print("    - Has __wrapped__ (decorated)")
else:
    print("    - No __wrapped__")

# Vérifier le code source
source = inspect.getsource(daily_export_view)
if "DEBUG: Entering daily_export_view" in source:
    print("6.3 ✓ Debug print présent dans la vue")
else:
    print("6.3 ✗ Debug print absent de la vue")

# ============================================================================
# PARTIE 7: LISTE TOUTES LES URLS ATTENDANCE
# ============================================================================
print("\n" + "=" * 80)
print("PARTIE 7: TOUTES LES URLS ATTENDANCE")
print("=" * 80)

resolver = get_resolver()

def show_urls(urlpatterns, prefix='', depth=0):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            new_prefix = prefix + str(pattern.pattern)
            show_urls(pattern.url_patterns, new_prefix, depth + 1)
        else:
            full_pattern = prefix + str(pattern.pattern)
            if 'attendance' in full_pattern.lower() or 'export' in full_pattern.lower():
                indent = "  " * depth
                print(f"{indent}{full_pattern}")

show_urls(resolver.url_patterns)

# ============================================================================
# RÉSUMÉ
# ============================================================================
print("\n" + "=" * 80)
print("RÉSUMÉ DU DIAGNOSTIC")
print("=" * 80)

print("\n✓ Points à vérifier:")
print("  1. Si APPEND_SLASH=True et URL sans /, Django redirige")
print("  2. Si middleware bloque avant la vue")
print("  3. Si l'ordre des URLs cause un conflit")
print("  4. Si DRF @api_view a un problème avec les query params")
print("  5. Si le token JWT est valide")

print("\n" + "=" * 80)
print("FIN DU DIAGNOSTIC")
print("=" * 80)
