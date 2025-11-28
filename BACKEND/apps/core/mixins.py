"""
Mixins pour le multi-tenant.
Facilitent la gestion de l'isolation des données par entreprise.
"""
from django.core.exceptions import PermissionDenied


class TenantQuerysetMixin:
    """
    Mixin pour filtrer automatiquement les querysets par entreprise.
    À utiliser dans les ViewSets.
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'company') and self.request.user.company:
            return queryset.filter(company=self.request.user.company)
        return queryset.none()


class TenantCreateMixin:
    """
    Mixin pour assigner automatiquement l'entreprise lors de la création.
    """
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'company') and self.request.user.company:
            serializer.save(company=self.request.user.company)
        else:
            raise PermissionDenied("Utilisateur non associé à une entreprise")


class TenantAccessMixin:
    """
    Mixin pour vérifier l'accès aux objets de la même entreprise.
    """
    def get_object(self):
        obj = super().get_object()
        if hasattr(obj, 'company'):
            if not hasattr(self.request.user, 'company') or obj.company != self.request.user.company:
                raise PermissionDenied("Accès refusé : objet d'une autre entreprise")
        return obj


class MultiTenantMixin(TenantQuerysetMixin, TenantCreateMixin, TenantAccessMixin):
    """
    Mixin combiné pour une gestion complète du multi-tenant.
    Combine filtrage, création et vérification d'accès.
    """
    pass
