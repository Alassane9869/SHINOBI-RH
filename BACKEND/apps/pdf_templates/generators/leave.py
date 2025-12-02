"""
Générateur PDF pour les rapports de congés.
"""
from datetime import datetime, date
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle

from apps.pdf_templates.generators.base import BaseReportLabGenerator


class LeaveGenerator(BaseReportLabGenerator):
    """
    Générateur de rapports de congés avec design épuré.
    """
    
    def __init__(self, company, template_config=None):
        super().__init__(company, template_type='leave_report', template_config=template_config)
    
    def generate_leave_request(self, data, filename):
        """
        Génère une demande de congé individuelle.
        
        Args:
            data: {
                'employee_name': 'Jean Dupont',
                'employee_id': 'EMP001',
                'leave_type': 'Vacation',
                'start_date': '01/12/2024',
                'end_date': '15/12/2024',
                'days_count': 15,
                'reason': 'Vacances familiales',
                'status': 'Pending',
                'request_date': '20/11/2024'
            }
        """
        self.filename = filename
        self.title = "Demande de Congé"
        
        elements = []
        styles = self.get_styles()
        
        # === Titre ===
        title_style = ParagraphStyle(
            'LeaveTitle',
            fontSize=16,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            alignment=1,
            spaceAfter=10
        )
        
        elements.append(Paragraph("DEMANDE DE CONGÉ", title_style))
        elements.append(Spacer(1, 0.5*cm))
        
        # === Statut (Badge) ===
        status = data.get('status', 'Pending')
        status_color = self.color_warning
        if status == 'Approved':
            status_color = self.color_success
        elif status == 'Rejected':
            status_color = self.color_danger
        
        status_data = [[f"Statut : {status}"]]
        status_table = Table(status_data, colWidths=[16*cm])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), status_color),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(status_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === Informations Employé ===
        elements.append(self.create_section_header("👤 Informations Employé"))
        elements.append(Spacer(1, 0.2*cm))
        
        emp_data = [
            ['Nom', data.get('employee_name', 'N/A')],
            ['Matricule', data.get('employee_id', 'N/A')],
        ]
        
        emp_table = Table(emp_data, colWidths=[5*cm, 11*cm])
        emp_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.color_text),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('BACKGROUND', (0, 0), (-1, -1), self.color_bg_light),
        ]))
        elements.append(emp_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === Détails du Congé ===
        elements.append(self.create_section_header("📅 Détails du Congé"))
        elements.append(Spacer(1, 0.2*cm))
        
        leave_data = [
            ['Type de congé', data.get('leave_type', 'N/A')],
            ['Date de début', data.get('start_date', 'N/A')],
            ['Date de fin', data.get('end_date', 'N/A')],
            ['Nombre de jours', str(data.get('days_count', 0))],
            ['Date de demande', data.get('request_date', 'N/A')],
        ]
        
        leave_table = Table(leave_data, colWidths=[5*cm, 11*cm])
        leave_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.color_text),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, self.color_bg_light]),
        ]))
        elements.append(leave_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === Raison ===
        if data.get('reason'):
            elements.append(self.create_section_header("📝 Motif"))
            elements.append(Spacer(1, 0.2*cm))
            
            reason_style = ParagraphStyle(
                'Reason',
                fontSize=10,
                fontName='Helvetica',
                alignment=0,
                spaceAfter=10
            )
            elements.append(Paragraph(data.get('reason', ''), reason_style))
        
        return self.build_pdf(elements)
    
    def generate_leave_calendar(self, data, filename):
        """
        Génère un calendrier des congés.
        
        Args:
            data: {
                'month': 'Décembre 2024',
                'leaves': [
                    {
                        'employee_name': 'Jean Dupont',
                        'leave_type': 'Vacation',
                        'start_date': '01/12/2024',
                        'end_date': '15/12/2024',
                        'days': 15,
                        'status': 'Approved'
                    },
                    ...
                ]
            }
        """
        self.filename = filename
        self.title = f"Calendrier des Congés - {data.get('month')}"
        
        elements = []
        
        # === Titre ===
        elements.append(self.create_section_header(f"📅 Calendrier des Congés - {data.get('month')}"))
        elements.append(Spacer(1, 0.3*cm))
        
        # === KPIs ===
        leaves = data.get('leaves', [])
        total_leaves = len(leaves)
        approved = sum(1 for l in leaves if l.get('status') == 'Approved')
        pending = sum(1 for l in leaves if l.get('status') == 'Pending')
        
        kpi_data = [[
            self.create_kpi_card("Total Demandes", total_leaves, color=self.primary_color),
            self.create_kpi_card("Approuvées", approved, color=self.color_success),
            self.create_kpi_card("En attente", pending, color=self.color_warning),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === Tableau ===
        elements.append(self.create_section_header("📋 Liste des Congés"))
        elements.append(Spacer(1, 0.2*cm))
        
        table_data = [['Employé', 'Type', 'Début', 'Fin', 'Jours', 'Statut']]
        
        for leave in leaves:
            table_data.append([
                leave.get('employee_name', ''),
                leave.get('leave_type', ''),
                leave.get('start_date', ''),
                leave.get('end_date', ''),
                str(leave.get('days', 0)),
                leave.get('status', '')
            ])
        
        table = self.create_clean_table(table_data, [5*cm, 3*cm, 2.5*cm, 2.5*cm, 2*cm, 3*cm], has_header=True, zebra=True)
        
        # Colorer les statuts
        status_styles = []
        for i, leave in enumerate(leaves, start=1):
            status = leave.get('status', '')
            if status == 'Approved':
                status_styles.append(('TEXTCOLOR', (5, i), (5, i), self.color_success))
            elif status == 'Pending':
                status_styles.append(('TEXTCOLOR', (5, i), (5, i), self.color_warning))
            elif status == 'Rejected':
                status_styles.append(('TEXTCOLOR', (5, i), (5, i), self.color_danger))
        
        if status_styles:
            table.setStyle(TableStyle(status_styles))
        
        elements.append(table)
        
        return self.build_pdf(elements)
