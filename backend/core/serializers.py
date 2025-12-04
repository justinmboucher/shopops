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
    total_projects = serializers.IntegerField(read_only=True)
    total_products = serializers.IntegerField(read_only=True)

    total_sales = serializers.IntegerField(read_only=True)
    lifetime_revenue = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    completed_projects = serializers.IntegerField(read_only=True)
    orders_this_year = serializers.IntegerField(read_only=True)

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
            # metrics
            "total_projects",
            "total_products",
            "total_sales",
            "lifetime_revenue",
            "completed_projects",
            "orders_this_year",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "shop",
            "total_projects",
            "total_products",
            "total_sales",
            "lifetime_revenue",
            "completed_projects",
            "orders_this_year",
            "created_at",
            "updated_at",
        ]


class SearchResultSerializer(serializers.Serializer):
    type = serializers.CharField()      # "customer", "project", "product", etc.
    id = serializers.IntegerField()
    label = serializers.CharField()     # main text in the UI
    subtitle = serializers.CharField(allow_blank=True)
    url = serializers.CharField()       # frontend route to navigate to