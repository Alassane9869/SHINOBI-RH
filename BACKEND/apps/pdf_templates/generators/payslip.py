"""
Générateur de bulletins de paie avec design épuré et professionnel.
"""
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle

from .base import BaseReportLabGenerator


class PayslipGenerator(BaseReportLabGenerator):
    """
    Générateur de bulletins de paie professionnels avec design épuré.
    """
    
    def __init__(self, company, template_config=None):
        super().__init__(company, template_type='payslip', template_config=template_config)
    
    def build_content(self, data):
        """
        Construit le contenu du bulletin de paie avec design moderne.
        
        Args:
            data: Dict contenant:
                - employee: Nom de l'employé
                - employee_id: Matricule
                - position: Poste
                - department: Département
                - month: Mois (numéro)
                - year: Année
                - basic_salary: Salaire de base
                - bonuses: Liste de primes [{name, amount}]
                - deductions: Liste de déductions [{name, amount}]
                - net_salary: Salaire net
        """
        story = []
        styles = self.get_styles()
        
        # === 1. Titre et Période ===
        months = {
            1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
            5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
            9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
        }
        month_name = months.get(data.get('month', 1), 'Janvier')
        year = data.get('year', datetime.now().year)
        
        title_style = ParagraphStyle(
            'PayslipTitle',
            fontSize=16,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            alignment=1,  # Center
            spaceAfter=5
        )
        
        period_style = ParagraphStyle(
            'Period',
            fontSize=11,
            textColor=colors.grey,
            fontName='Helvetica',
            alignment=1,  # Center
            spaceAfter=15
        )
        
        story.append(Paragraph("BULLETIN DE PAIE", title_style))
        story.append(Paragraph(f"{month_name} {year}", period_style))
        story.append(Spacer(1, 0.3*cm))
        
        # === 2. Informations Employé (Carte épurée) ===
        story.append(self.create_section_header("Informations Employé"))
        story.append(Spacer(1, 0.2*cm))
        
        employee_data = [
            ['Nom complet', data.get('employee', 'N/A')],
            ['Matricule', data.get('employee_id', 'N/A')],
            ['Poste', data.get('position', 'N/A')],
            ['Département', data.get('department', 'N/A')],
        ]
        
        employee_table = Table(employee_data, colWidths=[5*cm, 11*cm])
        employee_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.color_text),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, self.color_border),
            ('BACKGROUND', (0, 0), (-1, -1), self.color_bg_light),
        ]))
        
        story.append(employee_table)
        story.append(Spacer(1, 0.8*cm))
        
        # === 3. Détails de la Paie (Tableau épuré) ===
        story.append(self.create_section_header("Détail de la Rémunération"))
        story.append(Spacer(1, 0.2*cm))
        
        pay_details = [
            ['Libellé', 'Montant (FCFA)'],
        ]
        
        # Salaire de base
        basic = data.get('basic_salary', 0)
        pay_details.append(['Salaire de base', f"{basic:,.0f}"])
        
        # Primes
        total_bonuses = 0
        bonuses = data.get('bonuses', [])
        if bonuses:
            for bonus in bonuses:
                amount = bonus.get('amount', 0)
                pay_details.append([f"+ {bonus.get('name', 'Prime')}", f"{amount:,.0f}"])
                total_bonuses += amount
        
        # Sous-total brut
        gross_salary = basic + total_bonuses
        pay_details.append(['', ''])  # Ligne vide
        pay_details.append(['Salaire brut', f"{gross_salary:,.0f}"])
        pay_details.append(['', ''])  # Ligne vide
        
        # Déductions
        total_deductions = 0
        deductions = data.get('deductions', [])
        if deductions:
            for deduction in deductions:
                amount = deduction.get('amount', 0)
                pay_details.append([f"- {deduction.get('name', 'Déduction')}", f"{amount:,.0f}"])
                total_deductions += amount
        
        # Total déductions
        if total_deductions > 0:
            pay_details.append(['', ''])
            pay_details.append(['Total déductions', f"{total_deductions:,.0f}"])
        
        pay_table = self.create_clean_table(pay_details, [11*cm, 5*cm], has_header=True, zebra=False)
        
        # Styles supplémentaires pour le tableau de paie
        additional_styles = [
            # Lignes "Salaire brut" et "Total déductions" en gras
            ('FONTNAME', (0, len(pay_details) - 4 if total_deductions > 0 else len(pay_details) - 2), 
             (-1, len(pay_details) - 4 if total_deductions > 0 else len(pay_details) - 2), 'Helvetica-Bold'),
            ('BACKGROUND', (0, len(pay_details) - 4 if total_deductions > 0 else len(pay_details) - 2), 
             (-1, len(pay_details) - 4 if total_deductions > 0 else len(pay_details) - 2), self.color_bg_light),
        ]
        
        if total_deductions > 0:
            additional_styles.extend([
                ('FONTNAME', (0, len(pay_details) - 2), (-1, len(pay_details) - 2), 'Helvetica-Bold'),
                ('BACKGROUND', (0, len(pay_details) - 2), (-1, len(pay_details) - 2), self.color_bg_light),
            ])
        
        pay_table.setStyle(TableStyle(additional_styles))
        
        story.append(pay_table)
        story.append(Spacer(1, 0.5*cm))
        
        # === 4. NET À PAYER (Carte KPI) ===
        net_salary = data.get('net_salary', gross_salary - total_deductions)
        
        net_data = [
            ['NET À PAYER'],
            [f"{net_salary:,.0f} FCFA"]
        ]
        
        net_table = Table(net_data, colWidths=[16*cm])
        net_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('BACKGROUND', (0, 1), (-1, 1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, 1), self.primary_color),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 22),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('BOX', (0, 0), (-1, -1), 2, self.primary_color),
        ]))
        
        story.append(net_table)
        story.append(Spacer(1, 0.8*cm))
        
        # === 5. Note de bas de page ===
        note_style = ParagraphStyle(
            'Note',
            fontSize=8,
            textColor=colors.grey,
            fontName='Helvetica',
            alignment=1,  # Center
            leading=10
        )
        
        note = Paragraph(
            "<i>Ce bulletin de paie est généré automatiquement et ne nécessite pas de signature.</i>",
            note_style
        )
        story.append(note)
        
        return story
