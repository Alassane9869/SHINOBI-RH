"""Test simple sans authentification pour isoler le problème"""
import requests

BASE_URL = "http://localhost:8000"

# Test 1: Route qui fonctionne
print("Test 1: /api/attendance/records/")
try:
    resp = requests.get(f"{BASE_URL}/api/attendance/records/")
    print(f"  Status: {resp.status_code}")
    print(f"  Content-Type: {resp.headers.get('content-type', 'N/A')}")
except Exception as e:
    print(f"  Error: {e}")

# Test 2: Route d'export
print("\nTest 2: /api/attendance/exports/daily/")
try:
    resp = requests.get(f"{BASE_URL}/api/attendance/exports/daily/")
    print(f"  Status: {resp.status_code}")
    print(f"  Content-Type: {resp.headers.get('content-type', 'N/A')}")
    print(f"  Response: {resp.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 3: Route d'export avec params
print("\nTest 3: /api/attendance/exports/daily/?date=2025-11-30&format=pdf")
try:
    resp = requests.get(f"{BASE_URL}/api/attendance/exports/daily/", params={'date': '2025-11-30', 'format': 'pdf'})
    print(f"  Status: {resp.status_code}")
    print(f"  Content-Type: {resp.headers.get('content-type', 'N/A')}")
    print(f"  Response: {resp.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")
