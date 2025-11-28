from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company
from apps.employees.models import Employee

class Leave(BaseModel):
    TYPE_CHOICES = (
        ('sick', 'Sick Leave'),
        ('vacation', 'Vacation'),
        ('unpaid', 'Unpaid Leave'),
        ('maternity', 'Maternity Leave'),
        ('other', 'Other'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='leaves')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    leave_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to='leave_attachments/', blank=True, null=True)

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.status})"
