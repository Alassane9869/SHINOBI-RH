import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print(f"{'Email':<30} {'Is Active':<10} {'Is Staff':<10} {'Is Superuser':<15}")
print("-" * 70)
for user in User.objects.all():
    print(f"{user.email:<30} {str(user.is_active):<10} {str(user.is_staff):<10} {str(user.is_superuser):<15}")
