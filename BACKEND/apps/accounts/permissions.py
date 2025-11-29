from rest_framework import permissions

class IsSaaSOwner(permissions.BasePermission):
    """
    Permission exclusive pour le Propriétaire du SaaS.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_saas_owner

class IsCompanyMember(permissions.BasePermission):
    """
    Allows access only to users who belong to the same company.
    Assumes the object has a 'company' attribute.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # LE BYPASS ULTIME : Le Owner a accès à TOUT
        if request.user.is_saas_owner:
            return True
            
        if not request.user.company:
            return False
        # Check if object has company attribute
        if hasattr(obj, 'company'):
            return obj.company == request.user.company
        return False

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_saas_owner or request.user.role == 'admin')

class IsRH(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_saas_owner or request.user.role in ['admin', 'rh'])

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_saas_owner or request.user.role in ['admin', 'rh', 'manager'])

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user
