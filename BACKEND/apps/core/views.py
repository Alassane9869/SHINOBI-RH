from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.employees.models import Employee
from apps.leaves.models import Leave
from apps.payroll.models import Payroll
from apps.documents.models import Document
from apps.attendance.models import Attendance
from .serializers import StatsSerializer


class DashboardStatsView(APIView):
    """
    Vue pour obtenir les statistiques du tableau de bord.
    Accessible uniquement aux utilisateurs authentifiés.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        company = request.user.company
        if not company:
            return Response({'error': 'Utilisateur non associé à une entreprise'}, status=403)

        stats = {
            'total_employees': Employee.objects.filter(company=company).count(),
            'total_leaves': Leave.objects.filter(company=company).count(),
            'pending_leaves': Leave.objects.filter(company=company, status='pending').count(),
            'total_payrolls': Payroll.objects.filter(company=company).count(),
            'total_documents': Document.objects.filter(company=company).count(),
            'total_attendances': Attendance.objects.filter(company=company).count(),
        }

        serializer = StatsSerializer(stats)
        return Response(serializer.data)
