"""
Serializers globaux et utilitaires pour le projet.
"""
from rest_framework import serializers


class EmptySerializer(serializers.Serializer):
    """Serializer vide pour les actions sans données"""
    pass


class MessageSerializer(serializers.Serializer):
    """Serializer pour les messages de réponse"""
    message = serializers.CharField()


class ErrorSerializer(serializers.Serializer):
    """Serializer pour les erreurs"""
    error = serializers.CharField()
    details = serializers.DictField(required=False)


class StatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques"""
    total_employees = serializers.IntegerField()
    total_leaves = serializers.IntegerField()
    pending_leaves = serializers.IntegerField()
    total_payrolls = serializers.IntegerField()
    total_documents = serializers.IntegerField()
