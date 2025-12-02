import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import get_resolver

print("=" * 70)
print("TOUTES LES URLS DJANGO")
print("=" * 70)

resolver = get_resolver()

def show_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # C'est un include
            new_prefix = prefix + str(pattern.pattern)
            show_urls(pattern.url_patterns, new_prefix)
        else:
            # C'est une route finale
            full_pattern = prefix + str(pattern.pattern)
            if 'attendance' in full_pattern or 'export' in full_pattern:
                print(f"  {full_pattern}")

show_urls(resolver.url_patterns)

print("\n" + "=" * 70)
print("TEST DE RÉSOLUTION")
print("=" * 70)

from django.urls import resolve

test_paths = [
    '/api/attendance/exports/daily/',
    '/api/attendance/records/',
    '/api/attendance/records/exports/daily/',
]

for path in test_paths:
    try:
        match = resolve(path)
        print(f"✓ {path}")
        print(f"  -> {match.func.__name__}")
    except Exception as e:
        print(f"✗ {path}")
        print(f"  -> {str(e)}")
