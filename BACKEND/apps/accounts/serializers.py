from rest_framework import serializers
from django.db import transaction
from .models import CustomUser
from apps.company.models import Company

class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    has_employee_profile = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'company', 'company_name', 'has_employee_profile', 'created_at')
        read_only_fields = ('id', 'company', 'role', 'created_at')

    def get_has_employee_profile(self, obj):
        return hasattr(obj, 'employee_profile')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'first_name', 'last_name', 'role')
    
    def create(self, validated_data):
        # Assign company from request context (handled in view)
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            **validated_data
        )
        return user

class CompanyRegistrationSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        if Company.objects.filter(email=value).exists():
            raise serializers.ValidationError("Une entreprise avec cet email existe déjà.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        # 1. Create Company
        company = Company.objects.create(
            name=validated_data['company_name'],
            email=validated_data['email']
        )

        # 2. Create Admin User
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role='admin',
            company=company
        )

        return user
