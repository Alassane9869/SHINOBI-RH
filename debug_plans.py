import os
import django
import sys

# Setup Django environment
sys.path.append('c:\\Censure\\GRH\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import SubscriptionPlan

print("--- PLANS DANS LA BASE DE DONNEES ---")
plans = SubscriptionPlan.objects.all()
for p in plans:
    print(f"ID: {p.id} | Name: {p.name} | Slug: '{p.slug}' | Price: {p.price}")
