from datetime import datetime, date, timedelta
from django.db.models import Sum, Count, Avg, Q
from .models import Attendance, WorkSchedule

class AttendanceService:
    @staticmethod
    def get_or_create_daily_attendance(employee, attendance_date):
        """
        Récupère ou initialise une fiche de présence pour un employé et une date donnée.
        """
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=attendance_date,
            defaults={
                'company': employee.company,
                'status': 'absent' # Par défaut jusqu'au check-in
            }
        )
        
        # Assigner un horaire par défaut si non défini
        if created or not attendance.schedule:
            # TODO: Logique pour trouver l'horaire spécifique de l'employé si implémenté
            # Pour l'instant, on prend le premier horaire de l'entreprise ou on en crée un par défaut
            schedule = WorkSchedule.objects.filter(company=employee.company).first()
            if not schedule:
                schedule = WorkSchedule.objects.create(
                    company=employee.company,
                    name="Horaire Standard",
                    start_time="09:00",
                    end_time="17:00"
                )
            attendance.schedule = schedule
            attendance.save(update_fields=['schedule'])
            
        return attendance

    @staticmethod
    def process_check_in(attendance, time_now, ip_address=None, device_info=None):
        """
        Traite le pointage d'arrivée. Calcule le retard et met à jour le statut.
        """
        attendance.check_in = time_now
        attendance.ip_address = ip_address
        attendance.device_info = device_info
        
        # Calcul du retard
        if attendance.schedule:
            start_time = attendance.schedule.start_time
            grace_period = attendance.schedule.grace_period_minutes
            
            # Conversion en minutes pour comparaison facile
            check_in_minutes = time_now.hour * 60 + time_now.minute
            start_minutes = start_time.hour * 60 + start_time.minute
            
            delay = max(0, check_in_minutes - start_minutes)
            
            if delay > grace_period:
                attendance.status = 'late'
                attendance.delay_minutes = delay
            else:
                attendance.status = 'present'
                attendance.delay_minutes = 0
        else:
            attendance.status = 'present'
        
        attendance.save()
        return attendance

    @staticmethod
    def process_check_out(attendance, time_now):
        """
        Traite le pointage de départ. Calcule les heures travaillées.
        """
        attendance.check_out = time_now
        
        if attendance.check_in:
            # Calcul simple des heures travaillées
            # Note: Pour plus de précision, utiliser datetime.combine
            start_dt = datetime.combine(date.min, attendance.check_in)
            end_dt = datetime.combine(date.min, time_now)
            
            duration = end_dt - start_dt
            hours = duration.total_seconds() / 3600
            attendance.worked_hours = round(hours, 2)
            
        attendance.save()
        return attendance

    @staticmethod
    def get_daily_stats(company, report_date):
        """
        Statistiques pour une journée donnée.
        """
        total_employees = company.employees.count()
        attendances = Attendance.objects.filter(company=company, date=report_date)
        
        stats = {
            'total': total_employees,
            'present': attendances.filter(status='present').count(),
            'late': attendances.filter(status='late').count(),
            'absent': total_employees - attendances.filter(status__in=['present', 'late', 'excused']).count(), # Approximation
            'excused': attendances.filter(status='excused').count(),
        }
        # Correction pour absent: ceux qui n'ont pas de record ou record 'absent'
        # Mais ici on compte les records 'absent' explicitement
        stats['absent'] = attendances.filter(status='absent').count()
        
        return stats

    @staticmethod
    def get_monthly_stats(company, year, month):
        """
        Statistiques globales pour le mois.
        """
        attendances = Attendance.objects.filter(
            company=company, 
            date__year=year, 
            date__month=month
        )
        
        total_records = attendances.count()
        if total_records == 0:
            return {'present_rate': 0, 'late_rate': 0, 'absent_rate': 0}
            
        return {
            'present_rate': (attendances.filter(status='present').count() / total_records) * 100,
            'late_rate': (attendances.filter(status='late').count() / total_records) * 100,
            'absent_rate': (attendances.filter(status='absent').count() / total_records) * 100,
        }

    @staticmethod
    def get_employee_monthly_stats(company, year, month):
        """
        Détail par employé pour le mois.
        """
        from apps.employees.models import Employee
        
        employees = Employee.objects.filter(company=company)
        stats = []
        
        for emp in employees:
            emp_attendances = Attendance.objects.filter(
                employee=emp,
                date__year=year,
                date__month=month
            )
            
            total = emp_attendances.count()
            present = emp_attendances.filter(status='present').count()
            late = emp_attendances.filter(status='late').count()
            absent = emp_attendances.filter(status='absent').count()
            
            # Safe department access
            dept_name = emp.department if emp.department else "-"
            
            stats.append({
                'employee_name': emp.user.get_full_name(),
                'department': dept_name,
                'present': present,
                'late': late,
                'absent': absent,
                'attendance_rate': ((present + late) / total * 100) if total > 0 else 0
            })
            
        return stats
