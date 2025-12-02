import os
import sys
import django

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
print(f"ACCESS_TOKEN={str(refresh.access_token)}")
