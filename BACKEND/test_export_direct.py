import os
import sys
import django

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.employees.models import Employee
from apps.company.models import Company

User = get_user_model()

print("🔍 Test de l'export PDF d'un employé (Django direct)\n")

# 1. Trouver un employé
print("1. Recherche d'un employé...")
try:
    employee = Employee.objects.select_related('user', 'company').first()
    if not employee:
        print("   ❌ Aucun employé trouvé")
        sys.exit(1)
    
    print(f"   ✅ Employé: {employee.user.get_full_name()}")
    print(f"   📍 Entreprise: {employee.company.name}")
    print(f"   🆔 ID: {employee.id}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    sys.exit(1)

# 2. Trouver un utilisateur admin de cette entreprise
print("\n2. Recherche d'un utilisateur admin...")
try:
    admin_user = employee.company.users.filter(is_staff=True).first()
    if not admin_user:
        admin_user = employee.company.users.first()
    
    if not admin_user:
        print("   ❌ Aucun utilisateur trouvé")
        sys.exit(1)
    
    print(f"   ✅ Utilisateur: {admin_user.get_full_name()}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    sys.exit(1)

# 3. Simuler la requête d'export
print(f"\n3. Test de l'export du dossier complet...")
try:
    from apps.employees.views import EmployeeViewSet
    from rest_framework.test import APIRequestFactory
    from django.test import RequestFactory
    
    # Créer une fausse requête
    factory = APIRequestFactory()
    request = factory.get(f'/api/employees/{employee.id}/export/complete-file/')
    request.user = admin_user
    
    # Appeler la vue
    viewset = EmployeeViewSet()
    viewset.request = request
    viewset.kwargs = {'pk': str(employee.id)}
    
    print("   ⏳ Génération du PDF...")
    response = viewset.export_complete_file(request, pk=str(employee.id))
    
    if response.status_code == 200:
        content_length = len(response.content)
        print(f"   ✅ Export réussi!")
        print(f"   📄 Type: {response['Content-Type']}")
        print(f"   📦 Taille: {content_length} bytes ({content_length/1024:.2f} KB)")
        
        # Sauvegarder le PDF
        pdf_filename = f"test_export_employee_{employee.id}.pdf"
        with open(pdf_filename, 'wb') as f:
            f.write(response.content)
        print(f"   💾 PDF sauvegardé: {pdf_filename}")
        
        # Vérifier que c'est un vrai PDF
        if response.content[:4] == b'%PDF':
            print(f"   ✅ Fichier PDF valide")
        else:
            print(f"   ⚠️  Le fichier ne semble pas être un PDF valide")
            print(f"   Début du contenu: {response.content[:100]}")
        
        print("\n✅ TEST RÉUSSI - L'export fonctionne correctement!")
    else:
        print(f"   ❌ Erreur {response.status_code}")
        if hasattr(response, 'data'):
            print(f"   Réponse: {response.data}")
        sys.exit(1)
        
except Exception as e:
    print(f"   ❌ Erreur lors de l'export: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
