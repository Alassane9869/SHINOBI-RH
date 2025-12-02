"""
Générateur d'attestations et certificats avec ReportLab.
"""
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

from .base import BaseReportLabGenerator


class CertificateGenerator(BaseReportLabGenerator):
    """
    Générateur d'attestations professionnelles.
    Supporte : attestation de travail, attestation de salaire, certificat CNSS
    """
    
    def __init__(self, company, certificate_type='work_certificate', template_config=None):
        self.certificate_type = certificate_type
        super().__init__(company, template_type=certificate_type, template_config=template_config)
    
    def build_content(self, data):
        """
        Construit le contenu de l'attestation.
        
        Args:
            data: Dict contenant:
                - employee_name: Nom complet de l'employé
                - employee_id: Matricule
                - position: Poste
                - department: Département
                - hire_date: Date d'embauche
                - salary: Salaire (pour attestation de salaire)
                - purpose: Objet de l'attestation
        """
        if self.certificate_type == 'work_certificate':
            return self._build_work_certificate(data)
        elif self.certificate_type == 'salary_certificate':
            return self._build_salary_certificate(data)
        elif self.certificate_type == 'cnss_certificate':
            return self._build_cnss_certificate(data)
        else:
            return self._build_work_certificate(data)
    
    def _build_work_certificate(self, data):
        """Attestation de travail."""
        story = []
        styles = self.get_styles()
        
        # Titre
        title = Paragraph(
            "<b>ATTESTATION DE TRAVAIL</b>",
            styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 1.5*cm))
        
        # Corps de l'attestation
        hire_date = data.get('hire_date', 'N/A')
        if isinstance(hire_date, str):
            hire_date_str = hire_date
        else:
            hire_date_str = hire_date.strftime('%d/%m/%Y')
        
        text = f"""
        <para alignment="justify">
        Je soussigné(e), <b>{self.company.name}</b>, certifie que <b>{data.get('employee_name', 'N/A')}</b>, 
        matricule <b>{data.get('employee_id', 'N/A')}</b>, occupe le poste de <b>{data.get('position', 'N/A')}</b> 
        au sein de notre entreprise depuis le <b>{hire_date_str}</b>.
        <br/><br/>
        Durant cette période, l'intéressé(e) a fait preuve de compétence et de professionnalisme 
        dans l'exercice de ses fonctions.
        <br/><br/>
        La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
        </para>
        """
        
        body = Paragraph(text, styles['CustomBody'])
        story.append(body)
        story.append(Spacer(1, 2*cm))
        
        # Date et lieu
        date_text = f"Fait à {self.company.address or '[Ville]'}, le {datetime.now().strftime('%d/%m/%Y')}"
        date_para = Paragraph(date_text, styles['CustomBody'])
        story.append(date_para)
        story.append(Spacer(1, 1*cm))
        
        # Signature
        if self.pdf_settings.signature_name:
            signature_text = f"""
            <para alignment="right">
            <b>{self.pdf_settings.signature_name}</b><br/>
            {self.pdf_settings.signature_title or 'Directeur Général'}
            </para>
            """
            signature = Paragraph(signature_text, styles['CustomBody'])
            story.append(signature)
        
        return story
    
    def _build_salary_certificate(self, data):
        """Attestation de salaire."""
        story = []
        styles = self.get_styles()
        
        # Titre
        title = Paragraph(
            "<b>ATTESTATION DE SALAIRE</b>",
            styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 1.5*cm))
        
        # Corps
        salary = data.get('salary', 0)
        text = f"""
        <para alignment="justify">
        Je soussigné(e), <b>{self.company.name}</b>, certifie que <b>{data.get('employee_name', 'N/A')}</b>, 
        matricule <b>{data.get('employee_id', 'N/A')}</b>, occupe le poste de <b>{data.get('position', 'N/A')}</b> 
        au sein de notre entreprise.
        <br/><br/>
        L'intéressé(e) perçoit un salaire mensuel brut de <b>{salary:,.0f} FCFA</b>.
        <br/><br/>
        La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
        </para>
        """
        
        body = Paragraph(text, styles['CustomBody'])
        story.append(body)
        story.append(Spacer(1, 2*cm))
        
        # Date et lieu
        date_text = f"Fait à {self.company.address or '[Ville]'}, le {datetime.now().strftime('%d/%m/%Y')}"
        date_para = Paragraph(date_text, styles['CustomBody'])
        story.append(date_para)
        story.append(Spacer(1, 1*cm))
        
        # Signature
        if self.pdf_settings.signature_name:
            signature_text = f"""
            <para alignment="right">
            <b>{self.pdf_settings.signature_name}</b><br/>
            {self.pdf_settings.signature_title or 'Directeur Général'}
            </para>
            """
            signature = Paragraph(signature_text, styles['CustomBody'])
            story.append(signature)
        
        return story
    
    def _build_cnss_certificate(self, data):
        """Certificat CNSS."""
        story = []
        styles = self.get_styles()
        
        # Titre
        title = Paragraph(
            "<b>CERTIFICAT CNSS</b>",
            styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 1.5*cm))
        
        # Corps
        cnss_number = data.get('cnss_number', 'N/A')
        text = f"""
        <para alignment="justify">
        Je soussigné(e), <b>{self.company.name}</b>, certifie que <b>{data.get('employee_name', 'N/A')}</b>, 
        matricule <b>{data.get('employee_id', 'N/A')}</b>, est affilié(e) à la Caisse Nationale de Sécurité Sociale 
        sous le numéro <b>{cnss_number}</b>.
        <br/><br/>
        L'intéressé(e) occupe le poste de <b>{data.get('position', 'N/A')}</b> au sein de notre entreprise.
        <br/><br/>
        Les cotisations sociales sont régulièrement versées conformément à la législation en vigueur.
        <br/><br/>
        La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
        </para>
        """
        
        body = Paragraph(text, styles['CustomBody'])
        story.append(body)
        story.append(Spacer(1, 2*cm))
        
        # Date et lieu
        date_text = f"Fait à {self.company.address or '[Ville]'}, le {datetime.now().strftime('%d/%m/%Y')}"
        date_para = Paragraph(date_text, styles['CustomBody'])
        story.append(date_para)
        story.append(Spacer(1, 1*cm))
        
        # Signature
        if self.pdf_settings.signature_name:
            signature_text = f"""
            <para alignment="right">
            <b>{self.pdf_settings.signature_name}</b><br/>
            {self.pdf_settings.signature_title or 'Directeur Général'}
            </para>
            """
            signature = Paragraph(signature_text, styles['CustomBody'])
            story.append(signature)
        
        return story
