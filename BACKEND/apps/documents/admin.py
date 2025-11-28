from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('document_type', 'employee', 'company', 'created_at')
    list_filter = ('document_type', 'company', 'created_at')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'description')
