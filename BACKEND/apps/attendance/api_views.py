from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Attendance, WorkSchedule
from .serializers import AttendanceSerializer, WorkScheduleSerializer
from .services import AttendanceService
from apps.accounts.permissions import IsCompanyMember

class WorkScheduleViewSet(viewsets.ModelViewSet):
    """
    Gestion des horaires de travail.
    """
    queryset = WorkSchedule.objects.all()
    serializer_class = WorkScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]

    def get_queryset(self):
        return WorkSchedule.objects.filter(company=self.request.user.company)

class AttendanceViewSet(viewsets.ModelViewSet):
    """
    Gestion des présences.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'employee':
            return Attendance.objects.filter(employee__user=user).order_by('-date')
        return Attendance.objects.filter(company=user.company).order_by('-date', '-check_in')

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        """
        Endpoint pour le pointage d'arrivée.
        """
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({'error': 'Seuls les employés peuvent pointer.'}, status=403)
            
        employee = user.employee_profile
        today = timezone.now().date()
        now = timezone.now().time()
        
        # Récupérer ou créer la fiche du jour
        attendance = AttendanceService.get_or_create_daily_attendance(employee, today)
        
        if attendance.check_in:
            return Response({'error': 'Vous avez déjà pointé votre arrivée aujourd\'hui.'}, status=400)
            
        # Traiter le check-in via le service
        ip = request.META.get('REMOTE_ADDR')
        device = request.META.get('HTTP_USER_AGENT', '')[:255]
        
        AttendanceService.process_check_in(attendance, now, ip, device)
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='check-out')
    def check_out(self, request):
        """
        Endpoint pour le pointage de départ.
        """
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({'error': 'Seuls les employés peuvent pointer.'}, status=403)
            
        employee = user.employee_profile
        today = timezone.now().date()
        now = timezone.now().time()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({'error': 'Aucune présence trouvée pour aujourd\'hui. Veuillez pointer l\'arrivée d\'abord.'}, status=404)
            
        if attendance.check_out:
            return Response({'error': 'Vous avez déjà pointé votre départ aujourd\'hui.'}, status=400)
            
        # Traiter le check-out via le service
        AttendanceService.process_check_out(attendance, now)
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='justify')
    def justify(self, request, pk=None):
        """
        Justification d'absence/retard.
        """
        attendance = self.get_object()
        
        if request.user.role == 'employee' and attendance.employee.user != request.user:
            return Response({'error': "Vous ne pouvez justifier que vos propres présences."}, status=403)
        
        notes = request.data.get('notes', '')
        attendance.notes = notes
        attendance.save(update_fields=['notes', 'updated_at'])
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)
