from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime, date
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

    @action(detail=False, methods=['get'], url_path='export/pdf')
    def export_pdf(self, request):
        """Export Leaves List (PDF)"""
        leaves = self.get_queryset().select_related('employee__user').order_by('-start_date')
        
        data = []
        for leave in leaves:
            data.append({
                'Employé': f"{leave.employee.user.last_name} {leave.employee.user.first_name}",
                'Type': leave.get_leave_type_display(),
                'Début': leave.start_date.strftime("%d/%m/%Y"),
                'Fin': leave.end_date.strftime("%d/%m/%Y"),
                'Statut': leave.get_status_display()
            })
            
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"conges_{datetime.now().strftime('%Y%m%d')}",
            title=f"Liste des Congés - {datetime.now().strftime('%d/%m/%Y')}",
            headers=['Employé', 'Type', 'Début', 'Fin', 'Statut'],
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/excel')
    def export_excel(self, request):
        """Export Leaves List (Excel)"""
        leaves = self.get_queryset().select_related('employee__user').order_by('-start_date')
        
        data = []
        for leave in leaves:
            data.append({
                'Employé': f"{leave.employee.user.last_name} {leave.employee.user.first_name}",
                'Type': leave.get_leave_type_display(),
                'Début': leave.start_date.strftime("%d/%m/%Y"),
                'Fin': leave.end_date.strftime("%d/%m/%Y"),
                'Durée': f"{(leave.end_date - leave.start_date).days + 1} jours",
                'Statut': leave.get_status_display(),
                'Motif': leave.reason or '-'
            })
            
        from apps.core.utils.exporters import ExcelExporter
        exporter = ExcelExporter(
            data=data,
            filename=f"conges_{datetime.now().strftime('%Y%m%d')}",
            sheet_name="Congés"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/csv')
    def export_csv(self, request):
        """Export Leaves List (CSV)"""
        leaves = self.get_queryset().select_related('employee__user').order_by('-start_date')
        
        data = []
        for leave in leaves:
            data.append({
                'Employé': f"{leave.employee.user.last_name} {leave.employee.user.first_name}",
                'Type': leave.leave_type,
                'Début': leave.start_date,
                'Fin': leave.end_date,
                'Statut': leave.status
            })
            
        from apps.core.utils.exporters import CSVExporter
        exporter = CSVExporter(
            data=data,
            filename=f"conges_{datetime.now().strftime('%Y%m%d')}"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/pending')
    def export_pending(self, request):
        """Export Pending Leaves Report (PDF)"""
        leaves = self.get_queryset().filter(status='pending').select_related('employee__user').order_by('start_date')
        
        data = []
        for leave in leaves:
            data.append({
                'Employé': f"{leave.employee.user.last_name} {leave.employee.user.first_name}",
                'Type': leave.get_leave_type_display(),
                'Début': leave.start_date.strftime("%d/%m/%Y"),
                'Fin': leave.end_date.strftime("%d/%m/%Y"),
                'Durée': f"{(leave.end_date - leave.start_date).days + 1} jours"
            })
            
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"conges_en_attente_{datetime.now().strftime('%Y%m%d')}",
            title=f"Congés en Attente - {datetime.now().strftime('%d/%m/%Y')}",
            headers=['Employé', 'Type', 'Début', 'Fin', 'Durée'],
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/planning')
    def export_planning(self, request):
        """Export Future Leaves Planning (Excel)"""
        today = date.today()
        leaves = self.get_queryset().filter(start_date__gte=today).select_related('employee__user').order_by('start_date')
        
        data = []
        for leave in leaves:
            data.append({
                'Employé': f"{leave.employee.user.last_name} {leave.employee.user.first_name}",
                'Type': leave.get_leave_type_display(),
                'Début': leave.start_date.strftime("%d/%m/%Y"),
                'Fin': leave.end_date.strftime("%d/%m/%Y"),
                'Statut': leave.get_status_display()
            })
            
        from apps.core.utils.exporters import ExcelExporter
        exporter = ExcelExporter(
            data=data,
            filename=f"planning_conges_{datetime.now().strftime('%Y%m%d')}",
            sheet_name="Planning"
        )
        return exporter.export()

    @action(detail=True, methods=['get'], url_path='export/request')
    def export_request(self, request, pk=None):
        """Generate Leave Request Form (PDF)"""
        leave = self.get_object()
        from apps.payroll.utils import generate_pdf
        
        context = {
            'company': leave.company,
            'leave': leave,
            'duration': (leave.end_date - leave.start_date).days + 1
        }
        pdf_content = generate_pdf('documents/leave_request.html', context)
        if pdf_content:
            response = HttpResponse(pdf_content.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="demande_conge_{leave.id}.pdf"'
            return response
        return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)

    @action(detail=True, methods=['get'], url_path='export/decision')
    def export_decision(self, request, pk=None):
        """Generate Leave Decision Letter (PDF)"""
        leave = self.get_object()
        from apps.payroll.utils import generate_pdf
        
        context = {
            'company': leave.company,
            'leave': leave,
            'current_date': date.today()
        }
        pdf_content = generate_pdf('documents/leave_decision.html', context)
        if pdf_content:
            response = HttpResponse(pdf_content.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="decision_conge_{leave.id}.pdf"'
            return response
        return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)
