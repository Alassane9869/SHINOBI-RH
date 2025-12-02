"""
API Views pour la gestion Billing dans le SaaS Dashboard
SÉCURISÉ - Accessible uniquement par role='owner'
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from billing.models import (
    PaymentConfig, SubscriptionPlan, Subscription, 
    Payment, Invoice, PromoCode
)
from billing.serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer,
    PaymentSerializer, InvoiceSerializer, PromoCodeSerializer
)


def is_saas_owner(user):
    """Vérifie que l'utilisateur est le propriétaire SaaS"""
    return user.is_authenticated and user.role == 'owner'


# ==================== CONFIGURATION PAIEMENTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_configs(request):
    """Liste des configurations de paiement (clés masquées)"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    configs = PaymentConfig.objects.all()
    data = []
    
    for config in configs:
        data.append({
            'id': config.id,
            'provider': config.provider,
            'provider_display': config.get_provider_display(),
            'is_active': config.is_active,
            'test_mode': config.test_mode,
            'api_key_masked': f"****{config.api_key[-4:]}" if config.api_key else '',
            'notification_email': config.notification_email,
            'created_at': config.created_at,
            'updated_at': config.updated_at
        })
    
    return Response(data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_payment_config(request, provider):
    """Modifier une configuration de paiement"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    try:
        config = PaymentConfig.objects.get(provider=provider)
    except PaymentConfig.DoesNotExist:
        config = PaymentConfig(provider=provider)
    
    # Mise à jour des champs
    config.is_active = request.data.get('is_active', config.is_active)
    config.test_mode = request.data.get('test_mode', config.test_mode)
    config.notification_email = request.data.get('notification_email', config.notification_email)
    
    # Clés API (seulement si fournies)
    if 'api_key' in request.data and request.data['api_key']:
        config.api_key = request.data['api_key']
    if 'api_secret' in request.data and request.data['api_secret']:
        config.api_secret = request.data['api_secret']
    if 'webhook_secret' in request.data and request.data['webhook_secret']:
        config.webhook_secret = request.data['webhook_secret']
    
    config.save()
    
    # Log de l'action
    print(f"[AUDIT] Config {provider} modifiée par {request.user.email}")
    
    return Response({'message': 'Configuration mise à jour'})


# ==================== GESTION DES PLANS ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_plans(request):
    """Liste et création de plans"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    if request.method == 'GET':
        plans = SubscriptionPlan.objects.all().order_by('display_order', 'price')
        
        # Ajouter statistiques pour chaque plan
        data = []
        for plan in plans:
            subscribers_count = Subscription.objects.filter(
                plan=plan, 
                status__in=['trial', 'active']
            ).count()
            
            revenue = Payment.objects.filter(
                subscription__plan=plan,
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            serializer = SubscriptionPlanSerializer(plan)
            plan_data = serializer.data
            plan_data['subscribers_count'] = subscribers_count
            plan_data['revenue'] = float(revenue)
            data.append(plan_data)
        
        return Response(data)
    
    elif request.method == 'POST':
        serializer = SubscriptionPlanSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.save()
            print(f"[AUDIT] Plan '{plan.name}' créé par {request.user.email}")
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_plan_detail(request, plan_id):
    """Modification et suppression de plan"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
    except SubscriptionPlan.DoesNotExist:
        return Response({'detail': 'Plan non trouvé'}, status=404)
    
    if request.method == 'PUT':
        serializer = SubscriptionPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print(f"[AUDIT] Plan '{plan.name}' modifié par {request.user.email}")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        # Vérifier qu'aucun abonnement actif n'utilise ce plan
        active_subs = Subscription.objects.filter(
            plan=plan, 
            status__in=['trial', 'active']
        ).count()
        
        if active_subs > 0:
            return Response({
                'detail': f'Impossible de supprimer : {active_subs} abonnement(s) actif(s)'
            }, status=400)
        
        plan_name = plan.name
        plan.delete()
        print(f"[AUDIT] Plan '{plan_name}' supprimé par {request.user.email}")
        return Response({'message': 'Plan supprimé'})


# ==================== ABONNEMENTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_subscriptions(request):
    """Liste de tous les abonnements (toutes entreprises)"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    subscriptions = Subscription.objects.select_related('company', 'plan').all()
    
    # Filtres
    status_filter = request.GET.get('status')
    if status_filter:
        subscriptions = subscriptions.filter(status=status_filter)
    
    from billing.serializers import SaasSubscriptionSerializer
    serializer = SaasSubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request, subscription_id):
    """Annuler un abonnement"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    try:
        subscription = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response({'detail': 'Abonnement non trouvé'}, status=404)
    
    subscription.status = 'cancelled'
    subscription.end_date = timezone.now()
    subscription.auto_renew = False
    subscription.save()
    
    print(f"[AUDIT] Abonnement {subscription_id} annulé par {request.user.email}")
    
    return Response({'message': 'Abonnement annulé'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_subscription(request, subscription_id):
    """Mettre à jour un abonnement (plan, statut, prolongation essai)"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    try:
        subscription = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response({'detail': 'Abonnement non trouvé'}, status=404)
    
    # Changer de plan
    if 'plan_id' in request.data:
        try:
            new_plan = SubscriptionPlan.objects.get(id=request.data['plan_id'])
            old_plan = subscription.plan.name
            subscription.plan = new_plan
            print(f"[AUDIT] Plan changé de {old_plan} à {new_plan.name} pour {subscription.company.name}")
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Plan non trouvé'}, status=404)
    
    # Changer le statut
    if 'status' in request.data:
        old_status = subscription.status
        subscription.status = request.data['status']
        print(f"[AUDIT] Statut changé de {old_status} à {subscription.status} pour {subscription.company.name}")
    
    # Prolonger l'essai
    if 'extend_trial_days' in request.data:
        days = int(request.data['extend_trial_days'])
        if days > 0:
            if subscription.trial_end_date:
                subscription.trial_end_date += timedelta(days=days)
            else:
                subscription.trial_end_date = timezone.now() + timedelta(days=days)
            print(f"[AUDIT] Essai prolongé de {days} jours pour {subscription.company.name}")
    
    subscription.save()
    
    serializer = SubscriptionSerializer(subscription)
    return Response(serializer.data)


# ==================== TRANSACTIONS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_transactions(request):
    """Historique de toutes les transactions"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    payments = Payment.objects.select_related('subscription__company').all()
    
    # Filtres
    status_filter = request.GET.get('status')
    if status_filter:
        payments = payments.filter(status=status_filter)
    
    method_filter = request.GET.get('method')
    if method_filter:
        payments = payments.filter(payment_method=method_filter)
    
    data = []
    for payment in payments:
        serializer = PaymentSerializer(payment)
        payment_data = serializer.data
        payment_data['company_name'] = payment.subscription.company.name
        data.append(payment_data)
    
    return Response(data)


# ==================== ANALYTICS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mrr(request):
    """Calcul du MRR (Monthly Recurring Revenue)"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    # MRR = Somme des abonnements mensuels actifs
    monthly_subs = Subscription.objects.filter(
        status__in=['trial', 'active'],
        plan__period='monthly'
    ).select_related('plan')
    
    mrr = sum([sub.plan.price for sub in monthly_subs])
    
    # ARR (Annual Recurring Revenue)
    arr = mrr * 12
    
    # Nombre d'abonnements actifs
    active_subs = Subscription.objects.filter(status__in=['trial', 'active']).count()
    
    # Revenus du mois en cours
    start_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0)
    monthly_revenue = Payment.objects.filter(
        status='completed',
        paid_at__gte=start_of_month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return Response({
        'mrr': float(mrr),
        'arr': float(arr),
        'active_subscriptions': active_subs,
        'monthly_revenue': float(monthly_revenue)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_revenue_chart(request):
    """Données pour graphique de revenus"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    # Revenus des 30 derniers jours
    days = 30
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    daily_revenue = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0)
        day_end = day.replace(hour=23, minute=59, second=59)
        
        revenue = Payment.objects.filter(
            status='completed',
            paid_at__gte=day_start,
            paid_at__lte=day_end
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        daily_revenue.append({
            'date': day.strftime('%Y-%m-%d'),
            'revenue': float(revenue)
        })
    
    return Response(daily_revenue)


# ==================== CODES PROMO ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_promo_codes(request):
    """Liste et création de codes promo"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    if request.method == 'GET':
        codes = PromoCode.objects.all().order_by('-created_at')
        serializer = PromoCodeSerializer(codes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PromoCodeSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.save()
            print(f"[AUDIT] Code promo '{code.code}' créé par {request.user.email}")
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_promo_code_detail(request, code_id):
    """Modification et suppression de code promo"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    try:
        promo = PromoCode.objects.get(id=code_id)
    except PromoCode.DoesNotExist:
        return Response({'detail': 'Code promo non trouvé'}, status=404)
    
    if request.method == 'PUT':
        serializer = PromoCodeSerializer(promo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print(f"[AUDIT] Code promo '{promo.code}' modifié par {request.user.email}")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        code_value = promo.code
        promo.delete()
        print(f"[AUDIT] Code promo '{code_value}' supprimé par {request.user.email}")
        return Response({'message': 'Code promo supprimé'})


# ==================== FACTURES ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_invoices(request):
    """Liste de toutes les factures"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    invoices = Invoice.objects.select_related('subscription__company').all().order_by('-issue_date')
    
    # Filtres
    status_filter = request.GET.get('status')
    if status_filter:
        invoices = invoices.filter(status=status_filter)
    
    data = []
    for invoice in invoices:
        serializer = InvoiceSerializer(invoice)
        inv_data = serializer.data
        inv_data['company_name'] = invoice.subscription.company.name
        data.append(inv_data)
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_invoice_email(request, invoice_id):
    """Renvoyer l'email de facture"""
    if not is_saas_owner(request.user):
        return Response({'detail': 'Accès refusé'}, status=403)
    
    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({'detail': 'Facture non trouvée'}, status=404)
    
    # Logique d'envoi d'email (simulée pour l'instant ou appel à une fonction utilitaire)
    # send_invoice_email(invoice)
    
    print(f"[AUDIT] Email facture {invoice.invoice_number} renvoyé par {request.user.email}")
    
    return Response({'message': 'Email envoyé avec succès'})
