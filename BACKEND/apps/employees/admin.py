from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'position', 'department', 'company', 'date_hired')
    list_filter = ('company', 'department', 'date_hired')
    search_fields = ('user__first_name', 'user__last_name', 'position')
