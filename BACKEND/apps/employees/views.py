from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Q
from datetime import date, datetime, timedelta

from .models import Employee
from .serializers import EmployeeSerializer
from apps.accounts.permissions import IsCompanyMember, IsRH
from apps.payroll.utils import generate_pdf
from apps.core.utils import PDFExporter, ExcelExporter, CSVExporter
from apps.core.utils.advanced_exporters import (
    WeasyPrintPDFExporter,
    AdvancedExcelExporter,
    UTF8CSVExporter
)
from apps.core.export_models import ExportLog


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
        ).select_related('user').order_by('user__last_name', 'user__first_name')
        
        # Prepare data for PDF
        data = []
        headers = ['Nom', 'Prénom', 'Poste', 'Département', 'Email', 'Téléphone', 'Date d\'embauche', 'Salaire']
        
        for emp in employees:
            data.append({
                'Nom': emp.user.last_name,
                'Prénom': emp.user.first_name,
                'Poste': emp.position,
                'Département': emp.department or '-',
                'Email': emp.user.email,
                'Téléphone': emp.phone or '-',
                'Date d\'embauche': str(emp.date_hired) if emp.date_hired else '-',
                'Salaire': f'{emp.base_salary} €' if emp.base_salary else '-'
            })
        
        exporter = PDFExporter(
            data=data,
            filename=f'employes_{datetime.now().strftime("%Y%m%d")}',
            title='Liste des Employés',
            headers=headers,
            company_name=request.user.company.name
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
    @action(detail=False, methods=['get'], url_path='export/staff-state')
    def export_staff_state(self, request):
        """Export Monthly Staff State (PDF)"""
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)
        
        employees = self.get_queryset().select_related('user')
        
        # Get hiring/leaving stats for the month
        hired_count = employees.filter(
            date_hired__month=month,
            date_hired__year=year
        ).count()
        
        data = []
        for emp in employees:
            data.append({
                'Nom': emp.user.last_name,
                'Prénom': emp.user.first_name,
                'Poste': emp.position,
                'Département': emp.department or '-',
                'Date d\'embauche': emp.date_hired.strftime('%d/%m/%Y') if emp.date_hired else '-',
                'Salaire': float(emp.base_salary)
            })
        
        exporter = PDFExporter(
            data=data,
            filename=f"etat_personnel_{month}_{year}",
            title=f"État du Personnel - {month}/{year}",
            company_name=request.user.company.name
        )
        return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/complete-file')
    def export_complete_file(self, request, pk=None):
        """
        Génère le dossier complet de l'employé (PDF multi-pages).
        
        Inclut : infos personnelles, professionnelles, historique congés,
        historique présence, historique paie, documents joints.
        """
        employee = self.get_object()
        
        # Calculer l'ancienneté
        years_of_service = 0
        if employee.date_hired:
            delta = date.today() - employee.date_hired
            years_of_service = delta.days // 365
        
        # Historique des congés (12 derniers mois)
        from apps.leaves.models import Leave
        leaves = Leave.objects.filter(
            employee=employee
        ).order_by('-start_date')[:20]
        
        # Récapitulatif présence (30 derniers jours)
        from apps.attendance.models import Attendance
        thirty_days_ago = date.today() - timedelta(days=30)
        attendance_records = Attendance.objects.filter(
            employee=employee,
            date__gte=thirty_days_ago
        )
        
        attendance_summary = {
            'present': attendance_records.filter(status='present').count(),
            'late': attendance_records.filter(status='late').count(),
            'absent': attendance_records.filter(status='absent').count(),
            'excused': attendance_records.filter(status='excused').count()
        }
        
        # Historique paie (6 derniers mois)
        from apps.payroll.models import Payroll
        payrolls = Payroll.objects.filter(
            employee=employee
        ).order_by('-year', '-month')[:6]
        
        # Documents
        from apps.documents.models import Document
        documents = Document.objects.filter(
            employee=employee
        ).order_by('-created_at')[:10]
        
        context = {
            'employee': employee,
            'years_of_service': years_of_service,
            'leaves': leaves,
            'attendance_summary': attendance_summary,
            'payrolls': payrolls,
            'documents': documents
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"dossier_complet_{employee.user.last_name}_{employee.user.first_name}",
            template_name='exports/pdf/employee_file.html',
            title=f"Dossier Employé - {employee.user.get_full_name()}",
            subtitle=f"Matricule : {str(employee.id)[:8]}",
            document_id=str(employee.id),
            document_type='employee_file',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='employees',
            document_name=f"Dossier complet {employee.user.get_full_name()}",
            parameters={'employee_id': str(employee.id)},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/work-certificate-advanced')
    def export_work_certificate_advanced(self, request, pk=None):
        """
        Génère une attestation de travail officielle avec le template amélioré.
        """
        employee = self.get_object()
        
        context = {
            'employee': employee,
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"attestation_travail_{employee.user.last_name}_{employee.user.first_name}",
            template_name='exports/pdf/work_certificate.html',
            title="Attestation de Travail",
            document_id=str(employee.id),
            document_type='work_certificate',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='employees',
            document_name=f"Attestation de travail {employee.user.get_full_name()}",
            parameters={'employee_id': str(employee.id)},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=False, methods=['get'], url_path='export/list-advanced')
    def export_list_advanced(self, request):
        """
        Exporte la liste des employés au format Excel avancé ou CSV.
        
        Query params:
            - format: excel ou csv (défaut: excel)
            - department: filtrer par département (optionnel)
        """
        export_format = request.query_params.get('format', 'excel').lower()
        department = request.query_params.get('department')
        
        employees = self.get_queryset().select_related('user')
        
        if department:
            employees = employees.filter(department=department)
        
        # Préparer les données
        data = []
        for emp in employees:
            years_service = 0
            if emp.date_hired:
                delta = date.today() - emp.date_hired
                years_service = delta.days // 365
            
            data.append({
                'Matricule': str(emp.id)[:8],
                'Nom': emp.user.last_name,
                'Prénom': emp.user.first_name,
                'Email': emp.user.email,
                'Téléphone': emp.phone or '',
                'Poste': emp.position,
                'Département': emp.department or '',
                'Date d\'embauche': emp.date_hired.strftime('%d/%m/%Y') if emp.date_hired else '',
                'Ancienneté (ans)': years_service,
                'Salaire de base': float(emp.base_salary),
                'Statut': 'Actif' if emp.user.is_active else 'Inactif'
            })
        
        if export_format == 'csv':
            exporter = UTF8CSVExporter(
                data=data,
                filename=f"liste_employes_{timezone.now().strftime('%Y%m%d')}",
                company=request.user.company,
                user=request.user
            )
        else:
            exporter = AdvancedExcelExporter(
                data=data,
                filename=f"liste_employes_{timezone.now().strftime('%Y%m%d')}",
                sheet_name="Employés",
                company=request.user.company,
                user=request.user,
                include_formulas=False
            )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type=export_format,
            module='employees',
            document_name=f"Liste des employés",
            parameters={'department': department, 'count': len(data)},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/transfer-letter-advanced')
    def export_transfer_letter_advanced(self, request, pk=None):
        """
        Génère une lettre de mutation officielle avec template avancé.
        
        Query params:
            - new_position: Nouveau poste
            - new_department: Nouveau département
            - new_salary: Nouveau salaire (optionnel)
            - effective_date: Date d'effet (YYYY-MM-DD)
            - new_location: Nouveau lieu (optionnel)
        """
        employee = self.get_object()
        
        # Récupérer les paramètres
        new_position = request.query_params.get('new_position', employee.position)
        new_department = request.query_params.get('new_department', employee.department)
        new_salary_str = request.query_params.get('new_salary')
        effective_date_str = request.query_params.get('effective_date')
        new_location = request.query_params.get('new_location')
        
        # Parser la date
        if effective_date_str:
            try:
                effective_date = datetime.strptime(effective_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Format de date invalide (YYYY-MM-DD requis)'}, status=400)
        else:
            effective_date = date.today() + timedelta(days=30)  # Par défaut  1 mois
        
        salary_change = False
        new_salary = employee.base_salary
        if new_salary_str:
            try:
                new_salary = float(new_salary_str)
                salary_change = True
            except ValueError:
                pass
        
        context = {
            'employee': employee,
            'current_position': employee.position,
            'current_department': employee.department,
            'new_position': new_position,
            'new_department': new_department,
            'new_salary': new_salary,
            'salary_change': salary_change,
            'effective_date': effective_date,
            'new_location': new_location
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"lettre_mutation_{employee.user.last_name}_{employee.user.first_name}",
            template_name='exports/pdf/transfer_letter.html',
            title="Lettre de Mutation",
            document_id=str(employee.id),
            document_type='transfer_letter',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='employees',
            document_name=f"Lettre de mutation {employee.user.get_full_name()}",
            parameters={'employee_id': str(employee.id), 'new_position': new_position},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/termination-letter-advanced')
    def export_termination_letter_advanced(self, request, pk=None):
        """
        Génère une lettre de fin de contrat officielle.
        
        Query params:
            - end_date: Date de fin (YYYY-MM-DD)
            - termination_type: resignation, dismissal, end_of_contract, mutual_agreement
            - notice_period: Durée du préavis en jours
            - severance_pay: Indemnité (optionnel)
        """
        employee = self.get_object()
        
        end_date_str = request.query_params.get('end_date')
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Format de date invalide'}, status=400)
        else:
            end_date = date.today() + timedelta(days=30)
        
        termination_type = request.query_params.get('termination_type', 'end_of_contract')
        notice_period = request.query_params.get('notice_period', 30)
        severance_pay_str = request.query_params.get('severance_pay')
        
        severance_pay = None
        if severance_pay_str:
            try:
                severance_pay = float(severance_pay_str)
            except ValueError:
                pass
        
        # Calculer l'ancienneté
        years_of_service = 0
        if employee.date_hired:
            delta = end_date - employee.date_hired
            years_of_service = delta.days // 365
        
        context = {
            'employee': employee,
            'end_date': end_date,
            'termination_type': termination_type,
            'notice_period': notice_period,
            'notice_end_date': end_date - timedelta(days=int(notice_period)),
            'severance_pay': severance_pay,
            'years_of_service': years_of_service
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"lettre_fin_contrat_{employee.user.last_name}_{employee.user.first_name}",
            template_name='exports/pdf/termination_letter.html',
            title="Lettre de Fin de Contrat",
            document_id=str(employee.id),
            document_type='termination_letter',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='employees',
            document_name=f"Lettre fin de contrat {employee.user.get_full_name()}",
            parameters={'employee_id': str(employee.id), 'type': termination_type},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/work-contract-advanced')
    def export_work_contract_advanced(self, request, pk=None):
        """
        Génère un contrat de travail complet (CDI/CDD/Stage).
        
        Query params:
            - contract_type: CDI, CDD, STAGE
            - start_date: Date de début (YYYY-MM-DD)
            - end_date: Date de fin pour CDD (YYYY-MM-DD)
            - salary: Salaire (défaut: base_salary de l'employé)
            - probation_period: Durée période d'essai en mois
        """
        employee = self.get_object()
        
        contract_type = request.query_params.get('contract_type', 'CDI')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        salary_str = request.query_params.get('salary')
        probation_period = request.query_params.get('probation_period', 3)
        
        # Dates
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Format de date invalide'}, status=400)
        else:
            start_date = employee.date_hired or date.today()
        
        end_date = None
        if contract_type == 'CDD' and end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Salaire
        salary = employee.base_salary
        if salary_str:
            try:
                salary = float(salary_str)
            except ValueError:
                pass
        
        context = {
            'employee': employee,
            'contract_type': contract_type,
            'start_date': start_date,
            'end_date': end_date,
            'salary': salary,
            'probation_period': probation_period,
            'weekly_hours': 35,
            'working_days': 5,
            'work_schedule': '09h00 - 17h00 du lundi au vendredi',
            'work_location': request.user.company.address,
            'notice_period': 1 if contract_type == 'CDI' else None
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"contrat_travail_{employee.user.last_name}_{employee.user.first_name}",
            template_name='exports/pdf/work_contract.html',
            title=f"Contrat de Travail - {contract_type}",
            document_id=str(employee.id),
            document_type='work_contract',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='employees',
            document_name=f"Contrat de travail {employee.user.get_full_name()}",
            parameters={'employee_id': str(employee.id), 'contract_type': contract_type},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
