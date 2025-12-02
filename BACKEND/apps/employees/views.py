from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Q
from datetime import date, datetime, timedelta

from .models import Employee
from .serializers import EmployeeSerializer
from apps.leaves.models import Leave
from apps.attendance.models import Attendance
from apps.payroll.models import Payroll
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
        return Employee.objects.filter(company=self.request.user.company).order_by('user__last_name', 'user__first_name')

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
        Génère le dossier complet de l'employé.
        
        Inclut : infos personnelles, professionnelles, historique congés,
        historique présence, historique paie, documents joints.
        
        Query params:
            - export_format: pdf, excel, csv (défaut: pdf)
        """
        employee = self.get_object()
        export_format = request.query_params.get('export_format', 'pdf').lower()
        
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
        
        # Documents (optional - may not exist in all setups)
        documents = []
        try:
            from apps.documents.models import Document
            documents = Document.objects.filter(
                employee=employee
            ).order_by('-created_at')[:10]
        except (ImportError, AttributeError):
            pass
        
        branding = self._get_employee_branding(employee)
        
        if export_format == 'excel':
            # Export Excel multi-feuilles
            sheets_data = []
            
            # Feuille 1: Informations personnelles
            personal_data = [{
                'Matricule': str(employee.id)[:8],
                'Nom': employee.user.last_name,
                'Prénom': employee.user.first_name,
                'Email': employee.user.email,
                'Téléphone': employee.phone or '',
                'Adresse': employee.address or '',
                'Poste': employee.position,
                'Département': employee.department or '',
                'Date d\'embauche': employee.date_hired.strftime('%d/%m/%Y') if employee.date_hired else '',
                'Ancienneté (ans)': years_of_service,
                'Salaire de base': float(employee.base_salary),
            }]
            sheets_data.append({'name': 'Infos Personnelles', 'data': personal_data})
            
            # Feuille 2: Historique congés
            leaves_data = []
            for leave in leaves:
                days_count = (leave.end_date - leave.start_date).days + 1 if leave.start_date and leave.end_date else 0
                leaves_data.append({
                    'Type': leave.get_leave_type_display(),
                    'Date début': leave.start_date.strftime('%d/%m/%Y'),
                    'Date fin': leave.end_date.strftime('%d/%m/%Y'),
                    'Nombre de jours': days_count,
                    'Statut': leave.get_status_display(),
                    'Raison': leave.reason or '',
                })
            if leaves_data:
                sheets_data.append({'name': 'Historique Congés', 'data': leaves_data})
            
            # Feuille 3: Historique présence
            attendance_data = []
            for record in attendance_records:
                attendance_data.append({
                    'Date': record.date.strftime('%d/%m/%Y'),
                    'Arrivée': record.check_in.strftime('%H:%M') if record.check_in else '',
                    'Départ': record.check_out.strftime('%H:%M') if record.check_out else '',
                    'Statut': record.get_status_display(),
                    'Notes': record.notes or '',
                })
            if attendance_data:
                sheets_data.append({'name': 'Historique Présence', 'data': attendance_data})
            
            # Feuille 4: Historique paie
            payroll_data = []
            for payroll in payrolls:
                payroll_data.append({
                    'Période': f"{payroll.month:02d}/{payroll.year}",
                    'Salaire de base': float(payroll.basic_salary),
                    'Primes': float(payroll.bonus),
                    'Déductions': float(payroll.deductions),
                    'Salaire net': float(payroll.net_salary),
                    'Payé': 'Oui' if payroll.is_paid else 'Non',
                    'Date de paiement': payroll.payment_date.strftime('%d/%m/%Y') if payroll.payment_date else '',
                })
            if payroll_data:
                sheets_data.append({'name': 'Historique Paie', 'data': payroll_data})
            
            exporter = AdvancedExcelExporter(
                data=[],
                filename=f"dossier_complet_{employee.user.last_name}_{employee.user.first_name}",
                sheets_data=sheets_data,
                company=request.user.company,
                user=request.user
            )
            
            # Logger l'export
            ExportLog.objects.create(
                company=request.user.company,
                user=request.user,
                export_type='excel',
                module='employees',
                document_name=f"Dossier complet {employee.user.get_full_name()}",
                parameters={'employee_id': str(employee.id), 'format': 'excel'},
                status='completed',
                started_at=timezone.now(),
                completed_at=timezone.now()
            )
            
            return exporter.export()
        
        elif export_format == 'csv':
            # Export CSV: toutes les données dans un seul fichier
            csv_data = []
            
            # Section: Informations personnelles
            csv_data.append({
                'Section': 'INFORMATIONS PERSONNELLES',
                'Champ': 'Matricule',
                'Valeur': str(employee.id)[:8],
                'Détails': ''
            })
            csv_data.append({
                'Section': 'INFORMATIONS PERSONNELLES',
                'Champ': 'Nom complet',
                'Valeur': employee.user.get_full_name(),
                'Détails': ''
            })
            csv_data.append({
                'Section': 'INFORMATIONS PERSONNELLES',
                'Champ': 'Email',
                'Valeur': employee.user.email,
                'Détails': ''
            })
            csv_data.append({
                'Section': 'INFORMATIONS PERSONNELLES',
                'Champ': 'Poste',
                'Valeur': employee.position,
                'Détails': employee.department or ''
            })
            csv_data.append({
                'Section': 'INFORMATIONS PERSONNELLES',
                'Champ': 'Ancienneté',
                'Valeur': f"{years_of_service} ans",
                'Détails': employee.date_hired.strftime('%d/%m/%Y') if employee.date_hired else ''
            })
            
            # Section: Congés
            for leave in leaves:
                days_count = (leave.end_date - leave.start_date).days + 1 if leave.start_date and leave.end_date else 0
                csv_data.append({
                    'Section': 'CONGÉS',
                    'Champ': leave.get_leave_type_display(),
                    'Valeur': f"{leave.start_date.strftime('%d/%m/%Y')} - {leave.end_date.strftime('%d/%m/%Y')}",
                    'Détails': f"{days_count} jours - {leave.get_status_display()}"
                })
            
            # Section: Présence
            csv_data.append({
                'Section': 'PRÉSENCE (30 derniers jours)',
                'Champ': 'Présent',
                'Valeur': str(attendance_summary['present']),
                'Détails': ''
            })
            csv_data.append({
                'Section': 'PRÉSENCE (30 derniers jours)',
                'Champ': 'Retards',
                'Valeur': str(attendance_summary['late']),
                'Détails': ''
            })
            csv_data.append({
                'Section': 'PRÉSENCE (30 derniers jours)',
                'Champ': 'Absences',
                'Valeur': str(attendance_summary['absent']),
                'Détails': ''
            })
            
            # Section: Paie
            for payroll in payrolls:
                csv_data.append({
                    'Section': 'PAIE',
                    'Champ': f"{payroll.month:02d}/{payroll.year}",
                    'Valeur': f"{float(payroll.net_salary):.2f} €",
                    'Détails': f"Base: {float(payroll.basic_salary):.2f} € - Primes: {float(payroll.bonus):.2f} €"
                })
            
            exporter = UTF8CSVExporter(
                data=csv_data,
                filename=f"dossier_complet_{employee.user.last_name}_{employee.user.first_name}",
                company=request.user.company,
                user=request.user
            )
            
            # Logger l'export
            ExportLog.objects.create(
                company=request.user.company,
                user=request.user,
                export_type='csv',
                module='employees',
                document_name=f"Dossier complet {employee.user.get_full_name()}",
                parameters={'employee_id': str(employee.id), 'format': 'csv'},
                status='completed',
                started_at=timezone.now(),
                completed_at=timezone.now()
            )
            
            return exporter.export()
        
        else:  # PDF (défaut)
            from apps.pdf_templates.generators.employee_file import EmployeeFileGenerator
            
            # Préparer les données pour le générateur
            data = {
                'employee_name': f"{employee.user.first_name} {employee.user.last_name}",
                'employee_id': str(employee.id)[:8],
                'personal_info': {
                    'birth_date': 'N/A',
                    'birth_place': 'N/A',
                    'nationality': 'N/A',
                    'marital_status': 'N/A',
                    'children_count': 0,
                },
                'contact_info': {
                    'address': employee.address or 'N/A',
                    'phone': employee.phone or 'N/A',
                    'email': employee.user.email,
                    'emergency_contact': 'N/A',
                },
                'professional_info': {
                    'position': employee.position,
                    'department': employee.department or 'N/A',
                    'hire_date': employee.date_hired.strftime('%d/%m/%Y') if employee.date_hired else 'N/A',
                    'contract_type': 'CDI',
                    'base_salary': float(employee.base_salary),
                },
                'documents': [
                    {'type': doc.document_type if hasattr(doc, 'document_type') else 'Document', 
                     'date': doc.created_at.strftime('%d/%m/%Y') if hasattr(doc, 'created_at') else 'N/A'}
                    for doc in documents
                ] if documents else []
            }
            
            generator = EmployeeFileGenerator(company=request.user.company)
            
            # Logger l'export
            ExportLog.objects.create(
                company=request.user.company,
                user=request.user,
                export_type='pdf',
                module='employees',
                document_name=f"Dossier complet {employee.user.get_full_name()}",
                parameters={'employee_id': str(employee.id), 'format': 'pdf'},
                status='completed',
                started_at=timezone.now(),
                completed_at=timezone.now()
            )
            
            filename = f"dossier_complet_{employee.user.last_name}_{employee.user.first_name}"
            return generator.generate(data, filename)
    
    @action(detail=True, methods=['get'], url_path='export/work-certificate-advanced')
    def export_work_certificate_advanced(self, request, pk=None):
        """
        Génère une attestation de travail avec ReportLab.
        """
        from apps.pdf_templates.generators.certificate import CertificateGenerator
        
        employee = self.get_object()
        
        data = {
            'employee_name': f"{employee.user.first_name} {employee.user.last_name}",
            'employee_id': str(employee.id)[:8],
            'position': employee.position,
            'department': employee.department or 'N/A',
            'hire_date': employee.date_hired,
        }
        
        generator = CertificateGenerator(
            company=request.user.company,
            certificate_type='work_certificate'
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
        
        filename = f"attestation_travail_{employee.user.last_name}_{employee.user.first_name}"
        return generator.generate(data, filename)
    
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
        Génère une lettre de mutation avec ReportLab.
        
        Query params:
            - new_position: Nouveau poste
            - new_department: Nouveau département
            - new_salary: Nouveau salaire (optionnel)
            - effective_date: Date d'effet (YYYY-MM-DD)
        """
        from apps.pdf_templates.generators.contract import ContractGenerator
        
        employee = self.get_object()
        
        # Récupérer les paramètres
        new_position = request.query_params.get('new_position', employee.position)
        new_department = request.query_params.get('new_department', employee.department)
        new_salary_str = request.query_params.get('new_salary')
        effective_date_str = request.query_params.get('effective_date')
        
        # Parser la date
        if effective_date_str:
            try:
                effective_date = datetime.strptime(effective_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Format de date invalide (YYYY-MM-DD requis)'}, status=400)
        else:
            effective_date = date.today() + timedelta(days=30)
        
        new_salary = employee.base_salary
        if new_salary_str:
            try:
                new_salary = float(new_salary_str)
            except ValueError:
                pass
        
        data = {
            'employee_name': f"{employee.user.first_name} {employee.user.last_name}",
            'new_position': new_position,
            'new_department': new_department,
            'effective_date': effective_date.strftime('%d/%m/%Y'),
            'new_salary': float(new_salary),
        }
        
        generator = ContractGenerator(
            company=request.user.company,
            contract_type='transfer_letter'
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
        
        filename = f"lettre_mutation_{employee.user.last_name}_{employee.user.first_name}"
        return generator.generate(data, filename)

    @action(detail=True, methods=['get'], url_path='export/termination-letter-advanced')
    def export_termination_letter_advanced(self, request, pk=None):
        """
        Génère une lettre de fin de contrat avec ReportLab.
        
        Query params:
            - end_date: Date de fin (YYYY-MM-DD)
            - termination_type: resignation, dismissal, end_of_contract, mutual_agreement
        """
        from apps.pdf_templates.generators.contract import ContractGenerator
        
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
        
        # Mapper le type de licenciement vers une raison lisible
        termination_reasons = {
            'resignation': 'démission',
            'dismissal': 'licenciement',
            'end_of_contract': 'fin de contrat',
            'mutual_agreement': 'rupture conventionnelle'
        }
        termination_reason = termination_reasons.get(termination_type, 'raisons économiques')
        
        data = {
            'employee_name': f"{employee.user.first_name} {employee.user.last_name}",
            'last_day': end_date.strftime('%d/%m/%Y'),
            'termination_reason': termination_reason,
        }
        
        generator = ContractGenerator(
            company=request.user.company,
            contract_type='termination_letter'
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='employees',
            document_name=f"Lettre de fin de contrat {employee.user.get_full_name()}",
            parameters={'employee_id': str(employee.id), 'termination_type': termination_type},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        filename = f"lettre_fin_contrat_{employee.user.last_name}_{employee.user.first_name}"
        return generator.generate(data, filename)

    @action(detail=True, methods=['get'], url_path='export/work-contract-advanced')
    def export_work_contract_advanced(self, request, pk=None):
        """
        Génère un contrat de travail avec ReportLab.
        
        Query params:
            - contract_type: CDI, CDD, STAGE
            - start_date: Date de début (YYYY-MM-DD)
            - salary: Salaire (défaut: base_salary de l'employé)
        """
        from apps.pdf_templates.generators.contract import ContractGenerator
        
        employee = self.get_object()
        
        contract_type = request.query_params.get('contract_type', 'CDI')
        start_date_str = request.query_params.get('start_date')
        salary_str = request.query_params.get('salary')
        
        # Date de début
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                start_date = employee.date_hired or date.today()
        else:
            start_date = employee.date_hired or date.today()
        
        # Salaire
        salary = employee.base_salary
        if salary_str:
            try:
                salary = float(salary_str)
            except ValueError:
                pass
        
        data = {
            'employee_name': f"{employee.user.first_name} {employee.user.last_name}",
            'birth_date': 'N/A',
            'employee_address': 'N/A',
            'position': employee.position,
            'department': employee.department or 'N/A',
            'start_date': start_date.strftime('%d/%m/%Y'),
            'salary': float(salary),
            'contract_duration': 'indéterminée' if contract_type == 'CDI' else 'déterminée',
            'working_hours': '40',
            'trial_period': '3',
        }
        
        generator = ContractGenerator(
            company=request.user.company,
            contract_type='work_contract'
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
        
        filename = f"contrat_travail_{employee.user.last_name}_{employee.user.first_name}"
        return generator.generate(data, filename)
    
    # ============= NOUVEAUX EXPORTS MULTI-FORMAT =============
    
    def _get_employee_branding(self, employee):
        """Récupère le branding de l'entreprise ou utilise les valeurs par défaut."""
        try:
            branding = employee.company.branding
            return {
                'primary_color': branding.primary_color,
                'secondary_color': branding.secondary_color,
                'accent_color': branding.accent_color,
                'header_text': branding.header_text,
                'footer_text': branding.footer_text,
                'signature_name': branding.signature_name,
                'signature_title': branding.signature_title,
            }
        except:
            return {
                'primary_color': '#4472C4',
                'secondary_color': '#2e7d32',
                'accent_color': '#ed6c02',
                'header_text': '',
                'footer_text': '',
                'signature_name': '',
                'signature_title': '',
            }
    
    @action(detail=True, methods=['get'], url_path='export/personal-info')
    def export_personal_info(self, request, pk=None):
        """
        Export de la fiche personnelle uniquement.
        
        Query params:
            - export_format: pdf, excel (défaut: pdf)
        """
        employee = self.get_object()
        export_format = request.query_params.get('export_format', 'pdf').lower()
        
        # Calculer l'ancienneté
        years_of_service = 0
        if employee.date_hired:
            delta = date.today() - employee.date_hired
            years_of_service = delta.days // 365
        
        branding = self._get_employee_branding(employee)
        
        if export_format == 'excel':
            data = [{
                'Matricule': str(employee.id)[:8],
                'Nom': employee.user.last_name,
                'Prénom': employee.user.first_name,
                'Email': employee.user.email,
                'Téléphone': employee.phone or '',
                'Adresse': employee.address or '',
                'Poste': employee.position,
                'Département': employee.department or '',
                'Date d\'embauche': employee.date_hired.strftime('%d/%m/%Y') if employee.date_hired else '',
                'Ancienneté (ans)': years_of_service,
                'Salaire de base': float(employee.base_salary),
            }]
            
            exporter = AdvancedExcelExporter(
                data=data,
                filename=f"fiche_personnelle_{employee.user.last_name}_{employee.user.first_name}",
                sheet_name="Informations Personnelles",
                company=request.user.company,
                user=request.user
            )
            return exporter.export()
        
        else:  # PDF
            context = {
                'employee': employee,
                'years_of_service': years_of_service,
                'branding': branding
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"fiche_personnelle_{employee.user.last_name}_{employee.user.first_name}",
                template_name='exports/pdf/personal_info_simple.html',
                title=f"Fiche Personnelle - {employee.user.get_full_name()}",
                company=request.user.company,
                user=request.user,
                context=context
            )
            return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/leaves-history')
    def export_leaves_history(self, request, pk=None):
        """
        Export de l'historique des congés.
        
        Query params:
            - export_format: pdf, excel, csv (défaut: pdf)
            - year: année (optionnel, défaut: toutes)
        """
        employee = self.get_object()
        export_format = request.query_params.get('export_format', 'pdf').lower()
        year = request.query_params.get('year')
        
        # Récupérer les congés
        leaves = Leave.objects.filter(employee=employee).order_by('-start_date')
        if year:
            leaves = leaves.filter(start_date__year=year)
        
        branding = self._get_employee_branding(employee)
        
        if export_format in ['excel', 'csv']:
            data = []
            for leave in leaves:
                days_count = (leave.end_date - leave.start_date).days + 1 if leave.start_date and leave.end_date else 0
                data.append({
                    'Type': leave.get_leave_type_display(),
                    'Date début': leave.start_date.strftime('%d/%m/%Y'),
                    'Date fin': leave.end_date.strftime('%d/%m/%Y'),
                    'Nombre de jours': days_count,
                    'Statut': leave.get_status_display(),
                    'Raison': leave.reason or '',
                })
            
            if export_format == 'csv':
                exporter = UTF8CSVExporter(
                    data=data,
                    filename=f"conges_{employee.user.last_name}_{employee.user.first_name}",
                    company=request.user.company,
                    user=request.user
                )
            else:
                exporter = AdvancedExcelExporter(
                    data=data,
                    filename=f"conges_{employee.user.last_name}_{employee.user.first_name}",
                    sheet_name="Historique Congés",
                    company=request.user.company,
                    user=request.user
                )
            return exporter.export()
        
        else:  # PDF - utiliser template simple
            context = {
                'employee': employee,
                'leaves': leaves,
                'year': year,
                'branding': branding
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"conges_{employee.user.last_name}_{employee.user.first_name}",
                template_name='exports/pdf/leaves_history_simple.html',
                title=f"Historique des Congés - {employee.user.get_full_name()}",
                company=request.user.company,
                user=request.user,
                context=context
            )
            return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/attendance-history')
    def export_attendance_history(self, request, pk=None):
        """
        Export de l'historique de présence.
        
        Query params:
            - export_format: pdf, excel, csv (défaut: pdf)
            - month: mois (1-12, optionnel)
            - year: année (optionnel)
            - days: nombre de jours (défaut: 30)
        """
        employee = self.get_object()
        export_format = request.query_params.get('export_format', 'pdf').lower()
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        days = int(request.query_params.get('days', 30))
        
        # Récupérer les présences
        if month and year:
            attendance_records = Attendance.objects.filter(
                employee=employee,
                date__month=month,
                date__year=year
            ).order_by('-date')
        else:
            start_date = date.today() - timedelta(days=days)
            attendance_records = Attendance.objects.filter(
                employee=employee,
                date__gte=start_date
            ).order_by('-date')
        
        branding = self._get_employee_branding(employee)
        
        if export_format in ['excel', 'csv']:
            data = []
            for record in attendance_records:
                data.append({
                    'Date': record.date.strftime('%d/%m/%Y'),
                    'Arrivée': record.check_in.strftime('%H:%M') if record.check_in else '',
                    'Départ': record.check_out.strftime('%H:%M') if record.check_out else '',
                    'Statut': record.get_status_display(),
                    'Notes': record.notes or '',
                })
            
            if export_format == 'csv':
                exporter = UTF8CSVExporter(
                    data=data,
                    filename=f"presence_{employee.user.last_name}_{employee.user.first_name}",
                    company=request.user.company,
                    user=request.user
                )
            else:
                exporter = AdvancedExcelExporter(
                    data=data,
                    filename=f"presence_{employee.user.last_name}_{employee.user.first_name}",
                    sheet_name="Historique Présence",
                    company=request.user.company,
                    user=request.user
                )
            return exporter.export()
        
        else:  # PDF
            # Calculer les statistiques
            attendance_summary = {
                'present': attendance_records.filter(status='present').count(),
                'late': attendance_records.filter(status='late').count(),
                'absent': attendance_records.filter(status='absent').count(),
                'excused': attendance_records.filter(status='excused').count(),
                'total': attendance_records.count()
            }
            
            context = {
                'employee': employee,
                'attendance_records': attendance_records,
                'attendance_summary': attendance_summary,
                'period': f"{days} derniers jours" if not (month and year) else f"{month}/{year}",
                'branding': branding
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"presence_{employee.user.last_name}_{employee.user.first_name}",
                template_name='exports/pdf/attendance_history_simple.html',
                title=f"Historique de Présence - {employee.user.get_full_name()}",
                company=request.user.company,
                user=request.user,
                context=context
            )
            return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/payroll-history')
    def export_payroll_history(self, request, pk=None):
        """
        Export de l'historique de paie.
        
        Query params:
            - format: pdf, excel, csv (défaut: pdf)
            - months: nombre de mois (défaut: 6)
            - year: année spécifique (optionnel)
        """
        employee = self.get_object()
        export_format = request.query_params.get('export_format', 'pdf').lower()
        months = int(request.query_params.get('months', 6))
        year = request.query_params.get('year')
        
        # Récupérer les paies
        payrolls = Payroll.objects.filter(employee=employee).order_by('-year', '-month')
        if year:
            payrolls = payrolls.filter(year=year)
        else:
            payrolls = payrolls[:months]
        
        branding = self._get_employee_branding(employee)
        
        if export_format in ['excel', 'csv']:
            data = []
            for payroll in payrolls:
                data.append({
                    'Période': f"{payroll.month:02d}/{payroll.year}",
                    'Salaire de base': float(payroll.basic_salary),
                    'Primes': float(payroll.bonus),
                    'Déductions': float(payroll.deductions),
                    'Salaire net': float(payroll.net_salary),
                    'Payé': 'Oui' if payroll.is_paid else 'Non',
                    'Date de paiement': payroll.payment_date.strftime('%d/%m/%Y') if payroll.payment_date else '',
                })
            
            if export_format == 'csv':
                exporter = UTF8CSVExporter(
                    data=data,
                    filename=f"paie_{employee.user.last_name}_{employee.user.first_name}",
                    company=request.user.company,
                    user=request.user
                )
            else:
                exporter = AdvancedExcelExporter(
                    data=data,
                    filename=f"paie_{employee.user.last_name}_{employee.user.first_name}",
                    sheet_name="Historique Paie",
                    company=request.user.company,
                    user=request.user,
                    include_formulas=True
                )
            return exporter.export()
        
        else:  # PDF
            # Calculer les totaux
            total_paid = sum(p.net_salary for p in payrolls if p.is_paid)
            total_pending = sum(p.net_salary for p in payrolls if not p.is_paid)
            
            context = {
                'employee': employee,
                'payrolls': payrolls,
                'total_paid': total_paid,
                'total_pending': total_pending,
                'period': f"{months} derniers mois" if not year else f"Année {year}",
                'branding': branding
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"paie_{employee.user.last_name}_{employee.user.first_name}",
                template_name='exports/pdf/payroll_history_simple.html',
                title=f"Historique de Paie - {employee.user.get_full_name()}",
                company=request.user.company,
                user=request.user,
                context=context
            )
            return exporter.export()


