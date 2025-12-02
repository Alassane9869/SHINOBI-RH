import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

print("Testing import of urls_exports...")

try:
    from apps.attendance import urls_exports
    print(f"✓ Import successful")
    print(f"urlpatterns: {urls_exports.urlpatterns}")
    print(f"Number of patterns: {len(urls_exports.urlpatterns)}")
    for pattern in urls_exports.urlpatterns:
        print(f"  - {pattern.pattern} -> {pattern.name}")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
