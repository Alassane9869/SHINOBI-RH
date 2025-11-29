import os
import sys
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.employees.models import Employee

User = get_user_model()

# Get a real employee
try:
    employee = Employee.objects.select_related('user').first()
    if employee:
        print(f"Testing with employee: {employee.user.get_full_name()}")
        
        # Simulate the export
        from apps.employees.views import EmployeeViewSet
        from rest_framework.test import APIRequestFactory
        from django.http import HttpRequest
        
        factory = APIRequestFactory()
        request = factory.get(f'/api/employees/{employee.id}/export/complete-file/')
        request.user = employee.company.users.filter(is_staff=True).first() or employee.user
        
        viewset = EmployeeViewSet()
        viewset.request = request
        viewset.kwargs = {'pk': str(employee.id)}
        
        try:
            response = viewset.export_complete_file(request, pk=str(employee.id))
            print(f"Export successful! Status: {response.status_code}")
        except Exception as e:
            print(f"Export failed with error: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("No employees found in database")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
