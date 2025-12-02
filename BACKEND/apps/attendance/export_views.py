from django.views import View
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime, date, timedelta

from apps.attendance.models import Attendance
from apps.attendance.services import AttendanceService
from apps.pdf_templates.generators.attendance import AttendanceGenerator
from .excel_generators import AttendanceExcelGenerator

class BaseExportView(View):
    """Base view for all export views with manual JWT Auth"""
    
    def dispatch(self, request, *args, **kwargs):
        # Manually authenticate using JWT
        auth = JWTAuthentication()
        try:
            # authenticate() returns a tuple (User, Token) or None
            result = auth.authenticate(request)
            if result is not None:
                request.user = result[0]
            else:
                # If no token, check if session auth is active (fallback)
                if not request.user.is_authenticated:
                    return JsonResponse({'error': 'Authentication required'}, status=401)
        except Exception as e:
            return JsonResponse({'error': f'Authentication failed: {str(e)}'}, status=401)
            
        return super().dispatch(request, *args, **kwargs)
    
    def get_date_param(self, param_name='date'):
        date_str = self.request.GET.get(param_name)
        if date_str:
            try:
                return datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return None
        return date.today()

    def get_format(self):
        return self.request.GET.get('format', 'pdf').lower()

    def handle_error(self, message, status=400):
        return JsonResponse({'error': message}, status=status)

class DailyExportView(BaseExportView):
    def get(self, request):
        report_date = self.get_date_param()
        export_format = self.get_format()
        
        try:
            # Récupérer les données
            attendances = Attendance.objects.filter(
                company=request.user.company,
                date=report_date
            ).select_related('employee__user', 'schedule').order_by('-date', '-check_in')
            
            summary = AttendanceService.get_daily_stats(request.user.company, report_date)
            filename = f"presences_journalieres_{report_date.strftime('%Y%m%d')}"
            
            if export_format == 'excel':
                # Préparer les données pour Excel
                excel_data = []
                for att in attendances:
                    excel_data.append({
                        'Employé': att.employee.user.get_full_name(),
                        'Département': att.employee.department or '-',
                        'Arrivée': att.check_in.strftime("%H:%M") if att.check_in else '-',
                        'Départ': att.check_out.strftime("%H:%M") if att.check_out else '-',
                        'Statut': att.get_status_display(),
                        'Retard (min)': att.delay_minutes,
                        'Heures': att.worked_hours
                    })
                
                exporter = AttendanceExcelGenerator(company=request.user.company)
                return exporter.generate_daily_report({
                    'date': report_date.strftime('%d/%m/%Y'),
                    'summary': summary,
                    'attendances': excel_data
                }, filename)
                
            else:
                # PDF
                # Note: AttendanceGenerator logic might need update if it expects specific object attributes
                # We pass objects directly as they now have the correct attributes (delay_minutes, etc.)
                
                # Préparer les données enrichies pour le template PDF
                attendances_list = []
                for att in attendances:
                    # Les attributs sont déjà sur le modèle, mais le template attend peut-être delay/hours
                    att.delay = att.delay_minutes
                    att.hours = att.worked_hours
                    attendances_list.append(att)
                
                # Anomalies (Simple detection for now)
                anomalies = []
                for att in attendances:
                    if att.status == 'late':
                        anomalies.append(f"{att.employee.user.get_full_name()} : Retard de {att.delay_minutes} min")
                    elif att.status == 'absent':
                        anomalies.append(f"{att.employee.user.get_full_name()} : Absent")

                report_data = {
                    'date': report_date.strftime('%d/%m/%Y'),
                    'summary': summary,
                    'anomalies': anomalies,
                    'attendances': []
                }
                
                for att in attendances_list:
                    report_data['attendances'].append({
                        'employee': att.employee.user.get_full_name(),
                        'department': att.employee.department or '-',
                        'check_in': att.check_in.strftime("%H:%M") if att.check_in else '-',
                        'check_out': att.check_out.strftime("%H:%M") if att.check_out else '-',
                        'status': att.get_status_display(),
                        'delay': att.delay_minutes,
                        'hours': att.worked_hours
                    })
                
                generator = AttendanceGenerator(company=request.user.company)
                return generator.generate_daily_report(report_data, filename)

        except Exception as e:
            import traceback
            print(f"ERROR in DailyExportView: {traceback.format_exc()}")
            return self.handle_error(str(e), status=500)

class MonthlyExportView(BaseExportView):
    def get(self, request):
        try:
            month = int(request.GET.get('month', date.today().month))
            year = int(request.GET.get('year', date.today().year))
            export_format = self.get_format()
            
            stats = AttendanceService.get_monthly_stats(request.user.company, year, month)
            employee_stats = AttendanceService.get_employee_monthly_stats(request.user.company, year, month)
            
            month_name = date(year, month, 1).strftime('%B %Y')
            report_data = {
                'month': month_name,
                'stats': stats,
                'employee_stats': employee_stats,
                'department_stats': [],
                'alerts': []
            }
            
            # Alertes
            for emp_stat in employee_stats:
                if emp_stat['attendance_rate'] < 80:
                    report_data['alerts'].append({
                        'employee_name': emp_stat['employee_name'],
                        'message': f"Taux de présence: {emp_stat['attendance_rate']:.1f}%"
                    })
            
            filename = f"presences_mensuelles_{year}{month:02d}"
            
            if export_format == 'excel':
                exporter = AttendanceExcelGenerator(company=request.user.company)
                return exporter.generate_monthly_advanced_report(report_data, filename)
            else:
                generator = AttendanceGenerator(company=request.user.company)
                return generator.generate_monthly_advanced_report(report_data, filename)

        except Exception as e:
            import traceback
            print(f"ERROR in MonthlyExportView: {traceback.format_exc()}")
            return self.handle_error(str(e), status=500)
