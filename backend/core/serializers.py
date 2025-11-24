from rest_framework import serializers
from .models import Shop


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = [
            "id",
            "name",
            "timezone",
            "currency",
            "default_hourly_rate",
            "default_markup_pct",
            "theme",
            "logo_image",
            "description",
            "shipping_zones_config",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
