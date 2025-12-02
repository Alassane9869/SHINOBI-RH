from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import AttendanceViewSet, WorkScheduleViewSet
from .export_views import DailyExportView, MonthlyExportView

# Router for standard API (CRUD)
router = DefaultRouter()
router.register(r'records', AttendanceViewSet, basename='attendance')
router.register(r'schedules', WorkScheduleViewSet, basename='work-schedule')

urlpatterns = [
    # 1. EXPORT ROUTES (Standard Django Views)
    path('exports/daily/', DailyExportView.as_view(), name='attendance-daily-export'),
    path('exports/monthly/', MonthlyExportView.as_view(), name='attendance-monthly-export'),

    # 2. API ROUTES (DRF)
    path('', include(router.urls)),
]
