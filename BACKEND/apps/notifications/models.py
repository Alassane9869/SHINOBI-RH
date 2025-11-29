from django.db import models
from apps.core.models import BaseModel
from django.conf import settings

class Notification(BaseModel):
    TYPES = (
        ('info', 'Information'),
        ('success', 'Succès'),
        ('warning', 'Attention'),
        ('error', 'Erreur'),
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPES, default='info')
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient}"
