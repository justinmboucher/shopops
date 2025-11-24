from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from core.models import Shop
from products.models import ProductTemplate
from products.serializers import ProductTemplateSerializer


class ProductTemplateViewSet(viewsets.ModelViewSet):
    """
    CRUD for product templates.

    - GET /api/templates/
    - POST /api/templates/
    - GET /api/templates/{id}/
    - PATCH /api/templates/{id}/
    - DELETE /api/templates/{id}/ (we'll probably treat as archive later)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ProductTemplateSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ProductTemplate.objects.none()

        try:
            shop: Shop = user.shop
        except Shop.DoesNotExist:
            return ProductTemplate.objects.none()

        return ProductTemplate.objects.filter(shop=shop, is_active=True).order_by("name")

    def perform_destroy(self, instance):
        # Soft-delete behavior: mark inactive instead of removing
        instance.is_active = False
        instance.save(update_fields=["is_active"])
