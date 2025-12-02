"""
Générateur PDF pour les rapports Owner/Super Admin.
"""
from datetime import datetime, date
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import ParagraphStyle

from apps.pdf_templates.generators.base import BaseReportLabGenerator


class OwnerDashboardGenerator(BaseReportLabGenerator):
    """
    Générateur de rapports exécutifs pour Owner/Super Admin.
    """
    
    def __init__(self, company, template_config=None):
        super().__init__(company, template_type='owner_dashboard', template_config=template_config)
    
    def generate_executive_summary(self, data, filename):
        """
        Génère un résumé exécutif global.
        
        Args:
            data: {
                'period': 'Novembre 2024',
                'company_stats': {
                    'total_employees': 150,
                    'active_employees': 145,
                    'new_hires': 5,
                    'departures': 2
                },
                'financial_stats': {
                    'total_payroll': 75000000,
                    'avg_salary': 500000,
                    'total_bonuses': 5000000
                },
                'attendance_stats': {
                    'attendance_rate': 94.5,
                    'late_rate': 4.2,
                    'absent_rate': 1.3
                },
                'leave_stats': {
                    'pending_requests': 12,
                    'approved_days': 145,
                    'rejected_requests': 3
                },
                'alerts': [
                    'Taux d\'absence élevé dans le département Marketing',
                    '5 demandes de congés en attente depuis plus de 7 jours',
                ]
            }
        """
        self.filename = filename
        self.title = f"Résumé Exécutif - {data.get('period')}"
        
        elements = []
        
        # === Titre ===
        title_style = ParagraphStyle(
            'ExecTitle',
            fontSize=20,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            alignment=1,
            spaceAfter=10
        )
        
        elements.append(Paragraph("RÉSUMÉ EXÉCUTIF", title_style))
        elements.append(Spacer(1, 0.3*cm))
        
        period_style = ParagraphStyle(
            'Period',
            fontSize=12,
            textColor=colors.grey,
            fontName='Helvetica',
            alignment=1,
            spaceAfter=20
        )
        
        elements.append(Paragraph(data.get('period', ''), period_style))
        elements.append(Spacer(1, 0.5*cm))
        
        # === 1. KPIs Employés ===
        elements.append(self.create_section_header("👥 Effectif"))
        elements.append(Spacer(1, 0.3*cm))
        
        company_stats = data.get('company_stats', {})
        
        kpi_data = [[
            self.create_kpi_card(
                "Total Employés",
                company_stats.get('total_employees', 0),
                f"{company_stats.get('active_employees', 0)} actifs",
                self.primary_color
            ),
            self.create_kpi_card(
                "Nouvelles Embauches",
                company_stats.get('new_hires', 0),
                "Ce mois",
                self.color_success
            ),
            self.create_kpi_card(
                "Départs",
                company_stats.get('departures', 0),
                "Ce mois",
                self.color_danger if company_stats.get('departures', 0) > 5 else self.color_warning
            ),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 2. KPIs Financiers ===
        elements.append(self.create_section_header("💰 Finances"))
        elements.append(Spacer(1, 0.3*cm))
        
        financial_stats = data.get('financial_stats', {})
        
        kpi_data = [[
            self.create_kpi_card(
                "Masse Salariale",
                f"{financial_stats.get('total_payroll', 0):,.0f} FCFA",
                "Total mensuel",
                self.primary_color
            ),
            self.create_kpi_card(
                "Salaire Moyen",
                f"{financial_stats.get('avg_salary', 0):,.0f} FCFA",
                "Par employé",
                self.color_success
            ),
            self.create_kpi_card(
                "Primes",
                f"{financial_stats.get('total_bonuses', 0):,.0f} FCFA",
                "Ce mois",
                self.color_warning
            ),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 3. KPIs Présence ===
        elements.append(self.create_section_header("📊 Présence"))
        elements.append(Spacer(1, 0.3*cm))
        
        attendance_stats = data.get('attendance_stats', {})
        
        kpi_data = [[
            self.create_kpi_card(
                "Taux de Présence",
                f"{attendance_stats.get('attendance_rate', 0):.1f}%",
                "Objectif: >95%",
                self.color_success if attendance_stats.get('attendance_rate', 0) >= 95 else self.color_warning
            ),
            self.create_kpi_card(
                "Taux de Retard",
                f"{attendance_stats.get('late_rate', 0):.1f}%",
                "À surveiller",
                self.color_warning
            ),
            self.create_kpi_card(
                "Taux d'Absence",
                f"{attendance_stats.get('absent_rate', 0):.1f}%",
                "À réduire",
                self.color_danger if attendance_stats.get('absent_rate', 0) > 5 else self.color_warning
            ),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 4. KPIs Congés ===
        elements.append(self.create_section_header("🏖️ Congés"))
        elements.append(Spacer(1, 0.3*cm))
        
        leave_stats = data.get('leave_stats', {})
        
        kpi_data = [[
            self.create_kpi_card(
                "Demandes en Attente",
                leave_stats.get('pending_requests', 0),
                "À traiter",
                self.color_warning if leave_stats.get('pending_requests', 0) > 10 else self.primary_color
            ),
            self.create_kpi_card(
                "Jours Approuvés",
                leave_stats.get('approved_days', 0),
                "Ce mois",
                self.color_success
            ),
            self.create_kpi_card(
                "Demandes Rejetées",
                leave_stats.get('rejected_requests', 0),
                "Ce mois",
                self.color_danger
            ),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 5. Alertes ===
        alerts = data.get('alerts', [])
        if alerts:
            elements.append(self.create_section_header("⚠️ Points d'Attention"))
            elements.append(Spacer(1, 0.2*cm))
            
            alert_style = ParagraphStyle(
                'Alert',
                fontSize=10,
                fontName='Helvetica',
                textColor=self.color_danger,
                spaceAfter=6,
                leftIndent=10
            )
            
            for alert in alerts[:10]:  # Limiter à 10
                elements.append(Paragraph(f"• {alert}", alert_style))
            
            elements.append(Spacer(1, 0.5*cm))
        
        # === Note ===
        note_style = ParagraphStyle(
            'Note',
            fontSize=8,
            textColor=colors.grey,
            fontName='Helvetica',
            alignment=1
        )
        
        elements.append(Paragraph(
            f"<i>Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</i>",
            note_style
        ))
        
        return self.build_pdf(elements)
    
    def generate_multi_company_report(self, data, filename):
        """
        Génère un rapport comparatif multi-entreprises (pour SaaS Owner).
        
        Args:
            data: {
                'period': 'Novembre 2024',
                'companies': [
                    {
                        'name': 'Entreprise A',
                        'employees': 150,
                        'attendance_rate': 94.5,
                        'payroll': 75000000,
                        'status': 'Active'
                    },
                    ...
                ]
            }
        """
        self.filename = filename
        self.title = f"Rapport Multi-Entreprises - {data.get('period')}"
        
        elements = []
        
        # === Titre ===
        elements.append(self.create_section_header(f"🏢 Rapport Multi-Entreprises - {data.get('period')}"))
        elements.append(Spacer(1, 0.3*cm))
        
        # === KPIs Globaux ===
        companies = data.get('companies', [])
        total_companies = len(companies)
        active_companies = sum(1 for c in companies if c.get('status') == 'Active')
        total_employees = sum(c.get('employees', 0) for c in companies)
        
        kpi_data = [[
            self.create_kpi_card("Total Entreprises", total_companies, color=self.primary_color),
            self.create_kpi_card("Actives", active_companies, color=self.color_success),
            self.create_kpi_card("Total Employés", total_employees, color=self.primary_color),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === Tableau Comparatif ===
        elements.append(self.create_section_header("📋 Comparatif par Entreprise"))
        elements.append(Spacer(1, 0.2*cm))
        
        table_data = [['Entreprise', 'Employés', 'Taux Présence', 'Masse Salariale', 'Statut']]
        
        for company in companies:
            table_data.append([
                company.get('name', ''),
                str(company.get('employees', 0)),
                f"{company.get('attendance_rate', 0):.1f}%",
                f"{company.get('payroll', 0):,.0f}",
                company.get('status', '')
            ])
        
        table = self.create_clean_table(
            table_data,
            [5*cm, 3*cm, 3*cm, 4*cm, 3*cm],
            has_header=True,
            zebra=True
        )
        
        # Colorer les statuts
        status_styles = []
        for i, company in enumerate(companies, start=1):
            status = company.get('status', '')
            if status == 'Active':
                status_styles.append(('TEXTCOLOR', (4, i), (4, i), self.color_success))
            else:
                status_styles.append(('TEXTCOLOR', (4, i), (4, i), self.color_danger))
        
        if status_styles:
            table.setStyle(TableStyle(status_styles))
        
        elements.append(table)
        
        return self.build_pdf(elements)
