"""
Manual test script to verify attendance export formats
Run with: python backend/test_attendance_exports.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.company.models import Company
from apps.attendance.export_views import daily_export_view, monthly_export_view
from django.test import RequestFactory
from datetime import date

User = get_user_model()

def test_exports():
    # Create test company and user
    company, _ = Company.objects.get_or_create(name="Test Company")
    user, _ = User.objects.get_or_create(
        username="testuser",
        defaults={'company': company}
    )
    user.company = company
    user.save()
    
    factory = RequestFactory()
    
    print("Testing Daily Export...")
    
    # Test PDF
    request = factory.get('/api/attendance/daily-advanced/', {'date': '2023-01-01', 'format': 'pdf'})
    request.user = user
    request.query_params = {'date': '2023-01-01', 'format': 'pdf'}
    
    try:
        response = daily_export_view(request)
        print(f"✓ Daily PDF: Status {response.status_code}, Content-Type: {response.get('Content-Type', 'N/A')}")
        assert response.status_code == 200
        assert response['Content-Type'] == 'application/pdf'
    except Exception as e:
        print(f"✗ Daily PDF failed: {e}")
    
    # Test Excel
    request = factory.get('/api/attendance/daily-advanced/', {'date': '2023-01-01', 'format': 'excel'})
    request.user = user
    request.query_params = {'date': '2023-01-01', 'format': 'excel'}
    
    try:
        response = daily_export_view(request)
        print(f"✓ Daily Excel: Status {response.status_code}, Content-Type: {response.get('Content-Type', 'N/A')}")
        assert response.status_code == 200
        assert 'spreadsheet' in response['Content-Type']
    except Exception as e:
        print(f"✗ Daily Excel failed: {e}")
    
    print("\nTesting Monthly Export...")
    
    # Test PDF
    request = factory.get('/api/attendance/monthly-advanced/', {'month': '1', 'year': '2023', 'format': 'pdf'})
    request.user = user
    request.query_params = {'month': '1', 'year': '2023', 'format': 'pdf'}
    
    try:
        response = monthly_export_view(request)
        print(f"✓ Monthly PDF: Status {response.status_code}, Content-Type: {response.get('Content-Type', 'N/A')}")
        assert response.status_code == 200
        assert response['Content-Type'] == 'application/pdf'
    except Exception as e:
        print(f"✗ Monthly PDF failed: {e}")
    
    # Test Excel
    request = factory.get('/api/attendance/monthly-advanced/', {'month': '1', 'year': '2023', 'format': 'excel'})
    request.user = user
    request.query_params = {'month': '1', 'year': '2023', 'format': 'excel'}
    
    try:
        response = monthly_export_view(request)
        print(f"✓ Monthly Excel: Status {response.status_code}, Content-Type: {response.get('Content-Type', 'N/A')}")
        assert response.status_code == 200
        assert 'spreadsheet' in response['Content-Type']
    except Exception as e:
        print(f"✗ Monthly Excel failed: {e}")
    
    print("\n✅ All tests completed!")

if __name__ == '__main__':
    test_exports()
