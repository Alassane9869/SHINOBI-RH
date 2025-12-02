import requests
from datetime import date

# 1. Login pour obtenir un token
login_url = "http://127.0.0.1:8000/api/auth/login/"
login_data = {
    "email": "sitantoure9091@gmail.com",
    "password": "admin123"  # Ajustez si nécessaire
}

print("1. Tentative de connexion...")
login_response = requests.post(login_url, json=login_data)
print(f"   Status: {login_response.status_code}")

if login_response.status_code == 200:
    tokens = login_response.json()
    access_token = tokens.get('access')
    print(f"   ✓ Token obtenu")
    
    # 2. Tester l'export avec authentification
    export_url = "http://127.0.0.1:8000/api/attendance/exports/daily/"
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    params = {
        'date': date.today().strftime('%Y-%m-%d'),
        'format': 'pdf'
    }
    
    print()
    print("2. Test de l'export avec authentification...")
    export_response = requests.get(export_url, headers=headers, params=params)
    print(f"   Status: {export_response.status_code}")
    print(f"   Content-Type: {export_response.headers.get('Content-Type')}")
    
    if export_response.status_code == 200:
        print(f"   ✓ SUCCESS! PDF généré ({len(export_response.content)} bytes)")
        with open('test_authenticated_export.pdf', 'wb') as f:
            f.write(export_response.content)
        print("   Saved to test_authenticated_export.pdf")
    else:
        print(f"   ✗ Failed: {export_response.text[:500]}")
else:
    print(f"   ✗ Login failed: {login_response.text}")
