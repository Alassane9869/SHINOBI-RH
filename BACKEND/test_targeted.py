"""Test ciblé pour confirmer le problème"""
import requests

BASE_URL = "http://localhost:8000"

# Login
login_data = {"email": "test_export@example.com", "password": "testpassword123"}
login_response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)

if login_response.status_code == 200:
    token = login_response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    
    print("TEST 1: Sans query params, sans trailing slash")
    r1 = requests.get(f"{BASE_URL}/api/attendance/exports/daily", headers=headers)
    print(f"  Status: {r1.status_code}")
    
    print("\nTEST 2: Sans query params, avec trailing slash")
    r2 = requests.get(f"{BASE_URL}/api/attendance/exports/daily/", headers=headers)
    print(f"  Status: {r2.status_code}")
    
    print("\nTEST 3: Avec query params, sans trailing slash")
    r3 = requests.get(f"{BASE_URL}/api/attendance/exports/daily", headers=headers, params={"date": "2025-11-30", "format": "pdf"})
    print(f"  Status: {r3.status_code}")
    print(f"  URL finale: {r3.url}")
    
    print("\nTEST 4: Avec query params, avec trailing slash")
    r4 = requests.get(f"{BASE_URL}/api/attendance/exports/daily/", headers=headers, params={"date": "2025-11-30", "format": "pdf"})
    print(f"  Status: {r4.status_code}")
    print(f"  URL finale: {r4.url}")
    
    print("\nTEST 5: URL complète construite manuellement")
    r5 = requests.get(f"{BASE_URL}/api/attendance/exports/daily?date=2025-11-30&format=pdf", headers=headers)
    print(f"  Status: {r5.status_code}")
    print(f"  URL finale: {r5.url}")
