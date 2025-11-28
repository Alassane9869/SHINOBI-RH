from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static
from apps.core.api_index import APIIndexView

urlpatterns = [
    path('', APIIndexView.as_view(), name='api-index'),  # Page d'accueil
    path('admin/', admin.site.urls),
    path('api/company/', include('apps.company.urls')),
    path('api/', include('apps.accounts.urls')),
    path('api/employees/', include('apps.employees.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/leaves/', include('apps.leaves.urls')),
    path('api/payroll/', include('apps.payroll.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/dashboard/', include('apps.core.urls')),
    
    # Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    # Force reload
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
