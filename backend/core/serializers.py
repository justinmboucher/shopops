from rest_framework import serializers
from django.contrib.auth import get_user_model
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

User = get_user_model()

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
