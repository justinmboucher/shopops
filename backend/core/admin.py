from django.contrib import admin
from .models import Shop, Customer


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "currency", "timezone", "created_at")
    search_fields = ("name", "owner__username", "owner__email")


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