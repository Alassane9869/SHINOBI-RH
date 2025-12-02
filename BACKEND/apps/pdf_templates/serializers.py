from rest_framework import serializers
from .models import CompanyPDFSettings, PDFTemplate


class CompanyPDFSettingsSerializer(serializers.ModelSerializer):
    """Serializer pour les paramètres PDF de l'entreprise."""
    
    class Meta:
        model = CompanyPDFSettings
        fields = [
            'id', 'company', 'logo', 'primary_color', 'secondary_color',
            'font_family', 'footer_text', 'signature_image',
            'signature_name', 'signature_title', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']


class PDFTemplateSerializer(serializers.ModelSerializer):
    """Serializer pour les templates PDF."""
    
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    
    class Meta:
        model = PDFTemplate
        fields = [
            'id', 'company', 'template_type', 'template_type_display',
            'name', 'config', 'is_active', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validation personnalisée."""
        # Si is_default est True, désactiver les autres templates par défaut du même type
        if data.get('is_default', False):
            company = self.context['request'].user.company
            template_type = data.get('template_type')
            
            # Vérifier s'il existe déjà un template par défaut
            existing_default = PDFTemplate.objects.filter(
                company=company,
                template_type=template_type,
                is_default=True
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            if existing_default.exists():
                raise serializers.ValidationError(
                    "Un template par défaut existe déjà pour ce type de document."
                )
        
        return data
