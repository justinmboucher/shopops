from django.contrib import admin
from .models import Shop, Customer

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "owner",
        "city",
        "state",
        "country",
        "contact_email",
        "timezone",
        "currency",
        "theme",
        "created_at",
    )
    list_filter = (
        "country",
        "state",
        "timezone",
        "currency",
        "theme",
        "created_at",
    )
    search_fields = (
        "name",
        "owner__username",
        "owner__email",
        "city",
        "state",
        "postal_code",
        "contact_email",
    )
    readonly_fields = (
        "joined_at",
        "last_active_at",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("Owner", {"fields": ("owner",)}),
        (
            "Basic Info",
            {
                "fields": (
                    "name",
                    "tagline",
                    "description",
                )
            },
        ),
        (
            "Contact",
            {
                "fields": (
                    "contact_email",
                    "contact_phone",
                )
            },
        ),
        (
            "Address",
            {
                "fields": (
                    "address_line1",
                    "address_line2",
                    "city",
                    "state",
                    "postal_code",
                    "country",
                )
            },
        ),
        (
            "Online Presence",
            {
                "fields": (
                    "website_url",
                    "instagram_handle",
                    "facebook_handle",
                )
            },
        ),
        (
            "Preferences",
            {
                "fields": (
                    "timezone",
                    "currency",
                    "default_units",
                    "default_hourly_rate",
                    "default_markup_pct",
                    "default_payment_terms",
                    "default_project_type",
                )
            },
        ),
        (
            "Appearance",
            {
                "fields": (
                    "theme",
                    "logo_image",
                )
            },
        ),
        (
            "Shipping & Config",
            {
                "fields": (
                    "shipping_zones_config",
                )
            },
        ),
        (
            "Audit",
            {
                "fields": (
                    "joined_at",
                    "last_active_at",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )



@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "phone",
        "shop",
        "is_vip",
        "is_active",
        "created_at",
    )
    list_filter = ("shop", "is_active", "is_vip", "channel")
    search_fields = ("name", "email", "phone", "address_line1", "city")