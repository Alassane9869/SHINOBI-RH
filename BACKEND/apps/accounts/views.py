from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from .serializers import UserSerializer, UserRegistrationSerializer, CompanyRegistrationSerializer
from .permissions import IsRH, IsAdmin, IsCompanyMember, IsSaaSOwner
from datetime import datetime

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]

    def get_queryset(self):
        # Return only users from the same company
        if self.request.user.is_superuser:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        # Assign current user's company to the new user
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=['get'], url_path='without-employee')
    def without_employee(self, request):
        """Return users without employee profile"""
        users = CustomUser.objects.filter(
            company=request.user.company,
            employee_profile__isnull=True
        )
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsRH()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='export/pdf')
    def export_pdf(self, request):
        """Export Users List (PDF)"""
        users = self.get_queryset()
        data = []
        for user in users:
            data.append({
                'Email': user.email,
                'Nom': user.last_name,
                'Prénom': user.first_name,
                'Rôle': user.role,
                'Actif': 'Oui' if user.is_active else 'Non',
                'Dernière connexion': user.last_login.strftime("%d/%m/%Y %H:%M") if user.last_login else '-'
            })
        
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"utilisateurs_{datetime.now().strftime('%Y%m%d')}",
            title="Liste des Utilisateurs",
            company_name=request.user.company.name
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/excel')
    def export_excel(self, request):
        """Export Users List (Excel)"""
        users = self.get_queryset()
        data = []
        for user in users:
            data.append({
                'Email': user.email,
                'Nom': user.last_name,
                'Prénom': user.first_name,
                'Rôle': user.role,
                'Actif': 'Oui' if user.is_active else 'Non',
                'Date d\'inscription': user.date_joined.strftime("%d/%m/%Y"),
                'Dernière connexion': user.last_login.strftime("%d/%m/%Y %H:%M") if user.last_login else '-'
            })
            
        from apps.core.utils.exporters import ExcelExporter
        exporter = ExcelExporter(
            data=data,
            filename=f"utilisateurs_{datetime.now().strftime('%Y%m%d')}",
            sheet_name="Utilisateurs"
        )
        return exporter.export()

    @action(detail=False, methods=['get'], url_path='export/csv')
    def export_csv(self, request):
        """Export Users List (CSV)"""
        users = self.get_queryset()
        data = []
        for user in users:
            data.append({
                'ID': user.id,
                'Email': user.email,
                'Nom': user.last_name,
                'Prénom': user.first_name,
                'Rôle': user.role,
                'Actif': user.is_active,
                'Date d\'inscription': user.date_joined,
                'Dernière connexion': user.last_login
            })
            
        from apps.core.utils.exporters import CSVExporter
        exporter = CSVExporter(
            data=data,
            filename=f"utilisateurs_{datetime.now().strftime('%Y%m%d')}"
        )
        return exporter.export()

    @action(detail=True, methods=['get'], url_path='export/sheet')
    def export_sheet(self, request, pk=None):
        """Export Individual User Sheet (PDF)"""
        user = self.get_object()
        
        # Prepare detailed data for the sheet
        data = [
            {'Section': 'Informations Personnelles', 'Détail': ''},
            {'Section': 'Nom complet', 'Détail': f"{user.first_name} {user.last_name}"},
            {'Section': 'Email', 'Détail': user.email},
            {'Section': 'Téléphone', 'Détail': user.phone or '-'},
            {'Section': 'Adresse', 'Détail': user.address or '-'},
            
            {'Section': 'Compte & Sécurité', 'Détail': ''},
            {'Section': 'Rôle', 'Détail': user.role},
            {'Section': 'Statut', 'Détail': 'Actif' if user.is_active else 'Inactif'},
            {'Section': 'Date d\'inscription', 'Détail': user.date_joined.strftime("%d/%m/%Y")},
            {'Section': 'Dernière connexion', 'Détail': user.last_login.strftime("%d/%m/%Y %H:%M") if user.last_login else '-'},
        ]
        
        from apps.core.utils.exporters import PDFExporter
        exporter = PDFExporter(
            data=data,
            filename=f"fiche_utilisateur_{user.last_name}_{user.first_name}",
            title=f"Fiche Utilisateur : {user.first_name} {user.last_name}",
            headers=['Section', 'Détail'],
            company_name=request.user.company.name
        )
        return exporter.export()

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class RegisterCompanyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CompanyRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Entreprise et compte administrateur créés avec succès.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
class SaasAdminViewSet(viewsets.ViewSet):
    """
    API de gestion globale pour le Propriétaire SaaS.
    """
    permission_classes = [permissions.IsAuthenticated, IsSaaSOwner]

    @action(detail=True, methods=['post'])
    def impersonate(self, request, pk=None):
        """
        Permet au Owner de se connecter en tant que n'importe quel utilisateur.
        Retourne les tokens JWT de l'utilisateur cible.
        """
        target_user = generics.get_object_or_404(CustomUser, pk=pk)
        
        # Génération manuelle des tokens pour l'utilisateur cible
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(target_user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': target_user.id,
                'email': target_user.email,
                'role': target_user.role,
                'company': target_user.company.name if target_user.company else None
            },
            'message': f"Vous êtes maintenant connecté en tant que {target_user.email}"
        })

    @action(detail=False, methods=['get'])
    def global_stats(self, request):
        """Statistiques globales de la plateforme."""
        from apps.company.models import Company
        return Response({
            'total_companies': Company.objects.count(),
            'active_companies': Company.objects.filter(is_active=True).count(),
            'total_users': CustomUser.objects.count(),
            'revenue_mrr': 0, # À implémenter avec Stripe
        })
