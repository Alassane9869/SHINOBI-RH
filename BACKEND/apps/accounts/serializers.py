from rest_framework import serializers
from django.db import transaction
from .models import CustomUser
from apps.company.models import Company
from apps.company.serializers import CompanySerializer

class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False
    )
    has_employee_profile = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'company', 'company_id', 'has_employee_profile', 'created_at', 'password', 'is_saas_owner')
        read_only_fields = ('id', 'created_at', 'is_saas_owner')

    def get_has_employee_profile(self, obj):
        return hasattr(obj, 'employee_profile')
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            # Generate a random password or raise error?
            # Better to raise error if it's required for login
            raise serializers.ValidationError({"password": "Le mot de passe est obligatoire."})
            
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            password=password,
            **validated_data
        )
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

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
