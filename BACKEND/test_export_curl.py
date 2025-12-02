import os
import sys
import django
import requests

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.company.models import Company

User = get_user_model()
company, _ = Company.objects.get_or_create(name="Test Company")
user, _ = User.objects.get_or_create(username="testadmin", defaults={'company': company, 'is_staff': True})
user.company = company
user.save()

refresh = RefreshToken.for_user(user)
token = str(refresh.access_token)

print(f"Token generated. Testing endpoint...")
url = "http://localhost:8000/api/attendance/exports/daily/?date=2025-11-30&format=pdf"
headers = {"Authorization": f"Bearer {token}"}

try:
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    if response.status_code != 200:
        print(f"Response: {response.text[:500]}")
    else:
        print("SUCCESS! Export generated.")
except Exception as e:
    print(f"Error: {e}")
