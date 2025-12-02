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


class PlatformConfig(models.Model):
    """
    Configuration globale de la plateforme (Singleton).
    Une seule instance doit exister.
    """
    # Mode maintenance
    maintenance_mode = models.BooleanField(
        default=False,
        verbose_name="Mode maintenance",
        help_text="Bloque l'accès à tous les utilisateurs sauf le owner"
    )
    maintenance_message = models.TextField(
        default="Nous effectuons une maintenance. Nous serons de retour bientôt.",
        verbose_name="Message de maintenance"
    )
    
    # Informations générales
    platform_name = models.CharField(
        max_length=255,
        default="SHINOBI GRH",
        verbose_name="Nom de la plateforme"
    )
    platform_url = models.URLField(
        default="https://shinobi-rh.com",
        verbose_name="URL de la plateforme"
    )
    support_email = models.EmailField(
        default="support@shinobi-rh.com",
        verbose_name="Email de support"
    )
    
    # Sécurité
    allow_registration = models.BooleanField(
        default=True,
        verbose_name="Autoriser les inscriptions"
    )
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='config_updates'
    )
    
    class Meta:
        verbose_name = "Configuration Plateforme"
        verbose_name_plural = "Configuration Plateforme"
    
    def save(self, *args, **kwargs):
        # Singleton pattern - s'assurer qu'une seule instance existe
        if not self.pk and PlatformConfig.objects.exists():
            raise ValueError("Une configuration existe déjà. Modifiez l'existante.")
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls):
        """Récupère ou crée la configuration unique."""
        config, created = cls.objects.get_or_create(pk=1)
        return config
    
    def __str__(self):
        return f"Configuration - {self.platform_name}"

