import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import get_resolver

def show_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # C'est un include()
            new_prefix = prefix + str(pattern.pattern)
            show_urls(pattern.url_patterns, new_prefix)
        else:
            # C'est une URL finale
            full_path = prefix + str(pattern.pattern)
            if 'export' in full_path.lower() or 'attendance' in full_path.lower():
                print(f"  {full_path}")

print("=" * 60)
print("URLs contenant 'attendance' ou 'export':")
print("=" * 60)

resolver = get_resolver()
show_urls(resolver.url_patterns)
