import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.company.models import Company
from apps.employees.models import Employee

User = get_user_model()

# Create or get test user
email = "test_export@example.com"
password = "testpassword123"

try:
    user = User.objects.get(email=email)
    user.set_password(password)
    user.save()
    print(f"User {email} updated with new password.")
except User.DoesNotExist:
    user = User.objects.create_user(username="test_export", email=email, password=password, first_name="Test", last_name="User")
    print(f"User {email} created.")

# Ensure user has a company (required for exports)
if not user.company:
    company, _ = Company.objects.get_or_create(name="Test Company")
    user.company = company
    user.save()
    print(f"User assigned to company: {company.name}")

# Ensure user is an employee (often required for some logic, though export might just need company)
if not hasattr(user, 'employee'):
    Employee.objects.get_or_create(user=user, company=user.company)
    print("Employee profile created/verified.")

print("Setup complete.")
