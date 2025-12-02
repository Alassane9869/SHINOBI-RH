"""
Générateur de base pour tous les PDF ReportLab.
"""
import io
from datetime import datetime
from typing import Dict, Any, Optional
from django.http import HttpResponse
from django.conf import settings

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, PageBreak, Image, Frame, PageTemplate
)
from reportlab.pdfgen import canvas

from ..models import CompanyPDFSettings, PDFTemplate


class BaseReportLabGenerator:
    """
    Classe de base pour tous les générateurs PDF ReportLab.
    
    Fournit des méthodes communes pour :
    - En-tête avec logo
    - Pied de page personnalisé
    - Styles personnalisés par entreprise
    - Génération PDF
    """
    
    def __init__(self, company, template_type=None, template_config=None):
        """
        Initialise le générateur.
        
        Args:
            company: Instance de Company
            template_type: Type de template (optionnel)
            template_config: Configuration personnalisée (optionnel)
        """
        self.company = company
        self.template_type = template_type
        
        # Charger les settings PDF de l'entreprise
        try:
            self.pdf_settings = CompanyPDFSettings.objects.get(company=company)
        except CompanyPDFSettings.DoesNotExist:
            # Créer des settings par défaut
            self.pdf_settings = CompanyPDFSettings.objects.create(company=company)
        
        # Charger le template si spécifié
        self.template = None
        if template_type:
            try:
                self.template = PDFTemplate.objects.filter(
                    company=company,
                    template_type=template_type,
                    is_active=True,
                    is_default=True
                ).first()
            except PDFTemplate.DoesNotExist:
                pass
        
        # Configuration
        self.config = template_config or (self.template.config if self.template else {})
        
        # Dimensions de page
        self.page_width, self.page_height = A4
        
        # Marges (modifiables via config)
        self.margin_left = self.config.get('margin_left', 2 * cm)
        self.margin_right = self.config.get('margin_right', 2 * cm)
        self.margin_top = self.config.get('margin_top', 2.5 * cm)
        self.margin_bottom = self.config.get('margin_bottom', 2.5 * cm)
        
        # Palette de couleurs épurée et professionnelle
        self.primary_color = self._hex_to_color(self.pdf_settings.primary_color)
        self.secondary_color = self._hex_to_color(self.pdf_settings.secondary_color)
        
        # Couleurs système (minimalistes)
        self.color_success = colors.Color(0.06, 0.72, 0.51)  # #10B981 Vert
        self.color_warning = colors.Color(0.96, 0.62, 0.04)  # #F59E0B Orange
        self.color_danger = colors.Color(0.94, 0.27, 0.27)   # #EF4444 Rouge
        self.color_text = colors.Color(0.12, 0.16, 0.22)     # #1F2937 Gris foncé
        self.color_border = colors.Color(0.90, 0.91, 0.92)   # #E5E7EB Bordure
        self.color_bg_light = colors.Color(0.98, 0.98, 0.99) # #F9FAFB Fond clair
    
    def _hex_to_color(self, hex_color):
        """Convertit une couleur hex en objet Color ReportLab."""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0
        b = int(hex_color[4:6], 16) / 255.0
        return colors.Color(r, g, b)
    
    def get_styles(self):
        """
        Retourne les styles personnalisés pour le PDF.
        """
        styles = getSampleStyleSheet()
        
        # Style pour le titre principal
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=self.primary_color,
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName=self.pdf_settings.font_family + '-Bold'
        ))
        
        # Style pour les sous-titres
        styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=self.primary_color,
            spaceAfter=10,
            fontName=self.pdf_settings.font_family + '-Bold'
        ))
        
        # Style pour le texte normal
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['BodyText'],
            fontSize=10,
            fontName=self.pdf_settings.font_family,
            alignment=TA_JUSTIFY,
            spaceAfter=6
        ))
        
        # Style pour le footer
        styles.add(ParagraphStyle(
            name='CustomFooter',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER,
            fontName=self.pdf_settings.font_family
        ))
        
        return styles
    
    def add_header(self, canvas, doc):
        """
        Ajoute l'en-tête du PDF avec logo et informations entreprise.
        """
        canvas.saveState()
        
        # Logo (si disponible)
        if self.pdf_settings.logo:
            try:
                logo_path = self.pdf_settings.logo.path
                logo = Image(logo_path, width=3*cm, height=2*cm, kind='proportional')
                logo.drawOn(canvas, self.margin_left, self.page_height - self.margin_top + 0.5*cm)
            except:
                pass
        
        # Informations entreprise (à droite)
        canvas.setFont(self.pdf_settings.font_family + '-Bold', 12)
        canvas.setFillColor(self.primary_color)
        canvas.drawRightString(
            self.page_width - self.margin_right,
            self.page_height - self.margin_top + 1.5*cm,
            self.company.name
        )
        
        canvas.setFont(self.pdf_settings.font_family, 9)
        canvas.setFillColor(colors.black)
        y_pos = self.page_height - self.margin_top + 1*cm
        
        if self.company.address:
            canvas.drawRightString(self.page_width - self.margin_right, y_pos, self.company.address)
            y_pos -= 0.4*cm
        
        if self.company.phone:
            canvas.drawRightString(self.page_width - self.margin_right, y_pos, f"Tél: {self.company.phone}")
            y_pos -= 0.4*cm
        
        if self.company.email:
            canvas.drawRightString(self.page_width - self.margin_right, y_pos, self.company.email)
        
        # Ligne de séparation
        canvas.setStrokeColor(self.primary_color)
        canvas.setLineWidth(2)
        canvas.line(
            self.margin_left,
            self.page_height - self.margin_top,
            self.page_width - self.margin_right,
            self.page_height - self.margin_top
        )
        
        canvas.restoreState()
    
    def add_footer(self, canvas, doc):
        """
        Ajoute le pied de page avec numéro de page et texte personnalisé.
        """
        canvas.saveState()
        
        # Ligne de séparation
        canvas.setStrokeColor(self.primary_color)
        canvas.setLineWidth(1)
        canvas.line(
            self.margin_left,
            self.margin_bottom + 1*cm,
            self.page_width - self.margin_right,
            self.margin_bottom + 1*cm
        )
        
        # Texte du footer personnalisé
        canvas.setFont(self.pdf_settings.font_family, 8)
        canvas.setFillColor(colors.grey)
        
        if self.pdf_settings.footer_text:
            canvas.drawCentredString(
                self.page_width / 2,
                self.margin_bottom + 0.6*cm,
                self.pdf_settings.footer_text
            )
        
        # Numéro de page
        page_num = f"Page {doc.page}"
        canvas.drawRightString(
            self.page_width - self.margin_right,
            self.margin_bottom + 0.3*cm,
            page_num
        )
        
        # Date de génération
        date_str = f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}"
        canvas.drawString(
            self.margin_left,
            self.margin_bottom + 0.3*cm,
            date_str
        )
        
        canvas.restoreState()
    
    def generate(self, data: Dict[str, Any], filename: str) -> HttpResponse:
        """
        Génère le PDF et retourne une HttpResponse.
        
        Args:
            data: Données pour générer le PDF
            filename: Nom du fichier PDF
        
        Returns:
            HttpResponse avec le PDF
        """
        # Construire le contenu via la méthode de la sous-classe
        story = self.build_content(data)
        
        return self.build_pdf(story, filename)

    def build_pdf(self, elements: list, filename: str = None) -> HttpResponse:
        """
        Construit le PDF à partir d'une liste d'éléments.
        
        Args:
            elements: Liste d'éléments Platypus (Paragraph, Table, etc.)
            filename: Nom du fichier PDF (optionnel, utilise self.filename si non fourni)
            
        Returns:
            HttpResponse avec le PDF
        """
        if filename is None:
            filename = getattr(self, 'filename', 'document')

        # Créer un buffer en mémoire
        buffer = io.BytesIO()
        
        # Créer le document PDF
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=self.margin_left,
            rightMargin=self.margin_right,
            topMargin=self.margin_top + 1*cm,  # Espace pour header
            bottomMargin=self.margin_bottom + 1*cm,  # Espace pour footer
            title=filename
        )
        
        # Générer le PDF avec header et footer
        doc.build(
            elements,
            onFirstPage=self.add_header_footer,
            onLaterPages=self.add_header_footer
        )
        
        # Récupérer le PDF du buffer
        pdf = buffer.getvalue()
        buffer.close()
        
        # Créer la réponse HTTP
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        response.write(pdf)
        
        return response
    
    def add_header_footer(self, canvas, doc):
        """Combine header et footer."""
        self.add_header(canvas, doc)
        self.add_footer(canvas, doc)
    
    def create_kpi_card(self, title, value, subtitle=None, color=None):
        """
        Crée une carte KPI élégante.
        
        Args:
            title: Titre du KPI
            value: Valeur principale
            subtitle: Texte secondaire (optionnel)
            color: Couleur d'accentuation (optionnel)
        
        Returns:
            Table formatée comme une carte
        """
        if color is None:
            color = self.primary_color
            
        data = [[title], [str(value)]]
        if subtitle:
            data.append([subtitle])
            
        col_width = 4.5 * cm
        
        table = Table(data, colWidths=[col_width])
        
        style = [
            ('BACKGROUND', (0, 0), (-1, 0), self.color_bg_light),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.color_text),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 20),
            ('TEXTCOLOR', (0, 1), (-1, 1), color),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('BOX', (0, 0), (-1, -1), 1, self.color_border),
        ]
        
        if subtitle:
            style.extend([
                ('FONTNAME', (0, 2), (-1, 2), 'Helvetica'),
                ('FONTSIZE', (0, 2), (-1, 2), 8),
                ('TEXTCOLOR', (0, 2), (-1, 2), colors.grey),
            ])
            
        table.setStyle(TableStyle(style))
        return table
    
    def create_section_header(self, text, icon=None):
        """
        Crée un en-tête de section élégant.
        
        Args:
            text: Texte de l'en-tête
            icon: Icône unicode (optionnel)
        
        Returns:
            Paragraph formaté
        """
        from reportlab.lib.styles import ParagraphStyle
        
        style = ParagraphStyle(
            'SectionHeader',
            fontSize=12,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            spaceAfter=8,
            spaceBefore=12,
            borderPadding=(0, 0, 0, 3),
            borderColor=self.primary_color,
            borderWidth=2,
            borderRadius=0,
        )
        
        display_text = f"{icon} {text}" if icon else text
        return Paragraph(display_text, style)
    
    def create_clean_table(self, data, col_widths, has_header=True, zebra=True):
        """
        Crée un tableau épuré et professionnel.
        
        Args:
            data: Données du tableau
            col_widths: Largeurs des colonnes
            has_header: Si True, la première ligne est l'en-tête
            zebra: Si True, alterne les couleurs de fond
        
        Returns:
            Table formatée
        """
        table = Table(data, colWidths=col_widths, repeatRows=1 if has_header else 0)
        
        style = [
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
        ]
        
        if has_header:
            style.extend([
                ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
            ])
            
        if zebra and len(data) > 1:
            start_row = 1 if has_header else 0
            style.append(
                ('ROWBACKGROUNDS', (0, start_row), (-1, -1), [colors.white, self.color_bg_light])
            )
            
        table.setStyle(TableStyle(style))
        return table
    
    def create_status_badge(self, status_text, status_type='neutral'):
        """
        Crée un badge de statut coloré.
        
        Args:
            status_text: Texte du statut
            status_type: Type ('success', 'warning', 'danger', 'neutral')
        
        Returns:
            Paragraph avec style de badge
        """
        color_map = {
            'success': self.color_success,
            'warning': self.color_warning,
            'danger': self.color_danger,
            'neutral': colors.grey
        }
        
        color = color_map.get(status_type, colors.grey)
        
        style = ParagraphStyle(
            'Badge',
            fontSize=9,
            textColor=color,
            fontName='Helvetica-Bold',
        )
        
        return Paragraph(status_text, style)
    
    def build_content(self, data: Dict[str, Any]) -> list:
        """
        Construit le contenu du PDF.
        À implémenter dans les sous-classes.
        
        Args:
            data: Données pour le PDF
        
        Returns:
            Liste d'éléments Platypus (Paragraph, Table, etc.)
        """
        raise NotImplementedError("Les sous-classes doivent implémenter build_content()")

