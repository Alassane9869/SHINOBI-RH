import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.urls import get_resolver

resolver = get_resolver()

print("Checking attendance URLs...")
print("="*60)

# Get all URL patterns
def show_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # This is an include()
            show_urls(pattern.url_patterns, prefix + str(pattern.pattern))
        else:
            # This is a regular path
            full_path = prefix + str(pattern.pattern)
            if 'attendance' in full_path:
                print(f"✓ {full_path}")

show_urls(resolver.url_patterns)
