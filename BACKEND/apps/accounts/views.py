from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from .serializers import UserSerializer, UserRegistrationSerializer, CompanyRegistrationSerializer
from .permissions import IsRH, IsAdmin, IsCompanyMember

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompanyMember]

    def get_queryset(self):
        # Return only users from the same company
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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
