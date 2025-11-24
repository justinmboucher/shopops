from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from core.models import Shop
from inventory.models import Material, Consumable, Equipment
from inventory.serializers import (
    MaterialSerializer,
    ConsumableSerializer,
    EquipmentSerializer,
)


class ShopBoundMixin:
    """
    Helper mixin to restrict queryset to current user's shop
    and auto-assign shop on create.
    """

    def get_shop(self) -> Shop | None:
        user = self.request.user
        if not user.is_authenticated:
            return None
        try:
            return user.shop
        except Shop.DoesNotExist:
            return None

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return self.model.objects.none()
        return self.model.objects.filter(shop=shop, is_active=True)

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")
        serializer.save(shop=shop)

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class MaterialViewSet(ShopBoundMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MaterialSerializer
    model = Material


class ConsumableViewSet(ShopBoundMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ConsumableSerializer
    model = Consumable


class EquipmentViewSet(ShopBoundMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EquipmentSerializer
    model = Equipment
