from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Shop, Customer


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = [
            "id",
            "owner",

            # Identity
            "name",
            "tagline",
            "description",

            # Contact
            "contact_email",
            "contact_phone",

            # Address
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",

            # Online presence
            "website_url",
            "instagram_handle",
            "facebook_handle",

            # Preferences
            "timezone",
            "currency",
            "default_units",
            "default_hourly_rate",
            "default_markup_pct",
            "default_payment_terms",
            "default_project_type",

            # Appearance
            "theme",
            "logo_image",

            # Shipping config
            "shipping_zones_config",

            # Audit
            "joined_at",
            "last_active_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "joined_at",
            "last_active_at",
            "created_at",
            "updated_at",
        ]

User = get_user_model()

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class CustomerSerializer(serializers.ModelSerializer):
    # Annotated metrics coming from queryset in CustomerViewSet
    total_projects = serializers.IntegerField(read_only=True)
    total_products = serializers.IntegerField(read_only=True)
    tenure_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "shop",
            "name",
            "email",
            "phone",
            "channel",
            "notes",
            "is_vip",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
            "avatar",
            "is_active",
            "total_projects",
            "total_products",
            "tenure_days",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "shop",
            "total_projects",
            "total_products",
            "tenure_days",
            "created_at",
            "updated_at",
        ]