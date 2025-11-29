from django.db import models
from apps.core.models import BaseModel

class Company(BaseModel):
    PLAN_CHOICES = (
        ('free', 'Gratuit'),
        ('startup', 'Startup'),
        ('enterprise', 'Entreprise'),
    )

    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Champs SaaS
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    is_active = models.BooleanField(default=True, help_text="Désactiver pour geler l'accès client")
    subscription_end_date = models.DateField(null=True, blank=True)
    max_users = models.IntegerField(default=10)

    def __str__(self):
        return self.name
