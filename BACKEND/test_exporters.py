import os
import sys
import django
import io
import openpyxl
import csv
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.core.utils import PDFExporter, ExcelExporter, CSVExporter

def test_exporters():
    print("=== Testing All Exporters ===")
    
    data = [
        {
            'Nom': 'Doe',
            'Prénom': 'John',
            'Poste': 'Developer',
            'Département': 'IT',
            'Email': 'john@example.com',
            'Téléphone': '123456789',
            'Date d\'embauche': '2023-01-01',
            'Salaire': '50000 €'
        },
        {
            'Nom': 'Smith',
            'Prénom': 'Jane',
            'Poste': 'Manager',
            'Département': 'HR',
            'Email': 'jane@example.com',
            'Téléphone': '987654321',
            'Date d\'embauche': '2022-05-15',
            'Salaire': '60000 €'
        }
    ]
    
    headers = ['Nom', 'Prénom', 'Poste', 'Département', 'Email', 'Téléphone', 'Date d\'embauche', 'Salaire']
    
    # 1. Test PDF
    print("\n[1] Testing PDF Exporter...")
    pdf_exporter = PDFExporter(data, 'test_export', title='Test', headers=headers, company_name='Test Co')
    pdf_response = pdf_exporter.export()
    
    if pdf_response.status_code == 200 and pdf_response['Content-Type'] == 'application/pdf':
        content = pdf_response.content
        if content.startswith(b'%PDF'):
            print("✅ PDF Valid (Magic number %PDF found)")
        else:
            print("❌ PDF Invalid (Magic number missing)")
        
        disposition = pdf_response['Content-Disposition']
        if 'filename="test_export.pdf"' in disposition:
             print(f"✅ PDF Filename correct: {disposition}")
        else:
             print(f"❌ PDF Filename incorrect: {disposition}")
    else:
        print(f"❌ PDF Generation Failed: {pdf_response.status_code}")

    # 2. Test Excel
    print("\n[2] Testing Excel Exporter...")
    excel_exporter = ExcelExporter(data, 'test_export', sheet_name='Test')
    excel_response = excel_exporter.export()
    
    if excel_response.status_code == 200 and excel_response['Content-Type'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        content = excel_response.content
        # Excel (zip) magic number is PK\x03\x04
        if content.startswith(b'PK\x03\x04'):
            print("✅ Excel Valid (Magic number PK\\x03\\x04 found)")
            # Try to open it
            try:
                wb = openpyxl.load_workbook(io.BytesIO(content))
                print("✅ Excel Content Valid (Can be opened with openpyxl)")
            except Exception as e:
                print(f"❌ Excel Content Invalid: {e}")
        else:
            print("❌ Excel Invalid (Magic number missing)")
            
        disposition = excel_response['Content-Disposition']
        if 'filename="test_export.xlsx"' in disposition:
             print(f"✅ Excel Filename correct: {disposition}")
        else:
             print(f"❌ Excel Filename incorrect: {disposition}")
    else:
        print(f"❌ Excel Generation Failed: {excel_response.status_code}")

    # 3. Test CSV
    print("\n[3] Testing CSV Exporter...")
    csv_exporter = CSVExporter(data, 'test_export')
    csv_response = csv_exporter.export()
    
    if csv_response.status_code == 200 and csv_response['Content-Type'] == 'text/csv':
        content = csv_response.content.decode('utf-8')
        lines = content.splitlines()
        if len(lines) >= 3: # Header + 2 rows
            print("✅ CSV Valid (Has content)")
            if lines[0].startswith('Nom,Prénom'):
                print("✅ CSV Header correct")
            else:
                print(f"❌ CSV Header incorrect: {lines[0]}")
        else:
            print("❌ CSV Invalid (Not enough lines)")
            
        disposition = csv_response['Content-Disposition']
        if 'filename="test_export.csv"' in disposition:
             print(f"✅ CSV Filename correct: {disposition}")
        else:
             print(f"❌ CSV Filename incorrect: {disposition}")
    else:
        print(f"❌ CSV Generation Failed: {csv_response.status_code}")

if __name__ == '__main__':
    test_exporters()
