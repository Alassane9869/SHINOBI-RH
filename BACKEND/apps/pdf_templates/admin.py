from django.contrib import admin
from .models import CompanyPDFSettings, PDFTemplate


@admin.register(CompanyPDFSettings)
class CompanyPDFSettingsAdmin(admin.ModelAdmin):
    list_display = ['company', 'primary_color', 'secondary_color', 'font_family']
    list_filter = ['font_family']
    search_fields = ['company__name']
    
    fieldsets = (
        ('Entreprise', {
            'fields': ('company',)
        }),
        ('Branding', {
            'fields': ('logo', 'primary_color', 'secondary_color', 'font_family')
        }),
        ('Pied de page', {
            'fields': ('footer_text',)
        }),
        ('Signature', {
            'fields': ('signature_image', 'signature_name', 'signature_title')
        }),
    )


@admin.register(PDFTemplate)
class PDFTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'company', 'is_active', 'is_default']
    list_filter = ['template_type', 'is_active', 'is_default']
    search_fields = ['name', 'company__name']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('company', 'template_type', 'name')
        }),
        ('Configuration', {
            'fields': ('config', 'is_active', 'is_default')
        }),
    )
