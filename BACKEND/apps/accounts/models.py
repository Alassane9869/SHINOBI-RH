from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company

class CustomUser(AbstractUser, BaseModel):
    ROLE_CHOICES = (
        ('owner', 'Propriétaire SaaS'),
        ('admin', 'Admin'),
        ('rh', 'RH'),
        ('manager', 'Manager'),
        ('employe', 'Employe'),
    )

    email = models.EmailField(unique=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employe')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    @property
    def is_saas_owner(self):
        """Vérifie si l'utilisateur est le propriétaire de la plateforme."""
        return self.role == 'owner' or self.is_superuser

    def __str__(self):
        return f"{self.email} - {self.role}"
