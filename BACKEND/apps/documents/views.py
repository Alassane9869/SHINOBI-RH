from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime
from .models import Document
from .serializers import DocumentSerializer
from apps.accounts.permissions import IsCompanyMember

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'document_type', 'description']

    def get_queryset(self):
        return Document.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=['get'], url_path='export/folder')
    def export_folder(self, request):
        """Export Employee Documents Folder (ZIP)"""
        employee_id = request.query_params.get('employee')
        if not employee_id:
            return Response({'error': 'Employé requis'}, status=400)
            
        documents = self.get_queryset().filter(employee_id=employee_id)
        if not documents.exists():
            return Response({'error': 'Aucun document trouvé pour cet employé'}, status=404)
            
        import zipfile
        import io
        
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zip_file:
            for doc in documents:
                if doc.file:
                    try:
                        # Add file to zip with a nice name
                        ext = doc.file.name.split('.')[-1]
                        filename = f"{doc.document_type}_{doc.description[:20] if doc.description else 'doc'}.{ext}"
                        zip_file.writestr(filename, doc.file.read())
                    except Exception as e:
                        print(f"Error adding file to zip: {e}")
                        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="dossier_employe_{employee_id}.zip"'
        return response

    @action(detail=False, methods=['get'], url_path='export/activity')
    def export_activity(self, request):
        """Export Activity Report (PDF)"""
        documents = self.get_queryset().select_related('employee__user').order_by('-created_at')
        
        data = []
        for doc in documents:
            data.append({
                'Date': doc.created_at.strftime("%d/%m/%Y"),
                'Type': doc.document_type,
                'Employé': f"{doc.employee.user.last_name} {doc.employee.user.first_name}" if doc.employee else 'Général',
                'Description': doc.description or '-'
            })
            
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"activite_documents_{datetime.now().strftime('%Y%m%d')}",
            title=f"Rapport d'Activité Documentaire - {datetime.now().strftime('%d/%m/%Y')}",
            headers=['Date', 'Type', 'Employé', 'Description'],
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/archiving')
    def export_archiving(self, request):
        """Export Archiving Report (Excel)"""
        documents = self.get_queryset().select_related('employee__user').order_by('document_type', '-created_at')
        
        data = []
        for doc in documents:
            data.append({
                'Type': doc.document_type,
                'Date Création': doc.created_at.strftime("%d/%m/%Y"),
                'Employé': f"{doc.employee.user.last_name} {doc.employee.user.first_name}" if doc.employee else 'Général',
                'Description': doc.description or '-',
                'Fichier': doc.file.name if doc.file else '-'
            })
            
        from apps.core.utils.exporters import ExcelExporter
        exporter = ExcelExporter(
            data=data,
            filename=f"archivage_documents_{datetime.now().strftime('%Y%m%d')}",
            sheet_name="Archivage"
        )
        return exporter.export()
