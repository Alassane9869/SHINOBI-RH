from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CompanyRegistrationView, CompanyViewSet

router = DefaultRouter()
router.register(r'', CompanyViewSet, basename='company')

urlpatterns = [
    path('register/', CompanyRegistrationView.as_view(), name='company-register'),
] + router.urls
