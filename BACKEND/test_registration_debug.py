import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from apps.accounts.views import RegisterCompanyView
from apps.accounts.models import CustomUser
from apps.company.models import Company

def test_registration():
    print("--- Testing Registration ---")
    
    # Clean up previous test data
    email = "test_new_user@example.com"
    Company.objects.filter(name="Test Company New").delete()
    CustomUser.objects.filter(email=email).delete()

    factory = APIRequestFactory()
    view = RegisterCompanyView.as_view()

    data = {
        "company_name": "Test Company New",
        "email": email,
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "selected_plan": "starter"  # Using the correct slug found in DB
    }

    request = factory.post('/api/auth/register-company/', data, format='json')
    response = view(request)

    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print("Error Details:", response.data)
    else:
        print("Success!")
        print("User created:", response.data['user']['email'])
        
        # Check subscription status
        user = CustomUser.objects.get(email=email)
        sub = user.company.subscription
        print(f"Subscription Status: {sub.status}")
        print(f"Plan: {sub.plan.name}")
        print(f"Trial End: {sub.trial_end_date}")

if __name__ == "__main__":
    test_registration()
