"""
Direct test to see if the view function is being called
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.urls import resolve, reverse
from django.test import RequestFactory
from rest_framework.test import force_authenticate, APIRequestFactory
from django.contrib.auth import get_user_model
from apps.company.models import Company

User = get_user_model()

# Check if URL resolves
try:
    resolved = resolve('/api/attendance/daily-advanced/')
    print(f"✓ URL resolves to: {resolved.func}")
    print(f"  View name: {resolved.view_name}")
    print(f"  URL name: {resolved.url_name}")
except Exception as e:
    print(f"✗ URL does not resolve: {e}")

# Try to call the view
print("\nTrying to call the view directly...")
try:
    # Create test user
    company, _ = Company.objects.get_or_create(name="Test Company")
    user, _ = User.objects.get_or_create(
        username="testadmin",
        defaults={'company': company, 'is_staff': True}
    )
    user.company = company
    user.save()
    
    # Create request using APIRequestFactory (for DRF)
    factory = APIRequestFactory()
    request = factory.get('/api/attendance/daily-advanced/', {'date': '2025-11-30', 'format': 'pdf'})
    force_authenticate(request, user=user)
    
    # Call the resolved view
    response = resolved.func(request)
    print(f"✓ View called successfully!")
    print(f"  Response type: {type(response)}")
    print(f"  Status code: {response.status_code}")
    
    if hasattr(response, 'render'):
        response.render()
    
    if response.status_code == 200:
        print(f"  ✓ SUCCESS! Export works!")
        print(f"  Content-Type: {response.get('Content-Type', 'N/A')}")
        print(f"  Content length: {len(response.content)} bytes")
    else:
        print(f"  ✗ Error: {response.status_code}")
        if hasattr(response, 'content'):
            print(f"  Content: {response.content.decode('utf-8')[:200]}")
            
except Exception as e:
    print(f"✗ Error calling view: {e}")
    import traceback
    traceback.print_exc()
