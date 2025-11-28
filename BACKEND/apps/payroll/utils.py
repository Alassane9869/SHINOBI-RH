from io import BytesIO
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.core.files.base import ContentFile
import logging

logger = logging.getLogger(__name__)

def generate_pdf(template_src, context_dict):
    """
    Génère un PDF à partir d'un template HTML.
    
    Args:
        template_src: Chemin du template HTML
        context_dict: Contexte pour le rendu du template
    
    Returns:
        ContentFile: Fichier PDF généré
    
    Raises:
        Exception: Si la génération du PDF échoue
    """
    try:
        template = get_template(template_src)
        html = template.render(context_dict)
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("ISO-8859-1")), result)
        
        if pdf.err:
            error_msg = f"Erreur lors de la génération du PDF: {pdf.err}"
            logger.error(error_msg)
            raise Exception(error_msg)
        
        return ContentFile(result.getvalue())
    except Exception as e:
        logger.error(f"Erreur génération PDF pour {template_src}: {str(e)}")
        raise

