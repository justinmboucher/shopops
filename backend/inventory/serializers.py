from rest_framework import serializers
from inventory.models import Material, Consumable, Equipment


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = [
            "id",
            "shop",
            "name",
            "category",
            "unit",
            "quantity",
            "cost_per_unit",
            "supplier_name",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["shop", "created_at", "updated_at"]


class ConsumableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consumable
        fields = [
            "id",
            "shop",
            "name",
            "unit",
            "cost_per_unit",
            "quantity",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["shop", "created_at", "updated_at"]


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = [
            "id",
            "shop",
            "name",
            "purchase_date",
            "purchase_cost",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["shop", "created_at", "updated_at"]
