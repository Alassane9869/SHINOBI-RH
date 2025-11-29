import os
import sys
import django
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.core.utils import PDFExporter

def test_pdf_generation():
    print("Testing PDF generation...")
    
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
    
    exporter = PDFExporter(
        data=data,
        filename='test_export',
        title='Test Export',
        headers=headers,
        company_name='Test Company'
    )
    
    response = exporter.export()
    
    if response.status_code == 200:
        print("PDF generated successfully!")
        print(f"Content-Type: {response['Content-Type']}")
        print(f"Content-Disposition: {response['Content-Disposition']}")
        print(f"Size: {len(response.content)} bytes")
        
        # Save to file to inspect
        with open('test_output.pdf', 'wb') as f:
            f.write(response.content)
        print("Saved to test_output.pdf")
    else:
        print(f"Failed to generate PDF. Status code: {response.status_code}")
        print(response.content)

if __name__ == '__main__':
    test_pdf_generation()
