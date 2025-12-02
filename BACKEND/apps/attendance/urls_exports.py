from django.urls import path
from .export_views import (
    daily_export_view, 
    monthly_export_view,
    weekly_export_view,
    semester_export_view,
    annual_export_view,
    individual_export_view
)

urlpatterns = [
    path('daily/', daily_export_view, name='attendance-daily-export'),
    path('monthly/', monthly_export_view, name='attendance-monthly-export'),
    path('weekly/', weekly_export_view, name='attendance-weekly-export'),
    path('semester/', semester_export_view, name='attendance-semester-export'),
    path('annual/', annual_export_view, name='attendance-annual-export'),
    path('individual/', individual_export_view, name='attendance-individual-export'),
]
