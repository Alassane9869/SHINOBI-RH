"""
Final verification script for export views
"""
import os
import sys
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from apps.company.models import Company
from apps.attendance.export_views import daily_export_view, monthly_export_view

User = get_user_model()

def test_view():
    print("Setting up test data...")
    # Create test data
    company, _ = Company.objects.get_or_create(name="Test Company")
    user, _ = User.objects.get_or_create(
        username="testadmin",
        defaults={'company': company, 'is_staff': True, 'email': 'admin@test.com'}
    )
    user.company = company
    user.save()

    factory = APIRequestFactory()
    
    # Test 1: Daily Export PDF
    print("\n1. Testing Daily Export (PDF)...")
    request = factory.get('/api/attendance/daily-advanced/export/', {'date': date.today().strftime('%Y-%m-%d'), 'format': 'pdf'})
    force_authenticate(request, user=user)
    response = daily_export_view(request)
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.get('Content-Type', 'N/A')}")
    if response.status_code != 200:
        print(f"   Error: {response.data if hasattr(response, 'data') else response.content}")

    # Test 2: Daily Export Excel
    print("\n2. Testing Daily Export (Excel)...")
    request = factory.get('/api/attendance/daily-advanced/export/', {'date': date.today().strftime('%Y-%m-%d'), 'format': 'excel'})
    force_authenticate(request, user=user)
    response = daily_export_view(request)
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.get('Content-Type', 'N/A')}")
    if response.status_code != 200:
        print(f"   Error: {response.data if hasattr(response, 'data') else response.content}")

    # Test 3: Monthly Export Excel
    print("\n3. Testing Monthly Export (Excel)...")
    request = factory.get('/api/attendance/monthly-advanced/', {'month': date.today().month, 'year': date.today().year, 'format': 'excel'})
    force_authenticate(request, user=user)
    response = monthly_export_view(request)
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.get('Content-Type', 'N/A')}")
    if response.status_code != 200:
        print(f"   Error: {response.data if hasattr(response, 'data') else response.content}")

if __name__ == "__main__":
    try:
        test_view()
        print("\n✓ Tests completed!")
    except Exception as e:
        print(f"\n✗ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
