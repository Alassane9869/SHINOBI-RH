"""
Générateur de factures PDF professionnelles
Génère automatiquement un PDF avec logo, coordonnées, et QR code
"""
from django.conf import settings
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
import os


def generate_invoice_pdf(invoice):
    """
    Génère un PDF professionnel pour une facture
    Avec logo Shinobi RH, coordonnées complètes, et QR code
    """
    # Template HTML de la facture
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; }}
            .container {{ padding: 40px; }}
            .header {{ display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }}
            .logo {{ font-size: 32px; font-weight: bold; color: #667eea; }}
            .invoice-info {{ text-align: right; }}
            .invoice-number {{ font-size: 24px; font-weight: bold; color: #667eea; }}
            .company-info {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }}
            .billing-info {{ margin-bottom: 30px; }}
            .info-row {{ display: flex; justify-content: space-between; margin-bottom: 10px; }}
            .label {{ font-weight: bold; color: #666; }}
            .value {{ color: #333; }}
            .items-table {{ width: 100%; border-collapse: collapse; margin: 30px 0; }}
            .items-table th {{ background: #667eea; color: white; padding: 12px; text-align: left; }}
            .items-table td {{ padding: 12px; border-bottom: 1px solid #ddd; }}
            .total-section {{ text-align: right; margin-top: 30px; }}
            .total-row {{ display: flex; justify-content: flex-end; margin: 10px 0; }}
            .total-label {{ font-size: 18px; font-weight: bold; margin-right: 20px; }}
            .total-amount {{ font-size: 24px; font-weight: bold; color: #667eea; }}
            .footer {{ margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #999; font-size: 12px; }}
            .paid-stamp {{ position: absolute; top: 200px; right: 100px; transform: rotate(-15deg); border: 5px solid #28a745; color: #28a745; font-size: 48px; font-weight: bold; padding: 20px 40px; opacity: 0.3; }}
        </style>
    </head>
    <body>
        <div class="container">
            {f'<div class="paid-stamp">PAYÉ</div>' if invoice.is_paid else ''}
            
            <!-- Header -->
            <div class="header">
                <div>
                    <div class="logo">✨ SHINOBI RH</div>
                    <p style="margin: 5px 0; color: #666;">Plateforme RH tout-en-un</p>
                    <p style="margin: 5px 0; color: #666;">Bamako, Mali</p>
                    <p style="margin: 5px 0; color: #666;">+223 66 82 62 07</p>
                </div>
                <div class="invoice-info">
                    <div class="invoice-number">{invoice.invoice_number}</div>
                    <p style="margin: 5px 0;">Date: {invoice.issue_date.strftime('%d/%m/%Y')}</p>
                    {f'<p style="margin: 5px 0;">Échéance: {invoice.due_date.strftime("%d/%m/%Y")}</p>' if invoice.due_date else ''}
                </div>
            </div>
            
            <!-- Company Info -->
            <div class="company-info">
                <h3 style="margin-top: 0; color: #667eea;">Informations Shinobi RH</h3>
                <p><strong>Raison sociale:</strong> Shinobi RH SARL</p>
                <p><strong>Adresse:</strong> Bamako, Mali</p>
                <p><strong>NIF:</strong> [À configurer dans l'admin]</p>
                <p><strong>RCCM:</strong> [À configurer dans l'admin]</p>
            </div>
            
            <!-- Billing Info -->
            <div class="billing-info">
                <h3 style="color: #667eea;">Facturé à</h3>
                <p><strong>{invoice.billing_name}</strong></p>
                <p>{invoice.billing_email}</p>
                {f'<p>{invoice.billing_address}</p>' if invoice.billing_address else ''}
                {f'<p>NIF: {invoice.billing_nif}</p>' if invoice.billing_nif else ''}
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Période</th>
                        <th style="text-align: right;">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>Abonnement {invoice.subscription.plan.name}</strong><br>
                            <small style="color: #666;">
                                {invoice.subscription.plan.description if invoice.subscription.plan.description else ''}
                            </small>
                        </td>
                        <td>{invoice.subscription.plan.get_period_display()}</td>
                        <td style="text-align: right;">{invoice.amount} {invoice.currency}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Total -->
            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">TOTAL:</span>
                    <span class="total-amount">{invoice.amount} {invoice.currency}</span>
                </div>
                {f'<p style="color: #28a745; font-weight: bold;">✓ Payé le {invoice.paid_date.strftime("%d/%m/%Y")}</p>' if invoice.is_paid else '<p style="color: #dc3545;">En attente de paiement</p>'}
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p><strong>Merci pour votre confiance !</strong></p>
                <p>Cette facture a été générée automatiquement par le système Shinobi RH</p>
                <p>Pour toute question, contactez-nous : +223 66 82 62 07 | contact@shinobih.com</p>
                <p style="margin-top: 20px; font-size: 10px;">
                    Shinobi RH - Plateforme de gestion RH tout-en-un<br>
                    Bamako, Mali | www.shinobih.com
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        # Utiliser xhtml2pdf (déjà installé dans le projet)
        from xhtml2pdf import pisa
        from io import BytesIO
        
        # Générer le PDF
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_buffer)
        
        if not pisa_status.err:
            # Sauvegarder le PDF
            pdf_buffer.seek(0)
            filename = f'invoice_{invoice.invoice_number}.pdf'
            invoice.pdf_file.save(filename, ContentFile(pdf_buffer.read()), save=True)
            return True
        else:
            print(f"Erreur génération PDF: {pisa_status.err}")
            return False
    
    except Exception as e:
        print(f"Erreur génération facture PDF: {e}")
        return False


def generate_receipt_pdf(payment):
    """
    Génère un reçu de paiement PDF
    Similaire à la facture mais avec focus sur le paiement
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 40px; color: #333; }}
            .header {{ text-align: center; margin-bottom: 40px; border-bottom: 3px solid #28a745; padding-bottom: 20px; }}
            .logo {{ font-size: 36px; font-weight: bold; color: #667eea; }}
            .receipt-title {{ font-size: 28px; color: #28a745; margin: 20px 0; }}
            .info-box {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .info-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }}
            .label {{ font-weight: bold; color: #666; }}
            .value {{ color: #333; }}
            .amount-box {{ background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; }}
            .amount {{ font-size: 48px; font-weight: bold; }}
            .footer {{ margin-top: 50px; text-align: center; color: #999; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">✨ SHINOBI RH</div>
            <div class="receipt-title">REÇU DE PAIEMENT</div>
        </div>
        
        <div class="info-box">
            <div class="info-row">
                <span class="label">Transaction ID:</span>
                <span class="value">{payment.transaction_id}</span>
            </div>
            <div class="info-row">
                <span class="label">Date de paiement:</span>
                <span class="value">{payment.paid_at.strftime('%d/%m/%Y à %H:%M') if payment.paid_at else 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Méthode de paiement:</span>
                <span class="value">{payment.get_payment_method_display()}</span>
            </div>
            <div class="info-row">
                <span class="label">Entreprise:</span>
                <span class="value">{payment.subscription.company.name}</span>
            </div>
            <div class="info-row">
                <span class="label">Plan:</span>
                <span class="value">{payment.subscription.plan.name}</span>
            </div>
        </div>
        
        <div class="amount-box">
            <div class="amount">{payment.amount} {payment.currency}</div>
            <p style="margin: 10px 0; font-size: 18px;">✓ Paiement confirmé</p>
        </div>
        
        <div class="footer">
            <p><strong>Merci pour votre paiement !</strong></p>
            <p>Ce reçu a été généré automatiquement</p>
            <p>Shinobi RH - Bamako, Mali | +223 66 82 62 07</p>
        </div>
    </body>
    </html>
    """
    
    try:
        from xhtml2pdf import pisa
        from io import BytesIO
        
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_buffer)
        
        if not pisa_status.err:
            pdf_buffer.seek(0)
            return pdf_buffer.getvalue()
        return None
    
    except Exception as e:
        print(f"Erreur génération reçu PDF: {e}")
        return None
