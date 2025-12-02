import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.attendance.urls import urlpatterns
from django.urls.resolvers import URLPattern, URLResolver

print("Inspecting urlpatterns for apps.attendance.urls:")
for p in urlpatterns:
    if isinstance(p, URLPattern):
        print(f"  Pattern: {p.pattern}")
    elif isinstance(p, URLResolver):
        print(f"  Resolver: {p.pattern}")
        for sp in p.url_patterns:
            print(f"    Sub-pattern: {sp.pattern}")
