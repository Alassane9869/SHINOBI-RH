import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

try:
    from apps.attendance.export_views import daily_export_view
    print("✓ Import successful")
    print(f"View function: {daily_export_view}")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
