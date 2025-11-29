"""
Modèles pour le système d'export de documents.

Ce module contient les modèles pour gérer les exports de documents,
leurs logs et la traçabilité complète.
"""
from django.db import models
from apps.core.models import BaseModel
from apps.company.models import Company
from apps.accounts.models import CustomUser
import uuid


class ExportLog(BaseModel):
    """
    Journal d'audit pour tous les exports de documents.
    
    Enregistre qui a exporté quoi, quand, et avec quels paramètres
    pour assurer la traçabilité complète.
    """
    
    # Types d'export possibles
    EXPORT_TYPE_CHOICES = (
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('zip', 'ZIP'),
        ('json', 'JSON'),
    )
    
    # Modules sources
    MODULE_CHOICES = (
        ('dashboard', 'Tableau de bord'),
        ('users', 'Utilisateurs'),
        ('employees', 'Employés'),
        ('attendance', 'Présence'),
        ('leaves', 'Congés'),
        ('payroll', 'Paie'),
        ('documents', 'Documents'),
        ('settings', 'Paramètres'),
    )
    
    # Statuts d'export
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Terminé'),
        ('failed', 'Échoué'),
    )
    
    # Informations de base
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='export_logs',
        verbose_name='Entreprise'
    )
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='exports',
        verbose_name='Utilisateur'
    )
    
    # Type et source
    export_type = models.CharField(
        max_length=20, 
        choices=EXPORT_TYPE_CHOICES,
        verbose_name='Type d\'export'
    )
    module = models.CharField(
        max_length=50, 
        choices=MODULE_CHOICES,
        verbose_name='Module source'
    )
    document_name = models.CharField(
        max_length=255,
        verbose_name='Nom du document'
    )
    
    # Paramètres d'export (stockés en JSON)
    parameters = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Paramètres'
    )
    
    # Statut et résultat
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Statut'
    )
    file_path = models.FileField(
        upload_to='exports/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name='Fichier'
    )
    file_size = models.BigIntegerField(
        null=True,
        blank=True,
        verbose_name='Taille (octets)'
    )
    
    # Métriques de performance
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Début'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fin'
    )
    duration_seconds = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Durée (secondes)'
    )
    
    # Erreurs éventuelles
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Message d\'erreur'
    )
    
    # Celery task ID (pour le suivi)
    celery_task_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='ID Tâche Celery'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Journal d\'export'
        verbose_name_plural = 'Journaux d\'export'
        indexes = [
            models.Index(fields=['company', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['celery_task_id']),
        ]
    
    def __str__(self):
        return f"{self.document_name} - {self.get_export_type_display()} ({self.status})"
    
    def calculate_duration(self):
        """Calcule la durée de l'export en secondes."""
        if self.started_at and self.completed_at:
            self.duration_seconds = (self.completed_at - self.started_at).total_seconds()
            self.save(update_fields=['duration_seconds'])
    
    def get_file_size_mb(self):
        """Retourne la taille du fichier en MB."""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0


class ExportTemplate(BaseModel):
    """
    Templates versionnés pour les exports.
    
    Permet de gérer différentes versions de templates
    et de maintenir l'historique des modifications.
    """
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='export_templates',
        null=True,
        blank=True,
        verbose_name='Entreprise (optionnel pour templates globaux)'
    )
    
    name = models.CharField(
        max_length=255,
        verbose_name='Nom du template'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Description'
    )
    
    # Type de document
    document_type = models.CharField(
        max_length=50,
        verbose_name='Type de document'
    )
    
    # Fichier template (HTML pour PDF, etc.)
    template_file = models.FileField(
        upload_to='templates/exports/',
        verbose_name='Fichier template'
    )
    
    # Version
    version = models.CharField(
        max_length=20,
        default='1.0',
        verbose_name='Version'
    )
    
    # Actif ou archivé
    is_active = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Template d\'export'
        verbose_name_plural = 'Templates d\'export'
        unique_together = [['company', 'document_type', 'version']]
    
    def __str__(self):
        return f"{self.name} v{self.version}"
