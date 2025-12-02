import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import Subscription
from apps.company.models import Company

def set_trial_end_dates():
    """Ajoute des dates de fin d'essai pour les abonnements en trial"""
    
    # Récupérer tous les abonnements en trial
    trial_subscriptions = Subscription.objects.filter(status='trial')
    
    print(f"Trouvé {trial_subscriptions.count()} abonnements en trial")
    
    for sub in trial_subscriptions:
        if not sub.trial_end_date:
            # Définir la fin d'essai à 14 jours après la création
            # ou 3 jours dans le futur pour tester le modal
            trial_end = datetime.now() + timedelta(days=2)  # 2 jours pour tester
            sub.trial_end_date = trial_end
            sub.save()
            
            print(f"✓ Abonnement {sub.id} (Entreprise: {sub.company.name})")
            print(f"  Date de fin d'essai: {trial_end.strftime('%Y-%m-%d %H:%M')}")
            print(f"  Temps restant: 2 jours")
        else:
            print(f"✓ Abonnement {sub.id} a déjà une date de fin: {sub.trial_end_date}")
    
    if trial_subscriptions.count() == 0:
        print("\nAucun abonnement en trial trouvé.")
        print("Vérifiez que vous avez créé un compte et choisi le plan gratuit.")

if __name__ == '__main__':
    set_trial_end_dates()
