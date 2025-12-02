import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import SubscriptionPlan

def check_plans():
    print("--- Checking Subscription Plans ---")
    plans = SubscriptionPlan.objects.all()
    if not plans:
        print("No plans found!")
        return

    for plan in plans:
        print(f"Plan: {plan.name} (Slug: {plan.slug})")
        print(f"  Price: {plan.price} {plan.currency}")
        print(f"  Max Employees: {plan.max_employees} ({'Unlimited' if plan.max_employees is None else 'Limited'})")
        print(f"  Max Users: {plan.max_users} ({'Unlimited' if plan.max_users is None else 'Limited'})")
        print(f"  Is Active: {plan.is_active}")
        print("-" * 30)

if __name__ == "__main__":
    check_plans()
