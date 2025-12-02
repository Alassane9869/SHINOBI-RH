"""
Générateur PDF pour les profils utilisateurs et rapports admin.
"""
from datetime import datetime, date
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle

from apps.pdf_templates.generators.base import BaseReportLabGenerator


class UserProfileGenerator(BaseReportLabGenerator):
    """
    Générateur de profils utilisateurs et rapports admin.
    """
    
    def __init__(self, company, template_config=None):
        super().__init__(company, template_type='user_profile', template_config=template_config)
    
    def generate_user_profile(self, data, filename):
        """
        Génère un profil utilisateur complet.
        
        Args:
            data: {
                'user_name': 'Jean Dupont',
                'email': 'jean.dupont@example.com',
                'role': 'Admin',
                'company': 'Ma Société',
                'joined_date': '01/01/2020',
                'last_login': '30/11/2024',
                'permissions': ['Gérer employés', 'Voir rapports', ...],
                'activity_stats': {
                    'logins_count': 150,
                    'documents_created': 45,
                    'reports_generated': 23
                }
            }
        """
        self.filename = filename
        self.title = f"Profil Utilisateur - {data.get('user_name')}"
        
        elements = []
        
        # === Titre ===
        title_style = ParagraphStyle(
            'ProfileTitle',
            fontSize=18,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            alignment=1,
            spaceAfter=10
        )
        
        elements.append(Paragraph(f"PROFIL UTILISATEUR", title_style))
        elements.append(Spacer(1, 0.3*cm))
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            fontSize=13,
            textColor=self.color_text,
            fontName='Helvetica',
            alignment=1,
            spaceAfter=15
        )
        
        elements.append(Paragraph(data.get('user_name', 'N/A'), subtitle_style))
        elements.append(Spacer(1, 0.5*cm))
        
        # === KPIs Activité ===
        stats = data.get('activity_stats', {})
        if stats:
            elements.append(self.create_section_header("📊 Statistiques d'Activité"))
            elements.append(Spacer(1, 0.3*cm))
            
            kpi_data = [[
                self.create_kpi_card(
                    "Connexions",
                    stats.get('logins_count', 0),
                    "Total",
                    self.primary_color
                ),
                self.create_kpi_card(
                    "Documents",
                    stats.get('documents_created', 0),
                    "Créés",
                    self.color_success
                ),
                self.create_kpi_card(
                    "Rapports",
                    stats.get('reports_generated', 0),
                    "Générés",
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
        
        # === Informations Compte ===
        elements.append(self.create_section_header("👤 Informations du Compte"))
        elements.append(Spacer(1, 0.2*cm))
        
        account_data = [
            ['Nom complet', data.get('user_name', 'N/A')],
            ['Email', data.get('email', 'N/A')],
            ['Rôle', data.get('role', 'N/A')],
            ['Entreprise', data.get('company', 'N/A')],
            ['Date d\'inscription', data.get('joined_date', 'N/A')],
            ['Dernière connexion', data.get('last_login', 'N/A')],
        ]
        
        account_table = Table(account_data, colWidths=[5.5*cm, 10.5*cm])
        account_table.setStyle(TableStyle([
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
        elements.append(account_table)
        elements.append(Spacer(1, 0.8*cm))
        
        # === Permissions ===
        permissions = data.get('permissions', [])
        if permissions:
            elements.append(self.create_section_header("🔐 Permissions"))
            elements.append(Spacer(1, 0.2*cm))
            
            perm_data = [['Permission']]
            for perm in permissions:
                perm_data.append([perm])
            
            perm_table = self.create_clean_table(perm_data, [16*cm], has_header=True, zebra=True)
            elements.append(perm_table)
        
        return self.build_pdf(elements)
    
    def generate_admin_report(self, data, filename):
        """
        Génère un rapport admin (tous les utilisateurs).
        
        Args:
            data: {
                'period': 'Novembre 2024',
                'users': [
                    {
                        'name': 'Jean Dupont',
                        'email': 'jean@example.com',
                        'role': 'Admin',
                        'status': 'Active',
                        'last_login': '30/11/2024',
                        'logins_count': 45
                    },
                    ...
                ]
            }
        """
        self.filename = filename
        self.title = f"Rapport Utilisateurs - {data.get('period')}"
        
        elements = []
        
        # === Titre ===
        elements.append(self.create_section_header(f"👥 Rapport Utilisateurs - {data.get('period')}"))
        elements.append(Spacer(1, 0.3*cm))
        
        # === KPIs ===
        users = data.get('users', [])
        total_users = len(users)
        active_users = sum(1 for u in users if u.get('status') == 'Active')
        admin_users = sum(1 for u in users if u.get('role') == 'Admin')
        
        kpi_data = [[
            self.create_kpi_card("Total Utilisateurs", total_users, color=self.primary_color),
            self.create_kpi_card("Actifs", active_users, color=self.color_success),
            self.create_kpi_card("Administrateurs", admin_users, color=self.color_warning),
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
        elements.append(self.create_section_header("📋 Liste des Utilisateurs"))
        elements.append(Spacer(1, 0.2*cm))
        
        table_data = [['Nom', 'Email', 'Rôle', 'Statut', 'Dernière Connexion', 'Connexions']]
        
        for user in users:
            table_data.append([
                user.get('name', ''),
                user.get('email', ''),
                user.get('role', ''),
                user.get('status', ''),
                user.get('last_login', ''),
                str(user.get('logins_count', 0))
            ])
        
        table = self.create_clean_table(
            table_data,
            [4.5*cm, 5*cm, 2.5*cm, 2*cm, 3*cm, 2*cm],
            has_header=True,
            zebra=True
        )
        
        # Colorer les statuts
        status_styles = []
        for i, user in enumerate(users, start=1):
            status = user.get('status', '')
            if status == 'Active':
                status_styles.append(('TEXTCOLOR', (3, i), (3, i), self.color_success))
            else:
                status_styles.append(('TEXTCOLOR', (3, i), (3, i), self.color_danger))
        
        if status_styles:
            table.setStyle(TableStyle(status_styles))
        
        elements.append(table)
        
        return self.build_pdf(elements)
