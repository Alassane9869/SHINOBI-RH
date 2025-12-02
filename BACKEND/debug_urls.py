import os
import django
from django.urls import resolve, reverse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

path = '/api/attendance/records/exports/daily/'
print(f"Testing resolution for: {path}")

try:
    match = resolve(path)
    print(f"✅ Resolved to: {match.func.__name__}")
    print(f"View path: {match._func_path}")
    print(f"URL Name: {match.url_name}")
except Exception as e:
    print(f"❌ Resolution failed: {e}")

print("\nTrying reverse lookup:")
try:
    url = reverse('attendance-daily-export')
    print(f"✅ Reverse 'attendance-daily-export' -> {url}")
except Exception as e:
    print(f"❌ Reverse failed: {e}")
