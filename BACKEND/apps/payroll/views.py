from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from datetime import date
import io

from .models import Payroll
from .serializers import PayrollSerializer
from .utils import generate_pdf
from apps.accounts.permissions import IsCompanyMember, IsRH
from apps.core.utils.advanced_exporters import (
    WeasyPrintPDFExporter,
    AdvancedExcelExporter,
    ZIPExporter
)
from apps.core.export_models import ExportLog

class PayrollViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember, IsRH]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'month', 'year']

    def get_queryset(self):
        return Payroll.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        # Auto-calculate net salary (handled in model save)
        payroll = serializer.save(company=self.request.user.company)
        
        # Generate PDF
        context = {
            'company': payroll.company,
            'employee': payroll.employee,
            'month': payroll.month,
            'year': payroll.year,
            'basic_salary': payroll.basic_salary,
            'bonus': payroll.bonus,
            'deductions': payroll.deductions,
            'net_salary': payroll.net_salary,
        }
        pdf_content = generate_pdf('payroll/payslip.html', context)
        if pdf_content:
            filename = f"payslip_{payroll.employee.id}_{payroll.month}_{payroll.year}.pdf"
            payroll.pdf_file.save(filename, pdf_content)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['get'])
    def payment_receipt(self, request, pk=None):
        """Générer un reçu de paiement en PDF"""
        payroll = self.get_object()
        context = {
            'company': payroll.company,
            'employee': payroll.employee,
            'month': payroll.month,
            'year': payroll.year,
            'basic_salary': payroll.basic_salary,
            'bonus': payroll.bonus,
            'deductions': payroll.deductions,
            'net_salary': payroll.net_salary,
            'payment_date': payroll.payment_date or date.today(),
            'payment_number': f"REC-{payroll.id}",
            'current_date': date.today(),
        }
        pdf_content = generate_pdf('payroll/payment_receipt.html', context)
        if pdf_content:
            response = HttpResponse(pdf_content.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="recu_{payroll.employee.user.last_name}_{payroll.month}_{payroll.year}.pdf"'
            return response
        return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)

    @action(detail=False, methods=['get'], url_path='export/book')
    def export_book(self, request):
        """Export Payroll Book (Excel)"""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        payrolls = self.get_queryset().select_related('employee__user')
        if month:
            payrolls = payrolls.filter(month=month)
        if year:
            payrolls = payrolls.filter(year=year)
            
        payrolls = payrolls.order_by('employee__user__last_name')
        
        data = []
        for p in payrolls:
            data.append({
                'Employé': f"{p.employee.user.last_name} {p.employee.user.first_name}",
                'Mois': f"{p.month}/{p.year}",
                'Salaire Base': p.basic_salary,
                'Primes': p.bonus,
                'Déductions': p.deductions,
                'Net à Payer': p.net_salary,
                'Payé': 'Oui' if p.is_paid else 'Non'
            })
            
        from apps.core.utils.exporters import ExcelExporter
        exporter = ExcelExporter(
            data=data,
            filename=f"livre_paie_{month or 'global'}_{year or 'global'}",
            sheet_name="Livre de Paie"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/transfer-order')
    def export_transfer_order(self, request):
        """Export Transfer Order (PDF)"""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            return Response({'error': 'Mois et année requis'}, status=400)
            
        payrolls = self.get_queryset().filter(
            month=month, 
            year=year
        ).select_related('employee__user')
        
        items = []
        total_amount = 0
        for p in payrolls:
            items.append({
                'employee_name': f"{p.employee.user.last_name} {p.employee.user.first_name}",
                'bank_account': getattr(p.employee, 'bank_account_number', '-'), # Assuming field exists or handled
                'amount': p.net_salary
            })
            total_amount += p.net_salary
            
        # Month name mapping
        months = {
            1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
            7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
        }
        
        context = {
            'company': request.user.company,
            'month_name': months.get(int(month), month),
            'year': year,
            'items': items,
            'total_amount': total_amount,
            'current_date': date.today()
        }
        
        pdf_content = generate_pdf('documents/transfer_order.html', context)
        if pdf_content:
            response = HttpResponse(pdf_content.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="ordre_virement_{month}_{year}.pdf"'
            return response
        return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)
    
    @action(detail=True, methods=['get'], url_path='export/payslip-advanced')
    def export_payslip_advanced(self, request, pk=None):
        """
        Générer une fiche de paie professionnelle avec WeasyPrint.
        
        Utilise le nouveau système d'export avec métadonnées complètes,
        QR code de vérification et design professionnel.
        """
        payroll = self.get_object()
        
        # Préparer le contexte
        context = {
            'employee': payroll.employee,
            'month': payroll.month,
            'year': payroll.year,
            'basic_salary': payroll.basic_salary,
            'bonus': payroll.bonus,
            'deductions': payroll.deductions,
            'net_salary': payroll.net_salary,
            'gross_salary': payroll.basic_salary + payroll.bonus,
            'payment_date': payroll.payment_date,
            'overtime_hours': getattr(payroll, 'overtime_hours', 0),
            'overtime_amount': getattr(payroll, 'overtime_amount', 0),
            'social_contributions': getattr(payroll, 'social_contributions', 0),
            'tax_amount': getattr(payroll, 'tax_amount', 0),
        }
        
        # Créer l'exporter
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"fiche_paie_{payroll.employee.user.last_name}_{payroll.month}_{payroll.year}",
            template_name='exports/pdf/payslip.html',
            title=f"Bulletin de Paie - {payroll.month}/{payroll.year}",
            document_id=str(payroll.id),
            document_type='payslip',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='payroll',
            document_name=f"Fiche de paie {payroll.employee.user.get_full_name()}",
            parameters={'payroll_id': str(payroll.id), 'month': payroll.month, 'year': payroll.year},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=False, methods=['get'], url_path='export/journal-advanced')
    def export_payroll_journal_advanced(self, request):
        """
        Exporter le journal de paie avec le format avancé (PDF ou Excel).
        
        Query params:
            - month: Mois (1-12)
            - year: Année
            - format: pdf ou excel (défaut: pdf)
        """
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        export_format = request.query_params.get('format', 'pdf').lower()
        
        if not month or not year:
            return Response({'error': 'Mois et année requis'}, status=400)
        
        # Récupérer les données
        payrolls = self.get_queryset().filter(
            month=month,
            year=year
        ).select_related('employee__user').order_by('employee__user__last_name')
        
        if not payrolls.exists():
            return Response({'error': 'Aucune donnée pour cette période'}, status=404)
        
        # Noms des mois
        months = {
            '1': 'Janvier', '2': 'Février', '3': 'Mars', '4': 'Avril',
            '5': 'Mai', '6': 'Juin', '7': 'Juillet', '8': 'Août',
            '9': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
        }
        month_name = months.get(str(int(month)), month)
        
        if export_format == 'excel':
            # Export Excel avec formatage avancé
            data = []
            total_gross = 0
            total_bonus = 0
            total_deductions = 0
            total_net = 0
            
            for p in payrolls:
                gross = float(p.basic_salary) + float(p.bonus)
                total_gross += gross
                total_bonus += float(p.bonus)
                total_deductions += float(p.deductions)
                total_net += float(p.net_salary)
                
                data.append({
                    'Matricule': str(p.employee.id)[:8],
                    'Nom': p.employee.user.last_name,
                    'Prénom': p.employee.user.first_name,
                    'Poste': p.employee.position,
                    'Salaire Base': float(p.basic_salary),
                    'Primes': float(p.bonus),
                    'Brut': gross,
                    'Déductions': float(p.deductions),
                    'Net à Payer': float(p.net_salary),
                    'Statut': 'Payé' if p.is_paid else 'En attente'
                })
            
            exporter = AdvancedExcelExporter(
                data=data,
                filename=f"journal_paie_{month_name}_{year}",
                sheet_name=f"Paie {month_name} {year}",
                company=request.user.company,
                user=request.user,
                include_formulas=True
            )
        else:
            # Export PDF
            payrolls_list = list(payrolls)
            total_gross = sum(float(p.basic_salary) + float(p.bonus) for p in payrolls_list)
            total_bonus = sum(float(p.bonus) for p in payrolls_list)
            total_deductions = sum(float(p.deductions) for p in payrolls_list)
            total_net = sum(float(p.net_salary) for p in payrolls_list)
            
            context = {
                'month_name': month_name,
                'year': year,
                'payrolls': payrolls_list,
                'employees_count': len(payrolls_list),
                'total_gross': total_gross,
                'total_bonus': total_bonus,
                'total_deductions': total_deductions,
                'total_net': total_net,
                'average_salary': total_net / len(payrolls_list) if payrolls_list else 0,
                'min_salary': min(float(p.net_salary) for p in payrolls_list) if payrolls_list else 0,
                'max_salary': max(float(p.net_salary) for p in payrolls_list) if payrolls_list else 0,
            }
            
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"journal_paie_{month_name}_{year}",
                template_name='exports/pdf/payroll_journal.html',
                title=f"Journal de Paie - {month_name} {year}",
                subtitle=f"{len(payrolls_list)} employé(s)",
                company=request.user.company,
                user=request.user,
                context=context
            )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type=export_format,
            module='payroll',
            document_name=f"Journal de paie {month_name} {year}",
            parameters={'month': month, 'year': year, 'format': export_format},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=False, methods=['get'], url_path='export/bulk-payslips')
    def export_bulk_payslips(self, request):
        """
        Générer toutes les fiches de paie du mois en archive ZIP.
        
        Query params:
            - month: Mois (1-12)
            - year: Année
        """
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            return Response({'error': 'Mois et année requis'}, status=400)
        
        # Récupérer toutes les fiches de paie
        payrolls = self.get_queryset().filter(
            month=month,
            year=year
        ).select_related('employee__user').order_by('employee__user__last_name')
        
        if not payrolls.exists():
            return Response({'error': 'Aucune fiche de paie pour cette période'}, status=404)
        
        # Générer un PDF pour chaque employé
        files = []
        for payroll in payrolls:
            context = {
                'employee': payroll.employee,
                'month': payroll.month,
                'year': payroll.year,
                'basic_salary': payroll.basic_salary,
                'bonus': payroll.bonus,
                'deductions': payroll.deductions,
                'net_salary': payroll.net_salary,
                'gross_salary': payroll.basic_salary + payroll.bonus,
                'payment_date': payroll.payment_date,
            }
            
            # Générer le PDF individuel
            exporter = WeasyPrintPDFExporter(
                data=[],
                filename=f"temp_{payroll.id}",
                template_name='exports/pdf/payslip.html',
                title=f"Bulletin de Paie - {month}/{year}",
                document_id=str(payroll.id),
                document_type='payslip',
                company=request.user.company,
                user=request.user,
                context=context
            )
            
            # Récupérer le contenu du PDF
            pdf_response = exporter.export()
            pdf_content = pdf_response.content
            
            # Ajouter au ZIP
            employee_name = f"{payroll.employee.user.last_name}_{payroll.employee.user.first_name}"
            filename = f"fiches_paie/{employee_name}/fiche_paie_{month}_{year}.pdf"
            
            files.append({
                'name': filename,
                'content': pdf_content,
                'type': 'payslip'
            })
        
        # Créer le ZIP
        zip_exporter = ZIPExporter(
            files=files,
            filename=f"fiches_paie_{month}_{year}",
            company=request.user.company,
            user=request.user,
            metadata={
                'month': month,
                'year': year,
                'payroll_count': len(files)
            },
            structure={
                'type': 'bulk_payslips',
                'organization': 'by_employee'
            }
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='zip',
            module='payroll',
            document_name=f"Fiches de paie groupées {month}/{year}",
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return zip_exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/salary-certificate')
    def export_salary_certificate(self, request, pk=None):
        """
        Génère un certificat de salaire pour un employé.
        
        Query params:
            - period: 'monthly' ou 'annual' (défaut: monthly)
        """
        payroll = self.get_object()
        period_type = request.query_params.get('period', 'monthly')
        
        # Contexte de base
        context = {
            'employee': payroll.employee,
            'basic_salary': payroll.basic_salary,
            'bonuses': payroll.bonus,
            'gross_salary': payroll.basic_salary + payroll.bonus,
            'net_salary': payroll.net_salary,
            'month': payroll.month,
            'year': payroll.year,
            'month_name': ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][payroll.month]
        }
        
        # Si certificat annuel, calculer les totaux
        if period_type == 'annual':
            annual_payrolls = Payroll.objects.filter(
                employee=payroll.employee,
                year=payroll.year
            )
            
            context['annual_data'] = {
                'gross': sum(float(p.basic_salary) + float(p.bonus) for p in annual_payrolls),
                'deductions': sum(float(p.deductions) for p in annual_payrolls),
                'net': sum(float(p.net_salary) for p in annual_payrolls)
            }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"certificat_salaire_{payroll.employee.user.last_name}_{payroll.month}_{payroll.year}",
            template_name='exports/pdf/salary_certificate.html',
            title="Certificat de Salaire",
            document_id=str(payroll.id),
            document_type='salary_certificate',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='payroll',
            document_name=f"Certificat de salaire {payroll.employee.user.get_full_name()}",
            parameters={'payroll_id': str(payroll.id), 'period': period_type},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()
    
    @action(detail=True, methods=['get'], url_path='export/cnss-certificate')
    def export_cnss_certificate(self, request, pk=None):
        """
        Génère un certificat CNSS/INPS avec détails des cotisations sociales.
        """
        payroll = self.get_object()
        
        # Calcul des cotisations (valeurs standards, à ajuster selon pays)
        gross = float(payroll.basic_salary) + float(payroll.bonus)
        
        # Taux standards (exemple - à personnaliser)
        rates = {
            'employer': {
                'health': 12.80,
                'pension': 8.55,
                'family': 5.25,
                'accident': 1.00
            },
            'employee': {
                'health': 0.75,
                'pension': 6.90
            }
        }
        
        # Calcul des montants
        contributions = {
            'employer': {
                'health': gross * rates['employer']['health'] / 100,
                'pension': gross * rates['employer']['pension'] / 100,
                'family': gross * rates['employer']['family'] / 100,
                'accident': gross * rates['employer']['accident'] / 100
            },
            'employee': {
                'health': gross * rates['employee']['health'] / 100,
                'pension': gross * rates['employee']['pension'] / 100
            }
        }
        
        total_employer = sum(contributions['employer'].values())
        total_employee = sum(contributions['employee'].values())
        
        context = {
            'employee': payroll.employee,
            'gross_salary': gross,
            'month': payroll.month,
            'year': payroll.year,
            'month_name': ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][payroll.month],
            'rates': rates,
            'contributions': contributions,
            'total_employer': total_employer,
            'total_employee': total_employee,
            'total_contributions': total_employer + total_employee,
            'net_after_contributions': gross - total_employee,
            'company_cnss_number': getattr(request.user.company, 'cnss_number', None),
            'company_employer_code': getattr(request.user.company, 'employer_code', None),
            'employee_ss_number': getattr(payroll.employee, 'social_security_number', None)
        }
        
        exporter = WeasyPrintPDFExporter(
            data=[],
            filename=f"certificat_cnss_{payroll.employee.user.last_name}_{payroll.month}_{payroll.year}",
            template_name='exports/pdf/cnss_certificate.html',
            title="Certificat CNSS/INPS",
            document_id=str(payroll.id),
            document_type='cnss_certificate',
            company=request.user.company,
            user=request.user,
            context=context
        )
        
        # Logger l'export
        ExportLog.objects.create(
            company=request.user.company,
            user=request.user,
            export_type='pdf',
            module='payroll',
            document_name=f"Certificat CNSS {payroll.employee.user.get_full_name()}",
            parameters={'payroll_id': str(payroll.id)},
            status='completed',
            started_at=timezone.now(),
            completed_at=timezone.now()
        )
        
        return exporter.export()