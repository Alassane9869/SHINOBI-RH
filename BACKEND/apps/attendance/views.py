from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Q, Avg
from datetime import datetime, date, timedelta
from collections import defaultdict

from .models import Attendance
from .serializers import AttendanceSerializer
from apps.accounts.permissions import IsCompanyMember
from apps.core.utils.advanced_exporters import (
    WeasyPrintPDFExporter,
    AdvancedExcelExporter,
    UTF8CSVExporter
)
from apps.core.export_models import ExportLog

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'date']

    def get_queryset(self):
        return Attendance.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=['get'], url_path='export/daily')
    def export_daily(self, request):
        """Export Daily Attendance Report (PDF)"""
        today = date.today()
        attendances = Attendance.objects.filter(
            company=request.user.company,
            date=today
        ).select_related('employee__user')
        
        data = []
        for att in attendances:
            data.append({
                'Employé': f"{att.employee.user.last_name} {att.employee.user.first_name}",
                'Heure Arrivée': att.time_in.strftime("%H:%M") if att.time_in else '-',
                'Heure Départ': att.time_out.strftime("%H:%M") if att.time_out else '-',
                'Statut': att.get_status_display()
            })
            
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"presences_journalieres_{today.strftime('%Y%m%d')}",
            title=f"Rapport Journalier de Présence - {today.strftime('%d/%m/%Y')}",
            headers=['Employé', 'Heure Arrivée', 'Heure Départ', 'Statut'],
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/monthly')
    def export_monthly(self, request):
        """Export Monthly Attendance Report (PDF)"""
        today = date.today()
        attendances = Attendance.objects.filter(
            company=request.user.company,
            date__month=today.month,
            date__year=today.year
        ).select_related('employee__user').order_by('date', 'employee__user__last_name')
        
        data = []
        for att in attendances:
            data.append({
                'Date': att.date.strftime("%d/%m/%Y"),
                'Employé': f"{att.employee.user.last_name} {att.employee.user.first_name}",
                'Arrivée': att.time_in.strftime("%H:%M") if att.time_in else '-',
                'Départ': att.time_out.strftime("%H:%M") if att.time_out else '-',
                'Statut': att.get_status_display()
            })
            
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"presences_mensuelles_{today.strftime('%Y%m')}",
            title=f"Rapport Mensuel de Présence - {today.strftime('%B %Y')}",
            headers=['Date', 'Employé', 'Arrivée', 'Départ', 'Statut'],
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/hours')
    def export_hours(self, request):
        """Export Hours Worked Report (Excel)"""
        today = date.today()
        attendances = Attendance.objects.filter(
            company=request.user.company,
            date__month=today.month,
            date__year=today.year
        ).select_related('employee__user').order_by('employee__user__last_name', 'date')
        
        data = []
        for att in attendances:
            data.append({
                'Employé': f"{att.employee.user.last_name} {att.employee.user.first_name}",
                'Date': att.date.strftime("%d/%m/%Y"),
                'Arrivée': att.time_in.strftime("%H:%M") if att.time_in else '-',
                'Départ': att.time_out.strftime("%H:%M") if att.time_out else '-',
                'Statut': att.get_status_display()
            })
            
        from apps.core.utils.exporters import ExcelExporter
        exporter = ExcelExporter(
            data=data,
            filename=f"heures_travaillees_{today.strftime('%Y%m')}",
            sheet_name="Heures Travaillées"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/timesheet')
    def export_timesheet(self, request):
        """Export Timesheet (PDF)"""
        return self.export_monthly(request)
    
    @action(detail=False, methods=['get'], url_path='export/daily-advanced')
    def export_daily_advanced(self, request):
        """
        Rapport quotidien de présence avancé avec statistiques et anomalies.
        
        Query params:
            - date: Date du rapport (YYYY-MM-DD, optionnel, défaut: aujourd'hui)
            - format: pdf, excel ou csv (défaut: pdf)
        """
        report_date_str = request.query_params.get('date')
        export_format = request.query_params.get('format', 'pdf').lower()
        
        if report_date_str:
            try:
                report_date = datetime.strptime(report_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Format de date invalide (YYYY-MM-DD requis)'}, status=400)
        else:
            report_date = date.today()
        
        # Récupérer les présences du jour
        attendances = self.get_queryset().filter(
            date=report_date
        ).select_related('employee__user', 'employee')
        
        if not attendances.exists():
            return Response({'error': 'Aucune donnée pour cette date'}, status=404)
        
        # Calcul des statistiques
        summary = {
            'present': attendances.filter(status='present').count(),
            'late': attendances.filter(status='late').count(),
            'absent': attendances.filter(status='absent').count(),
            'excused': attendances.filter(status='excused').count()
        }
        
        # Détecter les anomalies
        anomalies = []
        for att in attendances:
            if att.status == 'present' and not att.check_in:
                anomalies.append(f"{att.employee.user.get_full_name()} : Marqué présent mais sans pointage d'arrivée")
            if att.check_out and att.check_in and att.check_out < att.check_in:
                anomalies.append(f"{att.employee.user.get_full_name()} : Heure de départ antérieure à l'arrivée")
        
        # Calculer heures et retards
        attendances_list = []
        for att in attendances:
            hours_worked = None
            delay_minutes = None
            
            if att.check_in and att.check_out:
                hours = (datetime.combine(date.min, att.check_out) - 
                        datetime.combine(date.min, att.check_in)).total_seconds() / 3600
                hours_worked = round(hours, 2)
            
            if att.status == 'late' and att.check_in:
                # Supposer une heure d'arrivée standard de 8h00
                standard_time = datetime.strptime('08:00', '%H:%M').time()
                if att.check_in > standard_time:
                    delay = (datetime.combine(date.min, att.check_in) - 
                            datetime.combine(date.min, standard_time)).total_seconds() / 60
                    delay_minutes = int(delay)
            
            att.hours_worked = hours_worked
            att.delay_minutes = delay_minutes
            attendances_list.append(att)
        
        if export_format in ['excel', 'csv']:
            # Export tabulaire
            data = []
            for att in attendances_list:
                data.append({
                    'Employé': att.employee.user.get_full_name(),
                    'Département': att.employee.department or '',
                    'Arrivée': att.check_in.strftime('%H:%M') if att.check_in else '',
                    'Départ': att.check_out.strftime('%H:%M') if att.check_out else '',
                    'Heures': att.hours_worked or 0,
                    'Statut': att.get_status_display(),
                    'Retard (min)': att.delay_minutes or 0,
                    'Notes': att.notes or ''
                })
            
            if export_format == 'csv':
                exporter = UTF8CSVExporter(
                    data=data,
                    filename=f"presence_quotidienne_{report_date.strftime('%Y%m%d')}",
                    company=request.user.company,
                    user=request.user
                )
            else:
                exporter = AdvancedExcelExporter(
                    data=data,
                    filename=f"presence_quotidienne_{report_date.strftime('%Y%m%d')}",
                    sheet_name=f"Présence {report_date.strftime('%d/%m/%Y')}",
                    company=request.user.company,
                    user=request.user
                )
        else:
            # Export PDF
            context = {
                'report_date': report_date,
                'attendances': attendances_list,
                'summary': summary,
                'anomalies': anomalies
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"presence_quotidienne_{report_date.strftime('%Y%m%d')}",
                template_name='exports/pdf/daily_attendance.html',
                title=f"Rapport de Présence - {report_date.strftime('%d/%m/%Y')}",
                subtitle=f"{len(attendances_list)} employé(s)",
                company=request.user.company,
                user=request.user,
                context=context
            )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type=export_format,
            module='attendance',
            document_name=f"Présence quotidienne {report_date.strftime('%d/%m/%Y')}",
            parameters={'date': report_date.isoformat(), 'format': export_format},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=False, methods=['get'], url_path='export/monthly-advanced')
    def export_monthly_advanced(self, request):
        """
        Récapitulatif mensuel de présence avec statistiques détaillées.
        
        Query params:
            - month: Mois (1-12)
            - year: Année
            - format: pdf ou excel (défaut: pdf)
        """
        month = request.query_params.get('month', date.today().month)
        year = request.query_params.get('year', date.today().year)
        export_format = request.query_params.get('format', 'pdf').lower()
        
        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return Response({'error': 'Mois et année doivent être des nombres'}, status=400)
        
        # Récupérer toutes les présences du mois
        attendances = self.get_queryset().filter(
            date__month=month,
            date__year=year
        ).select_related('employee__user', 'employee')
        
        if not attendances.exists():
            return Response({'error': 'Aucune donnée pour cette période'}, status=404)
        
        # Calculer les jours ouvrés (approximation)
        import calendar
        _, last_day = calendar.monthrange(year, month)
        working_days = sum(1 for day in range(1, last_day + 1) 
                          if date(year, month, day).weekday() < 5)  # Lundi-Vendredi
        
        # Statistiques globales
        stats = {
            'total_present': attendances.filter(status='present').count(),
            'total_late': attendances.filter(status='late').count(),
            'total_absent': attendances.filter(status='absent').count(),
            'total_excused': attendances.filter(status='excused').count(),
            'total_hours': 0,
            'present_rate': 0,
            'late_rate': 0,
            'absent_rate': 0,
            'present_trend': 0,  # À calculer avec le mois précédent
            'late_trend': 0,
            'absent_trend': 0
        }
        
        total_records = attendances.count()
        if total_records > 0:
            stats['present_rate'] = (stats['total_present'] / total_records) * 100
            stats['late_rate'] = (stats['total_late'] / total_records) * 100
            stats['absent_rate'] = (stats['total_absent'] / total_records) * 100
        
        # Statistiques par employé
        from apps.employees.models import Employee
        employees = Employee.objects.filter(company=request.user.company)
        total_employees = employees.count()
        
        employee_stats = []
        for emp in employees:
            emp_attendances = attendances.filter(employee=emp)
            emp_count = emp_attendances.count()
            
            emp_stat = {
                'employee_name': emp.user.get_full_name(),
                'department': emp.department,
                'present': emp_attendances.filter(status='present').count(),
                'late': emp_attendances.filter(status='late').count(),
                'absent': emp_attendances.filter(status='absent').count(),
                'excused': emp_attendances.filter(status='excused').count(),
                'attendance_rate': 0
            }
            
            if working_days > 0:
                emp_stat['attendance_rate'] = ((emp_stat['present'] + emp_stat['late']) / working_days) * 100
            
            employee_stats.append(emp_stat)
        
        # Statistiques par département
        department_stats = []
        departments = set(emp.department for emp in employees if emp.department)
        
        for dept in departments:
            dept_employees = employees.filter(department=dept)
            dept_attendances = attendances.filter(employee__in=dept_employees)
            dept_count = dept_attendances.count()
            
            if dept_count > 0:
                presence = dept_attendances.filter(Q(status='present') | Q(status='late')).count()
                absence = dept_attendances.filter(status='absent').count()
                
                department_stats.append({
                    'name': dept,
                    'employee_count': dept_employees.count(),
                    'presence_rate': (presence / dept_count) * 100,
                    'absence_rate': (absence / dept_count) * 100
                })
        
        # Alertes (employés avec taux de présence < 80%)
        alerts = []
        for emp_stat in employee_stats:
            if emp_stat['attendance_rate'] < 80:
                alerts.append({
                    'employee_name': emp_stat['employee_name'],
                    'message': f"Taux de présence critique : {emp_stat['attendance_rate']:.1f}%"
                })
        
        # Noms des mois
        months = {
            1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
            5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
            9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
        }
        month_name = months.get(month, str(month))
        
        if export_format == 'excel':
            # Créer 3 sheets : Résumé, Détails, Statistiques
            sheets_data = [
                {
                    'name': 'Résumé',
                    'data': [{
                        'Indicateur': 'Présents',
                        'Valeur': stats['total_present'],
                        'Taux': f"{stats['present_rate']:.1f}%"
                    }, {
                        'Indicateur': 'Retards',
                        'Valeur': stats['total_late'],
                        'Taux': f"{stats['late_rate']:.1f}%"
                    }, {
                        'Indicateur': 'Absents',
                        'Valeur': stats['total_absent'],
                        'Taux': f"{stats['absent_rate']:.1f}%"
                    }]
                },
                {
                    'name': 'Par Employé',
                    'data': [{
                        'Employé': s['employee_name'],
                        'Département': s['department'] or '',
                        'Présent': s['present'],
                        'Retards': s['late'],
                        'Absences': s['absent'],
                        'Excusés': s['excused'],
                        'Taux Présence %': round(s['attendance_rate'], 1)
                    } for s in employee_stats]
                },
                {
                    'name': 'Par Département',
                    'data': [{
                        'Département': d['name'],
                        'Effectif': d['employee_count'],
                        'Taux Présence %': round(d['presence_rate'], 1),
                        'Taux Absence %': round(d['absence_rate'], 1)
                    } for d in department_stats] if department_stats else [{'Info': 'Aucune donnée'}]
                }
            ]
            
            exporter = AdvancedExcelExporter(
                data=[],  # Utilisera sheets_data
                filename=f"presence_mensuelle_{month_name}_{year}",
                sheets_data=sheets_data,
                company=request.user.company,
                user=request.user
            )
        else:
            # Export PDF
            context = {
                'month_name': month_name,
                'year': year,
                'total_employees': total_employees,
                'working_days': working_days,
                'stats': stats,
                'employee_stats': employee_stats,
                'department_stats': department_stats,
                'alerts': alerts
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"presence_mensuelle_{month_name}_{year}",
                template_name='exports/pdf/monthly_attendance.html',
                title=f"Récapitulatif Présence - {month_name} {year}",
                subtitle=f"{total_employees} employé(s) · {stats['present_rate']:.1f}% présence",
                company=request.user.company,
                user=request.user,
                context=context
            )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type=export_format,
            module='attendance',
            document_name=f"Présence mensuelle {month_name} {year}",
            parameters={'month': month, 'year': year},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
