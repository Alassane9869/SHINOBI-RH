"""
Générateur de dossiers employés avec design épuré et professionnel.
"""
from datetime import datetime, date
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER

from .base import BaseReportLabGenerator


class EmployeeFileGenerator(BaseReportLabGenerator):
    """
    Générateur de dossiers employés complets avec design moderne.
    """
    
    def __init__(self, company, template_config=None):
        super().__init__(company, template_type='employee_file', template_config=template_config)
    
    def build_content(self, data):
        """
        Construit le contenu du dossier employé avec design épuré.
        
        Args:
            data: Dict contenant:
                - employee_name: Nom complet
                - employee_id: Matricule
                - photo: Chemin vers la photo (optionnel)
                - personal_info: Dict (date_naissance, lieu_naissance, etc.)
                - contact_info: Dict (email, phone, address)
                - professional_info: Dict (position, department, hire_date, etc.)
                - contract_info: Dict (type, duration, salary)
                - documents: Liste de documents
                - stats: Dict (ancienneté, congés, présence) - optionnel
        """
        story = []
        styles = self.get_styles()
        
        # === PAGE DE GARDE ÉPURÉE ===
        story.append(Spacer(1, 4*cm))
        
        title_style = ParagraphStyle(
            'CoverTitle',
            fontSize=20,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        subtitle_style = ParagraphStyle(
            'CoverSubtitle',
            fontSize=14,
            textColor=self.color_text,
            fontName='Helvetica',
            alignment=TA_CENTER,
            spaceAfter=10
        )
        
        story.append(Paragraph("DOSSIER EMPLOYÉ", title_style))
        story.append(Paragraph(data.get('employee_name', 'N/A'), subtitle_style))
        
        matricule_style = ParagraphStyle(
            'Matricule',
            fontSize=11,
            textColor=colors.grey,
            fontName='Helvetica',
            alignment=TA_CENTER,
            spaceAfter=30
        )
        
        story.append(Paragraph(f"Matricule : {data.get('employee_id', 'N/A')}", matricule_style))
        
        # Date de création
        date_style = ParagraphStyle(
            'DateStyle',
            fontSize=9,
            textColor=colors.grey,
            fontName='Helvetica',
            alignment=TA_CENTER
        )
        story.append(Paragraph(f"Dossier créé le {datetime.now().strftime('%d/%m/%Y')}", date_style))
        
        # Nouvelle page
        story.append(PageBreak())
        
        # === KPIs EMPLOYÉ (si stats disponibles) ===
        stats = data.get('stats', {})
        if stats:
            story.append(self.create_section_header("📊 Vue d'ensemble"))
            story.append(Spacer(1, 0.3*cm))
            
            kpi_data = [[
                self.create_kpi_card(
                    "Ancienneté",
                    f"{stats.get('years_of_service', 0)} ans",
                    "Depuis l'embauche",
                    self.primary_color
                ),
                self.create_kpi_card(
                    "Congés restants",
                    f"{stats.get('remaining_leaves', 0)} jours",
                    "Solde actuel",
                    self.color_success
                ),
                self.create_kpi_card(
                    "Taux présence",
                    f"{stats.get('attendance_rate', 0):.0f}%",
                    "Ce mois",
                    self.color_success if stats.get('attendance_rate', 0) >= 95 else self.color_warning
                ),
            ]]
            
            kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
            kpi_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(kpi_table)
            story.append(Spacer(1, 0.8*cm))
        
        # === 1. INFORMATIONS PERSONNELLES ===
        story.append(self.create_section_header("👤 Informations Personnelles"))
        story.append(Spacer(1, 0.2*cm))
        
        personal_info = data.get('personal_info', {})
        personal_data = [
            ['Nom complet', data.get('employee_name', 'N/A')],
            ['Date de naissance', personal_info.get('birth_date', 'N/A')],
            ['Lieu de naissance', personal_info.get('birth_place', 'N/A')],
            ['Nationalité', personal_info.get('nationality', 'N/A')],
            ['Situation familiale', personal_info.get('marital_status', 'N/A')],
            ['Nombre d\'enfants', str(personal_info.get('children_count', 0))],
        ]
        
        personal_table = Table(personal_data, colWidths=[5.5*cm, 10.5*cm])
        personal_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.color_text),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, self.color_bg_light]),
        ]))
        
        story.append(personal_table)
        story.append(Spacer(1, 0.8*cm))
        
        # === 2. COORDONNÉES ===
        story.append(self.create_section_header("📞 Coordonnées"))
        story.append(Spacer(1, 0.2*cm))
        
        contact_info = data.get('contact_info', {})
        contact_data = [
            ['Adresse', contact_info.get('address', 'N/A')],
            ['Téléphone', contact_info.get('phone', 'N/A')],
            ['Email', contact_info.get('email', 'N/A')],
            ['Contact d\'urgence', contact_info.get('emergency_contact', 'N/A')],
        ]
        
        contact_table = Table(contact_data, colWidths=[5.5*cm, 10.5*cm])
        contact_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.color_text),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, self.color_bg_light]),
        ]))
        
        story.append(contact_table)
        story.append(Spacer(1, 0.8*cm))
        
        # === 3. INFORMATIONS PROFESSIONNELLES ===
        story.append(self.create_section_header("💼 Informations Professionnelles"))
        story.append(Spacer(1, 0.2*cm))
        
        professional_info = data.get('professional_info', {})
        
        # Calculer l'ancienneté si date d'embauche fournie
        years_service = "N/A"
        hire_date_str = professional_info.get('hire_date', 'N/A')
        if hire_date_str != 'N/A':
            try:
                if isinstance(hire_date_str, str):
                    hire_date = datetime.strptime(hire_date_str, '%d/%m/%Y').date()
                else:
                    hire_date = hire_date_str
                delta = date.today() - hire_date
                years = delta.days // 365
                months = (delta.days % 365) // 30
                years_service = f"{years} ans, {months} mois"
            except:
                pass
        
        professional_data = [
            ['Poste', professional_info.get('position', 'N/A')],
            ['Département', professional_info.get('department', 'N/A')],
            ['Date d\'embauche', hire_date_str],
            ['Ancienneté', years_service],
            ['Type de contrat', professional_info.get('contract_type', 'N/A')],
            ['Salaire de base', f"{professional_info.get('base_salary', 0):,.0f} FCFA"],
        ]
        
        professional_table = Table(professional_data, colWidths=[5.5*cm, 10.5*cm])
        professional_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.color_text),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, self.color_bg_light]),
        ]))
        
        story.append(professional_table)
        story.append(Spacer(1, 0.8*cm))
        
        # === 4. DOCUMENTS AU DOSSIER ===
        documents = data.get('documents', [])
        if documents:
            story.append(self.create_section_header("📁 Documents au Dossier"))
            story.append(Spacer(1, 0.2*cm))
            
            doc_data = [['Type de document', 'Date d\'ajout', 'Statut']]
            for doc in documents:
                doc_data.append([
                    doc.get('type', 'N/A'),
                    doc.get('date', 'N/A'),
                    doc.get('status', 'Actif')
                ])
            
            doc_table = self.create_clean_table(doc_data, [8*cm, 5*cm, 3*cm], has_header=True, zebra=True)
            story.append(doc_table)
        
        return story
