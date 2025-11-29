"""
Nouveaux endpoints d'export multi-format pour les employés.

Ajout de:
- Export fiche personnelle (PDF/Excel)
- Export historique congés (PDF/Excel/CSV)
- Export historique présence (PDF/Excel/CSV)
- Export historique paie (PDF/Excel/CSV)
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from datetime import date, timedelta

from apps.employees.models import Employee
from apps.leaves.models import Leave
from apps.attendance.models import Attendance
from apps.payroll.models import Payroll
from apps.core.utils.advanced_exporters import (
    WeasyPrintPDFExporter,
    AdvancedExcelExporter,
    UTF8CSVExporter
)


def get_employee_branding(employee):
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


# Ajouter ces méthodes à la classe EmployeeViewSet

@action(detail=True, methods=['get'], url_path='export/personal-info')
def export_personal_info(self, request, pk=None):
    """
    Export de la fiche personnelle uniquement.
    
    Query params:
        - format: pdf, excel (défaut: pdf)
    """
    employee = self.get_object()
    export_format = request.query_params.get('format', 'pdf').lower()
    
    # Calculer l'ancienneté
    years_of_service = 0
    if employee.date_hired:
        delta = date.today() - employee.date_hired
        years_of_service = delta.days // 365
    
    branding = get_employee_branding(employee)
    
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
            template_name='exports/pdf/personal_info.html',
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
        - format: pdf, excel, csv (défaut: pdf)
        - year: année (optionnel, défaut: toutes)
    """
    employee = self.get_object()
    export_format = request.query_params.get('format', 'pdf').lower()
    year = request.query_params.get('year')
    
    # Récupérer les congés
    leaves = Leave.objects.filter(employee=employee).order_by('-start_date')
    if year:
        leaves = leaves.filter(start_date__year=year)
    
    branding = get_employee_branding(employee)
    
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
    
    else:  # PDF
        context = {
            'employee': employee,
            'leaves': leaves,
            'year': year,
            'branding': branding
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"conges_{employee.user.last_name}_{employee.user.first_name}",
            template_name='exports/pdf/leaves_history.html',
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
        - format: pdf, excel, csv (défaut: pdf)
        - month: mois (1-12, optionnel)
        - year: année (optionnel)
        - days: nombre de jours (défaut: 30)
    """
    employee = self.get_object()
    export_format = request.query_params.get('format', 'pdf').lower()
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
    
    branding = get_employee_branding(employee)
    
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
            template_name='exports/pdf/attendance_history.html',
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
    export_format = request.query_params.get('format', 'pdf').lower()
    months = int(request.query_params.get('months', 6))
    year = request.query_params.get('year')
    
    # Récupérer les paies
    payrolls = Payroll.objects.filter(employee=employee).order_by('-year', '-month')
    if year:
        payrolls = payrolls.filter(year=year)
    else:
        payrolls = payrolls[:months]
    
    branding = get_employee_branding(employee)
    
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
            template_name='exports/pdf/payroll_history.html',
            title=f"Historique de Paie - {employee.user.get_full_name()}",
            company=request.user.company,
            user=request.user,
            context=context
        )
        return exporter.export()
