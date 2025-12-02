import os
from pathlib import Path
from decouple import config
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = config('SECRET_KEY', default='django-insecure-secret-key')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',
    'django_filters',
    'cloudinary',

    # Local apps
    'apps.core',
    'apps.company',
    'apps.accounts',
    'apps.employees',
    'apps.attendance',
    'apps.leaves',
    'apps.payroll',
    'apps.documents',
    'apps.dashboard',
    'apps.notifications',
    'apps.pdf_templates',
    'billing',  # Payment & Subscription system
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Whitenoise
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Multi-tenant middlewares
    'apps.core.middleware.TenantMiddleware',
    'apps.core.middleware.CompanyIsolationMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': config('DATABASE_ENGINE', default='django.db.backends.postgresql'),
        'NAME': config('DATABASE_NAME', default='grh_db'),
        'USER': config('DATABASE_USER', default='postgres'),
        'PASSWORD': config('DATABASE_PASSWORD', default='postgres'),
        'HOST': config('DATABASE_HOST', default='localhost'),
        'PORT': config('DATABASE_PORT', default='5432'),
    }
}

if DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
    DATABASES['default']['NAME'] = BASE_DIR / 'db.sqlite3'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.CustomUser'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 10,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

# CORS
CORS_ALLOW_ALL_ORIGINS = True  # For development
CORS_EXPOSE_HEADERS = ['Content-Disposition']

# Cloudinary
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME', default=''),
    api_key=config('CLOUDINARY_API_KEY', default=''),
    api_secret=config('CLOUDINARY_API_SECRET', default=''),
)

# Spectacular (Swagger)
SPECTACULAR_SETTINGS = {
    'TITLE': 'GRH SaaS API',
    'DESCRIPTION': 'API for Multi-tenant HR SaaS',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ============================================================================
# CONFIGURATION CELERY
# ============================================================================

# URL du broker Redis pour Celery
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')

# URL du backend de résultats
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')

# Format de sérialisation accepté
CELERY_ACCEPT_CONTENT = ['json']

# Format de sérialisation des tâches
CELERY_TASK_SERIALIZER = 'json'

# Format de sérialisation des résultats
CELERY_RESULT_SERIALIZER = 'json'

# Fuseau horaire pour Celery
CELERY_TIMEZONE = TIME_ZONE

# Expiration des résultats (24 heures)
CELERY_RESULT_EXPIRES = 86400

# Configuration des tâches
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes max par tâche

# ============================================================================
# CONFIGURATION EXPORTS
# ============================================================================

# Dossier de stockage des fichiers exportés
EXPORT_STORAGE_PATH = MEDIA_ROOT / 'exports'

# Durée de validité des URLs d'export (en heures)
EXPORT_URL_EXPIRATION_HOURS = 24

# Taille max des fichiers d'export (en MB)
EXPORT_MAX_FILE_SIZE_MB = 100

# Template de base pour les PDFs
EXPORT_PDF_BASE_TEMPLATE = 'exports/pdf/base.html'

# Polices par défaut pour les PDFs
EXPORT_PDF_FONTS = {
    'primary': 'Inter',
    'secondary': 'Roboto',
}

# URL de base pour la vérification des QR codes
EXPORT_QR_VERIFICATION_BASE_URL = config(
    'EXPORT_QR_VERIFICATION_BASE_URL',
    default='https://grh.example.com/verify/'
)

# Activer/désactiver les signatures numériques
EXPORT_ENABLE_DIGITAL_SIGNATURE = config('EXPORT_ENABLE_DIGITAL_SIGNATURE', default=False, cast=bool)

# Chemin vers le certificat de signature (si activé)
EXPORT_SIGNATURE_CERTIFICATE_PATH = config('EXPORT_SIGNATURE_CERTIFICATE_PATH', default='')
EXPORT_SIGNATURE_PRIVATE_KEY_PATH = config('EXPORT_SIGNATURE_PRIVATE_KEY_PATH', default='')

