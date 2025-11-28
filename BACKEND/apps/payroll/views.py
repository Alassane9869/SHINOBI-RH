from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import date
from .models import Payroll
from .serializers import PayrollSerializer
from .utils import generate_pdf
from apps.accounts.permissions import IsCompanyMember, IsRH

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
