"""
Exemple de migration d'export vers ReportLab.

Ce fichier montre comment migrer un export existant (bulletin de paie)
vers le nouveau système ReportLab.
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from apps.pdf_templates.generators.payslip import PayslipGenerator


# À ajouter dans PayrollViewSet (apps/payroll/views.py)

@action(detail=True, methods=['get'], url_path='export/payslip-reportlab')
def export_payslip_reportlab(self, request, pk=None):
    """
    Générer un bulletin de paie avec le nouveau système ReportLab.
    
    Cette méthode remplace export_payslip_advanced et utilise
    le système de templates personnalisables.
    """
    payroll = self.get_object()
    
    # Préparer les données pour le générateur
    data = {
        'employee': f"{payroll.employee.user.first_name} {payroll.employee.user.last_name}",
        'employee_id': str(payroll.employee.id)[:8],
        'position': payroll.employee.position,
        'department': payroll.employee.department or 'N/A',
        'month': payroll.month,
        'year': payroll.year,
        'basic_salary': float(payroll.basic_salary),
        'bonuses': [
            {'name': 'Prime', 'amount': float(payroll.bonus)}
        ] if payroll.bonus > 0 else [],
        'deductions': [
            {'name': 'Déductions', 'amount': float(payroll.deductions)}
        ] if payroll.deductions > 0 else [],
        'net_salary': float(payroll.net_salary),
    }
    
    # Créer le générateur
    generator = PayslipGenerator(
        company=request.user.company,
        template_config=None  # Utilise le template par défaut
    )
    
    # Générer et retourner le PDF
    filename = f"bulletin_paie_{payroll.employee.user.last_name}_{payroll.month}_{payroll.year}"
    return generator.generate(data, filename)


# Exemple pour attestation de salaire
@action(detail=True, methods=['get'], url_path='export/salary-certificate-reportlab')
def export_salary_certificate_reportlab(self, request, pk=None):
    """
    Générer une attestation de salaire avec ReportLab.
    """
    from apps.pdf_templates.generators.certificate import CertificateGenerator
    
    payroll = self.get_object()
    
    data = {
        'employee_name': f"{payroll.employee.user.first_name} {payroll.employee.user.last_name}",
        'employee_id': str(payroll.employee.id)[:8],
        'position': payroll.employee.position,
        'salary': float(payroll.net_salary),
    }
    
    generator = CertificateGenerator(
        company=request.user.company,
        certificate_type='salary_certificate'
    )
    
    filename = f"attestation_salaire_{payroll.employee.user.last_name}"
    return generator.generate(data, filename)


# Exemple pour contrat de travail
def generate_work_contract_example(employee, company):
    """
    Exemple de génération de contrat de travail.
    """
    from apps.pdf_templates.generators.contract import ContractGenerator
    
    data = {
        'employee_name': f"{employee.user.first_name} {employee.user.last_name}",
        'birth_date': employee.user.date_of_birth.strftime('%d/%m/%Y') if hasattr(employee.user, 'date_of_birth') else 'N/A',
        'employee_address': employee.address or 'N/A',
        'position': employee.position,
        'department': employee.department or 'N/A',
        'start_date': employee.date_hired.strftime('%d/%m/%Y') if employee.date_hired else 'N/A',
        'salary': float(employee.base_salary),
        'contract_duration': 'indéterminée',
        'working_hours': '40',
        'trial_period': '3',
    }
    
    generator = ContractGenerator(
        company=company,
        contract_type='work_contract'
    )
    
    filename = f"contrat_travail_{employee.user.last_name}"
    return generator.generate(data, filename)
