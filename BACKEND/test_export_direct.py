"""Test direct des exports avec authentification"""
import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
EXPORT_URL = f"{BASE_URL}/api/attendance/exports/daily/"

# 1. Login pour obtenir le token
print("=" * 60)
print("ÉTAPE 1: Authentification")
print("=" * 60)

login_data = {
    "email": "test_export@example.com",
    "password": "testpassword123"
}

try:
    response = requests.post(LOGIN_URL, json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access') or data.get('token')
        print(f"Token obtenu: {token[:50]}...")
        
        headers = {
            "Authorization": f"Bearer {token}"
        }

        # 1.5 Test connectivity
        print("\n" + "=" * 60)
        print("ÉTAPE 1.5: Test connectivité (records)")
        print("=" * 60)
        records_url = f"{BASE_URL}/api/attendance/records/"
        try:
            rec_resp = requests.get(records_url, headers=headers)
            print(f"Records Status: {rec_resp.status_code}")
            if rec_resp.status_code != 200:
                print(f"Records Response: {rec_resp.text[:200]}")
        except Exception as e:
            print(f"Records Check Failed: {e}")
        
        # 2. Tester l'export
        print("\n" + "=" * 60)
        print("ÉTAPE 2: Test export quotidien")
        print("=" * 60)
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        params = {
            "date": date.today().strftime("%Y-%m-%d"),
            "format": "pdf"
        }
        
        print(f"URL: {EXPORT_URL}")
        print(f"Params: {params}")
        print(f"Headers: Authorization: Bearer {token[:20]}...")
        
        export_response = requests.get(EXPORT_URL, headers=headers, params=params)
        print(f"\nStatus Code: {export_response.status_code}")
        print(f"Content-Type: {export_response.headers.get('content-type')}")
        
        if export_response.status_code == 200:
            print(f"Export réussi! Taille: {len(export_response.content)} bytes")
            
            # Sauvegarder le fichier
            filename = f"test_export_{date.today().strftime('%Y%m%d')}.pdf"
            with open(filename, 'wb') as f:
                f.write(export_response.content)
            print(f"Fichier sauvegardé: {filename}")
        else:
            print(f"Erreur: {export_response.text[:500]}")
    else:
        print(f"Échec de l'authentification")
        
except Exception as e:
    print(f"Erreur: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Test terminé")
print("=" * 60)
