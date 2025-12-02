from django.urls import path, include
from . import views

urlpatterns = [
    # Plans
    path('plans/', views.get_plans, name='billing-plans'),
    
    # Subscription
    path('subscription/', views.get_current_subscription, name='current-subscription'),
    path('subscribe/free/', views.subscribe_free, name='subscribe-free'),
    
    # Payments
    path('payment/stripe/', views.create_stripe_payment, name='stripe-payment'),
    path('payment/orange/', views.create_orange_money_payment, name='orange-payment'),
    path('payment/moov/', views.create_moov_money_payment, name='moov-payment'),
    path('payments/', views.get_payment_history, name='payment-history'),
    
    # Webhooks
    path('webhooks/stripe/', views.stripe_webhook, name='stripe-webhook'),
    path('webhooks/orange/', views.orange_money_webhook, name='orange-webhook'),
    path('webhooks/moov/', views.moov_money_webhook, name='moov-webhook'),
    
    # Invoices
    path('invoices/', views.get_invoices, name='invoices'),
    path('invoices/<int:invoice_id>/download/', views.download_invoice, name='download-invoice'),
    
    # Promo codes
    path('promo/apply/', views.apply_promo_code, name='apply-promo'),
    
    # SaaS Owner Management (role='owner' only)
    path('', include('billing.saas_urls')),
]
