from django.contrib import admin
from .models import Payroll

@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'net_salary', 'is_paid', 'company')
    list_filter = ('is_paid', 'company', 'year', 'month')
    search_fields = ('employee__user__first_name', 'employee__user__last_name')
    readonly_fields = ('net_salary',)
