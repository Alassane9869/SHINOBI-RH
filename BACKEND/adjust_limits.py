"""
Script pour ajuster les limites des plans d'abonnement.
Usage: python adjust_limits.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import SubscriptionPlan

def set_unlimited():
    """Rendre tous les plans illimités"""
    SubscriptionPlan.objects.all().update(max_employees=None, max_users=None)
    print("✅ Tous les plans sont maintenant illimités")
    display_current_limits()

def set_default_limits():
    """Restaurer les limites par défaut"""
    plans = {
        'starter': {'max_employees': 10, 'max_users': 5},
        'pro': {'max_employees': 50, 'max_users': 20},
        'enterprise': {'max_employees': None, 'max_users': None}
    }
    
    for slug, limits in plans.items():
        SubscriptionPlan.objects.filter(slug=slug).update(**limits)
    
    print("✅ Limites par défaut restaurées")
    display_current_limits()

def set_custom_limits(plan_slug, max_employees=None, max_users=None):
    """Définir des limites personnalisées pour un plan spécifique"""
    try:
        plan = SubscriptionPlan.objects.get(slug=plan_slug)
        plan.max_employees = max_employees
        plan.max_users = max_users
        plan.save()
        print(f"✅ Limites mises à jour pour {plan.name}")
        print(f"   - max_employees: {max_employees or 'illimité'}")
        print(f"   - max_users: {max_users or 'illimité'}")
    except SubscriptionPlan.DoesNotExist:
        print(f"❌ Plan '{plan_slug}' introuvable")

def display_current_limits():
    """Afficher les limites actuelles de tous les plans"""
    print("\n📊 Limites actuelles:")
    for plan in SubscriptionPlan.objects.all().order_by('display_order'):
        emp = plan.max_employees or '∞'
        users = plan.max_users or '∞'
        print(f"   {plan.name:15} - Employés: {str(emp):5} | Utilisateurs: {str(users):5}")

if __name__ == '__main__':
    print("=" * 60)
    print("🔧 Gestion des limites d'abonnement")
    print("=" * 60)
    
    print("\nOptions disponibles:")
    print("1. Rendre tous les plans illimités")
    print("2. Restaurer les limites par défaut")
    print("3. Définir des limites personnalisées")
    print("4. Afficher les limites actuelles")
    print("5. Quitter")
    
    choice = input("\nVotre choix (1-5): ").strip()
    
    if choice == '1':
        set_unlimited()
    elif choice == '2':
        set_default_limits()
    elif choice == '3':
        plan_slug = input("Slug du plan (starter/pro/enterprise): ").strip()
        max_emp = input("Max employés (vide pour illimité): ").strip()
        max_usr = input("Max utilisateurs (vide pour illimité): ").strip()
        
        max_emp = int(max_emp) if max_emp else None
        max_usr = int(max_usr) if max_usr else None
        
        set_custom_limits(plan_slug, max_emp, max_usr)
    elif choice == '4':
        display_current_limits()
    else:
        print("Au revoir!")
