from rest_framework import serializers
from products.models import ProductTemplate, BOMItem
from inventory.models import Material
from workflows.models import WorkflowDefinition


class BOMItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source="material.name", read_only=True)

    class Meta:
        model = BOMItem
        fields = [
            "id",
            "material",
            "material_name",
            "quantity",
            "unit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProductTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTemplate
        fields = [
            "id",
            "shop",
            "name",
            "description",
            "category",
            "image",
            "workflow",
            "estimated_labor_hours",
            "hourly_rate",
            "estimated_consumables_cost",
            "base_price",
            "equipment",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop", "created_at", "updated_at"]


    def _get_shop(self):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        try:
            return request.user.shop
        except Exception:
            raise serializers.ValidationError("Current user has no shop configured.")

    def create(self, validated_data):
        bom_data = validated_data.pop("bom_items", [])
        equipment = validated_data.pop("equipment", [])
        shop = self._get_shop()

        template = ProductTemplate.objects.create(shop=shop, **validated_data)
        if equipment:
            template.equipment.set(equipment)

        for item in bom_data:
            material = item["material"]
            quantity = item["quantity"]
            unit = item.get("unit") or material.unit
            BOMItem.objects.create(
                template=template,
                material=material,
                quantity=quantity,
                unit=unit,
            )

        return template

    def update(self, instance, validated_data):
        bom_data = validated_data.pop("bom_items", None)
        equipment = validated_data.pop("equipment", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if equipment is not None:
            instance.equipment.set(equipment)

        if bom_data is not None:
            # Simple strategy: clear and recreate
            instance.bom_items.all().delete()
            for item in bom_data:
                material = item["material"]
                quantity = item["quantity"]
                unit = item.get("unit") or material.unit
                BOMItem.objects.create(
                    template=instance,
                    material=material,
                    quantity=quantity,
                    unit=unit,
                )

        return instance
