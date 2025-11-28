from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company
from apps.accounts.models import CustomUser

class Employee(BaseModel):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='employee_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    
    # Personal Info
    photo = models.ImageField(upload_to='employee_photos/', blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # HR Info
    position = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True, null=True)
    date_hired = models.DateField(blank=True, null=True)
    contract_pdf = models.FileField(upload_to='employee_contracts/', blank=True, null=True)
    
    # Salary Info (Basic)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.position}"
