import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from billing.models import Subscription

def convert_to_trial():
    """Convertit les abonnements actifs en trial pour tester le compte à rebours"""
    
    # Récupérer tous les abonnements actifs
    active_subs = Subscription.objects.filter(status='active')
    
    print(f"Trouvé {active_subs.count()} abonnements actifs\n")
    
    for sub in active_subs:
        # Définir la fin d'essai à 2 jours dans le futur
        trial_end = datetime.now() + timedelta(days=2, hours=5)
        
        sub.status = 'trial'
        sub.trial_end_date = trial_end
        sub.next_billing_date = trial_end
        sub.save()
        
        print(f"✓ Abonnement {sub.id} converti en trial")
        print(f"  Entreprise: {sub.company.name}")
        print(f"  Plan: {sub.plan.name}")
        print(f"  Fin d'essai: {trial_end.strftime('%Y-%m-%d %H:%M')}")
        print(f"  Temps restant: ~2 jours\n")
    
    if active_subs.count() > 0:
        print(f"\n✓ {active_subs.count()} abonnement(s) converti(s) en trial")
        print("\nReconnectez-vous pour voir le compte à rebours dans la Navbar !")
    else:
        print("Aucun abonnement actif trouvé à convertir")

if __name__ == '__main__':
    convert_to_trial()
