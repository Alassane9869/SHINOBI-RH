"""Test pour capturer l'erreur 500"""
import requests

BASE_URL = "http://localhost:8000"

# Login
login_data = {"email": "test_export@example.com", "password": "testpassword123"}
login_response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)

if login_response.status_code == 200:
    token = login_response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Appel qui cause le 500:")
    response = requests.get(f"{BASE_URL}/api/attendance/exports/daily", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"\nResponse body:")
    print(response.text)
