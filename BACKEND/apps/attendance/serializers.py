from rest_framework import serializers
from .models import Attendance, WorkSchedule

class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = '__all__'
        read_only_fields = ('id', 'company', 'created_at', 'updated_at')
        
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['company'] = request.user.company
        return super().create(validated_data)

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    department_name = serializers.SerializerMethodField()
    schedule_name = serializers.CharField(source='schedule.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = (
            'id', 'company', 'created_at', 'updated_at', 
            'status', 'delay_minutes', 'worked_hours', 
            'schedule', 'ip_address', 'device_info'
        )

    def get_department_name(self, obj):
        """Safe access to department name"""
        if obj.employee and obj.employee.department:
            return obj.employee.department
        return "-"

    def create(self, validated_data):
        # Note: Attendance creation is usually done via specific check-in endpoints
        # or admin overrides. This standard create method is for admin use.
        request = self.context.get('request')
        validated_data['company'] = request.user.company
        return super().create(validated_data)
