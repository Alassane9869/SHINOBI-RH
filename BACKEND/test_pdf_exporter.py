import os
import sys
import django

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.employees.models import Employee
from apps.core.utils.advanced_exporters import WeasyPrintPDFExporter, WEASYPRINT_AVAILABLE, WEASYPRINT_ERROR
from django.utils import timezone
from datetime import date, timedelta

User = get_user_model()

print("🔍 Test direct de l'exporteur PDF\n")
print(f"WeasyPrint disponible: {WEASYPRINT_AVAILABLE}")
if not WEASYPRINT_AVAILABLE:
    print(f"Raison: {WEASYPRINT_ERROR}\n")

# 1. Trouver un employé
print("1. Recherche d'un employé...")
employee = Employee.objects.select_related('user', 'company').first()
if not employee:
    print("   ❌ Aucun employé trouvé")
    sys.exit(1)

print(f"   ✅ Employé: {employee.user.get_full_name()}")

# 2. Préparer le contexte
print("\n2. Préparation du contexte...")
years_of_service = 0
if employee.date_hired:
    delta = date.today() - employee.date_hired
    years_of_service = delta.days // 365

# Récupérer les données liées
from apps.leaves.models import Leave
from apps.attendance.models import Attendance
from apps.payroll.models import Payroll

leaves = Leave.objects.filter(employee=employee).order_by('-start_date')[:20]
thirty_days_ago = date.today() - timedelta(days=30)
attendance_records = Attendance.objects.filter(
    employee=employee,
    date__gte=thirty_days_ago
)
attendance_summary = {
    'present': attendance_records.filter(status='present').count(),
    'late': attendance_records.filter(status='late').count(),
    'absent': attendance_records.filter(status='absent').count(),
    'excused': attendance_records.filter(status='excused').count()
}
payrolls = Payroll.objects.filter(employee=employee).order_by('-year', '-month')[:6]

print(f"   ✅ Congés: {leaves.count()}")
print(f"   ✅ Présences (30j): {attendance_records.count()}")
print(f"   ✅ Paies: {payrolls.count()}")

# 3. Créer l'exporteur
print("\n3. Création de l'exporteur PDF...")
context = {
    'employee': employee,
    'years_of_service': years_of_service,
    'leaves': leaves,
    'attendance_summary': attendance_summary,
    'payrolls': payrolls,
    'documents': [],
    'company': employee.company,
    'current_date': timezone.now()
}

exporter = WeasyPrintPDFExporter(
    data=[],
    filename=f"dossier_complet_{employee.user.last_name}_{employee.user.first_name}",
    template_name='exports/pdf/employee_file.html',
    title=f"Dossier Employé - {employee.user.get_full_name()}",
    subtitle=f"Matricule : {str(employee.id)[:8]}",
    document_id=str(employee.id),
    document_type='employee_file',
    company=employee.company,
    user=employee.user,
    context=context
)

# 4. Générer le PDF
print("4. Génération du PDF...")
try:
    response = exporter.export()
    
    if response.status_code == 200:
        content_length = len(response.content)
        print(f"   ✅ Export réussi!")
        print(f"   📄 Type: {response['Content-Type']}")
        print(f"   📦 Taille: {content_length} bytes ({content_length/1024:.2f} KB)")
        
        # Sauvegarder le PDF
        pdf_filename = f"test_export_{employee.id}.pdf"
        with open(pdf_filename, 'wb') as f:
            f.write(response.content)
        print(f"   💾 PDF sauvegardé: {pdf_filename}")
        
        # Vérifier que c'est un vrai PDF
        if response.content[:4] == b'%PDF':
            print(f"   ✅ Fichier PDF valide")
            print(f"\n✅ TEST RÉUSSI - L'export fonctionne correctement!")
            print(f"   Moteur utilisé: {'WeasyPrint' if WEASYPRINT_AVAILABLE else 'xhtml2pdf (fallback)'}")
        else:
            print(f"   ⚠️  Le fichier ne semble pas être un PDF valide")
            print(f"   Début: {response.content[:50]}")
    else:
        print(f"   ❌ Erreur {response.status_code}")
        sys.exit(1)
        
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
