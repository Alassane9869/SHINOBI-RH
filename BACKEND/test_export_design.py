"""
Script de test pour générer des exports PDF et Excel avec le nouveau design.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from datetime import date, time
from apps.company.models import Company
from apps.attendance.services import AttendanceService

# Récupérer la première entreprise
company = Company.objects.first()

if not company:
    print("❌ Aucune entreprise trouvée. Créez une entreprise d'abord.")
    exit(1)

print(f"✓ Entreprise trouvée : {company.name}")

# === Test 1: Daily Report PDF ===
print("\n📄 Génération du Daily Report PDF...")

from apps.pdf_templates.generators.attendance import AttendanceGenerator

# Données de test pour rapport journalier
daily_data = {
    'date': '30/11/2024',
    'summary': {
        'present': 85,
        'late': 4,
        'absent': 1,
        'excused': 0
    },
    'anomalies': [
        'Jean Dupont : Retard de 45 minutes',
        'Marie Martin : Absence non justifiée',
        'Pierre Durand : Départ anticipé',
    ],
    'attendances': [
        {
            'employee': 'Jean Dupont',
            'department': 'Développement',
            'check_in': '09:45',
            'check_out': '18:00',
            'status': 'En retard',
            'delay': 45,
            'hours': 8.25
        },
        {
            'employee': 'Marie Martin',
            'department': 'Marketing',
            'check_in': '-',
            'check_out': '-',
            'status': 'Absent',
            'delay': 0,
            'hours': 0
        },
        {
            'employee': 'Sophie Bernard',
            'department': 'RH',
            'check_in': '08:55',
            'check_out': '17:30',
            'status': 'Présent',
            'delay': 0,
            'hours': 8.5
        },
        {
            'employee': 'Luc Petit',
            'department': 'Développement',
            'check_in': '09:00',
            'check_out': '18:15',
            'status': 'Présent',
            'delay': 0,
            'hours': 9.25
        },
        {
            'employee': 'Claire Dubois',
            'department': 'Commercial',
            'check_in': '09:10',
            'check_out': '17:45',
            'status': 'En retard',
            'delay': 10,
            'hours': 8.5
        },
    ]
}

try:
    generator = AttendanceGenerator(company=company)
    response = generator.generate_daily_report(daily_data, 'test_daily_report')
    
    # Sauvegarder le fichier
    with open('test_daily_report.pdf', 'wb') as f:
        f.write(response.content)
    
    print("✓ Daily Report PDF généré : test_daily_report.pdf")
except Exception as e:
    print(f"❌ Erreur lors de la génération du PDF : {e}")
    import traceback
    traceback.print_exc()

# === Test 2: Monthly Report PDF ===
print("\n📄 Génération du Monthly Report PDF...")

monthly_data = {
    'month': 'Novembre 2024',
    'stats': {
        'present_rate': 94.5,
        'late_rate': 4.2,
        'absent_rate': 1.3
    },
    'alerts': [
        {'employee_name': 'Marie Martin', 'message': 'Taux de présence: 75.0%'},
        {'employee_name': 'Thomas Leroy', 'message': 'Taux de présence: 78.5%'},
    ],
    'employee_stats': [
        {
            'employee_name': 'Jean Dupont',
            'department': 'Développement',
            'present': 18,
            'late': 2,
            'absent': 0,
            'attendance_rate': 100.0
        },
        {
            'employee_name': 'Marie Martin',
            'department': 'Marketing',
            'present': 12,
            'late': 3,
            'absent': 5,
            'attendance_rate': 75.0
        },
        {
            'employee_name': 'Sophie Bernard',
            'department': 'RH',
            'present': 19,
            'late': 1,
            'absent': 0,
            'attendance_rate': 100.0
        },
        {
            'employee_name': 'Luc Petit',
            'department': 'Développement',
            'present': 20,
            'late': 0,
            'absent': 0,
            'attendance_rate': 100.0
        },
        {
            'employee_name': 'Claire Dubois',
            'department': 'Commercial',
            'present': 17,
            'late': 2,
            'absent': 1,
            'attendance_rate': 95.0
        },
    ]
}

try:
    generator = AttendanceGenerator(company=company)
    response = generator.generate_monthly_advanced_report(monthly_data, 'test_monthly_report')
    
    with open('test_monthly_report.pdf', 'wb') as f:
        f.write(response.content)
    
    print("✓ Monthly Report PDF généré : test_monthly_report.pdf")
except Exception as e:
    print(f"❌ Erreur lors de la génération du PDF : {e}")
    import traceback
    traceback.print_exc()

# === Test 3: Daily Report Excel ===
print("\n📊 Génération du Daily Report Excel...")

from apps.attendance.excel_generators import AttendanceExcelGenerator

daily_excel_data = {
    'date': '30/11/2024',
    'summary': {
        'present': 85,
        'late': 4,
        'absent': 1,
        'excused': 0
    },
    'attendances': [
        {
            'Employé': 'Jean Dupont',
            'Département': 'Développement',
            'Arrivée': '09:45',
            'Départ': '18:00',
            'Statut': 'En retard',
            'Retard (min)': 45,
            'Heures': 8.25
        },
        {
            'Employé': 'Marie Martin',
            'Département': 'Marketing',
            'Arrivée': '-',
            'Départ': '-',
            'Statut': 'Absent',
            'Retard (min)': 0,
            'Heures': 0
        },
        {
            'Employé': 'Sophie Bernard',
            'Département': 'RH',
            'Arrivée': '08:55',
            'Départ': '17:30',
            'Statut': 'Présent',
            'Retard (min)': 0,
            'Heures': 8.5
        },
        {
            'Employé': 'Luc Petit',
            'Département': 'Développement',
            'Arrivée': '09:00',
            'Départ': '18:15',
            'Statut': 'Présent',
            'Retard (min)': 0,
            'Heures': 9.25
        },
        {
            'Employé': 'Claire Dubois',
            'Département': 'Commercial',
            'Arrivée': '09:10',
            'Départ': '17:45',
            'Statut': 'En retard',
            'Retard (min)': 10,
            'Heures': 8.5
        },
    ]
}

try:
    exporter = AttendanceExcelGenerator(company=company)
    response = exporter.generate_daily_report(daily_excel_data, 'test_daily_report')
    
    with open('test_daily_report.xlsx', 'wb') as f:
        f.write(response.content)
    
    print("✓ Daily Report Excel généré : test_daily_report.xlsx")
except Exception as e:
    print(f"❌ Erreur lors de la génération Excel : {e}")
    import traceback
    traceback.print_exc()

# === Test 4: Monthly Report Excel ===
print("\n📊 Génération du Monthly Report Excel...")

try:
    exporter = AttendanceExcelGenerator(company=company)
    response = exporter.generate_monthly_advanced_report(monthly_data, 'test_monthly_report')
    
    with open('test_monthly_report.xlsx', 'wb') as f:
        f.write(response.content)
    
    print("✓ Monthly Report Excel généré : test_monthly_report.xlsx")
except Exception as e:
    print(f"❌ Erreur lors de la génération Excel : {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50)
print("✅ Tests terminés !")
print("="*50)
print("\nFichiers générés :")
print("  • test_daily_report.pdf")
print("  • test_monthly_report.pdf")
print("  • test_daily_report.xlsx")
print("  • test_monthly_report.xlsx")
print("\nOuvrez ces fichiers pour vérifier le nouveau design.")
