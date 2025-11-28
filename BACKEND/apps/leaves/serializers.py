from rest_framework import serializers
from .models import Leave
from datetime import date

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ('id', 'company', 'status', 'created_at', 'updated_at')

    def validate(self, data):
        """Validation complète des congés"""
        # 1. Vérifier que end_date > start_date
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'La date de fin doit être après la date de début'
            })
        
        # 2. Vérifier que les dates ne sont pas dans le passé
        if data['start_date'] < date.today():
            raise serializers.ValidationError({
                'start_date': 'Impossible de créer un congé dans le passé'
            })
        
        # 3. Vérifier les chevauchements de congés
        employee = data.get('employee')
        if employee:
            overlapping = Leave.objects.filter(
                employee=employee,
                status__in=['pending', 'approved'],
                start_date__lte=data['end_date'],
                end_date__gte=data['start_date']
            )
            
            # Exclure l'instance actuelle si on est en update
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
            
            if overlapping.exists():
                raise serializers.ValidationError({
                    'non_field_errors': 'Vous avez déjà un congé sur cette période'
                })
        
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['company'] = request.user.company
        
        # Si employee n'est pas fourni, utiliser le profil de l'utilisateur
        if 'employee' not in validated_data:
            if not hasattr(request.user, 'employee_profile'):
                raise serializers.ValidationError({
                    'employee': 'Vous devez avoir un profil employé pour demander un congé'
                })
            validated_data['employee'] = request.user.employee_profile
        
        return super().create(validated_data)

class LeaveActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ('status',)
