from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    subscription_status = serializers.SerializerMethodField()
    trial_end_date = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_subscription_status(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.status
        return None

    def get_trial_end_date(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription.trial_end_date:
            return obj.subscription.trial_end_date.isoformat()
        return None

class CompanyRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new company along with an admin user.
    """
    admin_email = serializers.EmailField(write_only=True)
    admin_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    admin_first_name = serializers.CharField(write_only=True)
    admin_last_name = serializers.CharField(write_only=True)

    class Meta:
        model = Company
        fields = ('name', 'email', 'address', 'phone', 'website', 'admin_email', 'admin_password', 'admin_first_name', 'admin_last_name')

    def create(self, validated_data):
        # Extract admin data
        admin_email = validated_data.pop('admin_email')
        admin_password = validated_data.pop('admin_password')
        admin_first_name = validated_data.pop('admin_first_name')
        admin_last_name = validated_data.pop('admin_last_name')

        # Create Company
        company = Company.objects.create(**validated_data)

        # Create Admin User
        from apps.accounts.models import CustomUser
        user = CustomUser.objects.create_user(
            username=admin_email,
            email=admin_email,
            password=admin_password,
            first_name=admin_first_name,
            last_name=admin_last_name,
            company=company,
            role='admin'
        )
        return company
