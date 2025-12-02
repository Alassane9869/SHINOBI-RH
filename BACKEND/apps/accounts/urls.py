from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserViewSet, MeView, RegisterCompanyView, SaasAdminViewSet, PlatformConfigView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'saas', SaasAdminViewSet, basename='saas')

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register-company/', RegisterCompanyView.as_view(), name='register-company'),
    path('me/', MeView.as_view(), name='user-me'),
    path('platform/config/', PlatformConfigView.as_view(), name='platform-config'),
    path('', include(router.urls)),
]
