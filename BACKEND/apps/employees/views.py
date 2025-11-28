from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import date, datetime
from .models import Employee
from .serializers import EmployeeSerializer
from apps.accounts.permissions import IsCompanyMember, IsRH
from apps.payroll.utils import generate_pdf
from apps.core.utils import PDFExporter, ExcelExporter, CSVExporter


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember, IsRH]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'position', 'department']

    def get_queryset(self):
        return Employee.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['get'])
    def work_certificate(self, request, pk=None):
        """Générer une attestation de travail en PDF"""
        employee = self.get_object()
        context = {
            'company': employee.company,
            'employee': employee,
            'current_date': date.today(),
        }
        pdf_content = generate_pdf('documents/work_certificate.html', context)
        if pdf_content:
            response = HttpResponse(pdf_content.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="attestation_{employee.user.last_name}.pdf"'
            return response
        return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)

    @action(detail=True, methods=['get'])
    def contract_pdf(self, request, pk=None):
        """Générer un contrat de travail en PDF"""
        employee = self.get_object()
        context = {
            'company': employee.company,
            'employee': employee,
            'current_date': date.today(),
        }
        pdf_content = generate_pdf('documents/contract_template.html', context)
        if pdf_content:
            response = HttpResponse(pdf_content.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="contrat_{employee.user.last_name}.pdf"'
            return response
        return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)

    @action(detail=False, methods=['get'], url_path='export/pdf')
    def export_pdf(self, request):
        """Export employees list as PDF"""
        # Get all employees without pagination, ordered
        employees = Employee.objects.filter(
            company=request.user.company
        ).select_related('user').order_by('user__last_name', 'user__first_name').values(
            'user__first_name', 'user__last_name', 'position', 'department',
            'user__email', 'phone', 'date_hired', 'base_salary'
        )
        context = {
            'company': request.user.company,
            'export_date': datetime.now().strftime('%d/%m/%Y %H:%M')
        }
        exporter = PDFExporter(
            data=list(employees),
            filename=f'employes_{datetime.now().strftime("%Y%m%d")}',
            template='employees/export_pdf.html',
            context=context
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/excel')
    def export_excel(self, request):
        """Export employees list as Excel"""
        # Get all employees without pagination, ordered
        employees = Employee.objects.filter(
            company=request.user.company
        ).select_related('user').order_by('user__last_name', 'user__first_name').values(
            'user__first_name', 'user__last_name', 'position', 'department',
            'user__email', 'phone', 'date_hired', 'base_salary'
        )
        data = []
        for emp in employees:
            data.append({
                'Prénom': emp['user__first_name'],
                'Nom': emp['user__last_name'],
                'Poste': emp['position'],
                'Département': emp.get('department', '-'),
                'Email': emp['user__email'],
                'Téléphone': emp.get('phone', '-'),
                'Date d\'embauche': str(emp.get('date_hired', '-')),
                'Salaire': str(emp.get('base_salary', '-'))
            })
        exporter = ExcelExporter(
            data=data,
            filename=f'employes_{datetime.now().strftime("%Y%m%d")}',
            sheet_name='Employés'
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/csv')
    def export_csv(self, request):
        """Export employees list as CSV"""
        # Get all employees without pagination, ordered
        employees = Employee.objects.filter(
            company=request.user.company
        ).select_related('user').order_by('user__last_name', 'user__first_name').values(
            'user__first_name', 'user__last_name', 'position', 'department',
            'user__email', 'phone', 'date_hired', 'base_salary'
        )
        data = []
        for emp in employees:
            data.append({
                'Prénom': emp['user__first_name'],
                'Nom': emp['user__last_name'],
                'Poste': emp['position'],
                'Département': emp.get('department', '-'),
                'Email': emp['user__email'],
                'Téléphone': emp.get('phone', '-'),
                'Date d\'embauche': str(emp.get('date_hired', '-')),
                'Salaire': str(emp.get('base_salary', '-'))
            })
        exporter = CSVExporter(
            data=data,
            filename=f'employes_{datetime.now().strftime("%Y%m%d")}'
        )
        return exporter.export()
