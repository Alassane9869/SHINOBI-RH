from django.urls import path
from . import saas_views

urlpatterns = [
    # Configuration Paiements
    path('saas/config/', saas_views.get_payment_configs, name='saas-payment-configs'),
    path('saas/config/<str:provider>/', saas_views.update_payment_config, name='saas-update-payment-config'),
    
    # Gestion des Plans
    path('saas/plans/', saas_views.manage_plans, name='saas-plans'),
    path('saas/plans/<int:plan_id>/', saas_views.manage_plan_detail, name='saas-plan-detail'),
    
    # Abonnements
    path('saas/subscriptions/', saas_views.get_all_subscriptions, name='saas-subscriptions'),
    path('saas/subscriptions/<int:subscription_id>/', saas_views.update_subscription, name='saas-update-subscription'),
    path('saas/subscriptions/<int:subscription_id>/cancel/', saas_views.cancel_subscription, name='saas-cancel-subscription'),
    
    # Transactions
    path('saas/transactions/', saas_views.get_all_transactions, name='saas-transactions'),
    
    # Analytics
    path('saas/analytics/mrr/', saas_views.get_mrr, name='saas-mrr'),
    path('saas/analytics/revenue/', saas_views.get_revenue_chart, name='saas-revenue-chart'),
    
    # Codes Promo
    path('saas/promo-codes/', saas_views.manage_promo_codes, name='saas-promo-codes'),
    path('saas/promo-codes/<int:code_id>/', saas_views.manage_promo_code_detail, name='saas-promo-code-detail'),
    
    # Factures
    path('saas/invoices/', saas_views.get_all_invoices, name='saas-invoices'),
    path('saas/invoices/<int:invoice_id>/resend/', saas_views.resend_invoice_email, name='saas-resend-invoice-email'),
]
