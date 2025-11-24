from django.contrib import admin
from .models import Shop, Customer


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "currency", "timezone", "created_at")
    search_fields = ("name", "owner__username", "owner__email")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "shop", "email", "channel", "is_active")
    search_fields = ("name", "email", "channel")
    list_filter = ("shop", "is_active")
