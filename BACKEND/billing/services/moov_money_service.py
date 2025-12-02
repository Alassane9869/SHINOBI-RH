"""
Service Moov Money pour paiements mobile money Mali
Configuration via l'admin Django
"""
import requests
import json
from django.utils import timezone
from ..models import PaymentConfig, Payment
from .email_service import send_payment_notification_to_admin


def get_moov_money_config():
    """Récupère la configuration Moov Money depuis l'admin"""
    try:
        config = PaymentConfig.objects.get(provider='moov_money', is_active=True)
        return {
            'merchant_id': config.api_key,
            'api_secret': config.api_secret,
            'api_url': config.config_json.get('api_url', 'https://api.moov-africa.ml/'),
            'test_mode': config.test_mode
        }
    except PaymentConfig.DoesNotExist:
        raise Exception("Configuration Moov Money non trouvée dans l'admin.")


def initiate_moov_money_payment(subscription, amount, phone_number, currency='XOF'):
    """
    Initie un paiement Moov Money
    Retourne l'URL de paiement ou le code de transaction
    """
    config = get_moov_money_config()
    
    # Créer l'enregistrement de paiement
    payment = Payment.objects.create(
        subscription=subscription,
        amount=amount,
        currency=currency,
        payment_method='moov_money',
        status='pending',
        transaction_id=f'MOOV-{timezone.now().timestamp()}',
        metadata={'phone_number': phone_number}
    )
    
    try:
        # Préparer la requête API Moov Money
        payload = {
            'merchant_id': config['merchant_id'],
            'amount': int(amount),
            'currency': currency,
            'phone_number': phone_number,
            'reference': f'SUB-{subscription.id}',
            'callback_url': f'{settings.BACKEND_URL}/api/billing/webhooks/moov/',
        }
        
        # Appel API (à adapter selon la vraie API Moov Money Mali)
        if config['test_mode']:
            # Mode test: simulation
            return {
                'payment_id': payment.id,
                'payment_url': f'/payment/moov-money/{payment.id}',
                'transaction_id': payment.transaction_id,
                'status': 'pending',
                'message': 'Paiement initié (mode test)'
            }
        else:
            # Mode production: vraie API
            response = requests.post(
                f"{config['api_url']}v1/payment/init",
                json=payload,
                headers={'Authorization': f'Bearer {config["api_secret"]}'}
            )
            
            if response.status_code == 200:
                data = response.json()
                payment.metadata['moov_payment_token'] = data.get('payment_token')
                payment.save()
                
                return {
                    'payment_id': payment.id,
                    'payment_url': data.get('payment_url'),
                    'transaction_id': payment.transaction_id,
                    'status': 'pending'
                }
            else:
                payment.status = 'failed'
                payment.error_message = f"Erreur API Moov Money: {response.text}"
                payment.save()
                raise Exception(payment.error_message)
    
    except Exception as e:
        payment.status = 'failed'
        payment.error_message = str(e)
        payment.save()
        raise


def handle_moov_money_callback(transaction_id, status, reference=None):
    """
    Gère le callback Moov Money
    AUTO-VALIDATION du paiement
    """
    try:
        payment = Payment.objects.get(transaction_id=transaction_id)
        
        if status == 'SUCCESS' or status == 'SUCCESSFUL':
            # Paiement réussi
            payment.status = 'completed'
            payment.paid_at = timezone.now()
            payment.save()
            
            # Mettre à jour l'abonnement
            subscription = payment.subscription
            subscription.status = 'active'
            subscription.save()
            
            # Générer la facture
            from .invoice_generator import generate_invoice_pdf
            from ..models import Invoice
            
            invoice = Invoice.objects.create(
                subscription=subscription,
                amount=payment.amount,
                currency=payment.currency,
                billing_name=subscription.company.name,
                billing_email=subscription.company.email if hasattr(subscription.company, 'email') else '',
                is_paid=True,
                paid_date=timezone.now()
            )
            payment.invoice = invoice
            payment.save()
            
            generate_invoice_pdf(invoice)
            
            # Envoyer notification à l'admin
            send_payment_notification_to_admin(payment)
            
            return True
        
        elif status == 'FAILED' or status == 'CANCELLED':
            payment.status = 'failed'
            payment.error_message = f"Paiement {status.lower()}"
            payment.save()
            return False
        
        else:
            # Statut inconnu, garder en pending
            payment.metadata['last_status'] = status
            payment.save()
            return None
    
    except Payment.DoesNotExist:
        print(f"Paiement Moov Money non trouvé: {transaction_id}")
        return False


def check_moov_money_status(payment_id):
    """Vérifie le statut d'un paiement Moov Money"""
    config = get_moov_money_config()
    
    try:
        payment = Payment.objects.get(id=payment_id)
        
        if config['test_mode']:
            # Mode test: retourner un statut simulé
            return {
                'status': payment.status,
                'transaction_id': payment.transaction_id,
                'amount': float(payment.amount),
                'currency': payment.currency
            }
        
        # Mode production: appeler l'API Moov Money
        response = requests.get(
            f"{config['api_url']}v1/payment/status/{payment.transaction_id}",
            headers={'Authorization': f'Bearer {config["api_secret"]}'}
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'status': data.get('status'),
                'transaction_id': payment.transaction_id,
                'amount': data.get('amount'),
                'currency': data.get('currency')
            }
        
        return {'status': 'unknown'}
    
    except Payment.DoesNotExist:
        return {'status': 'not_found'}
