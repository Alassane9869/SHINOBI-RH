from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment, Invoice, PromoCode


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'currency', 'period',
            'max_employees', 'max_users', 'features', 'is_active', 'is_popular',
            'display_order'
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'start_date', 'end_date', 'next_billing_date',
            'trial_end_date', 'auto_renew', 'payment_method', 'created_at'
        ]


class SaasSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer pour le SaaS Admin avec toutes les infos de l'entreprise"""
    plan = SubscriptionPlanSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'company', 'plan', 'status', 'start_date', 'end_date', 
            'next_billing_date', 'trial_end_date', 'auto_renew', 
            'payment_method', 'created_at'
        ]
    
    def get_company(self, obj):
        return {
            'id': obj.company.id,
            'name': obj.company.name,
            'email': obj.company.email if hasattr(obj.company, 'email') else obj.company.users.filter(role='admin').first().email if obj.company.users.filter(role='admin').exists() else 'N/A'
        }


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'payment_method', 'status',
            'transaction_id', 'paid_at', 'created_at', 'error_message'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'amount', 'currency', 'billing_name',
            'billing_email', 'issue_date', 'due_date', 'paid_date',
            'is_paid', 'pdf_file', 'created_at'
        ]


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'valid_from', 'valid_until', 'max_uses', 'times_used', 'is_active'
        ]
