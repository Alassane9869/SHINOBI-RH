from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from .base import BaseReportLabGenerator

class AttendanceGenerator(BaseReportLabGenerator):
    def __init__(self, company, *args, **kwargs):
        super().__init__(company, *args, **kwargs)
        self.styles = getSampleStyleSheet()
        
        # Styles personnalisés épurés
        self.h2_style = ParagraphStyle(
            'CustomH2',
            parent=self.styles['Heading2'],
            fontSize=13,
            textColor=self.primary_color,
            spaceAfter=10,
            spaceBefore=8,
            fontName='Helvetica-Bold'
        )
        
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            fontName='Helvetica'
        )
        
        self.insight_style = ParagraphStyle(
            'Insight',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            fontName='Helvetica',
            leftIndent=10
        )

    def generate_daily_report(self, data, filename):
        """
        Génère un rapport journalier épuré et professionnel.
        """
        self.filename = filename
        self.title = f"Rapport Journalier - {data.get('date')}"
        
        elements = []
        
        # === 1. KPIs en Cartes (Résumé Visuel) ===
        elements.append(self.create_section_header("📊 Vue d'ensemble"))
        elements.append(Spacer(1, 0.3*cm))
        
        summary = data.get('summary', {})
        total = summary.get('present', 0) + summary.get('late', 0) + summary.get('absent', 0) + summary.get('excused', 0)
        
        # Calculer le taux de présence
        presence_rate = 0
        if total > 0:
            presence_rate = ((summary.get('present', 0) + summary.get('late', 0)) / total) * 100
        
        # Grille de KPIs (4 cartes côte à côte)
        kpi_data = [[
            self.create_kpi_card("Présents", summary.get('present', 0), f"{presence_rate:.0f}% du total", self.color_success),
            self.create_kpi_card("Retards", summary.get('late', 0), "À surveiller", self.color_warning),
            self.create_kpi_card("Absents", summary.get('absent', 0), "Non justifiés", self.color_danger),
            self.create_kpi_card("Excusés", summary.get('excused', 0), "Justifiés", colors.grey),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[4.5*cm, 4.5*cm, 4.5*cm, 4.5*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 2. Insights / Alertes (si présentes) ===
        if data.get('anomalies'):
            elements.append(self.create_section_header("⚠️ Points d'attention"))
            elements.append(Spacer(1, 0.2*cm))
            
            for anomaly in data['anomalies'][:5]:  # Limiter à 5 pour ne pas surcharger
                elements.append(Paragraph(f"• {anomaly}", self.insight_style))
            
            elements.append(Spacer(1, 0.6*cm))
        
        # === 3. Tableau Détaillé (Épuré) ===
        elements.append(self.create_section_header("📋 Détail des présences"))
        elements.append(Spacer(1, 0.3*cm))
        
        table_data = [['Employé', 'Département', 'Arrivée', 'Départ', 'Statut', 'Retard', 'Heures']]
        
        for att in data.get('attendances', []):
            # Formater le statut avec couleur
            status = att['status']
            
            row = [
                att['employee'],
                att['department'],
                att['check_in'],
                att['check_out'],
                status,
                f"{att['delay']} min" if att['delay'] > 0 else "-",
                f"{att['hours']}h" if att['hours'] else "-"
            ]
            table_data.append(row)
        
        # Créer le tableau avec la méthode utilitaire
        col_widths = [4.5*cm, 3*cm, 2*cm, 2*cm, 2.5*cm, 2*cm, 2*cm]
        table = self.create_clean_table(table_data, col_widths, has_header=True, zebra=True)
        
        # Ajouter des couleurs pour les statuts (seulement dans la colonne Statut)
        status_styles = []
        for i, att in enumerate(data.get('attendances', []), start=1):
            status = att['status']
            if 'Absent' in status:
                status_styles.append(('TEXTCOLOR', (4, i), (4, i), self.color_danger))
            elif 'Retard' in status or 'Late' in status:
                status_styles.append(('TEXTCOLOR', (4, i), (4, i), self.color_warning))
            elif 'Présent' in status or 'Present' in status:
                status_styles.append(('TEXTCOLOR', (4, i), (4, i), self.color_success))
        
        if status_styles:
            table.setStyle(TableStyle(status_styles))
        
        elements.append(table)
        
        # === 4. Note de bas de page (Insight) ===
        if total > 0:
            elements.append(Spacer(1, 0.5*cm))
            insight_text = f"<i>Taux de présence global : {presence_rate:.1f}% • Total employés : {total}</i>"
            elements.append(Paragraph(insight_text, self.insight_style))
        
        return self.build_pdf(elements)

    def generate_monthly_advanced_report(self, data, filename):
        """
        Génère un rapport mensuel avancé épuré.
        """
        self.filename = filename
        self.title = f"Rapport Mensuel - {data.get('month')}"
        
        elements = []
        
        # === 1. KPIs Globaux ===
        elements.append(self.create_section_header("📊 Performance Globale"))
        elements.append(Spacer(1, 0.3*cm))
        
        stats = data.get('stats', {})
        
        kpi_data = [[
            self.create_kpi_card("Taux de Présence", f"{stats.get('present_rate', 0):.1f}%", "Objectif: >95%", self.color_success),
            self.create_kpi_card("Taux de Retard", f"{stats.get('late_rate', 0):.1f}%", "À réduire", self.color_warning),
            self.create_kpi_card("Taux d'Absence", f"{stats.get('absent_rate', 0):.1f}%", "À surveiller", self.color_danger),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[6*cm, 6*cm, 6*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 2. Alertes (Employés < 80%) ===
        if data.get('alerts'):
            elements.append(self.create_section_header("⚠️ Employés nécessitant une attention"))
            elements.append(Spacer(1, 0.2*cm))
            
            for alert in data['alerts'][:10]:  # Limiter à 10
                elements.append(Paragraph(
                    f"• <b>{alert['employee_name']}</b> : {alert['message']}", 
                    self.insight_style
                ))
            
            elements.append(Spacer(1, 0.6*cm))
        
        # === 3. Tableau par Employé (Épuré) ===
        elements.append(self.create_section_header("📋 Performance par Employé"))
        elements.append(Spacer(1, 0.3*cm))
        
        emp_data = [['Employé', 'Département', 'Présent', 'Retard', 'Absent', 'Taux']]
        
        for emp in data.get('employee_stats', []):
            emp_data.append([
                emp['employee_name'],
                emp['department'] or '-',
                str(emp['present']),
                str(emp['late']),
                str(emp['absent']),
                f"{emp['attendance_rate']:.1f}%"
            ])
        
        col_widths = [5*cm, 3.5*cm, 2*cm, 2*cm, 2*cm, 3*cm]
        table = self.create_clean_table(emp_data, col_widths, has_header=True, zebra=True)
        
        # Colorer les taux selon performance
        rate_styles = []
        for i, emp in enumerate(data.get('employee_stats', []), start=1):
            rate = emp['attendance_rate']
            if rate >= 95:
                rate_styles.append(('TEXTCOLOR', (5, i), (5, i), self.color_success))
            elif rate >= 80:
                rate_styles.append(('TEXTCOLOR', (5, i), (5, i), self.color_warning))
            else:
                rate_styles.append(('TEXTCOLOR', (5, i), (5, i), self.color_danger))
        
        if rate_styles:
            table.setStyle(TableStyle(rate_styles))
        
        elements.append(table)
        
        return self.build_pdf(elements)

    def generate_individual_report(self, data, filename):
        """
        Génère un rapport individuel épuré.
        """
        self.filename = filename
        employee_name = data['employee'].user.get_full_name()
        self.title = f"Rapport Individuel - {employee_name}"
        
        elements = []
        
        # === 1. Info Employé ===
        elements.append(Paragraph(f"<b>Employé :</b> {employee_name}", self.h2_style))
        dept = data['employee'].department if data['employee'].department else '-'
        elements.append(Paragraph(f"<b>Département :</b> {dept}", self.normal_style))
        elements.append(Spacer(1, 0.5*cm))
        
        # === 2. KPIs Résumé ===
        elements.append(self.create_section_header("📊 Résumé de la période"))
        elements.append(Spacer(1, 0.3*cm))
        
        kpi_data = [[
            self.create_kpi_card("Présents", data['present'], color=self.color_success),
            self.create_kpi_card("Retards", data['late'], color=self.color_warning),
            self.create_kpi_card("Absents", data['absent'], color=self.color_danger),
            self.create_kpi_card("Excusés", data['excused'], color=colors.grey),
        ]]
        
        kpi_table = Table(kpi_data, colWidths=[4.5*cm, 4.5*cm, 4.5*cm, 4.5*cm])
        kpi_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === 3. Historique Détaillé ===
        elements.append(self.create_section_header("📋 Historique détaillé"))
        elements.append(Spacer(1, 0.3*cm))
        
        table_data = [['Date', 'Arrivée', 'Départ', 'Statut', 'Heures', 'Retard']]
        
        for att in data['attendances']:
            table_data.append([
                att['date'].strftime('%d/%m/%Y'),
                att['check_in'].strftime('%H:%M') if att['check_in'] else '-',
                att['check_out'].strftime('%H:%M') if att['check_out'] else '-',
                att['status'],
                f"{att['hours']}h" if att['hours'] else "-",
                f"{att['delay']} min" if att['delay'] else "-"
            ])
        
        col_widths = [3*cm, 3*cm, 3*cm, 3*cm, 2*cm, 3*cm]
        table = self.create_clean_table(table_data, col_widths, has_header=True, zebra=True)
        elements.append(table)
        
        return self.build_pdf(elements)
