import requests
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api"

print("🔍 Test de l'export PDF d'un employé\n")

# 1. Récupérer la liste des employés (juste pour avoir un ID)
print("1. Récupération de la liste des employés...")
try:
    response = requests.get(f"{API_URL}/employees/", timeout=5)
    if response.status_code == 200:
        employees = response.json()
        if isinstance(employees, dict) and 'results' in employees:
            employees = employees['results']
        
        if employees and len(employees) > 0:
            employee = employees[0]
            employee_id = employee['id']
            employee_name = f"{employee.get('user', {}).get('first_name', '')} {employee.get('user', {}).get('last_name', '')}"
            print(f"   ✅ Employé trouvé: {employee_name} (ID: {employee_id})")
        else:
            print("   ❌ Aucun employé trouvé dans la base de données")
            sys.exit(1)
    else:
        print(f"   ❌ Erreur {response.status_code}: {response.text[:200]}")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Erreur de connexion: {e}")
    sys.exit(1)

# 2. Tester l'export du dossier complet
print(f"\n2. Test de l'export du dossier complet pour {employee_name}...")
try:
    export_url = f"{API_URL}/employees/{employee_id}/export/complete-file/"
    print(f"   URL: {export_url}")
    
    response = requests.get(export_url, timeout=30)
    
    if response.status_code == 200:
        # Vérifier que c'est bien un PDF
        content_type = response.headers.get('Content-Type', '')
        content_length = len(response.content)
        
        print(f"   ✅ Export réussi!")
        print(f"   📄 Type: {content_type}")
        print(f"   📦 Taille: {content_length} bytes ({content_length/1024:.2f} KB)")
        
        # Sauvegarder le PDF pour vérification
        pdf_filename = f"test_export_employee_{employee_id}.pdf"
        with open(pdf_filename, 'wb') as f:
            f.write(response.content)
        print(f"   💾 PDF sauvegardé: {pdf_filename}")
        
        # Vérifier que c'est un vrai PDF
        if response.content[:4] == b'%PDF':
            print(f"   ✅ Fichier PDF valide")
        else:
            print(f"   ⚠️  Le fichier ne semble pas être un PDF valide")
        
        print("\n✅ TEST RÉUSSI - L'export fonctionne correctement!")
        
    elif response.status_code == 500:
        print(f"   ❌ Erreur 500 - Erreur serveur")
        print(f"   Réponse: {response.text[:500]}")
        sys.exit(1)
    else:
        print(f"   ❌ Erreur {response.status_code}")
        print(f"   Réponse: {response.text[:500]}")
        sys.exit(1)
        
except requests.exceptions.Timeout:
    print(f"   ❌ Timeout - Le serveur met trop de temps à répondre")
    sys.exit(1)
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
