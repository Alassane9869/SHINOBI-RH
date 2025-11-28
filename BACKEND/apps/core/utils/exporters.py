"""
Export utilities for generating PDF, Excel, and CSV files
"""
import csv
import io
from typing import List, Dict, Any
from django.http import HttpResponse
from xhtml2pdf import pisa
from django.template.loader import render_to_string
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill
import pandas as pd


class BaseExporter:
    """Base class for all exporters"""
    
    def __init__(self, data: List[Dict[str, Any]], filename: str):
        self.data = data
        self.filename = filename
    
    def export(self) -> HttpResponse:
        """Override this method in subclasses"""
        raise NotImplementedError


class PDFExporter(BaseExporter):
    """Export data as PDF"""
    
    def __init__(self, data: List[Dict[str, Any]], filename: str, template: str, context: Dict[str, Any] = None):
        super().__init__(data, filename)
        self.template = template
        self.context = context or {}
    
    def export(self) -> HttpResponse:
        """Generate PDF from template"""
        self.context['data'] = self.data
        html = render_to_string(self.template, self.context)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{self.filename}.pdf"'
        
        pisa_status = pisa.CreatePDF(html, dest=response)
        
        if pisa_status.err:
            return HttpResponse('Erreur lors de la génération du PDF', status=500)
        
        return response


class ExcelExporter(BaseExporter):
    """Export data as Excel (.xlsx)"""
    
    def __init__(self, data: List[Dict[str, Any]], filename: str, sheet_name: str = 'Data', headers: List[str] = None):
        super().__init__(data, filename)
        self.sheet_name = sheet_name
        self.headers = headers
    
    def export(self) -> HttpResponse:
        """Generate Excel file"""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = self.sheet_name
        
        # Determine headers
        if self.headers:
            headers = self.headers
        elif self.data:
            headers = list(self.data[0].keys())
        else:
            headers = []
        
        # Style for headers
        header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF")
        header_alignment = Alignment(horizontal="center", vertical="center")
        
        # Write headers
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = header_alignment
        
        # Write data
        for row_num, row_data in enumerate(self.data, 2):
            for col_num, header in enumerate(headers, 1):
                value = row_data.get(header, '')
                ws.cell(row=row_num, column=col_num, value=str(value))
        
        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(cell.value)
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # Save to response
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{self.filename}.xlsx"'
        wb.save(response)
        
        return response


class CSVExporter(BaseExporter):
    """Export data as CSV"""
    
    def __init__(self, data: List[Dict[str, Any]], filename: str, headers: List[str] = None):
        super().__init__(data, filename)
        self.headers = headers
    
    def export(self) -> HttpResponse:
        """Generate CSV file"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{self.filename}.csv"'
        
        if not self.data:
            return response
        
        # Determine headers
        if self.headers:
            headers = self.headers
        else:
            headers = list(self.data[0].keys())
        
        writer = csv.DictWriter(response, fieldnames=headers)
        writer.writeheader()
        
        for row in self.data:
            writer.writerow({k: row.get(k, '') for k in headers})
        
        return response
