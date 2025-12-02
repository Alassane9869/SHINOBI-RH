from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.accounts.permissions import IsCompanyMember
from .models import CompanyPDFSettings, PDFTemplate
from .serializers import CompanyPDFSettingsSerializer, PDFTemplateSerializer


class CompanyPDFSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les paramètres PDF de l'entreprise.
    """
    serializer_class = CompanyPDFSettingsSerializer
    permission_classes = [IsAuthenticated, IsCompanyMember]
    http_method_names = ['get', 'put', 'patch']  # Pas de création ni suppression
    
    def get_queryset(self):
        """Retourne uniquement les settings de l'entreprise de l'utilisateur."""
        return CompanyPDFSettings.objects.filter(company=self.request.user.company)
    
    def get_object(self):
        """Retourne ou crée les settings de l'entreprise."""
        settings, created = CompanyPDFSettings.objects.get_or_create(
            company=self.request.user.company
        )
        return settings
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Retourne les settings de l'entreprise courante."""
        settings = self.get_object()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class PDFTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les templates PDF.
    """
    serializer_class = PDFTemplateSerializer
    permission_classes = [IsAuthenticated, IsCompanyMember]
    
    def get_queryset(self):
        """Retourne uniquement les templates de l'entreprise de l'utilisateur."""
        queryset = PDFTemplate.objects.filter(company=self.request.user.company)
        
        # Filtrer par type si spécifié
        template_type = self.request.query_params.get('template_type', None)
        if template_type:
            queryset = queryset.filter(template_type=template_type)
        
        # Filtrer par actif si spécifié
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """Associe automatiquement l'entreprise lors de la création."""
        serializer.save(company=self.request.user.company)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Retourne la liste des types de templates disponibles."""
        types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in PDFTemplate.TEMPLATE_TYPES
        ]
        return Response(types)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Définit ce template comme template par défaut pour son type."""
        template = self.get_object()
        
        # Désactiver les autres templates par défaut du même type
        PDFTemplate.objects.filter(
            company=request.user.company,
            template_type=template.template_type,
            is_default=True
        ).exclude(pk=template.pk).update(is_default=False)
        
        # Activer ce template comme défaut
        template.is_default = True
        template.save()
        
        serializer = self.get_serializer(template)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplique un template existant."""
        template = self.get_object()
        
        # Créer une copie
        new_template = PDFTemplate.objects.create(
            company=template.company,
            template_type=template.template_type,
            name=f"{template.name} (Copie)",
            config=template.config.copy(),
            is_active=False,
            is_default=False
        )
        
        serializer = self.get_serializer(new_template)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
