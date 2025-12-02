from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import PaymentConfig, SubscriptionPlan, Subscription, Payment, Invoice, PromoCode


@admin.register(PaymentConfig)
class PaymentConfigAdmin(admin.ModelAdmin):
    list_display = ['provider_display', 'status_badge', 'mode_badge', 'notification_email', 'updated_at']
    list_filter = ['provider', 'is_active', 'test_mode']
    search_fields = ['provider', 'notification_email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('provider', 'is_active', 'test_mode')
        }),
        ('Clés API', {
            'fields': ('api_key', 'api_secret', 'webhook_secret'),
            'description': '⚠️ Ces informations sont sensibles. Ne les partagez jamais.'
        }),
        ('Notifications', {
            'fields': ('notification_email',),
            'description': 'Email où vous recevrez les notifications de paiement'
        }),
        ('Configuration avancée', {
            'fields': ('config_json',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def provider_display(self, obj):
        return obj.get_provider_display()
    provider_display.short_description = 'Moyen de paiement'
    
    def status_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Actif</span>')
        return format_html('<span style="color: red;">✗ Inactif</span>')
    status_badge.short_description = 'Statut'
    
    def mode_badge(self, obj):
        if obj.test_mode:
            return format_html('<span style="background: orange; color: white; padding: 3px 8px; border-radius: 3px;">TEST</span>')
        return format_html('<span style="background: green; color: white; padding: 3px 8px; border-radius: 3px;">PRODUCTION</span>')
    mode_badge.short_description = 'Mode'


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_display', 'period', 'max_employees', 'is_active', 'is_popular', 'display_order']
    list_filter = ['period', 'is_active', 'is_popular']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'is_popular', 'display_order']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Tarification', {
            'fields': ('price', 'currency', 'period')
        }),
        ('Limites', {
            'fields': ('max_employees', 'max_users'),
            'description': 'Laisser vide pour illimité'
        }),
        ('Fonctionnalités', {
            'fields': ('features',),
            'description': 'Format JSON: {"analytics": true, "api_access": true, ...}'
        }),
        ('Affichage', {
            'fields': ('is_active', 'is_popular', 'display_order')
        }),
    )
    
    def price_display(self, obj):
        return f"{obj.price} {obj.currency}"
    price_display.short_description = 'Prix'


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['company', 'plan', 'status_badge', 'start_date', 'next_billing_date', 'auto_renew']
    list_filter = ['status', 'plan', 'auto_renew']
    search_fields = ['company__name', 'plan__name']
    readonly_fields = ['created_at', 'updated_at', 'start_date']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Abonnement', {
            'fields': ('company', 'plan', 'status')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'next_billing_date', 'trial_end_date')
        }),
        ('Paiement', {
            'fields': ('auto_renew', 'payment_method', 'stripe_subscription_id')
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'trial': 'blue',
            'active': 'green',
            'past_due': 'orange',
            'cancelled': 'gray',
            'expired': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Statut'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'company_name', 'amount_display', 'payment_method', 'status_badge', 'paid_at', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['transaction_id', 'subscription__company__name']
    readonly_fields = ['created_at', 'updated_at', 'paid_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Paiement', {
            'fields': ('subscription', 'amount', 'currency', 'payment_method', 'status')
        }),
        ('Références', {
            'fields': ('transaction_id', 'invoice')
        }),
        ('Détails', {
            'fields': ('metadata', 'error_message')
        }),
        ('Dates', {
            'fields': ('paid_at', 'created_at', 'updated_at')
        }),
    )
    
    def company_name(self, obj):
        return obj.subscription.company.name
    company_name.short_description = 'Entreprise'
    
    def amount_display(self, obj):
        return f"{obj.amount} {obj.currency}"
    amount_display.short_description = 'Montant'
    
    def status_badge(self, obj):
        colors = {
            'pending': 'gray',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red',
            'refunded': 'orange'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Statut'
    
    actions = ['send_payment_notification']
    
    def send_payment_notification(self, request, queryset):
        from .services.email_service import send_payment_notification_to_admin
        count = 0
        for payment in queryset.filter(status='completed'):
            send_payment_notification_to_admin(payment)
            count += 1
        self.message_user(request, f"{count} notification(s) envoyée(s)")
    send_payment_notification.short_description = "Envoyer notification email"


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'billing_name', 'amount_display', 'issue_date', 'is_paid', 'email_sent', 'download_link']
    list_filter = ['is_paid', 'email_sent', 'issue_date']
    search_fields = ['invoice_number', 'billing_name', 'billing_email']
    readonly_fields = ['invoice_number', 'created_at', 'updated_at', 'issue_date']
    date_hierarchy = 'issue_date'
    
    fieldsets = (
        ('Facture', {
            'fields': ('invoice_number', 'subscription', 'amount', 'currency')
        }),
        ('Informations de facturation', {
            'fields': ('billing_name', 'billing_email', 'billing_address', 'billing_nif')
        }),
        ('Fichier', {
            'fields': ('pdf_file',)
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_date')
        }),
        ('Statut', {
            'fields': ('is_paid', 'email_sent')
        }),
    )
    
    def amount_display(self, obj):
        return f"{obj.amount} {obj.currency}"
    amount_display.short_description = 'Montant'
    
    def download_link(self, obj):
        if obj.pdf_file:
            return format_html('<a href="{}" target="_blank">📄 Télécharger</a>', obj.pdf_file.url)
        return "Pas de PDF"
    download_link.short_description = 'PDF'
    
    actions = ['generate_pdf', 'send_invoice_email']
    
    def generate_pdf(self, request, queryset):
        from .services.invoice_generator import generate_invoice_pdf
        count = 0
        for invoice in queryset:
            generate_invoice_pdf(invoice)
            count += 1
        self.message_user(request, f"{count} facture(s) générée(s)")
    generate_pdf.short_description = "Générer PDF"
    
    def send_invoice_email(self, request, queryset):
        from .services.email_service import send_invoice_email
        count = 0
        for invoice in queryset:
            send_invoice_email(invoice)
            count += 1
        self.message_user(request, f"{count} email(s) envoyé(s)")
    send_invoice_email.short_description = "Envoyer par email"


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_display', 'valid_from', 'valid_until', 'times_used', 'max_uses', 'is_active']
    list_filter = ['is_active', 'discount_type', 'valid_from']
    search_fields = ['code', 'description']
    filter_horizontal = ['applicable_plans']
    list_editable = ['is_active']
    
    fieldsets = (
        ('Code promo', {
            'fields': ('code', 'description', 'is_active')
        }),
        ('Réduction', {
            'fields': ('discount_type', 'discount_value')
        }),
        ('Validité', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Limites', {
            'fields': ('max_uses', 'times_used', 'applicable_plans')
        }),
    )
    
    def discount_display(self, obj):
        if obj.discount_type == 'percentage':
            return f"-{obj.discount_value}%"
        return f"-{obj.discount_value} XOF"
    discount_display.short_description = 'Réduction'
