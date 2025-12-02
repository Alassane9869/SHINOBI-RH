"""
Service Stripe pour paiements par carte bancaire (Mastercard/Visa)
Gestion automatique des paiements et webhooks
"""
import stripe
from django.conf import settings
from django.utils import timezone
from ..models import PaymentConfig, Payment, Invoice
from .email_service import send_payment_notification_to_admin, send_invoice_email


def get_stripe_config():
    """Récupère la configuration Stripe depuis l'admin (pas hardcodé)"""
    try:
        config = PaymentConfig.objects.get(provider='stripe', is_active=True)
        return {
            'api_key': config.api_secret if not config.test_mode else config.api_key,
            'webhook_secret': config.webhook_secret,
            'test_mode': config.test_mode
        }
    except PaymentConfig.DoesNotExist:
        raise Exception("Configuration Stripe non trouvée dans l'admin. Veuillez la configurer.")


def init_stripe():
    """Initialise Stripe avec les clés de l'admin"""
    config = get_stripe_config()
    stripe.api_key = config['api_key']
    return config


def create_payment_intent(subscription, amount, currency='xof'):
    """
    Crée un PaymentIntent Stripe pour un paiement
    Retourne le client_secret pour le frontend
    """
    config = init_stripe()
    
    try:
        # Créer le PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe utilise les centimes
            currency=currency.lower(),
            metadata={
                'subscription_id': subscription.id,
                'company_name': subscription.company.name,
                'plan_name': subscription.plan.name,
            },
            description=f"Abonnement {subscription.plan.name} - {subscription.company.name}",
            automatic_payment_methods={'enabled': True},
        )
        
        # Créer l'enregistrement de paiement
        payment = Payment.objects.create(
            subscription=subscription,
            amount=amount,
            currency=currency.upper(),
            payment_method='stripe',
            status='pending',
            transaction_id=intent.id,
            metadata={'stripe_intent_id': intent.id}
        )
        
        return {
            'client_secret': intent.client_secret,
            'payment_id': payment.id,
            'intent_id': intent.id
        }
    
    except stripe.error.StripeError as e:
        raise Exception(f"Erreur Stripe: {str(e)}")


def handle_payment_success(payment_intent_id):
    """
    Gère le succès d'un paiement Stripe
    AUTO-VALIDATION : Pas besoin d'action manuelle
    """
    try:
        # Récupérer le paiement
        payment = Payment.objects.get(transaction_id=payment_intent_id)
        
        # Mettre à jour le statut
        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save()
        
        # Mettre à jour l'abonnement
        subscription = payment.subscription
        subscription.status = 'active'
        subscription.save()
        
        # Générer la facture
        from .invoice_generator import generate_invoice_pdf
        invoice = Invoice.objects.create(
            subscription=subscription,
            amount=payment.amount,
            currency=payment.currency,
            billing_name=subscription.company.name,
            billing_email=subscription.company.email if hasattr(subscription.company, 'email') else '',
            billing_address=subscription.company.address if hasattr(subscription.company, 'address') else '',
            is_paid=True,
            paid_date=timezone.now()
        )
        payment.invoice = invoice
        payment.save()
        
        # Générer le PDF
        generate_invoice_pdf(invoice)
        
        # Envoyer la facture au client
        send_invoice_email(invoice)
        
        # IMPORTANT: Envoyer notification à l'admin
        send_payment_notification_to_admin(payment)
        
        return True
    
    except Payment.DoesNotExist:
        print(f"Paiement non trouvé: {payment_intent_id}")
        return False
    except Exception as e:
        print(f"Erreur traitement paiement: {e}")
        return False


def handle_stripe_webhook(payload, sig_header):
    """
    Traite les webhooks Stripe
    Validation automatique des paiements
    """
    config = get_stripe_config()
    webhook_secret = config['webhook_secret']
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return {'error': 'Invalid payload'}, 400
    except stripe.error.SignatureVerificationError:
        return {'error': 'Invalid signature'}, 400
    
    # Gérer les événements
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_payment_success(payment_intent['id'])
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        try:
            payment = Payment.objects.get(transaction_id=payment_intent['id'])
            payment.status = 'failed'
            payment.error_message = payment_intent.get('last_payment_error', {}).get('message', 'Paiement échoué')
            payment.save()
        except Payment.DoesNotExist:
            pass
    
    return {'status': 'success'}, 200


def create_stripe_customer(company):
    """Crée un client Stripe pour une entreprise"""
    config = init_stripe()
    
    try:
        customer = stripe.Customer.create(
            name=company.name,
            email=company.email if hasattr(company, 'email') else '',
            metadata={'company_id': company.id}
        )
        return customer.id
    except stripe.error.StripeError as e:
        raise Exception(f"Erreur création client Stripe: {str(e)}")


def create_subscription_stripe(subscription, payment_method_id):
    """Crée un abonnement récurrent Stripe"""
    config = init_stripe()
    
    try:
        # Créer ou récupérer le client Stripe
        if not hasattr(subscription.company, 'stripe_customer_id'):
            customer_id = create_stripe_customer(subscription.company)
        else:
            customer_id = subscription.company.stripe_customer_id
        
        # Attacher la méthode de paiement
        stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id,
        )
        
        # Définir comme méthode par défaut
        stripe.Customer.modify(
            customer_id,
            invoice_settings={'default_payment_method': payment_method_id},
        )
        
        # Créer l'abonnement
        stripe_subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{
                'price_data': {
                    'currency': subscription.plan.currency.lower(),
                    'product_data': {
                        'name': subscription.plan.name,
                    },
                    'unit_amount': int(subscription.plan.price * 100),
                    'recurring': {
                        'interval': 'month' if subscription.plan.period == 'monthly' else 'year',
                    },
                },
            }],
            metadata={
                'subscription_id': subscription.id,
                'company_id': subscription.company.id,
            },
        )
        
        # Sauvegarder l'ID Stripe
        subscription.stripe_subscription_id = stripe_subscription.id
        subscription.save()
        
        return stripe_subscription
    
    except stripe.error.StripeError as e:
        raise Exception(f"Erreur création abonnement Stripe: {str(e)}")
