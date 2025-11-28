from rest_framework import viewsets, permissions, filters
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
