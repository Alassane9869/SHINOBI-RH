from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet

router = DefaultRouter()
router.register(r'', AttendanceViewSet, basename='attendance')

from .views import AttendanceViewSet, export_daily_advanced_view
from .test_view import test_view

urlpatterns = [
    path('test-connection/', test_view, name='test-connection'),
    path('export/daily-advanced/', export_daily_advanced_view, name='attendance-export-daily-advanced'),
    path('', include(router.urls)),
]
