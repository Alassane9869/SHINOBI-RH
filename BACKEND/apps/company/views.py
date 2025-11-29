from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Company
from .serializers import CompanyRegistrationSerializer, CompanySerializer

class CompanyRegistrationView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        return Response({
            "message": "Company registered successfully",
            "company": CompanySerializer(company).data
        }, status=status.HTTP_201_CREATED)

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
import json

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Le Owner peut voir toutes les entreprises
        if self.request.user.is_saas_owner:
            return Company.objects.all().order_by('-created_at')
        # Les autres utilisateurs ne voient que leur entreprise
        if self.request.user.company:
            return Company.objects.filter(id=self.request.user.company.id)
        return Company.objects.none()

    @action(detail=False, methods=['get'], url_path='export/config')
    def export_config(self, request):
        """Export System Config (JSON)"""
        company = request.user.company
        data = {
            'company_name': company.name,
            'email': company.email,
            'phone': company.phone,
            'address': company.address,
            'website': company.website,
            'exported_at': datetime.now().isoformat(),
            'exported_by': request.user.email
        }
        
        response = HttpResponse(json.dumps(data, indent=4), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="config_systeme_{datetime.now().strftime("%Y%m%d")}.json"'
        return response

    @action(detail=False, methods=['get'], url_path='export/logs')
    def export_logs(self, request):
        """Export System Logs (CSV)"""
        # Using django admin logs if available, or just returning a placeholder
        from django.contrib.admin.models import LogEntry
        
        logs = LogEntry.objects.filter(user__company=request.user.company).select_related('user', 'content_type').order_by('-action_time')[:1000]
        
        data = []
        for log in logs:
            data.append({
                'Date': log.action_time,
                'Utilisateur': f"{log.user.first_name} {log.user.last_name}",
                'Action': log.get_action_flag_display(),
                'Objet': str(log.object_repr),
                'Message': log.change_message
            })
            
        from apps.core.utils.exporters import CSVExporter
        exporter = CSVExporter(
            data=data,
            filename=f"logs_systeme_{datetime.now().strftime('%Y%m%d')}"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/roles')
    def export_roles(self, request):
        """Export Roles & Permissions (PDF)"""
        from apps.accounts.models import CustomUser
        users = CustomUser.objects.filter(company=request.user.company).order_by('role', 'last_name')
        
        data = []
        for user in users:
            data.append({
                'Rôle': user.get_role_display(),
                'Utilisateur': f"{user.last_name} {user.first_name}",
                'Email': user.email,
                'Statut': 'Actif' if user.is_active else 'Inactif'
            })
            
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"roles_permissions_{datetime.now().strftime('%Y%m%d')}",
            title=f"Rapport des Rôles et Permissions - {datetime.now().strftime('%d/%m/%Y')}",
            headers=['Rôle', 'Utilisateur', 'Email', 'Statut'],
            company_name=request.user.company.name
        )
        return exporter.export()
