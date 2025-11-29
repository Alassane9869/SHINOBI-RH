"""
Utilitaires pour la génération de QR codes.

Module pour créer des QR codes de vérification pour les documents exportés.
"""
import qrcode
from io import BytesIO
from PIL import Image
from django.conf import settings


def generate_qr_code(data, size=200, border=2):
    """
    Génère un QR code à partir des données fournies.
    
    Args:
        data (str): Données à encoder dans le QR code
        size (int): Taille du QR code en pixels (par défaut 200)
        border (int): Largeur de la bordure (par défaut 2)
    
    Returns:
        BytesIO: Buffer contenant l'image du QR code en PNG
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Redimensionner l'image à la taille souhaitée
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Sauvegarder dans un buffer
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return buffer


def generate_document_qr_code(document_id, document_type):
    """
    Génère un QR code de vérification pour un document.
    
    Args:
        document_id (str): Identifiant unique du document
        document_type (str): Type de document (payslip, contract, etc.)
    
    Returns:
        BytesIO: Buffer contenant l'image du QR code
    """
    # Construire l'URL de vérification
    base_url = getattr(settings, 'EXPORT_QR_VERIFICATION_BASE_URL', 'https://grh.example.com/verify/')
    verification_url = f"{base_url}{document_type}/{document_id}"
    
    return generate_qr_code(verification_url, size=150, border=1)


def generate_qr_code_base64(data):
    """
    Génère un QR code et le retourne en base64 pour inclusion HTML.
    
    Args:
        data (str): Données à encoder
    
    Returns:
        str: Image QR code en base64 (data URI)
    """
    import base64
    
    buffer = generate_qr_code(data)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"
