import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

print("Testing import of export views...")
try:
    from apps.attendance.export_views import (
        daily_export_view,
        monthly_export_view,
        weekly_export_view,
        semester_export_view,
        annual_export_view,
        individual_export_view
    )
    print("✓ All export views imported successfully")
    print(f"✓ daily_export_view: {daily_export_view}")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()

print("\nTesting import of Excel generator...")
try:
    from apps.attendance.excel_generators import AttendanceExcelGenerator
    print("✓ AttendanceExcelGenerator imported successfully")
    print(f"✓ AttendanceExcelGenerator: {AttendanceExcelGenerator}")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
