from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, date

from .models import Attendance
from .serializers import AttendanceSerializer
from .services import AttendanceService
from apps.accounts.permissions import IsCompanyMember

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'date']
    lookup_value_regex = '[0-9a-f-]{36}'

    def get_queryset(self):
        # Si l'utilisateur est un employé, ne montrer que ses propres présences
        if self.request.user.role == 'employee':
            try:
                return Attendance.objects.filter(employee__user=self.request.user)
            except:
                return Attendance.objects.none()
        # Pour les autres rôles, montrer toutes les présences de l'entreprise
        return Attendance.objects.filter(company=self.request.user.company).order_by('-date', '-check_in')

    def perform_create(self, serializer):
        if self.request.user.role == 'employee':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les employés ne peuvent pas créer de présences.")
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        if self.request.user.role == 'employee':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les employés ne peuvent pas modifier les présences. Utilisez la justification.")
        serializer.save(company=self.request.user.company)
    
    def perform_destroy(self, instance):
        if self.request.user.role == 'employee':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les employés ne peuvent pas supprimer de présences.")
        instance.delete()
    
    @action(detail=True, methods=['patch'], url_path='justify')
    def justify(self, request, pk=None):
        """
        Permet à un employé de justifier son absence/retard en ajoutant une note.
        """
        attendance = self.get_object()
        
        if request.user.role == 'employee' and attendance.employee.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez justifier que vos propres présences.")
        
        if request.user.role == 'employee':
            notes = request.data.get('notes', '')
            attendance.notes = notes
            attendance.save(update_fields=['notes', 'updated_at'])
            serializer = self.get_serializer(attendance)
            return Response(serializer.data)
        
        serializer = self.get_serializer(attendance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
