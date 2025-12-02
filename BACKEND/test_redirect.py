"""Test pour voir exactement ce que Django reçoit"""
import requests

BASE_URL = "http://localhost:8000"

# Login
login_data = {"email": "test_export@example.com", "password": "testpassword123"}
login_response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)

if login_response.status_code == 200:
    token = login_response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test avec allow_redirects=False pour voir si Django redirige
    print("TEST: Avec query params, allow_redirects=False")
    response = requests.get(
        f"{BASE_URL}/api/attendance/exports/daily/",
        headers=headers,
        params={"date": "2025-11-30", "format": "pdf"},
        allow_redirects=False
    )
    print(f"  Status: {response.status_code}")
    print(f"  Location header: {response.headers.get('Location', 'N/A')}")
    print(f"  Content-Type: {response.headers.get('content-type', 'N/A')}")
    if response.status_code >= 400:
        print(f"  Response: {response.text[:300]}")
