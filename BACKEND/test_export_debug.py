"""
Test script with better error handling
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.company.models import Company
from apps.attendance.export_views import daily_export_view
from rest_framework.test import force_authenticate, APIRequestFactory

User = get_user_model()

# Create test data
company, _ = Company.objects.get_or_create(name="Test Company")
user, _ = User.objects.get_or_create(
    username="testadmin",
    defaults={'company': company, 'is_staff': True}
)
user.company = company
user.save()

# Use APIRequestFactory instead of RequestFactory for DRF views
factory = APIRequestFactory()
request = factory.get('/api/attendance/daily-advanced/', {'date': '2025-11-30', 'format': 'pdf'})
force_authenticate(request, user=user)

print("Calling daily_export_view...")
print(f"Request type: {type(request)}")
print(f"Request.GET: {request.GET}")
print(f"Request.user: {request.user}")
print(f"Request.user.company: {request.user.company}")

try:
    response = daily_export_view(request)
    print(f"\n✓ Response received!")
    print(f"  Status: {response.status_code}")
    print(f"  Type: {type(response)}")
    
    if hasattr(response, 'render'):
        response.render()
    
    print(f"  Content-Type: {response.get('Content-Type', 'N/A')}")
    
    if response.status_code != 200:
        content = response.content.decode('utf-8') if hasattr(response, 'content') else str(response)
        print(f"\n✗ Error response:")
        print(f"  {content[:500]}")
    else:
        print(f"\n✓ SUCCESS! Export generated correctly")
        print(f"  Content length: {len(response.content)} bytes")
        
except Exception as e:
    print(f"\n✗ Exception occurred: {e}")
    import traceback
    traceback.print_exc()
