from django.contrib import admin
from .models import Leave

@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status', 'company')
    list_filter = ('status', 'leave_type', 'company', 'start_date')
    search_fields = ('employee__user__first_name', 'employee__user__last_name')
    actions = ['approve_leaves', 'reject_leaves']
    
    def approve_leaves(self, request, queryset):
        queryset.update(status='approved')
    approve_leaves.short_description = "Approuver les congés sélectionnés"
    
    def reject_leaves(self, request, queryset):
        queryset.update(status='rejected')
    reject_leaves.short_description = "Rejeter les congés sélectionnés"
