from rest_framework import serializers
from .models import Payroll

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ('id', 'company', 'net_salary', 'pdf_file', 'created_at', 'updated_at')

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['company'] = request.user.company
        return super().create(validated_data)
