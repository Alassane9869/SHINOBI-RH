import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import SubscriptionPlan

def check_and_seed_plans():
    plans = SubscriptionPlan.objects.all()
    print(f"Found {plans.count()} plans in database.")
    
    if plans.count() == 0:
        print("Seeding default plans...")
        
        # Free Plan
        SubscriptionPlan.objects.create(
            name="Starter",
            slug="starter",
            description="Pour les petites équipes.",
            price=0,
            currency="XOF",
            period="monthly",
            max_employees=10,
            features={"gestion_basique": True, "support_email": True},
            is_active=True,
            display_order=1
        )
        
        # Pro Plan
        SubscriptionPlan.objects.create(
            name="Pro",
            slug="pro",
            description="Pour les entreprises en croissance.",
            price=30000,
            currency="XOF",
            period="monthly",
            max_employees=50,
            features={"analytics_avances": True, "support_prioritaire": True, "api_access": True},
            is_active=True,
            is_popular=True,
            display_order=2
        )
        
        # Enterprise Plan
        SubscriptionPlan.objects.create(
            name="Enterprise",
            slug="enterprise",
            description="Pour les grandes structures.",
            price=100000, # Placeholder price, displayed as 'Sur devis'
            currency="XOF",
            period="monthly",
            max_employees=None,
            features={"employes_illimites": True, "sla_garanti": True, "account_manager": True, "sso_audit_logs": True},
            is_active=True,
            display_order=3
        )
        
        print("Plans seeded successfully.")
    else:
        for plan in plans:
            print(f"- {plan.name} ({plan.slug}): {plan.price} {plan.currency} (Active: {plan.is_active})")

if __name__ == '__main__':
    check_and_seed_plans()
