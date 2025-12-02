from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class PaymentConfig(models.Model):
    """
    Configuration des clés API de paiement (modifiable dans l'admin)
    Permet de changer les clés sans toucher au code
    """
    PROVIDER_CHOICES = [
        ('stripe', 'Stripe (Mastercard/Visa)'),
        ('orange_money', 'Orange Money Mali'),
        ('moov_money', 'Moov Money Mali'),
        ('wave', 'Wave'),
    ]
    
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, unique=True)
    is_active = models.BooleanField(default=True, help_text="Activer/désactiver ce moyen de paiement")
    
    # Clés API (cryptées en production)
    api_key = models.CharField(max_length=500, blank=True, help_text="Clé API publique ou ID marchand")
    api_secret = models.CharField(max_length=500, blank=True, help_text="Clé API secrète")
    webhook_secret = models.CharField(max_length=500, blank=True, help_text="Secret pour valider les webhooks")
    
    # Configuration spécifique
    test_mode = models.BooleanField(default=True, help_text="Mode test (sandbox)")
    config_json = models.JSONField(default=dict, blank=True, help_text="Configuration additionnelle")
    
    # Email de notification
    notification_email = models.EmailField(help_text="Email pour recevoir les notifications de paiement")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Configuration de Paiement"
        verbose_name_plural = "Configurations de Paiement"
        ordering = ['provider']
    
    def __str__(self):
        status = "✓ Actif" if self.is_active else "✗ Inactif"
        mode = "(Test)" if self.test_mode else "(Production)"
        return f"{self.get_provider_display()} {status} {mode}"


class SubscriptionPlan(models.Model):
    """Plans d'abonnement (Starter, Pro, Enterprise)"""
    PERIOD_CHOICES = [
        ('monthly', 'Mensuel'),
        ('yearly', 'Annuel'),
    ]
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    # Tarification
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    currency = models.CharField(max_length=3, default='XOF', help_text="Code devise (XOF=FCFA, EUR, USD)")
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='monthly')
    
    # Limites
    max_employees = models.IntegerField(null=True, blank=True, help_text="Nombre max d'employés (null = illimité)")
    max_users = models.IntegerField(null=True, blank=True, help_text="Nombre max d'utilisateurs (null = illimité)")
    
    # Fonctionnalités (JSON)
    features = models.JSONField(default=dict, help_text="Liste des fonctionnalités incluses")
    
    # Statut
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False, help_text="Badge 'Populaire'")
    
    # Ordre d'affichage
    display_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plan d'Abonnement"
        verbose_name_plural = "Plans d'Abonnement"
        ordering = ['display_order', 'price']
    
    def __str__(self):
        return f"{self.name} - {self.price} {self.currency}/{self.get_period_display()}"


class Subscription(models.Model):
    """Abonnement actif d'une entreprise"""
    STATUS_CHOICES = [
        ('trial', 'Essai gratuit'),
        ('active', 'Actif'),
        ('past_due', 'Paiement en retard'),
        ('cancelled', 'Annulé'),
        ('expired', 'Expiré'),
    ]
    
    company = models.OneToOneField('company.Company', on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    
    # Dates
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    trial_end_date = models.DateTimeField(null=True, blank=True)
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trial')
    
    # Paiement
    auto_renew = models.BooleanField(default=True)
    payment_method = models.CharField(max_length=50, blank=True, help_text="Méthode de paiement par défaut")
    
    # Références externes
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Abonnement"
        verbose_name_plural = "Abonnements"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company.name} - {self.plan.name} ({self.get_status_display()})"
    
    def is_active(self):
        return self.status in ['trial', 'active']


class Payment(models.Model):
    """Historique des paiements"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('refunded', 'Remboursé'),
    ]
    
    METHOD_CHOICES = [
        ('stripe', 'Carte bancaire (Stripe)'),
        ('orange_money', 'Orange Money Mali'),
        ('moov_money', 'Moov Money Mali'),
        ('wave', 'Wave'),
        ('bank_transfer', 'Virement bancaire'),
    ]
    
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='payments')
    
    # Montant
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='XOF')
    
    # Méthode et statut
    payment_method = models.CharField(max_length=50, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Références
    transaction_id = models.CharField(max_length=255, unique=True, help_text="ID de transaction externe")
    invoice = models.OneToOneField('Invoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment')
    
    # Métadonnées
    metadata = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    
    # Dates
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subscription.company.name} - {self.amount} {self.currency} ({self.get_status_display()})"


class Invoice(models.Model):
    """Factures/Reçus générés automatiquement"""
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='invoices')
    
    # Numérotation unique
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    
    # Montant
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='XOF')
    
    # Détails de facturation
    billing_name = models.CharField(max_length=255)
    billing_email = models.EmailField()
    billing_address = models.TextField(blank=True)
    billing_nif = models.CharField(max_length=100, blank=True, verbose_name="NIF")
    
    # Fichier PDF
    pdf_file = models.FileField(upload_to='invoices/%Y/%m/', blank=True)
    
    # Dates
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    
    # Statut
    is_paid = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Facture {self.invoice_number} - {self.billing_name}"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Générer numéro unique: INV-2024-0001
            from django.utils import timezone
            year = timezone.now().year
            last_invoice = Invoice.objects.filter(
                invoice_number__startswith=f'INV-{year}-'
            ).order_by('-invoice_number').first()
            
            if last_invoice:
                last_num = int(last_invoice.invoice_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.invoice_number = f'INV-{year}-{new_num:04d}'
        
        super().save(*args, **kwargs)


class PromoCode(models.Model):
    """Codes promotionnels"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Pourcentage'),
        ('fixed', 'Montant fixe'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Réduction
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Validité
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Limites
    max_uses = models.IntegerField(null=True, blank=True, help_text="Nombre max d'utilisations (null = illimité)")
    times_used = models.IntegerField(default=0)
    
    # Plans applicables
    applicable_plans = models.ManyToManyField(SubscriptionPlan, blank=True, help_text="Laisser vide pour tous les plans")
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Code Promo"
        verbose_name_plural = "Codes Promo"
        ordering = ['-created_at']
    
    def __str__(self):
        if self.discount_type == 'percentage':
            return f"{self.code} (-{self.discount_value}%)"
        return f"{self.code} (-{self.discount_value} {self.applicable_plans.first().currency if self.applicable_plans.exists() else 'XOF'})"
    
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_until:
            return False
        if self.max_uses and self.times_used >= self.max_uses:
            return False
        return True
