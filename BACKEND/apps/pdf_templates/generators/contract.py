"""
Générateur de contrats et lettres avec ReportLab.
"""
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

from .base import BaseReportLabGenerator


class ContractGenerator(BaseReportLabGenerator):
    """
    Générateur de contrats et lettres officielles.
    Supporte : contrat de travail, lettre de mutation, lettre de licenciement
    """
    
    def __init__(self, company, contract_type='work_contract', template_config=None):
        self.contract_type = contract_type
        super().__init__(company, template_type=contract_type, template_config=template_config)
    
    def build_content(self, data):
        """
        Construit le contenu du contrat.
        
        Args:
            data: Dict contenant les données du contrat
        """
        if self.contract_type == 'work_contract':
            return self._build_work_contract(data)
        elif self.contract_type == 'transfer_letter':
            return self._build_transfer_letter(data)
        elif self.contract_type == 'termination_letter':
            return self._build_termination_letter(data)
        else:
            return self._build_work_contract(data)
    
    def _build_work_contract(self, data):
        """Contrat de travail."""
        story = []
        styles = self.get_styles()
        
        # Titre
        title = Paragraph(
            "<b>CONTRAT DE TRAVAIL</b>",
            styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 1*cm))
        
        # Parties
        parties_text = f"""
        <para alignment="justify">
        <b>ENTRE LES SOUSSIGNÉS :</b>
        <br/><br/>
        <b>{self.company.name}</b>, société immatriculée, dont le siège social est situé à 
        {self.company.address or '[Adresse]'}, représentée par {self.pdf_settings.signature_name or '[Nom du représentant]'}, 
        en qualité de {self.pdf_settings.signature_title or 'Directeur Général'},
        <br/><br/>
        Ci-après dénommée « L'EMPLOYEUR »
        <br/><br/>
        <b>D'UNE PART,</b>
        <br/><br/>
        Et
        <br/><br/>
        <b>{data.get('employee_name', 'N/A')}</b>, né(e) le {data.get('birth_date', 'N/A')}, 
        demeurant à {data.get('employee_address', '[Adresse]')},
        <br/><br/>
        Ci-après dénommé(e) « LE SALARIÉ »
        <br/><br/>
        <b>D'AUTRE PART,</b>
        </para>
        """
        
        parties = Paragraph(parties_text, styles['CustomBody'])
        story.append(parties)
        story.append(Spacer(1, 1*cm))
        
        # Préambule
        preamble = Paragraph(
            "<b>IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :</b>",
            styles['CustomHeading']
        )
        story.append(preamble)
        story.append(Spacer(1, 0.5*cm))
        
        # Articles
        articles = [
            {
                'title': 'ARTICLE 1 : ENGAGEMENT',
                'content': f"""L'EMPLOYEUR engage LE SALARIÉ en qualité de <b>{data.get('position', 'N/A')}</b> 
                au sein du département {data.get('department', 'N/A')}. LE SALARIÉ accepte cet engagement 
                et s'engage à exercer ses fonctions avec compétence et diligence."""
            },
            {
                'title': 'ARTICLE 2 : DURÉE DU CONTRAT',
                'content': f"""Le présent contrat est conclu pour une durée <b>{data.get('contract_duration', 'indéterminée')}</b>, 
                à compter du <b>{data.get('start_date', 'N/A')}</b>."""
            },
            {
                'title': 'ARTICLE 3 : RÉMUNÉRATION',
                'content': f"""En contrepartie de ses services, LE SALARIÉ percevra une rémunération mensuelle brute de 
                <b>{data.get('salary', 0):,.0f} FCFA</b>, payable à la fin de chaque mois."""
            },
            {
                'title': 'ARTICLE 4 : HORAIRES DE TRAVAIL',
                'content': f"""LE SALARIÉ est soumis à un horaire de travail de <b>{data.get('working_hours', '40')} heures par semaine</b>, 
                réparties selon les besoins du service."""
            },
            {
                'title': 'ARTICLE 5 : CONGÉS',
                'content': """LE SALARIÉ bénéficie de congés payés conformément à la législation en vigueur."""
            },
            {
                'title': 'ARTICLE 6 : PÉRIODE D\'ESSAI',
                'content': f"""Le présent contrat est assorti d'une période d'essai de <b>{data.get('trial_period', '3')} mois</b>, 
                renouvelable une fois."""
            },
        ]
        
        for article in articles:
            article_title = Paragraph(f"<b>{article['title']}</b>", styles['CustomHeading'])
            story.append(article_title)
            story.append(Spacer(1, 0.3*cm))
            
            article_content = Paragraph(article['content'], styles['CustomBody'])
            story.append(article_content)
            story.append(Spacer(1, 0.7*cm))
        
        # Signatures
        story.append(Spacer(1, 1*cm))
        
        date_text = f"Fait à {self.company.address or '[Ville]'}, le {datetime.now().strftime('%d/%m/%Y')}"
        date_para = Paragraph(date_text, styles['CustomBody'])
        story.append(date_para)
        story.append(Spacer(1, 1*cm))
        
        signatures_text = """
        <para>
        <b>L'EMPLOYEUR</b>                                                    <b>LE SALARIÉ</b>
        <br/><br/><br/>
        _____________________                                    _____________________
        </para>
        """
        signatures = Paragraph(signatures_text, styles['CustomBody'])
        story.append(signatures)
        
        return story
    
    def _build_transfer_letter(self, data):
        """Lettre de mutation."""
        story = []
        styles = self.get_styles()
        
        # Titre
        title = Paragraph(
            "<b>LETTRE DE MUTATION</b>",
            styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 1.5*cm))
        
        # Destinataire
        recipient = Paragraph(
            f"<b>À l'attention de {data.get('employee_name', 'N/A')}</b>",
            styles['CustomBody']
        )
        story.append(recipient)
        story.append(Spacer(1, 1*cm))
        
        # Corps
        body_text = f"""
        <para alignment="justify">
        Madame, Monsieur,
        <br/><br/>
        Nous avons le plaisir de vous informer que vous êtes muté(e) au poste de <b>{data.get('new_position', 'N/A')}</b> 
        au sein de notre {data.get('new_department', 'département')}, à compter du <b>{data.get('effective_date', 'N/A')}</b>.
        <br/><br/>
        Cette mutation s'inscrit dans le cadre de notre politique de développement des compétences et 
        de mobilité interne. Nous sommes convaincus que vous saurez relever ce nouveau défi avec succès.
        <br/><br/>
        Votre nouvelle rémunération sera de <b>{data.get('new_salary', 0):,.0f} FCFA</b> par mois.
        <br/><br/>
        Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.
        </para>
        """
        
        body = Paragraph(body_text, styles['CustomBody'])
        story.append(body)
        story.append(Spacer(1, 2*cm))
        
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
    
    def _build_termination_letter(self, data):
        """Lettre de licenciement."""
        story = []
        styles = self.get_styles()
        
        # Titre
        title = Paragraph(
            "<b>LETTRE DE LICENCIEMENT</b>",
            styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 1.5*cm))
        
        # Destinataire
        recipient = Paragraph(
            f"<b>À l'attention de {data.get('employee_name', 'N/A')}</b>",
            styles['CustomBody']
        )
        story.append(recipient)
        story.append(Spacer(1, 1*cm))
        
        # Corps
        reason = data.get('termination_reason', 'raisons économiques')
        body_text = f"""
        <para alignment="justify">
        Madame, Monsieur,
        <br/><br/>
        Nous avons le regret de vous informer que nous sommes contraints de mettre fin à votre contrat de travail 
        pour {reason}.
        <br/><br/>
        Votre dernier jour de travail sera le <b>{data.get('last_day', 'N/A')}</b>.
        <br/><br/>
        Vous bénéficierez de toutes les indemnités prévues par la législation en vigueur, 
        incluant l'indemnité de licenciement et les congés payés non pris.
        <br/><br/>
        Nous vous remercions pour les services rendus à notre entreprise et vous souhaitons 
        plein succès dans vos projets futurs.
        </para>
        """
        
        body = Paragraph(body_text, styles['CustomBody'])
        story.append(body)
        story.append(Spacer(1, 2*cm))
        
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
