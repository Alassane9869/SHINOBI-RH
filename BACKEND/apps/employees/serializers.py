from rest_framework import serializers
from .models import Employee
from apps.accounts.serializers import UserSerializer
from apps.accounts.models import CustomUser

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='user',
        write_only=True
    )

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ('id', 'company', 'created_at', 'updated_at')

    def validate_user_id(self, value):
        """Vérifier que l'utilisateur appartient à la même entreprise"""
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Request context is required")
        
        if not value:
            raise serializers.ValidationError("L'utilisateur est requis")
            
        if value.company != request.user.company:
            raise serializers.ValidationError(
                "L'utilisateur doit appartenir à votre entreprise"
            )
        # Vérifier qu'il n'a pas déjà un profil employé
        if hasattr(value, 'employee_profile'):
            raise serializers.ValidationError(
                "Cet utilisateur a déjà un profil employé"
            )
        return value

    def create(self, validated_data):
        # Ensure company is set from context
        request = self.context.get('request')
        if not request.user.company:
            raise serializers.ValidationError(
                {"company": "Vous devez être rattaché à une entreprise pour créer un employé."}
            )
        validated_data['company'] = request.user.company
        return super().create(validated_data)
