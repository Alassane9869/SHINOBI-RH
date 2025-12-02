import requests
import json

# Test des endpoints d'export
base_url = "http://127.0.0.1:8000/api/attendance"

endpoints_to_test = [
    f"{base_url}/daily-advanced/?date=2025-11-30&format=pdf",
    f"{base_url}/monthly-advanced/?month=11&year=2025&format=pdf",
    f"{base_url}/",  # Test de base
]

print("=" * 80)
print("TEST DES ENDPOINTS ATTENDANCE")
print("=" * 80)

for url in endpoints_to_test:
    print(f"\n🔍 Testing: {url}")
    try:
        response = requests.get(url, timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        if response.status_code == 404:
            print(f"   Body: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
