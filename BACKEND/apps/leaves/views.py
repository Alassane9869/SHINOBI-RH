from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Leave
from .serializers import LeaveSerializer, LeaveActionSerializer
from apps.accounts.permissions import IsCompanyMember, IsManager, IsRH

class LeaveViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'leave_type', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'rh', 'manager']:
            return Leave.objects.filter(company=user.company)
        # Employees see only their own leaves
        if hasattr(user, 'employee_profile'):
            return Leave.objects.filter(employee=user.employee_profile)
        return Leave.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'approved'
        leave.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'rejected'
        leave.save()
        return Response({'status': 'rejected'})
