import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import Subscription, SubscriptionPlan
from apps.company.models import Company

def check_subscriptions():
    """Vérifie tous les abonnements et leur statut"""
    
    print("=== VÉRIFICATION DES ABONNEMENTS ===\n")
    
    # Tous les abonnements
    all_subs = Subscription.objects.all()
    print(f"Total abonnements: {all_subs.count()}\n")
    
    for sub in all_subs:
        print(f"Abonnement ID: {sub.id}")
        print(f"  Entreprise: {sub.company.name}")
        print(f"  Plan: {sub.plan.name}")
        print(f"  Statut: {sub.status}")
        print(f"  Date début: {sub.start_date}")
        print(f"  Date fin essai: {sub.trial_end_date}")
        print(f"  Prochaine facturation: {sub.next_billing_date}")
        print()
    
    # Toutes les entreprises
    print("\n=== ENTREPRISES ===\n")
    companies = Company.objects.all()
    for company in companies:
        print(f"Entreprise: {company.name}")
        print(f"  Plan: {company.plan}")
        print(f"  Active: {company.is_active}")
        if hasattr(company, 'subscription'):
            print(f"  A un abonnement: Oui (statut: {company.subscription.status})")
        else:
            print(f"  A un abonnement: Non")
        print()
    
    # Si pas d'abonnement, créer un essai pour la première entreprise
    if all_subs.count() == 0 and companies.count() > 0:
        print("\n=== CRÉATION D'UN ABONNEMENT D'ESSAI ===\n")
        company = companies.first()
        
        # Trouver le plan gratuit
        free_plan = SubscriptionPlan.objects.filter(price=0).first()
        
        if free_plan:
            trial_end = datetime.now() + timedelta(days=2)
            subscription = Subscription.objects.create(
                company=company,
                plan=free_plan,
                status='trial',
                start_date=datetime.now(),
                trial_end_date=trial_end,
                next_billing_date=trial_end,
                auto_renew=True
            )
            print(f"✓ Abonnement d'essai créé pour {company.name}")
            print(f"  Plan: {free_plan.name}")
            print(f"  Fin d'essai: {trial_end.strftime('%Y-%m-%d %H:%M')}")
        else:
            print("✗ Aucun plan gratuit trouvé")

if __name__ == '__main__':
    check_subscriptions()
