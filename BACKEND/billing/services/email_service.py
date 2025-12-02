"""
Service d'envoi d'emails pour les notifications de paiement
Envoie automatiquement un email à l'admin quand un client paie
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from ..models import PaymentConfig


def get_notification_email(provider='stripe'):
    """Récupère l'email de notification configuré dans l'admin"""
    try:
        config = PaymentConfig.objects.get(provider=provider, is_active=True)
        return config.notification_email
    except PaymentConfig.DoesNotExist:
        # Fallback sur l'email par défaut
        return getattr(settings, 'ADMIN_EMAIL', 'admin@shinobir.com')


def send_payment_notification_to_admin(payment):
    """
    Envoie une notification email à l'admin quand un paiement est complété
    AUTO-VALIDÉ : Pas besoin d'action manuelle
    """
    if payment.status != 'completed':
        return False
    
    # Récupérer l'email de notification
    notification_email = get_notification_email(payment.payment_method)
    
    # Préparer les données
    context = {
        'payment': payment,
        'company': payment.subscription.company,
        'plan': payment.subscription.plan,
        'transaction_id': payment.transaction_id,
        'amount': payment.amount,
        'currency': payment.currency,
        'payment_method': payment.get_payment_method_display(),
        'paid_at': payment.paid_at or timezone.now(),
    }
    
    # Sujet de l'email
    subject = f'💰 Nouveau paiement reçu - {payment.amount} {payment.currency} - {payment.subscription.company.name}'
    
    # Corps de l'email (HTML)
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .info-box {{ background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }}
            .amount {{ font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; }}
            .label {{ font-weight: bold; color: #666; }}
            .value {{ color: #333; }}
            .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
            .success {{ background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Paiement Reçu !</h1>
                <p>Un nouveau paiement a été validé automatiquement</p>
            </div>
            <div class="content">
                <div class="success">
                    ✓ Ce paiement a été <strong>validé automatiquement</strong>. Aucune action requise.
                </div>
                
                <div class="amount">
                    {context['amount']} {context['currency']}
                </div>
                
                <div class="info-box">
                    <p><span class="label">Entreprise :</span> <span class="value">{context['company'].name}</span></p>
                    <p><span class="label">Plan :</span> <span class="value">{context['plan'].name}</span></p>
                    <p><span class="label">Méthode :</span> <span class="value">{context['payment_method']}</span></p>
                    <p><span class="label">Transaction ID :</span> <span class="value">{context['transaction_id']}</span></p>
                    <p><span class="label">Date :</span> <span class="value">{context['paid_at'].strftime('%d/%m/%Y à %H:%M')}</span></p>
                </div>
                
                <div class="info-box">
                    <h3>Coordonnées du client</h3>
                    <p><span class="label">Email :</span> <span class="value">{context['company'].email if hasattr(context['company'], 'email') else 'N/A'}</span></p>
                    <p><span class="label">Téléphone :</span> <span class="value">{context['company'].phone if hasattr(context['company'], 'phone') else 'N/A'}</span></p>
                </div>
                
                <div class="footer">
                    <p>Shinobi RH - Système de paiement automatisé</p>
                    <p>Ce message a été généré automatiquement</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Envoyer l'email
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=f"Nouveau paiement reçu: {payment.amount} {payment.currency} de {payment.subscription.company.name}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[notification_email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Erreur envoi email: {e}")
        return False


def send_invoice_email(invoice):
    """Envoie la facture au client par email"""
    subject = f'Votre facture Shinobi RH - {invoice.invoice_number}'
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📄 Votre Facture</h1>
            </div>
            <div class="content">
                <p>Bonjour {invoice.billing_name},</p>
                <p>Merci pour votre paiement ! Vous trouverez ci-joint votre facture.</p>
                <p><strong>Numéro de facture :</strong> {invoice.invoice_number}</p>
                <p><strong>Montant :</strong> {invoice.amount} {invoice.currency}</p>
                <p><strong>Date :</strong> {invoice.issue_date.strftime('%d/%m/%Y')}</p>
                <p>Cordialement,<br>L'équipe Shinobi RH</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=f"Votre facture {invoice.invoice_number}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[invoice.billing_email],
        )
        email.attach_alternative(html_content, "text/html")
        
        # Attacher le PDF si disponible
        if invoice.pdf_file:
            email.attach_file(invoice.pdf_file.path)
        
        email.send()
        invoice.email_sent = True
        invoice.save()
        return True
    except Exception as e:
        print(f"Erreur envoi facture: {e}")
        return False


def send_subscription_renewal_reminder(subscription, days_before=7):
    """Envoie un rappel de renouvellement X jours avant l'échéance"""
    subject = f'Renouvellement de votre abonnement Shinobi RH dans {days_before} jours'
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Rappel de Renouvellement</h1>
            </div>
            <div class="content">
                <p>Bonjour {subscription.company.name},</p>
                <p>Votre abonnement <strong>{subscription.plan.name}</strong> arrive à échéance dans {days_before} jours.</p>
                <p><strong>Date de renouvellement :</strong> {subscription.next_billing_date.strftime('%d/%m/%Y')}</p>
                <p><strong>Montant :</strong> {subscription.plan.price} {subscription.plan.currency}</p>
                <p>Le paiement sera effectué automatiquement avec votre méthode de paiement enregistrée.</p>
                <p>Cordialement,<br>L'équipe Shinobi RH</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=f"Rappel de renouvellement",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[subscription.company.email if hasattr(subscription.company, 'email') else ''],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Erreur envoi rappel: {e}")
        return False
