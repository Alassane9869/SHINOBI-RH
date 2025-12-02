from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company
from apps.employees.models import Employee
from django.utils.translation import gettext_lazy as _

class WorkSchedule(BaseModel):
    """
    Définit les horaires de travail pour une entreprise ou des employés spécifiques.
    """
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='work_schedules')
    name = models.CharField(max_length=100, verbose_name=_("Nom de l'horaire"))
    
    # Horaires standard
    start_time = models.TimeField(verbose_name=_("Heure de début"), default="09:00")
    end_time = models.TimeField(verbose_name=_("Heure de fin"), default="17:00")
    
    # Tolérance
    grace_period_minutes = models.PositiveIntegerField(
        default=15, 
        verbose_name=_("Période de grâce (minutes)"),
        help_text=_("Retard toléré avant d'être marqué comme 'En retard'")
    )
    
    # Jours travaillés (Simple boolean fields for now)
    is_monday = models.BooleanField(default=True, verbose_name=_("Lundi"))
    is_tuesday = models.BooleanField(default=True, verbose_name=_("Mardi"))
    is_wednesday = models.BooleanField(default=True, verbose_name=_("Mercredi"))
    is_thursday = models.BooleanField(default=True, verbose_name=_("Jeudi"))
    is_friday = models.BooleanField(default=True, verbose_name=_("Vendredi"))
    is_saturday = models.BooleanField(default=False, verbose_name=_("Samedi"))
    is_sunday = models.BooleanField(default=False, verbose_name=_("Dimanche"))

    class Meta:
        verbose_name = _("Horaire de travail")
        verbose_name_plural = _("Horaires de travail")

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

class Attendance(BaseModel):
    """
    Enregistrement de présence quotidien.
    """
    STATUS_CHOICES = (
        ('present', _('Présent')),
        ('late', _('En retard')),
        ('absent', _('Absent')),
        ('excused', _('Excusé')),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='attendances')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(verbose_name=_("Date"))
    
    # Snapshot de l'horaire appliqué ce jour-là (pour garder l'historique si l'horaire change)
    schedule = models.ForeignKey(WorkSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendances')
    
    check_in = models.TimeField(null=True, blank=True, verbose_name=_("Arrivée"))
    check_out = models.TimeField(null=True, blank=True, verbose_name=_("Départ"))
    
    # Champs calculés / Logique
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent', verbose_name=_("Statut"))
    delay_minutes = models.PositiveIntegerField(default=0, verbose_name=_("Retard (minutes)"))
    worked_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name=_("Heures travaillées"))
    
    # Justification / Notes
    notes = models.TextField(blank=True, null=True, verbose_name=_("Notes / Justification"))
    
    # Sécurité / Audit
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ('employee', 'date')
        verbose_name = _("Présence")
        verbose_name_plural = _("Présences")
        ordering = ['-date', 'employee__user__last_name']

    def __str__(self):
        return f"{self.employee} - {self.date} - {self.get_status_display()}"
