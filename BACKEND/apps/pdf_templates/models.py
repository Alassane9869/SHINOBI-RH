from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company


class CompanyPDFSettings(BaseModel):
    """
    Configuration PDF personnalisée par entreprise.
    """
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='pdf_settings',
        verbose_name='Entreprise'
    )
    
    # Logo
    logo = models.ImageField(
        upload_to='company_logos/',
        null=True,
        blank=True,
        verbose_name='Logo'
    )
    
    # Couleurs (format hex)
    primary_color = models.CharField(
        max_length=7,
        default='#6366f1',
        help_text='Couleur primaire (hex)',
        verbose_name='Couleur primaire'
    )
    secondary_color = models.CharField(
        max_length=7,
        default='#22d3ee',
        help_text='Couleur secondaire (hex)',
        verbose_name='Couleur secondaire'
    )
    
    # Police
    font_family = models.CharField(
        max_length=50,
        default='Helvetica',
        choices=[
            ('Helvetica', 'Helvetica'),
            ('Times-Roman', 'Times New Roman'),
            ('Courier', 'Courier'),
        ],
        verbose_name='Police de caractères'
    )
    
    # Footer personnalisé
    footer_text = models.TextField(
        blank=True,
        null=True,
        help_text='Texte du pied de page',
        verbose_name='Pied de page'
    )
    
    # Signature
    signature_image = models.ImageField(
        upload_to='signatures/',
        null=True,
        blank=True,
        verbose_name='Signature numérique'
    )
    signature_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Nom du signataire'
    )
    signature_title = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Titre du signataire'
    )
    
    class Meta:
        verbose_name = 'Configuration PDF'
        verbose_name_plural = 'Configurations PDF'
    
    def __str__(self):
        return f"Config PDF - {self.company.name}"


class PDFTemplate(BaseModel):
    """
    Template PDF personnalisable.
    """
    TEMPLATE_TYPES = [
        ('payslip', 'Bulletin de paie'),
        ('work_certificate', 'Attestation de travail'),
        ('salary_certificate', 'Attestation de salaire'),
        ('cnss_certificate', 'Certificat CNSS'),
        ('work_contract', 'Contrat de travail'),
        ('termination_letter', 'Lettre de licenciement'),
        ('transfer_letter', 'Lettre de mutation'),
        ('daily_attendance', 'Rapport de présence quotidien'),
        ('monthly_attendance', 'Rapport de présence mensuel'),
        ('employee_file', 'Dossier employé'),
        ('payroll_journal', 'Journal de paie'),
    ]
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='pdf_templates',
        verbose_name='Entreprise'
    )
    
    template_type = models.CharField(
        max_length=50,
        choices=TEMPLATE_TYPES,
        verbose_name='Type de document'
    )
    
    name = models.CharField(
        max_length=100,
        verbose_name='Nom du template'
    )
    
    # Configuration JSON pour personnalisation avancée
    config = models.JSONField(
        default=dict,
        blank=True,
        help_text='Configuration JSON (marges, espacements, sections)',
        verbose_name='Configuration'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name='Template par défaut'
    )
    
    class Meta:
        verbose_name = 'Template PDF'
        verbose_name_plural = 'Templates PDF'
        unique_together = ['company', 'template_type', 'name']
    
    def __str__(self):
        return f"{self.get_template_type_display()} - {self.name}"
