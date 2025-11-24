from rest_framework import serializers
from sales.models import Sale


class SaleSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "shop",
            "project",
            "project_name",
            "template",
            "template_name",
            "customer",
            "customer_name",
            "channel",
            "price",
            "fees",
            "currency",
            "sold_at",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "shop",
            "project",
            "template",
            "customer",
            "currency",
            "created_at",
            "updated_at",
        ]
