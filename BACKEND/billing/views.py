from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from .models import SubscriptionPlan, Subscription, Payment, Invoice, PromoCode
from .serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer,
    PaymentSerializer, InvoiceSerializer
)
from .services.stripe_service import create_payment_intent, handle_stripe_webhook
from .services.orange_money_service import initiate_orange_money_payment, handle_orange_money_callback
from .services.moov_money_service import initiate_moov_money_payment, handle_moov_money_callback


@api_view(['GET'])
def get_plans(request):
    """Liste des plans d'abonnement actifs"""
    plans = SubscriptionPlan.objects.filter(is_active=True).order_by('display_order', 'price')
    serializer = SubscriptionPlanSerializer(plans, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_subscription(request):
    """Récupère l'abonnement actuel de l'entreprise"""
    try:
        subscription = Subscription.objects.get(company=request.user.company)
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
    except Subscription.DoesNotExist:
        return Response({'detail': 'Aucun abonnement trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_payment(request):
    """Crée un PaymentIntent Stripe"""
    try:
        subscription_id = request.data.get('subscription_id')
        amount = request.data.get('amount')
        
        subscription = Subscription.objects.get(id=subscription_id, company=request.user.company)
        result = create_payment_intent(subscription, amount)
        
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_orange_money_payment(request):
    """Initie un paiement Orange Money"""
    try:
        subscription_id = request.data.get('subscription_id')
        amount = request.data.get('amount')
        phone_number = request.data.get('phone_number')
        
        subscription = Subscription.objects.get(id=subscription_id, company=request.user.company)
        result = initiate_orange_money_payment(subscription, amount, phone_number)
        
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_moov_money_payment(request):
    """Initie un paiement Moov Money"""
    try:
        subscription_id = request.data.get('subscription_id')
        amount = request.data.get('amount')
        phone_number = request.data.get('phone_number')
        
        subscription = Subscription.objects.get(id=subscription_id, company=request.user.company)
        result = initiate_moov_money_payment(subscription, amount, phone_number)
        
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)


@api_view(['POST'])
def stripe_webhook(request):
    """Webhook Stripe pour validation automatique"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    result, status_code = handle_stripe_webhook(payload, sig_header)
    return Response(result, status=status_code)


@api_view(['POST'])
def orange_money_webhook(request):
    """Webhook Orange Money pour validation automatique"""
    transaction_id = request.data.get('transaction_id')
    status_value = request.data.get('status')
    
    success = handle_orange_money_callback(transaction_id, status_value)
    
    if success:
        return Response({'status': 'success'})
    return Response({'status': 'failed'}, status=400)


@api_view(['POST'])
def moov_money_webhook(request):
    """Webhook Moov Money pour validation automatique"""
    transaction_id = request.data.get('transaction_id')
    status_value = request.data.get('status')
    
    success = handle_moov_money_callback(transaction_id, status_value)
    
    if success:
        return Response({'status': 'success'})
    return Response({'status': 'failed'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_history(request):
    """Historique des paiements"""
    payments = Payment.objects.filter(
        subscription__company=request.user.company
    ).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoices(request):
    """Liste des factures"""
    invoices = Invoice.objects.filter(
        subscription__company=request.user.company
    ).order_by('-created_at')
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, invoice_id):
    """Télécharge une facture PDF"""
    try:
        invoice = Invoice.objects.get(
            id=invoice_id,
            subscription__company=request.user.company
        )
        if invoice.pdf_file:
            return FileResponse(invoice.pdf_file.open('rb'), content_type='application/pdf')
        return Response({'detail': 'PDF non disponible'}, status=404)
    except Invoice.DoesNotExist:
        return Response({'detail': 'Facture non trouvée'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_promo_code(request):
    """Applique un code promo"""
    code = request.data.get('code')
    plan_id = request.data.get('plan_id')
    
    try:
        promo = PromoCode.objects.get(code=code, is_active=True)
        
        if not promo.is_valid():
            return Response({'detail': 'Code promo expiré ou invalide'}, status=400)
        
        plan = SubscriptionPlan.objects.get(id=plan_id)
        
        # Vérifier si le code est applicable au plan
        if promo.applicable_plans.exists() and plan not in promo.applicable_plans.all():
            return Response({'detail': 'Code promo non applicable à ce plan'}, status=400)
        
        # Calculer la réduction
        if promo.discount_type == 'percentage':
            discount_amount = (plan.price * promo.discount_value) / 100
        else:
            discount_amount = promo.discount_value
        
        return Response({
            'discount_amount': discount_amount,
            'discount_type': promo.discount_type,
            'discount_value': promo.discount_value
        })
    
    except PromoCode.DoesNotExist:
        return Response({'detail': 'Code promo invalide'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_free(request):
    """Souscription à un plan gratuit"""
    try:
        plan_id = request.data.get('plan_id')
        plan = SubscriptionPlan.objects.get(id=plan_id)
        
        if plan.price > 0:
            return Response({'detail': 'Ce plan n\'est pas gratuit'}, status=400)
            
        # Créer ou mettre à jour l'abonnement
        from django.utils import timezone
        from datetime import timedelta
        
        # Calculer la date de fin (1 mois par défaut pour gratuit)
        start_date = timezone.now()
        end_date = start_date + timedelta(days=30) # 1 mois fixe pour le plan gratuit comme demandé
        
        # Vérifier s'il y a déjà un abonnement
        try:
            subscription = Subscription.objects.get(company=request.user.company)
            subscription.plan = plan
            subscription.status = 'active'
            subscription.start_date = start_date
            subscription.end_date = end_date
            subscription.auto_renew = False
            subscription.save()
        except Subscription.DoesNotExist:
            subscription = Subscription.objects.create(
                company=request.user.company,
                plan=plan,
                status='active',
                start_date=start_date,
                end_date=end_date,
                auto_renew=False
            )
            
        return Response({'message': 'Abonnement gratuit activé', 'subscription_id': subscription.id})
        
    except SubscriptionPlan.DoesNotExist:
        return Response({'detail': 'Plan non trouvé'}, status=404)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)
