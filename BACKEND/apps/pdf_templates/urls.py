from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyPDFSettingsViewSet, PDFTemplateViewSet

router = DefaultRouter()
router.register(r'settings', CompanyPDFSettingsViewSet, basename='pdf-settings')
router.register(r'templates', PDFTemplateViewSet, basename='pdf-templates')

urlpatterns = [
    path('', include(router.urls)),
]
