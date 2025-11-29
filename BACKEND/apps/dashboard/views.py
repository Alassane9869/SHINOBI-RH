from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from apps.employees.models import Employee
from apps.leaves.models import Leave
from apps.payroll.models import Payroll
from apps.attendance.models import Attendance
from apps.core.utils.exporters import PDFExporter, ExcelExporter, CSVExporter

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get dashboard stats"""
        company = request.user.company
        today = timezone.now().date()
        current_month = today.month
        current_year = today.year
        
        # Calculate statistics
        total_employees = Employee.objects.filter(company=company).count()
        pending_leaves = Leave.objects.filter(company=company, status='pending').count()
        total_attendances = Attendance.objects.filter(
            company=company,
            date=today
        ).count()
        total_payrolls = Payroll.objects.filter(
            company=company,
            month=current_month,
            year=current_year
        ).count()
        
        payroll_mass = Payroll.objects.filter(
            company=company,
            month=current_month,
            year=current_year
        ).aggregate(Sum('net_salary'))['net_salary__sum'] or 0
        
        # Calculate chart data (last 6 months)
        chart_data = []
        for i in range(5, -1, -1):
            date = today - timedelta(days=i*30)
            month_name = date.strftime('%b')
            # Count employees hired before or on this month
            count = Employee.objects.filter(
                company=company,
                date_hired__lte=date
            ).count()
            chart_data.append({
                "name": month_name,
                "value": count
            })
        
        return Response({
            "total_employees": total_employees,
            "pending_leaves": pending_leaves,
            "total_attendances": total_attendances,
            "total_payrolls": total_payrolls,
            "payroll_mass": payroll_mass,
            "chart_data": chart_data
        })

    @action(detail=False, methods=['get'], url_path='export/pdf')
    def export_pdf(self, request):
        """Export Global HR Report (PDF)"""
        today = timezone.now().date()
        current_month = today.month
        current_year = today.year

        # Gather Data
        total_employees = Employee.objects.filter(company=request.user.company).count()
        leaves_pending = Leave.objects.filter(company=request.user.company, status='pending').count()
        payroll_mass = Payroll.objects.filter(
            company=request.user.company, 
            month=current_month, 
            year=current_year
        ).aggregate(Sum('net_salary'))['net_salary__sum'] or 0

        # Prepare data for PDF
        data = [
            {'Indicateur': 'Nombre d\'employés', 'Valeur': str(total_employees)},
            {'Indicateur': 'Congés en attente', 'Valeur': str(leaves_pending)},
            {'Indicateur': 'Masse salariale (Mois en cours)', 'Valeur': f"{payroll_mass} FCFA"},
            {'Indicateur': 'Date du rapport', 'Valeur': today.strftime("%d/%m/%Y")},
        ]

        exporter = PDFExporter(
            data=data,
            filename=f"rapport_rh_{today.strftime('%Y%m%d')}",
            title=f"Rapport RH Global - {today.strftime('%B %Y')}",
            headers=['Indicateur', 'Valeur'],
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/excel')
    def export_excel(self, request):
        """Export Detailed Stats (Excel)"""
        # Example stats: Employees by department
        employees_by_dept = Employee.objects.filter(company=request.user.company).values('department').annotate(count=Count('id'))
        
        data = []
        for item in employees_by_dept:
            data.append({
                'Département': item['department'] or 'Non assigné',
                'Nombre d\'employés': item['count']
            })

        exporter = ExcelExporter(
            data=data,
            filename=f"stats_rh_{timezone.now().strftime('%Y%m%d')}",
            sheet_name="Statistiques"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/csv')
    def export_csv(self, request):
        """Export Raw Monthly Data (CSV)"""
        # Example: List of all active employees with basic info
        employees = Employee.objects.filter(company=request.user.company).select_related('user')
        
        data = []
        for emp in employees:
            data.append({
                'ID': emp.id,
                'Nom': emp.user.last_name,
                'Prénom': emp.user.first_name,
                'Poste': emp.position,
                'Département': emp.department,
                'Date d\'embauche': emp.date_hired,
                'Salaire Base': emp.base_salary
            })

        exporter = CSVExporter(
            data=data,
            filename=f"donnees_brutes_{timezone.now().strftime('%Y%m%d')}"
        )
        return exporter.export()
