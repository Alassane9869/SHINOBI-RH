
import os
import sys
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.core.utils.advanced_exporters import WeasyPrintPDFExporter, WEASYPRINT_AVAILABLE

print(f"WEASYPRINT_AVAILABLE: {WEASYPRINT_AVAILABLE}")

try:
    import xhtml2pdf
    print("xhtml2pdf is installed")
except ImportError:
    print("xhtml2pdf is NOT installed")

try:
    import weasyprint
    print("weasyprint is installed")
except ImportError:
    print("weasyprint is NOT installed")

print("Testing PDF generation...")
try:
    exporter = WeasyPrintPDFExporter(
        data=[],
        filename="test_export",
        template_name='exports/pdf/employee_file.html',
        context={
            'employee': {'id': 1, 'user': {'first_name': 'John', 'last_name': 'Doe', 'email': 'john@example.com', 'get_full_name': lambda: 'John Doe'}},
            'years_of_service': 2,
            'leaves': [],
            'attendance_summary': {'present': 10, 'late': 0, 'absent': 0, 'excused': 0},
            'payrolls': [],
            'documents': [],
            'company': {'name': 'Test Corp'},
            'current_date': '2023-01-01'
        }
    )
    # Mock company and user
    class MockObj:
        pass
    
    company = MockObj()
    company.name = "Test Company"
    user = MockObj()
    user.get_full_name = lambda: "Test User"
    
    exporter.company = company
    exporter.user = user
    
    response = exporter.export()
    print("PDF generation successful")
except Exception as e:
    print(f"PDF generation failed: {e}")
    import traceback
    traceback.print_exc()


