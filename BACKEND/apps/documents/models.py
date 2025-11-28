from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company
from apps.employees.models import Employee

class Document(BaseModel):
    TYPE_CHOICES = (
        ('contract', 'Contract'),
        ('receipt', 'Receipt'),
        ('id_card', 'ID Card'),
        ('other', 'Other'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='documents')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.document_type} - {self.file.name}"
