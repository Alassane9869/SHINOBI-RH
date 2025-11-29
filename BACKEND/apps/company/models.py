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


class CompanyBranding(BaseModel):
    """
    Configuration du branding pour les exports de documents.
    Permet de personnaliser l'apparence des PDFs, Excel, etc.
    """
    company = models.OneToOneField(
        Company, 
        on_delete=models.CASCADE, 
        related_name='branding'
    )
    
    # Couleurs
    primary_color = models.CharField(
        max_length=7, 
        default='#4472C4',
        help_text="Couleur principale (format hex: #RRGGBB)"
    )
    secondary_color = models.CharField(
        max_length=7, 
        default='#2e7d32',
        help_text="Couleur secondaire (format hex: #RRGGBB)"
    )
    accent_color = models.CharField(
        max_length=7, 
        default='#ed6c02',
        help_text="Couleur d'accent (format hex: #RRGGBB)"
    )
    
    # Textes personnalisés
    header_text = models.TextField(
        blank=True,
        help_text="Texte d'en-tête pour les documents"
    )
    footer_text = models.TextField(
        blank=True,
        help_text="Texte de pied de page pour les documents"
    )
    
    # Signature
    signature_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nom du signataire (ex: Directeur RH)"
    )
    signature_title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Titre du signataire"
    )
    
    def __str__(self):
        return f"Branding - {self.company.name}"

